/**
 * Guard do portal — menu exclusivo para Alex e Euclecio.
 */
import {
  garantirPerfilNaSessao,
  obterUsuarioLogado,
  destinoMenuPorPerfil,
  rotaAtualEhExclusivaSV,
  PERFIL_TREINAMENTO_PRODUTOS,
  isIdentidadeMenuProdutos,
  normalizarSessaoMenuProdutos
} from "./perfil-acesso.js";

export function aplicarGuardPortal() {
  garantirPerfilNaSessao();
  let user = obterUsuarioLogado();
  if (!user) return null;

  const isProdutos = isIdentidadeMenuProdutos(user);

  if (isProdutos && user.perfil !== PERFIL_TREINAMENTO_PRODUTOS) {
    try {
      localStorage.setItem(
        "user_session",
        JSON.stringify(normalizarSessaoMenuProdutos(
          JSON.parse(localStorage.getItem("user_session") || "{}"),
          user.nome
        ))
      );
      user = obterUsuarioLogado();
    } catch {}
  }

  // Outros com perfil errado → analista
  if (!isProdutos && (user.perfil === PERFIL_TREINAMENTO_PRODUTOS || user.perfil === "alex_produtos")) {
    try {
      const s = JSON.parse(localStorage.getItem("user_session") || "{}");
      localStorage.setItem("user_session", JSON.stringify({
        ...s,
        perfil: "analista",
        tipoUsuario: "analista"
      }));
      user = obterUsuarioLogado();
    } catch {}
  }

  if (isProdutos && rotaAtualEhExclusivaSV()) {
    window.location.replace(resolverMenuProdutos());
    return null;
  }

  const path = decodeURIComponent(window.location.pathname || "").toLowerCase();
  if (!isProdutos && /menu_alex\.html/i.test(path)) {
    window.location.replace(/html\s*menus/i.test(path) ? "menu.html?v=20260720g" : "html menus/menu.html?v=20260720g");
    return null;
  }

  if (isProdutos && /menu\.html$/i.test(path) && !/menu_alex\.html$/i.test(path)) {
    window.location.replace("menu_alex.html?v=20260720g");
    return null;
  }

  const btnMenu = document.getElementById("btnMenu");
  if (btnMenu && isProdutos) {
    btnMenu.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = resolverMenuProdutos();
    }, true);
  }

  return user;
}

function resolverMenuProdutos() {
  const path = decodeURIComponent(window.location.pathname || "");
  if (/html\s*menus/i.test(path)) return "menu_alex.html?v=20260720g";
  if (/html\s*usuarios\/alex/i.test(path)) return "../../html menus/menu_alex.html?v=20260720g";
  if (/html\s*usuarios/i.test(path)) return "../html menus/menu_alex.html?v=20260720g";
  if (/html\s*adm/i.test(path)) return "../html menus/menu_alex.html?v=20260720g";
  return destinoMenuPorPerfil(PERFIL_TREINAMENTO_PRODUTOS, { fromRoot: true, encoded: false });
}

aplicarGuardPortal();
