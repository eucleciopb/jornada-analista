import { escapeHtml, logout, requireUser } from "./usuario.js";

function navItems(active) {
  return [
    { href: "../html menus/menu.html", label: "Dashboard", ico: "📊", key: "dashboard" },
    { href: "../html usuarios/criar-agenda.html", label: "Criar Agenda", ico: "➕", key: "agenda-criar" },
    { href: "../html usuarios/agenda.html", label: "Agenda", ico: "📅", key: "agenda" },
    { href: "../html usuarios/treinamentos.html", label: "Treinamentos", ico: "🎓", key: "treinamentos" },
    { href: "../aprendizado/", label: "Aprendizado", ico: "📖", key: "aprendizado" },
    { href: "../html usuarios/resultados.html", label: "Resultados", ico: "📈", key: "resultados" },
    { href: "../html usuarios/avaliacao-matinal-geral.html", label: "Avaliar Matinal", ico: "⭐", key: "matinal" },
    { href: "../html usuarios/biblioteca-treinamentos.html", label: "Biblioteca", ico: "📚", key: "biblioteca" },
    { href: "../html usuarios/links-uteis.html", label: "Links Úteis", ico: "🔗", key: "links" },
    { href: "../html usuarios/acompanhamento-entregas.html", label: "Minhas Entregas", ico: "📦", key: "entregas" }
  ].map((item) => ({ ...item, active: item.key === active }));
}

function bottomItems(active) {
  return [
    { href: "../html menus/menu.html", label: "Dash", ico: "D", key: "dashboard" },
    { href: "../html usuarios/agenda.html", label: "Agenda", ico: "A", key: "agenda" },
    { href: "../html usuarios/treinamentos.html", label: "Treinos", ico: "T", key: "treinamentos" },
    { href: "../aprendizado/", label: "Aprender", ico: "L", key: "aprendizado" },
    { href: "../html usuarios/biblioteca-treinamentos.html", label: "Biblioteca", ico: "B", key: "biblioteca" }
  ].map((item) => ({ ...item, active: item.key === active }));
}

export function mountPortal({
  active = "aprendizado",
  title = "Aprendizado",
  subtitle = "Olá,",
  date = true
} = {}) {
  const user = requireUser();
  const root = document.getElementById("portalRoot");
  if (!root) throw new Error("portalRoot não encontrado.");

  const links = navItems(active).map((item) => `
    <a class="side-link${item.active ? " active" : ""}" href="${item.href}">
      <span class="nav-ico">${item.ico}</span>${escapeHtml(item.label)}
    </a>
  `).join("");

  const bottoms = bottomItems(active).map((item) => `
    <a class="${item.active ? "active" : ""}" href="${item.href}">
      <span class="ico">${item.ico}</span><span>${escapeHtml(item.label)}</span>
    </a>
  `).join("");

  const dataLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  root.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <div class="portal-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-logo">GP</div>
          <div>
            <h2>Jornada</h2>
            <small>Portal do Analista</small>
          </div>
        </div>
        <div class="user-card">
          <div class="avatar">${escapeHtml(user.nome.trim().charAt(0).toUpperCase())}</div>
          <div class="user-meta">
            <small>Analista</small>
            <strong>${escapeHtml(user.nome)}</strong>
          </div>
        </div>
        <nav class="side-nav">${links}</nav>
        <div class="side-footer">
          <button id="btnLogoutSide" class="logout-side" type="button">Sair do Sistema</button>
        </div>
      </aside>
      <main class="main">
        <header class="top-header">
          <div class="hello">
            <small>${escapeHtml(subtitle)}</small>
            <h1 id="welcomeText">${escapeHtml(title)}</h1>
          </div>
          ${date ? `<span class="header-date">${escapeHtml(dataLabel)}</span>` : ""}
          <div class="mobile-logo">GP</div>
        </header>
        <div class="content" id="pageContent"></div>
      </main>
    </div>
    <button class="mobile-toggle" id="mobileToggle" type="button" aria-label="Abrir menu">☰</button>
    <nav class="bottom-nav">
      ${bottoms}
      <button id="btnLogoutMobile" type="button"><span class="ico">S</span><span>Sair</span></button>
    </nav>
  `;

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("mobileToggle");

  function toggleSidebar(open) {
    sidebar?.classList.toggle("open", open);
    overlay?.classList.toggle("open", open);
  }

  toggle?.addEventListener("click", () => toggleSidebar(!sidebar?.classList.contains("open")));
  overlay?.addEventListener("click", () => toggleSidebar(false));
  document.getElementById("btnLogoutSide")?.addEventListener("click", logout);
  document.getElementById("btnLogoutMobile")?.addEventListener("click", logout);

  return {
    user,
    content: document.getElementById("pageContent"),
    setTitle(text) {
      const el = document.getElementById("welcomeText");
      if (el) el.textContent = text;
    }
  };
}
