/**
 * Sessão e guards do Portal AM (index11).
 */
import {
  PERFIL_AM_ANALISTA,
  PERFIL_AM_GESTORA,
  PERFIL_AM_ADMIN,
  PATH_INDEX11
} from "./config.js";

const SESSION_KEY = "am_user_session";
const LEGACY_USER = "usuarioLogado";

export function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAmSession() {
  const s = safeParse(localStorage.getItem(SESSION_KEY));
  if (s?.nome && s?.perfil) return s;
  // Gestora Vanessa já logada no index10 pode abrir gestão AM
  const legacy = safeParse(localStorage.getItem("user_session"));
  if (legacy?.perfil === "vanessa" && legacy?.nome) {
    return {
      nome: legacy.nome,
      perfil: PERFIL_AM_GESTORA,
      uidKey: "vanessa",
      origem: "index10",
      loginAt: legacy.loginAt || Date.now()
    };
  }
  return null;
}

export function salvarSessaoAm(user) {
  const sessao = {
    nome: user.nome,
    perfil: user.perfil,
    uidKey: user.uidKey || String(user.nome || "").toLowerCase(),
    deveTrocarSenha: Boolean(user.deveTrocarSenha),
    loginAt: Date.now(),
    origem: "index11"
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  localStorage.setItem(LEGACY_USER, user.nome);
  return sessao;
}

export function limparSessaoAm() {
  localStorage.removeItem(SESSION_KEY);
}

export function isGestora(session = getAmSession()) {
  const p = String(session?.perfil || "");
  return p === PERFIL_AM_GESTORA || p === PERFIL_AM_ADMIN;
}

export function isAdmin(session = getAmSession()) {
  return String(session?.perfil || "") === PERFIL_AM_ADMIN;
}

export function isAnalista(session = getAmSession()) {
  return String(session?.perfil || "") === PERFIL_AM_ANALISTA;
}

/** Exige sessão AM; redireciona ao index11 se inválida. */
export function exigirSessaoAm({ gestora = false, admin = false } = {}) {
  const s = getAmSession();
  if (!s) {
    window.location.replace(resolveIndex());
    return null;
  }
  if (admin && !isAdmin(s)) {
    window.location.replace(resolveHome(s));
    return null;
  }
  if (gestora && !isGestora(s)) {
    window.location.replace(resolveHome(s));
    return null;
  }
  return s;
}

function resolveIndex() {
  const path = decodeURIComponent(window.location.pathname || "");
  if (/html\s*am/i.test(path) || /html\s*menus/i.test(path) || /html\s*vanessa/i.test(path)) {
    return PATH_INDEX11.startsWith("../") ? PATH_INDEX11 : "../index11.html";
  }
  return "index11.html";
}

export function resolveHome(session = getAmSession()) {
  const path = decodeURIComponent(window.location.pathname || "");
  const inAm = /html\s*am/i.test(path);
  const inMenus = /html\s*menus/i.test(path);
  if (isGestora(session)) {
    if (inAm) return "./gestao.html";
    if (inMenus) return "../html%20am/gestao.html";
    return "html%20am/gestao.html";
  }
  if (inAm) return "./visao-geral.html";
  if (inMenus) return "../html%20am/visao-geral.html";
  return "html%20am/visao-geral.html";
}

export function podeVerTodos(session = getAmSession()) {
  return isGestora(session);
}

/** Filtro de ownership: analista só vê os próprios, gestora vê todos. */
export function filtrarPorAnalista(lista, session, campo = "analista") {
  if (!lista) return [];
  if (podeVerTodos(session)) return lista.slice();
  const nome = String(session?.nome || "");
  return lista.filter((item) => String(item[campo] || "") === nome);
}
