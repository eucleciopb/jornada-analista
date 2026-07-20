/**
 * Guard do portal — menu exclusivo SOMENTE para Euclecio.
 * Alex e demais nunca são enviados ao menu_alex por perfil antigo.
 */
import {
  garantirPerfilNaSessao,
  obterUsuarioLogado,
  destinoMenuPorPerfil,
  rotaAtualEhExclusivaSV,
  PERFIL_TREINAMENTO_PRODUTOS,
  resolverPerfil
} from "./perfil-acesso.js";

function isEuclecio(user) {
  const nome = String(user?.nome || "").trim().toLowerCase();
  const mat = String(user?.matricula || "").trim().toUpperCase();
  const uid = String(user?.uidKey || "").trim().toLowerCase();
  return nome === "euclecio" || mat === "E72" || mat === "EUCLECIO" || uid === "euclecio";
}

export function aplicarGuardPortal() {
  garantirPerfilNaSessao();
  let user = obterUsuarioLogado();
  if (!user) return null;

  // Limpa perfil errado do Alex / outros
  if (!isEuclecio(user) && (user.perfil === PERFIL_TREINAMENTO_PRODUTOS || user.perfil === "alex_produtos")) {
    try {
      const s = JSON.parse(localStorage.getItem("user_session") || "{}");
      localStorage.setItem(
        "user_session",
        JSON.stringify({
          ...s,
          perfil: "analista",
          tipoUsuario: "analista",
          matricula: String(user.nome || "").toLowerCase() === "alex" ? "A70" : (s.matricula || user.matricula),
          uidKey: String(user.nome || "").toLowerCase() === "alex" ? "alex" : (s.uidKey || user.uidKey)
        })
      );
      user = obterUsuarioLogado();
    } catch {}
  }

  const isProdutos = isEuclecio(user);

  if (isProdutos && user.perfil !== PERFIL_TREINAMENTO_PRODUTOS) {
    try {
      const s = JSON.parse(localStorage.getItem("user_session") || "{}");
      localStorage.setItem(
        "user_session",
        JSON.stringify({
          ...s,
          perfil: PERFIL_TREINAMENTO_PRODUTOS,
          tipoUsuario: PERFIL_TREINAMENTO_PRODUTOS,
          matricula: "E72",
          uidKey: "euclecio"
        })
      );
      user = obterUsuarioLogado();
    } catch {}
  }

  if (isProdutos && rotaAtualEhExclusivaSV()) {
    window.location.replace(resolverMenuProdutos());
    return null;
  }

  // Se Alex (ou outro) está no menu_alex, volta ao menu normal
  const path = decodeURIComponent(window.location.pathname || "").toLowerCase();
  if (!isProdutos && /menu_alex\.html/i.test(path)) {
    window.location.replace(path.includes("html") ? "menu.html?v=20260720e" : "html menus/menu.html?v=20260720e");
    return null;
  }

  if (isProdutos && /menu\.html$/i.test(path) && !/menu_alex\.html$/i.test(path)) {
    window.location.replace("menu_alex.html?v=20260720e");
    return null;
  }

  const btnMenu = document.getElementById("btnMenu");
  if (btnMenu && isProdutos) {
    btnMenu.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        window.location.href = resolverMenuProdutos();
      },
      true
    );
  }

  return user;
}

function resolverMenuProdutos() {
  const path = decodeURIComponent(window.location.pathname || "");
  if (/html\s*menus/i.test(path)) return "menu_alex.html?v=20260720e";
  if (/html\s*usuarios\/alex/i.test(path)) return "../../html menus/menu_alex.html?v=20260720e";
  if (/html\s*usuarios/i.test(path)) return "../html menus/menu_alex.html?v=20260720e";
  if (/html\s*adm/i.test(path)) return "../html menus/menu_alex.html?v=20260720e";
  return destinoMenuPorPerfil(PERFIL_TREINAMENTO_PRODUTOS, { fromRoot: true, encoded: false });
}

aplicarGuardPortal();
