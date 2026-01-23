import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const boot = $("boot");
boot.textContent = "JS carregou ✅ (admin_mes.js)";
boot.style.color = "#065f46";

const userInfo = $("userInfo");
const msg = $("msg");

const inpMes = $("inpMes");
const lblPeriodo = $("lblPeriodo");
const inpFiltroCD = $("inpFiltroCD");
const inpFiltroAnalista = $("inpFiltroAnalista");

const tbodyResumo = $("tbodyResumo");
const tbodyDet = $("tbodyDet");

const btnCarregar = $("btnCarregar");
const btnLimpar = $("btnLimpar");

let raw = [];

function setMsg(text, ok=false){
  msg.textContent = text || "";
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function pad2(n){ return String(n).padStart(2,"0"); }

function monthKeyNow(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}`;
}

function monthStartEnd(monthKey){
  const [y,m] = monthKey.split("-").map(Number);
  const start = `${y}-${pad2(m)}-01`;
  const last = new Date(y, m, 0).getDate();
  const end = `${y}-${pad2(m)}-${pad2(last)}`;
  return { start, end };
}

function formatBR(iso){
  const [y,m,d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}

function safe(v){ return (v ?? "").toString().trim(); }

function parseISO(d){
  const s = safe(d.date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)){
    const [dd,mm,yy] = s.split("/");
    return `${yy}-${mm}-${dd}`;
  }
  return null;
}

function render(){
  const fCD = safe(inpFiltroCD.value).toLowerCase();
  const fA  = safe(inpFiltroAnalista.value).toLowerCase();

  const view = raw
    .map(d => ({
      ...d,
      _iso: parseISO(d),
      _analista: safe(d.analistaEmail) || safe(d.email) || safe(d.uid) || "—"
    }))
    .filter(d => d._iso)
    .filter(d => {
      const cd = safe(d.cd).toLowerCase();
      const an = safe(d._analista).toLowerCase();
      if (fCD && !cd.includes(fCD)) return false;
      if (fA && !an.includes(fA)) return false;
      return true;
    })
    .sort((a,b)=> (a._iso||"").localeCompare(b._iso||""));

  const map = new Map();
  for(const d of view){
    const cd = safe(d.cd) || "—";
    const key = `${d._analista}||${cd}`;
    if(!map.has(key)) map.set(key, { analista:d._analista, cd, dates:[] });
    map.get(key).dates.push(d._iso);
  }

  const resumo = Array.from(map.values())
    .map(r => ({ ...r, dates: r.dates.sort() }))
    .sort((a,b)=> b.dates.length - a.dates.length);

  tbodyResumo.innerHTML = resumo.length
    ? resumo.map(r=>`
      <tr>
        <td><strong>${r.analista}</strong></td>
        <td>${r.cd}</td>
        <td><strong>${r.dates.length}</strong></td>
        <td>${r.dates.map(dt=>`<span class="chip">${formatBR(dt)}</span>`).join(" ")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="muted">Nenhum registro encontrado.</td></tr>`;

  tbodyDet.innerHTML = view.length
    ? view.map(d=>`
      <tr>
        <td><strong>${formatBR(d._iso)}</strong></td>
        <td>${d._analista}</td>
        <td>${safe(d.cd) || "-"}</td>
        <td>${safe(d.atividade) || "-"}</td>
        <td>${safe(d.observacoes) || "-"}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5" class="muted">Nenhum registro encontrado.</td></tr>`;
}

async function loadMonth(){
  const monthKey = inpMes.value || monthKeyNow();
  inpMes.value = monthKey;

  const { start, end } = monthStartEnd(monthKey);
  lblPeriodo.textContent = `${formatBR(start)} a ${formatBR(end)}`;

  setMsg("Carregando Firestore...", true);
  raw = [];

  try{
    const q = query(collection(db, "agenda_dias"), where("monthKey", "==", monthKey));
    const snap = await getDocs(q);
    raw = snap.docs.map(doc => ({ id: doc.id, ...(doc.data()||{}) }));
    render();
    setMsg(`OK: ${raw.length} registros em ${monthKey}.`, true);
  }catch(e){
    console.error(e);
    setMsg("Erro ao carregar Firestore. Veja o console (F12).", false);
  }
}

btnCarregar.addEventListener("click", loadMonth);

btnLimpar.addEventListener("click", ()=>{
  inpFiltroCD.value = "";
  inpFiltroAnalista.value = "";
  render();
  setMsg("Filtros limpos.", true);
});

inpFiltroCD.addEventListener("input", render);
inpFiltroAnalista.addEventListener("input", render);
inpMes.addEventListener("change", loadMonth);

inpMes.value = monthKeyNow();

onAuthStateChanged(auth, (user)=>{
  if(!user){
    userInfo.textContent = "Não logado.";
    setMsg("Você não está logado. Vá para o login.", false);
    return;
  }
  userInfo.textContent = `Logado como: ${(user.email||"").toLowerCase()}`;
  loadMonth();
});