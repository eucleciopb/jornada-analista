import { CURSOS, flattenAulas, loadCursoConteudo } from "./cursos.js";
import { mountPortal } from "./portal.js";
import {
  computePercent,
  courseProgress,
  deriveStatus,
  loadProgress,
  statusLabel
} from "./progresso.js";
import { escapeHtml } from "./usuario.js";

const { user, content } = mountPortal({
  active: "aprendizado",
  title: "Aprendizado",
  subtitle: "Área de aprendizagem"
});

content.innerHTML = `
  <section class="learn-hero">
    <h2>Aprendizado</h2>
    <p>Conteúdos práticos para você dominar a operação, desenvolver pessoas e transformar informação em resultado.</p>
  </section>
  <section class="learn-grid" id="cursosGrid">
    <div class="learn-empty">Carregando cursos...</div>
  </section>
`;

const state = await loadProgress(user);
const grid = document.getElementById("cursosGrid");

const cards = [];
for (const curso of CURSOS) {
  let totalAulas = 0;
  let totalModulos = 0;
  try {
    const mod = await loadCursoConteudo(curso.id);
    totalModulos = (mod.CURSO.modulos || []).length;
    totalAulas = flattenAulas(mod.CURSO).length;
  } catch {
    totalAulas = 0;
    totalModulos = 0;
  }
  const progress = courseProgress(state, curso.id);
  const status = deriveStatus(progress, totalAulas);
  const percent = computePercent(progress, totalAulas);
  const statusClass = status === "concluido" ? "ok" : status === "em_andamento" ? "warn" : "info";
  const cta = status === "nao_iniciado" ? "Começar integração" : "Continuar integração";
  const resume = progress.lastLessonId ? `&aula=${encodeURIComponent(progress.lastLessonId)}` : "";

  cards.push(`
    <article class="course-card">
      <div class="course-cover">
        <img src="${curso.capa}" alt="Capa ${escapeHtml(curso.titulo)}" />
        <span class="course-cover-badge">${escapeHtml(curso.selo)}</span>
      </div>
      <div class="course-body">
        <div>
          <div class="course-kicker">Curso em destaque</div>
          <h3>${escapeHtml(curso.titulo)}</h3>
        </div>
        <p class="course-sub">${escapeHtml(curso.subtitulo)}</p>
        <p class="course-desc">${escapeHtml(curso.descricao)}</p>
        <div class="course-meta">
          <span class="course-chip ${statusClass}">${statusLabel(status)}</span>
          <span class="course-chip">${totalModulos} módulos</span>
          <span class="course-chip">${totalAulas} aulas</span>
        </div>
        <div class="course-progress">
          <div class="course-progress-row">
            <span>Progresso</span>
            <span>${percent}%</span>
          </div>
          <div class="progress" aria-hidden="true"><span style="width:${percent}%"></span></div>
        </div>
        <div class="course-actions">
          <a class="btn-primary" href="${curso.player}${resume}">${cta}</a>
        </div>
      </div>
    </article>
  `);
}

grid.innerHTML = cards.join("") || `<div class="learn-empty">Nenhum curso publicado ainda.</div>`;
