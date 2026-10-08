/**
 * Usuários do Portal AM — persistência Firestore (tipo am_usuario).
 * Senhas NÃO ficam no HTML de login; seed grava no banco uma vez.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "../firebase-config.js";
import {
  AM_COLLECTION,
  AM_ESCOPO,
  TIPO,
  PERFIL_AM_ANALISTA,
  PERFIL_AM_GESTORA,
  PERFIL_AM_ADMIN,
  SEED_ANALISTAS_AM,
  SEED_GESTORA_AM,
  SEED_ADMIN_AM
} from "./config.js";
import { slug } from "./db.js";

const SEED_FLAG_ID = "am_usuario_seed_v1";

export function docIdAmUsuario(nome, perfil) {
  return `am_usuario_${String(perfil || PERFIL_AM_ANALISTA)}_${slug(nome)}`;
}

export function normalizarNome(nome) {
  return String(nome || "").replace(/\s+/g, " ").trim();
}

export async function listarUsuariosAm({ force = false } = {}) {
  const snap = await getDocs(
    query(collection(db, AM_COLLECTION), where("tipo", "==", TIPO.USUARIO))
  );
  const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  lista.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
  return lista;
}

export async function salvarUsuarioAm(dados, { criadoPor = null, somenteSeNovo = false } = {}) {
  const nome = normalizarNome(dados.nome);
  const perfil = String(dados.perfil || PERFIL_AM_ANALISTA);
  if (!nome) throw new Error("Informe o nome.");
  const id = docIdAmUsuario(nome, perfil);
  const ref = doc(db, AM_COLLECTION, id);
  const existente = await getDoc(ref);
  if (somenteSeNovo && existente.exists()) {
    return { id, criado: false, data: { id, ...existente.data() } };
  }
  const base = existente.exists() ? existente.data() : {};
  const senha = String(dados.senha ?? base.senha ?? "").trim();
  if (!senha) throw new Error("Informe a senha.");
  const ativo = dados.ativo === undefined ? base.ativo !== false : Boolean(dados.ativo);
  const payload = {
    ...base,
    tipo: TIPO.USUARIO,
    escopo: AM_ESCOPO,
    nome,
    uidKey: slug(nome),
    perfil,
    senha,
    ativo,
    deveTrocarSenha: dados.deveTrocarSenha === undefined
      ? (base.deveTrocarSenha || false)
      : Boolean(dados.deveTrocarSenha),
    atualizadoEmMs: Date.now(),
    atualizadoPor: criadoPor || base.atualizadoPor || null,
    atualizadoEm: serverTimestamp()
  };
  if (!existente.exists()) {
    payload.criadoEmMs = Date.now();
    payload.criadoPor = criadoPor || "sistema";
    payload.criadoEm = serverTimestamp();
    if (dados.deveTrocarSenha === undefined) payload.deveTrocarSenha = true;
  }
  await setDoc(ref, payload, { merge: true });
  return { id, criado: !existente.exists(), data: { id, ...payload } };
}

export async function garantirSeedAm({ force = false } = {}) {
  if (!force) {
    try {
      const flag = await getDoc(doc(db, AM_COLLECTION, SEED_FLAG_ID));
      if (flag.exists()) return { ok: true, skipped: true };
    } catch {
      /* continua */
    }
  }

  const existentes = await listarUsuariosAm();
  const ids = new Set(existentes.map((u) => u.id));

  const seeds = [
    ...SEED_ANALISTAS_AM.map((a) => ({
      ...a,
      perfil: PERFIL_AM_ANALISTA,
      deveTrocarSenha: true
    })),
    { ...SEED_GESTORA_AM, deveTrocarSenha: false },
    { ...SEED_ADMIN_AM, deveTrocarSenha: true }
  ];

  const criados = [];
  for (const item of seeds) {
    const id = docIdAmUsuario(item.nome, item.perfil);
    if (ids.has(id)) continue;
    const r = await salvarUsuarioAm(item, { criadoPor: "am_seed", somenteSeNovo: true });
    if (r.criado) criados.push(r.id);
  }

  // Modelos de rotina seed
  const { SEED_ROTINAS } = await import("./config.js");
  for (const rot of SEED_ROTINAS) {
    const id = `am_rotina_modelo_${slug(rot.nome)}`;
    const ref = doc(db, AM_COLLECTION, id);
    const ex = await getDoc(ref);
    if (!ex.exists()) {
      await setDoc(ref, {
        tipo: TIPO.ROTINA_MODELO,
        escopo: AM_ESCOPO,
        ...rot,
        ativo: true,
        responsaveis: [],
        exigeValidacao: true,
        createdAtMs: Date.now(),
        createdAt: serverTimestamp()
      });
    }
  }

  // Config índices
  const cfgRef = doc(db, AM_COLLECTION, "am_config_indice");
  if (!(await getDoc(cfgRef)).exists()) {
    const { PESOS_INDICE_PADRAO } = await import("./config.js");
    await setDoc(cfgRef, {
      tipo: TIPO.CONFIG,
      escopo: AM_ESCOPO,
      chave: "indice_execucao",
      pesos: PESOS_INDICE_PADRAO,
      visitasObrigatoriasPadrao: 2,
      createdAt: serverTimestamp()
    });
  }

  await setDoc(
    doc(db, AM_COLLECTION, SEED_FLAG_ID),
    {
      tipo: TIPO.USUARIO_SEED,
      escopo: AM_ESCOPO,
      ok: true,
      criados: criados.length,
      atualizadoEmMs: Date.now(),
      atualizadoEm: serverTimestamp()
    },
    { merge: true }
  );

  return { ok: true, criados: criados.length };
}

export async function carregarLoginAm() {
  await garantirSeedAm().catch((e) => console.warn("Seed AM:", e));
  const lista = await listarUsuariosAm();
  return lista
    .filter((u) => u.ativo !== false)
    .sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt-BR"));
}

export async function autenticarAm(nome, senha) {
  const lista = await carregarLoginAm();
  const user = lista.find(
    (u) => normalizarNome(u.nome) === normalizarNome(nome)
  );
  if (!user) return { ok: false, erro: "Usuário não encontrado." };
  if (user.ativo === false) return { ok: false, erro: "Usuário desativado." };
  if (String(user.senha || "") !== String(senha || "").trim()) {
    return { ok: false, erro: "Senha incorreta." };
  }
  return { ok: true, user };
}

export async function alterarSenhaAm(nome, perfil, senhaAtual, senhaNova, por) {
  const id = docIdAmUsuario(nome, perfil);
  const snap = await getDoc(doc(db, AM_COLLECTION, id));
  if (!snap.exists()) throw new Error("Usuário não encontrado.");
  const data = snap.data();
  if (String(data.senha) !== String(senhaAtual)) {
    throw new Error("Senha atual incorreta.");
  }
  if (String(senhaNova || "").trim().length < 6) {
    throw new Error("A nova senha deve ter ao menos 6 caracteres.");
  }
  return salvarUsuarioAm(
    {
      nome,
      perfil,
      senha: String(senhaNova).trim(),
      deveTrocarSenha: false
    },
    { criadoPor: por || nome }
  );
}
