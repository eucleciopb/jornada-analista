/**
 * Guard do portal logística (Ercules).
 */
import {
  garantirPerfilNaSessao,
  obterUsuarioLogado,
  isIdentidadeLogistica,
  normalizarSessaoLogistica,
  rotaAtualPermitidaLogistica,
  PERFIL_LOGISTICA
} from "./perfil-acesso.js";

export function aplicarGuardLogistica() {
  garantirPerfilNaSessao();
  let user = obterUsuarioLogado();
  if (!user) return null;

  if (isIdentidadeLogistica(user) && user.perfil !== PERFIL_LOGISTICA) {
    try {
      localStorage.setItem(
        "user_session",
        JSON.stringify(normalizarSessaoLogistica(
          JSON.parse(localStorage.getItem("user_session") || "{}"),
          user.nome
        ))
      );
      user = obterUsuarioLogado();
    } catch {}
  }

  const path = decodeURIComponent(window.location.pathname || "").toLowerCase();
  const isLog = isIdentidadeLogistica(user) || user.perfil === PERFIL_LOGISTICA;

  if (isLog && /menu\.html$/i.test(path) && !/menu_logistica\.html$/i.test(path)) {
    window.location.replace(resolverMenuLogistica());
    return null;
  }

  if (!isLog && /menu_logistica\.html/i.test(path)) {
    window.location.replace(/html\s*menus/i.test(path) ? "menu.html?v=20261008a" : "html menus/menu.html?v=20261008a");
    return null;
  }

  if (isLog && !rotaAtualPermitidaLogistica()) {
    window.location.replace(resolverMenuLogistica());
    return null;
  }

  const btnMenu = document.getElementById("btnMenu");
  if (btnMenu && isLog) {
    btnMenu.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = resolverMenuLogistica();
    }, true);
  }

  return user;
}

function resolverMenuLogistica() {
  const path = decodeURIComponent(window.location.pathname || "");
  if (/html\s*menus/i.test(path)) return "menu_logistica.html?v=20261008a";
  if (/html\s*usuarios/i.test(path)) return "../html menus/menu_logistica.html?v=20261008a";
  if (/html\s*adm/i.test(path)) return "../html menus/menu_logistica.html?v=20261008a";
  if (/aprendizado/i.test(path)) return "../html menus/menu_logistica.html?v=20261008a";
  return "html menus/menu_logistica.html?v=20261008a";
}

try {
  aplicarGuardLogistica();
} catch (err) {
  console.warn("Guard logística:", err);
}
