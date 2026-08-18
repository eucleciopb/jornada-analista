/**
 * Identidade do usuário logado — reutiliza a sessão já usada no portal.
 */

export function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

export function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCurrentUser() {
  const rawSession = localStorage.getItem("user_session");

  if (rawSession) {
    const s = safeParse(rawSession);
    const nome = String(s?.nome || s?.usuario || s?.name || "").trim();
    if (nome) {
      return {
        nome,
        perfil: String(s.perfil || "analista"),
        matricula: String(s.matricula || ""),
        uidKey: slug(s.uidKey || nome)
      };
    }
  }

  const fallbacks = ["usuarioLogado", "analistaLogado", "usuarioSelecionado"];
  for (const key of fallbacks) {
    const nome = (localStorage.getItem(key) || "").trim();
    if (nome) return { nome, perfil: "analista", matricula: "", uidKey: slug(nome) };
  }

  return null;
}

export function pathIndex() {
  return "../index.html";
}

export function pathMenu() {
  try {
    const s = safeParse(localStorage.getItem("user_session") || "null");
    const perfil = String(s?.perfil || "").toLowerCase();
    const mat = String(s?.matricula || "").toUpperCase();
    const nome = String(s?.nome || "").trim().toLowerCase();
    const uid = String(s?.uidKey || "").toLowerCase();
    const isProdutos =
      nome === "alex" || nome === "euclecio" ||
      ["a70", "alex", "e72", "euclecio"].includes(mat.toLowerCase()) ||
      uid === "alex" || uid === "euclecio" ||
      perfil === "treinamento_produtos";
    if (isProdutos) return "../html menus/menu_alex.html";
  } catch {}
  return "../html menus/menu.html";
}

export function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("user_session");
  localStorage.removeItem("analistaLogado");
  localStorage.removeItem("usuarioSelecionado");
  window.location.href = pathIndex();
}

export function requireUser() {
  const user = getCurrentUser();
  if (!user || !user.nome) {
    window.location.href = pathIndex();
    throw new Error("Usuário não encontrado no localStorage.");
  }
  return user;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
