/**
 * Tela do Relatório de Visita ao CD.
 * Lista, registro da devolutiva, visualização e PDF.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { CDS_RAW } from "./alex/cds-lista.js";
import {
  obterUsuarioLogado,
  protegerPagina,
  isIdentidadeMenuProdutos,
  limparSessao,
  destinoMenuPorPerfil,
  PERFIL_ANALISTA,
  PERFIL_ADMIN
} from "./perfil-acesso.js";
import {
  COLECAO_RELATORIO_VISITA,
  TIPO_RELATORIO_VISITA,
  CSS_DOCUMENTO,
  relatorioVazio,
  normalizarRelatorio,
  validarRelatorio,
  filtrarRelatorios,
  ordenarRelatorios,
  podeEditarRelatorio,
  formatarPeriodo,
  formatarDataRegistro,
  rotuloStatus,
  escapeHtml,
  htmlCorpoDocumento,
  abrirPdfRelatorio,
  texto
} from "./relatorio-visita-model.js";

const firebaseConfig = {
  apiKey: "AIzaSyDN7RF9UiFyDAFXsPsVQwSRONJB0t1Xpqg",
  authDomain: "jornada-portal.firebaseapp.com",
  projectId: "jornada-portal",
  storageBucket: "jornada-portal.firebasestorage.app",
  messagingSenderId: "669362296644",
  appId: "1:669362296644:web:f590d9834a8e4e60012911"
};

const CAMPOS = [
  "cd", "dataInicial", "dataFinal", "responsavelCd", "destaques", "resumo",
  "reuniaoMatinal", "reuniaoVespertina", "rotinasTexto",
  "ocorrenciasPercentual", "ocorrenciasVendedores", "ocorrenciasTipos", "ocorrenciasComentarios",
  "apoioJornada", "consideracoes", "status"
];

const REPETIDORES = {
  processos: {
    box: "listaProcessos",
    titulo: "Processo / tema",
    grid: "",
    campos: [
      { key: "tema", label: "Processo ou Tema", placeholder: "Ex.: Curinga 2.0", full: true },
      { key: "situacao", label: "Situação encontrada", placeholder: "Ex.: Total de 259 oportunidades de ruptura.", tipo: "area", full: true },
      { key: "orientacao", label: "Orientação / Comentário", placeholder: "Ex.: Foi reforçada a necessidade de atuação sobre a base.", tipo: "area", full: true }
    ]
  },
  rotas: {
    box: "listaRotas",
    titulo: "Acompanhamento",
    grid: "",
    campos: [
      { key: "supervisor", label: "Supervisor acompanhado", placeholder: "Opcional" },
      { key: "vendedor", label: "Vendedor acompanhado", placeholder: "Opcional" },
      { key: "data", label: "Data", tipo: "date" },
      { key: "cidade", label: "Cidade / região", placeholder: "Opcional" },
      { key: "tipo", label: "Tipo de acompanhamento", placeholder: "Ex.: Coaching, rota, leitura de loja", full: true },
      { key: "registro", label: "Registro do acompanhamento", placeholder: "Descreva o acompanhamento realizado em rota, comportamentos observados, orientações realizadas e oportunidades identificadas.", tipo: "area", full: true }
    ]
  },
  treinamentos: {
    box: "listaTreinamentos",
    titulo: "Treinamento",
    grid: "",
    campos: [
      { key: "tema", label: "Tema", placeholder: "Ex.: Foco em RGB" },
      { key: "data", label: "Data", tipo: "date" },
      { key: "publico", label: "Público", placeholder: "Ex.: Vendedores, supervisores" },
      { key: "participantes", label: "Quantidade de participantes", tipo: "number", placeholder: "Ex.: 18" },
      { key: "observacoes", label: "Observações", tipo: "area", full: true, placeholder: "Opcional" }
    ]
  },
  combinados: {
    box: "listaCombinados",
    titulo: "Combinado",
    grid: "cols-4",
    campos: [
      { key: "combinado", label: "O que ficou combinado?" },
      { key: "responsavel", label: "Quem ficou responsável?" },
      { key: "apoio", label: "Como a Jornada Comercial apoiará?" },
      { key: "prazo", label: "Prazo", placeholder: "Ex.: 10/10/2026" }
    ]
  },
  proximos: {
    box: "listaProximos",
    titulo: "Acompanhamento",
    grid: "",
    campos: [
      { key: "tema", label: "Tema", placeholder: "Ex.: evolução das Matinais" },
      { key: "responsavel", label: "Responsável" },
      { key: "prazo", label: "Data / prazo", placeholder: "Ex.: até o fim do mês" },
      { key: "observacao", label: "Observação", tipo: "area", full: true }
    ]
  }
};

const sessaoPrevia = obterUsuarioLogado();
if (sessaoPrevia && isIdentidadeMenuProdutos(sessaoPrevia)) {
  // alex-guard envia este perfil ao menu de treinamentos de produtos
} else {
  iniciar();
}

function iniciar() {
  const usuario = protegerPagina({
    exigirPerfis: [PERFIL_ANALISTA, PERFIL_ADMIN]
  });
  if (!usuario) return;

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const estado = {
    cds: ordenarNomes(CDS_RAW),
    lista: [],
    form: relatorioVazio(usuario),
    vista: "lista",
    doc: null,
    sujo: false,
    preenchendo: false,
    salvando: false,
    navegou: false
  };

  const el = {
    userInfo: document.getElementById("userInfo"),
    viewLista: document.getElementById("viewLista"),
    viewForm: document.getElementById("viewForm"),
    viewDoc: document.getElementById("viewDoc"),
    filtroCd: document.getElementById("filtroCd"),
    filtroAnalista: document.getElementById("filtroAnalista"),
    filtroInicio: document.getElementById("filtroInicio"),
    filtroFim: document.getElementById("filtroFim"),
    filtroStatus: document.getElementById("filtroStatus"),
    listaContagem: document.getElementById("listaContagem"),
    listaMsg: document.getElementById("listaMsg"),
    tbody: document.getElementById("tbodyLista"),
    form: document.getElementById("formVisita"),
    formHint: document.getElementById("formHintEdicao"),
    formMsg: document.getElementById("formMsg"),
    analista: document.getElementById("analista"),
    docAviso: document.getElementById("docAviso"),
    docCorpo: document.getElementById("docCorpo"),
    btnEditarDoc: document.getElementById("btnEditarDoc"),
    btnRascunho: document.getElementById("btnRascunho"),
    btnFinalizar: document.getElementById("btnFinalizar")
  };

  const estiloDoc = document.getElementById("rvDocCss");
  if (estiloDoc) estiloDoc.textContent = CSS_DOCUMENTO;

  if (el.userInfo) el.userInfo.textContent = `Analista: ${usuario.nome}`;

  document.getElementById("btnMenu")?.addEventListener("click", () => {
    if (!confirmarSaida()) return;
    const arquivo = destinoMenuPorPerfil(usuario.perfil, { fromRoot: false, encoded: false });
    location.href = `../html menus/${arquivo}`;
  });

  document.getElementById("btnLogout")?.addEventListener("click", () => {
    if (!confirmarSaida()) return;
    limparSessao();
    location.href = "../index.html";
  });

  document.getElementById("btnNovo")?.addEventListener("click", () => abrirNovo());
  document.getElementById("btnLimparFiltros")?.addEventListener("click", () => {
    el.filtroCd.value = "";
    el.filtroAnalista.value = "";
    el.filtroInicio.value = "";
    el.filtroFim.value = "";
    el.filtroStatus.value = "";
    renderLista();
  });

  [el.filtroCd, el.filtroAnalista, el.filtroInicio, el.filtroFim, el.filtroStatus].forEach((campo) => {
    campo?.addEventListener("change", renderLista);
  });

  el.form?.addEventListener("submit", (evento) => evento.preventDefault());
  el.form?.addEventListener("input", aoDigitar);
  el.form?.addEventListener("click", aoClicarFormulario);
  document.getElementById("btnVoltarForm")?.addEventListener("click", () => irPara(""));
  document.getElementById("btnPrevia")?.addEventListener("click", abrirPreviaLocal);
  document.getElementById("btnRascunho")?.addEventListener("click", () => salvar(false));
  document.getElementById("btnFinalizar")?.addEventListener("click", () => salvar(true));
  document.getElementById("btnVoltarDoc")?.addEventListener("click", voltarDaPrevia);
  document.getElementById("btnEditarDoc")?.addEventListener("click", () => {
    const id = estado.doc?.id || estado.form?.id;
    if (id) irPara(`editar/${encodeURIComponent(id)}`);
  });
  document.getElementById("btnPdfDoc")?.addEventListener("click", () => {
    if (!abrirPdfRelatorio(estado.doc || estado.form)) {
      definirMsg(el.docAviso, "Permita pop-ups para gerar o PDF.", "erro");
    }
  });
  el.tbody?.addEventListener("click", aoClicarLista);

  window.addEventListener("beforeunload", (evento) => {
    if (!estado.sujo) return;
    evento.preventDefault();
    evento.returnValue = "";
  });

  let ignorarHash = false;
  window.addEventListener("hashchange", () => {
    if (ignorarHash) {
      ignorarHash = false;
      return;
    }
    aplicarRota();
  });

  atualizarSelectsCd();
  renderRepetidores();
  definirMsg(el.listaMsg, "Carregando registros...", "info");

  Promise.all([carregarCds(), carregarRelatorios()]).finally(() => {
    if (!estado.navegou) aplicarRota();
  });

  function caminhoAtual() {
    return decodeURIComponent((location.hash || "").replace(/^#/, ""));
  }

  function irPara(hash) {
    estado.navegou = true;
    const atual = caminhoAtual();
    if (atual === hash) {
      aplicarRota();
      return;
    }
    if ((estado.vista === "form") && estado.sujo && !confirm("Há informações ainda não salvas neste registro. Deseja sair sem salvar?")) {
      return;
    }
    estado.sujo = false;
    location.hash = hash;
  }

  function confirmarSaida() {
    if (estado.vista === "form" && estado.sujo) {
      return confirm("Há informações ainda não salvas neste registro. Deseja sair sem salvar?");
    }
    estado.sujo = false;
    return true;
  }

  function aplicarRota() {
    const hash = caminhoAtual();
    if (estado.vista === "form" && estado.sujo && hash !== hashDoFormulario()) {
      if (!confirm("Há informações ainda não salvas neste registro. Deseja sair sem salvar?")) {
        ignorarHash = true;
        location.hash = hashDoFormulario();
        return;
      }
      estado.sujo = false;
    }

    if (hash === "novo") {
      const jaNoNovo = !estado.form.id && (estado.vista === "form" || estado.vista === "doc");
      if (!jaNoNovo) abrirNovo(false);
      else if (estado.vista !== "doc") mostrar("form");
      return;
    }

    const editar = hash.match(/^editar\/(.+)$/);
    if (editar) {
      const id = decodeURIComponent(editar[1]);
      if (estado.vista === "form" && estado.form.id === id && !estado.sujo) {
        mostrar("form");
        return;
      }
      abrirEdicao(id);
      return;
    }

    const ver = hash.match(/^ver\/(.+)$/);
    if (ver) {
      abrirVisualizacao(decodeURIComponent(ver[1]));
      return;
    }

    mostrar("lista");
    renderLista();
  }

  function hashDoFormulario() {
    return estado.form.id ? `editar/${encodeURIComponent(estado.form.id)}` : "novo";
  }

  function mostrar(vista) {
    estado.vista = vista;
    el.viewLista.hidden = vista !== "lista";
    el.viewForm.hidden = vista !== "form";
    el.viewDoc.hidden = vista !== "doc";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirNovo(atualizarHash = true) {
    estado.navegou = true;
    estado.form = relatorioVazio(usuario);
    estado.sujo = false;
    preencherFormulario();
    if (el.formHint) el.formHint.hidden = true;
    definirMsg(el.formMsg, "", "info");
    mostrar("form");
    if (atualizarHash && caminhoAtual() !== "novo") {
      estado.sujo = false;
      location.hash = "novo";
    }
  }

  async function abrirEdicao(id) {
    const registro = await obterRegistro(id);
    if (!registro) {
      mostrar("lista");
      definirMsg(el.listaMsg, "Não encontramos este registro de visita.", "erro");
      return;
    }
    if (!podeEditarRelatorio(registro, usuario)) {
      location.replace(`#ver/${encodeURIComponent(id)}`);
      return;
    }
    estado.form = registro;
    estado.sujo = false;
    preencherFormulario();
    if (el.formHint) el.formHint.hidden = false;
    definirMsg(el.formMsg, "", "info");
    mostrar("form");
  }

  async function abrirVisualizacao(id) {
    const registro = await obterRegistro(id);
    if (!registro) {
      mostrar("lista");
      definirMsg(el.listaMsg, "Não encontramos este registro de visita.", "erro");
      return;
    }
    estado.form = registro;
    estado.sujo = false;
    renderDocumento(registro, { previa: false });
    mostrar("doc");
  }

  function abrirPreviaLocal() {
    const dados = normalizarRelatorio(estado.form);
    renderDocumento(dados, { previa: !dados.id || estado.sujo });
    mostrar("doc");
  }

  function voltarDaPrevia() {
    if (caminhoAtual().startsWith("ver/")) {
      irPara("");
      return;
    }
    mostrar("form");
  }

  async function obterRegistro(id) {
    const local = estado.lista.find((item) => item.id === id);
    if (local) return local;
    try {
      const snap = await getDoc(doc(db, COLECAO_RELATORIO_VISITA, id));
      if (!snap.exists()) return null;
      return normalizarRelatorio({ id: snap.id, ...snap.data() });
    } catch (erro) {
      console.error(erro);
      return null;
    }
  }

  function aoDigitar(evento) {
    if (estado.preenchendo) return;
    const campo = evento.target;
    if (campo.dataset.rep) {
      const lista = estado.form[campo.dataset.rep];
      const indice = Number(campo.dataset.i);
      if (lista?.[indice]) lista[indice][campo.dataset.key] = campo.value;
      estado.sujo = true;
      return;
    }
    if (CAMPOS.includes(campo.id)) {
      estado.form[campo.id] = campo.value;
      estado.sujo = true;
    }
  }

  function aoClicarFormulario(evento) {
    const adicionar = evento.target.closest("[data-add]");
    if (adicionar) {
      evento.preventDefault();
      const nome = adicionar.dataset.add;
      estado.form[nome].push(itemVazio(nome));
      renderRepetidor(nome);
      estado.sujo = true;
      return;
    }
    const remover = evento.target.closest("[data-remove]");
    if (remover) {
      evento.preventDefault();
      estado.form[remover.dataset.remove].splice(Number(remover.dataset.i), 1);
      renderRepetidor(remover.dataset.remove);
      estado.sujo = true;
    }
  }

  function aoClicarLista(evento) {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;
    const id = botao.dataset.id;
    const registro = estado.lista.find((item) => item.id === id);
    if (!registro) return;
    if (botao.dataset.acao === "ver") irPara(`ver/${encodeURIComponent(id)}`);
    if (botao.dataset.acao === "editar") irPara(`editar/${encodeURIComponent(id)}`);
    if (botao.dataset.acao === "pdf") {
      if (!abrirPdfRelatorio(registro)) {
        definirMsg(el.listaMsg, "Permita pop-ups para gerar o PDF.", "erro");
      }
    }
  }

  function itemVazio(nome) {
    const item = {};
    REPETIDORES[nome].campos.forEach((campo) => { item[campo.key] = ""; });
    return item;
  }

  function preencherFormulario() {
    estado.preenchendo = true;
    garantirCd(estado.form.cd);
    CAMPOS.forEach((chave) => {
      const campo = document.getElementById(chave);
      if (campo) campo.value = estado.form[chave] || (chave === "status" ? "rascunho" : "");
    });
    if (el.analista) el.analista.value = estado.form.analistaNome || usuario.nome;
    if (!estado.form.rotas.length) estado.form.rotas.push(itemVazio("rotas"));
    renderRepetidores();
    estado.preenchendo = false;
    estado.sujo = false;
  }

  function renderRepetidores() {
    Object.keys(REPETIDORES).forEach(renderRepetidor);
  }

  function renderRepetidor(nome) {
    const def = REPETIDORES[nome];
    const box = document.getElementById(def.box);
    if (!box) return;
    const lista = estado.form[nome] || [];
    if (!lista.length) {
      box.innerHTML = `<p class="rv-empty-row">Nenhum item adicionado.</p>`;
      return;
    }
    box.innerHTML = lista.map((item, indice) => `
      <article class="rv-card">
        <div class="rv-card-top">
          <strong>${escapeHtml(def.titulo)} ${indice + 1}</strong>
          <button type="button" class="btn-act" data-remove="${nome}" data-i="${indice}">Remover</button>
        </div>
        <div class="rv-card-grid ${def.grid}">
          ${def.campos.map((campo) => campoHtml(nome, indice, campo, item[campo.key] || "")).join("")}
        </div>
      </article>
    `).join("");
  }

  function campoHtml(nome, indice, campo, valor) {
    const classe = campo.full ? "full" : "";
    const ph = escapeHtml(campo.placeholder || "");
    const val = escapeHtml(valor);
    let controle = `<input type="text" data-rep="${nome}" data-i="${indice}" data-key="${campo.key}" value="${val}" placeholder="${ph}">`;
    if (campo.tipo === "area") {
      controle = `<textarea data-rep="${nome}" data-i="${indice}" data-key="${campo.key}" placeholder="${ph}">${val}</textarea>`;
    } else if (campo.tipo === "date") {
      controle = `<input type="date" data-rep="${nome}" data-i="${indice}" data-key="${campo.key}" value="${val}">`;
    } else if (campo.tipo === "number") {
      controle = `<input type="number" min="0" step="1" data-rep="${nome}" data-i="${indice}" data-key="${campo.key}" value="${val}" placeholder="${ph}">`;
    }
    return `<label class="${classe}"><span>${escapeHtml(campo.label)}</span>${controle}</label>`;
  }

  function renderLista() {
    preencherFiltroAnalistas();
    const filtrados = ordenarRelatorios(filtrarRelatorios(estado.lista, {
      cd: el.filtroCd.value,
      analista: el.filtroAnalista.value,
      inicio: el.filtroInicio.value,
      fim: el.filtroFim.value,
      status: el.filtroStatus.value
    }));
    el.listaContagem.textContent = filtrados.length === 1
      ? "1 registro"
      : `${filtrados.length} registros`;

    if (!filtrados.length) {
      el.tbody.innerHTML = `<tr><td colspan="7"><div class="rv-empty">Nenhum relatório de visita registrado com esses filtros.</div></td></tr>`;
      return;
    }

    el.tbody.innerHTML = filtrados.map((item) => {
      const editar = podeEditarRelatorio(item, usuario)
        ? `<button type="button" class="btn-act" data-acao="editar" data-id="${escapeHtml(item.id)}">Editar</button>`
        : "";
      const status = normalizarRelatorio(item).status;
      return `
        <tr>
          <td><strong>${escapeHtml(item.cd || "—")}</strong></td>
          <td>${escapeHtml(formatarPeriodo(item.dataInicial, item.dataFinal))}</td>
          <td>${escapeHtml(item.analistaNome || "—")}</td>
          <td>${escapeHtml(item.responsavelCd || "—")}</td>
          <td>${escapeHtml(formatarDataRegistro(item.criadoEmIso))}</td>
          <td><span class="rv-status ${status === "finalizado" ? "rv-status-finalizado" : ""}">${escapeHtml(rotuloStatus(status))}</span></td>
          <td>
            <div class="rv-actions-cell">
              <button type="button" class="btn-act" data-acao="ver" data-id="${escapeHtml(item.id)}">Visualizar</button>
              ${editar}
              <button type="button" class="btn-act" data-acao="pdf" data-id="${escapeHtml(item.id)}">Gerar PDF</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderDocumento(registro, { previa }) {
    estado.doc = normalizarRelatorio(registro);
    el.docCorpo.innerHTML = htmlCorpoDocumento(estado.doc);
    el.docAviso.hidden = !previa;
    el.docAviso.textContent = previa
      ? "Prévia da devolutiva. O registro só fica gravado depois de salvar o rascunho ou finalizar."
      : "";
    const pode = podeEditarRelatorio(estado.doc, usuario);
    el.btnEditarDoc.hidden = !estado.doc.id || !pode;
  }

  async function salvar(finalizar) {
    if (estado.salvando) return;
    const statusAnterior = estado.form.status || "rascunho";
    const statusPretendido = finalizar ? "finalizado" : "rascunho";
    estado.form.status = statusPretendido;
    const selectStatus = document.getElementById("status");
    if (selectStatus) selectStatus.value = statusPretendido;

    const dados = normalizarRelatorio({
      ...estado.form,
      analistaNome: estado.form.analistaNome || usuario.nome,
      analistaUidKey: estado.form.analistaUidKey || usuario.uidKey,
      analistaMatricula: estado.form.analistaMatricula || usuario.matricula || ""
    });
    const erros = validarRelatorio(dados, { finalizar });
    if (erros.length) {
      estado.form.status = statusAnterior;
      if (selectStatus) selectStatus.value = statusAnterior;
      definirMsg(el.formMsg, erros.join(" "), "erro");
      return;
    }

    const id = dados.id || `relatorio_visita_${(usuario.uidKey || "analista").replace(/[^\w-]+/g, "")}_${Date.now()}`;
    const agora = new Date().toISOString();
    const criadoEmIso = dados.criadoEmIso || agora;
    const payload = {
      ...dados,
      id,
      tipo: TIPO_RELATORIO_VISITA,
      criadoEmIso,
      atualizadoEmIso: agora,
      atualizadoEm: serverTimestamp()
    };
    if (!dados.criadoEmIso) payload.criadoEm = serverTimestamp();

    estado.salvando = true;
    el.btnRascunho.disabled = true;
    el.btnFinalizar.disabled = true;
    definirMsg(el.formMsg, "Salvando registro...", "info");

    try {
      await setDoc(doc(db, COLECAO_RELATORIO_VISITA, id), payload, { merge: true });
      const gravado = normalizarRelatorio({ ...payload, id, criadoEmIso, atualizadoEmIso: agora });
      const indice = estado.lista.findIndex((item) => item.id === id);
      if (indice >= 0) estado.lista[indice] = gravado;
      else estado.lista.unshift(gravado);
      estado.form = gravado;
      estado.sujo = false;
      if (finalizar) {
        definirMsg(el.formMsg, "", "ok");
        location.hash = `ver/${encodeURIComponent(id)}`;
      } else {
        preencherFormulario();
        if (el.formHint) el.formHint.hidden = false;
        definirMsg(el.formMsg, "Rascunho salvo. Você pode continuar o registro quando quiser.", "ok");
        if (caminhoAtual() !== `editar/${encodeURIComponent(id)}`) {
          location.hash = `editar/${encodeURIComponent(id)}`;
        }
      }
    } catch (erro) {
      console.error(erro);
      definirMsg(el.formMsg, "Não foi possível salvar o registro. Tente novamente.", "erro");
    } finally {
      estado.salvando = false;
      el.btnRascunho.disabled = false;
      el.btnFinalizar.disabled = false;
    }
  }

  function preencherFiltroAnalistas() {
    const atual = el.filtroAnalista.value;
    const nomes = new Set(estado.lista.map((item) => texto(item.analistaNome)).filter(Boolean));
    if (usuario.nome) nomes.add(usuario.nome);
    const lista = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    el.filtroAnalista.innerHTML = `<option value="">Todos</option>${lista.map((nome) => `<option value="${escapeHtml(nome)}">${escapeHtml(nome)}</option>`).join("")}`;
    if (lista.includes(atual)) el.filtroAnalista.value = atual;
  }

  function atualizarSelectsCd() {
    const filtroAtual = el.filtroCd.value;
    el.filtroCd.innerHTML = `<option value="">Todos os CDs</option>${estado.cds.map((cd) => `<option value="${escapeHtml(cd)}">${escapeHtml(cd)}</option>`).join("")}`;
    if ([...el.filtroCd.options].some((opcao) => opcao.value === filtroAtual)) {
      el.filtroCd.value = filtroAtual;
    }
    garantirCd(document.getElementById("cd")?.value || estado.form.cd);
  }

  function garantirCd(valor) {
    const select = document.getElementById("cd");
    if (!select) return;
    const lista = [...estado.cds];
    if (valor && !lista.includes(valor)) lista.push(valor);
    const ordenada = ordenarNomes(lista);
    select.innerHTML = `<option value="">Selecione o CD...</option>${ordenada.map((cd) => `<option value="${escapeHtml(cd)}">${escapeHtml(cd)}</option>`).join("")}`;
    select.value = valor && ordenada.includes(valor) ? valor : "";
  }

  async function carregarCds() {
    const remotos = [];
    try {
      const ativos = await getDocs(collection(db, "cds"));
      ativos.forEach((item) => {
        const dados = item.data() || {};
        if (dados.ativo === false) return;
        const nome = texto(dados.nome || dados.cd);
        if (nome) remotos.push(nome);
      });
    } catch (erro) {
      console.warn("CDs:", erro);
    }
    if (remotos.length) {
      estado.cds = ordenarNomes(remotos);
      atualizarSelectsCd();
    }
  }

  async function carregarRelatorios() {
    try {
      const snap = await getDocs(query(
        collection(db, COLECAO_RELATORIO_VISITA),
        where("tipo", "==", TIPO_RELATORIO_VISITA)
      ));
      const lista = [];
      snap.forEach((item) => {
        const dados = item.data() || {};
        if (dados.tipo && dados.tipo !== TIPO_RELATORIO_VISITA) return;
        lista.push(normalizarRelatorio({ id: item.id, ...dados }));
      });
      estado.lista = ordenarRelatorios(lista);
      definirMsg(el.listaMsg, "", "info");
      renderLista();
    } catch (erro) {
      console.error(erro);
      definirMsg(el.listaMsg, "Não foi possível carregar os registros. Verifique a conexão e tente novamente.", "erro");
      renderLista();
    }
  }
}

function ordenarNomes(lista) {
  return [...new Set((lista || []).map((item) => texto(item)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function definirMsg(campo, mensagem, tipo) {
  if (!campo) return;
  campo.textContent = mensagem || "";
  campo.className = `rv-msg ${tipo || "info"}`;
}
