/**
 * Shell compartilhado do portal Alex (sidebar, header, gate, logout).
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  parseDataNascimento,
  salvarDataNascimento,
  marcarNascimentoNaSessao,
  buscarDataNascimentoSalva,
  isAniversarioNoMes,
  mensagemAniversario,
  nomeMes
} from "../aniversario.js?v=20260720a";

import {
  obterUsuarioLogado,
  protegerPagina,
  limparSessao,
  caminhoLogin,
  PERFIL_TREINAMENTO_PRODUTOS,
  garantirPerfilNaSessao
} from "../perfil-acesso.js?v=20260720a";

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDN7RF9UiFyDAFXsPsVQwSRONJB0t1Xpqg",
  authDomain: "jornada-portal.firebaseapp.com",
  projectId: "jornada-portal",
  storageBucket: "jornada-portal.firebasestorage.app",
  messagingSenderId: "669362296644",
  appId: "1:669362296644:web:f590d9834a8e4e60012911"
};

let _app = null;
let _db = null;

export function getDb() {
  if (!_app) {
    _app = initializeApp(FIREBASE_CONFIG);
    _db = getFirestore(_app);
  }
  return _db;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * @param {object} opts
 * @param {'menus'|'usuarios'|'alex'} opts.base — onde a página está
 * @param {string} opts.active — id do item ativo
 * @param {string} [opts.title]
 * @param {boolean} [opts.requireAlex=true]
 */
export async function initAlexShell(opts = {}) {
  garantirPerfilNaSessao();

  const base = opts.base || "alex";
  const user = protegerPagina({
    exigirPerfis: opts.requireAlex === false ? null : [PERFIL_TREINAMENTO_PRODUTOS, "admin"],
    bloquearSvParaAlex: true,
    fromRoot: false
  });
  if (!user) return null;

  const paths = resolverPaths(base);
  injetarShellHtml(paths, opts.active || "visao", user, opts.title);
  bindShellEvents(paths);
  await aplicarGateNascimento(user);

  return { user, db: getDb(), paths };
}

function resolverPaths(base) {
  if (base === "menus") {
    return {
      menu: "menu_alex.html",
      login: "../index.html",
      alex: "../html usuarios/alex/",
      usuarios: "../html usuarios/",
      aniversariantes: "../html usuarios/alex/aniversariantes.html",
      cssRoot: "../"
    };
  }
  if (base === "usuarios") {
    return {
      menu: "../html menus/menu_alex.html",
      login: "../index.html",
      alex: "alex/",
      usuarios: "./",
      aniversariantes: "alex/aniversariantes.html",
      cssRoot: "../"
    };
  }
  // alex pages
  return {
    menu: "../../html menus/menu_alex.html",
    login: "../../index.html",
    alex: "./",
    usuarios: "../",
    aniversariantes: "./aniversariantes.html",
    cssRoot: "../../"
  };
}

function navItems(paths) {
  // Menu simplificado: resumo + recursos já existentes do portal
  return [
    { id: "visao", label: "Resumo", href: paths.menu, group: "Início" },
    { id: "treinamentos", label: "Treinamentos", href: `${paths.usuarios}treinamentos.html`, group: "Treinamentos" },
    { id: "criar-agenda", label: "Criar Agenda", href: `${paths.usuarios}criar-agenda.html`, group: "Organização" },
    { id: "agenda", label: "Agenda", href: `${paths.usuarios}agenda.html`, group: "Organização" },
    { id: "biblioteca", label: "Biblioteca", href: `${paths.usuarios}biblioteca-treinamentos.html`, group: "Organização" },
    { id: "links", label: "Links Úteis", href: `${paths.usuarios}links-uteis.html`, group: "Organização" }
  ];
}

