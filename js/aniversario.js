/**
 * Perfil / aniversário — helpers compartilhados.
 *
 * Fonte da verdade: Firestore `acessos/nascimento_{slug}`.
 * (A coleção `perfis` está bloqueada pelas regras atuais do projeto.)
 * localStorage é apenas cache após confirmação no banco.
 */

export const PERFIS_COLLECTION = "perfis";
export const ACESSOS_COLLECTION = "acessos";

/** Lista canônica de usuários do portal (para leitura individual no Firestore). */
export const USUARIOS_CONHECIDOS = [
  // Analistas
  "Alex", "Daniel", "Emerson", "Euclecio", "Felipe", "Joice", "Maiello",
  "Michel", "Muller", "Robert", "Rodrigo", "Rosilene", "Tenório", "Victor",
  "Marcio", "Andre",
  // Admins
  "Bruna", "Elaine", "Pedro"
];

export function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function chaveLocalNascimento(nome) {
  return `perfil_nascimento_${slug(nome)}`;
}

export function docIdNascimento(nome) {
  return `nascimento_${slug(nome)}`;
}

export function getSession() {
  return safeParse(localStorage.getItem("user_session"));
}

export function getSessionUser() {
  const s = getSession();
  if (s?.nome) {
    return {
      nome: String(s.nome).trim(),
      perfil: String(s.perfil || "").trim() || "analista",
      nascimentoOk: Boolean(s.nascimentoOk),
      dataNascimento: s.dataNascimento || null
    };
  }
  if (s?.usuario) {
    return {
      nome: String(s.usuario).trim(),
      perfil: String(s.perfil || "").trim() || "analista",
      nascimentoOk: Boolean(s.nascimentoOk),
      dataNascimento: s.dataNascimento || null
    };
  }

  const nome = (localStorage.getItem("usuarioLogado") || "").trim();
  if (!nome) return null;
  return { nome, perfil: "analista", nascimentoOk: false, dataNascimento: null };
}

/** Marca na sessão que a data de nascimento foi confirmada (libera o menu). */
export function marcarNascimentoNaSessao(dataNascimento) {
  const s = getSession() || {};
  const parsed = parseDataNascimento(dataNascimento);
  s.nascimentoOk = Boolean(parsed);
  s.dataNascimento = parsed ? parsed.dataNascimento : null;
  if (parsed) {
    s.dataNascimentoExibida = parsed.dataNascimentoExibida;
  }
  localStorage.setItem("user_session", JSON.stringify(s));
  return s;
}

/** Limpa a confirmação de nascimento (força o formulário pós-login). */
export function limparNascimentoDaSessao() {
  const s = getSession() || {};
  s.nascimentoOk = false;
  delete s.dataNascimento;
  delete s.dataNascimentoExibida;
  localStorage.setItem("user_session", JSON.stringify(s));
  return s;
}

export function sessaoTemNascimentoOk() {
  const s = getSession();
  if (!s) return false;
  if (s.nascimentoOk && parseDataNascimento(s.dataNascimento)) return true;
  return false;
}

export function destinoMenuPorPerfil(perfil) {
  return String(perfil || "").toLowerCase() === "admin"
    ? "menuadm.html"
    : "menu.html";
}

/** Caminhos com espaço no nome da pasta (GitHub Pages). */
export function caminhoCadastroNascimento(fromRoot = false) {
  return fromRoot
    ? "html%20menus/cadastro-nascimento.html"
    : "cadastro-nascimento.html";
}

