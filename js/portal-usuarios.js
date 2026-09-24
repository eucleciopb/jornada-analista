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

/**
 * Lista todos os usuários do portal (ativos e inativos).
 */
export async function listarUsuariosPortal(db, fs) {
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
  return lista;
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
  somenteSeNovo = false
} = {}) {
  const { doc, getDoc, setDoc, serverTimestamp } = fs;
  const nome = normalizarNome(dados.nome);
  const perfil = normalizarPerfil(dados.perfil);

  if (!nome) throw new Error("Informe o nome do usuário.");

  const id = docIdUsuario(nome, perfil);
  const ref = doc(db, PORTAL_USUARIOS_COL, id);
  const existente = await getDoc(ref);

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

/**
 * Garante que o seed hardcoded exista no banco (não sobrescreve senha/status).
 */
export async function garantirSeedUsuarios(db, fs, { criadoPor = "seed" } = {}) {
  const resultados = [];

  for (const [nome, senha] of Object.entries(SEED_ANALISTAS)) {
    resultados.push(
      await salvarUsuarioPortal(db, fs, {
        nome,
        senha,
        matricula: senha,
        perfil: PERFIL_ANALISTA,
        ativo: true
      }, { criadoPor, somenteSeNovo: true })
    );
  }

  for (const [nome, senha] of Object.entries(SEED_ADMINS)) {
    resultados.push(
      await salvarUsuarioPortal(db, fs, {
        nome,
        senha,
        matricula: senha,
        perfil: PERFIL_ADMIN,
        ativo: true
      }, { criadoPor, somenteSeNovo: true })
    );
  }

  return resultados;
}

/**
 * Carrega usuários para o select de login.
 * Prioriza Firestore; se falhar/vazio, usa seed local.
 * Retorna Map nome → { senha, matricula, perfil, ativo, uidKey }.
 */
export async function carregarUsuariosLogin(db, fs, perfilDesejado) {
  const perfil = normalizarPerfil(perfilDesejado);
  const mapa = new Map();

  const seed = perfil === PERFIL_ADMIN ? SEED_ADMINS : SEED_ANALISTAS;
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

  try {
    // Garante seed no banco na primeira vez (não bloqueia login se falhar)
    await garantirSeedUsuarios(db, fs, { criadoPor: "login_auto" }).catch(() => {});
    const lista = await listarUsuariosPortal(db, fs);
    const doPerfil = lista.filter((u) => normalizarPerfil(u.perfil) === perfil);

    if (doPerfil.length) {
      mapa.clear();
      for (const u of doPerfil) {
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
    }
  } catch (err) {
    console.warn("Login usando seed local (Firestore indisponível):", err);
  }

  return mapa;
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
