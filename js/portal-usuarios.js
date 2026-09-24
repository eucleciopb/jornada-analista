/**
 * Usuários do portal (analistas e admins).
 *
 * Persistência em `apuracoes_treinamentos` com tipo `portal_usuario`
 * (mesmo padrão de links úteis / termo de ciência).
 *
 * Campos:
 *  - nome, uidKey, matricula, senha, perfil (analista|admin), ativo
 */

export const PORTAL_USUARIOS_COL = "apuracoes_treinamentos";
export const TIPO_PORTAL_USUARIO = "portal_usuario";
export const SEED_FLAG_DOC_ID = "portal_usuario_seed_v1";

export const PERFIL_ANALISTA = "analista";
export const PERFIL_ADMIN = "admin";

/** Seed inicial — espelha os logins hardcoded atuais. */
export const SEED_ANALISTAS = {
  Alex: "A70",
  Daniel: "D71",
  Emerson: "B70",
  Euclecio: "E72",
  Felipe: "F73",
  Joice: "J74",
  Maiello: "M75",
  Michel: "M76",
  Muller: "M77",
  Robert: "R78",
  Rodrigo: "R79",
  Rosilene: "R80",
  Tenório: "T81",
  Victor: "V82",
  Marcio: "M83",
  Andre: "A84",
  "Ana Paula": "A85"
};

export const SEED_ADMINS = {
  Bruna: "B7N4GP26",
  Elaine: "E9L2JP26",
  Euclecio: "U6C8AD26",
  Pedro: "P3D5GP26"
};

const LOGIN_CACHE_TTL_MS = 2 * 60 * 1000; // 2 min
const LIST_CACHE_TTL_MS = 60 * 1000; // 1 min (memória da aba)

/** Cache em memória da listagem (evita reconsultar na mesma página). */
let _listaMemoria = null;
let _listaMemoriaEm = 0;

export function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function docIdUsuario(nome, perfil = PERFIL_ANALISTA) {
  const p = String(perfil || PERFIL_ANALISTA).toLowerCase();
  return `portal_usuario_${p}_${slug(nome)}`;
}

export function normalizarNome(nome) {
  return String(nome || "").replace(/\s+/g, " ").trim();
}

export function normalizarPerfil(perfil) {
  const p = String(perfil || "").trim().toLowerCase();
  if (p === PERFIL_ADMIN) return PERFIL_ADMIN;
  return PERFIL_ANALISTA;
}

function cacheKeyLogin(perfil) {
  return `portal_usuarios_login_v1_${normalizarPerfil(perfil)}`;
}

function lerCacheLogin(perfil) {
  try {
    const raw = sessionStorage.getItem(cacheKeyLogin(perfil));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.lista)) return null;
    if (Date.now() - Number(data.ts || 0) > LOGIN_CACHE_TTL_MS) return null;
    return data.lista;
  } catch {
    return null;
  }
}

function gravarCacheLogin(perfil, lista) {
  try {
    sessionStorage.setItem(
      cacheKeyLogin(perfil),
      JSON.stringify({ ts: Date.now(), lista })
    );
  } catch {
    /* ignore quota */
  }
}

/** Invalida caches locais (após cadastro/inativação no admin). */
export function invalidarCacheUsuariosPortal() {
  _listaMemoria = null;
  _listaMemoriaEm = 0;
  try {
    sessionStorage.removeItem(cacheKeyLogin(PERFIL_ANALISTA));
    sessionStorage.removeItem(cacheKeyLogin(PERFIL_ADMIN));
  } catch {
    /* ignore */
  }
}

/**
 * Lista todos os usuários do portal (ativos e inativos).
 * Usa cache em memória curto para não repetir a query na mesma tela.
 */
export async function listarUsuariosPortal(db, fs, { force = false } = {}) {
  if (
    !force &&
    Array.isArray(_listaMemoria) &&
    Date.now() - _listaMemoriaEm < LIST_CACHE_TTL_MS
  ) {
    return _listaMemoria.slice();
  }

  const { collection, getDocs, query, where } = fs;
  const lista = [];
  try {
    const snap = await getDocs(
      query(collection(db, PORTAL_USUARIOS_COL), where("tipo", "==", TIPO_PORTAL_USUARIO))
    );
    snap.forEach((item) => {
      lista.push({ id: item.id, ...item.data() });
    });
  } catch (err) {
    console.warn("Falha ao listar usuários do portal:", err);
  }

  lista.sort((a, b) => {
    const pa = String(a.perfil || "").localeCompare(String(b.perfil || ""), "pt-BR");
    if (pa !== 0) return pa;
    return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
  });

  _listaMemoria = lista;
  _listaMemoriaEm = Date.now();
  return lista.slice();
}