/** Aceita DD/MM/AAAA ou AAAA-MM-DD. Retorna null se inválido. */
export function parseDataNascimento(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  let dia;
  let mes;
  let ano;

  const br = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (br) {
    dia = Number(br[1]);
    mes = Number(br[2]);
    ano = Number(br[3]);
  } else if (iso) {
    ano = Number(iso[1]);
    mes = Number(iso[2]);
    dia = Number(iso[3]);
  } else {
    return null;
  }

  if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(ano)) {
    return null;
  }

  if (ano < 1920 || ano > new Date().getFullYear()) return null;
  if (mes < 1 || mes > 12) return null;
  if (dia < 1 || dia > 31) return null;

  const dt = new Date(ano, mes - 1, dia);
  if (
    dt.getFullYear() !== ano ||
    dt.getMonth() !== mes - 1 ||
    dt.getDate() !== dia
  ) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (dt > hoje) return null;

  const dataNascimento = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const dataNascimentoExibida = `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;

  return {
    dia,
    mes,
    ano,
    dataNascimento,
    dataNascimentoExibida
  };
}

export function formatarDataBR(iso) {
  const parsed = parseDataNascimento(iso);
  return parsed ? parsed.dataNascimentoExibida : "";
}

export function partesDataISO(iso) {
  const parsed = parseDataNascimento(iso);
  if (!parsed) return null;
  return { dia: parsed.dia, mes: parsed.mes, ano: parsed.ano };
}

/** Idade que a pessoa completa (ou completou) no aniversário do ano de referência. */
export function idadeQueCompleta(iso, anoRef = new Date().getFullYear()) {
  const p = partesDataISO(iso);
  if (!p) return null;
  return anoRef - p.ano;
}

export function isAniversarioNoMes(iso, mesAtual = new Date().getMonth() + 1) {
  const p = partesDataISO(iso);
  if (!p) return false;
  return p.mes === Number(mesAtual);
}

export function nomeMes(mes) {
  const nomes = [
    "",
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];
  return nomes[Number(mes)] || "";
}

export function mensagemAniversario(nome) {
  const primeiro = String(nome || "").trim().split(/\s+/)[0] || "colega";
  return `Feliz aniversário, ${primeiro}! Desejamos um mês especial para você.`;
}

export function temDataNascimento(perfil) {
  if (!perfil) return false;
  return Boolean(parseDataNascimento(perfil.dataNascimento || perfil.dataNascimentoExibida));
}

/** Sempre salva no localStorage (sobrevive ao refresh / novo login no mesmo navegador). */
export function salvarNascimentoLocal(nome, parsed) {
  if (!nome || !parsed) return null;
  const payload = {
    nome: String(nome).trim(),
    uidKey: slug(nome),
    dataNascimento: parsed.dataNascimento,
    dataNascimentoExibida: parsed.dataNascimentoExibida,
    diaNascimento: parsed.dia,
    mesNascimento: parsed.mes,
    anoNascimento: parsed.ano,
    salvoLocalEm: Date.now()
  };

  const chave = chaveLocalNascimento(nome);
  localStorage.setItem(chave, JSON.stringify(payload));

  // Compatibilidade com chave antiga pelo nome exibido
  try {
    localStorage.setItem(`perfil_nascimento_${String(nome).trim()}`, JSON.stringify(payload));
  } catch (_) { /* ignore */ }

  return payload;
}

export function obterNascimentoLocal(nome) {
  if (!nome) return null;

  const tentativas = [
    chaveLocalNascimento(nome),
    `perfil_nascimento_${String(nome).trim()}`
  ];

  for (const chave of tentativas) {
    try {
      const raw = localStorage.getItem(chave);
      const data = raw ? JSON.parse(raw) : null;
      if (temDataNascimento(data)) return data;
    } catch (_) { /* ignore */ }
  }

  return null;
}

function montarPayload(nome, parsed, extras = {}, serverTimestamp) {
  const id = slug(nome);
  const { criadoEm, ...restExtras } = extras || {};
  return {
    tipo: "PERFIL_NASCIMENTO",
    evento: "PERFIL_NASCIMENTO",
    nome: String(nome).trim(),
    usuario: String(nome).trim(),
    uidKey: id,
    dataNascimento: parsed.dataNascimento,
    dataNascimentoExibida: parsed.dataNascimentoExibida,
    diaNascimento: parsed.dia,
    mesNascimento: parsed.mes,
    anoNascimento: parsed.ano,
    // ISO string é mais compatível que FieldValue em alguns fluxos
    atualizadoEm: new Date().toISOString(),
    criadoEm:
      criadoEm ||
      (typeof serverTimestamp === "function" ? serverTimestamp() : new Date().toISOString()),
    ...restExtras
  };
}

/**
 * Salva a data de nascimento NO BANCO (obrigatório).
 * Fonte da verdade: acessos/nascimento_{slug}
 * localStorage só como cache depois do sucesso no Firestore.
 */
export async function salvarDataNascimento(
  db,
  { doc, setDoc, getDoc, serverTimestamp },
  nome,
  parsed,
  extras = {}
) {
  const id = slug(nome);
  if (!id || !parsed) throw new Error("Dados inválidos para salvar data de nascimento.");
  if (!db || typeof setDoc !== "function" || typeof doc !== "function") {
    throw new Error("Firestore indisponível para salvar a data de nascimento.");
  }

  const payload = montarPayload(nome, parsed, extras, serverTimestamp);
  const ref = doc(db, ACESSOS_COLLECTION, docIdNascimento(nome));

  try {
    await setDoc(ref, payload, { merge: true });
  } catch (err) {
    console.error("Falha ao gravar nascimento no Firestore (acessos):", err);
    throw new Error("Não foi possível gravar a data de nascimento no banco. Tente novamente.");
  }

  // Confirma leitura no banco (fonte da verdade)
  try {
    if (typeof getDoc === "function") {
      const snap = await getDoc(ref);
      if (!snap.exists() || !temDataNascimento(snap.data())) {
        throw new Error("Gravação no banco não confirmada.");
      }
    }
  } catch (err) {
    console.error("Falha ao confirmar nascimento no Firestore:", err);
    throw new Error("Não foi possível confirmar a data de nascimento no banco. Tente novamente.");
  }

  // Cache local somente após sucesso no banco
  salvarNascimentoLocal(nome, parsed);

  // Melhor esforço na coleção dedicada (pode estar bloqueada pelas regras)
  try {
    await setDoc(doc(db, PERFIS_COLLECTION, id), payload, { merge: true });
  } catch (err) {
    console.warn("Coleção perfis indisponível (ignorado; banco em acessos ok):", err);
  }

  return { ...payload, _fonte: "acessos" };
}

/**
 * Lê o perfil SEMPRE do banco (acessos). Cache local só depois da confirmação.
 */
export async function obterPerfil(db, { doc, getDoc, setDoc }, nome) {
  const id = slug(nome);
  if (!id) return null;
  if (!db || typeof getDoc !== "function" || typeof doc !== "function") {
    throw new Error("Firestore indisponível para verificar a data de nascimento.");
  }

  // 1) Fonte da verdade: acessos/nascimento_{slug}
  try {
    const snapAcessos = await getDoc(doc(db, ACESSOS_COLLECTION, docIdNascimento(nome)));
    if (snapAcessos.exists()) {
      const data = snapAcessos.data() || {};
      if (temDataNascimento(data)) {
        salvarNascimentoLocal(nome, parseDataNascimento(data.dataNascimento));
        return { id: snapAcessos.id, ...data, _fonte: "acessos" };
      }
    }
  } catch (err) {
    console.error("Falha ao ler nascimento no banco (acessos):", err);
    throw err;
  }

  // 2) Fallback legado: perfis/{slug} (se regras permitirem)
  try {
    const snapPerfis = await getDoc(doc(db, PERFIS_COLLECTION, id));
    if (snapPerfis.exists()) {
      const data = snapPerfis.data() || {};
      if (temDataNascimento(data)) {
        const parsed = parseDataNascimento(data.dataNascimento);
        if (parsed && typeof setDoc === "function") {
          try {
            await setDocSafeMigrate(db, { doc, setDoc }, nome, parsed, data);
          } catch (_) { /* ignore migrate errors */ }
        }
        salvarNascimentoLocal(nome, parseDataNascimento(data.dataNascimento));
        return { id: snapPerfis.id, ...data, _fonte: "perfis" };
      }
    }
  } catch (err) {
    console.warn("Falha ao ler coleção perfis (ok se bloqueada):", err);
  }

  return null;
}

async function setDocSafeMigrate(db, { doc, setDoc }, nome, parsed, extras = {}) {
  if (typeof setDoc !== "function") return;
  const payload = montarPayload(nome, parsed, {
    perfil: extras.perfil || null,
    migradoDe: "perfis"
  });
  await setDoc(doc(db, ACESSOS_COLLECTION, docIdNascimento(nome)), payload, { merge: true });
}

/**
 * Atalho do login: só libera se existir NO BANCO.
 */
export async function buscarDataNascimentoSalva(db, fs, nome) {
  const perfil = await obterPerfil(db, fs, nome);
  if (temDataNascimento(perfil)) return perfil.dataNascimento;
  return null;
}

/**
 * Carrega todos os perfis com data de nascimento a partir do banco.
 * Fonte: acessos/nascimento_{slug} (+ perfis legado, se disponível).
 */
export async function listarTodosAniversariantes(
  db,
  { collection, getDocs, doc, getDoc, query, where },
  nomes = USUARIOS_CONHECIDOS
) {
  const anoAtual = new Date().getFullYear();
  const porId = new Map();

  function adicionarPerfil(id, data) {
    if (!data) return;
    const iso = data.dataNascimento || "";
    const partes = partesDataISO(iso);
    if (!partes) return;

    porId.set(id, {
      id,
      nome: data.nome || data.usuario || id,
      dia: partes.dia,
      mes: partes.mes,
      ano: partes.ano,
      dataNascimento: iso,
      dataNascimentoExibida: data.dataNascimentoExibida || formatarDataBR(iso),
      idadeQueCompleta: idadeQueCompleta(iso, anoAtual),
      perfil: data.perfil || null
    });
  }

  // 1) Query por tipo/evento na coleção acessos (quando permitido)
  if (typeof getDocs === "function" && typeof collection === "function") {
    const tentarQuery = async (campo, valor) => {
      if (typeof query !== "function" || typeof where !== "function") return;
      try {
        const q = query(collection(db, ACESSOS_COLLECTION), where(campo, "==", valor));
        const snap = await getDocs(q);
        snap.forEach((item) => {
          const data = item.data() || {};
          const id = slug(data.nome || data.usuario || item.id.replace(/^nascimento_/, ""));
          if (id) adicionarPerfil(id, data);
        });
      } catch (err) {
        console.warn(`Query acessos por ${campo} falhou:`, err);
      }
    };

    await tentarQuery("tipo", "PERFIL_NASCIMENTO");
    await tentarQuery("evento", "PERFIL_NASCIMENTO");

    // Coleção perfis (pode estar bloqueada)
    try {
      const snap = await getDocs(collection(db, PERFIS_COLLECTION));
      snap.forEach((item) => adicionarPerfil(item.id, item.data() || {}));
    } catch (err) {
      console.warn("Listagem de perfis falhou; usando leitura individual.", err);
    }
  }

  // 2) Leitura individual por usuário conhecido (não exige list/query)
  if (typeof getDoc === "function" && typeof doc === "function") {
    const nomesUnicos = [...new Set((nomes || USUARIOS_CONHECIDOS).filter(Boolean))];
    await Promise.all(
      nomesUnicos.map(async (nome) => {
        const id = slug(nome);
        if (!id || porId.has(id)) return;

        try {
          const snapAcessos = await getDoc(doc(db, ACESSOS_COLLECTION, docIdNascimento(nome)));
          if (snapAcessos.exists()) {
            adicionarPerfil(id, snapAcessos.data() || {});
            if (porId.has(id)) return;
          }
        } catch (_) { /* ignore */ }

        try {
          const snapPerfis = await getDoc(doc(db, PERFIS_COLLECTION, id));
          if (snapPerfis.exists()) adicionarPerfil(id, snapPerfis.data() || {});
        } catch (_) { /* ignore */ }
      })
    );
  }

  const lista = [...porId.values()];
  lista.sort((a, b) => {
    if (a.mes !== b.mes) return a.mes - b.mes;
    if (a.dia !== b.dia) return a.dia - b.dia;
    return String(a.nome).localeCompare(String(b.nome), "pt-BR");
  });

  return lista;
}

export function agruparAniversariantesPorMes(lista = []) {
  const grupos = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    nomeMes: nomeMes(i + 1),
    itens: []
  }));

  for (const item of lista || []) {
    const mes = Number(item?.mes);
    if (!mes || mes < 1 || mes > 12) continue;
    grupos[mes - 1].itens.push(item);
  }

  for (const g of grupos) {
    g.itens.sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia;
      return String(a.nome).localeCompare(String(b.nome), "pt-BR");
    });
  }

  return grupos;
}

export async function listarAniversariantesDoMes(
  db,
  fs,
  mes = new Date().getMonth() + 1,
  nomes = USUARIOS_CONHECIDOS
) {
  const todos = await listarTodosAniversariantes(db, fs, nomes);
  const mesNum = Number(mes);
  return todos.filter((item) => item.mes === mesNum);
}
