// js/agenda-view.js
// Visualização da agenda (ordenada por data) - 100% localStorage

const tbody = document.getElementById("tbodyAgendaView");
const monthPicker = document.getElementById("monthPicker");
const msg = document.getElementById("msg");
const userInfo = document.getElementById("userInfo");
const btnMenu = document.getElementById("btnMenu");
const btnLogout = document.getElementById("btnLogout");

// sessão
const usuario = (localStorage.getItem("usuarioLogado") || "").trim();
if (!usuario) window.location.href = "index.html";
userInfo.textContent = `Usuário: ${usuario}`;

// navegação
btnMenu.addEventListener("click", () => window.location.href = "menu.html");
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
});

function setMsg(text) {
  msg.textContent = text || "";
  msg.style.color = "#d1d5db";
}

function pad2(n){ return String(n).padStart(2,"0"); }
function toMonthKey(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}`; }

function weekdayPtFromISO(iso){
  const d = new Date(iso + "T00:00:00");
  return ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()];
}
function toBR(iso){
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function storageKey(user, yyyyMM){
  return `agenda_${user}_${yyyyMM}`;
}

function loadMonth(user, yyyyMM){
  const raw = localStorage.getItem(storageKey(user, yyyyMM));
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

function render(yyyyMM){
  tbody.innerHTML = "";

  const data = loadMonth(usuario, yyyyMM);
  const dates = Object.keys(data).sort((a,b) => a.localeCompare(b)); // ✅ classificado por data

  if (dates.length === 0) {
    setMsg("Nenhum registro encontrado neste mês.");
    return;
  }

  setMsg("");

  for (const iso of dates) {
    const item = data[iso] || {};
    const tr = document.createElement("tr");

    const cd = (item.cd || "").trim();
    const atividade = (item.atividade || "").trim();
    const obs = (item.obs || "").trim();

    tr.innerHTML = `
      <td>${toBR(iso)}</td>
      <td>${weekdayPtFromISO(iso)}</td>
      <td>${cd || "-"}</td>
      <td>${atividade || "-"}</td>
      <td>${obs || "-"}</td>
    `;

    // se tiver cd e atividade, dá destaque leve
    if (cd && atividade) tr.classList.add("agenda-ok");

    tbody.appendChild(tr);
  }
}

// init
const now = new Date();
monthPicker.value = toMonthKey(now);
render(monthPicker.value);

monthPicker.addEventListener("change", () => {
  if (!monthPicker.value) return;
  render(monthPicker.value);
});
