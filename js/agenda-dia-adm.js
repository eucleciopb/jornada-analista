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
  "Emerson",
  "Euclecio",
  "Joice",
  "Michel",
  "Muller",
  "Pedro",
  "Ricardo",
  "Robert",
  "Rodrigo",
  "Rosilene",
  "Tenório"
];

/* =========================
   UI
========================= */
const tbody = document.getElementById("tbody");
const hint = document.getElementById("hint");
const todayLabel = document.getElementById("todayLabel");
const errorBox = document.getElementById("errorBox");

const kpiUsers = document.getElementById("kpiUsers");
const kpiOk = document.getElementById("kpiOk");
const kpiPend = document.getElementById("kpiPend");

const btnReload = document.getElementById("btnReload");

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
  errorBox.style.display = text ? "block" : "none";
  errorBox.textContent = text || "";
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
    tbody.innerHTML = `<tr><td colspan="4">Erro ao buscar no Firebase.</td></tr>`;
    kpiUsers.textContent = USERS.length;
    kpiOk.textContent = "0";
    kpiPend.textContent = USERS.length;
    return;
  }

  // 2) Indexa por usuarioNome (e também por uidKey se quiser evoluir)
  const mapByUser = {};
  for (const r of registros){
    const u = normalize(r.usuarioNome);
    if (!u) continue;
    // se houver duplicado no mesmo dia, mantém o último (por updatedAt)
    mapByUser[u.toLowerCase()] = r;
  }

  // 3) Render: SEMPRE mostra TODOS os usuários
  tbody.innerHTML = "";

  let okCount = 0;

  for (const user of USERS){
    const r = mapByUser[user.toLowerCase()] || null;

    const cd = normalize(r?.cd);
    const atividade = normalize(r?.atividade);

    // ✅ regra: se não tiver doc, é pendente.
    // ✅ se tiver doc mas vazio, continua "Não preenchido"
    const hasDoc = !!r;
    const preenchido = !!(cd || atividade);

    if (hasDoc && preenchido) okCount++;

    const statusText = hasDoc
      ? (preenchido ? "Lançado" : "Não preenchido")
      : "Pendente";

    const statusClass = (hasDoc && preenchido) ? "ok" : "pend";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user}</td>
      <td class="${statusClass}">${statusText}</td>
      <td>${cd ? cd : "<span class='empty'>Não preenchido</span>"}</td>
      <td>${atividade ? atividade : "<span class='empty'>Não preenchido</span>"}</td>
    `;
    tbody.appendChild(tr);
  }

  // 4) KPIs
  kpiUsers.textContent = String(USERS.length);
  kpiOk.textContent = String(okCount);
  kpiPend.textContent = String(USERS.length - okCount);

  hint.textContent = `Atualizado • Registros no Firebase hoje: ${registros.length}`;
}

/* =========================
   EVENTS
========================= */
if (btnReload) btnReload.onclick = loadAgendaDia;

// init
loadAgendaDia();