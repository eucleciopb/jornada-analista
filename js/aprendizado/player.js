import { flattenAulas, getCursoMeta, isLessonUnlocked, loadCursoConteudo } from "./cursos.js";
import { bindActivities, renderAula } from "./render-aula.js";
import {
  completeLesson,
  computePercent,
  courseProgress,
  deriveStatus,
  lessonStatus,
  loadProgress,
  resumeLessonId,
  saveAnswer,
  saveProgress,
  startCourse,
  statusLabel
} from "./progresso.js";
import { escapeHtml, requireUser } from "./usuario.js";

const user = requireUser();
const params = new URLSearchParams(location.search);
const courseId = params.get("curso") || "integracao-atv";
const meta = getCursoMeta(courseId);

if (!meta) {
  location.replace("./");
  throw new Error("Curso não encontrado.");
}

const loaded = await loadCursoConteudo(courseId);
const CURSO = loaded.CURSO;
const aulas = flattenAulas(CURSO);
const aulaIds = aulas.map((a) => a.id);

let state = await loadProgress(user);
let currentId = params.get("aula") || resumeLessonId(courseProgress(state, courseId), aulaIds) || aulaIds[0];

function currentIndex() {
  const idx = aulas.findIndex((a) => a.id === currentId);
  return idx < 0 ? 0 : idx;
}

function persist(next, immediate = false) {
  state = saveProgress(user, next, { immediate });
}

function progressNow() {
  const p = courseProgress(state, courseId);
  return {
    progress: p,
    percent: computePercent(p, aulas.length),
    status: deriveStatus(p, aulas.length)
  };
}

function setUrl(lessonId) {
  const url = new URL(location.href);
  url.searchParams.set("curso", courseId);
  url.searchParams.set("aula", lessonId);
  history.replaceState({}, "", url);
}

function openTrack(open) {
  document.getElementById("learnTrack")?.classList.toggle("open", open);
  document.getElementById("trackBackdrop")?.classList.toggle("open", open);
}

function renderTrack() {
  const { progress, percent } = progressNow();
  const completed = progress.completed;
  const groups = CURSO.modulos.map((modulo) => {
    const items = modulo.aulas.map((aula) => {
      const idx = aulas.findIndex((a) => a.id === aula.id);
      const unlocked = isLessonUnlocked(aulas, idx, completed);
      const status = lessonStatus(progress, aula.id, unlocked);
      const current = aula.id === currentId;
      const nextHighlight = progress.completed.includes(currentId) && aulas[currentIndex() + 1]?.id === aula.id;
      const cls = [
        "lesson-link",
        current ? "is-current" : "",
        nextHighlight ? "is-next" : "",
        status === "concluida" ? "is-done" : "",
        status === "em_andamento" ? "is-progress" : ""
      ].filter(Boolean).join(" ");
      const label = status === "concluida" ? "Concluída" : status === "em_andamento" ? "Em andamento" : unlocked ? "Não iniciada" : "Bloqueada";
      return `
        <button class="${cls}" type="button" data-lesson="${escapeHtml(aula.id)}" ${unlocked ? "" : "disabled"}>
          <span class="lesson-dot" aria-hidden="true"></span>
          <span>
            ${escapeHtml(aula.titulo)}
            <small style="display:block;color:#64748b;font-weight:700;margin-top:2px;">${label}</small>
          </span>
        </button>
      `;
    }).join("");

    const done = modulo.aulas.filter((a) => completed.includes(a.id)).length;
    return `
      <div class="module-group">
        <button class="module-toggle" type="button" data-module="${escapeHtml(modulo.id)}">
          <span>
            <strong>Módulo ${modulo.numero} — ${escapeHtml(modulo.titulo)}</strong>
            <small>${done}/${modulo.aulas.length} aulas · ${escapeHtml(modulo.objetivo)}</small>
          </span>
        </button>
        <div class="module-lessons">${items}</div>
      </div>
    `;
  }).join("");

  document.getElementById("learnTrack").innerHTML = `
    <div class="learn-track-head">
      <h2>${escapeHtml(CURSO.titulo)}</h2>
      <p>${percent}% concluído · ${statusLabel(progressNow().status)}</p>
      <div class="progress" aria-hidden="true"><span style="width:${percent}%"></span></div>
    </div>
    ${groups}
  `;

  document.querySelectorAll("[data-lesson]").forEach((btn) => {
    btn.addEventListener("click", () => {
      goTo(btn.dataset.lesson);
      openTrack(false);
    });
  });

  document.querySelectorAll("[data-module]").forEach((btn) => {
    const group = btn.closest(".module-group");
    const currentModule = aulas[currentIndex()]?.moduleId;
    const open = btn.dataset.module === currentModule;
    group?.classList.toggle("is-collapsed", !open);
    btn.addEventListener("click", () => {
      group?.classList.toggle("is-collapsed");
    });
  });
}

function renderLesson() {
  const aula = aulas[currentIndex()];
  const idx = currentIndex();
  const { progress, percent } = progressNow();
  const unlocked = isLessonUnlocked(aulas, idx, progress.completed);
  if (!unlocked) {
    currentId = resumeLessonId(progress, aulaIds);
  }
  const atual = aulas[currentIndex()];
  persist(startCourse(state, courseId, atual.id));

  const stage = document.getElementById("learnStage");
  const next = aulas[idx + 1];
  const prev = aulas[idx - 1];
  const done = progress.completed.includes(atual.id);
  const nextUnlocked = done && next;

  stage.innerHTML = `
    <div class="learn-toolbar">
      <a class="btn-secondary" href="./">Voltar ao Aprendizado</a>
      <button class="btn-secondary mobile-modules-btn" id="btnModules" type="button">Módulos e aulas</button>
      <span class="course-chip info">${percent}% do curso</span>
    </div>
    <article class="learn-lesson" id="lessonArticle">${renderAula(atual)}</article>
    <div class="learn-nav">
      <button class="btn-secondary" id="btnPrev" type="button" ${prev ? "" : "disabled"}>Aula anterior</button>
      <button class="btn-primary" id="btnComplete" type="button">${done ? "Aula concluída" : "Marcar como concluída"}</button>
      <button class="btn-secondary" id="btnNext" type="button" ${next && (done || nextUnlocked || progress.completed.includes(next.id) || isLessonUnlocked(aulas, idx + 1, progress.completed)) ? "" : "disabled"}>Próxima aula</button>
    </div>
  `;

  bindActivities(stage, atual, progress.answers[atual.id], (answer) => {
    persist(saveAnswer(state, courseId, atual.id, answer));
  });

  document.getElementById("btnModules")?.addEventListener("click", () => openTrack(true));
  document.getElementById("btnPrev")?.addEventListener("click", () => prev && goTo(prev.id));
  document.getElementById("btnNext")?.addEventListener("click", () => {
    if (!next) return;
    if (!isLessonUnlocked(aulas, idx + 1, courseProgress(state, courseId).completed)) return;
    goTo(next.id);
  });
  document.getElementById("btnComplete")?.addEventListener("click", () => {
    persist(completeLesson(state, courseId, atual.id, aulas.length), true);
    renderLesson();
  });

  setUrl(atual.id);
  document.title = `${atual.titulo} | ${CURSO.titulo}`;
  renderTrack();
}

function goTo(lessonId) {
  currentId = lessonId;
  renderLesson();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("trackBackdrop")?.addEventListener("click", () => openTrack(false));
renderLesson();