function injetarShellHtml(paths, activeId, user, title) {
  if (document.getElementById("alexSidebar")) return;

  const items = navItems(paths);
  const groups = {};
  items.forEach((it) => {
    if (!groups[it.group]) groups[it.group] = [];
    groups[it.group].push(it);
  });

  let navHtml = "";
  Object.keys(groups).forEach((g) => {
    navHtml += `<div class="nav-group-label">${escapeHtml(g)}</div>`;
    groups[g].forEach((it) => {
      const cls = it.id === activeId ? "side-link active" : "side-link";
      navHtml += `<a class="${cls}" href="${it.href}"><span class="nav-dot"></span>${escapeHtml(it.label)}</a>`;
    });
  });

  const overlay = `
  <div id="birthGateOverlay" class="birth-gate-overlay" aria-modal="true" role="dialog">
    <div class="login-card nasc-card birth-gate-card">
      <div class="logo-box">GP</div>
      <h2>Complete seu perfil</h2>
      <p class="hint">Informe sua data de nascimento para liberar o menu.</p>
      <div class="nasc-user" id="birthGateUser">—</div>
      <form id="birthGateForm" class="nasc-form" autocomplete="off" novalidate>
        <div class="form-group">
          <label for="birthGateInput">Data de nascimento</label>
          <input id="birthGateInput" type="text" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" required />
        </div>
        <button id="birthGateSave" class="btn-primary" type="submit">Salvar e continuar</button>
      </form>
      <p id="birthGateMsg" class="msg" role="status"></p>
    </div>
  </div>`;

  const existing = Array.from(document.body.children).filter(
    (el) => el.tagName !== "SCRIPT"
  );

  document.body.insertAdjacentHTML("afterbegin", overlay);

  const overlayEl = document.createElement("div");
  overlayEl.className = "sidebar-overlay";
  overlayEl.id = "sidebarOverlay";
  document.body.appendChild(overlayEl);

  const shell = document.createElement("div");
  shell.className = "portal-shell alex-shell";
  shell.innerHTML = `
    <aside class="sidebar" id="alexSidebar">
      <div class="brand">
        <div class="brand-logo">GP</div>
        <div>
          <h2>Jornada</h2>
          <small>Treinamentos de Produtos</small>
        </div>
      </div>
      <div class="user-card">
        <div class="avatar">${escapeHtml((user.nome || "?").charAt(0).toUpperCase())}</div>
        <div class="user-meta">
          <small>Perfil produtos</small>
          <strong>${escapeHtml(user.nome)}</strong>
        </div>
      </div>
      <nav class="side-nav">${navHtml}</nav>
      <div class="side-footer">
        <button id="btnLogoutSide" class="logout-side" type="button">Sair</button>
      </div>
    </aside>
    <main class="main">
      <header class="top-header">
        <button type="button" class="mobile-toggle" id="mobileToggle" aria-label="Menu">☰</button>
        <div class="hello">
          <small>${escapeHtml(title || "Portal")}</small>
          <h1 id="welcomeText">${escapeHtml(user.nome)}</h1>
        </div>
        <span class="header-date" id="headerDate"></span>
        <div class="mobile-logo">GP</div>
      </header>
      <div class="content" id="alexContentHost"></div>
      <nav class="bottom-nav" id="bottomNav">
        <a href="${paths.menu}" class="${activeId === "visao" ? "active" : ""}"><span>Resumo</span></a>
        <a href="${paths.usuarios}treinamentos.html" class="${activeId === "treinamentos" ? "active" : ""}"><span>Treinos</span></a>
        <a href="${paths.usuarios}agenda.html"><span>Agenda</span></a>
        <button id="btnLogoutMobile" type="button"><span>Sair</span></button>
      </nav>
    </main>`;

  document.body.appendChild(shell);

  const host = document.getElementById("alexContentHost");
  existing.forEach((el) => {
    if (el.id === "birthGateOverlay") return;
    host.appendChild(el);
  });

  document.body.classList.add("theme-user", "portal-page", "alex-portal");
  if (!document.body.classList.contains("gate-pending")) {
    document.body.classList.add("gate-pending");
  }

  const headerDate = document.getElementById("headerDate");
  if (headerDate) {
    headerDate.textContent = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }
}

