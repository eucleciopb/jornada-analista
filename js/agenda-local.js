// js/agenda-local.js
// Agenda 100% local (sem Firebase) por usuário + mês

/* =========================
   CDs (coloque aqui sua lista completa se quiser)
   - Pode deixar vazio que continua funcionando, só perde autocomplete.
========================= */
const CDS = [
  "CD - Aparecida de Goiânia",
  "CD - Boituva",
  "CD - Jaguaré",
  "CD - Salvador",
  "CD - Fernandópolis"
  // ✅ se quiser, eu coloco a lista completa gigante aqui também
].sort((a, b) => a.localeCompare(b, "pt-BR"));

/* =========================
   Atividades
========================= */
const ATIVIDADES = [
  "Analise Interna",
  "Dia Interno",
  "Rota",
  "Plano de Ação com os Gestores",
  "Reunião GRC ou Diretor",
  "Alinhamento com outras áreas"
];

/* =========================
   UI
========================= */
const tbody = document.getElementById("tbodyAgenda");
const monthPicker = document.getElementById("monthPicker");
const btnSalvar = document.getElementById("btnSalvar");
const btnMenu = document.getElementById("btnMenu");
const btnLogout = document.getElementById("btnLogout");
const msg = document.getElementById("msg");
const userInfo = document.getElementById("userInfo");
const cdList = document.getElementById("cdList");

/* =========================
   Sessão (localStorage)
========================= */
const usuario = (localStorage.getItem("usuarioLogado") || "").trim();
if (!usuario) window.location.href = "index.html";
userInfo.textContent = `Usuário: ${usuario}`;

/* =========================
   NAV
========================= */
btnMenu.addEventListener("click", () => window.location.href = "menu.html");
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
});

/* =========================
   Helpers
========================= */
function setMsg(text, type = "info") {
  msg.textContent = text || "";
  msg.style.color = (type === "success") ? "#22c55e" : (type === "error" ? "#ef4444" : "#d1d5db");
}

function pad2(n) { return String(n).padStart(2, "0"); }

function toMonthKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function daysInMonth(y, m0) {
  return new Date(y, m0 + 1, 0).getDate();
}

function weekdayPt(d) {
  return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()];
}

function formatISODate(y, m1, d) {
  return `${y}-${pad2(m1)}-${pad2(d)}`;
}

function formatBRDate(y, m1, d) {
  return `${pad2(d)}/${pad2(m1)}/${y}`;
}

function buildAtividadeOptions(selected = "") {
  const opts = [`<option value="">-- selecione --</option>`];
  for (const a of ATIVIDADES) {
    opts.push(`<option value="${a}" ${a === selected ? "selected" : ""}>${a}</option>`);
  }
  return opts.join("");
}

function storageKey(user, yyyyMM) {
  return `agenda_${user}_${yyyyMM}`;
}

function loadMonth(user, yyyyMM) {
  const raw = localStorage.getItem(storageKey(user, yyyyMM));
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

function saveMonth(user, yyyyMM, data) {
  localStorage.setItem(storageKey(user, yyyyMM), JSON.stringify(data));
}

/* =========================
   Autocomplete CDs
========================= */
cdList.innerHTML = CDS.map(cd => `<option value="${cd}"></option>`).join("");

/* =========================
   Render mês
========================= */
function renderMonth(yyyyMM) {
  tbody.innerHTML = "";
  setMsg("");

  const [yStr, mStr] = yyyyMM.split("-");
  const y = Number(yStr);
  const m1 = Number(mStr);
  const m0 = m1 - 1;

  const saved = loadMonth(usuario, yyyyMM);
  const total = daysInMonth(y, m0);

  for (let day = 1; day <= total; day++) {
    const dt = new Date(y, m0, day);
    const sunday = dt.getDay() === 0;

    const iso = formatISODate(y, m1, day);
    const br = formatBRDate(y, m1, day);
    const dia = weekdayPt(dt);

    const row = saved[iso] || { cd: "", atividade: "", obs: "" };

    const tr = document.createElement("tr");
    tr.dataset.date = iso;
    tr.dataset.sunday = sunday ? "1" : "0";

    if (sunday) {
      tr.innerHTML = `
        <td>${br}</td>
        <td>${dia}</td>
        <td>${usuario}</td>
        <td colspan="3" style="opacity:.7;">Domingo bloqueado</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${br}</td>
        <td>${dia}</td>
        <td>${usuario}</td>
        <td><input data-field="cd" list="cdList" placeholder="Pesquisar CD..." value="${row.cd || ""}"></td>
        <td><select data-field="atividade">${buildAtividadeOptions(row.atividade || "")}</select></td>
        <td><input data-field="obs" placeholder="Observações..." value="${row.obs || ""}"></td>
      `;
    }

    tbody.appendChild(tr);
  }
}

/* =========================
   Salvar
========================= */
btnSalvar.addEventListener("click", () => {
  const yyyyMM = monthPicker.value;
  if (!yyyyMM) return setMsg("Selecione um mês.", "error");

  const data = loadMonth(usuario, yyyyMM);

  const rows = [...tbody.querySelectorAll("tr[data-date]")];
  for (const tr of rows) {
    if (tr.dataset.sunday === "1") continue;

    const date = tr.dataset.date;
    const cd = tr.querySelector("[data-field='cd']").value.trim();
    const atividade = tr.querySelector("[data-field='atividade']").value;
    const obs = tr.querySelector("[data-field='obs']").value.trim();

    // se vazio, remove do objeto pra não poluir
    if (!cd && !atividade && !obs) {
      delete data[date];
      continue;
    }

    data[date] = { cd, atividade, obs };
  }

  saveMonth(usuario, yyyyMM, data);
  setMsg("Salvo ✅", "success");
});

/* =========================
   Init
========================= */
const now = new Date();
monthPicker.value = toMonthKey(now);
renderMonth(monthPicker.value);

monthPicker.addEventListener("change", () => {
  if (!monthPicker.value) return;
  renderMonth(monthPicker.value);
});
