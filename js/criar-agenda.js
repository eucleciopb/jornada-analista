// ../js/criar-agenda.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where,
  doc, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ============================================================
   ✅ FERIADOS 2026 automaticamente aplicados no calendário
============================================================ */
const FERIADOS_2026 = {
  "2026-01-01": { cd: "FERIADO", atividade: "Feriado – Confraternização Universal" },
  "2026-02-16": { cd: "FERIADO", atividade: "Feriado – Carnaval (Segunda)" },
  "2026-02-17": { cd: "FERIADO", atividade: "Feriado – Carnaval (Terça)" },
  "2026-04-03": { cd: "FERIADO", atividade: "Feriado – Sexta‑Feira Santa" },
  "2026-04-21": { cd: "FERIADO", atividade: "Feriado – Tiradentes" },
  "2026-05-01": { cd: "FERIADO", atividade: "Feriado – Dia do Trabalho" },
  "2026-06-04": { cd: "FERIADO", atividade: "Feriado – Corpus Christi" },
  "2026-09-07": { cd: "FERIADO", atividade: "Feriado – Independência do Brasil" },
  "2026-10-12": { cd: "FERIADO", atividade: "Feriado – Nossa Sra. Aparecida" },
  "2026-11-02": { cd: "FERIADO", atividade: "Feriado – Finados" },
  "2026-11-15": { cd: "FERIADO", atividade: "Feriado – Proclamação da República" },
  "2026-11-20": { cd: "FERIADO", atividade: "Feriado – Dia da Consciência Negra" },
  "2026-12-25": { cd: "FERIADO", atividade: "Feriado – Natal" }
};

/* ============================================================
   CDs fallback
============================================================ */
const CDS_RAW = [
  "CD - Alagoinhas","CD - Andradina","CD - Angra dos Reis","CD - Aparecida de Goiânia","CD - Araçatuba","CD - Arapiraca","CD - Araraquara",
  "CD - Balsas","CD - Barbalha","CD - Barra do Garca","CD - Barreiras","CD - Barretos","CD - Barueri","CD - Bauru","CD - Belém","CD - Boituva",
  "CD - Bom Jesus da Lapa","CD - Brumado","CD - Cachoeiro de Itapemirim","CD - Camaçari","CD - Campina Grande","CD - Campinas","CD - Campo Grande MS",
  "CD - Campo Grande RJ","CD - Campos dos Goytacazes","CD - Caraguatatuba","CD - Cariacica","CD - Carpina","CD - Caruaru","CD - Cascavel","CD - Catanduva",
  "CD - Caucaia","CD - Caxias","CD - Coimbra","CD - Conde","CD - Conselheiro Lafaiete","CD - Conselheiro Lafaiete","CD - Contagem","CD - Coxim","CD - Cuiabá",
  "CD - Divinópolis","CD - Dourados","CD - Duque de Caxias","CD - Eunápolis","CD - Eusebio","CD - Feira de Santana","CD - Feira de Santana",
  "CD - Fernandópolis","CD - Fernandópolis","CD - Fernandópolis","CD - Fernandópolis","CD - Floriano","CD - Garanhuns","CD - Governador Valadares","CD - Guarujá",
  "CD - Guarulhos Taboão","CD - Iguatu","CD - Imperatriz","CD - Interlagos","CD - Iporá","CD - Irece","CD - Itabaiana","CD - Itaberaba","CD - Itabuna",
  "CD - Itapeva","CD - Itapissuma","CD - Itumbiara","CD - Jaboatão dos Guararapes","CD - Jacobina","CD - Jaguaré","CD - Jequié","CD - Juazeiro","CD - Juiz de Fora",
  "CD - Jundiaí","CD - Londrina","CD - Macaiba","CD - Maceió","CD - Marília","CD - Mogi-Mirim","CD - Montes Claros","CD - Mossoró","CD - Muriaé",
  "CD - Nossa Senhora do Socorro","CD - Nova Friburgo","CD - Palhoça","CD - Paranaíba","CD - Parnaiba","CD - Parnaiba","CD - Passos","CD - Passos","CD - Patos",
  "CD - Paulo Afonso","CD - Petrolina","CD - Petrópolis","CD - Picos","CD - Piracicaba","CD - Poços de Caldas","CD - Poços de Caldas","CD - Porto Velho",
  "CD - Pouso Alegre","CD - Presidente Prudente","CD - Recife","CD - Registro","CD - Ribeirão Preto","CD - Rio Branco","CD - Rio das Ostras","CD - Rio Verde",
  "CD - Rondonópolis","CD - Salto","CD - Salvador","CD - Salvador Leste","CD - Santa Inês","CD - Santo Antonio de Jesus","CD - São Bernardo","CD - São Cristovão",
  "CD - São Gonçalo","CD - São João de Meriti","CD - São José do Rio Preto","CD - São José dos Campos","CD - São José dos Pinhais","CD - São Luis","CD - São Mateus",
  "CD - São Pedro da Aldeia","CD - Sapucaia do Sul","CD - Serra Talhada","CD - Serrinha","CD - Sete Lagoas","CD - Sete Lagoas","CD - Sinop","CD - Sobral","CD - Sousa",
  "CD - Taboão da Serra","CD - Taguatinga","CD - Taubaté","CD - Teixeira de Freitas","CD - Teresina","CD - Três Lagoas","CD - Uberaba","CD - Varginha",
  "CD - Vila Guilherme","CD - Vitória da Conquista","CD - Volta Redonda","Home Office","Férias","Corporativo"
];

