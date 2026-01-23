// js/admin-users.js
import { auth, db } from "./firebase.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const MASTER_EMAIL = "euclecio.santos@gmail.com";

// --- UI: criar novo ---
const btnNovo = document.getElementById("btnNovoUsuario");
const boxForm = document.getElementById("boxForm");
const btnCancelar = document.getElementById("btnCancelar");
const formNovo = document.getElementById("formNovoUsuario");
const msgNovo = document.getElementById("msgNovo");

// --- UI: editar ---
const boxEdit = document.getElementById("boxEdit");
const formEdit = document.getElementById("formEditarUsuario");
const btnCancelarEdit = document.getElementById("btnCancelarEdit");
const msgEdit = document.getElementById("msgEdit");

const euUid = document.getElementById("euUid");
const euEmail = document.getElementById("euEmail");
const euTipo = document.getElementById("euTipo");

// --- UI: lista ---
const tbody = document.getElementById("tbodyUsers");
const msgLista = document.getElementById("msgLista");

console.log("[ADMIN-USERS] carregou ✅");

// Helpers de mensagens
function setMsg(el, text, type) {
  if (!el) return;
  el.textContent = text || "";
  el.style.color = type === "success" ? "#065f46" : "#b91c1c";
}

// ========== NOVO USUÁRIO ==========
btnNovo?.addEventListener("click", () => {
  boxEdit.style.display = "none";
  boxForm.style.display = "block";
  setMsg(msgNovo, "", "error");
});

btnCancelar?.addEventListener("click", () => {
  boxForm.style.display = "none";
  setMsg(msgNovo, "", "error");
  formNovo.reset();
  document.getElementById("nuTipo").value = "analista";
});

formNovo?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msgNovo, "", "error");

  const email = (document.getElementById("nuEmail")?.value || "").trim().toLowerCase();
  const senha = document.getElementById("nuSenha")?.value || "";
  const tipo = document.getElementById("nuTipo")?.value || "";

  if (!email.includes("@") || !email.includes(".")) return setMsg(msgNovo, "Email inválido.", "error");
  if (senha.length < 6) return setMsg(msgNovo, "Senha precisa ter pelo menos 6 caracteres.", "error");
  if (!["admin", "analista", "vendedor"].includes(tipo)) return setMsg(msgNovo, "Tipo inválido.", "error");
  if (email === MASTER_EMAIL) return setMsg(msgNovo, "Esse email é MASTER. Não crie por aqui.", "error");

  try {
    const mainConfig = auth.app.options;
    const secondaryApp = initializeApp(mainConfig, "secondary_" + Date.now());
    const secondaryAuth = getAuth(secondaryApp);

    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, senha);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email: cred.user.email,
      tipo,
      createdAt: serverTimestamp(),
      criadoPorUid: auth.currentUser?.uid || null
    });

    setMsg(msgNovo, "Usuário criado com sucesso! ✅", "success");
    formNovo.reset();
    document.getElementById("nuTipo").value = "analista";
    boxForm.style.display = "none";
  } catch (err) {
    console.error("[ADMIN-USERS] erro criar usuário:", err);
    setMsg(msgNovo, traduzErro(err), "error");
  }
});

// ========== LISTA / TABELA ==========
const usersRef = collection(db, "usuarios");
const q = query(usersRef, orderBy("createdAt", "desc"));

onSnapshot(
  q,
  (snap) => {
    tbody.innerHTML = "";
    setMsg(msgLista, "", "error");

    if (snap.empty) {
      setMsg(msgLista, "Nenhum usuário encontrado na coleção usuarios.", "error");
      return;
    }

    snap.forEach((d) => {
      const data = d.data();
      const uid = d.id;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(data.email ?? "")}</td>
        <td>${escapeHtml(String(data.tipo ?? ""))}</td>
        <td>${formatDate(data.createdAt?.toDate?.() ?? null)}</td>
        <td>
          <button type="button" class="btn-small" data-action="edit" data-uid="${uid}">
            Editar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },
  (err) => {
    console.error("[ADMIN-USERS] erro listagem:", err);
    setMsg(msgLista, "Falha ao carregar usuários (Rules ou conexão).", "error");
  }
);

// Clique em "Editar" na tabela (event delegation)
tbody?.addEventListener("click", (e) => {
  const btn = e.target?.closest?.("button[data-action='edit']");
  if (!btn) return;

  const uid = btn.getAttribute("data-uid");
  if (!uid) return;

  // pega dados diretamente da linha
  const row = btn.closest("tr");
  const email = row?.children?.[0]?.textContent || "";
  const tipo = row?.children?.[1]?.textContent || "analista";

  abrirEdicao({ uid, email, tipo });
});

function abrirEdicao({ uid, email, tipo }) {
  boxForm.style.display = "none";
  boxEdit.style.display = "block";
  setMsg(msgEdit, "", "error");

  euUid.value = uid;
  euEmail.value = email;
  euTipo.value = ["admin", "analista", "vendedor"].includes(tipo) ? tipo : "analista";

  // scroll até o editor (melhor UX)
  boxEdit.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Cancelar edição
btnCancelarEdit?.addEventListener("click", () => {
  boxEdit.style.display = "none";
  setMsg(msgEdit, "", "error");
  formEdit.reset();
});

// Salvar edição (update no Firestore)
formEdit?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msgEdit, "", "error");

  const uid = euUid.value;
  const tipo = euTipo.value;

  if (!uid) return setMsg(msgEdit, "UID inválido.", "error");
  if (!["admin", "analista", "vendedor"].includes(tipo)) return setMsg(msgEdit, "Tipo inválido.", "error");

  try {
    await updateDoc(doc(db, "usuarios", uid), {
      tipo,
      atualizadoEm: serverTimestamp(),
      atualizadoPorUid: auth.currentUser?.uid || null
    });

    setMsg(msgEdit, "Tipo atualizado com sucesso! ✅", "success");
    // fecha depois de salvar
    setTimeout(() => {
      boxEdit.style.display = "none";
      setMsg(msgEdit, "", "error");
    }, 500);
  } catch (err) {
    console.error("[ADMIN-USERS] erro update:", err);
    setMsg(msgEdit, traduzErro(err), "error");
  }
});

// ========== helpers ==========
function formatDate(dt) {
  if (!dt) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(dt);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function traduzErro(err) {
  const code = err?.code || "";
  if (code === "auth/email-already-in-use") return "Esse email já está em uso.";
  if (code === "auth/invalid-email") return "Email inválido.";
  if (code === "auth/weak-password") return "Senha fraca. Use pelo menos 6 caracteres.";
  if (code === "auth/operation-not-allowed") return "Email/senha não está habilitado no Firebase Auth.";
  if (code === "permission-denied") return "Permissão negada no Firestore (Rules).";
  return "Falha. Veja o console.";
}
