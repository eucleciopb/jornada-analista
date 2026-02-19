import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where,
  doc, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* =========================
   CDs (lista completa) - FALLBACK GARANTIDO
   - vamos deduplicar e ordenar antes de usar
========================= */
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
  "CD - Vila Guilherme","CD - Vitória da Conquista","CD - Volta Redonda"
];

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
   CONFIG DO BANCO
========================= */
const AGENDA_COLLECTION = "agenda_dias"; // sua rules já tem
const CDS_COLLECTION = "cds";            // opcional (se existir)

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
const errBox = document.getElementById("errBox");
const cdList = document.getElementById("cdList");
const statusPill = document.getElementById("statusPill");

/* =========================
   PATHS (PADRÃO DO SEU PROJETO)
   - esta tela está em: /html usuarios/...
========================= */
const PATH_INDEX = "../index.html";
const PATH_MENU  = "../html menus/menu.html";

/* =========================
   LOGIN (SEU PADRÃO)
========================= */
const usuarioNome = (localStorage.getItem("usuarioLogado") || "").trim();
if (!usuarioNome) window.location.href = PATH_INDEX;

// chave estável para salvar docs (não depende de auth)
const usuarioKey = (localStorage.getItem("usuarioKey") || slug(usuarioNome)).trim();
localStorage.setItem("usuarioKey", usuarioKey);

if (userInfo) userInfo.textContent = `Usuário: ${usuarioNome}`;

/* =========================
   ATIVIDADES
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
   HELPERS
========================= */
function showErr(text) {
  if (!errBox) return;
  errBox.style.display = text ? "block" : "none";
  errBox.textContent = text || "";
}

function setMsg(text, type = "info") {
  if (!msg) return;
  msg.textContent = text || "";
  msg.style.color =
    type === "success" ? "#22c55e" :
    type === "error" ? "#ef4444" :
    "#e5e7eb";
}

function setStatus(text) {
  if (!statusPill) return;
  statusPill.textContent = `Status: ${text}`;
}

function pad2(n) { return String(n).padStart(2, "0"); }
function toMonthKey(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; }
function daysInMonth(y, m0) { return new Date(y, m0 + 1, 0).getDate(); }
function weekdayPt(d) { return ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()]; }
function isoDate(y, m1, d) { return `${y}-${pad2(m1)}-${pad2(d)}`; }
function brDate(y, m1, d) { return `${pad2(d)}/${pad2(m1)}/${y}`; }

