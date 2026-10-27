import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
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

const COL = "avaliacoes_fechamento_mes";
const PATH_MENU = "../html menus/menuadm.html";
const PATH_INDEX = "../index2.html";

const USERS_FALLBACK = [
  "Alex", "Daniel", "Emerson", "Felipe", "Joice", "Maiello", "Michel",
  "Muller", "Robert", "Rodrigo", "Rosilene", "Tenório", "Victor",
  "Marcio", "Andre", "Ana Paula", "Ercules"
];

/** Itens do fechamento padrão da apresentação */
const CHECK_ITEMS = [
  { id: "deck_padrao", label: "Utilizou o fechamento padrão (deck / material oficial)" },
  { id: "dados_info", label: "Trouxe os dados e informações do período" },
  { id: "rps", label: "Apresentou participação / envio da RPS" },
  { id: "cds_visitados", label: "Informou os CDs visitados no mês" },
  { id: "aderencia_cds", label: "Mostrou a aderência dos CDs visitados" },
  { id: "atividades_gestor", label: "Apresentou atividades do gestor (fechamento mês a mês)" },
  { id: "meta_visitas", label: "Cumpriu a meta de 3 visitas no mês" },
  { id: "treinos_vendedor", label: "Realizou os 3 treinamentos para vendedor" },
  { id: "treinos_gestor", label: "Realizou os 3 treinamentos para gestor" },
  { id: "desafios", label: "Trouxe correlação / desafios da área" },
  { id: "cd_treinado", label: "Informou o CD que treinou" },
  { id: "fotos", label: "Trouxe fotos do campo / treinamentos" },
  { id: "cases", label: "Trouxe cases / projetos em andamento na área" },
  { id: "boas_praticas", label: "Apresentou boas práticas em campo" },
  { id: "duvidas", label: "Abriu espaço para dúvidas / alinhamentos" }
];

const el = {
  analista: document.getElementById("analistaSelect"),
  mes: document.getElementById("monthPicker"),
  checklist: document.getElementById("checklist"),
  visitas: document.getElementById("visitasMes"),
  aderencia: document.getElementById("aderenciaPct"),
  obs: document.getElementById("obsAvaliador"),
  feedback: document.getElementById("feedbackFinal"),
  msg: document.getElementById("msg"),
  errorBox: document.getElementById("errorBox"),
  statusPill: document.getElementById("statusPill"),
  userInfo: document.getElementById("userInfo"),
  kpiOk: document.getElementById("kpiOk"),
  kpiTotal: document.getElementById("kpiTotal"),
  kpiScore: document.getElementById("kpiScore"),
  kpiConceito: document.getElementById("kpiConceito"),
  btnSalvar: document.getElementById("btnSalvar"),
  btnGerar: document.getElementById("btnGerarFeedback"),
  btnMenu: document.getElementById("btnMenu")
};

let USERS = [...USERS_FALLBACK];
let suppressAutoFeedback = false;

const avaliador = localStorage.getItem("usuarioLogado") || "";
if (!avaliador) {
  window.location.href = PATH_INDEX;
}
if (el.userInfo) el.userInfo.textContent = "Avaliador: " + avaliador;

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

function docId(analista, yyyyMM){
  return `${slugNome(analista)}_${yyyyMM}`;
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

function buildChecklist(){
  el.checklist.innerHTML = CHECK_ITEMS.map((item) => `
    <label class="check-item" for="chk_${item.id}">
      <input type="checkbox" id="chk_${item.id}" data-check="${item.id}" />
      <span class="check-label">${item.label}</span>
    </label>
  `).join("");

  el.checklist.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", onChecksChanged);
  });
}

function getChecks(){
  const out = {};
  for (const item of CHECK_ITEMS) {
    const input = document.getElementById(`chk_${item.id}`);
    out[item.id] = Boolean(input?.checked);
  }
  return out;
}

function setChecks(map){
  for (const item of CHECK_ITEMS) {
    const input = document.getElementById(`chk_${item.id}`);
    if (input) input.checked = Boolean(map?.[item.id]);
  }
}

function calcScore(checks){
  const total = CHECK_ITEMS.length;
  const ok = CHECK_ITEMS.filter((i) => checks[i.id]).length;
  const pct = total ? Math.round((ok / total) * 100) : 0;
  let conceito = "Crítico";
  let classe = "critico";
  if (pct >= 90) { conceito = "Excelente"; classe = "excelente"; }
  else if (pct >= 75) { conceito = "Bom"; classe = "bom"; }
  else if (pct >= 50) { conceito = "Atenção"; classe = "atencao"; }
  return { ok, total, pct, conceito, classe };
}

