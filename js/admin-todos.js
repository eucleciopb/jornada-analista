import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const msg = $("msg");
const userInfo = $("userInfo");

const selDest = $("selDest");
const selPrio = $("selPrio");
const inpPrazo = $("inpPrazo");
const inpCD = $("inpCD");
const inpTitulo = $("inpTitulo");
const txtDesc = $("txtDesc");

const btnCriar = $("btnCriar");
const btnLimpar = $("btnLimpar");
const btnReloadUsers = $("btnReloadUsers");

const fStatus = $("fStatus");
const fCD = $("fCD");
const fAnalista = $("fAnalista");
const fTexto = $("fTexto");

const btnCarregar = $("btnCarregar");
const btnLimparFiltros = $("btnLimparFiltros");

const tbodyTodos = $("tbodyTodos");

const btnMenu = $("btnMenu");
const btnLogout = $("btnLogout");

let currentUser = null;
let usuarios = [];
let cacheTodos = [];

function safe(v){ return (v ?? "").toString().trim(); }
function setMsg(text, ok=false){
  msg.textContent = text || "";
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function isAdminUser(u){
  return safe(u.tipo).toLowerCase() === "admin";
}
function isAnalistaUser(u){
  return safe(u.tipo).toLowerCase() !== "admin";
}

function fmtDateBR(iso){
  if (!iso) return "";
  const [y,m,d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

async function carregarUsuarios(){
  setMsg("Carregando usuários...", true);
  const snap = await getDocs(collection(db, "usuarios"));
  usuarios = snap.docs
    .map(d => ({ id:d.id, ...(d.data()||{}) }))
    .filter(u => safe(u.email));

  const especiais = [
    `<option value="__ALL_ANALISTAS__">TODOS (Analistas)</option>`,
    `<option value="__ALL_ADMINS__">TODOS (Admins)</option>`,
    `<option value="__ALL_TODOS__">TODOS (Analistas + Admins)</option>`,
    `<option value="__SEP__" disabled>────────────</option>`
  ];

  const individuais = usuarios
    .slice()
    .sort((a,b)=> safe(a.email).localeCompare(safe(b.email)))
    .map(u => `<option value="${u.email}">${u.email}</option>`);

  selDest.innerHTML = especiais.join("") + individuais.join("");
  setMsg(`Usuários carregados: ${usuarios.length}`, true);
}

function resolveRecipients(value){
  if (value === "__ALL_ANALISTAS__") return usuarios.filter(isAnalistaUser).map(u => u.email);
  if (value === "__ALL_ADMINS__") return usuarios.filter(isAdminUser).map(u => u.email);
  if (value === "__ALL_TODOS__") return usuarios.map(u => u.email);
  return [value];
}

async function criarTodo(){
  const destValue = selDest.value;
  const prioridade = selPrio.value;
  const prazoISO = inpPrazo.value || "";
  const cd = safe(inpCD.value);
  const titulo = safe(inpTitulo.value);
  const descricao = safe(txtDesc.value);

  if (!titulo) return alert("Informe um título.");
  if (!descricao) return alert("Informe a descrição.");

  const recipients = resolveRecipients(destValue).filter(Boolean);
  if (!recipients.length) return alert("Selecione destinatário válido.");

  setMsg(`Criando ToDo para ${recipients.length} pessoa(s)...`, true);

  const batch = writeBatch(db);
  const col = collection(db, "todos");

  const dispatchId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  for (const email of recipients){
    const ref = doc(col);
    batch.set(ref, {
      dispatchId,
      criadoPorUid: currentUser.uid,
      criadoPorEmail: currentUser.email,

      destinatarioEmail: email,

      cd,
      prioridade,
      prazoISO,

      titulo,
      descricao,

      status: "ABERTO",
      retorno: "",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();

  inpTitulo.value = "";
  txtDesc.value = "";
  inpCD.value = "";
  inpPrazo.value = "";
  selPrio.value = "MEDIA";

  await carregarTodos();
  setMsg(`ToDo criado ✅ (${recipients.length} destinatários)`, true);
}

function aplicarFiltros(list){
  const st = fStatus.value;
  const qCD = safe(fCD.value).toLowerCase();
  const qA = safe(fAnalista.value).toLowerCase();
  const qT = safe(fTexto.value).toLowerCase();

  return list.filter(x => {
    const status = safe(x.status);
    const cd = safe(x.cd).toLowerCase();
    const dest = safe(x.destinatarioEmail).toLowerCase();
    const titulo = safe(x.titulo).toLowerCase();
    const desc = safe(x.descricao).toLowerCase();

    if (st !== "TODOS" && status !== st) return false;
    if (qCD && !cd.includes(qCD)) return false;
    if (qA && !dest.includes(qA)) return false;
    if (qT && !(titulo.includes(qT) || desc.includes(qT))) return false;

    return true;
  });
}

function renderTabela(list){
  tbodyTodos.innerHTML = list.length
    ? list.map(t => {
        const st = safe(t.status);
        const trClass = st === "CONCLUIDO" ? "row-ok" : "";
        const btnToggle = st === "ABERTO"
          ? `<button class="btn-secondary" onclick="window.__concluir('${t.id}')">Concluir</button>`
          : `<button class="btn-secondary" onclick="window.__reabrir('${t.id}')">Reabrir</button>`;

        return `
          <tr class="${trClass}">
            <td>${safe(t.destinatarioEmail)}</td>
            <td>${safe(t.cd)}</td>
            <td>${safe(t.prioridade)}</td>
            <td>${fmtDateBR(safe(t.prazoISO))}</td>
            <td>${st}</td>
            <td><strong>${safe(t.titulo)}</strong></td>
            <td>${safe(t.descricao)}</td>
            <td style="display:flex;gap:8px;flex-wrap:wrap;">
              ${btnToggle}
              <button class="btn-secondary" onclick="window.__editar('${t.id}')">Editar</button>
              <button class="btn-secondary" onclick="window.__excluir('${t.id}')">Excluir</button>
            </td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="8" class="muted">Nenhum ToDo encontrado.</td></tr>`;
}

async function carregarTodos(){
  setMsg("Carregando ToDos...", true);

  const snap = await getDocs(collection(db, "todos"));
  cacheTodos = snap.docs.map(d => ({ id:d.id, ...(d.data()||{}) }));

  // Abertos primeiro
  const weight = (s) => (safe(s) === "ABERTO" ? 0 : 1);
  cacheTodos.sort((a,b) => weight(a.status) - weight(b.status));

  const filtrado = aplicarFiltros(cacheTodos);
  renderTabela(filtrado);

  setMsg(`ToDos carregados: ${filtrado.length} (total: ${cacheTodos.length})`, true);
}

async function concluir(id){
  await updateDoc(doc(db, "todos", id), {
    status: "CONCLUIDO",
    updatedAt: serverTimestamp()
  });
  await carregarTodos();
}

async function reabrir(id){
  await updateDoc(doc(db, "todos", id), {
    status: "ABERTO",
    updatedAt: serverTimestamp()
  });
  await carregarTodos();
}

async function excluirTodo(id){
  if (!confirm("Excluir este ToDo?")) return;
  await deleteDoc(doc(db, "todos", id));
  await carregarTodos();
}

async function editarTodo(id){
  const t = cacheTodos.find(x => x.id === id);
  if (!t) return alert("ToDo não encontrado.");

  const novoTitulo = prompt("Título:", safe(t.titulo));
  if (novoTitulo === null) return;

  const novaDesc = prompt("Descrição:", safe(t.descricao));
  if (novaDesc === null) return;

  const novoCD = prompt("CD (opcional):", safe(t.cd));
  if (novoCD === null) return;

  const novaPrio = prompt("Prioridade (BAIXA/MEDIA/ALTA):", safe(t.prioridade) || "MEDIA");
  if (novaPrio === null) return;

  const novoPrazo = prompt("Prazo ISO (YYYY-MM-DD) ou vazio:", safe(t.prazoISO));
  if (novoPrazo === null) return;

  await updateDoc(doc(db, "todos", id), {
    titulo: safe(novoTitulo),
    descricao: safe(novaDesc),
    cd: safe(novoCD),
    prioridade: safe(novaPrio).toUpperCase(),
    prazoISO: safe(novoPrazo),
    updatedAt: serverTimestamp()
  });

  await carregarTodos();
}

function bind(){
  btnMenu.onclick = () => window.location.href = "./admin-menu.html";
  btnLogout.onclick = async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  };

  btnCriar.onclick = async () => {
    try { await criarTodo(); }
    catch(e){
      console.error(e);
      setMsg(`Erro ao criar ToDo: ${e.code || e.message}`, false);
    }
  };

  btnLimpar.onclick = () => {
    inpTitulo.value = "";
    txtDesc.value = "";
    inpCD.value = "";
    inpPrazo.value = "";
  };

  btnReloadUsers.onclick = async () => {
    try { await carregarUsuarios(); }
    catch(e){
      console.error(e);
      setMsg(`Erro ao carregar usuários: ${e.code || e.message}`, false);
    }
  };

  btnCarregar.onclick = async () => {
    try { await carregarTodos(); }
    catch(e){
      console.error(e);
      setMsg(`Erro ao carregar ToDos: ${e.code || e.message}`, false);
    }
  };

  btnLimparFiltros.onclick = () => {
    fStatus.value = "ABERTO";
    fCD.value = "";
    fAnalista.value = "";
    fTexto.value = "";
    renderTabela(aplicarFiltros(cacheTodos));
    setMsg("Filtros limpos.", true);
  };

  window.__concluir = concluir;
  window.__reabrir = reabrir;
  window.__editar = editarTodo;
  window.__excluir = excluirTodo;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "./index.html";
  currentUser = user;
  userInfo.textContent = `Logado como: ${(user.email||"").toLowerCase()}`;

  bind();

  try{
    await carregarUsuarios();
    await carregarTodos();
  }catch(e){
    console.error(e);
    setMsg(`ERRO: ${e.code || e.message}`, false);
  }
});