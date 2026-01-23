import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const userInfo = $("userInfo");
const msg = $("msg");

const inpRef = $("inpRef");
const lblPeriodo = $("lblPeriodo");

const inpFiltroCD = $("inpFiltroCD");
const inpFiltroAnalista = $("inpFiltroAnalista");

const btnPrev = $("btnPrev");
const btnNow = $("btnNow");
const btnNext = $("btnNext");
const btnCarregar = $("btnCarregar");

const btnMenu = $("btnMenu");
const btnLogout = $("btnLogout");

const tbodySemana = $("tbodySemana");

const ths = [ $("thD1"), $("thD2"), $("thD3"), $("thD4"), $("thD5") ];

let usuariosAnalistas = [];
let docsSemana = [];

function setMsg(text, ok=false){
  msg.textContent = text || "";
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function pad2(n){ return String(n).padStart(2, "0"); }

function todayISO(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function toISO(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function formatBR(iso){
  const [y,m,d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}

function safe(v){ return (v ?? "").toString().trim(); }

/** retorna a segunda-feira da semana da data */
function mondayOf(dateISO){
  const [y,m,d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m-1, d);
  const day = dt.getDay(); // 0 dom, 1 seg...
  const diff = (day === 0 ? -6 : 1 - day); // se domingo volta 6 dias
  dt.setDate(dt.getDate() + diff);
  return dt;
}

function addDays(dateObj, n){
  const dt = new Date(dateObj);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function weekDates(refISO){
  const mon = mondayOf(refISO);
  const days = [0,1,2,3,4].map(i => toISO(addDays(mon, i)));
  const start = days[0];
  const end = days[4];
  return { start, end, days };
}

async function carregarUsuariosAnalistas(){
  // coleção "usuarios" (mesma usada no admin de usuários)
  const snap = await getDocs(collection(db, "usuarios"));
  const all = snap.docs.map(d => d.data());

  // considera analista se tipo != "admin"
  usuariosAnalistas = all
    .filter(u => safe(u.email))
    .filter(u => safe(u.tipo).toLowerCase() !== "admin")
    .sort((a,b) => safe(a.email).localeCompare(safe(b.email)));
}

async function carregarAgendaSemana(daysISO){
  // Firestore não aceita "in" com >10 itens, aqui são 5 (ok)
  const q1 = query(collection(db, "agenda_dias"), where("date", "in", daysISO));
  const snap = await getDocs(q1);
  docsSemana = snap.docs.map(d => d.data());
}

function render(daysISO){
  const fCD = safe(inpFiltroCD.value).toLowerCase();
  const fA = safe(inpFiltroAnalista.value).toLowerCase();

  // Mapa: email -> date -> doc
  const map = new Map();

  for(const d of docsSemana){
    const email = (safe(d.analistaEmail) || safe(d.email) || "").toLowerCase();
    const date = safe(d.date);
    if(!email || !date) continue;

    if(!map.has(email)) map.set(email, new Map());
    map.get(email).set(date, d);
  }

  const analistas = usuariosAnalistas
    .filter(u => {
      const email = safe(u.email).toLowerCase();
      if (fA && !email.includes(fA)) return false;
      return true;
    });

  const rows = analistas.map(u => {
    const email = safe(u.email);
    const emailKey = email.toLowerCase();
    const byDay = map.get(emailKey) || new Map();

    const cells = daysISO.map(dateISO => {
      const doc = byDay.get(dateISO);

      // não lançado
      if(!doc){
        return {
          html: `<div class="cell-nao">
                   <div class="cell-title">Não lançado</div>
                   <div class="cell-sub">${formatBR(dateISO)}</div>
                 </div>`,
          ok: false
        };
      }

      const cd = safe(doc.cd);
      const atv = safe(doc.atividade);
      const obs = safe(doc.observacoes);

      // filtro CD aplicado no conteúdo (se o analista tiver lançamento mas não bate CD, fica “—”)
      if (fCD && !cd.toLowerCase().includes(fCD)) {
        return {
          html: `<div class="cell-filtrado">
                   <div class="cell-title">—</div>
                   <div class="cell-sub">Filtrado por CD</div>
                 </div>`,
          ok: false
        };
      }

      return {
        html: `<div class="cell-ok" title="${(cd+' | '+atv+' | '+obs).replaceAll('"','') }">
                 <div class="cell-title">${cd || "-"}</div>
                 <div class="cell-sub">${atv || "-"}</div>
                 <div class="cell-obs">${obs || ""}</div>
               </div>`,
        ok: !!(cd && atv)
      };
    });

    return { email, cells };
  });

  tbodySemana.innerHTML = rows.length ? rows.map(r => `
    <tr>
      <td class="col-analista"><strong>${r.email}</strong></td>
      ${r.cells.map(c => `<td class="${c.ok ? "td-ok" : "td-nao"}">${c.html}</td>`).join("")}
    </tr>
  `).join("") : `<tr><td colspan="6" class="muted">Nenhum analista encontrado.</td></tr>`;
}

async function load(){
  const refISO = inpRef.value || todayISO();
  inpRef.value = refISO;

  const { start, end, days } = weekDates(refISO);
  lblPeriodo.textContent = `${formatBR(start)} a ${formatBR(end)}`;

  // cabeçalhos com datas
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex"];
  days.forEach((d, i) => {
    ths[i].textContent = `${labels[i]} (${formatBR(d)})`;
  });

  setMsg("Carregando usuários e agenda da semana...", true);

  try{
    await carregarUsuariosAnalistas();
    await carregarAgendaSemana(days);
    render(days);

    setMsg(`OK ✅ Semana carregada | lançamentos encontrados: ${docsSemana.length}`, true);
  }catch(e){
    console.error(e);
    if (e?.code === "permission-denied") {
      setMsg("Permissão negada (Rules). Admin precisa ler usuarios e agenda_dias.", false);
      return;
    }
    if (e?.code === "failed-precondition") {
      setMsg("Firestore pediu índice. Veja o console (F12) e crie o index.", false);
      return;
    }
    setMsg("Erro ao carregar. Veja o console (F12).", false);
  }
}

function shiftWeek(deltaDays){
  const refISO = inpRef.value || todayISO();
  const [y,m,d] = refISO.split("-").map(Number);
  const dt = new Date(y, m-1, d);
  dt.setDate(dt.getDate() + deltaDays);
  inpRef.value = toISO(dt);
  load();
}

function bind(){
  btnMenu.onclick = () => window.location.href = "./admin-menu.html";
  btnLogout.onclick = async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  };

  btnCarregar.onclick = load;
  btnPrev.onclick = () => shiftWeek(-7);
  btnNext.onclick = () => shiftWeek(7);
  btnNow.onclick = () => { inpRef.value = todayISO(); load(); };

  inpFiltroCD.oninput = () => load(); // refaz (simples e seguro)
  inpFiltroAnalista.oninput = () => load();

  inpRef.onchange = load;
}

onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "./index.html";
  userInfo.textContent = `Logado como: ${(user.email||"").toLowerCase()}`;

  inpRef.value = todayISO();
  bind();
  load();
});