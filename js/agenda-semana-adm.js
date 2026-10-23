import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  listarNomesAnalistasAtivos
} from "./portal-usuarios.js?v=20260924e";

const firebaseConfig = {
  apiKey: "AIzaSyDN7RF9UiFyDAFXsPsVQwSRONJB0t1Xpqg",
  authDomain: "jornada-portal.firebaseapp.com",
  projectId: "jornada-portal",
  storageBucket: "jornada-portal.firebasestorage.app",
  messagingSenderId: "669362296644",
  appId: "1:669362296644:web:f590d9834a8e4e60012911"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fs = { collection, getDocs, query, where };

const USERS_FALLBACK = [
  "Alex",
  "Daniel",
  "Emerson",
  "Felipe",
  "Joice",
  "Maiello",
  "Michel",
  "Muller",
  "Robert",
  "Rodrigo",
  "Rosilene",
  "Tenório",
  "Victor",
  "Marcio",
  "Andre",
  "Ana Paula",
  "Ercules"
];

let USERS = [...USERS_FALLBACK];

const DIA_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const TH_IDS = ["thSeg", "thTer", "thQua", "thQui", "thSex"];

const tbody = document.getElementById("tbody");
const hint = document.getElementById("hint");
const weekLabel = document.getElementById("weekLabel");
const errorBox = document.getElementById("errorBox");
const kpiUsers = document.getElementById("kpiUsers");
const kpiOk = document.getElementById("kpiOk");
const kpiPend = document.getElementById("kpiPend");
const statusPill = document.getElementById("statusPill");
const btnReload = document.getElementById("btnReload");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnThis = document.getElementById("btnThis");

/** Segunda-feira (local) da semana exibida */
let weekMonday = null;

function pad2(n){ return String(n).padStart(2, "0"); }

function toISO_LOCAL(d){
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatBR(iso){
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function normalize(s){ return (s || "").toString().trim(); }

function startOfWeekMonday(base = new Date()){
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const day = d.getDay(); // 0=Dom … 6=Sáb
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Próxima semana útil (segunda seguinte à semana atual) */
function nextWeekMonday(base = new Date()){
  const mon = startOfWeekMonday(base);
  mon.setDate(mon.getDate() + 7);
  return mon;
}

function weekDays(monday){
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    days.push(toISO_LOCAL(d));
  }
  return days;
}

function showError(text){
  if (!errorBox) return;
  if (text) {
    errorBox.hidden = false;
    errorBox.textContent = text;
  } else {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
}

function updateHeaderLabels(days){
  days.forEach((iso, i) => {
    const el = document.getElementById(TH_IDS[i]);
    if (!el) return;
    el.innerHTML = `${DIA_LABELS[i]}<span class="th-date">${formatBR(iso)}</span>`;
  });

  if (weekLabel) {
    weekLabel.textContent = `Semana: ${formatBR(days[0])} — ${formatBR(days[4])}`;
  }
}

function cellHtml(registro){
  const cd = normalize(registro?.cd);
  if (cd) {
    return `<span class="cell-cd" title="${cd}">${cd}</span>`;
  }
  return `<span class="cell-pendente">Pendente</span>`;
}

function renderTabela(mapByUserDate, days){
  tbody.innerHTML = "";

  let okCells = 0;
  let pendCells = 0;
  const totalSlots = USERS.length * 5;

  if (!USERS.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="cell-empty">Nenhum analista encontrado.</td></tr>`;
  }

  for (const user of USERS){
    const key = user.toLowerCase();
    const tr = document.createElement("tr");
    let rowPend = 0;

    const cells = days.map((iso) => {
      const r = mapByUserDate[`${key}|${iso}`] || null;
      const filled = !!normalize(r?.cd);
      if (filled) okCells++;
      else {
        pendCells++;
        rowPend++;
      }
      const cls = filled ? "td-ok" : "td-pendente";
      return `<td class="${cls}">${cellHtml(r)}</td>`;
    }).join("");

    if (rowPend === 5) tr.classList.add("row-all-pendente");
    else if (rowPend === 0) tr.classList.add("row-all-ok");

    tr.innerHTML = `
      <td class="analista-nome">${user}</td>
      ${cells}
    `;
    tbody.appendChild(tr);
  }

  kpiUsers.textContent = String(USERS.length);
  kpiOk.textContent = String(okCells);
  kpiPend.textContent = String(pendCells);

  if (statusPill) {
    const allOk = pendCells === 0 && totalSlots > 0;
    statusPill.className = "pill " + (allOk ? "pill-ok" : "pill-bad");
    statusPill.textContent = `${okCells}/${totalSlots} preenchidos`;
  }
}

async function loadAgendaSemana(){
  showError("");
  const days = weekDays(weekMonday);
  updateHeaderLabels(days);

  hint.textContent = "Buscando agenda da semana…";
  tbody.innerHTML = `<tr><td colspan="6" class="cell-empty">Carregando…</td></tr>`;

  let registros = [];
  try {
    const q = query(
      collection(db, "agenda_dias"),
      where("data", "in", days)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => registros.push({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    hint.textContent = "Falha ao buscar no Firestore.";
    showError(err?.message || String(err));
    tbody.innerHTML = `<tr><td colspan="6" class="cell-empty">Erro ao buscar no Firebase.</td></tr>`;
    if (statusPill) statusPill.textContent = "Erro ao carregar";
    kpiUsers.textContent = String(USERS.length);
    kpiOk.textContent = "0";
    kpiPend.textContent = String(USERS.length * 5);
    return;
  }

  const mapByUserDate = {};
  for (const r of registros) {
    const u = normalize(r.usuarioNome);
    const data = normalize(r.data);
    if (!u || !data) continue;
    mapByUserDate[`${u.toLowerCase()}|${data}`] = r;
  }

  renderTabela(mapByUserDate, days);
  hint.textContent = `Última atualização • ${registros.length} registro(s) no Firebase nesta semana`;
}

function shiftWeek(deltaWeeks){
  weekMonday = new Date(
    weekMonday.getFullYear(),
    weekMonday.getMonth(),
    weekMonday.getDate() + deltaWeeks * 7
  );
  loadAgendaSemana();
}

if (btnReload) btnReload.onclick = () => loadAgendaSemana();
if (btnPrev) btnPrev.onclick = () => shiftWeek(-1);
if (btnNext) btnNext.onclick = () => shiftWeek(1);
if (btnThis) {
  btnThis.onclick = () => {
    weekMonday = startOfWeekMonday(new Date());
    loadAgendaSemana();
  };
}

async function carregarUsuariosAgenda() {
  USERS = await listarNomesAnalistasAtivos(db, fs, USERS_FALLBACK);
}

(async () => {
  // Padrão: próxima semana (planejamento)
  weekMonday = nextWeekMonday(new Date());
  await carregarUsuariosAgenda();
  await loadAgendaSemana();
})();
