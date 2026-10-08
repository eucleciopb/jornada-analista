/**
 * Shell visual do Portal AM — menu lateral + topbar.
 */
import { MENU_ANALISTA, MENU_ACOES, AM_VERSION } from "./config.js";
import { getAmSession, limparSessaoAm, isGestora, resolveHome } from "./auth.js";
import { escapeHtml } from "./db.js";

export function mountAmShell({ activeId = "", title = "", subtitle = "" } = {}) {
  const session = getAmSession();
  if (!session) return null;

  const gestora = isGestora(session);
  const acoes = MENU_ACOES.filter((item) =>
    (item.perfis || []).includes(session.perfil) ||
    (gestora && item.perfis?.some((p) => String(p).startsWith("am_")))
  );

  // Filtra ações pelo perfil real
  const acoesOk = MENU_ACOES.filter((item) => (item.perfis || []).includes(session.perfil));

  ensureStyles();

  const body = document.body;
  body.classList.add("am-portal");

  const existing = document.getElementById("amShellRoot");
  if (existing) existing.remove();

  const root = document.createElement("div");
  root.id = "amShellRoot";
  root.className = "am-shell";
  root.innerHTML = `
    <div class="am-overlay" id="amOverlay"></div>
    <aside class="am-sidebar" id="amSidebar">
      <div class="am-brand">
        <div class="am-logo">AM</div>
        <div>
          <strong>Inteligência de Mercado</strong>
          <small>Portal dos Analistas</small>
        </div>
      </div>
      <div class="am-user">
        <div class="am-avatar">${escapeHtml((session.nome || "?").charAt(0).toUpperCase())}</div>
        <div>
          <div class="am-user-name">${escapeHtml(session.nome)}</div>
          <div class="am-user-role">${escapeHtml(labelPerfil(session.perfil))}</div>
        </div>
      </div>
      <nav class="am-nav">
        <div class="am-nav-label">Principal</div>
        ${MENU_ANALISTA.map((item) => linkHtml(item, activeId)).join("")}
        ${acoesOk.length ? `<div class="am-nav-label">Ações</div>${acoesOk.map((item) => linkHtml(item, activeId)).join("")}` : ""}
      </nav>
      <button type="button" class="am-logout" id="amLogout">Sair</button>
    </aside>
    <div class="am-main">
      <header class="am-topbar">
        <button type="button" class="am-menu-btn" id="amMenuBtn" aria-label="Menu">☰</button>
        <div>
          <h1>${escapeHtml(title || "Portal AM")}</h1>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
        </div>
        <span class="am-badge">${gestora ? "Gestão" : "Analista"}</span>
      </header>
      <div class="am-content" id="amPageHost"></div>
    </div>
  `;

  // Move page content into host
  const pageNodes = [...body.childNodes].filter((n) => n.nodeType === 1 && n.id !== "amShellRoot");
  body.prepend(root);
  const host = root.querySelector("#amPageHost");
  pageNodes.forEach((n) => {
    if (n.tagName === "SCRIPT") return;
    host.appendChild(n);
  });

  root.querySelector("#amMenuBtn")?.addEventListener("click", () => {
    root.classList.toggle("nav-open");
  });
  root.querySelector("#amOverlay")?.addEventListener("click", () => {
    root.classList.remove("nav-open");
  });
  root.querySelector("#amLogout")?.addEventListener("click", () => {
    limparSessaoAm();
    const path = decodeURIComponent(window.location.pathname || "");
    if (/html\s*am|html\s*menus|html\s*vanessa/i.test(path)) {
      window.location.href = "../index11.html";
    } else {
      window.location.href = "index11.html";
    }
  });

  return { session, host, version: AM_VERSION };
}

function linkHtml(item, activeId) {
  const active = item.id === activeId ? " active" : "";
  return `<a class="am-link${active}" href="./${item.href}?v=${AM_VERSION}"><span>${item.icon || "•"}</span><span>${escapeHtml(item.label)}</span></a>`;
}

function labelPerfil(p) {
  if (p === "am_gestora") return "Gestora AM";
  if (p === "am_admin") return "Administrador AM";
  return "Analista AM";
}

function ensureStyles() {
  if (document.getElementById("amPortalCss")) return;
  const link = document.createElement("link");
  link.id = "amPortalCss";
  link.rel = "stylesheet";
  link.href = `../css/pages/am-portal.css?v=${AM_VERSION}`;
  document.head.appendChild(link);
}

export function setMsg(el, text, type = "info") {
  if (!el) return;
  el.textContent = text || "";
  el.className = `am-msg ${type}`;
}

export function emptyState(title, hint) {
  return `<div class="am-empty"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(hint || "")}</p></div>`;
}