function slug(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function atividadeOptions(selected = "") {
  const opts = [`<option value="">-- selecione --</option>`];
  for (const a of ATIVIDADES) {
    opts.push(`<option value="${a}" ${a === selected ? "selected" : ""}>${a}</option>`);
  }
  return opts.join("");
}

function normalizeCDList(arr) {
  return [...new Set((arr || []).map(s => (s || "").trim()).filter(Boolean))]
    .sort((a,b) => a.localeCompare(b, "pt-BR"));
}

/* =========================
   1) SEMPRE RENDERIZA O MÊS
========================= */
function renderMonthSkeleton(yyyyMM) {
  if (!tbody) return;

  tbody.innerHTML = "";
  showErr("");
  setMsg("");
  setStatus("carregado (tabela)");

  const [yStr, mStr] = yyyyMM.split("-");
  const y = Number(yStr);
  const m1 = Number(mStr);
  const m0 = m1 - 1;
  const total = daysInMonth(y, m0);

  for (let day = 1; day <= total; day++) {
    const dt = new Date(y, m0, day);
    const sunday = dt.getDay() === 0;

    const iso = isoDate(y, m1, day);
    const br = brDate(y, m1, day);
    const dia = weekdayPt(dt);

    const tr = document.createElement("tr");
    tr.dataset.date = iso;
    tr.dataset.sunday = sunday ? "1" : "0";

    if (sunday) {
      tr.classList.add("blocked");
      tr.innerHTML = `
        <td>${br}</td>
        <td>${dia}</td>
        <td>${usuarioNome}</td>
        <td colspan="3">Domingo bloqueado</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${br}</td>
        <td>${dia}</td>
        <td>${usuarioNome}</td>
        <td><input class="field" data-field="cd" list="cdList" placeholder="Pesquisar CD..." value=""></td>
        <td><select class="field" data-field="atividade">${atividadeOptions("")}</select></td>
        <td><input class="field" data-field="obs" placeholder="Observações..." value=""></td>
      `;
    }

    tbody.appendChild(tr);
  }
}

/* =========================
   2) CDs
   - tenta Firestore
   - se falhar ou vazio: usa CDS_RAW (sua lista completa)
========================= */
async function loadCDsToDatalist() {
  if (!cdList) return;

  setStatus("carregando CDs…");

  let cdsFromFirestore = [];
  try {
    // tenta ativos
    const snap = await getDocs(query(collection(db, CDS_COLLECTION), where("ativo", "==", true)));
    snap.forEach(d => {
      const data = d.data();
      const nome = (data?.nome || data?.cd || "").trim();
      if (nome) cdsFromFirestore.push(nome);
    });

    // se vazio, tenta tudo
    if (cdsFromFirestore.length === 0) {
      const snapAll = await getDocs(collection(db, CDS_COLLECTION));
      snapAll.forEach(d => {
        const data = d.data();
        const nome = (data?.nome || data?.cd || "").trim();
        if (nome) cdsFromFirestore.push(nome);
      });
    }
  } catch (e) {
    // ignora
  }

  // ✅ fallback garantido com sua lista
  const cdsFinal = normalizeCDList(
    cdsFromFirestore.length > 0 ? cdsFromFirestore : CDS_RAW
  );

  cdList.innerHTML = cdsFinal.map(cd => `<option value="${cd}"></option>`).join("");
  setStatus(`CDs carregados: ${cdsFinal.length}`);
}

/* =========================
   3) CARREGA DO FIRESTORE e preenche a tabela
========================= */
async function loadMonthFromFirestore(yyyyMM) {
  setStatus("carregando do Firebase…");

  const snap = await getDocs(
    query(
      collection(db, AGENDA_COLLECTION),
      where("uidKey", "==", usuarioKey),
      where("yyyyMM", "==", yyyyMM)
    )
  );

  const map = {};
  snap.forEach(d => {
    const a = d.data();
    if (a?.data) map[a.data] = a;
  });

  const rows = [...tbody.querySelectorAll("tr[data-date]")];
  for (const tr of rows) {
    if (tr.dataset.sunday === "1") continue;

    const dateISO = tr.dataset.date;
    const saved = map[dateISO];
    if (!saved) continue;

    tr.querySelector("[data-field='cd']").value = saved.cd || "";
    tr.querySelector("[data-field='atividade']").value = saved.atividade || "";
    tr.querySelector("[data-field='obs']").value = saved.obs || "";
  }

  setStatus("Firebase carregado");
}

/* =========================
   4) SALVA NO FIRESTORE (batch)
========================= */
async function saveMonthToFirestore(yyyyMM) {
  setStatus("salvando no Firebase…");
  const batch = writeBatch(db);

  const rows = [...tbody.querySelectorAll("tr[data-date]")];
  for (const tr of rows) {
    if (tr.dataset.sunday === "1") continue;

    const dataISO = tr.dataset.date;
    const cd = tr.querySelector("[data-field='cd']").value.trim();
    const atividade = tr.querySelector("[data-field='atividade']").value;
    const obs = tr.querySelector("[data-field='obs']").value.trim();

    const ref = doc(db, AGENDA_COLLECTION, `${usuarioKey}_${dataISO}`);

    // se tudo vazio, remove (limpa)
    if (!cd && !atividade && !obs) {
      batch.delete(ref);
      continue;
    }

    batch.set(ref, {
      uidKey: usuarioKey,
      usuarioNome,
      data: dataISO,
      yyyyMM,
      cd,
      atividade,
      obs,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  await batch.commit();
  setStatus("salvo");
}

/* =========================
   EVENTOS
========================= */
if (btnMenu) {
  btnMenu.addEventListener("click", () => {
    window.location.href = PATH_MENU;
  });
}

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("usuarioKey");
    window.location.href = PATH_INDEX;
  });
}

if (btnSalvar) {
  btnSalvar.addEventListener("click", async () => {
    try {
      showErr("");
      setMsg("Salvando…");
      await saveMonthToFirestore(monthPicker.value);
      setMsg("Salvo ✅ no Firebase", "success");
    } catch (err) {
      console.error(err);
      setMsg("Erro ao salvar.", "error");
      showErr(err?.message || String(err));
      setStatus("erro");
    }
  });
}

if (monthPicker) {
  monthPicker.addEventListener("change", async () => {
    try {
      showErr("");
      renderMonthSkeleton(monthPicker.value);
      await loadMonthFromFirestore(monthPicker.value);
      setMsg("");
    } catch (err) {
      console.error(err);
      setMsg("Não consegui carregar do Firebase, mas você pode preencher e tentar salvar.", "error");
      showErr(err?.message || String(err));
      setStatus("erro Firebase");
    }
  });
}

/* =========================
   INIT (mês atual já carregado)
========================= */
(async function init(){
  try {
    showErr("");
    const now = new Date();
    if (monthPicker) monthPicker.value = toMonthKey(now);

    // 1) mês aparece sempre
    renderMonthSkeleton(monthPicker.value);

    // 2) CDs (agora com CDS_RAW completo como fallback)
    await loadCDsToDatalist();

    // 3) carregar do firebase (se falhar, não bloqueia)
    await loadMonthFromFirestore(monthPicker.value);

    setMsg("Pronto. Preencha e clique em Salvar alterações.", "success");
  } catch (err) {
    console.error(err);
    setMsg("Não consegui carregar do Firebase, mas o mês já está disponível para preencher.", "error");
    showErr(err?.message || String(err));
    setStatus("erro Firebase");
  }
})();