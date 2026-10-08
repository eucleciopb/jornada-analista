/**
 * Importação em lote de treinamentos realizados (XLSX/CSV).
 * Grava em `treinamentos_realizados` e audita em `apuracoes_treinamentos`.
 */

export const TREINOS_COLLECTION = "treinamentos_realizados";
export const AUDIT_COLLECTION = "apuracoes_treinamentos";
export const TIPO_AUDIT = "importacao_treinamentos";

export const COLUNAS_MODELO = [
  "Data",
  "Usuário",
  "Público",
  "Treinamento",
  "Tipo",
  "CD",
  "Pessoas",
  "Nota",
  "Desafio",
  "Meta",
  "Obs"
];

/** Aliases de nome da planilha → nome canônico no portal (sem criar conta). */
const ALIASES_USUARIO = {
  ercules: "Ercules",
  "e rcules": "Ercules"
};

export function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeText(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

export function normalizeKey(s) {
  return normalizeText(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Converte data BR (DD/MM/AAAA), ISO, ou Date do Excel → YYYY-MM-DD. */
export function parseDataBR(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    // Serial Excel (aprox. epoch 1899-12-30)
    const epoch = Date.UTC(1899, 11, 30);
    const ms = epoch + Math.round(value) * 86400000;
    const dt = new Date(ms);
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const d = String(dt.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  const raw = normalizeText(value);
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const br = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (br) {
    let dd = Number(br[1]);
    let mm = Number(br[2]);
    let yy = Number(br[3]);
    if (yy < 100) yy += 2000;
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  }

  return null;
}

export function parseTipo(value) {
  const k = normalizeKey(value);
  if (!k) return null;
  if (k === "online" || k === "on-line" || k === "remoto" || k === "ead") return "Online";
  if (k === "presencial" || k === "presential" || k === "pres.") return "Presencial";
  return null;
}

/** Número opcional: vazio → null (nunca força 0). */
export function parseOptionalNumber(value, { min = null, max = null } = {}) {
  if (value == null || value === "") return { ok: true, value: null };
  const raw = normalizeText(value).replace(",", ".");
  if (!raw) return { ok: true, value: null };
  const n = Number(raw);
  if (!Number.isFinite(n)) return { ok: false, value: null, erro: "Número inválido" };
  if (min != null && n < min) return { ok: false, value: null, erro: `Mínimo ${min}` };
  if (max != null && n > max) return { ok: false, value: null, erro: `Máximo ${max}` };
  return { ok: true, value: n };
}

export function hash32(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Chave forte (idempotência): inclui pessoas e obs. */
export function fingerprintForte(row) {
  return [
    row.uidKey || "",
    row.data || "",
    normalizeKey(row.treinamento),
    normalizeKey(row.publico),
    normalizeKey(row.tipoTreinamento),
    normalizeKey(row.cd || ""),
    row.totalPessoas == null ? "" : String(row.totalPessoas),
    normalizeKey(row.obs || "")
  ].join("|");
}

/** Chave suave (possível duplicidade legítima no mesmo dia). */
export function fingerprintSuave(row) {
  return [
    row.uidKey || "",
    row.data || "",
    normalizeKey(row.treinamento),
    normalizeKey(row.publico),
    normalizeKey(row.tipoTreinamento),
    normalizeKey(row.cd || "")
  ].join("|");
}

export function docIdImport(fp) {
  const h = hash32(fp);
  const short = fp
    .replace(/\|/g, "_")
    .replace(/[^a-z0-9_-]+/gi, "")
    .slice(0, 80);
  return `imp_${h}_${short}`.slice(0, 140);
}

/**
 * Resolve usuário da planilha contra a lista do portal.
 * Retorna { status, usuarioNome, uidKey, motivo, nomePlanilha }.
 */
export function resolverUsuario(nomePlanilha, usuariosPortal, vinculosManuais = {}) {
  const nome = normalizeText(nomePlanilha);
  if (!nome) {
    return { status: "erro", motivo: "Usuário não informado", nomePlanilha: nome };
  }

  const key = normalizeKey(nome);
  const slugNome = slug(nome);

  if (vinculosManuais[key] || vinculosManuais[slugNome]) {
    const alvo = vinculosManuais[key] || vinculosManuais[slugNome];
    return {
      status: "ok",
      usuarioNome: alvo.nome,
      uidKey: alvo.uidKey || slug(alvo.nome),
      nomePlanilha: nome,
      vinculado: true
    };
  }

  const aliasCanonico = ALIASES_USUARIO[key] || ALIASES_USUARIO[slugNome];
  const busca = aliasCanonico || nome;

  const lista = Array.isArray(usuariosPortal) ? usuariosPortal : [];
  const match =
    lista.find((u) => normalizeKey(u.nome) === normalizeKey(busca)) ||
    lista.find((u) => slug(u.nome) === slug(busca)) ||
    lista.find((u) => (u.uidKey || "") === slug(busca));

  if (match) {
    return {
      status: "ok",
      usuarioNome: match.nome,
      uidKey: match.uidKey || slug(match.nome),
      nomePlanilha: nome,
      ativo: match.ativo !== false
    };
  }

  return {
    status: "sem_usuario",
    motivo: `Usuário "${nome}" não encontrado no portal`,
    nomePlanilha: nome,
    sugestao: aliasCanonico || null
  };
}

function cell(row, map, ...aliases) {
  for (const a of aliases) {
    const idx = map[normalizeKey(a)];
    if (idx != null && row[idx] != null && String(row[idx]).trim() !== "") {
      return row[idx];
    }
  }
  // tenta índice mesmo se vazio (para distinguir ausente)
  for (const a of aliases) {
    const idx = map[normalizeKey(a)];
    if (idx != null) return row[idx];
  }
  return undefined;
}

export function mapearCabecalhos(headerRow) {
  const map = {};
  (headerRow || []).forEach((h, i) => {
    const k = normalizeKey(h);
    if (k) map[k] = i;
  });
  return map;
}

export function validarCabecalhos(map) {
  const obrigatorios = ["data", "usuario", "publico", "treinamento", "tipo"];
  const faltando = obrigatorios.filter((c) => map[c] == null);
  return { ok: faltando.length === 0, faltando };
}

/**
 * Converte linhas brutas da planilha em registros classificados.
 */
export function analisarLinhas(matrix, {
  usuariosPortal = [],
  vinculosManuais = {},
  fingerprintsExistentes = new Set(),
  softExistentes = new Set()
} = {}) {
  if (!matrix || matrix.length < 2) {
    return { ok: false, erro: "Planilha vazia ou sem dados.", registros: [], resumo: resumoVazio() };
  }

  const header = matrix[0];
  const map = mapearCabecalhos(header);
  const cab = validarCabecalhos(map);
  if (!cab.ok) {
    return {
      ok: false,
      erro: `Colunas obrigatórias ausentes: ${cab.faltando.join(", ")}`,
      registros: [],
      resumo: resumoVazio()
    };
  }

  const registros = [];
  const fpsNoArquivo = new Set();
  const softNoArquivo = new Set();

  for (let i = 1; i < matrix.length; i++) {
    const raw = matrix[i];
    if (!raw || raw.every((c) => c == null || String(c).trim() === "")) continue;

    const linha = i + 1; // 1-based planilha
    const dataRaw = cell(raw, map, "Data");
    const usuarioRaw = cell(raw, map, "Usuário", "Usuario", "Analista");
    const publico = normalizeText(cell(raw, map, "Público", "Publico"));
    const treinamento = normalizeText(cell(raw, map, "Treinamento", "Tema"));
    const tipoRaw = cell(raw, map, "Tipo", "Modalidade", "Tipo de Treinamento");
    const cdRaw = cell(raw, map, "CD", "Centro", "Centro de Distribuição");
    const pessoasRaw = cell(raw, map, "Pessoas", "Total Pessoas", "Participantes");
    const notaRaw = cell(raw, map, "Nota", "Nota Média", "Nota Media");
    const desafio = normalizeText(cell(raw, map, "Desafio"));
    const meta = normalizeText(cell(raw, map, "Meta"));
    const obs = normalizeText(cell(raw, map, "Obs", "Observação", "Observacao", "Observações", "Observacoes"));

    const data = parseDataBR(dataRaw);
    const tipoTreinamento = parseTipo(tipoRaw);
    const cd = normalizeText(cdRaw) || null;

    const pessoas = parseOptionalNumber(pessoasRaw, { min: 1 });
    const nota = parseOptionalNumber(notaRaw, { min: 0, max: 10 });

    const user = resolverUsuario(usuarioRaw, usuariosPortal, vinculosManuais);

    const base = {
      linha,
      data,
      dataRaw: dataRaw == null ? "" : String(dataRaw),
      usuarioPlanilha: normalizeText(usuarioRaw),
      usuarioNome: user.usuarioNome || null,
      uidKey: user.uidKey || null,
      publico,
      treinamento,
      tipoTreinamento,
      cd,
      totalPessoas: pessoas.ok ? pessoas.value : null,
      notaMedia: nota.ok ? nota.value : null,
      desafio: desafio || null,
      meta: meta || null,
      obs: obs || null,
      nacional: !cd
    };

    const erros = [];
    if (!publico) erros.push("Público obrigatório");
    if (!treinamento) erros.push("Treinamento obrigatório");
    if (!tipoTreinamento) erros.push(`Tipo inválido (${normalizeText(tipoRaw) || "vazio"}). Use Online ou Presencial`);
    if (!pessoas.ok) erros.push(`Pessoas: ${pessoas.erro}`);
    if (!nota.ok) erros.push(`Nota: ${nota.erro}`);
    if (user.status === "erro") erros.push(user.motivo);
    if (user.status === "sem_usuario") {
      registros.push({
        ...base,
        status: "sem_usuario",
        motivo: user.motivo,
        importavel: false
      });
      continue;
    }
    if (user.ativo === false) erros.push(`Usuário ${user.usuarioNome} está inativo`);

    if (!data) {
      registros.push({
        ...base,
        status: "pendente",
        motivo: "Data ausente ou inválida — exige tratamento administrativo (não inventar data)",
        importavel: false
      });
      continue;
    }

    if (erros.length) {
      registros.push({
        ...base,
        status: "erro",
        motivo: erros.join("; "),
        importavel: false
      });
      continue;
    }

    const fp = fingerprintForte(base);
    const soft = fingerprintSuave(base);
    base.fingerprint = fp;
    base.fingerprintSuave = soft;
    base.docId = docIdImport(fp);

    if (fingerprintsExistentes.has(fp) || fpsNoArquivo.has(fp)) {
      registros.push({
        ...base,
        status: "duplicado",
        motivo: fingerprintsExistentes.has(fp)
          ? "Já existe registro idêntico no banco (idempotência)"
          : "Linha duplicada no próprio arquivo",
        importavel: false
      });
      fpsNoArquivo.add(fp);
      softNoArquivo.add(soft);
      continue;
    }

    const softHit = softExistentes.has(soft) || softNoArquivo.has(soft);
    if (softHit) {
      registros.push({
        ...base,
        status: "possivel_duplicado",
        motivo: "Mesma combinação analista+data+treinamento+público+tipo+CD (pode ser legítimo)",
        importavel: true,
        revisar: true
      });
      fpsNoArquivo.add(fp);
      softNoArquivo.add(soft);
      continue;
    }

    registros.push({
      ...base,
      status: "valido",
      motivo: base.nacional ? "Válido (abrangência nacional sem CD)" : "Válido",
      importavel: true
    });
    fpsNoArquivo.add(fp);
    softNoArquivo.add(soft);
  }

  return { ok: true, registros, resumo: montarResumo(registros) };
}

function resumoVazio() {
  return { enviados: 0, validos: 0, invalidos: 0, duplicados: 0, pendentes: 0, semUsuario: 0, possiveis: 0 };
}

export function montarResumo(registros) {
  const r = resumoVazio();
  r.enviados = registros.length;
  for (const x of registros) {
    if (x.status === "valido") r.validos++;
    else if (x.status === "duplicado") r.duplicados++;
    else if (x.status === "possivel_duplicado") r.possiveis++;
    else if (x.status === "pendente") r.pendentes++;
    else if (x.status === "sem_usuario") r.semUsuario++;
    else r.invalidos++;
  }
  return r;
}

/** Payload Firestore — omite opcionais vazios (não grava 0 inventado). */
export function montarPayload(row, { importBatchId, arquivoNome, importadoPor }) {
  const payload = {
    id: row.docId,
    uidKey: row.uidKey,
    usuarioNome: row.usuarioNome,
    data: row.data,
    publico: row.publico,
    tipoTreinamento: row.tipoTreinamento,
    treinamento: row.treinamento,
    origemImportacao: true,
    importBatchId: importBatchId || null,
    importFingerprint: row.fingerprint,
    importArquivo: arquivoNome || null,
    importadoPor: importadoPor || null,
    abrangencia: row.cd ? "cd" : "nacional"
  };

  if (row.cd) payload.cd = row.cd;
  if (row.totalPessoas != null) payload.totalPessoas = row.totalPessoas;
  if (row.notaMedia != null) payload.notaMedia = row.notaMedia;
  if (row.desafio) payload.desafio = row.desafio;
  if (row.meta) payload.meta = row.meta;
  if (row.obs) payload.obs = row.obs;

  return payload;
}

export function gerarMatrizModelo() {
  return [
    COLUNAS_MODELO.slice(),
    [
      "30/01/2026",
      "Ércules",
      "COT/LOT/CONF",
      "Exemplo Treinamento",
      "Online",
      "",
      "13",
      "",
      "",
      "",
      "Observação opcional"
    ]
  ];
}

export function registrosParaCsvErros(registros) {
  const linhas = [["Linha", "Status", "Motivo", "Data", "Usuário", "Público", "Treinamento", "Tipo", "CD", "Pessoas", "Nota", "Obs"]];
  for (const r of registros) {
    if (r.status === "valido") continue;
    linhas.push([
      r.linha,
      r.status,
      r.motivo || "",
      r.data || r.dataRaw || "",
      r.usuarioPlanilha || "",
      r.publico || "",
      r.treinamento || "",
      r.tipoTreinamento || "",
      r.cd || "",
      r.totalPessoas == null ? "" : r.totalPessoas,
      r.notaMedia == null ? "" : r.notaMedia,
      r.obs || ""
    ]);
  }
  return linhas;
}

export function baixarCsv(matrix, filename) {
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const bom = "\uFEFF";
  const body = matrix.map((row) => row.map(esc).join(";")).join("\n");
  const blob = new Blob([bom + body], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Carrega fingerprints existentes para os uidKeys envolvidos.
 */
export async function carregarFingerprintsExistentes(db, fs, uidKeys) {
  const fortes = new Set();
  const suaves = new Set();
  const keys = [...new Set((uidKeys || []).filter(Boolean))];

  for (const uid of keys) {
    const q = fs.query(
      fs.collection(db, TREINOS_COLLECTION),
      fs.where("uidKey", "==", uid)
    );
    const snap = await fs.getDocs(q);
    snap.forEach((docSnap) => {
      const d = docSnap.data() || {};
      const row = {
        uidKey: d.uidKey || uid,
        data: d.data || "",
        treinamento: d.treinamento || "",
        publico: d.publico || "",
        tipoTreinamento: d.tipoTreinamento || "",
        cd: d.cd || "",
        totalPessoas: d.totalPessoas ?? null,
        obs: d.obs || ""
      };
      if (d.importFingerprint) fortes.add(d.importFingerprint);
      fortes.add(fingerprintForte(row));
      suaves.add(fingerprintSuave(row));
    });
  }

  return { fortes, suaves };
}

/**
 * Importa registros selecionados em lotes (writeBatch ≤ 400).
 */
export async function executarImportacao(db, fs, {
  registros,
  modo = "somente_novos", // somente_novos | incluir_possiveis
  selecionadosPossiveis = new Set(),
  arquivoNome,
  importadoPor,
  importadoPorUid
}) {
  const batchId = `batch_${Date.now()}_${hash32(arquivoNome || "file")}`;
  const aImportar = [];

  for (const r of registros) {
    if (r.status === "valido") aImportar.push(r);
    else if (r.status === "possivel_duplicado") {
      if (modo === "incluir_possiveis" || selecionadosPossiveis.has(r.linha)) {
        aImportar.push(r);
      }
    }
  }

  let importados = 0;
  const CHUNK = 400;
  for (let i = 0; i < aImportar.length; i += CHUNK) {
    const slice = aImportar.slice(i, i + CHUNK);
    const batch = fs.writeBatch(db);
    for (const row of slice) {
      const payload = montarPayload(row, {
        importBatchId: batchId,
        arquivoNome,
        importadoPor
      });
      payload.criadoEm = fs.serverTimestamp();
      payload.atualizadoEm = fs.serverTimestamp();
      const ref = fs.doc(db, TREINOS_COLLECTION, row.docId);
      batch.set(ref, payload, { merge: true });
    }
    await batch.commit();
    importados += slice.length;
  }

  const resumo = montarResumo(registros);
  const importadosSet = new Set(aImportar.map((r) => r.linha));

  const rejeitadosDetalhe = registros
    .filter((r) => !importadosSet.has(r.linha) && r.status !== "duplicado" && r.status !== "possivel_duplicado")
    .map((r) => ({ linha: r.linha, status: r.status, motivo: r.motivo || "" }));

  const duplicadosDetalhe = registros
    .filter((r) => r.status === "duplicado" || (r.status === "possivel_duplicado" && !importadosSet.has(r.linha)))
    .map((r) => ({ linha: r.linha, status: r.status, motivo: r.motivo || "" }));

  const auditId = `import_treino_${batchId}`;
  await fs.setDoc(fs.doc(db, AUDIT_COLLECTION, auditId), {
    tipo: TIPO_AUDIT,
    arquivoNome: arquivoNome || null,
    executadoPor: importadoPor || null,
    executadoPorUid: importadoPorUid || null,
    criadoEm: fs.serverTimestamp(),
    batchId,
    enviados: resumo.enviados,
    importados,
    duplicados: resumo.duplicados + (resumo.possiveis - aImportar.filter((x) => x.status === "possivel_duplicado").length),
    pendentes: resumo.pendentes,
    erros: resumo.invalidos + resumo.semUsuario,
    rejeitados: rejeitadosDetalhe.length,
    rejeicoes: rejeitadosDetalhe,
    duplicidades: duplicadosDetalhe,
    modo
  }, { merge: true });

  return {
    batchId,
    auditId,
    importados,
    enviados: resumo.enviados,
    duplicados: duplicadosDetalhe.length,
    pendentes: resumo.pendentes,
    erros: resumo.invalidos + resumo.semUsuario,
    rejeitadosDetalhe,
    duplicadosDetalhe
  };
}
