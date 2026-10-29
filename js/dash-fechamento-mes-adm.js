import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
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

const COLLECTION = "apuracoes_treinamentos";
const TIPO_AVAL = "avaliacao_fechamento_mes";
const TIPO_ISENTO = "avaliacao_fechamento_mes_isento";
const PATH_MENU = "../html menus/menuadm.html";
const PATH_INDEX = "../index2.html";
const PATH_AVAL = "avaliacao-fechamento-mes-adm.html";

const USERS_FALLBACK = [
  "Alex", "Daniel", "Emerson", "Felipe", "Joice", "Maiello", "Michel",
  "Muller", "Robert", "Rodrigo", "Rosilene", "Tenório", "Victor",
  "Marcio", "Andre", "Ana Paula", "Ercules"
];

const el = {
  mes: document.getElementById("monthPicker"),
  busca: document.getElementById("busca"),
  tbody: document.getElementById("tbody"),
  tbodyIsentos: document.getElementById("tbodyIsentos"),
  isentosPanel: document.getElementById("isentosPanel"),
  msg: document.getElementById("msg"),
  errorBox: document.getElementById("errorBox"),
  statusPill: document.getElementById("statusPill"),
  userInfo: document.getElementById("userInfo"),
  kpiAnalise: document.getElementById("kpiAnalise"),
  kpiTop: document.getElementById("kpiTop"),
  kpiAten: document.getElementById("kpiAten"),
  kpiDev: document.getElementById("kpiDev"),
  kpiIsentos: document.getElementById("kpiIsentos"),
  kpiMedia: document.getElementById("kpiMedia"),
  btnReload: document.getElementById("btnReload"),
  btnMenu: document.getElementById("btnMenu")
};

let USERS = [...USERS_FALLBACK];
/** @type {Map<string, object>} */
let avalByUser = new Map();
/** @type {Map<string, object>} */
let isentoByUser = new Map();

const admin = localStorage.getItem("usuarioLogado") || "";
if (!admin) window.location.href = PATH_INDEX;
if (el.userInfo) el.userInfo.textContent = "Admin: " + admin;

function pad2(n){ return String(n).padStart(2, "0"); }

