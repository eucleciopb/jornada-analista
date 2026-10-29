import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  listarAnalistasParaAgenda,
  alternarVisivelUsuario,
  PERFIL_ANALISTA
} from "./portal-usuarios.js?v=20261029v";

/* =========================
   FIREBASE CONFIG (SEU)
========================= */
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
const fs = { collection, getDocs, query, where, doc, getDoc, setDoc, serverTimestamp };

/* =========================
   USERS (portal Firestore + fallback)
========================= */
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

/** Ativos do portal (inativos não entram). */
let USERS = [...USERS_FALLBACK];
/** Ativos com visivel=false no cadastro de usuários. */
let OCULTOS = ["Victor"];

/* Ícones SVG (olho cortado = ocultar / olho = ativar) — grava no portal */
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

/* =========================
   UI
========================= */
const tbody = document.getElementById("tbody");
const tbodyOcultos = document.getElementById("tbodyOcultos");
const hint = document.getElementById("hint");
const todayLabel = document.getElementById("todayLabel");
const errorBox = document.getElementById("errorBox");
const hiddenPanel = document.getElementById("hiddenPanel");
const hiddenEmpty = document.getElementById("hiddenEmpty");

const kpiUsers = document.getElementById("kpiUsers");
const kpiOk = document.getElementById("kpiOk");
const kpiPend = document.getElementById("kpiPend");
const statusPill = document.getElementById("statusPill");

const btnReload = document.getElementById("btnReload");

let lastMapByUser = {};
let lastRegistrosCount = 0;

/* =========================
   HELPERS
========================= */
function pad2(n){ return String(n).padStart(2, "0"); }