function updateScoreUI(){
  const score = calcScore(getChecks());
  el.kpiOk.textContent = String(score.ok);
  el.kpiTotal.textContent = String(score.total);
  el.kpiScore.textContent = `${score.pct}%`;
  el.kpiConceito.textContent = score.conceito;

  const scoreKpi = el.kpiScore.closest(".kpi");
  const conceitoKpi = el.kpiConceito.closest(".kpi");
  for (const node of [scoreKpi, conceitoKpi]) {
    if (!node) continue;
    node.classList.remove("kpi-excelente", "kpi-bom", "kpi-atencao", "kpi-critico");
    node.classList.add(`kpi-${score.classe}`);
  }
  return score;
}

function gerarFeedbackTexto(){
  const analista = el.analista.value.trim();
  const mes = el.mes.value;
  const checks = getChecks();
  const score = calcScore(checks);
  const visitas = Number(el.visitas.value);
  const aderencia = el.aderencia.value.trim();
  const faltantes = CHECK_ITEMS.filter((i) => !checks[i.id]).map((i) => i.label);

  const mesLabel = mes
    ? (() => {
        const [y, m] = mes.split("-");
        return `${m}/${y}`;
      })()
    : "mês selecionado";

  let texto = `Avaliação do fechamento de ${mesLabel}${analista ? ` — ${analista}` : ""}.\n`;
  texto += `Pontuação: ${score.pct}% (${score.ok}/${score.total}) — conceito ${score.conceito}.\n\n`;

  if (score.pct >= 90) {
    texto += "Apresentação alinhada ao padrão da Jornada Comercial. Manter a disciplina do deck e a qualidade das evidências.\n";
  } else if (score.pct >= 75) {
    texto += "Boa apresentação, com a maior parte do padrão atendida. Reforçar os pontos em aberto para o próximo fechamento.\n";
  } else if (score.pct >= 50) {
    texto += "Fechamento parcial em relação ao padrão. Priorizar os itens faltantes na próxima deck.\n";
  } else {
    texto += "Fechamento abaixo do padrão esperado. Revisar o material oficial e completar as evidências obrigatórias.\n";
  }

  if (Number.isFinite(visitas) && el.visitas.value !== "") {
    texto += `\nVisitas no mês: ${visitas} (meta: 3)${visitas >= 3 ? " — meta cumprida." : " — abaixo da meta."}`;
  }
  if (aderencia !== "") {
    texto += `\nAderência informada dos CDs: ${aderencia}%.`;
  }

  if (faltantes.length) {
    texto += `\n\nPontos a reforçar:\n- ${faltantes.join("\n- ")}`;
  } else {
    texto += "\n\nTodos os checks do padrão foram atendidos.";
  }

  const obs = el.obs.value.trim();
  if (obs) texto += `\n\nObservações do avaliador: ${obs}`;

  return texto.trim();
}

function onChecksChanged(){
  // Sync meta visitas checkbox with number when user edits visitas
  updateScoreUI();
  if (!suppressAutoFeedback) {
    el.feedback.value = gerarFeedbackTexto();
  }
}

function syncVisitasCheck(){
  const n = Number(el.visitas.value);
  const input = document.getElementById("chk_meta_visitas");
  if (!input || el.visitas.value === "") return;
  if (Number.isFinite(n)) {
    input.checked = n >= 3;
  }
}

async function popularAnalistas(){
  USERS = await listarNomesAnalistasAtivos(db, fs, USERS_FALLBACK);
  el.analista.innerHTML = `<option value="">Selecione o analista…</option>` +
    USERS.map((n) => `<option value="${n}">${n}</option>`).join("");
}

function resetFormCampos(){
  setChecks({});
  el.visitas.value = "";
  el.aderencia.value = "";
  el.obs.value = "";
  el.feedback.value = "";
  updateScoreUI();
  el.statusPill.className = "pill pill-muted";
  el.statusPill.textContent = "Nova avaliação";
}

