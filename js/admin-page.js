// js/admin-page.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // MASTER SEMPRE PASSA
  if (user.email === "euclecio.santos@gmail.com") {
    return;
  }

  // Admin por tipo
  const snap = await getDoc(doc(db, "usuarios", user.uid));
  const tipo = snap.exists() ? snap.data().tipo : "";

  if (tipo !== "admin") {
    window.location.href = "menu.html";
  }
});

const btnAdminMenu = document.getElementById("btnAdminMenu");
if (btnAdminMenu) {
  btnAdminMenu.addEventListener("click", () => {
    window.location.href = "admin-menu.html";
  });
}

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
