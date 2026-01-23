// js/menu.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const userInfo = document.getElementById("userInfo");
const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./index.html";
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "./index.html";
    return;
  }
  const label = user.displayName?.trim() || (user.email || "").toLowerCase();
  if (userInfo) userInfo.textContent = `Logado como: ${label}`;
});