async function carregarAvaliacao(){
  showError("");
  setMsg("");
  const analista = el.analista.value.trim();
  const mes = el.mes.value;
  if (!analista || !mes) {
    resetFormCampos();
    el.statusPill.textContent = "Selecione analista e mês";
    el.statusPill.className = "pill pill-muted";
    return;
  }

  setMsg("Carregando avaliação…");
  try {
    const ref = doc(db, COL, docId(analista, mes));
    const snap = await getDoc(ref);
    suppressAutoFeedback = true;

    if (!snap.exists()) {
      resetFormCampos();
      setMsg("Nenhuma avaliação salva para este analista/mês. Preencha e salve.", true);
      el.statusPill.className = "pill pill-muted";
      el.statusPill.textContent = "Sem registro";
      suppressAutoFeedback = false;
      return;
    }

    const data = snap.data() || {};
    setChecks(data.checks || {});
    el.visitas.value = data.visitasMes ?? "";
    el.aderencia.value = data.aderenciaPct ?? "";
    el.obs.value = data.obsAvaliador || "";
    el.feedback.value = data.feedbackFinal || "";
    updateScoreUI();

    el.statusPill.className = "pill pill-ok";
    el.statusPill.textContent = "Avaliação salva";
    setMsg("Avaliação carregada.", true);
  } catch (err) {
    console.error(err);
    showError(err?.message || String(err));
    setMsg("Falha ao carregar. Verifique as Rules da coleção " + COL + ".");
    el.statusPill.className = "pill pill-bad";
    el.statusPill.textContent = "Erro ao carregar";
  } finally {
    suppressAutoFeedback = false;
  }
}

async function salvarAvaliacao(){
  showError("");
  const analista = el.analista.value.trim();
  const mes = el.mes.value;
  if (!analista) {
    setMsg("Selecione o analista.");
    el.analista.focus();
    return;
  }
  if (!mes) {
    setMsg("Selecione o mês de referência.");
    el.mes.focus();
    return;
  }

  const checks = getChecks();
  const score = calcScore(checks);
  if (!el.feedback.value.trim()) {
    el.feedback.value = gerarFeedbackTexto();
  }

  const payload = {
    analista,
    yyyyMM: mes,
    checks,
    visitasMes: el.visitas.value === "" ? null : Number(el.visitas.value),
    aderenciaPct: el.aderencia.value === "" ? null : Number(el.aderencia.value),
    obsAvaliador: el.obs.value.trim(),
    feedbackFinal: el.feedback.value.trim(),
    pontuacao: score.pct,
    itensOk: score.ok,
    itensTotal: score.total,
    conceito: score.conceito,
    avaliador,
    updatedAt: serverTimestamp()
  };

  el.btnSalvar.disabled = true;
  setMsg("Salvando…");

  try {
    const ref = doc(db, COL, docId(analista, mes));
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      payload.createdAt = serverTimestamp();
    }
    await setDoc(ref, payload, { merge: true });
    el.statusPill.className = "pill pill-ok";
    el.statusPill.textContent = "Avaliação salva";
    setMsg(`Salvo: ${analista} • ${mes} • ${score.pct}% (${score.conceito}).`, true);
  } catch (err) {
    console.error(err);
    showError(err?.message || String(err));
    setMsg("Falha ao salvar. Verifique as Rules da coleção " + COL + ".");
    el.statusPill.className = "pill pill-bad";
    el.statusPill.textContent = "Erro ao salvar";
  } finally {
    el.btnSalvar.disabled = false;
  }
}

el.btnMenu.onclick = () => { window.location.href = PATH_MENU; };
el.btnSalvar.onclick = salvarAvaliacao;
el.btnGerar.onclick = () => {
  el.feedback.value = gerarFeedbackTexto();
  setMsg("Feedback gerado. Você pode editar antes de salvar.", true);
};
el.analista.addEventListener("change", carregarAvaliacao);
el.mes.addEventListener("change", carregarAvaliacao);
el.visitas.addEventListener("input", () => {
  syncVisitasCheck();
  onChecksChanged();
});
el.aderencia.addEventListener("input", onChecksChanged);
el.obs.addEventListener("input", () => {
  if (!suppressAutoFeedback && !el.feedback.value.trim()) {
    el.feedback.value = gerarFeedbackTexto();
  }
});

buildChecklist();
el.mes.value = mesAtualKey();
el.kpiTotal.textContent = String(CHECK_ITEMS.length);
updateScoreUI();

(async () => {
  try {
    await popularAnalistas();
  } catch (err) {
    console.error(err);
    showError("Não foi possível carregar a lista de analistas. Usando lista local.");
    el.analista.innerHTML = `<option value="">Selecione o analista…</option>` +
      USERS.map((n) => `<option value="${n}">${n}</option>`).join("");
  }
})();
