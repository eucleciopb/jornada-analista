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

/** Ocultos por padrão na visualização admin */
const OCULTOS_PADRAO = ["Victor"];
const STORAGE_KEY = "agendaSemanaAdm_ocultos_v1";

const ICON_HIDE = `
  <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`;

const ICON_SHOW = `
  <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;

const DIA_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const TH_IDS = ["thSeg", "thTer", "thQua", "thQui", "thSex"];

const tbody = document.getElementById("tbody");
const tbodyOcultos = document.getElementById("tbodyOcultos");
const hint = document.getElementById("hint");
const weekLabel = document.getElementById("weekLabel");
const errorBox = document.getElementById("errorBox");
const hiddenPanel = document.getElementById("hiddenPanel");
const hiddenEmpty = document.getElementById("hiddenEmpty");
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
let lastMapByUserDate = {};
let lastDays = [];
let lastRegistrosCount = 0;

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

/* =========================
   OCULTAR / ATIVAR
========================= */
function loadOcultos(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      saveOcultos(OCULTOS_PADRAO);
      return new Set(OCULTOS_PADRAO.map(u => u.toLowerCase()));
    }
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set(OCULTOS_PADRAO.map(u => u.toLowerCase()));
    return new Set(arr.map(u => String(u).toLowerCase()));
  } catch {
    return new Set(OCULTOS_PADRAO.map(u => u.toLowerCase()));
  }
}

function saveOcultos(nomes){
  const list = [...new Set((nomes || []).map(n => normalize(n)).filter(Boolean))];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getOcultosNomes(){
  const set = loadOcultos();
  return USERS.filter(u => set.has(u.toLowerCase()));
}

function getVisiveis(){
  const set = loadOcultos();
  return USERS.filter(u => !set.has(u.toLowerCase()));
}

function ocultarUsuario(nome){
  const atuais = getOcultosNomes();
  if (!atuais.some(u => u.toLowerCase() === nome.toLowerCase())) {
    atuais.push(nome);
  }
  saveOcultos(atuais);
  renderFromCache();
}

function ativarUsuario(nome){
  const atuais = getOcultosNomes().filter(u => u.toLowerCase() !== nome.toLowerCase());
  saveOcultos(atuais);
  renderFromCache();
}

function rowCellsHtml(user, days, mapByUserDate){
  const key = user.toLowerCase();
  let okCells = 0;
  let pendCells = 0;

  const cells = days.map((iso) => {
    const r = mapByUserDate[`${key}|${iso}`] || null;
    const filled = !!normalize(r?.cd);
    if (filled) okCells++;
    else pendCells++;
    const cls = filled ? "td-ok" : "td-pendente";
    return `<td class="${cls}">${cellHtml(r)}</td>`;
  }).join("");

  return { cells, okCells, pendCells };
}

function renderTabelaOcultos(mapByUserDate, days){
  if (!tbodyOcultos || !hiddenPanel) return;

  const ocultos = getOcultosNomes();
  hiddenPanel.hidden = false;
  tbodyOcultos.innerHTML = "";

  if (hiddenEmpty) {
    hiddenEmpty.hidden = ocultos.length > 0;
  }

  for (const user of ocultos){
    const { cells, pendCells } = rowCellsHtml(user, days, mapByUserDate);
    const tr = document.createElement("tr");
    tr.className = "row-oculto";
    if (pendCells === 5) tr.classList.add("row-all-pendente");
    else if (pendCells === 0) tr.classList.add("row-all-ok");

    tr.innerHTML = `
      <td class="analista-nome">
        <div class="analista-cell">
          <span>${user}</span>
          <button type="button" class="btn-icon btn-ativar" data-ativar="${user}" title="Ativar na visualização" aria-label="Ativar ${user}">
            ${ICON_SHOW}
          </button>
        </div>
      </td>
      ${cells}
    `;
    tbodyOcultos.appendChild(tr);
  }
}

function renderFromCache(){
  renderTabela(lastMapByUserDate, lastDays, lastRegistrosCount);
}

function renderTabela(mapByUserDate, days, registrosCount){
  const visiveis = getVisiveis();
  tbody.innerHTML = "";

  let okCells = 0;
  let pendCells = 0;
  const totalSlots = visiveis.length * 5;

  if (!visiveis.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="cell-empty">Nenhum analista visível. Ative alguém na tabela de ocultos abaixo.</td></tr>`;
  }

  for (const user of visiveis){
    const row = rowCellsHtml(user, days, mapByUserDate);
    okCells += row.okCells;
    pendCells += row.pendCells;

    const tr = document.createElement("tr");
    if (row.pendCells === 5) tr.classList.add("row-all-pendente");
    else if (row.pendCells === 0) tr.classList.add("row-all-ok");

    tr.innerHTML = `
      <td class="analista-nome">
        <div class="analista-cell">
          <span>${user}</span>
          <button type="button" class="btn-icon btn-ocultar" data-ocultar="${user}" title="Ocultar da visualização" aria-label="Ocultar ${user}">
            ${ICON_HIDE}
          </button>
        </div>
      </td>
      ${row.cells}
    `;
    tbody.appendChild(tr);
  }

  kpiUsers.textContent = String(visiveis.length);
  kpiOk.textContent = String(okCells);
  kpiPend.textContent = String(pendCells);

  if (statusPill) {
    const allOk = pendCells === 0 && totalSlots > 0;
    statusPill.className = "pill " + (allOk ? "pill-ok" : "pill-bad");
    statusPill.textContent = `${okCells}/${totalSlots} preenchidos`;
  }

  if (hint && registrosCount != null) {
    hint.textContent = `Última atualização • ${registrosCount} registro(s) no Firebase nesta semana`;
  }

  renderTabelaOcultos(mapByUserDate, days);
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
    const vis = getVisiveis();
    kpiUsers.textContent = String(vis.length);
    kpiOk.textContent = "0";
    kpiPend.textContent = String(vis.length * 5);
    lastMapByUserDate = {};
    lastDays = days;
    lastRegistrosCount = 0;
    renderTabelaOcultos({}, days);
    return;
  }

  const mapByUserDate = {};
  for (const r of registros) {
    const u = normalize(r.usuarioNome);
    const data = normalize(r.data);
    if (!u || !data) continue;
    mapByUserDate[`${u.toLowerCase()}|${data}`] = r;
  }

  lastMapByUserDate = mapByUserDate;
  lastDays = days;
  lastRegistrosCount = registros.length;
  renderTabela(mapByUserDate, days, registros.length);
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

document.addEventListener("click", (e) => {
  const btnOcultar = e.target.closest("[data-ocultar]");
  if (btnOcultar) {
    e.preventDefault();
    const nome = btnOcultar.getAttribute("data-ocultar");
    if (nome) ocultarUsuario(nome);
    return;
  }
  const btnAtivar = e.target.closest("[data-ativar]");
  if (btnAtivar) {
    e.preventDefault();
    const nome = btnAtivar.getAttribute("data-ativar");
    if (nome) ativarUsuario(nome);
  }
});

async function carregarUsuariosAgenda() {
  USERS = await listarNomesAnalistasAtivos(db, fs, USERS_FALLBACK);
}

(async () => {
  // Padrão: próxima semana (planejamento)
  weekMonday = nextWeekMonday(new Date());
  await carregarUsuariosAgenda();
  await loadAgendaSemana();
})();
