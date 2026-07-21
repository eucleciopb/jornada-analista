/**
 * Gates pós-login do portal: nascimento (otimista) + termo de ciência.
 */

import {
  marcarNascimentoNaSessao,
  parseDataNascimento,
  salvarDataNascimento,
  buscarDataNascimentoSalva,
  obterNascimentoRapido,
  obterNascimentoLocal
} from "./aniversario.js";

import {
  termoPendenteParaUsuario,
  salvarResposta,
  STATUS_CIENTE,
  STATUS_PRECISA_TREINAMENTO
} from "./termo-ciencia.js";

function mascararData(valor) {
  const digits = String(valor || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function garantirTermoOverlay() {
  let overlay = document.getElementById("termoGateOverlay");
  if (overlay) return overlay;

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="termoGateOverlay" class="termo-gate-overlay is-done" hidden aria-modal="true" role="dialog" aria-labelledby="termoGateTitle">
      <div class="termo-gate-card">
        <div class="logo-box">GP</div>
        <h2 id="termoGateTitle">Termo de Ciência</h2>
        <p class="hint">Leia o termo abaixo e escolha uma opção para continuar.</p>
        <div class="termo-gate-user" id="termoGateUser">—</div>
        <h3 class="termo-gate-titulo" id="termoGateTitulo"></h3>
        <div class="termo-gate-texto" id="termoGateTexto"></div>
        <div class="termo-gate-actions">
          <button type="button" class="btn-primary" id="termoBtnCiente">OK, estou de acordo e ciente</button>
          <button type="button" class="btn-secondary" id="termoBtnTreino">Não, preciso de treinamento para isso</button>
        </div>
        <p id="termoGateMsg" class="termo-gate-msg" role="status"></p>
      </div>
    </div>`
  );
  return document.getElementById("termoGateOverlay");
}

/**
 * Gate de nascimento sem tela piscando:
 * - Se sessão/cache local já tem data → libera na hora e só confirma no banco em background.
 * - Se não tem → consulta o banco sem mostrar o formulário até confirmar que falta.
 */
export async function aplicarGateNascimento({
  db,
  fs,
  nome,
  perfil,
  overlay,
  userEl,
  formEl,
  inputEl,
  saveBtn,
  msgEl,
  onLiberado
}) {
  function setMsg(text, ok = false) {
    if (!msgEl) return;
    msgEl.textContent = text || "";
    msgEl.classList.toggle("ok", Boolean(ok));
  }

  function liberar(iso) {
    if (iso) marcarNascimentoNaSessao(iso);
    overlay?.classList.add("is-done");
    overlay?.setAttribute("hidden", "");
    document.body.classList.remove("gate-pending");
    if (typeof onLiberado === "function") onLiberado(iso || null);
  }

  function mostrarForm() {
    if (userEl) userEl.textContent = nome;
    overlay?.classList.remove("is-done");
    overlay?.removeAttribute("hidden");
    document.body.classList.add("gate-pending");
    inputEl?.focus();
  }

  // Nunca exibe o formulário durante a checagem
  overlay?.classList.add("is-done");
  overlay?.setAttribute("hidden", "");
  document.body.classList.remove("gate-pending");

  if (inputEl && !inputEl.dataset.maskBound) {
    inputEl.dataset.maskBound = "1";
    inputEl.addEventListener("input", () => {
      inputEl.value = mascararData(inputEl.value);
      setMsg("");
    });
  }

  if (formEl && !formEl.dataset.submitBound) {
    formEl.dataset.submitBound = "1";
    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const parsed = parseDataNascimento(inputEl?.value);
      if (!parsed) {
        setMsg("Informe uma data válida no formato DD/MM/AAAA.");
        inputEl?.focus();
        return;
      }
      if (saveBtn) saveBtn.disabled = true;
      setMsg("Salvando...", true);
      try {
        await salvarDataNascimento(db, fs, nome, parsed, { perfil: perfil || null });
        liberar(parsed.dataNascimento);
        setMsg("Salvo!", true);
      } catch (err) {
        console.error(err);
        setMsg(err?.message || "Não foi possível salvar no banco. Tente novamente.");
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  const rapido = obterNascimentoRapido(nome);
  if (rapido) {
    liberar(rapido);
    // Confirma / re-sincroniza em background sem bloquear o menu
    buscarDataNascimentoSalva(db, fs, nome)
      .then(async (dbIso) => {
        if (dbIso) {
          marcarNascimentoNaSessao(dbIso);
          return;
        }
        const local = obterNascimentoLocal(nome);
        const parsed = parseDataNascimento(local?.dataNascimento || rapido);
        if (!parsed) return;
        try {
          await salvarDataNascimento(db, fs, nome, parsed, { perfil: perfil || null });
        } catch (err) {
          console.warn("Re-sync nascimento falhou (menu já liberado):", err);
        }
      })
      .catch((err) => {
        console.warn("Confirmação nascimento em background falhou:", err);
      });
    return rapido;
  }

  try {
    const dataConfirmada = await buscarDataNascimentoSalva(db, fs, nome);
    if (dataConfirmada) {
      liberar(dataConfirmada);
      return dataConfirmada;
    }
    mostrarForm();
    return null;
  } catch (err) {
    console.error(err);
    // Sem cache e sem banco: só então pede a data
    mostrarForm();
    setMsg("Não foi possível verificar no banco. Informe a data novamente.");
    return null;
  }
}

/**
 * Após o nascimento, cobra o termo ativo se o usuário ainda não respondeu.
 * Admins no menuadm podem ser pulados (skipAdmin=true).
 */
export async function aplicarGateTermoCiencia({
  db,
  fs,
  nome,
  perfil,
  skipAdmin = false,
  onLiberado
}) {
  if (skipAdmin && String(perfil || "").toLowerCase() === "admin") {
    if (typeof onLiberado === "function") onLiberado(null);
    return null;
  }

  const overlay = garantirTermoOverlay();
  const userEl = document.getElementById("termoGateUser");
  const tituloEl = document.getElementById("termoGateTitulo");
  const textoEl = document.getElementById("termoGateTexto");
  const btnCiente = document.getElementById("termoBtnCiente");
  const btnTreino = document.getElementById("termoBtnTreino");
  const msgEl = document.getElementById("termoGateMsg");

  function setMsg(text, ok = false) {
    if (!msgEl) return;
    msgEl.textContent = text || "";
    msgEl.classList.toggle("ok", Boolean(ok));
  }

  function liberar() {
    overlay.classList.add("is-done");
    overlay.setAttribute("hidden", "");
    document.body.classList.remove("termo-pending");
    if (typeof onLiberado === "function") onLiberado(null);
  }

  function mostrar(termo) {
    if (userEl) userEl.textContent = nome;
    if (tituloEl) tituloEl.textContent = termo.titulo || "Termo de Ciência";
    if (textoEl) textoEl.textContent = termo.texto || "";
    setMsg("");
    overlay.classList.remove("is-done");
    overlay.removeAttribute("hidden");
    document.body.classList.add("termo-pending");
  }

  overlay.classList.add("is-done");
  overlay.setAttribute("hidden", "");
  document.body.classList.remove("termo-pending");

  let termo = null;
  try {
    termo = await termoPendenteParaUsuario(db, fs, nome);
  } catch (err) {
    console.warn("Falha ao verificar termo de ciência:", err);
    liberar();
    return null;
  }

  if (!termo) {
    liberar();
    return null;
  }

  mostrar(termo);

  async function responder(status) {
    if (btnCiente) btnCiente.disabled = true;
    if (btnTreino) btnTreino.disabled = true;
    setMsg("Registrando...", true);
    try {
      await salvarResposta(db, fs, {
        termoId: termo.id,
        nome,
        status,
        perfil: perfil || null
      });
      setMsg("Registrado!", true);
      liberar();
    } catch (err) {
      console.error(err);
      setMsg(err?.message || "Não foi possível registrar. Tente novamente.");
      if (btnCiente) btnCiente.disabled = false;
      if (btnTreino) btnTreino.disabled = false;
    }
  }

  btnCiente?.replaceWith(btnCiente.cloneNode(true));
  btnTreino?.replaceWith(btnTreino.cloneNode(true));
  const btnCiente2 = document.getElementById("termoBtnCiente");
  const btnTreino2 = document.getElementById("termoBtnTreino");

  btnCiente2?.addEventListener("click", () => responder(STATUS_CIENTE));
  btnTreino2?.addEventListener("click", () => responder(STATUS_PRECISA_TREINAMENTO));

  return termo;
}

/**
 * Sequência completa: nascimento → termo → liberado.
 * Retorna a data de nascimento confirmada (ou null).
 */
export async function aplicarGatesPortal(opts) {
  const iso = await aplicarGateNascimento(opts);

  // Se o formulário de nascimento ficou aberto, o termo espera o usuário salvar.
  // Observamos liberação do gate-pending.
  if (!iso && document.body.classList.contains("gate-pending")) {
    await new Promise((resolve) => {
      const obs = new MutationObserver(() => {
        if (!document.body.classList.contains("gate-pending")) {
          obs.disconnect();
          resolve();
        }
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    });
  }

  await aplicarGateTermoCiencia({
    db: opts.db,
    fs: {
      collection: opts.fs.collection,
      getDocs: opts.fs.getDocs,
      query: opts.fs.query,
      where: opts.fs.where,
      doc: opts.fs.doc,
      getDoc: opts.fs.getDoc,
      setDoc: opts.fs.setDoc
    },
    nome: opts.nome,
    perfil: opts.perfil,
    skipAdmin: opts.skipAdmin,
    onLiberado: opts.onTermoLiberado
  });

  return iso;
}