function todayISO_LOCAL(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatBR(iso){
  if(!iso) return "-";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function normalize(s){ return (s || "").toString().trim(); }

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

function statusBadge(hasDoc, preenchido){
  if (hasDoc && preenchido) {
    return `<span class="status-btn status-ok">Lançado</span>`;
  }
  if (hasDoc) {
    return `<span class="status-btn status-bad">Não preenchido</span>`;
  }
  return `<span class="status-btn status-bad">Pendente</span>`;
}

/* =========================
   OCULTAR / ATIVAR (regra do cadastro Usuários → visivel)
========================= */
function getOcultosNomes(){
  const set = new Set(OCULTOS.map((u) => u.toLowerCase()));
  return USERS.filter((u) => set.has(u.toLowerCase()));
}

function getVisiveis(){
  const set = new Set(OCULTOS.map((u) => u.toLowerCase()));
  return USERS.filter((u) => !set.has(u.toLowerCase()));
}

async function ocultarUsuario(nome){
  try {
    await alternarVisivelUsuario(db, fs, {
      nome,
      perfil: PERFIL_ANALISTA,
      visivel: false,
      atualizadoPor: localStorage.getItem("usuarioLogado") || "admin"
    });
    OCULTOS = [...new Set([...OCULTOS, nome])];
    renderFromCache();
  } catch (err) {
    console.error(err);
    showError(err?.message || "Não foi possível ocultar. Use Usuários do Portal.");
  }
}

async function ativarUsuario(nome){
  try {
    await alternarVisivelUsuario(db, fs, {
      nome,
      perfil: PERFIL_ANALISTA,
      visivel: true,
      atualizadoPor: localStorage.getItem("usuarioLogado") || "admin"
    });
    OCULTOS = OCULTOS.filter((u) => u.toLowerCase() !== nome.toLowerCase());
    renderFromCache();
  } catch (err) {
    console.error(err);
    showError(err?.message || "Não foi possível tornar visível. Use Usuários do Portal.");
  }
}

function renderTabelaOcultos(mapByUser){
  if (!tbodyOcultos || !hiddenPanel) return;

  const ocultos = getOcultosNomes();
  hiddenPanel.hidden = false;
  tbodyOcultos.innerHTML = "";

  if (hiddenEmpty) {
    hiddenEmpty.hidden = ocultos.length > 0;
  }

  for (const user of ocultos){
    const r = mapByUser[user.toLowerCase()] || null;
    const cd = normalize(r?.cd);
    const atividade = normalize(r?.atividade);
    const hasDoc = !!r;
    const preenchido = !!(cd || atividade);

    const tr = document.createElement("tr");
    tr.className = "row-oculto";
    tr.innerHTML = `
      <td>
        <div class="analista-cell">
          <span class="analista-nome">${user}</span>
          <button type="button" class="btn-icon btn-ativar" data-ativar="${user}" title="Ativar na visualização" aria-label="Ativar ${user}">
            ${ICON_SHOW}
          </button>
        </div>
      </td>
      <td>${statusBadge(hasDoc, preenchido)}</td>
      <td>${cd || `<span class="cell-empty">—</span>`}</td>
      <td>${atividade || `<span class="cell-empty">—</span>`}</td>
    `;
    tbodyOcultos.appendChild(tr);
  }
}

function renderFromCache(){
  renderTabela(lastMapByUser, lastRegistrosCount);
}

function renderTabela(mapByUser, registrosCount){
  const visiveis = getVisiveis();
  tbody.innerHTML = "";

  let okCount = 0;

  if (!visiveis.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="cell-empty">Nenhum analista visível. Ative alguém na tabela de ocultos abaixo.</td></tr>`;
  }

  for (const user of visiveis){
    const r = mapByUser[user.toLowerCase()] || null;
    const cd = normalize(r?.cd);
    const atividade = normalize(r?.atividade);
    const hasDoc = !!r;
    const preenchido = !!(cd || atividade);

    if (hasDoc && preenchido) okCount++;

    const tr = document.createElement("tr");
    if (!hasDoc || !preenchido) tr.className = "row-pendente";

    const cdHtml = cd ? cd : `<span class="cell-empty">Não preenchido</span>`;
    const atvHtml = atividade ? atividade : `<span class="cell-empty">Não preenchido</span>`;

    tr.innerHTML = `
      <td>
        <div class="analista-cell">
          <span class="analista-nome">${user}</span>
          <button type="button" class="btn-icon btn-ocultar" data-ocultar="${user}" title="Ocultar da visualização" aria-label="Ocultar ${user}">
            ${ICON_HIDE}
          </button>
        </div>
      </td>
      <td>${statusBadge(hasDoc, preenchido)}</td>
      <td>${cdHtml}</td>
      <td>${atvHtml}</td>
    `;
    tbody.appendChild(tr);
  }

  kpiUsers.textContent = String(visiveis.length);
  kpiOk.textContent = String(okCount);
  kpiPend.textContent = String(Math.max(0, visiveis.length - okCount));

  hint.textContent = `Última atualização • ${registrosCount} registro(s) no Firebase hoje`;
  if (statusPill) {
    statusPill.className = "pill " + (visiveis.length > 0 && okCount === visiveis.length ? "pill-ok" : "pill-bad");
    statusPill.textContent = `${okCount}/${visiveis.length} lançados`;
  }

  renderTabelaOcultos(mapByUser);
}

/* =========================
   MAIN LOAD
========================= */
async function loadAgendaDia(){
  showError("");
  const hoje = todayISO_LOCAL();

  todayLabel.textContent = "Data: " + formatBR(hoje);
  hint.textContent = "Buscando agenda do time…";

  let registros = [];
  try{
    const q = query(
      collection(db, "agenda_dias"),
      where("data", "==", hoje)
    );

    const snap = await getDocs(q);
    snap.forEach(d => registros.push({ id: d.id, ...d.data() }));
  }catch(err){
    console.error(err);
    hint.textContent = "Falha ao buscar no Firestore.";
    showError(err?.message || String(err));
    tbody.innerHTML = `<tr><td colspan="4" class="cell-empty">Erro ao buscar no Firebase.</td></tr>`;
    if (statusPill) statusPill.textContent = "Erro ao carregar";
    const vis = getVisiveis();
    kpiUsers.textContent = vis.length;
    kpiOk.textContent = "0";
    kpiPend.textContent = vis.length;
    renderTabelaOcultos({});
    return;
  }

  const mapByUser = {};
  for (const r of registros){
    const u = normalize(r.usuarioNome);
    if (!u) continue;
    mapByUser[u.toLowerCase()] = r;
  }

  lastMapByUser = mapByUser;
  lastRegistrosCount = registros.length;
  renderTabela(mapByUser, registros.length);
}

/* =========================
   EVENTS
========================= */
if (btnReload) btnReload.onclick = loadAgendaDia;

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
  const { visiveis, ocultos } = await listarAnalistasParaAgenda(db, fs, USERS_FALLBACK);
  OCULTOS = ocultos;
  USERS = [...new Set([...visiveis, ...ocultos])]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

(async () => {
  await carregarUsuariosAgenda();
  await loadAgendaDia();
})();
