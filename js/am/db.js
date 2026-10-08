/**
 * Camada de dados AM — coleção apuracoes_treinamentos com tipos am_*.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { AM_COLLECTION, AM_ESCOPO, TIPO } from "./config.js";

export { db };

export function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64) || `x_${Date.now()}`;
}

export function makeId(prefix = "am") {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function currentPeriodo() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function weekBounds(ref = new Date()) {
  const d = new Date(ref);
  const day = d.getDay();
  const diffMon = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const toIso = (x) => `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
  return { inicio: toIso(start), fim: toIso(end), start, end };
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function toBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}

export async function listByTipo(tipo) {
  const snap = await getDocs(
    query(collection(db, AM_COLLECTION), where("tipo", "==", tipo))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getById(id) {
  const snap = await getDoc(doc(db, AM_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function saveDoc(id, payload, { merge = true } = {}) {
  const ref = doc(db, AM_COLLECTION, id);
  await setDoc(
    ref,
    {
      escopo: AM_ESCOPO,
      ...payload,
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now()
    },
    { merge }
  );
  return id;
}

export async function removeDoc(id) {
  await deleteDoc(doc(db, AM_COLLECTION, id));
}

export async function audit(acao, detalhe, usuario) {
  const id = makeId("am_audit");
  try {
    await saveDoc(id, {
      tipo: TIPO.AUDITORIA,
      acao,
      detalhe: detalhe || {},
      usuario: usuario || null,
      createdAt: serverTimestamp(),
      createdAtMs: Date.now()
    });
  } catch (err) {
    console.warn("Auditoria AM falhou:", err);
  }
}

/** Status operacional + atraso calculado (não apaga o status). */
export function deriveAtraso(item) {
  const st = String(item.status || "").toLowerCase();
  if (st === "cancelado" || st === "validado") {
    return { atrasada: false, foraDoPrazo: false };
  }
  const prazo = String(item.prazo || "").slice(0, 10);
  if (!prazo) return { atrasada: false, foraDoPrazo: false };
  const concl = String(item.dataConclusao || "").slice(0, 10);
  const hoje = todayISO();
  if (concl) {
    return { atrasada: false, foraDoPrazo: concl > prazo };
  }
  return { atrasada: hoje > prazo, foraDoPrazo: false };
}

export function statusLabel(st) {
  const map = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    enviado_validacao: "Enviado p/ validação",
    validado: "Validado",
    devolvido: "Devolvido",
    cancelado: "Cancelado",
    planejado: "Planejado",
    realizado: "Realizado",
    cancelado_compromisso: "Cancelado",
    aberta: "Aberta",
    encerrada: "Encerrada",
    atrasada: "Atrasada"
  };
  return map[st] || st || "—";
}

export function statusPill(st, extra = {}) {
  let cls = "am-pill";
  if (st === "validado" || st === "realizado" || st === "encerrada") cls += " ok";
  else if (st === "atrasada" || st === "devolvido" || extra.atrasada) cls += " bad";
  else if (st === "em_andamento" || st === "enviado_validacao" || st === "aberta") cls += " info";
  else if (st === "cancelado") cls += " muted";
  else cls += " warn";
  const label = extra.foraDoPrazo ? `${statusLabel(st)} · fora do prazo` : statusLabel(st);
  return `<span class="${cls}">${escapeHtml(label)}</span>`;
}
