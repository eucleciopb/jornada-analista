/**
 * Guard do portal — menu exclusivo somente para Euclecio (treinamento_produtos).
 */
import {
  garantirPerfilNaSessao,
  obterUsuarioLogado,
  destinoMenuPorPerfil,
  rotaAtualEhExclusivaSV,
  PERFIL_TREINAMENTO_PRODUTOS,
  resolverPerfil
} from "./perfil-acesso.js";

export function aplicarGuardPortal() {
  garantirPerfilNaSessao();
  let user = obterUsuarioLogado();
  if (!user) return null;

  const isProdutos = resolverPerfil(user) === PERFIL_TREINAMENTO_PRODUTOS;

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

  const path = decodeURIComponent(window.location.pathname || "").toLowerCase();
  if (isProdutos && /menu\.html$/i.test(path) && !/menu_alex\.html$/i.test(path)) {
    window.location.replace("menu_alex.html?v=20260720d");
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
  if (/html\s*menus/i.test(path)) return "menu_alex.html?v=20260720d";
  if (/html\s*usuarios\/alex/i.test(path)) return "../../html menus/menu_alex.html?v=20260720d";
  if (/html\s*usuarios/i.test(path)) return "../html menus/menu_alex.html?v=20260720d";
  if (/html\s*adm/i.test(path)) return "../html menus/menu_alex.html?v=20260720d";
  return destinoMenuPorPerfil(PERFIL_TREINAMENTO_PRODUTOS, { fromRoot: true, encoded: false });
}

aplicarGuardPortal();
