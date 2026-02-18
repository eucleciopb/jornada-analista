const welcomeText = document.getElementById("welcomeText");
const btnLogout = document.getElementById("btnLogout");

const usuario = localStorage.getItem("usuarioLogado");

if (!usuario) {
  window.location.href = "index.html";
} else {
  welcomeText.textContent = `Olá, ${usuario}`;
}

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
});

function goTo(page) {
  window.location.href = page;
}
