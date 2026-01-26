// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ✅ SEU firebaseConfig (o mesmo que você já usa)
export const firebaseConfig = {
  apiKey: "AIzaSyAtvu2xpkvrFbxid5CGN0qAxUwVGw7XEsU",
  authDomain: "meu-site-login-b5d66.firebaseapp.com",
  projectId: "meu-site-login-b5d66",
  storageBucket: "meu-site-login-b5d66.firebasestorage.app",
  messagingSenderId: "692101284565",
  appId: "1:692101284565:web:4a586eff4fd4d76fb7185c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);