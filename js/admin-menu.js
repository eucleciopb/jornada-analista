// js/admin-menu.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const btnLogout = document.getElementById("btnLogout");
const btnMenuUser = document.getElementById("btnMenuUser");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // 🔑 MASTER POR EMAIL
  if (user.email === "euclecio.santos@gmail.com") {
    return; // acesso total
  }

  // Admin normal por tipo
  const snap = await getDoc(doc(db, "usuarios", user.uid));
  const tipo = snap.exists() ? snap.data().tipo : "";

  if (tipo !== "admin") {
    window.location.href = "menu.html";
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

btnMenuUser.addEventListener("click", () => {
  window.location.href = "menu.html";
});
