// js/admin-users.js
import { auth, db, firebaseConfig } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const $ = (id) => document.getElementById(id);

// ====== ELEMENTOS ======
const userInfo = $("userInfo");
const msg = $("msg");

const btnMenu = $("btnMenu");
const btnLogout = $("btnLogout");

const btnNovo = $("btnNovo");
const btnCancelar = $("btnCancelar");

const formWrap = $("formWrap");
const inpEmail = $("inpEmail");
const inpSenha = $("inpSenha");
const selTipo = $("selTipo");

const btnSalvar = $("btnSalvar");
const btnResetSenha = $("btnResetSenha");
const btnFecharForm = $("btnFecharForm");

const inpBusca = $("inpBusca");
const btnRecarregar = $("btnRecarregar");

const tbodyUsers = $("tbodyUsers");

// ====== ESTADO ======
let currentUser = null;
let usersCache = []; // { uidDoc, email, tipo }
let editUid = null;  // quando está editando um usuário existente (uid do doc)
let editEmail = null;

// ====== UTIL ======
function safe(v) { return (v ?? "").toString().trim(); }
function lower(v) { return safe(v).toLowerCase(); }

function setMsg(text, ok = false) {
  msg.textContent = text || "";
  msg.style.color = ok ? "#065f46" : "#b91c1c";
}

function showForm(open) {
  formWrap.style.display = open ? "block" : "none";
  btnCancelar.style.display = open ? "inline-block" : "none";
}

function resetForm() {
  editUid = null;
  editEmail = null;

  inpEmail.value = "";
  inpSenha.value = "";
  selTipo.value = "analista";

  inpEmail.disabled = false;
  inpSenha.disabled = false;

  btnResetSenha.disabled = true; // só habilita quando estiver editando alguém (tem e-mail)
}

function isMaster(email) {
  return lower(email) === "euclecio.santos@gmail.com";
}

// ====== NAVEGAÇÃO ======
function bindTopButtons() {
  btnMenu.onclick = () => {
    // ajuste para seu arquivo real de menu admin
    window.location.href = "./admin-menu.html";
  };

  btnLogout.onclick = async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  };
}

// ====== LISTAR USUÁRIOS ======
async function loadUsers() {
  setMsg("Carregando usuários...", true);

  const snap = await getDocs(collection(db, "usuarios"));
  usersCache = snap.docs.map(d => {
    const data = d.data() || {};
    return {
      uidDoc: d.id,
      email: safe(data.email),
      tipo: safe(data.tipo) || "analista"
    };
  }).filter(u => u.email);

  usersCache.sort((a, b) => lower(a.email).localeCompare(lower(b.email)));

  renderUsers();
  setMsg(`Usuários carregados: ${usersCache.length}`, true);
}

function renderUsers() {
  const q = lower(inpBusca.value);

  const filtered = !q
    ? usersCache
    : usersCache.filter(u => lower(u.email).includes(q));

  if (!filtered.length) {
    tbodyUsers.innerHTML = `<tr><td colspan="3" class="muted">Nenhum usuário encontrado.</td></tr>`;
    return;
  }

  tbodyUsers.innerHTML = filtered.map(u => `
    <tr>
      <td><strong>${safe(u.email)}</strong></td>
      <td>${safe(u.tipo)}</td>
      <td style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-secondary" type="button" onclick="window.__editUser('${u.uidDoc}')">Editar</button>
        <button class="btn-secondary" type="button" onclick="window.__resetPass('${safe(u.email).replace(/'/g, "\\'")}')">Resetar senha</button>
        <button class="btn-secondary" type="button" onclick="window.__deleteUser('${u.uidDoc}','${safe(u.email).replace(/'/g, "\\'")}')">Excluir</button>
      </td>
    </tr>
  `).join("");
}

// ====== EDITAR USUÁRIO (Firestore) ======
function openEdit(uidDoc) {
  const u = usersCache.find(x => x.uidDoc === uidDoc);
  if (!u) {
    setMsg("Usuário não encontrado no cache.", false);
    return;
  }

  editUid = u.uidDoc;
  editEmail = u.email;

  inpEmail.value = u.email;
  selTipo.value = u.tipo || "analista";

  // senha não é editada aqui (seguro)
  inpSenha.value = "";
  inpEmail.disabled = true;   // não editar e-mail no Firestore
  inpSenha.disabled = true;   // senha só via reset e-mail
  btnResetSenha.disabled = false;

  showForm(true);
  setMsg(`Editando: ${u.email}`, true);
}

// ====== RESETAR SENHA (E-MAIL) ======
async function resetPasswordByEmail(email) {
  const e = lower(email);
  if (!e || !e.includes("@")) {
    alert("E-mail inválido para reset.");
    return;
  }

  if (!confirm(`Enviar e-mail de redefinição de senha para:\n\n${e}\n\nConfirmar?`)) return;

  try {
    // envia pelo Auth do app principal (o admin permanece logado)
    await sendPasswordResetEmail(auth, e);
    alert(`E-mail de redefinição enviado para:\n${e}`);
    setMsg(`Reset enviado para ${e}`, true);
  } catch (err) {
    console.error(err);
    setMsg(`Erro ao enviar reset: ${err.code || err.message}`, false);
    alert(`Erro ao enviar reset:\n${err.code || err.message}`);
  }
}

