import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const userInfo = $("userInfo");
const msg = $("msg");

const inpData = $("inpData");
const lblDataBR = $("lblDataBR");
const inpFiltro = $("inpFiltro");

const btnCarregar = $("btnCarregar");
const btnHoje = $("btnHoje");
const btnMenu = $("btnMenu");
const btnLogout = $("btnLogout");

const tbodyDia = $("tbodyDia");

const kpiTotal = $("kpiTotal");
const kpiLancados = $("kpiLancados");
const kpiNao = $("kpiNao");

let usuariosAnalistas = []; // vem de /usuarios
let agendaDia = [];         // vem de /agenda_dias

function setMsg(text, ok=false){
  msg.textContent = text || "";
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function pad2(n){ return String(n).padStart(2,"0"); }

function todayISO(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function formatBR(iso){
  const [y,m,d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}

function safe(v){ return (v ?? "").toString().trim(); }

function render(){
  const f = safe(inpFiltro.value).toLowerCase();

  // mapa de lançamentos por email (1 por analista no dia)
  const map = new Map();
  agendaDia.forEach(d => {
    const email = (safe(d.analistaEmail) || safe(d.email) || "").toLowerCase();
    if (!email) return;
    map.set(email, d);
  });

  // montar linhas para TODOS os analistas
  const linhas = usuariosAnalistas.map(u => {
    const email = (safe(u.email) || "").toLowerCase();
    const doc = map.get(email);
    if (!doc) {
      return {
        email: u.email,
        cd: "",
        atividade: "",
        observacoes: "",
        status: "NAO_LANCADO"
      };
    }
    return {
      email: u.email,
      cd: safe(doc.cd),
      atividade: safe(doc.atividade),
      observacoes: safe(doc.observacoes),
      status: "LANCADO"
    };
  });

  const filtrado = linhas.filter(l => {
    if (!f) return true;
    return (
      (l.email || "").toLowerCase().includes(f) ||
      (l.cd || "").toLowerCase().includes(f) ||
      (l.atividade || "").toLowerCase().includes(f)
    );
  });

  // KPIs
  const total = linhas.length;
  const lanc = linhas.filter(x => x.status === "LANCADO").length;
  const nao = total - lanc;

  kpiTotal.textContent = total;
  kpiLancados.textContent = lanc;
  kpiNao.textContent = nao;

  tbodyDia.innerHTML = filtrado.length ? filtrado.map(l => `
    <tr class="${l.status === "LANCADO" ? "row-ok" : "row-warn"}">
      <td><strong>${l.email}</strong></td>
      <td>${l.status === "LANCADO" ? (l.cd || "-") : "<span class='muted'>—</span>"}</td>
      <td>${l.status === "LANCADO" ? (l.atividade || "-") : "<span class='muted'>—</span>"}</td>
      <td>${l.status === "LANCADO" ? (l.observacoes || "-") : "<span class='muted'>—</span>"}</td>
      <td>
        ${l.status === "LANCADO"
          ? "<span class='badge badge-ok'>Lançado</span>"
          : "<span class='badge badge-warn'>Não lançado</span>"
        }
      </td>
    </tr>
  `).join("") : `<tr><td colspan="5" class="muted">Nenhum registro para os filtros.</td></tr>`;
}

async function carregarUsuariosAnalistas(){
  // Usa coleção /usuarios para listar analistas
  // Aceita tipo "analista" OU qualquer um que não seja "admin"
  const snap = await getDocs(collection(db, "usuarios"));
  const all = snap.docs.map(d => d.data());

  // Ajuste simples: considera analista se tipo != "admin"
  usuariosAnalistas = all
    .filter(u => safe(u.email))
    .filter(u => safe(u.tipo).toLowerCase() !== "admin")
    .sort((a,b)=> safe(a.email).localeCompare(safe(b.email)));
}

async function carregarAgendaDia(dateISO){
  // Busca todos lançamentos do dia (admin vê todos)
  const q = query(collection(db, "agenda_dias"), where("date", "==", dateISO));
  const snap = await getDocs(q);
  agendaDia = snap.docs.map(d => d.data());
}

async function load(){
  const dateISO = inpData.value || todayISO();
  inpData.value = dateISO;
  lblDataBR.textContent = formatBR(dateISO);

  setMsg("Carregando usuários e agenda...", true);

  try{
    await carregarUsuariosAnalistas();
    await carregarAgendaDia(dateISO);
    render();
    setMsg(`OK ✅ Dia ${formatBR(dateISO)} | lançamentos encontrados: ${agendaDia.length}`, true);
  }catch(e){
    console.error(e);
    if (e?.code === "permission-denied") {
      setMsg("Permissão negada (Rules). Admin precisa ler usuarios e agenda_dias.", false);
      return;
    }
    setMsg("Erro ao carregar. Veja o console (F12).", false);
  }
}

function bind(){
  btnMenu.onclick = () => window.location.href = "./admin-menu.html";
  btnLogout.onclick = async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  };

  btnCarregar.onclick = load;
  btnHoje.onclick = () => { inpData.value = todayISO(); load(); };

  inpFiltro.oninput = render;
  inpData.onchange = load;
}

onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "./index.html";
  userInfo.textContent = `Logado como: ${(user.email||"").toLowerCase()}`;

  inpData.value = todayISO();
  lblDataBR.textContent = formatBR(inpData.value);

  bind();
  load();
});