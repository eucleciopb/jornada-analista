import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const userInfo = $("userInfo");
const msg = $("msg");

const inpMes = $("inpMes");
const lblPeriodo = $("lblPeriodo");
const inpFiltroCD = $("inpFiltroCD");
const inpFiltroAnalista = $("inpFiltroAnalista");

const tbodyResumo = $("tbodyResumo");
const tbodyDet = $("tbodyDet");

let currentUser = null;
let dados = [];

function setMsg(text = "", ok = false) {
  msg.textContent = text;
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function hojeMes() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function periodoMes(mes) {
  const [y, m] = mes.split("-").map(Number);
  const inicio = `${y}-${pad(m)}-01`;
  const fim = `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`;
  return { inicio, fim };
}

function formatBR(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function render() {
  const fCD = inpFiltroCD.value.toLowerCase();
  const fA = inpFiltroAnalista.value.toLowerCase();

  const filtrado = dados.filter(d => {
    if (fCD && !d.cd?.toLowerCase().includes(fCD)) return false;
    if (fA && !d.analistaEmail?.toLowerCase().includes(fA)) return false;
    return true;
  });

  // RESUMO
  const map = {};
  filtrado.forEach(d => {
    const key = `${d.analistaEmail}||${d.cd}`;
    if (!map[key]) map[key] = { analista: d.analistaEmail, cd: d.cd, dias: [], };
    map[key].dias.push(d.date);
  });

  const resumo = Object.values(map);

  tbodyResumo.innerHTML = resumo.length
    ? resumo.map(r => `
      <tr>
        <td><strong>${r.analista}</strong></td>
        <td>${r.cd}</td>
        <td><strong>${r.dias.length}</strong></td>
        <td>${r.dias.map(d => `<span class="chip">${formatBR(d)}</span>`).join(" ")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4">Nenhum registro</td></tr>`;

  // DETALHADO
  tbodyDet.innerHTML = filtrado.length
    ? filtrado.map(d => `
      <tr>
        <td><strong>${formatBR(d.date)}</strong></td>
        <td>${d.analistaEmail}</td>
        <td>${d.cd}</td>
        <td>${d.atividade || "-"}</td>
        <td>${d.observacoes || "-"}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5">Nenhum registro</td></tr>`;
}

async function carregarMes() {
  const mes = inpMes.value;
  if (!mes) return;

  const { inicio, fim } = periodoMes(mes);
  lblPeriodo.textContent = `${formatBR(inicio)} a ${formatBR(fim)}`;

  try {
    const q = query(
      collection(db, "agenda_dias"),
      where("monthKey", "==", mes)
    );

    const snap = await getDocs(q);
    dados = snap.docs.map(d => d.data());
    render();
    setMsg(`Carregado ${dados.length} registros`, true);

  } catch (e) {
    console.error(e);
    setMsg("Erro ao carregar dados");
  }
}

function bind() {
  $("btnMenu").onclick = () => window.location.href = "./menu.html";
  $("btnLogout").onclick = async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  };

  $("btnCarregar").onclick = carregarMes;
  $("btnLimpar").onclick = () => {
    inpFiltroCD.value = "";
    inpFiltroAnalista.value = "";
    render();
  };

  inpFiltroCD.oninput = render;
  inpFiltroAnalista.oninput = render;
}

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "./index.html";
  currentUser = user;
  userInfo.textContent = `Logado como ${user.email}`;
  inpMes.value = hojeMes();
  bind();
  carregarMes();
});