export async function buscarUsuarioPorNome(db, fs, nome, perfil) {
  const id = docIdUsuario(nome, perfil);
  const { doc, getDoc } = fs;
  try {
    const snap = await getDoc(doc(db, PORTAL_USUARIOS_COL, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn("Falha ao buscar usuário:", err);
    return null;
  }
}

/**
 * Cria ou atualiza um usuário.
 * Se `somenteSeNovo`, não sobrescreve documento existente.
 * Em atualização, senha/matricula são opcionais (mantém as atuais).
 */
export async function salvarUsuarioPortal(db, fs, dados, {
  criadoPor = null,
  somenteSeNovo = false,
  skipExistCheck = false
} = {}) {
  const { doc, getDoc, setDoc, serverTimestamp } = fs;
  const nome = normalizarNome(dados.nome);
  const perfil = normalizarPerfil(dados.perfil);

  if (!nome) throw new Error("Informe o nome do usuário.");

  const id = docIdUsuario(nome, perfil);
  const ref = doc(db, PORTAL_USUARIOS_COL, id);

  let existente = { exists: () => false, data: () => ({}) };
  if (!skipExistCheck) {
    existente = await getDoc(ref);
  }

  if (somenteSeNovo && existente.exists()) {
    return { id, criado: false, data: { id, ...existente.data() } };
  }

  const agoraMs = Date.now();
  const base = existente.exists() ? existente.data() : {};
  const senhaInformada = String(dados.senha ?? "").trim();
  const matriculaInformada = String(dados.matricula ?? "").trim();
  const senha = senhaInformada || String(base.senha || base.matricula || "").trim();
  const matricula = matriculaInformada || String(base.matricula || senha || "").trim();

  if (!existente.exists() && !senha) {
    throw new Error("Informe a senha.");
  }
  if (!senha) throw new Error("Usuário sem senha cadastrada.");

  const ativo = dados.ativo === undefined
    ? (base.ativo !== false)
    : Boolean(dados.ativo);

  const payload = {
    ...base,
    tipo: TIPO_PORTAL_USUARIO,
    nome,
    uidKey: slug(nome),
    perfil,
    matricula,
    senha,
    ativo,
    atualizadoEmMs: agoraMs,
    atualizadoPor: criadoPor || base.atualizadoPor || null,
    atualizadoEm: serverTimestamp()
  };

  if (!existente.exists()) {
    payload.criadoEmMs = agoraMs;
    payload.criadoPor = criadoPor || null;
    payload.criadoEm = serverTimestamp();
  }

  await setDoc(ref, payload, { merge: true });
  invalidarCacheUsuariosPortal();
  return { id, criado: !existente.exists(), data: { id, ...payload } };
}

/** Ativa ou inativa um usuário sem exigir nova senha. */
export async function alternarAtivoUsuario(db, fs, { nome, perfil, ativo, atualizadoPor = null }) {
  return salvarUsuarioPortal(db, fs, {
    nome,
    perfil,
    ativo: Boolean(ativo)
  }, { criadoPor: atualizadoPor });
}

function entradasSeed() {
  const itens = [];
  for (const [nome, senha] of Object.entries(SEED_ANALISTAS)) {
    itens.push({ nome, senha, matricula: senha, perfil: PERFIL_ANALISTA, ativo: true });
  }
  for (const [nome, senha] of Object.entries(SEED_ADMINS)) {
    itens.push({ nome, senha, matricula: senha, perfil: PERFIL_ADMIN, ativo: true });
  }
  return itens;
}

/**
 * Garante seed hardcoded no banco.
 * - 1 listagem (ou flag) em vez de N getDocs sequenciais
 * - grava só os faltantes em paralelo
 * - marca flag para próximas aberturas pularem o trabalho
 */
export async function garantirSeedUsuarios(db, fs, { criadoPor = "seed", force = false } = {}) {
  const { doc, getDoc, setDoc, serverTimestamp } = fs;

  if (!force) {
    try {
      const flag = await getDoc(doc(db, PORTAL_USUARIOS_COL, SEED_FLAG_DOC_ID));
      if (flag.exists()) return [];
    } catch {
      /* segue para seed */
    }
  }

  const existentes = await listarUsuariosPortal(db, fs, { force: true });
  const ids = new Set(existentes.map((u) => u.id || docIdUsuario(u.nome, u.perfil)));

  const faltantes = entradasSeed().filter((item) => !ids.has(docIdUsuario(item.nome, item.perfil)));

  const resultados = await Promise.all(
    faltantes.map((item) =>
      salvarUsuarioPortal(db, fs, item, {
        criadoPor,
        somenteSeNovo: true,
        skipExistCheck: true
      })
    )
  );

  try {
    await setDoc(
      doc(db, PORTAL_USUARIOS_COL, SEED_FLAG_DOC_ID),
      {
        tipo: "portal_usuario_seed_flag",
        ok: true,
        totalSeed: entradasSeed().length,
        criadosAgora: resultados.filter((r) => r.criado).length,
        atualizadoEmMs: Date.now(),
        atualizadoEm: serverTimestamp(),
        atualizadoPor: criadoPor
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Não foi possível gravar flag de seed:", err);
  }

  invalidarCacheUsuariosPortal();
  return resultados;
}

function mapaFromLista(lista, perfil) {
  const mapa = new Map();
  for (const u of lista) {
    if (normalizarPerfil(u.perfil) !== perfil) continue;
    const nome = normalizarNome(u.nome);
    if (!nome) continue;
    mapa.set(nome, {
      nome,
      senha: String(u.senha || u.matricula || "").trim(),
      matricula: String(u.matricula || u.senha || "").trim(),
      perfil,
      ativo: u.ativo !== false,
      uidKey: u.uidKey || slug(nome),
      origem: "firestore",
      id: u.id
    });
  }
  return mapa;
}

function mapaFromSeed(perfil) {
  const seed = perfil === PERFIL_ADMIN ? SEED_ADMINS : SEED_ANALISTAS;
  const mapa = new Map();
  for (const [nome, senha] of Object.entries(seed)) {
    mapa.set(nome, {
      nome,
      senha,
      matricula: senha,
      perfil,
      ativo: true,
      uidKey: slug(nome),
      origem: "seed"
    });
  }
  return mapa;
}

/** Seed síncrono para popular o select na hora (antes da rede). */
export function mapaSeedLogin(perfilDesejado) {
  return mapaFromSeed(normalizarPerfil(perfilDesejado));
}

/**
 * Carrega usuários para o select de login.
 * Rápido: 1 query (ou cache). NÃO faz seed no login.
 */
export async function carregarUsuariosLogin(db, fs, perfilDesejado) {
  const perfil = normalizarPerfil(perfilDesejado);

  const cached = lerCacheLogin(perfil);
  if (cached) {
    return mapaFromLista(cached, perfil);
  }

  // Seed local imediato como fallback (sem esperar rede)
  const mapaSeed = mapaFromSeed(perfil);

  try {
    const lista = await listarUsuariosPortal(db, fs);
    const doPerfil = lista.filter((u) => normalizarPerfil(u.perfil) === perfil);

    if (doPerfil.length) {
      gravarCacheLogin(perfil, doPerfil);
      return mapaFromLista(doPerfil, perfil);
    }

    // Banco ainda vazio → usa seed local e popula em background (não bloqueia UI)
    garantirSeedUsuarios(db, fs, { criadoPor: "login_auto" }).catch(() => {});
  } catch (err) {
    console.warn("Login usando seed local (Firestore indisponível):", err);
  }

  return mapaSeed;
}

export function nomesOrdenados(mapaUsuarios, { somenteAtivos = true } = {}) {
  const nomes = [];
  for (const [nome, u] of mapaUsuarios.entries()) {
    if (somenteAtivos && u.ativo === false) continue;
    nomes.push(nome);
  }
  return nomes.sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Nomes de analistas ativos do portal (para selects admin).
 * Se o banco falhar/vazio, devolve o fallback informado.
 */
export async function listarNomesAnalistasAtivos(db, fs, fallback = []) {
  return listarNomesUsuariosAtivos(db, fs, {
    perfis: [PERFIL_ANALISTA],
    fallback
  });
}

/**
 * Nomes de usuários ativos do portal (analistas e/ou admins).
 */
export async function listarNomesUsuariosAtivos(db, fs, {
  perfis = null,
  fallback = []
} = {}) {
  try {
    const lista = await listarUsuariosPortal(db, fs);
    const filtroPerfis = Array.isArray(perfis) && perfis.length
      ? perfis.map(normalizarPerfil)
      : null;
    const nomes = lista
      .filter((u) => {
        if (u.ativo === false) return false;
        if (filtroPerfis && !filtroPerfis.includes(normalizarPerfil(u.perfil))) return false;
        return true;
      })
      .map((u) => normalizarNome(u.nome))
      .filter(Boolean);
    if (nomes.length) {
      return [...new Set(nomes)].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }
  } catch (err) {
    console.warn("Falha ao listar usuários do portal:", err);
  }
  return [...new Set((fallback || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Sugere próxima matrícula no padrão Letra+número (ex.: A86). */
export function sugerirMatricula(nome, usuariosExistentes = []) {
  const letra = String(nome || "U").trim().charAt(0).toUpperCase() || "U";
  let max = 69;
  for (const u of usuariosExistentes) {
    const m = String(u.matricula || u.senha || "").trim();
    const match = m.match(/^[A-Za-z](\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  for (const senha of Object.values(SEED_ANALISTAS)) {
    const match = String(senha).match(/^[A-Za-z](\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${letra}${max + 1}`;
}
