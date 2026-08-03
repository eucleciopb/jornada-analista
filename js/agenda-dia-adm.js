import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

/* =========================
   USERS (MESMA LISTA DO INDEX)
   - Inclui Tenório
========================= */
const USERS = [
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
  "Andre"
];

/** Ocultos por padrão na visualização admin (ex.: Victor) */
const OCULTOS_PADRAO = ["Victor"];
const STORAGE_KEY = "agendaDiaAdm_ocultos";

/* =========================
   UI
========================= */
const tbody = document.getElementById("tbody");
const hint = document.getElementById("hint");
const todayLabel = document.getElementById("todayLabel");
const errorBox = document.getElementById("errorBox");
const hiddenPanel = document.getElementById("hiddenPanel");
const hiddenList = document.getElementById("hiddenList");

const kpiUsers = document.getElementById("kpiUsers");
const kpiOk = document.getElementById("kpiOk");
const kpiPend = document.getElementById("kpiPend");
const statusPill = document.getElementById("statusPill");

const btnReload = document.getElementById("btnReload");

/* Cache do último mapa Firestore para re-render sem nova query */
let lastMapByUser = {};
let lastRegistrosCount = 0;

/* =========================
   HELPERS (DATA LOCAL - SEM UTC)
========================= */
function pad2(n){ return String(n).padStart(2, "0"); }

function todayISO_LOCAL(){
  // ✅ data local do navegador (Brasil), sem UTC
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
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
   OCULTAR / MOSTRAR
========================= */
function loadOcultos(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // primeira visita: aplica padrão (Victor oculto)
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

function mostrarUsuario(nome){
  const atuais = getOcultosNomes().filter(u => u.toLowerCase() !== nome.toLowerCase());
  saveOcultos(atuais);
  renderFromCache();
}

function renderHiddenPanel(){
  if (!hiddenPanel || !hiddenList) return;
  const ocultos = getOcultosNomes();
  if (!ocultos.length) {
    hiddenPanel.hidden = true;
    hiddenList.innerHTML = "";
    return;
  }
  hiddenPanel.hidden = false;
  hiddenList.innerHTML = "";
  for (const nome of ocultos) {
    const li = document.createElement("li");
    li.className = "hidden-user-item";
    li.innerHTML = `
      <span class="hidden-user-name">${nome}</span>
      <button type="button" class="btn-mostrar" data-mostrar="${nome}">Mostrar</button>
    `;
    hiddenList.appendChild(li);
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
    tbody.innerHTML = `<tr><td colspan="4" class="cell-empty">Todos os analistas estão ocultos. Use “Mostrar” abaixo para restaurar.</td></tr>`;
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
          <button type="button" class="btn-ocultar" data-ocultar="${user}" title="Ocultar da visualização">Ocultar</button>
        </div>
      </td>
      <td>${statusBadge(hasDoc, preenchido)}</td>
      <td>${cdHtml}</td>
      <td>${atvHtml}</td>
    `;
    tbody.appendChild(tr);
  }

  // KPIs só dos visíveis
  kpiUsers.textContent = String(visiveis.length);
  kpiOk.textContent = String(okCount);
  kpiPend.textContent = String(visiveis.length - okCount);

  hint.textContent = `Última atualização • ${registrosCount} registro(s) no Firebase hoje`;
  if (statusPill) {
    statusPill.className = "pill " + (visiveis.length > 0 && okCount === visiveis.length ? "pill-ok" : "pill-bad");
    statusPill.textContent = `${okCount}/${visiveis.length} lançados`;
  }

  renderHiddenPanel();
}

/* =========================
   MAIN LOAD
========================= */
async function loadAgendaDia(){
  showError("");
  const hoje = todayISO_LOCAL();

  todayLabel.textContent = "Data: " + formatBR(hoje);
  hint.textContent = "Buscando agenda do time…";

  // 1) Busca tudo que foi lançado HOJE (somente quem registrou)
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
    renderHiddenPanel();
    return;
  }

  // 2) Indexa por usuarioNome
  const mapByUser = {};
  for (const r of registros){
    const u = normalize(r.usuarioNome);
    if (!u) continue;
    mapByUser[u.toLowerCase()] = r;
  }

  lastMapByUser = mapByUser;
  lastRegistrosCount = registros.length;

  // 3) Render (respeitando ocultos)
  renderTabela(mapByUser, registros.length);
}

/* =========================
   EVENTS
========================= */
if (btnReload) btnReload.onclick = loadAgendaDia;

document.addEventListener("click", (e) => {
  const btnOcultar = e.target.closest("[data-ocultar]");
  if (btnOcultar) {
    const nome = btnOcultar.getAttribute("data-ocultar");
    if (nome) ocultarUsuario(nome);
    return;
  }
  const btnMostrar = e.target.closest("[data-mostrar]");
  if (btnMostrar) {
    const nome = btnMostrar.getAttribute("data-mostrar");
    if (nome) mostrarUsuario(nome);
  }
});

// init
loadAgendaDia();