// ====== CRIAR USUÁRIO (Auth + Firestore) ======
// ✅ IMPORTANTE: usar app secundário para não deslogar o admin
let secondaryApp = null;
let secondaryAuth = null;

function ensureSecondaryAuth() {
  if (secondaryAuth) return secondaryAuth;

  secondaryApp = initializeApp(firebaseConfig, "secondary-admin-create");
  secondaryAuth = getAuth(secondaryApp);
  return secondaryAuth;
}

async function createUserFlow() {
  const email = lower(inpEmail.value);
  const senha = safe(inpSenha.value);
  const tipo = safe(selTipo.value) || "analista";

  if (!email || !email.includes("@")) return alert("Informe um e-mail válido.");
  if (!senha || senha.length < 6) return alert("Senha precisa ter no mínimo 6 caracteres.");
  if (!tipo) return alert("Selecione o tipo.");

  setMsg("Criando usuário no Auth...", true);

  try {
    const secAuth = ensureSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secAuth, email, senha);
    const uid = cred.user.uid;

    // grava perfil em /usuarios/{uid}
    await setDoc(doc(db, "usuarios", uid), {
      email,
      tipo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // limpa e atualiza lista
    resetForm();
    showForm(false);

    await loadUsers();
    setMsg(`Usuário criado: ${email}`, true);
    alert(`Usuário criado:\n${email}`);
  } catch (err) {
    console.error(err);
    setMsg(`Erro ao criar: ${err.code || err.message}`, false);
    alert(`Erro ao criar usuário:\n${err.code || err.message}`);
  }
}

// ====== SALVAR (EDITAR TIPO) ======
async function saveEditFlow() {
  if (!editUid) {
    // se não está editando, é criar
    return createUserFlow();
  }

  // edição apenas tipo
  const tipo = safe(selTipo.value) || "analista";
  if (!tipo) return alert("Selecione o tipo.");

  try {
    await updateDoc(doc(db, "usuarios", editUid), {
      tipo,
      updatedAt: serverTimestamp()
    });

    await loadUsers();
    setMsg(`Tipo atualizado: ${editEmail} => ${tipo}`, true);
    alert(`Tipo atualizado:\n${editEmail}\n=> ${tipo}`);
  } catch (err) {
    console.error(err);
    setMsg(`Erro ao salvar: ${err.code || err.message}`, false);
    alert(`Erro ao salvar:\n${err.code || err.message}`);
  }
}

// ====== EXCLUIR (somente Firestore doc) ======
// Observação: deletar o usuário do AUTH via front-end não é permitido/seguro.
// Aqui removemos o perfil do Firestore. Se quiser remover do Auth, precisa Cloud Function.
async function deleteUserDoc(uidDoc, email) {
  if (!confirm(`Excluir o perfil do Firestore do usuário:\n\n${email}\n\nIsso NÃO remove do Auth.\nConfirmar?`)) return;

  try {
    await deleteDoc(doc(db, "usuarios", uidDoc));
    await loadUsers();
    setMsg(`Perfil removido do Firestore: ${email}`, true);
  } catch (err) {
    console.error(err);
    setMsg(`Erro ao excluir: ${err.code || err.message}`, false);
    alert(`Erro ao excluir:\n${err.code || err.message}`);
  }
}

// ====== EVENTS ======
function bindPageActions() {
  btnNovo.onclick = () => {
    resetForm();
    showForm(true);
    setMsg("Modo: criar novo usuário", true);
  };

  btnCancelar.onclick = () => {
    resetForm();
    showForm(false);
    setMsg("", true);
  };

  btnFecharForm.onclick = () => {
    resetForm();
    showForm(false);
    setMsg("", true);
  };

  btnSalvar.onclick = async () => {
    // se editUid existe => editar tipo
    // senão => criar
    await saveEditFlow();
  };

  btnResetSenha.onclick = async () => {
    // reset apenas quando estiver editando
    if (!editEmail) return alert("Abra um usuário para editar e então resete a senha.");
    await resetPasswordByEmail(editEmail);
  };

  inpBusca.oninput = () => renderUsers();

  btnRecarregar.onclick = async () => {
    try { await loadUsers(); }
    catch (err) {
      console.error(err);
      setMsg(`Erro ao carregar: ${err.code || err.message}`, false);
    }
  };

  // handlers globais usados nos botões da tabela
  window.__editUser = (uidDoc) => openEdit(uidDoc);
  window.__resetPass = (email) => resetPasswordByEmail(email);
  window.__deleteUser = (uidDoc, email) => deleteUserDoc(uidDoc, email);
}

// ====== BOOT ======
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "./index.html");
  currentUser = user;

  userInfo.textContent = `Logado como: ${lower(user.email)}`;

  // Segurança básica: se não for master, ao menos alerta
  if (!isMaster(user.email)) {
    setMsg("Atenção: você não é MASTER. Se Rules estiverem restritas, pode dar permission-denied.", false);
  } else {
    setMsg("Pronto. Você é MASTER.", true);
  }

  bindTopButtons();
  bindPageActions();

  try {
    await loadUsers();
  } catch (err) {
    console.error(err);
    setMsg(`Erro ao carregar usuários: ${err.code || err.message}`, false);
  }
});