/* ============================================================
   FIREBASE CONFIG
============================================================ */
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

/* ============================================================
   CONFIG
============================================================ */
const AGENDA_COLLECTION = "agenda_dias";
const CDS_COLLECTION = "cds";

const tbody = document.getElementById("tbodyAgenda");
const monthPicker = document.getElementById("monthPicker");
const btnSalvar = document.getElementById("btnSalvar");
const btnMenu = document.getElementById("btnMenu");
const btnLogout = document.getElementById("btnLogout");
const msg = document.getElementById("msg");
const errBox = document.getElementById("errBox");
const cdList = document.getElementById("cdList");
const userInfo = document.getElementById("userInfo");
const statusPill = document.getElementById("statusPill");

/* ============================================================
   Helpers
============================================================ */
function safeParse(raw){ try { return JSON.parse(raw); } catch { return null; } }
function slug(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
function showErr(t){ if(errBox){errBox.style.display=t?"block":"none"; errBox.textContent=t;} }
function setMsg(t, type="info"){ if(!msg)return; msg.textContent=t||""; msg.style.color = type==="success"?"#22c55e":type==="error"?"#ef4444":"#e5e7eb"; }
function setStatus(t){ if(statusPill) statusPill.textContent=`Status: ${t}`; }

function pad2(n){ return String(n).padStart(2,"0"); }
function isoDate(y, m1, d){ return `${y}-${pad2(m1)}-${pad2(d)}`; }
function brDate(y, m1, d){ return `${pad2(d)}/${pad2(m1)}/${y}`; }
function weekdayPt(d){ return ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()]; }
function daysInMonth(y,m0){ return new Date(y,m0+1,0).getDate(); }

/* ============================================================
   LOGIN
============================================================ */
function getCurrentUserName(){
  const s = safeParse(localStorage.getItem("user_session"));
  if(s?.nome) return s.nome;
  return (localStorage.getItem("usuarioLogado")||"").trim();
}

const usuarioNome = getCurrentUserName();
if(!usuarioNome) window.location.href="../index.html";
const usuarioKey = slug(usuarioNome);

/* ============================================================
   ATIVIDADES
============================================================ */
const ATIVIDADES = [
  "Analise Interna",
  "Deslocamento",
  "Aplicação de Treinamento",
  "Rota",
  "Plano de Ação com os Gestores",
  "Reunião GRC ou Diretor",
  "Alinhamento com outras áreas"
];

function atividadeOptions(sel=""){
  return [
    `<option value="">-- selecione --</option>`,
    ...ATIVIDADES.map(a=>`<option value="${a}" ${a===sel?"selected":""}>${a}</option>`)
  ].join("");
}