function bindShellEvents(paths) {
  const sidebar = document.getElementById("alexSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("mobileToggle");

  function toggleSidebar(open) {
    sidebar?.classList.toggle("open", open);
    overlay?.classList.toggle("open", open);
  }

  toggle?.addEventListener("click", () => toggleSidebar(!sidebar?.classList.contains("open")));
  overlay?.addEventListener("click", () => toggleSidebar(false));

  function logout() {
    limparSessao();
    window.location.href = paths.login;
  }

  document.getElementById("btnLogoutSide")?.addEventListener("click", logout);
  document.getElementById("btnLogoutMobile")?.addEventListener("click", logout);
}

async function aplicarGateNascimento(user) {
  const db = getDb();
  const fs = { doc, getDoc, setDoc, serverTimestamp };
  const birthGateOverlay = document.getElementById("birthGateOverlay");
  const birthGateUser = document.getElementById("birthGateUser");
  const birthGateForm = document.getElementById("birthGateForm");
  const birthGateInput = document.getElementById("birthGateInput");
  const birthGateSave = document.getElementById("birthGateSave");
  const birthGateMsg = document.getElementById("birthGateMsg");

  function setBirthMsg(text, ok = false) {
    if (!birthGateMsg) return;
    birthGateMsg.textContent = text || "";
    birthGateMsg.classList.toggle("ok", Boolean(ok));
  }

  function liberarMenu(iso) {
    if (iso) marcarNascimentoNaSessao(iso);
    birthGateOverlay?.classList.add("is-done");
    document.body.classList.remove("gate-pending");
  }

  function mascararData(valor) {
    const digits = String(valor || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  birthGateInput?.addEventListener("input", () => {
    birthGateInput.value = mascararData(birthGateInput.value);
    setBirthMsg("");
  });

  birthGateForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsed = parseDataNascimento(birthGateInput?.value);
    if (!parsed) {
      setBirthMsg("Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }
    if (birthGateSave) birthGateSave.disabled = true;
    setBirthMsg("Salvando...", true);
    try {
      await salvarDataNascimento(db, fs, user.nome, parsed, {
        perfil: PERFIL_TREINAMENTO_PRODUTOS
      });
      liberarMenu(parsed.dataNascimento);
      setBirthMsg("Salvo!", true);
      mostrarBannerAniversario(user.nome, parsed.dataNascimento);
    } catch (err) {
      console.error(err);
      setBirthMsg(err?.message || "Não foi possível salvar.");
      if (birthGateSave) birthGateSave.disabled = false;
    }
  });

  try {
    const dataConfirmada = await buscarDataNascimentoSalva(db, fs, user.nome);
    if (dataConfirmada) {
      liberarMenu(dataConfirmada);
      mostrarBannerAniversario(user.nome, dataConfirmada);
    } else {
      if (birthGateUser) birthGateUser.textContent = user.nome;
      birthGateOverlay?.classList.remove("is-done");
      document.body.classList.add("gate-pending");
    }
  } catch (err) {
    console.error(err);
    if (birthGateUser) birthGateUser.textContent = user.nome;
    setBirthMsg("Não foi possível verificar no banco.");
  }
}

function mostrarBannerAniversario(nome, iso) {
  try {
    if (!iso || !isAniversarioNoMes(iso)) return;
    let banner = document.getElementById("birthdayBanner");
    if (!banner) {
      const host = document.getElementById("alexContentHost");
      if (!host) return;
      host.insertAdjacentHTML(
        "afterbegin",
        `<div id="birthdayBanner" class="birthday-banner is-visible" role="status">
          <div class="bday-ico" aria-hidden="true">🎂</div>
          <div class="bday-text">
            <strong id="birthdayTitle"></strong>
            <span id="birthdaySubtitle"></span>
          </div>
        </div>`
      );
      banner = document.getElementById("birthdayBanner");
    }
    const title = document.getElementById("birthdayTitle");
    const subtitle = document.getElementById("birthdaySubtitle");
    if (title) title.textContent = mensagemAniversario(nome);
    if (subtitle) subtitle.textContent = `Celebramos com você durante todo o mês de ${nomeMes(new Date().getMonth() + 1)}.`;
    banner?.classList.add("is-visible");
  } catch (err) {
    console.warn(err);
  }
}

/** Garante redirect do menu correto em páginas gerais usadas pelo Alex */
export function patchMenuLinksForAlex() {
  const user = obterUsuarioLogado();
  if (!user?.isTreinamentoProdutos) return;

  const menuPath = (() => {
    const path = decodeURIComponent(window.location.pathname);
    if (/html\s*usuarios\/alex/i.test(path)) return "../../html menus/menu_alex.html";
    if (/html\s*usuarios/i.test(path)) return "../html menus/menu_alex.html";
    if (/html\s*menus/i.test(path)) return "menu_alex.html";
    return "html menus/menu_alex.html";
  })();

  document.querySelectorAll('a[href*="menu.html"], button#btnMenu').forEach((el) => {
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (href.includes("menuadm")) return;
      if (href.includes("menu_alex")) return;
      el.setAttribute("href", href.replace(/menu\.html.*/, "menu_alex.html").replace(/html%20menus\/menu\.html.*/, "html%20menus/menu_alex.html"));
      if (!el.getAttribute("href").includes("menu_alex")) el.setAttribute("href", menuPath);
    }
  });

  const btnMenu = document.getElementById("btnMenu");
  if (btnMenu) {
    btnMenu.onclick = () => {
      window.location.href = menuPath;
    };
  }
}

export { obterUsuarioLogado, limparSessao, caminhoLogin };
