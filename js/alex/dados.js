/**
 * Camada de dados — treinamentos de produtos e análises.
 * Reutiliza Firestore existente; cria coleções novas só quando necessário.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { slug } from "../aniversario.js";
import { montarResultadoLinha, STATUS } from "./calculos.js";

export const COL_TREINAMENTOS_PRODUTOS = "treinamentos_produtos";
export const COL_ANALISES = "analises_treinamento";
export const COL_LOGS = "logs_treinamentos_produtos";
export const COL_TREINAMENTOS_LEGACY = "treinamentos_realizados";
export const COL_CDS = "cds";
export const COL_CONFIG = "config_treinamentos_produtos";

export const PUBLICOS = [
  "Vendedores",
  "Supervisores",
  "Gerentes",
  "Equipe interna",
  "Misto",
  "Outros"
];

export const MODALIDADES = ["Presencial", "Online"];

export const MARCAS_PADRAO = [
  "Petra",
  "TNT",
  "Crystal",
  "Black Princess",
  "Lok",
  "Weltenburger",
  "Outros"
];

export function makeId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function normalize(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

export function cdIdFromNome(nome) {
  return slug(String(nome || "").replace(/^cd\s*[-–]\s*/i, "").trim());
}

export function mapearCds(listaNomes) {
  return (listaNomes || [])
    .map((n) => normalize(n))
    .filter(Boolean)
    .map((nome) => ({ id: cdIdFromNome(nome), nome }));
}

/** Payload padrão de treinamento de produtos */
export function novoTreinamentoPayload(user, dados = {}) {
  const agora = new Date().toISOString();
  const cds = Array.isArray(dados.cds)
    ? dados.cds.map((c) =>
        typeof c === "string"
          ? { id: cdIdFromNome(c), nome: normalize(c) }
          : { id: c.id || cdIdFromNome(c.nome), nome: normalize(c.nome) }
      )
    : [];

  return {
    id: dados.id || makeId(),
    data: dados.data || "",
    nome: normalize(dados.nome || dados.treinamento || ""),
    marca: normalize(dados.marca || ""),
    marcaId: slug(dados.marca || ""),
    produto: normalize(dados.produto || ""),
    produtoId: slug(dados.produto || ""),
    tema: normalize(dados.tema || ""),
    modalidade: dados.modalidade || dados.tipoTreinamento || "",
    publico: dados.publico || "",
    quantidadePessoas: Number(dados.quantidadePessoas ?? dados.totalPessoas) || 0,
    responsavelId: dados.responsavelId || user?.uidKey || slug(user?.nome || "alex"),
    responsavelNome: dados.responsavelNome || user?.nome || "Alex",
    cds,
    quantidadeCds: cds.length,
    observacoes: normalize(dados.observacoes || dados.obs || ""),
    anexos: Array.isArray(dados.anexos) ? dados.anexos : [],
    materialApresentado: dados.materialApresentado || null,
    evidencias: Array.isArray(dados.evidencias) ? dados.evidencias : [],
    listaPresenca: dados.listaPresenca || null,
    fotos: Array.isArray(dados.fotos) ? dados.fotos : [],
    statusAnalise: dados.statusAnalise || STATUS.AGUARDANDO,
    resultadoGeral: dados.resultadoGeral || STATUS.SEM_ANALISE,
    coberturaAntes: dados.coberturaAntes ?? null,
    coberturaDepois: dados.coberturaDepois ?? null,
    hlAntes: dados.hlAntes ?? null,
    hlDepois: dados.hlDepois ?? null,
    origem: "treinamentos_produtos",
    uidKey: user?.uidKey || slug(user?.nome || ""),
    usuarioNome: user?.nome || "",
    criadoEm: dados.criadoEm || agora,
    atualizadoEm: agora,
    adicionarAgenda: Boolean(dados.adicionarAgenda)
  };
}

export async function salvarTreinamento(db, payload) {
  const id = payload.id || makeId();
  const ref = doc(db, COL_TREINAMENTOS_PRODUTOS, id);
  const data = { ...payload, id, atualizadoEm: new Date().toISOString() };
  await setDoc(ref, { ...data, atualizadoEmServer: serverTimestamp() }, { merge: true });
  return data;
}

export async function excluirTreinamento(db, id) {
  await deleteDoc(doc(db, COL_TREINAMENTOS_PRODUTOS, id));
}