function mesAtualKey(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function slugNome(nome){
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function isentoDocId(analista, yyyyMM){
  return `fechamento_mes_isento_${slugNome(analista)}_${yyyyMM}`;
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatErr(err){
  const code = err?.code ? ` [${err.code}]` : "";
  return `${err?.message || String(err)}${code}`;
}

function showError(text){
  if (!el.errorBox) return;
  if (text) {
    el.errorBox.hidden = false;
    el.errorBox.textContent = text;
  } else {
    el.errorBox.hidden = true;
    el.errorBox.textContent = "";
  }
}

function setMsg(text, ok = false){
  if (!el.msg) return;
  el.msg.textContent = text || "";
  el.msg.classList.toggle("ok", Boolean(ok));
}

function conceitoFromScore(pct, hasAval){
  if (!hasAval) return { label: "Pendente", classe: "pendente", band: "dev" };
  if (pct >= 90) return { label: "Excelente", classe: "excelente", band: "top" };
  if (pct >= 75) return { label: "Bom", classe: "bom", band: "top" };
  if (pct >= 50) return { label: "Atenção", classe: "atencao", band: "aten" };
  return { label: "A desenvolver", classe: "critico", band: "dev" };
}

function shortFeedback(text){
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "—";
  return t.length > 90 ? t.slice(0, 90) + "…" : t;
}

function buildRows(){
  const busca = (el.busca.value || "").trim().toLowerCase();
  const rows = [];

  for (const nome of USERS) {
    if (busca && !nome.toLowerCase().includes(busca)) continue;
    const key = nome.toLowerCase();
    const isento = isentoByUser.get(key) || null;
    const aval = avalByUser.get(key) || null;

    if (isento) {
      rows.push({
        nome,
        isento: true,
        motivo: isento.motivo || "",
        pontuacao: null,
        hasAval: false,
        itensOk: null,
        itensTotal: null,
        visitas: null,
        feedback: "",
        sortScore: -1
      });
      continue;
    }

    const hasAval = Boolean(aval && typeof aval.pontuacao === "number");
    const pontuacao = hasAval ? Number(aval.pontuacao) : null;
    rows.push({
      nome,
      isento: false,
      motivo: "",
      pontuacao,
      hasAval,
      itensOk: hasAval ? (aval.itensOk ?? null) : null,
      itensTotal: hasAval ? (aval.itensTotal ?? null) : null,
      visitas: aval?.visitasMes ?? null,
      feedback: aval?.feedbackFinal || "",
      sortScore: hasAval ? pontuacao : -1
    });
  }

  const naAnalise = rows.filter((r) => !r.isento);
  // Ordena só por pontuação (maior → menor). Nome não desempata posição.
  naAnalise.sort((a, b) => {
    if (b.sortScore !== a.sortScore) return b.sortScore - a.sortScore;
    return a.nome.localeCompare(b.nome, "pt-BR"); // só para leitura estável na tabela
  });

  // Ranking denso: mesma % = mesma colocação (ex.: vários em 1º com 100%)
  let place = 0;
  let lastScore = null;
  for (const r of naAnalise) {
    const key = r.hasAval ? r.sortScore : null;
    if (key !== lastScore) {
      place += 1;
      lastScore = key;
    }
    r.place = place;
  }

  const isentos = rows
    .filter((r) => r.isento)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return { naAnalise, isentos };
}

function render(){
  const { naAnalise, isentos } = buildRows();

  let top = 0, aten = 0, dev = 0;
  const scores = [];

  naAnalise.forEach((r) => {
    const c = conceitoFromScore(r.pontuacao ?? 0, r.hasAval);
    if (c.band === "top") top++;
    else if (c.band === "aten") aten++;
    else dev++;
    if (r.hasAval) scores.push(r.pontuacao);
  });

  el.kpiAnalise.textContent = String(naAnalise.length);
  el.kpiTop.textContent = String(top);
  el.kpiAten.textContent = String(aten);
  el.kpiDev.textContent = String(dev);
  el.kpiIsentos.textContent = String(isentos.length);
  el.kpiMedia.textContent = scores.length
    ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%`
    : "—";

  if (!naAnalise.length) {
    el.tbody.innerHTML = `<tr><td colspan="8" class="cell-empty">Nenhum analista na análise deste mês.</td></tr>`;
  } else {
    el.tbody.innerHTML = naAnalise.map((r) => {
      const c = conceitoFromScore(r.pontuacao ?? 0, r.hasAval);
      const scoreHtml = r.hasAval
        ? `<span class="score score-${c.classe}">${r.pontuacao}%</span>`
        : `<span class="score score-pendente">—</span>`;
      const checks = r.hasAval && r.itensOk != null
        ? `${r.itensOk}/${r.itensTotal ?? "?"}`
        : "—";
      const visitas = r.visitas == null ? "—" : String(r.visitas);
      const link = `${PATH_AVAL}`;

      return `
        <tr class="row-${c.classe}">
          <td class="rank">${r.place}</td>
          <td class="analista-nome">${escapeHtml(r.nome)}</td>
          <td>${scoreHtml}</td>
          <td><span class="pill pill-${c.classe}">${c.label}</span></td>
          <td>${escapeHtml(checks)}</td>
          <td>${escapeHtml(visitas)}</td>
          <td class="feedback-cell" title="${escapeHtml(r.feedback)}">${escapeHtml(shortFeedback(r.feedback))}</td>
          <td class="acoes">
            <button type="button" class="btn-mini" data-isentar="${escapeHtml(r.nome)}">Isentar</button>
            <a class="btn-mini linkish" href="${link}" title="Abrir avaliação">Avaliar</a>
          </td>
        </tr>
      `;
    }).join("");
  }

  if (isentos.length) {
    el.isentosPanel.hidden = false;
    el.tbodyIsentos.innerHTML = isentos.map((r) => `
      <tr class="row-isento">
        <td class="analista-nome">${escapeHtml(r.nome)}</td>
        <td>${escapeHtml(r.motivo || "Isento da análise neste mês")}</td>
        <td>
          <button type="button" class="btn-mini btn-reativar" data-reativar="${escapeHtml(r.nome)}">Reativar</button>
        </td>
      </tr>
    `).join("");
  } else {
    el.isentosPanel.hidden = true;
    el.tbodyIsentos.innerHTML = "";
  }

  el.statusPill.className = "pill pill-ok";
  el.statusPill.textContent = `${naAnalise.length} na análise · ${isentos.length} isento(s)`;
}

async function loadDash(){
  showError("");
  setMsg("Carregando…");
  const mes = el.mes.value;
  if (!mes) {
    setMsg("Selecione o mês.");
    return;
  }

  try {
    const [snapAval, snapIsento] = await Promise.all([
      getDocs(query(collection(db, COLLECTION), where("tipo", "==", TIPO_AVAL))),
      getDocs(query(collection(db, COLLECTION), where("tipo", "==", TIPO_ISENTO)))
    ]);

    avalByUser = new Map();
    snapAval.forEach((d) => {
      const data = d.data() || {};
      if (String(data.yyyyMM || "") !== mes) return;
      const nome = String(data.analista || "").trim();
      if (!nome) return;
      avalByUser.set(nome.toLowerCase(), { id: d.id, ...data });
    });

    isentoByUser = new Map();
    snapIsento.forEach((d) => {
      const data = d.data() || {};
      if (String(data.yyyyMM || "") !== mes) return;
      const nome = String(data.analista || "").trim();
      if (!nome) return;
      isentoByUser.set(nome.toLowerCase(), { id: d.id, ...data });
    });

    setMsg(`Mês ${mes} · ${avalByUser.size} avaliação(ões) · ${isentoByUser.size} isento(s).`, true);
    render();
  } catch (err) {
    console.error(err);
    showError(formatErr(err));
    setMsg("Falha ao carregar o dash.");
    el.statusPill.className = "pill pill-bad";
    el.statusPill.textContent = "Erro";
    el.tbody.innerHTML = `<tr><td colspan="8" class="cell-empty">Erro ao carregar.</td></tr>`;
  }
}

async function isentarAnalista(nome){
  const mes = el.mes.value;
  if (!mes || !nome) return;

  const motivo = window.prompt(
    `Motivo da isenção de ${nome} em ${mes} (opcional):`,
    ""
  );
  if (motivo === null) return; // cancelou

  try {
    const id = isentoDocId(nome, mes);
    await setDoc(doc(db, COLLECTION, id), {
      tipo: TIPO_ISENTO,
      analista: nome,
      yyyyMM: mes,
      isento: true,
      motivo: String(motivo || "").trim(),
      avaliador: admin,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });

    setMsg(`${nome} isento(a) da análise em ${mes}.`, true);
    await loadDash();
  } catch (err) {
    console.error(err);
    showError(formatErr(err));
    setMsg("Não foi possível isentar.");
  }
}

async function reativarAnalista(nome){
  const mes = el.mes.value;
  if (!mes || !nome) return;
  if (!window.confirm(`Reativar ${nome} na análise de ${mes}?`)) return;

  try {
    const existing = isentoByUser.get(nome.toLowerCase());
    const id = existing?.id || isentoDocId(nome, mes);
    await deleteDoc(doc(db, COLLECTION, id));
    setMsg(`${nome} reativado(a) na análise.`, true);
    await loadDash();
  } catch (err) {
    console.error(err);
    showError(formatErr(err));
    setMsg("Não foi possível reativar.");
  }
}

el.btnMenu.onclick = () => { window.location.href = PATH_MENU; };
el.btnReload.onclick = loadDash;
el.mes.addEventListener("change", loadDash);
el.busca.addEventListener("input", render);

document.addEventListener("click", (e) => {
  const btnIsentar = e.target.closest("[data-isentar]");
  if (btnIsentar) {
    e.preventDefault();
    isentarAnalista(btnIsentar.getAttribute("data-isentar"));
    return;
  }
  const btnReativar = e.target.closest("[data-reativar]");
  if (btnReativar) {
    e.preventDefault();
    reativarAnalista(btnReativar.getAttribute("data-reativar"));
  }
});

el.mes.value = mesAtualKey();

(async () => {
  try {
    USERS = await listarNomesAnalistasAtivos(db, fs, USERS_FALLBACK);
  } catch (err) {
    console.error(err);
    showError("Lista de analistas: usando fallback local.");
  }
  await loadDash();
})();