/* ============================================================
   ✅ RENDERIZAÇÃO DO MÊS (AQUI APLICAMOS FERIADOS)
============================================================ */
function renderMonthSkeleton(yyyyMM){
  if(!tbody) return;
  tbody.innerHTML="";

  const [yStr, mStr] = yyyyMM.split("-");
  const y = Number(yStr), m1 = Number(mStr), m0 = m1-1;
  const total = daysInMonth(y,m0);

  for(let d=1; d<=total; d++){
    const dateISO = isoDate(y,m1,d);
    const br = brDate(y,m1,d);
    const dt = new Date(y,m0,d);
    const dia = weekdayPt(dt);
    const sunday = dt.getDay()===0;

    const tr = document.createElement("tr");
    tr.dataset.date = dateISO;
    tr.dataset.sunday = sunday?"1":"0";

    if(sunday){
      tr.classList.add("blocked");
      tr.innerHTML = `
        <td>${br}</td>
        <td>${dia}</td>
        <td colspan="3">Domingo bloqueado</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${br}</td>
        <td>${dia}</td>
        <td><input class="field" data-field="cd" list="cdList"></td>
        <td><select class="field" data-field="atividade">${atividadeOptions("")}</select></td>
        <td><textarea class="field" data-field="obs" placeholder="Clique para editar..."></textarea></td>
      `;

      /* ✅ SE FOR FERIADO — APLICA */
      const feriado = FERIADOS_2026[dateISO];
      if(feriado){
        tr.classList.add("feriado");
        tr.querySelector("[data-field='cd']").value = feriado.cd;
        tr.querySelector("[data-field='atividade']").value = feriado.atividade;
        tr.title = feriado.atividade;
      }
    }

    tbody.appendChild(tr);
  }
}

/* ============================================================
   ✅ LOAD CDs
============================================================ */
async function loadCDsToDatalist(){
  let cds = [];
  try {
    const snap = await getDocs(query(collection(db,CDS_COLLECTION), where("ativo","==",true)));
    snap.forEach(d=>{ if(d.data().nome) cds.push(d.data().nome); });
  } catch {}

  cds = cds.length ? cds : CDS_RAW;

  cdList.innerHTML = cds.map(c=>`<option value="${c}">`).join("");
}

/* ============================================================
   ✅ LOAD DO FIRESTORE
============================================================ */
async function loadMonthFromFirestore(yyyyMM){
  const snap = await getDocs(
    query(
      collection(db,AGENDA_COLLECTION),
      where("uidKey","==",usuarioKey),
      where("yyyyMM","==",yyyyMM)
    )
  );

  const map = {};
  snap.forEach(d=>map[d.data().data]=d.data());

  [...tbody.querySelectorAll("tr[data-date]")].forEach(tr=>{
    if(tr.dataset.sunday==="1") return;
    const saved = map[tr.dataset.date];
    if(saved){
      tr.querySelector("[data-field='cd']").value = saved.cd||"";
      tr.querySelector("[data-field='atividade']").value = saved.atividade||"";
      tr.querySelector("[data-field='obs']").value = saved.obs||"";
    }
  });
}

/* ============================================================
   ✅ SAVE FIRESTORE
============================================================ */
async function saveMonthToFirestore(yyyyMM){
  const batch = writeBatch(db);

  [...tbody.querySelectorAll("tr[data-date]")].forEach(tr=>{
    if(tr.dataset.sunday==="1") return;

    const dataISO = tr.dataset.date;
    const cd = tr.querySelector("[data-field='cd']").value.trim();
    const atividade = tr.querySelector("[data-field='atividade']").value;
    const obs = tr.querySelector("[data-field='obs']").value.trim();

    const ref = doc(db,AGENDA_COLLECTION,`${usuarioKey}_${dataISO}`);

    if(!cd && !atividade && !obs){
      batch.delete(ref);
    } else {
      batch.set(ref,{
        uidKey: usuarioKey,
        usuarioNome,
        data: dataISO,
        yyyyMM,
        cd,
        atividade,
        obs,
        updatedAt: serverTimestamp()
      },{merge:true});
    }
  });

  await batch.commit();
  setMsg("Salvo ✅", "success");
}

/* ============================================================
   ✅ EVENTOS
============================================================ */
btnSalvar?.addEventListener("click",()=>saveMonthToFirestore(monthPicker.value));
monthPicker?.addEventListener("change", async()=>{
  renderMonthSkeleton(monthPicker.value);
  await loadMonthFromFirestore(monthPicker.value);
});

/* ============================================================
   ✅ INIT
============================================================ */
(async function init(){
  const now = new Date();
  if(monthPicker) monthPicker.value = `${now.getFullYear()}-${pad2(now.getMonth()+1)}`;

  renderMonthSkeleton(monthPicker.value);
  await loadCDsToDatalist();
  await loadMonthFromFirestore(monthPicker.value);

  setMsg("Pronto. Preencha e clique em Salvar ✅", "success");
})();