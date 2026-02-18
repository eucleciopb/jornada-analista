const select = document.getElementById("userSelect");
const btn = document.getElementById("btnContinue");
const msg = document.getElementById("msg");

select.addEventListener("change", () => {
  btn.disabled = !select.value;
});

btn.addEventListener("click", () => {
  const nome = select.value?.trim();

  if (!nome) {
    msg.textContent = "Selecione um usuário.";
    return;
  }

  // 🔥 Apenas salva no localStorage
  localStorage.setItem("usuarioLogado", nome);

  // 🔥 Vai para o menu
  window.location.href = "menu.html";
});
