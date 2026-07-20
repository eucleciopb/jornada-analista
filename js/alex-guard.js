/**
 * Snippet leve para páginas gerais do portal.
 * - Redireciona identidade Alex para menu_alex
 * - Bloqueia rotas exclusivas de SV
 * - Ajusta botão "Voltar ao Menu"
 */
import {
  garantirPerfilNaSessao,
  obterUsuarioLogado,
  destinoMenuPorPerfil,
  rotaAtualEhExclusivaSV,
  PERFIL_TREINAMENTO_PRODUTOS,
  isIdentidadeAlex
} from "./perfil-acesso.js";

export function aplicarGuardPortal() {
  garantirPerfilNaSessao();
  let user = obterUsuarioLogado();
  if (!user) return null;

  const isAlex = user.isTreinamentoProdutos || isIdentidadeAlex(user);

  if (isAlex && user.perfil !== PERFIL_TREINAMENTO_PRODUTOS) {
    try {
      const s = JSON.parse(localStorage.getItem("user_session") || "{}");
      localStorage.setItem(
        "user_session",
        JSON.stringify({
          ...s,
          perfil: PERFIL_TREINAMENTO_PRODUTOS,
          tipoUsuario: PERFIL_TREINAMENTO_PRODUTOS,
          matricula: "A70",
          uidKey: "alex"
        })
      );
      user = obterUsuarioLogado();
    } catch {}
  }

  if (isAlex && rotaAtualEhExclusivaSV()) {
    window.location.replace(resolverMenuAlex());
    return null;
  }

  const path = decodeURIComponent(window.location.pathname || "").toLowerCase();
  if (isAlex && /menu\.html$/i.test(path) && !/menu_alex\.html$/i.test(path)) {
    window.location.replace("menu_alex.html?v=20260720c");
    return null;
  }

  const btnMenu = document.getElementById("btnMenu");
  if (btnMenu && isAlex) {
    btnMenu.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        window.location.href = resolverMenuAlex();
      },
      true
    );
  }

  return user;
}

function resolverMenuAlex() {
  const path = decodeURIComponent(window.location.pathname || "");
  if (/html\s*menus/i.test(path)) return "menu_alex.html?v=20260720c";
  if (/html\s*usuarios\/alex/i.test(path)) return "../../html menus/menu_alex.html?v=20260720c";
  if (/html\s*usuarios/i.test(path)) return "../html menus/menu_alex.html?v=20260720c";
  if (/html\s*adm/i.test(path)) return "../html menus/menu_alex.html?v=20260720c";
  return destinoMenuPorPerfil(PERFIL_TREINAMENTO_PRODUTOS, { fromRoot: true, encoded: false });
}

aplicarGuardPortal();
