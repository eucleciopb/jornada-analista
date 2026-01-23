import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, addDoc, getDocs, updateDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const boot = $("boot");
const msg = $("msg");
const userInfo = $("userInfo");

const selDestinatario = $("selDestinatario");
const selTipo = $("selTipo");
const selPrioridade = $("selPrioridade");
const txtTitulo = $("txtTitulo");
const txtDescricao = $("txtDescricao");

const btnCriar = $("btnCriar");
const btnLimpar = $("btnLimpar");
const btnRecarregar = $("btnRecarregar");

const tbodyChamados = $("tbodyChamados");

const btnMenu = $("btnMenu");
const btnLogout = $("btnLogout");

let currentUser = null;
let usuarios = [];

function setBoot(text, ok=false){
  boot.textContent = text;
  boot.style.color = ok ? "#065f46" : "#b91c1c";
}

function setMsg(text, ok=false){
  msg.textContent = text || "";
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function safe(v){ return (v ?? "").toString().trim(); }

function isAdminUser(u){
  return safe(u.tipo).toLowerCase() === "admin";
}
function isAnalistaUser(u){
  return safe(u.tipo).toLowerCase() !== "admin";
}

async function carregarUsuarios(){
  setMsg("Carregando usuários (coleção: usuarios)...", true);

  const snap = await getDocs(collection(db, "usuarios"));
  usuarios = snap.docs.map(d => ({ id:d.id, ...(d.data()||{}) }))
    .filter(u => safe(u.email));

  // opções especiais
  const opt = [
    `<option value="__ALL_ANALISTAS__">TODOS (Analistas)</option>`,
    `<option value="__ALL_ADMINS__">TODOS (Admins)</option>`,
    `<option value="__ALL_TODOS__">TODOS (Analistas + Admins)</option>`,
    `<option value="__SEP__" disabled>────────────</option>`
  ];

  const list = usuarios
    .slice()
    .sort((a,b)=> safe(a.email).localeCompare(safe(b.email)))
    .map(u => `<option value="${u.email}">${u.email}</option>`);

  selDestinatario.innerHTML = opt.join("") + list.join("");

  setMsg(`Usuários carregados: ${usuarios.length}`, true);
}

function resolveRecipients(value){
  if (value === "__ALL_ANALISTAS__") return usuarios.filter(isAnalistaUser).map(u => u.email);
  if (value === "__ALL_ADMINS__") return usuarios.filter(isAdminUser).map(u => u.email);
  if (value === "__ALL_TODOS__") return usuarios.map(u => u.email);
  if (value === "__SEP__") return [];
  return [value];
}

async function criarChamado(){
  const destValue = selDestinatario.value;
  const tipo = selTipo.value;
  const prioridade = selPrioridade.value;
  const titulo = safe(txtTitulo.value);
  const descricao = safe(txtDescricao.value);

  if(!titulo) return alert("Informe um título.");
  if(!descricao) return alert("Descreva o chamado.");

  const recipients = resolveRecipients(destValue).filter(Boolean);

  if (recipients.length === 0){
    alert("Selecione um destinatário válido.");
    return;
  }

  setMsg(`Criando chamado para ${recipients.length} destinatário(s)...`, true);

  // documento pai (macro)
  const parentRef = await addDoc(collection(db, "chamados_admin"), {
    criadoPorUid: currentUser.uid,
    criadoPorEmail: currentUser.email,
    scope: destValue,
    totalDestinatarios: recipients.length,
    tipo,
    prioridade,
    titulo,
    descricao,
    status: "ABERTO",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // cria documentos individuais
  for (const email of recipients){
    await addDoc(collection(db, "chamados"), {
      parentId: parentRef.id,
      criadoPorUid: currentUser.uid,
      criadoPorEmail: currentUser.email,

      destinatarioEmail: email,
      tipo,
      prioridade,
      titulo,
      descricao,

      status: "ABERTO",
      retorno: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  txtTitulo.value = "";
  txtDescricao.value = "";
  selPrioridade.value = "MEDIA";
  selTipo.value = "SUPORTE";

  await carregarChamados();
  setMsg(`Chamado criado ✅ para ${recipients.length} pessoa(s).`, true);
}

async function carregarChamados(){
  setMsg("Carregando chamados...", true);

  const snap = await getDocs(collection(db, "chamados"));
  const list = snap.docs.map(d => ({ id:d.id, ...(d.data()||{}) }));

  // abertos primeiro
  list.sort((a,b)=> safe(a.status).localeCompare(safe(b.status)));

  tbodyChamados.innerHTML = list.length
    ? list.map(c => `
      <tr>
        <td>${safe(c.destinatarioEmail)}</td>
        <td>${safe(c.tipo)}</td>
        <td>${safe(c.prioridade)}</td>
        <td>${safe(c.status)}</td>
        <td><strong>${safe(c.titulo)}</strong></td>
        <td>${safe(c.descricao)}</td>
        <td>
          ${safe(c.status) === "ABERTO"
            ? `<button class="btn-secondary" onclick="window.__fecharChamado('${c.id}')">Encerrar</button>`
            : `<span class="muted">Encerrado</span>`
          }
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="muted">Nenhum chamado encontrado.</td></tr>`;

  setMsg(`Chamados carregados: ${list.length}`, true);
}

async function fecharChamado(id){
  await updateDoc(doc(db, "chamados", id), {
    status: "ENCERRADO",
    updatedAt: serverTimestamp()
  });
  await carregarChamados();
}

function bind(){
  btnMenu.onclick = () => window.location.href = "./admin-menu.html";
  btnLogout.onclick = async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  };

  btnCriar.onclick = async () => {
    try { await criarChamado(); }
    catch(e){
      console.error(e);
      setMsg(`Erro ao criar chamado: ${e.code || e.message}`, false);
    }
  };

  btnLimpar.onclick = () => {
    txtTitulo.value = "";
    txtDescricao.value = "";
  };

  btnRecarregar.onclick = async () => {
    try { await carregarUsuarios(); }
    catch(e){
      console.error(e);
      setMsg(`Erro ao carregar usuários: ${e.code || e.message}`, false);
    }
  };

  window.__fecharChamado = async (id) => {
    try { await fecharChamado(id); }
    catch(e){
      console.error(e);
      setMsg(`Erro ao encerrar: ${e.code || e.message}`, false);
    }
  };
}

setBoot("JS iniciou ✅", true);

onAuthStateChanged(auth, async (user) => {
  try{
    if (!user) return window.location.href = "./index.html";
    currentUser = user;
    userInfo.textContent = `Logado como: ${(user.email||"").toLowerCase()}`;

    bind();

    // Se rules estiverem bloqueando, vai cair no catch com permission-denied
    await carregarUsuarios();
    await carregarChamados();
  }catch(e){
    console.error(e);
    setMsg(`ERRO: ${e.code || e.message}`, false);
    if (e?.code === "permission-denied") {
      setMsg("Permissão negada nas Rules. Ajuste Rules para admin ler /usuarios e /chamados.", false);
    }
  }
});