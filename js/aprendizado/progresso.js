/**
 * Progresso da trilha de Aprendizado.
 * Fonte local imediata + tentativa de persistência no Firestore
 * (coleção já usada pelo portal: apuracoes_treinamentos).
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDN7RF9UiFyDAFXsPsVQwSRONJB0t1Xpqg",
  authDomain: "jornada-portal.firebaseapp.com",
  projectId: "jornada-portal",
  storageBucket: "jornada-portal.firebasestorage.app",
  messagingSenderId: "669362296644",
  appId: "1:669362296644:web:f590d9834a8e4e60012911"
};

const COL = "apuracoes_treinamentos";
const TIPO = "aprendizado_progresso";

let db = null;
try {
  db = getFirestore(initializeApp(firebaseConfig));
} catch {
  db = null;
}

function localKey(uidKey) {
  return `aprendizado_progresso_${uidKey}`;
}

function docId(uidKey) {
  return `aprendizado_progresso_${uidKey}`;
}

export function emptyCourseProgress() {
  return {
    status: "nao_iniciado",
    startedAt: null,
    completedAt: null,
    lastLessonId: null,
    completed: [],
    started: [],
    answers: {}
  };
}

export function emptyState() {
  return { courses: {}, updatedAt: null };
}

function normalizeCourse(raw) {
  const base = emptyCourseProgress();
  if (!raw || typeof raw !== "object") return base;
  return {
    ...base,
    ...raw,
    completed: Array.isArray(raw.completed) ? raw.completed : [],
    started: Array.isArray(raw.started) ? raw.started : [],
    answers: raw.answers && typeof raw.answers === "object" ? raw.answers : {}
  };
}

function normalizeState(raw) {
  const state = emptyState();
  if (!raw || typeof raw !== "object") return state;
  const courses = raw.courses && typeof raw.courses === "object" ? raw.courses : {};
  const mapped = {};
  for (const [id, value] of Object.entries(courses)) {
    mapped[id] = normalizeCourse(value);
  }
  return { courses: mapped, updatedAt: raw.updatedAt || null };
}

function readLocal(uidKey) {
  try {
    const raw = localStorage.getItem(localKey(uidKey));
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return emptyState();
  }
}

function writeLocal(uidKey, state) {
  localStorage.setItem(localKey(uidKey), JSON.stringify(state));
}

async function readRemote(uidKey) {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COL, docId(uidKey)));
    if (!snap.exists()) return null;
    const data = snap.data() || {};
    return normalizeState(data.progresso || data);
  } catch (err) {
    console.warn("Aprendizado: leitura remota indisponível, usando local.", err);
    return null;
  }
}

let saveTimer = null;

async function writeRemote(uidKey, nome, state) {
  if (!db) return;
  try {
    await setDoc(doc(db, COL, docId(uidKey)), {
      tipo: TIPO,
      uidKey,
      nome,
      progresso: state,
      atualizadoEmMs: Date.now(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Aprendizado: persistência remota indisponível, progresso ficou no dispositivo.", err);
  }
}

function mergeStates(local, remote) {
  if (!remote) return local;
  const ids = new Set([
    ...Object.keys(local.courses || {}),
    ...Object.keys(remote.courses || {})
  ]);
  const courses = {};
  for (const id of ids) {
    const a = normalizeCourse(local.courses[id]);
    const b = normalizeCourse(remote.courses[id]);
    const completed = Array.from(new Set([...a.completed, ...b.completed]));
    const started = Array.from(new Set([...a.started, ...b.started]));
    const answers = { ...b.answers, ...a.answers };
    const lastLocal = Number(local.updatedAt || 0);
    const lastRemote = Number(remote.updatedAt || 0);
    const newer = lastLocal >= lastRemote ? a : b;
    courses[id] = {
      status: pickStatus(a.status, b.status),
      startedAt: a.startedAt || b.startedAt || null,
      completedAt: a.completedAt || b.completedAt || null,
      lastLessonId: newer.lastLessonId || a.lastLessonId || b.lastLessonId || null,
      completed,
      started,
      answers
    };
  }
  return {
    courses,
    updatedAt: Math.max(Number(local.updatedAt || 0), Number(remote.updatedAt || 0)) || Date.now()
  };
}

function pickStatus(a, b) {
  const rank = { nao_iniciado: 0, em_andamento: 1, concluido: 2 };
  return (rank[a] || 0) >= (rank[b] || 0) ? a : b;
}

export function courseProgress(state, courseId) {
  return normalizeCourse(state?.courses?.[courseId]);
}

export function lessonStatus(progress, lessonId, unlocked) {
  if (progress.completed.includes(lessonId)) return "concluida";
  if (progress.started.includes(lessonId) || progress.lastLessonId === lessonId) return "em_andamento";
  if (!unlocked) return "bloqueada";
  return "nao_iniciada";
}

export function computePercent(progress, totalLessons) {
  if (!totalLessons) return 0;
  return Math.round((progress.completed.length / totalLessons) * 100);
}

export function deriveStatus(progress, totalLessons) {
  if (progress.completed.length >= totalLessons && totalLessons > 0) return "concluido";
  if (progress.startedAt || progress.completed.length || progress.started.length || progress.lastLessonId) {
    return "em_andamento";
  }
  return "nao_iniciado";
}

export function statusLabel(status) {
  if (status === "concluido") return "Concluído";
  if (status === "em_andamento") return "Em andamento";
  return "Não iniciado";
}

export async function loadProgress(user) {
  const local = readLocal(user.uidKey);
  const remote = await readRemote(user.uidKey);
  const merged = mergeStates(local, remote);
  writeLocal(user.uidKey, merged);
  return merged;
}

export function saveProgress(user, state, { immediate = false } = {}) {
  const next = { ...state, updatedAt: Date.now() };
  writeLocal(user.uidKey, next);
  if (saveTimer) clearTimeout(saveTimer);
  const flush = () => writeRemote(user.uidKey, user.nome, next);
  if (immediate) flush();
  else saveTimer = setTimeout(flush, 350);
  return next;
}

export function startCourse(state, courseId, lessonId) {
  const current = courseProgress(state, courseId);
  const started = Array.from(new Set([...current.started, lessonId].filter(Boolean)));
  const nextCourse = {
    ...current,
    status: current.status === "concluido" ? "concluido" : "em_andamento",
    startedAt: current.startedAt || new Date().toISOString(),
    lastLessonId: lessonId || current.lastLessonId,
    started
  };
  return {
    ...state,
    courses: { ...state.courses, [courseId]: nextCourse }
  };
}

export function completeLesson(state, courseId, lessonId, totalLessons) {
  const current = courseProgress(state, courseId);
  const completed = Array.from(new Set([...current.completed, lessonId]));
  const status = deriveStatus({ ...current, completed, startedAt: current.startedAt || new Date().toISOString() }, totalLessons);
  const nextCourse = {
    ...current,
    status,
    startedAt: current.startedAt || new Date().toISOString(),
    completedAt: status === "concluido" ? (current.completedAt || new Date().toISOString()) : current.completedAt,
    lastLessonId: lessonId,
    completed,
    started: Array.from(new Set([...current.started, lessonId]))
  };
  return {
    ...state,
    courses: { ...state.courses, [courseId]: nextCourse }
  };
}

export function saveAnswer(state, courseId, lessonId, answer) {
  const current = courseProgress(state, courseId);
  return {
    ...state,
    courses: {
      ...state.courses,
      [courseId]: {
        ...current,
        answers: { ...current.answers, [lessonId]: answer }
      }
    }
  };
}

export function resumeLessonId(progress, lessonIds) {
  if (progress.lastLessonId && lessonIds.includes(progress.lastLessonId)) {
    return progress.lastLessonId;
  }
  const firstOpen = lessonIds.find((id) => !progress.completed.includes(id));
  return firstOpen || lessonIds[0] || null;
}