export async function obterTreinamento(db, id) {
  const snap = await getDoc(doc(db, COL_TREINAMENTOS_PRODUTOS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function listarTreinamentos(db, { uidKey = null, todos = false } = {}) {
  let snap;
  if (!todos && uidKey) {
    const q = query(collection(db, COL_TREINAMENTOS_PRODUTOS), where("uidKey", "==", uidKey));
    snap = await getDocs(q);
  } else {
    snap = await getDocs(collection(db, COL_TREINAMENTOS_PRODUTOS));
  }
  const arr = [];
  snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
  arr.sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  return arr;
}

/**
 * Compatibilidade: também carrega treinamentos_realizados do Alex
 * e normaliza para o formato de produtos (sem apagar legados).
 */
export async function listarTreinamentosLegacyAlex(db, uidKey = "alex") {
  try {
    const q = query(collection(db, COL_TREINAMENTOS_LEGACY), where("uidKey", "==", uidKey));
    const snap = await getDocs(q);
    const byGroup = new Map();

    snap.forEach((d) => {
      const raw = { id: d.id, ...d.data() };
      const groupKey = [
        raw.data || "",
        raw.treinamento || "",
        raw.tipoTreinamento || "",
        raw.publico || "",
        raw.criadoEm?.seconds || raw.criadoEm || ""
      ].join("|");

      if (!byGroup.has(groupKey)) {
        byGroup.set(groupKey, {
          id: `legacy_${d.id}`,
          data: raw.data || "",
          nome: raw.treinamento || "",
          marca: raw.marca || "",
          produto: raw.produto || "",
          modalidade: raw.tipoTreinamento || "",
          publico: raw.publico || "",
          quantidadePessoas: Number(raw.totalPessoas) || 0,
          responsavelId: raw.uidKey || uidKey,
          responsavelNome: raw.usuarioNome || "Alex",
          cds: [],
          observacoes: raw.obs || "",
          statusAnalise: STATUS.AGUARDANDO,
          resultadoGeral: STATUS.SEM_ANALISE,
          origem: "treinamentos_realizados",
          uidKey: raw.uidKey || uidKey,
          usuarioNome: raw.usuarioNome || "",
          legadoIds: [d.id]
        });
      }
      const g = byGroup.get(groupKey);
      if (raw.cd) {
        const nome = normalize(raw.cd);
        if (!g.cds.some((c) => c.nome === nome)) {
          g.cds.push({ id: cdIdFromNome(nome), nome });
        }
      }
      g.quantidadeCds = g.cds.length;
      if (Array.isArray(g.legadoIds) && !g.legadoIds.includes(d.id)) g.legadoIds.push(d.id);
    });

    return Array.from(byGroup.values());
  } catch (err) {
    console.warn("Falha ao carregar treinamentos legados:", err);
    return [];
  }
}

export async function listarTreinamentosCompleto(db, user, { adminVeTodos = false } = {}) {
  const todos = adminVeTodos && user?.isAdmin;
  const próprios = await listarTreinamentos(db, {
    uidKey: user?.uidKey,
    todos
  });
  const legacy = await listarTreinamentosLegacyAlex(db, user?.uidKey || "alex");

  // Evita duplicar se já migrado (mesmo nome+data)
  const keys = new Set(próprios.map((t) => `${t.data}|${t.nome}|${t.modalidade}`));
  const extras = legacy.filter((t) => !keys.has(`${t.data}|${t.nome}|${t.modalidade}`));
  return [...próprios, ...extras].sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
}

export async function salvarAnalise(db, analise) {
  const id = analise.id || makeId();
  const payload = {
    ...analise,
    id,
    atualizadoEm: new Date().toISOString(),
    atualizadoEmServer: serverTimestamp()
  };
  await setDoc(doc(db, COL_ANALISES, id), payload, { merge: true });
  return payload;
}

export async function listarAnalisesPorTreinamento(db, treinamentoId) {
  const q = query(collection(db, COL_ANALISES), where("treinamentoId", "==", treinamentoId));
  const snap = await getDocs(q);
  const arr = [];
  snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
  arr.sort((a, b) => String(b.criadoEm || "").localeCompare(String(a.criadoEm || "")));
  return arr;
}

export async function listarTodasAnalises(db, { uidKey = null } = {}) {
  let snap;
  if (uidKey) {
    try {
      const q = query(collection(db, COL_ANALISES), where("responsavelId", "==", uidKey));
      snap = await getDocs(q);
    } catch {
      snap = await getDocs(collection(db, COL_ANALISES));
    }
  } else {
    snap = await getDocs(collection(db, COL_ANALISES));
  }
  const arr = [];
  snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
  return arr;
}

export async function registrarLog(db, {
  usuario,
  acao,
  registroId = "",
  valorAnterior = null,
  valorNovo = null,
  detalhes = ""
} = {}) {
  try {
    await addDoc(collection(db, COL_LOGS), {
      usuario: usuario || "",
      acao,
      registroId,
      valorAnterior,
      valorNovo,
      detalhes,
      criadoEm: new Date().toISOString(),
      criadoEmServer: serverTimestamp()
    });
  } catch (err) {
    console.warn("Log não registrado:", err);
  }
}

/** Atualiza resumo do treinamento após salvar análise (sem apagar histórico) */
export async function aplicarResumoAnaliseNoTreinamento(db, treinamentoId, resultadoConsolidado, statusAnalise) {
  if (!treinamentoId || String(treinamentoId).startsWith("legacy_")) return;
  const ref = doc(db, COL_TREINAMENTOS_PRODUTOS, treinamentoId);
  await setDoc(
    ref,
    {
      statusAnalise: statusAnalise || STATUS.AGUARDANDO,
      resultadoGeral: resultadoConsolidado?.resultadoGeral || STATUS.SEM_ANALISE,
      coberturaAntes: resultadoConsolidado?.coberturaInicial ?? null,
      coberturaDepois: resultadoConsolidado?.coberturaFinal ?? null,
      hlAntes: resultadoConsolidado?.hlInicial ?? null,
      hlDepois: resultadoConsolidado?.hlFinal ?? null,
      atualizadoEm: new Date().toISOString()
    },
    { merge: true }
  );
}

export function filtrarTreinamentos(lista, filtros = {}) {
  return (lista || []).filter((t) => {
    if (filtros.mes) {
      const m = String(t.data || "").slice(5, 7);
      if (m !== String(filtros.mes).padStart(2, "0")) return false;
    }
    if (filtros.ano) {
      const a = String(t.data || "").slice(0, 4);
      if (a !== String(filtros.ano)) return false;
    }
    if (filtros.dataInicial && String(t.data || "") < filtros.dataInicial) return false;
    if (filtros.dataFinal && String(t.data || "") > filtros.dataFinal) return false;
    if (filtros.marca && normalize(t.marca).toLowerCase() !== normalize(filtros.marca).toLowerCase()) return false;
    if (filtros.produto && normalize(t.produto).toLowerCase() !== normalize(filtros.produto).toLowerCase()) return false;
    if (filtros.modalidade && filtros.modalidade !== "Todos" && t.modalidade !== filtros.modalidade) return false;
    if (filtros.publico && t.publico !== filtros.publico) return false;
    if (filtros.statusAnalise && filtros.statusAnalise !== "Todos") {
      const st = t.resultadoGeral || t.statusAnalise || STATUS.SEM_ANALISE;
      if (filtros.statusAnalise === "Sem análise") {
        if (![STATUS.SEM_ANALISE, STATUS.AGUARDANDO, ""].includes(st)) return false;
      } else if (st !== filtros.statusAnalise) return false;
    }
    if (filtros.cd) {
      const cdKey = normalize(filtros.cd).toLowerCase();
      const cds = t.cds || [];
      const hit = cds.some((c) => normalize(c.nome || c).toLowerCase().includes(cdKey));
      if (!hit && normalize(t.cd || "").toLowerCase() !== cdKey) return false;
    }
    if (filtros.nome) {
      const q = normalize(filtros.nome).toLowerCase();
      if (!normalize(t.nome || t.treinamento || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function agregarMetricas(lista) {
  const items = lista || [];
  const total = items.length;
  const cds = new Set();
  const marcas = new Set();
  const produtos = new Set();
  let pessoas = 0;
  let presencial = 0;
  let online = 0;
  let melhorou = 0;
  let manteve = 0;
  let regrediu = 0;
  let misto = 0;
  let semAnalise = 0;

  items.forEach((t) => {
    (t.cds || []).forEach((c) => cds.add(c.id || c.nome || c));
    if (t.cd) cds.add(cdIdFromNome(t.cd));
    if (t.marca) marcas.add(normalize(t.marca).toLowerCase());
    if (t.produto) produtos.add(normalize(t.produto).toLowerCase());
    pessoas += Number(t.quantidadePessoas || t.totalPessoas || 0);
    if (String(t.modalidade || t.tipoTreinamento) === "Presencial") presencial += 1;
    if (String(t.modalidade || t.tipoTreinamento) === "Online") online += 1;

    const r = t.resultadoGeral || STATUS.SEM_ANALISE;
    if (r === STATUS.MELHOROU) melhorou += 1;
    else if (r === STATUS.MANTEVE) manteve += 1;
    else if (r === STATUS.REGREDIU) regrediu += 1;
    else if (r === STATUS.MISTO) misto += 1;
    else semAnalise += 1;
  });

  const pct = (n) => (total ? (n / total) * 100 : 0);

  return {
    total,
    cdsImpactados: cds.size,
    pessoasTreinadas: pessoas,
    marcas: marcas.size,
    produtos: produtos.size,
    presencial,
    online,
    pctPresencial: pct(presencial),
    pctOnline: pct(online),
    melhorou,
    manteve,
    regrediu,
    misto,
    semAnalise,
    pctMelhorou: pct(melhorou),
    pctManteve: pct(manteve),
    pctRegrediu: pct(regrediu),
    comAnalise: total - semAnalise,
    aguardandoAnalise: semAnalise
  };
}

export function seriesPorMes(lista) {
  const map = new Map();
  (lista || []).forEach((t) => {
    const key = String(t.data || "").slice(0, 7) || "—";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));
}

export function seriesPorCampo(lista, campo, top = 10) {
  const map = new Map();
  (lista || []).forEach((t) => {
    const label = normalize(t[campo]) || "—";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, value]) => ({ label, value }));
}

export function rankingCds(lista, top = 10) {
  const map = new Map();
  (lista || []).forEach((t) => {
    (t.cds || []).forEach((c) => {
      const nome = normalize(c.nome || c) || "—";
      map.set(nome, (map.get(nome) || 0) + 1);
    });
    if (t.cd) {
      const nome = normalize(t.cd);
      map.set(nome, (map.get(nome) || 0) + 1);
    }
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, value]) => ({ label, value }));
}

export function mediaCoberturaHl(lista) {
  let cobAntes = 0;
  let cobDepois = 0;
  let hlAntes = 0;
  let hlDepois = 0;
  let nCob = 0;
  let nHl = 0;

  (lista || []).forEach((t) => {
    if (t.coberturaAntes != null && t.coberturaDepois != null) {
      cobAntes += Number(t.coberturaAntes) || 0;
      cobDepois += Number(t.coberturaDepois) || 0;
      nCob += 1;
    }
    if (t.hlAntes != null && t.hlDepois != null) {
      hlAntes += Number(t.hlAntes) || 0;
      hlDepois += Number(t.hlDepois) || 0;
      nHl += 1;
    }
  });

  return {
    coberturaAntes: nCob ? cobAntes / nCob : null,
    coberturaDepois: nCob ? cobDepois / nCob : null,
    hlAntes: nHl ? hlAntes / nHl : null,
    hlDepois: nHl ? hlDepois / nHl : null,
    nCob,
    nHl
  };
}

export function consolidarLinhasAnalise(linhas = []) {
  if (!linhas.length) return null;
  const results = linhas.map((l) =>
    montarResultadoLinha({
      coberturaInicial: l.coberturaInicial ?? l.coberturaAntes,
      coberturaFinal: l.coberturaFinal ?? l.coberturaDepois,
      hlInicial: l.hlInicial ?? l.hlAntes,
      hlFinal: l.hlFinal ?? l.hlDepois
    })
  );

  const avg = (arr, key) => arr.reduce((s, x) => s + (Number(x[key]) || 0), 0) / arr.length;
  const coberturaInicial = avg(results, "coberturaInicial");
  const coberturaFinal = avg(results, "coberturaFinal");
  const hlInicial = avg(results, "hlInicial");
  const hlFinal = avg(results, "hlFinal");
  return montarResultadoLinha({ coberturaInicial, coberturaFinal, hlInicial, hlFinal });
}

export async function carregarCds(db, fallbackList = []) {
  try {
    const snap = await getDocs(collection(db, COL_CDS));
    const out = [];
    snap.forEach((d) => {
      const data = d.data() || {};
      const nome = normalize(data.nome || data.name || data.cd || d.id);
      if (nome && data.ativo !== false) out.push(nome);
    });
    if (out.length) return Array.from(new Set(out)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  } catch (err) {
    console.warn("CDs Firestore indisponíveis, usando fallback:", err);
  }
  return Array.from(new Set((fallbackList || []).map(normalize).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

export { montarResultadoLinha, STATUS };
