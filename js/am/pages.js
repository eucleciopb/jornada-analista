/**
 * Renderizadores das páginas do Portal AM.
 * Cada HTML define data-am-page e importa bootstrapPage().
 */
import { mountAmShell, setMsg, emptyState } from "./shell.js";
import { exigirSessaoAm, isGestora, filtrarPorAnalista } from "./auth.js";
import {
  listByTipo, saveDoc, removeDoc, makeId, escapeHtml, toBR, todayISO,
  currentPeriodo, weekBounds, statusPill, deriveAtraso, audit
} from "./db.js";
import {
  TIPO, STATUS_ENTREGA, PRIORIDADES, TIPOS_COMPROMISSO, FREQUENCIAS,
  CURVAS_ABC, SEED_ANALISTAS_AM, AM_VERSION
} from "./config.js";
import { loadAmBundle, dashboardAnalista, dashboardGestora, indiceExecucao, isConcluida, inWeek } from "./kpis.js";
import { listarUsuariosAm, salvarUsuarioAm, alterarSenhaAm } from "./usuarios.js";
import { CDS_RAW } from "../alex/cds-lista.js";

export async function bootstrapPage(pageId, meta = {}) {
  const needGestora = ["gestao", "gestao-cadastros", "nova-rotina"].includes(pageId);
  const session = exigirSessaoAm({ gestora: needGestora && pageId !== "nova-rotina" ? false : false });
  if (!session) return;
  if (needGestora && pageId !== "nova-rotina" && !isGestora(session) && pageId === "gestao") {
    // gestao exige gestora
  }
  if (pageId === "gestao" && !isGestora(session)) {
    window.location.replace("./visao-geral.html");
    return;
  }
  if ((pageId === "gestao-cadastros" || pageId === "nova-rotina") && !isGestora(session)) {
    window.location.replace("./visao-geral.html");
    return;
  }

  mountAmShell({
    activeId: pageId,
    title: meta.title || pageId,
    subtitle: meta.subtitle || ""
  });

  const host = document.getElementById("amPageBody");
  const msg = document.getElementById("amMsg");
  try {
    const data = await loadAmBundle(session);
    const renderers = {
      "visao-geral": renderVisaoGeral,
      agenda: renderAgenda,
      "entregas-semana": renderEntregasSemana,
      "entregas-rotina": renderEntregasRotina,
      fechamentos: renderFechamentos,
      visitas: renderVisitas,
      ondas: renderOndas,
      cds: renderCds,
      treinamentos: renderTreinamentos,
      conceito: renderConceito,
      indicadores: renderIndicadores,
      historico: renderHistorico,
      "nova-entrega": renderNovaEntrega,
      "nova-atividade": renderNovaAtividade,
      "nova-rotina": renderNovaRotina,
      configuracoes: renderConfig,
      "gestao-cadastros": renderGestaoCadastros,
      gestao: renderGestao
    };
    const fn = renderers[pageId];
    if (!fn) {
      host.innerHTML = emptyState("Página em construção", "Este módulo ainda está sendo conectado.");
      return;
    }
    await fn(host, { session, data, msg });
  } catch (err) {
    console.error(err);
    setMsg(msg, err?.message || "Erro ao carregar o módulo.", "error");
    host.innerHTML = emptyState("Não foi possível carregar", "Verifique a conexão com o Firebase e tente novamente.");
  }
}

/* ========== helpers UI ========== */
function cardKpi(label, value, opts = {}) {
  const val = value === null || value === undefined || value === "" ? "—" : value;
  return `<div class="am-card am-kpi ${opts.clickable ? "clickable" : ""}" data-kpi="${escapeHtml(opts.id || "")}">
    <div class="k-label">${escapeHtml(label)}</div>
    <div class="k-val">${escapeHtml(String(val))}${opts.suffix || ""}</div>
    ${opts.hint ? `<div class="hint">${escapeHtml(opts.hint)}</div>` : ""}
  </div>`;
}

function cdsOptions(selected = "") {
  return CDS_RAW.map((cd) =>
    `<option value="${escapeHtml(cd)}" ${cd === selected ? "selected" : ""}>${escapeHtml(cd)}</option>`
  ).join("");
}

function analistasOptions(selected = "", includeBlank = true) {
  const names = SEED_ANALISTAS_AM.map((a) => a.nome);
  return `${includeBlank ? '<option value="">Selecione...</option>' : ""}${
    names.map((n) => `<option value="${escapeHtml(n)}" ${n === selected ? "selected" : ""}>${escapeHtml(n)}</option>`).join("")
  }`;
}

function openModal(html) {
  let bd = document.getElementById("amModal");
  if (!bd) {
    bd = document.createElement("div");
    bd.id = "amModal";
    bd.className = "am-modal-backdrop";
    document.body.appendChild(bd);
  }
  bd.innerHTML = `<div class="am-modal">${html}</div>`;
  bd.classList.add("open");
  bd.onclick = (e) => { if (e.target === bd) bd.classList.remove("open"); };
  return bd;
}

function closeModal() {
  document.getElementById("amModal")?.classList.remove("open");
}

/* ========== PÁGINAS ========== */
async function renderVisaoGeral(host, { session, data }) {
  const dash = dashboardAnalista(data, session);
  host.innerHTML = `
    <div class="am-grid kpis">
      ${cardKpi("Entregas previstas na semana", dash.cards.previstasSemana, { id: "previstas" })}
      ${cardKpi("Concluídas na semana", dash.cards.concluidasSemana, { id: "concluidas" })}
      ${cardKpi("Pendentes", dash.cards.pendentes, { id: "pendentes" })}
      ${cardKpi("Atrasadas", dash.cards.atrasadas, { id: "atrasadas" })}
      ${cardKpi("Extras realizadas", dash.cards.extras, { id: "extras" })}
      ${cardKpi("Rotinas do mês", dash.cards.pctRotinas === null ? "s/ dados" : dash.cards.pctRotinas, { suffix: dash.cards.pctRotinas === null ? "" : "%", id: "rotinas" })}
      ${cardKpi("Visitas obrigatórias", dash.cards.visitasObrigatorias, { id: "visitas" })}
      ${cardKpi("Próximo compromisso", dash.cards.proximo ? dash.cards.proximo.titulo : "Nenhum", { hint: dash.cards.proximo ? `${toBR(dash.cards.proximo.data)} ${dash.cards.proximo.horaInicio || ""}` : "Agenda livre", id: "agenda" })}
    </div>
    <div class="am-grid two" style="margin-top:14px">
      <section class="am-card">
        <h3>Minha Semana</h3>
        <div class="hint">Próximos compromissos e entregas com prazo nesta semana.</div>
        <div class="am-list" style="margin-top:12px" id="listaSemana"></div>
      </section>
      <section class="am-card">
        <h3>Minhas Pendências</h3>
        <div class="hint">Vencidas ou com prazo hoje.</div>
        <div class="am-list" style="margin-top:12px" id="listaPend"></div>
      </section>
    </div>
    <section class="am-card" style="margin-top:14px">
      <h3>Resumo do Mês (${escapeHtml(dash.periodo)})</h3>
      <div class="hint">Planejado versus realizado com base nos registros persistidos.</div>
      <div class="am-grid kpis" style="margin-top:12px">
        ${cardKpi("Entregas no mês", data.entregas.filter((e) => String(e.prazo || "").startsWith(dash.periodo)).length)}
        ${cardKpi("Concluídas", data.entregas.filter((e) => String(e.prazo || "").startsWith(dash.periodo) && isConcluida(e)).length)}
        ${cardKpi("Rotinas", `${dash.rotinasMes.filter((r) => r.status === "concluida" || r.status === "validado").length}/${dash.rotinasMes.length || 0}`)}
        ${cardKpi("Visitas", dash.visitasMes.length)}
      </div>
      <div id="detalheKpi" style="margin-top:14px"></div>
    </section>
  `;

  const fillList = (el, items, mapFn) => {
    if (!items.length) {
      el.innerHTML = emptyState("Sem itens", "Nada registrado para este recorte.");
      return;
    }
    el.innerHTML = items.map(mapFn).join("");
  };

  fillList(host.querySelector("#listaSemana"), [
    ...dash.proximos.map((c) => ({ ...c, _kind: "agenda" })),
    ...dash.entregasSemana.slice(0, 8).map((e) => ({ ...e, _kind: "entrega" }))
  ], (item) => `
    <div class="am-list-item">
      <div>
        <strong>${escapeHtml(item.titulo || item.nome || "—")}</strong>
        <small>${item._kind === "agenda" ? "Agenda" : "Entrega"} · ${toBR(item.data || item.prazo)} ${escapeHtml(item.horaInicio || "")}</small>
      </div>
      ${statusPill(item.status || "pendente", deriveAtraso(item))}
    </div>`);

  fillList(host.querySelector("#listaPend"), dash.pendencias, (item) => `
    <div class="am-list-item">
      <div>
        <strong>${escapeHtml(item.titulo || item.nome || "—")}</strong>
        <small>Prazo ${toBR(item.prazo)} · ${escapeHtml(item.kind || item.tipoEntrega || "entrega")}</small>
      </div>
      ${statusPill(item.status || "pendente", deriveAtraso(item))}
    </div>`);

  const detalhe = host.querySelector("#detalheKpi");
  const show = (title, list) => {
    if (!list.length) {
      detalhe.innerHTML = emptyState(title, "Nenhum registro compõe este indicador.");
      return;
    }
    detalhe.innerHTML = `<h3 style="margin:0 0 8px">${escapeHtml(title)}</h3>
      <div class="am-table-wrap"><table class="am-table"><thead><tr><th>Item</th><th>Prazo</th><th>Status</th></tr></thead>
      <tbody>${list.map((e) => `<tr><td>${escapeHtml(e.titulo || e.nome || "—")}</td><td>${toBR(e.prazo || e.data || e.dataVisita)}</td><td>${statusPill(e.status || "pendente", deriveAtraso(e))}</td></tr>`).join("")}</tbody></table></div>`;
  };
  host.querySelectorAll("[data-kpi]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.kpi;
      const map = {
        previstas: ["Entregas previstas na semana", dash.entregasSemana],
        concluidas: ["Concluídas", dash.concluidas],
        pendentes: ["Pendentes", dash.pendentes],
        atrasadas: ["Atrasadas", dash.atrasadas],
        extras: ["Extras", dash.extras],
        rotinas: ["Rotinas do mês", dash.rotinasMes],
        visitas: ["Visitas do mês", dash.visitasMes],
        agenda: ["Próximos compromissos", dash.proximos]
      };
      if (map[id]) show(map[id][0], map[id][1]);
    });
  });
}

async function renderAgenda(host, ctx) {
  await renderCrudAgenda(host, ctx);
}

async function renderCrudAgenda(host, { session, data, msg }) {
  let items = data.compromissos.slice().sort((a, b) => String(a.data).localeCompare(String(b.data)));
  const gestora = isGestora(session);

  const paint = () => {
    const filtroTipo = host.querySelector("#fTipo")?.value || "";
    const filtroAnalista = host.querySelector("#fAnalista")?.value || "";
    const view = host.querySelector("#fView")?.value || "lista";
    let list = items.slice();
    if (filtroTipo) list = list.filter((c) => c.tipoAtividade === filtroTipo);
    if (filtroAnalista) list = list.filter((c) => c.analista === filtroAnalista);

    host.innerHTML = `
      <section class="am-card">
        <div class="am-row between">
          <div>
            <h3 style="margin:0">Agenda operacional</h3>
            <div class="hint">${gestora ? "Visão consolidada da equipe AM." : "Seus compromissos planejados e realizados."}</div>
          </div>
          <button class="am-btn primary" id="btnNovo">+ Novo compromisso</button>
        </div>
        <div class="am-filters">
          <div><label class="am-label">Visualização</label>
            <select id="fView" class="am-select">
              <option value="lista" ${view === "lista" ? "selected" : ""}>Lista</option>
              <option value="semana" ${view === "semana" ? "selected" : ""}>Semana</option>
              <option value="mes" ${view === "mes" ? "selected" : ""}>Mês</option>
            </select></div>
          <div><label class="am-label">Tipo</label>
            <select id="fTipo" class="am-select"><option value="">Todos</option>
              ${TIPOS_COMPROMISSO.map((t) => `<option ${t === filtroTipo ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}
            </select></div>
          ${gestora ? `<div><label class="am-label">Analista</label><select id="fAnalista" class="am-select"><option value="">Todos</option>${analistasOptions(filtroAnalista, false)}</select></div>` : "<div></div>"}
          <div><label class="am-label">&nbsp;</label><button class="am-btn" id="btnFiltrar">Aplicar filtros</button></div>
        </div>
        <div id="agendaBody"></div>
      </section>`;

    const body = host.querySelector("#agendaBody");
    if (!list.length) {
      body.innerHTML = emptyState("Agenda vazia", "Crie o primeiro compromisso para começar o planejamento.");
    } else if (view === "lista") {
      body.innerHTML = `<div class="am-table-wrap"><table class="am-table">
        <thead><tr><th>Título</th><th>Analista</th><th>Data</th><th>Horário</th><th>Tipo</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map((c) => `<tr>
          <td><strong>${escapeHtml(c.titulo)}</strong><div class="hint">${escapeHtml(c.cd || "")}</div></td>
          <td>${escapeHtml(c.analista || "—")}</td>
          <td>${toBR(c.data)}</td>
          <td>${escapeHtml((c.horaInicio || "") + (c.horaFim ? "–" + c.horaFim : ""))}</td>
          <td>${escapeHtml(c.tipoAtividade || "—")}</td>
          <td>${statusPill(c.status || "planejado")}</td>
          <td><button class="am-btn" data-edit="${c.id}">Editar</button></td>
        </tr>`).join("")}</tbody></table></div>`;
    } else {
      const week = weekBounds();
      const periodo = currentPeriodo();
      const filtered = view === "semana"
        ? list.filter((c) => inWeek(c.data, week))
        : list.filter((c) => String(c.data || "").startsWith(periodo));
      body.innerHTML = filtered.length
        ? `<div class="am-list">${filtered.map((c) => `
            <div class="am-list-item">
              <div><strong>${escapeHtml(c.titulo)}</strong>
              <small>${toBR(c.data)} ${escapeHtml(c.horaInicio || "")} · ${escapeHtml(c.analista || "")} · ${escapeHtml(c.tipoAtividade || "")}</small></div>
              ${statusPill(c.status || "planejado")}
            </div>`).join("")}</div>`
        : emptyState("Sem compromissos no período", "Ajuste o filtro ou crie novos itens.");
    }

    host.querySelector("#btnFiltrar")?.addEventListener("click", paint);
    host.querySelector("#btnNovo")?.addEventListener("click", () => openForm());
    host.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => openForm(items.find((x) => x.id === btn.dataset.edit)));
    });
  };

  const openForm = (item = null) => {
    const isEdit = Boolean(item);
    openModal(`
      <div class="am-modal-header"><div><h3 style="margin:0">${isEdit ? "Editar" : "Novo"} compromisso</h3>
      <div class="hint">Registros persistidos no Firestore</div></div>
      <button class="am-btn" id="mClose">Fechar</button></div>
      <div class="am-modal-body">
        <div class="am-form-grid">
          <div class="full"><label class="am-label">Título *</label><input id="mTitulo" class="am-field" value="${escapeHtml(item?.titulo || "")}" /></div>
          <div class="full"><label class="am-label">Descrição</label><textarea id="mDesc" class="am-textarea">${escapeHtml(item?.descricao || "")}</textarea></div>
          <div><label class="am-label">Analista *</label><select id="mAnalista" class="am-select">${analistasOptions(item?.analista || session.nome)}</select></div>
          <div><label class="am-label">Tipo</label><select id="mTipo" class="am-select">${TIPOS_COMPROMISSO.map((t) => `<option ${t === (item?.tipoAtividade || "") ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}</select></div>
          <div><label class="am-label">Data *</label><input id="mData" type="date" class="am-field" value="${escapeHtml(item?.data || todayISO())}" /></div>
          <div><label class="am-label">Prioridade</label><select id="mPri" class="am-select">${PRIORIDADES.map((p) => `<option ${p === (item?.prioridade || "media") ? "selected" : ""}>${p}</option>`).join("")}</select></div>
          <div><label class="am-label">Início</label><input id="mIni" type="time" class="am-field" value="${escapeHtml(item?.horaInicio || "")}" /></div>
          <div><label class="am-label">Fim</label><input id="mFim" type="time" class="am-field" value="${escapeHtml(item?.horaFim || "")}" /></div>
          <div class="full"><label class="am-label">CD</label><select id="mCd" class="am-select"><option value="">—</option>${cdsOptions(item?.cd || "")}</select></div>
          <div><label class="am-label">Status</label><select id="mStatus" class="am-select">
            ${["planejado", "realizado", "cancelado"].map((s) => `<option value="${s}" ${s === (item?.status || "planejado") ? "selected" : ""}>${s}</option>`).join("")}
          </select></div>
          <div class="full"><label class="am-label">Observações / justificativa de reagendamento</label><textarea id="mObs" class="am-textarea">${escapeHtml(item?.observacoes || "")}</textarea></div>
        </div>
        <div id="mMsg" class="am-msg"></div>
      </div>
      <div class="am-modal-actions">
        ${isEdit ? `<button class="am-btn accent" id="mDel">Excluir</button>` : "<span></span>"}
        <div class="am-row">
          <button class="am-btn" id="mCancel">Cancelar</button>
          <button class="am-btn primary" id="mSave">Salvar</button>
        </div>
      </div>`);
    document.getElementById("mClose").onclick = closeModal;
    document.getElementById("mCancel").onclick = closeModal;
    document.getElementById("mSave").onclick = async () => {
      const titulo = document.getElementById("mTitulo").value.trim();
      const analista = document.getElementById("mAnalista").value.trim();
      const data = document.getElementById("mData").value;
      const mMsg = document.getElementById("mMsg");
      if (!titulo || !analista || !data) {
        setMsg(mMsg, "Preencha título, analista e data.", "error");
        return;
      }
      if (!gestora && analista !== session.nome) {
        setMsg(mMsg, "Você só pode criar compromissos para si.", "error");
        return;
      }
      const id = item?.id || makeId("am_comp");
      const payload = {
        tipo: TIPO.COMPROMISSO,
        titulo,
        descricao: document.getElementById("mDesc").value.trim(),
        analista,
        data,
        horaInicio: document.getElementById("mIni").value,
        horaFim: document.getElementById("mFim").value,
        cd: document.getElementById("mCd").value,
        tipoAtividade: document.getElementById("mTipo").value,
        prioridade: document.getElementById("mPri").value,
        status: document.getElementById("mStatus").value,
        observacoes: document.getElementById("mObs").value.trim(),
        updatedBy: session.nome
      };
      if (!item) payload.createdBy = session.nome;
      try {
        await saveDoc(id, payload);
        await audit(isEdit ? "agenda_editar" : "agenda_criar", { id, titulo }, session.nome);
        closeModal();
        items = await listByTipo(TIPO.COMPROMISSO).then((l) => filtrarPorAnalista(l, session));
        setMsg(msg, "Compromisso salvo.", "success");
        paint();
      } catch (err) {
        setMsg(mMsg, err?.message || "Erro ao salvar.", "error");
      }
    };
    document.getElementById("mDel")?.addEventListener("click", async () => {
      if (!confirm("Excluir este compromisso?")) return;
      await removeDoc(item.id);
      await audit("agenda_excluir", { id: item.id }, session.nome);
      closeModal();
      items = items.filter((x) => x.id !== item.id);
      paint();
    });
  };

  paint();
}

async function renderEntregasSemana(host, ctx) {
  await renderEntregas(host, ctx, { foco: "semana" });
}

async function renderEntregas(host, { session, data, msg }, { foco = "semana" } = {}) {
  let items = data.entregas.slice();
  const gestora = isGestora(session);
  const week = weekBounds();

  const paint = () => {
    const tipo = host.querySelector("#fTipo")?.value || "";
    const status = host.querySelector("#fStatus")?.value || "";
    const view = host.querySelector("#fView")?.value || "lista";
    let list = items.filter((e) => e.status !== "x");
    if (foco === "semana") list = list.filter((e) => inWeek(e.prazo, week) || inWeek(e.dataSolicitacao, week));
    if (tipo) list = list.filter((e) => String(e.tipoEntrega || "").toLowerCase() === tipo);
    if (status) list = list.filter((e) => e.status === status);

    const planejado = list.filter((e) => e.status !== "cancelado");
    const concluidos = planejado.filter(isConcluida);
    const validados = planejado.filter((e) => e.status === "validado");
    const atrasados = planejado.filter((e) => deriveAtraso(e).atrasada || deriveAtraso(e).foraDoPrazo);
    const extras = planejado.filter((e) => String(e.tipoEntrega).toLowerCase() === "extra");
    const noPrazo = concluidos.filter((e) => !deriveAtraso(e).foraDoPrazo);
    const pct = planejado.length ? Math.round((noPrazo.length / planejado.length) * 100) : null;

    host.innerHTML = `
      <div class="am-grid kpis">
        ${cardKpi("Planejado", planejado.length)}
        ${cardKpi("Concluído", concluidos.length)}
        ${cardKpi("Validado", validados.length)}
        ${cardKpi("Atrasado", atrasados.length)}
        ${cardKpi("Extra", extras.length)}
        ${cardKpi("% no prazo", pct === null ? "s/ dados" : pct, { suffix: pct === null ? "" : "%" })}
      </div>
      <section class="am-card" style="margin-top:14px">
        <div class="am-row between">
          <div><h3 style="margin:0">Entregas ${foco === "semana" ? "da semana" : ""}</h3>
          <div class="hint">Rotina e extras separados. Atraso é calculado sem apagar o status operacional.</div></div>
          <a class="am-btn primary" href="./nova-entrega.html?v=${AM_VERSION}">+ Nova Entrega</a>
        </div>
        <div class="am-filters">
          <div><label class="am-label">Tipo</label><select id="fTipo" class="am-select">
            <option value="">Todos</option><option value="rotina" ${tipo === "rotina" ? "selected" : ""}>Rotina</option><option value="extra" ${tipo === "extra" ? "selected" : ""}>Extra</option>
          </select></div>
          <div><label class="am-label">Status</label><select id="fStatus" class="am-select">
            <option value="">Todos</option>${STATUS_ENTREGA.map((s) => `<option value="${s}" ${s === status ? "selected" : ""}>${s}</option>`).join("")}
          </select></div>
          <div><label class="am-label">Visão</label><select id="fView" class="am-select">
            <option value="lista" ${view === "lista" ? "selected" : ""}>Lista</option>
            <option value="status" ${view === "status" ? "selected" : ""}>Quadro por status</option>
          </select></div>
          <div><label class="am-label">&nbsp;</label><button class="am-btn" id="btnGo">Atualizar</button></div>
        </div>
        <div id="entBody"></div>
      </section>`;

    const body = host.querySelector("#entBody");
    if (!list.length) {
      body.innerHTML = emptyState("Sem entregas neste filtro", "Lance uma nova entrega ou amplie o período.");
    } else if (view === "status") {
      body.innerHTML = `<div class="am-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
        ${STATUS_ENTREGA.map((st) => {
          const col = list.filter((e) => e.status === st);
          return `<div class="am-card"><h3>${escapeHtml(st)}</h3>
            ${col.length ? col.map((e) => `<div class="am-list-item" style="margin-top:8px"><div><strong>${escapeHtml(e.titulo)}</strong><small>${escapeHtml(e.analista || "")} · ${toBR(e.prazo)}</small></div></div>`).join("") : '<div class="hint">Vazio</div>'}
          </div>`;
        }).join("")}
      </div>`;
    } else {
      body.innerHTML = `<div class="am-table-wrap"><table class="am-table">
        <thead><tr><th>Entrega</th><th>Tipo</th><th>Analista</th><th>Prazo</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map((e) => {
          const atraso = deriveAtraso(e);
          return `<tr>
            <td><strong>${escapeHtml(e.titulo)}</strong><div class="hint">${escapeHtml(e.categoria || "")}</div></td>
            <td>${escapeHtml(e.tipoEntrega || "—")}</td>
            <td>${escapeHtml(e.analista || "—")}</td>
            <td>${toBR(e.prazo)}</td>
            <td>${statusPill(e.status || "pendente", atraso)}</td>
            <td class="am-row">
              <button class="am-btn" data-edit="${e.id}">Editar</button>
              ${gestora && e.status === "enviado_validacao" ? `<button class="am-btn primary" data-val="${e.id}">Validar</button><button class="am-btn accent" data-dev="${e.id}">Devolver</button>` : ""}
            </td>
          </tr>`;
        }).join("")}</tbody></table></div>`;
    }

    host.querySelector("#btnGo")?.addEventListener("click", paint);
    host.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => location.href = `./nova-entrega.html?id=${btn.dataset.edit}&v=${AM_VERSION}`);
    });
    host.querySelectorAll("[data-val]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await saveDoc(btn.dataset.val, { status: "validado", validadoPor: session.nome, validadoEm: todayISO(), dataConclusao: todayISO() });
        await audit("entrega_validar", { id: btn.dataset.val }, session.nome);
        items = await listByTipo(TIPO.ENTREGA).then((l) => filtrarPorAnalista(l, session));
        setMsg(msg, "Entrega validada.", "success");
        paint();
      });
    });
    host.querySelectorAll("[data-dev]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const motivo = prompt("Motivo da devolução:") || "";
        await saveDoc(btn.dataset.dev, { status: "devolvido", devolvidoPor: session.nome, motivoDevolucao: motivo });
        await audit("entrega_devolver", { id: btn.dataset.dev, motivo }, session.nome);
        items = await listByTipo(TIPO.ENTREGA).then((l) => filtrarPorAnalista(l, session));
        paint();
      });
    });
  };
  paint();
}

async function renderEntregasRotina(host, { session, data, msg }) {
  const periodo = currentPeriodo();
  let ocorrencias = data.rotinas.filter((r) => r.competencia === periodo);
  const modelos = data.modelos.filter((m) => m.ativo !== false);

  // Gera ocorrências faltantes para o analista conforme modelos aplicáveis
  if (!isGestora(session)) {
    for (const m of modelos) {
      const resp = m.responsaveis || [];
      if (resp.length && !resp.includes(session.nome)) continue;
      const exists = ocorrencias.some((o) => o.modeloId === m.id && o.analista === session.nome);
      if (!exists) {
        const id = makeId("am_rot_oc");
        const payload = {
          tipo: TIPO.ROTINA_OCORRENCIA,
          modeloId: m.id,
          nome: m.nome,
          descricao: m.descricao || "",
          competencia: periodo,
          frequencia: m.frequencia,
          analista: session.nome,
          prazo: `${periodo}-28`,
          quantidadeEsperada: m.quantidadeEsperada || null,
          evidenciaObrigatoria: Boolean(m.evidenciaObrigatoria),
          exigeValidacao: m.exigeValidacao !== false,
          status: "pendente"
        };
        try {
          await saveDoc(id, payload);
          ocorrencias.push({ id, ...payload });
        } catch (err) {
          console.warn("Falha ao gerar rotina", err);
        }
      }
    }
  }

  const ok = ocorrencias.filter((r) => r.status === "concluida" || r.status === "validado");
  const pct = ocorrencias.length ? Math.round((ok.length / ocorrencias.length) * 100) : null;

  host.innerHTML = `
    <div class="am-grid kpis">
      ${cardKpi("Competência", periodo)}
      ${cardKpi("Itens", ocorrencias.length)}
      ${cardKpi("Concluídos", ok.length)}
      ${cardKpi("Cumprimento", pct === null ? "s/ dados" : pct, { suffix: pct === null ? "" : "%" })}
    </div>
    <section class="am-card" style="margin-top:14px">
      <div class="am-row between">
        <div><h3 style="margin:0">Checklist mensal de rotinas</h3>
        <div class="hint">Aplicabilidade definida pela gestão. Evidência obrigatória não pode ser ignorada.</div></div>
        ${isGestora(session) ? `<a class="am-btn" href="./nova-rotina.html?v=${AM_VERSION}">Configurar modelos</a>` : ""}
      </div>
      <div id="rotBody" style="margin-top:12px"></div>
    </section>`;

  const body = host.querySelector("#rotBody");
  if (!ocorrencias.length) {
    body.innerHTML = emptyState("Nenhuma rotina aplicável", "A gestora ainda não atribuiu modelos a este analista nesta competência.");
    return;
  }
  body.innerHTML = `<div class="am-table-wrap"><table class="am-table">
    <thead><tr><th>Rotina</th><th>Analista</th><th>Prazo</th><th>Evidência</th><th>Status</th><th></th></tr></thead>
    <tbody>${ocorrencias.map((r) => `<tr>
      <td><strong>${escapeHtml(r.nome)}</strong><div class="hint">${escapeHtml(r.descricao || "")}</div></td>
      <td>${escapeHtml(r.analista)}</td>
      <td>${toBR(r.prazo)}</td>
      <td>${r.evidenciaObrigatoria ? (r.evidencia ? "Anexada" : "Obrigatória") : "Opcional"}</td>
      <td>${statusPill(r.status || "pendente", deriveAtraso(r))}</td>
      <td><button class="am-btn primary" data-done="${r.id}">Registrar execução</button></td>
    </tr>`).join("")}</tbody></table></div>`;

  body.querySelectorAll("[data-done]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const r = ocorrencias.find((x) => x.id === btn.dataset.done);
      const evidencia = prompt(r.evidenciaObrigatoria ? "Informe o link/descrição da evidência (obrigatório):" : "Evidência (opcional):") || "";
      if (r.evidenciaObrigatoria && !evidencia.trim()) {
        setMsg(msg, "Evidência obrigatória não informada.", "error");
        return;
      }
      const status = r.exigeValidacao ? "enviado_validacao" : "concluida";
      await saveDoc(r.id, {
        status,
        evidencia: evidencia.trim(),
        dataConclusao: todayISO(),
        updatedBy: session.nome
      });
      await audit("rotina_executar", { id: r.id }, session.nome);
      setMsg(msg, "Rotina atualizada.", "success");
      location.reload();
    });
  });
}

async function renderFechamentos(host, { session, data, msg }) {
  await renderTipoSimples(host, {
    session, msg,
    titulo: "Fechamentos Nielsen e Strata",
    hint: "Controles separados; a conclusão alimenta rotinas relacionadas sem lançamento duplicado manual.",
    items: data.fechamentos,
    tipo: TIPO.FECHAMENTO,
    fieldsBuilder: (item) => `
      <div><label class="am-label">Tipo *</label><select id="mTipoF" class="am-select">
        <option value="nielsen" ${item?.tipoFechamento === "nielsen" ? "selected" : ""}>Nielsen</option>
        <option value="strata" ${item?.tipoFechamento === "strata" ? "selected" : ""}>Strata</option>
      </select></div>
      <div><label class="am-label">Competência *</label><input id="mComp" class="am-field" type="month" value="${escapeHtml(item?.competencia || currentPeriodo())}" /></div>
      <div><label class="am-label">Responsável *</label><select id="mResp" class="am-select">${analistasOptions(item?.responsavel || session.nome)}</select></div>
      <div><label class="am-label">Data prevista</label><input id="mPrev" type="date" class="am-field" value="${escapeHtml(item?.prazo || "")}" /></div>
      <div><label class="am-label">Data efetiva</label><input id="mEfet" type="date" class="am-field" value="${escapeHtml(item?.dataConclusao || "")}" /></div>
      <div><label class="am-label">Status</label><select id="mStatus" class="am-select">${STATUS_ENTREGA.map((s) => `<option ${s === (item?.status || "pendente") ? "selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="full"><label class="am-label">Material / arquivo (link)</label><input id="mMat" class="am-field" value="${escapeHtml(item?.material || "")}" /></div>
      <div class="full"><label class="am-label">Comentários</label><textarea id="mObs" class="am-textarea">${escapeHtml(item?.observacoes || "")}</textarea></div>`,
    readFields: () => ({
      tipoFechamento: document.getElementById("mTipoF").value,
      competencia: document.getElementById("mComp").value,
      responsavel: document.getElementById("mResp").value,
      analista: document.getElementById("mResp").value,
      prazo: document.getElementById("mPrev").value,
      dataConclusao: document.getElementById("mEfet").value,
      status: document.getElementById("mStatus").value,
      material: document.getElementById("mMat").value.trim(),
      observacoes: document.getElementById("mObs").value.trim(),
      titulo: `Fechamento ${document.getElementById("mTipoF").value} ${document.getElementById("mComp").value}`
    }),
    columns: (e) => `<td><strong>${escapeHtml((e.tipoFechamento || "").toUpperCase())}</strong></td><td>${escapeHtml(e.competencia || "")}</td><td>${escapeHtml(e.responsavel || "")}</td><td>${toBR(e.prazo)}</td><td>${toBR(e.dataConclusao)}</td><td>${statusPill(e.status || "pendente", deriveAtraso(e))}</td>`
    ,
    headers: "<th>Tipo</th><th>Competência</th><th>Responsável</th><th>Prevista</th><th>Efetiva</th><th>Status</th><th></th>"
  });
}

async function renderVisitas(host, { session, data, msg }) {
  await renderTipoSimples(host, {
    session, msg,
    titulo: "Visitas aos CDs",
    hint: "Meta padrão configurável (ex.: 2 visitas). Extraordinárias não substituem obrigatórias automaticamente.",
    items: data.visitas,
    tipo: TIPO.VISITA,
    fieldsBuilder: (item) => `
      <div><label class="am-label">Analista *</label><select id="mAnalista" class="am-select">${analistasOptions(item?.analista || session.nome)}</select></div>
      <div><label class="am-label">CD *</label><select id="mCd" class="am-select"><option value="">Selecione...</option>${cdsOptions(item?.cd || "")}</select></div>
      <div><label class="am-label">Data *</label><input id="mData" type="date" class="am-field" value="${escapeHtml(item?.dataVisita || todayISO())}" /></div>
      <div><label class="am-label">Tipo</label><select id="mTipoV" class="am-select">
        <option value="obrigatoria" ${item?.tipoVisita !== "extraordinaria" ? "selected" : ""}>Obrigatória</option>
        <option value="extraordinaria" ${item?.tipoVisita === "extraordinaria" ? "selected" : ""}>Extraordinária</option>
      </select></div>
      <div class="full"><label class="am-label">Objetivo</label><input id="mObj" class="am-field" value="${escapeHtml(item?.objetivo || "")}" /></div>
      <div class="full"><label class="am-label">Atividades realizadas</label><textarea id="mAtv" class="am-textarea">${escapeHtml(item?.atividades || "")}</textarea></div>
      <div class="full"><label class="am-label">Observações / oportunidades</label><textarea id="mObs" class="am-textarea">${escapeHtml(item?.observacoes || "")}</textarea></div>
      <div class="full"><label class="am-label">Plano de ação</label><textarea id="mPlano" class="am-textarea">${escapeHtml(item?.planoAcao || "")}</textarea></div>
      <div><label class="am-label">Material / evidência (link)</label><input id="mEvid" class="am-field" value="${escapeHtml(item?.evidencia || item?.material || "")}" /></div>
      <div><label class="am-label">Status</label><select id="mStatus" class="am-select">
        ${["planejada", "realizada", "cancelada", "justificada"].map((s) => `<option ${s === (item?.status || "realizada") ? "selected" : ""}>${s}</option>`).join("")}
      </select></div>`,
    readFields: () => {
      const tipoVisita = document.getElementById("mTipoV").value;
      return {
        analista: document.getElementById("mAnalista").value,
        cd: document.getElementById("mCd").value,
        dataVisita: document.getElementById("mData").value,
        tipoVisita,
        obrigatoria: tipoVisita !== "extraordinaria",
        objetivo: document.getElementById("mObj").value.trim(),
        atividades: document.getElementById("mAtv").value.trim(),
        observacoes: document.getElementById("mObs").value.trim(),
        planoAcao: document.getElementById("mPlano").value.trim(),
        evidencia: document.getElementById("mEvid").value.trim(),
        material: document.getElementById("mEvid").value.trim(),
        status: document.getElementById("mStatus").value,
        titulo: `Visita ${document.getElementById("mCd").value}`
      };
    },
    validate: (p) => {
      if (!p.analista || !p.cd || !p.dataVisita) return "Informe analista, CD e data.";
      return null;
    },
    headers: "<th>CD</th><th>Analista</th><th>Data</th><th>Tipo</th><th>Status</th><th>Evidência</th><th></th>",
    columns: (e) => `<td>${escapeHtml(e.cd || "")}</td><td>${escapeHtml(e.analista || "")}</td><td>${toBR(e.dataVisita)}</td><td>${escapeHtml(e.tipoVisita || "")}</td><td>${statusPill(e.status || "planejada")}</td><td>${e.evidencia ? "Sim" : "Não"}</td>`
  });
}

async function renderOndas(host, { session, data, msg }) {
  await renderTipoSimples(host, {
    session, msg,
    titulo: "Abertura e fechamento de ondas",
    hint: "Ciclos de trabalho AM com checklist de abertura/encerramento.",
    items: data.ondas,
    tipo: TIPO.ONDA,
    fieldsBuilder: (item) => `
      <div class="full"><label class="am-label">Nome / identificação *</label><input id="mNome" class="am-field" value="${escapeHtml(item?.nome || item?.titulo || "")}" /></div>
      <div class="full"><label class="am-label">Descrição</label><textarea id="mDesc" class="am-textarea">${escapeHtml(item?.descricao || "")}</textarea></div>
      <div><label class="am-label">Abertura prevista</label><input id="mAbPrev" type="date" class="am-field" value="${escapeHtml(item?.aberturaPrevista || "")}" /></div>
      <div><label class="am-label">Encerramento previsto</label><input id="mEnPrev" type="date" class="am-field" value="${escapeHtml(item?.encerramentoPrevisto || "")}" /></div>
      <div><label class="am-label">Abertura efetiva</label><input id="mAbEf" type="date" class="am-field" value="${escapeHtml(item?.aberturaEfetiva || "")}" /></div>
      <div><label class="am-label">Encerramento efetivo</label><input id="mEnEf" type="date" class="am-field" value="${escapeHtml(item?.encerramentoEfetivo || "")}" /></div>
      <div><label class="am-label">Responsável</label><select id="mResp" class="am-select">${analistasOptions(item?.responsavel || session.nome)}</select></div>
      <div><label class="am-label">Status</label><select id="mStatus" class="am-select">
        ${["prevista", "aberta", "encerrada", "atrasada"].map((s) => `<option ${s === (item?.status || "prevista") ? "selected" : ""}>${s}</option>`).join("")}
      </select></div>
      <div class="full"><label class="am-label">Objetivos</label><textarea id="mObj" class="am-textarea">${escapeHtml(item?.objetivos || "")}</textarea></div>
      <div class="full"><label class="am-label">Materiais / evidências (links)</label><input id="mMat" class="am-field" value="${escapeHtml(item?.materiais || "")}" /></div>
      <div class="full"><label class="am-label">Pendências</label><textarea id="mPend" class="am-textarea">${escapeHtml(item?.pendencias || "")}</textarea></div>`,
    readFields: () => ({
      nome: document.getElementById("mNome").value.trim(),
      titulo: document.getElementById("mNome").value.trim(),
      descricao: document.getElementById("mDesc").value.trim(),
      aberturaPrevista: document.getElementById("mAbPrev").value,
      encerramentoPrevisto: document.getElementById("mEnPrev").value,
      aberturaEfetiva: document.getElementById("mAbEf").value,
      encerramentoEfetivo: document.getElementById("mEnEf").value,
      responsavel: document.getElementById("mResp").value,
      analista: document.getElementById("mResp").value,
      status: document.getElementById("mStatus").value,
      objetivos: document.getElementById("mObj").value.trim(),
      materiais: document.getElementById("mMat").value.trim(),
      pendencias: document.getElementById("mPend").value.trim()
    }),
    validate: (p) => (!p.nome ? "Informe o nome da onda." : null),
    headers: "<th>Onda</th><th>Responsável</th><th>Abertura</th><th>Encerramento</th><th>Status</th><th></th>",
    columns: (e) => `<td><strong>${escapeHtml(e.nome || e.titulo || "")}</strong></td><td>${escapeHtml(e.responsavel || "")}</td><td>${toBR(e.aberturaEfetiva || e.aberturaPrevista)}</td><td>${toBR(e.encerramentoEfetivo || e.encerramentoPrevisto)}</td><td>${statusPill(e.status || "prevista")}</td>`
  });
}

async function renderCds(host, { session, data, msg }) {
  let items = data.cdsClass.slice();
  const paint = () => {
    const curva = host.querySelector("#fCurva")?.value || "";
    let list = items;
    if (curva) list = list.filter((c) => c.curva === curva);
    host.innerHTML = `
      <section class="am-card">
        <div class="am-row between">
          <div><h3 style="margin:0">CDs e Curva ABC</h3>
          <div class="hint">Classificação manual/importação. Sem cálculo automático sem regra aprovada. CDs oficiais reutilizados da lista do portal.</div></div>
          <button class="am-btn primary" id="btnNovo">+ Classificar CD</button>
        </div>
        <div class="am-filters">
          <div><label class="am-label">Curva</label><select id="fCurva" class="am-select"><option value="">Todas</option>${CURVAS_ABC.map((c) => `<option ${c === curva ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select></div>
          <div><label class="am-label">&nbsp;</label><button class="am-btn" id="btnGo">Filtrar</button></div>
        </div>
        <div id="cdBody"></div>
      </section>`;
    const body = host.querySelector("#cdBody");
    body.innerHTML = list.length ? `<div class="am-table-wrap"><table class="am-table">
      <thead><tr><th>CD</th><th>Analista</th><th>Curva</th><th>Competência</th><th>Status</th><th></th></tr></thead>
      <tbody>${list.map((c) => `<tr>
        <td>${escapeHtml(c.cd)}</td><td>${escapeHtml(c.analista || "—")}</td><td>${escapeHtml(c.curva || "Sem classificação")}</td>
        <td>${escapeHtml(c.competencia || "")}</td><td>${escapeHtml(c.status || "ativo")}</td>
        <td><button class="am-btn" data-edit="${c.id}">Editar</button></td>
      </tr>`).join("")}</tbody></table></div>` : emptyState("Sem classificações", "Cadastre a Curva ABC por competência.");
    host.querySelector("#btnGo").onclick = paint;
    host.querySelector("#btnNovo").onclick = () => openForm();
    host.querySelectorAll("[data-edit]").forEach((b) => b.onclick = () => openForm(items.find((x) => x.id === b.dataset.edit)));
  };
  const openForm = (item = null) => {
    openModal(`
      <div class="am-modal-header"><h3 style="margin:0">${item ? "Editar" : "Nova"} classificação</h3><button class="am-btn" id="mClose">Fechar</button></div>
      <div class="am-modal-body am-form-grid">
        <div class="full"><label class="am-label">CD *</label><select id="mCd" class="am-select"><option value="">Selecione...</option>${cdsOptions(item?.cd || "")}</select></div>
        <div><label class="am-label">Analista responsável</label><select id="mAnalista" class="am-select">${analistasOptions(item?.analista || session.nome)}</select></div>
        <div><label class="am-label">Curva ABC</label><select id="mCurva" class="am-select">${CURVAS_ABC.map((c) => `<option ${c === (item?.curva || "Sem classificação") ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select></div>
        <div><label class="am-label">Competência</label><input id="mComp" type="month" class="am-field" value="${escapeHtml(item?.competencia || currentPeriodo())}" /></div>
        <div><label class="am-label">Status</label><input id="mStatus" class="am-field" value="${escapeHtml(item?.status || "ativo")}" /></div>
        <div class="full" id="mMsg" class="am-msg"></div>
      </div>
      <div class="am-modal-actions"><span></span><div class="am-row"><button class="am-btn" id="mCancel">Cancelar</button><button class="am-btn primary" id="mSave">Salvar</button></div></div>`);
    document.getElementById("mClose").onclick = closeModal;
    document.getElementById("mCancel").onclick = closeModal;
    document.getElementById("mSave").onclick = async () => {
      const cd = document.getElementById("mCd").value;
      const competencia = document.getElementById("mComp").value;
      if (!cd || !competencia) {
        setMsg(document.getElementById("mMsg"), "Informe CD e competência.", "error");
        return;
      }
      const id = item?.id || `am_cd_${slugSafe(cd)}_${competencia}`;
      await saveDoc(id, {
        tipo: TIPO.CD_CLASS,
        cd,
        analista: document.getElementById("mAnalista").value,
        curva: document.getElementById("mCurva").value,
        competencia,
        status: document.getElementById("mStatus").value.trim(),
        updatedBy: session.nome
      });
      await audit("cd_classificar", { id, cd }, session.nome);
      closeModal();
      items = await listByTipo(TIPO.CD_CLASS);
      setMsg(msg, "Classificação salva.", "success");
      paint();
    };
  };
  paint();
}

function slugSafe(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").slice(0, 48);
}

async function renderTreinamentos(host, { session, data, msg }) {
  await renderTipoSimples(host, {
    session, msg,
    titulo: "Treinamentos e reciclagens",
    hint: "Capacitação da equipe AM e cobertura por CD.",
    items: data.treinamentos,
    tipo: TIPO.TREINAMENTO,
    fieldsBuilder: (item) => `
      <div class="full"><label class="am-label">Título *</label><input id="mTitulo" class="am-field" value="${escapeHtml(item?.titulo || "")}" /></div>
      <div><label class="am-label">Tipo</label><select id="mTipo" class="am-select">
        ${["Treinamento de Pesquisa","Reciclagem de Pesquisa","Atualização de Metodologia","Orientação Operacional","Outros"].map((t) => `<option ${t === (item?.tipoTreino || "") ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}
      </select></div>
      <div><label class="am-label">Analista *</label><select id="mAnalista" class="am-select">${analistasOptions(item?.analista || session.nome)}</select></div>
      <div><label class="am-label">Data *</label><input id="mData" type="date" class="am-field" value="${escapeHtml(item?.data || todayISO())}" /></div>
      <div><label class="am-label">Formato</label><select id="mFmt" class="am-select"><option ${item?.formato !== "online" ? "selected" : ""}>presencial</option><option ${item?.formato === "online" ? "selected" : ""}>online</option></select></div>
      <div class="full"><label class="am-label">CD</label><select id="mCd" class="am-select"><option value="">—</option>${cdsOptions(item?.cd || "")}</select></div>
      <div><label class="am-label">Participantes</label><input id="mPart" type="number" min="0" class="am-field" value="${escapeHtml(String(item?.participantes ?? ""))}" /></div>
      <div><label class="am-label">Instrutor</label><input id="mInst" class="am-field" value="${escapeHtml(item?.instrutor || "")}" /></div>
      <div class="full"><label class="am-label">Material / evidência</label><input id="mMat" class="am-field" value="${escapeHtml(item?.material || "")}" /></div>
      <div class="full"><label class="am-label">Observações</label><textarea id="mObs" class="am-textarea">${escapeHtml(item?.observacoes || "")}</textarea></div>`,
    readFields: () => ({
      titulo: document.getElementById("mTitulo").value.trim(),
      tipoTreino: document.getElementById("mTipo").value,
      analista: document.getElementById("mAnalista").value,
      data: document.getElementById("mData").value,
      formato: document.getElementById("mFmt").value,
      cd: document.getElementById("mCd").value,
      participantes: Number(document.getElementById("mPart").value || 0),
      instrutor: document.getElementById("mInst").value.trim(),
      material: document.getElementById("mMat").value.trim(),
      observacoes: document.getElementById("mObs").value.trim(),
      status: "realizado"
    }),
    validate: (p) => (!p.titulo || !p.analista || !p.data ? "Preencha título, analista e data." : null),
    headers: "<th>Título</th><th>Tipo</th><th>Analista</th><th>Data</th><th>CD</th><th>Part.</th><th></th>",
    columns: (e) => `<td><strong>${escapeHtml(e.titulo)}</strong></td><td>${escapeHtml(e.tipoTreino || "")}</td><td>${escapeHtml(e.analista || "")}</td><td>${toBR(e.data)}</td><td>${escapeHtml(e.cd || "—")}</td><td>${escapeHtml(String(e.participantes ?? "—"))}</td>`
  });
}

async function renderConceito(host, { session, data, msg }) {
  await renderTipoSimples(host, {
    session, msg,
    titulo: "Conceito de Mercado",
    hint: "Materiais, ações planejadas/realizadas e histórico. Visibilidade time ou restrita.",
    items: data.conceitos,
    tipo: TIPO.CONCEITO,
    fieldsBuilder: (item) => `
      <div class="full"><label class="am-label">Título *</label><input id="mTitulo" class="am-field" value="${escapeHtml(item?.titulo || "")}" /></div>
      <div><label class="am-label">Categoria</label><select id="mCat" class="am-select">
        ${["material_referencia","atividade_planejada","atividade_realizada","historico"].map((c) => `<option value="${c}" ${c === (item?.categoria || "material_referencia") ? "selected" : ""}>${c}</option>`).join("")}
      </select></div>
      <div><label class="am-label">Visibilidade</label><select id="mVis" class="am-select">
        <option value="time" ${item?.visibilidade !== "restrito" ? "selected" : ""}>Todo o time</option>
        <option value="restrito" ${item?.visibilidade === "restrito" ? "selected" : ""}>Restrito</option>
      </select></div>
      <div><label class="am-label">Responsável</label><select id="mResp" class="am-select">${analistasOptions(item?.responsavel || session.nome)}</select></div>
      <div><label class="am-label">Prazo / data</label><input id="mData" type="date" class="am-field" value="${escapeHtml(item?.data || "")}" /></div>
      <div class="full"><label class="am-label">CD vinculado</label><select id="mCd" class="am-select"><option value="">—</option>${cdsOptions(item?.cd || "")}</select></div>
      <div class="full"><label class="am-label">Conteúdo / descrição</label><textarea id="mDesc" class="am-textarea">${escapeHtml(item?.descricao || "")}</textarea></div>
      <div class="full"><label class="am-label">Material (link)</label><input id="mMat" class="am-field" value="${escapeHtml(item?.material || "")}" /></div>`,
    readFields: () => ({
      titulo: document.getElementById("mTitulo").value.trim(),
      categoria: document.getElementById("mCat").value,
      visibilidade: document.getElementById("mVis").value,
      responsavel: document.getElementById("mResp").value,
      analista: document.getElementById("mResp").value,
      analistas: [document.getElementById("mResp").value],
      data: document.getElementById("mData").value,
      cd: document.getElementById("mCd").value,
      descricao: document.getElementById("mDesc").value.trim(),
      material: document.getElementById("mMat").value.trim()
    }),
    validate: (p) => (!p.titulo ? "Informe o título." : null),
    headers: "<th>Título</th><th>Categoria</th><th>Responsável</th><th>Data</th><th>Visibilidade</th><th></th>",
    columns: (e) => `<td><strong>${escapeHtml(e.titulo)}</strong></td><td>${escapeHtml(e.categoria || "")}</td><td>${escapeHtml(e.responsavel || "")}</td><td>${toBR(e.data)}</td><td>${escapeHtml(e.visibilidade || "time")}</td>`
  });
}

async function renderIndicadores(host, { session, data }) {
  const dash = dashboardAnalista(data, session);
  const raw = data.raw || data;
  const idx = indiceExecucao(session.nome, raw);
  host.innerHTML = `
    <div class="am-grid kpis">
      ${cardKpi("Entregas planejadas", dash.cards.previstasSemana)}
      ${cardKpi("Concluídas", dash.cards.concluidasSemana)}
      ${cardKpi("Atrasadas", dash.cards.atrasadas)}
      ${cardKpi("Extras", dash.cards.extras)}
      ${cardKpi("Rotinas", dash.cards.pctRotinas === null ? "s/ dados" : dash.cards.pctRotinas + "%")}
      ${cardKpi("Visitas", dash.cards.visitasObrigatorias)}
      ${cardKpi("Índice Execução AM", idx.disponivel ? idx.score : "s/ dados", { hint: idx.disponivel ? "Score composto configurável" : "Sem dados suficientes no período" })}
    </div>
    <section class="am-card" style="margin-top:14px">
      <h3>Componentes do índice</h3>
      ${idx.disponivel ? `<div class="am-table-wrap"><table class="am-table"><thead><tr><th>Componente</th><th>Peso</th><th>Resultado</th><th>Base</th></tr></thead>
        <tbody>${idx.componentes.map((c) => `<tr><td>${escapeHtml(c.key)}</td><td>${c.peso}</td><td>${c.pct}%</td><td>${c.num}/${c.den}</td></tr>`).join("")}</tbody></table></div>`
        : emptyState("Índice indisponível", "Registre entregas, rotinas ou visitas no mês para calcular.")}
    </section>`;
}

async function renderHistorico(host, { data }) {
  const rows = [
    ...data.entregas.map((e) => ({ quando: e.dataConclusao || e.prazo || e.updatedAtMs, tipo: "Entrega", titulo: e.titulo, status: e.status, analista: e.analista })),
    ...data.visitas.map((v) => ({ quando: v.dataVisita, tipo: "Visita", titulo: v.cd, status: v.status, analista: v.analista })),
    ...data.treinamentos.map((t) => ({ quando: t.data, tipo: "Treinamento", titulo: t.titulo, status: t.status, analista: t.analista })),
    ...data.compromissos.map((c) => ({ quando: c.data, tipo: "Agenda", titulo: c.titulo, status: c.status, analista: c.analista }))
  ].sort((a, b) => String(b.quando || "").localeCompare(String(a.quando || "")));

  host.innerHTML = `<section class="am-card"><h3>Histórico de atividades</h3>
    <div class="hint">Linha do tempo com base nos registros oficiais do portal AM.</div>
    ${rows.length ? `<div class="am-table-wrap" style="margin-top:12px"><table class="am-table">
      <thead><tr><th>Quando</th><th>Tipo</th><th>Registro</th><th>Analista</th><th>Status</th></tr></thead>
      <tbody>${rows.slice(0, 200).map((r) => `<tr>
        <td>${toBR(typeof r.quando === "number" ? todayISO() : r.quando)}</td>
        <td>${escapeHtml(r.tipo)}</td><td>${escapeHtml(r.titulo || "—")}</td>
        <td>${escapeHtml(r.analista || "—")}</td><td>${statusPill(r.status || "—")}</td>
      </tr>`).join("")}</tbody></table></div>` : emptyState("Sem histórico", "As atividades aparecerão aqui após os primeiros lançamentos.")}
  </section>`;
}

async function renderNovaEntrega(host, { session, msg }) {
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");
  let item = null;
  if (editId) {
    const all = await listByTipo(TIPO.ENTREGA);
    item = all.find((x) => x.id === editId) || null;
  }
  host.innerHTML = `
    <section class="am-card">
      <h3>${item ? "Editar entrega" : "Nova entrega"}</h3>
      <div class="hint">Rotina ou extra. Persistência imediata no Firestore.</div>
      <div class="am-form-grid" style="margin-top:14px">
        <div class="full"><label class="am-label">Nome da entrega *</label><input id="titulo" class="am-field" value="${escapeHtml(item?.titulo || "")}" /></div>
        <div class="full"><label class="am-label">Descrição</label><textarea id="descricao" class="am-textarea">${escapeHtml(item?.descricao || "")}</textarea></div>
        <div><label class="am-label">Analista *</label><select id="analista" class="am-select">${analistasOptions(item?.analista || session.nome)}</select></div>
        <div><label class="am-label">Tipo *</label><select id="tipoEntrega" class="am-select"><option value="rotina" ${item?.tipoEntrega !== "extra" ? "selected" : ""}>Rotina</option><option value="extra" ${item?.tipoEntrega === "extra" ? "selected" : ""}>Extra</option></select></div>
        <div><label class="am-label">Categoria</label><input id="categoria" class="am-field" value="${escapeHtml(item?.categoria || "")}" /></div>
        <div><label class="am-label">Prioridade</label><select id="prioridade" class="am-select">${PRIORIDADES.map((p) => `<option ${p === (item?.prioridade || "media") ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div><label class="am-label">Solicitação</label><input id="dataSolicitacao" type="date" class="am-field" value="${escapeHtml(item?.dataSolicitacao || todayISO())}" /></div>
        <div><label class="am-label">Prazo *</label><input id="prazo" type="date" class="am-field" value="${escapeHtml(item?.prazo || "")}" /></div>
        <div><label class="am-label">Conclusão efetiva</label><input id="dataConclusao" type="date" class="am-field" value="${escapeHtml(item?.dataConclusao || "")}" /></div>
        <div><label class="am-label">Status</label><select id="status" class="am-select">${STATUS_ENTREGA.map((s) => `<option ${s === (item?.status || "pendente") ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="full"><label class="am-label">CD / região</label><select id="cd" class="am-select"><option value="">—</option>${cdsOptions(item?.cd || "")}</select></div>
        <div><label class="am-label">Solicitante</label><input id="solicitante" class="am-field" value="${escapeHtml(item?.solicitante || "")}" /></div>
        <div><label class="am-label">Evidência (link)</label><input id="evidencia" class="am-field" value="${escapeHtml(item?.evidencia || "")}" /></div>
        <div class="full"><label class="am-label">Comentários</label><textarea id="obs" class="am-textarea">${escapeHtml(item?.observacoes || "")}</textarea></div>
      </div>
      <div class="am-row" style="margin-top:14px">
        <button class="am-btn primary" id="btnSalvar">Salvar</button>
        <a class="am-btn" href="./entregas-semana.html?v=${AM_VERSION}">Voltar</a>
      </div>
    </section>`;

  host.querySelector("#btnSalvar").onclick = async () => {
    const titulo = host.querySelector("#titulo").value.trim();
    const analista = host.querySelector("#analista").value;
    const prazo = host.querySelector("#prazo").value;
    if (!titulo || !analista || !prazo) {
      setMsg(msg, "Preencha nome, analista e prazo.", "error");
      return;
    }
    if (!isGestora(session) && analista !== session.nome) {
      setMsg(msg, "Analistas só podem lançar entregas próprias.", "error");
      return;
    }
    const id = item?.id || makeId("am_ent");
    const payload = {
      tipo: TIPO.ENTREGA,
      titulo,
      descricao: host.querySelector("#descricao").value.trim(),
      analista,
      tipoEntrega: host.querySelector("#tipoEntrega").value,
      categoria: host.querySelector("#categoria").value.trim(),
      prioridade: host.querySelector("#prioridade").value,
      dataSolicitacao: host.querySelector("#dataSolicitacao").value,
      prazo,
      dataConclusao: host.querySelector("#dataConclusao").value,
      status: host.querySelector("#status").value,
      cd: host.querySelector("#cd").value,
      solicitante: host.querySelector("#solicitante").value.trim(),
      evidencia: host.querySelector("#evidencia").value.trim(),
      observacoes: host.querySelector("#obs").value.trim(),
      updatedBy: session.nome
    };
    if (!item) payload.createdBy = session.nome;
    await saveDoc(id, payload);
    await audit(item ? "entrega_editar" : "entrega_criar", { id, titulo }, session.nome);
    setMsg(msg, "Entrega salva.", "success");
    location.href = `./entregas-semana.html?v=${AM_VERSION}`;
  };
}

async function renderNovaAtividade(host, ctx) {
  host.innerHTML = `<section class="am-card"><h3>Nova atividade</h3>
    <div class="hint">Atalho para compromisso de agenda (atividade operacional).</div>
    <p style="margin-top:12px"><a class="am-btn primary" href="./agenda.html?v=${AM_VERSION}">Abrir agenda e criar compromisso</a></p>
  </section>`;
  // Reutiliza agenda
  await renderCrudAgenda(host, ctx);
}

async function renderNovaRotina(host, { session, msg }) {
  let modelos = await listByTipo(TIPO.ROTINA_MODELO);
  const paint = () => {
    host.innerHTML = `
      <section class="am-card">
        <div class="am-row between">
          <div><h3 style="margin:0">Modelos de rotina</h3>
          <div class="hint">Criar/editar sem apagar histórico. Alterações não retroagem ocorrências concluídas.</div></div>
          <button class="am-btn primary" id="btnNovo">+ Novo modelo</button>
        </div>
        <div id="body" style="margin-top:12px"></div>
      </section>`;
    const body = host.querySelector("#body");
    body.innerHTML = modelos.length ? `<div class="am-table-wrap"><table class="am-table">
      <thead><tr><th>Nome</th><th>Frequência</th><th>Responsáveis</th><th>Ativo</th><th></th></tr></thead>
      <tbody>${modelos.map((m) => `<tr>
        <td><strong>${escapeHtml(m.nome)}</strong><div class="hint">${escapeHtml(m.categoria || "")}</div></td>
        <td>${escapeHtml(m.frequencia || "")}</td>
        <td>${escapeHtml((m.responsaveis || []).join(", ") || "Configurável")}</td>
        <td>${m.ativo === false ? "Não" : "Sim"}</td>
        <td><button class="am-btn" data-edit="${m.id}">Editar</button></td>
      </tr>`).join("")}</tbody></table></div>` : emptyState("Sem modelos", "Crie o primeiro modelo de rotina.");
    host.querySelector("#btnNovo").onclick = () => openForm();
    host.querySelectorAll("[data-edit]").forEach((b) => b.onclick = () => openForm(modelos.find((x) => x.id === b.dataset.edit)));
  };
  const openForm = (item = null) => {
    openModal(`
      <div class="am-modal-header"><h3 style="margin:0">${item ? "Editar" : "Novo"} modelo</h3><button class="am-btn" id="mClose">Fechar</button></div>
      <div class="am-modal-body am-form-grid">
        <div class="full"><label class="am-label">Nome *</label><input id="mNome" class="am-field" value="${escapeHtml(item?.nome || "")}" /></div>
        <div class="full"><label class="am-label">Descrição</label><textarea id="mDesc" class="am-textarea">${escapeHtml(item?.descricao || "")}</textarea></div>
        <div><label class="am-label">Categoria</label><input id="mCat" class="am-field" value="${escapeHtml(item?.categoria || "")}" /></div>
        <div><label class="am-label">Frequência</label><select id="mFreq" class="am-select">${FREQUENCIAS.map((f) => `<option ${f === (item?.frequencia || "mensal") ? "selected" : ""}>${f}</option>`).join("")}</select></div>
        <div class="full"><label class="am-label">Responsáveis (nomes separados por vírgula; vazio = configurável)</label>
          <input id="mResp" class="am-field" value="${escapeHtml((item?.responsaveis || []).join(", "))}" placeholder="Romulo Souza, Naiane Vieira" /></div>
        <div><label class="am-label">Qtd esperada</label><input id="mQtd" type="number" min="0" class="am-field" value="${escapeHtml(String(item?.quantidadeEsperada ?? ""))}" /></div>
        <div><label class="am-label">Ativo</label><select id="mAtivo" class="am-select"><option value="sim" ${item?.ativo === false ? "" : "selected"}>Sim</option><option value="nao" ${item?.ativo === false ? "selected" : ""}>Não</option></select></div>
        <div><label class="am-label">Evidência obrigatória</label><select id="mEvid" class="am-select"><option value="sim" ${item?.evidenciaObrigatoria ? "selected" : ""}>Sim</option><option value="nao" ${!item?.evidenciaObrigatoria ? "selected" : ""}>Não</option></select></div>
        <div><label class="am-label">Exige validação</label><select id="mVal" class="am-select"><option value="sim" ${item?.exigeValidacao === false ? "" : "selected"}>Sim</option><option value="nao" ${item?.exigeValidacao === false ? "selected" : ""}>Não</option></select></div>
        <div class="full" id="mMsg" class="am-msg"></div>
      </div>
      <div class="am-modal-actions"><span></span><div class="am-row"><button class="am-btn" id="mCancel">Cancelar</button><button class="am-btn primary" id="mSave">Salvar</button></div></div>`);
    document.getElementById("mClose").onclick = closeModal;
    document.getElementById("mCancel").onclick = closeModal;
    document.getElementById("mSave").onclick = async () => {
      const nome = document.getElementById("mNome").value.trim();
      if (!nome) { setMsg(document.getElementById("mMsg"), "Informe o nome.", "error"); return; }
      const id = item?.id || `am_rotina_modelo_${slugSafe(nome)}_${Date.now().toString(36)}`;
      await saveDoc(id, {
        tipo: TIPO.ROTINA_MODELO,
        nome,
        descricao: document.getElementById("mDesc").value.trim(),
        categoria: document.getElementById("mCat").value.trim(),
        frequencia: document.getElementById("mFreq").value,
        responsaveis: document.getElementById("mResp").value.split(",").map((s) => s.trim()).filter(Boolean),
        quantidadeEsperada: Number(document.getElementById("mQtd").value || 0) || null,
        ativo: document.getElementById("mAtivo").value === "sim",
        evidenciaObrigatoria: document.getElementById("mEvid").value === "sim",
        exigeValidacao: document.getElementById("mVal").value === "sim",
        updatedBy: session.nome
      });
      await audit("rotina_modelo_salvar", { id, nome }, session.nome);
      closeModal();
      modelos = await listByTipo(TIPO.ROTINA_MODELO);
      setMsg(msg, "Modelo salvo.", "success");
      paint();
    };
  };
  paint();
}

async function renderConfig(host, { session, msg }) {
  host.innerHTML = `
    <section class="am-card">
      <h3>Configurações da conta</h3>
      <div class="hint">Redefinição de senha. Gestora/admin gerenciam cadastros em Gestão de Cadastros.</div>
      <div class="am-form-grid" style="margin-top:14px;max-width:520px">
        <div class="full"><label class="am-label">Senha atual</label><input id="atual" type="password" class="am-field" /></div>
        <div class="full"><label class="am-label">Nova senha</label><input id="nova" type="password" class="am-field" /></div>
        <div class="full"><label class="am-label">Confirmar nova senha</label><input id="nova2" type="password" class="am-field" /></div>
      </div>
      <button class="am-btn primary" id="btnSenha" style="margin-top:12px">Alterar senha</button>
    </section>`;
  host.querySelector("#btnSenha").onclick = async () => {
    const atual = host.querySelector("#atual").value;
    const nova = host.querySelector("#nova").value;
    const nova2 = host.querySelector("#nova2").value;
    if (nova !== nova2) { setMsg(msg, "Confirmação não confere.", "error"); return; }
    try {
      await alterarSenhaAm(session.nome, session.perfil, atual, nova, session.nome);
      const s = { ...session, deveTrocarSenha: false };
      localStorage.setItem("am_user_session", JSON.stringify(s));
      setMsg(msg, "Senha alterada com sucesso.", "success");
    } catch (err) {
      setMsg(msg, err?.message || "Erro ao alterar senha.", "error");
    }
  };
}

async function renderGestaoCadastros(host, { session, msg }) {
  let users = await listarUsuariosAm();
  const paint = () => {
    host.innerHTML = `
      <section class="am-card">
        <div class="am-row between">
          <div><h3 style="margin:0">Gestão de cadastros AM</h3>
          <div class="hint">Ativar/desativar, resetar senha e incluir novos analistas.</div></div>
          <button class="am-btn primary" id="btnNovo">+ Novo analista</button>
        </div>
        <div class="am-table-wrap" style="margin-top:12px"><table class="am-table">
          <thead><tr><th>Nome</th><th>Perfil</th><th>Ativo</th><th></th></tr></thead>
          <tbody>${users.map((u) => `<tr>
            <td>${escapeHtml(u.nome)}</td>
            <td>${escapeHtml(u.perfil)}</td>
            <td>${u.ativo === false ? "Não" : "Sim"}</td>
            <td class="am-row">
              <button class="am-btn" data-tog="${escapeHtml(u.id)}" data-nome="${escapeHtml(u.nome)}" data-perfil="${escapeHtml(u.perfil)}" data-ativo="${u.ativo === false ? "0" : "1"}">${u.ativo === false ? "Ativar" : "Desativar"}</button>
              <button class="am-btn" data-reset="${escapeHtml(u.nome)}" data-perfil="${escapeHtml(u.perfil)}">Reset senha</button>
            </td>
          </tr>`).join("")}</tbody></table></div>
      </section>`;
    host.querySelector("#btnNovo").onclick = () => {
      const nome = prompt("Nome do novo analista:");
      if (!nome) return;
      const senha = prompt("Senha inicial (mín. 6):") || "";
      salvarUsuarioAm({ nome, senha, perfil: "am_analista", deveTrocarSenha: true, ativo: true }, { criadoPor: session.nome })
        .then(async () => {
          await audit("am_usuario_criar", { nome }, session.nome);
          users = await listarUsuariosAm();
          setMsg(msg, "Analista cadastrado.", "success");
          paint();
        })
        .catch((err) => setMsg(msg, err?.message || "Erro ao cadastrar.", "error"));
    };
    host.querySelectorAll("[data-tog]").forEach((btn) => {
      btn.onclick = async () => {
        const ativo = btn.dataset.ativo !== "1";
        await salvarUsuarioAm({
          nome: btn.dataset.nome,
          perfil: btn.dataset.perfil,
          ativo
        }, { criadoPor: session.nome });
        users = await listarUsuariosAm();
        paint();
      };
    });
    host.querySelectorAll("[data-reset]").forEach((btn) => {
      btn.onclick = async () => {
        const senha = prompt("Nova senha temporária:") || "";
        if (senha.length < 6) { setMsg(msg, "Senha muito curta.", "error"); return; }
        await salvarUsuarioAm({
          nome: btn.dataset.reset,
          perfil: btn.dataset.perfil,
          senha,
          deveTrocarSenha: true
        }, { criadoPor: session.nome });
        setMsg(msg, "Senha redefinida.", "success");
      };
    });
  };
  paint();
}

async function renderGestao(host, { session, data }) {
  const dash = dashboardGestora(data.raw || {
    entregas: data.allEntregas || data.entregas,
    rotinas: data.rotinas,
    visitas: data.allVisitas || data.visitas,
    fechamentos: data.fechamentos,
    treinamentos: data.treinamentos,
    ondas: data.ondas
  });
  const rankings = dash.porAnalista.map((a) => {
    const pct = a.previstas ? Math.round((a.concluidas / a.previstas) * 100) : null;
    return { ...a, pct };
  }).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

  host.innerHTML = `
    <div class="am-grid kpis">
      ${cardKpi("Entregas previstas", dash.cards.previstas)}
      ${cardKpi("Concluídas", dash.cards.concluidas)}
      ${cardKpi("% no prazo", dash.cards.pctPrazo === null ? "s/ dados" : dash.cards.pctPrazo, { suffix: dash.cards.pctPrazo === null ? "" : "%" })}
      ${cardKpi("Atrasadas", dash.cards.atrasadas)}
      ${cardKpi("Rotinas", dash.cards.pctRotinas === null ? "s/ dados" : dash.cards.pctRotinas + "%")}
      ${cardKpi("Visitas no mês", dash.cards.visitas)}
      ${cardKpi("Nielsen", `${dash.cards.nielsenOk}/${dash.cards.nielsenTotal}`)}
      ${cardKpi("Strata", `${dash.cards.strataOk}/${dash.cards.strataTotal}`)}
      ${cardKpi("Treinamentos", dash.cards.treinos)}
      ${cardKpi("Ondas abertas", dash.cards.ondasAbertas)}
      ${cardKpi("Ondas encerradas", dash.cards.ondasEncerradas)}
      ${cardKpi("Extras", dash.cards.extras)}
      ${cardKpi("Analistas c/ pendências", dash.cards.analistasPendencias)}
    </div>
    <div class="am-grid two" style="margin-top:14px">
      <section class="am-card">
        <h3>Desempenho por analista (semana)</h3>
        ${rankings.length ? `<div class="am-table-wrap"><table class="am-table">
          <thead><tr><th>Analista</th><th>Previstas</th><th>Concluídas</th><th>% cumprimento</th><th>Atrasadas</th><th>Extras</th></tr></thead>
          <tbody>${rankings.map((a) => `<tr>
            <td>${escapeHtml(a.nome)}</td><td>${a.previstas}</td><td>${a.concluidas}</td>
            <td>${a.pct === null ? "s/ dados" : a.pct + "% <small>(" + a.concluidas + "/" + a.previstas + ")</small>"}</td>
            <td>${a.atrasadas}</td><td>${a.extras}</td>
          </tr>`).join("")}</tbody></table></div>` : emptyState("Sem dados na semana", "Os indicadores aparecem após os primeiros lançamentos dos analistas.")}
      </section>
      <section class="am-card">
        <h3>Pendências / atrasos</h3>
        ${dash.atrasadas.length ? `<div class="am-list">${dash.atrasadas.slice(0, 15).map((e) => `
          <div class="am-list-item"><div><strong>${escapeHtml(e.titulo)}</strong>
          <small>${escapeHtml(e.analista || "")} · prazo ${toBR(e.prazo)}</small></div>${statusPill(e.status || "pendente", deriveAtraso(e))}</div>`).join("")}</div>`
          : emptyState("Sem atrasos", "Nenhuma entrega atrasada no recorte atual.")}
      </section>
    </div>
    <section class="am-card" style="margin-top:14px">
      <div class="am-row between">
        <div>
          <h3 style="margin:0">Atalhos gerenciais</h3>
          <div class="hint">Os módulos operacionais usam os mesmos registros oficiais do time AM.</div>
        </div>
      </div>
      <div class="am-row" style="margin-top:12px">
        <a class="am-btn" href="./entregas-semana.html?v=${AM_VERSION}">Entregas</a>
        <a class="am-btn" href="./agenda.html?v=${AM_VERSION}">Agenda do time</a>
        <a class="am-btn" href="./entregas-rotina.html?v=${AM_VERSION}">Rotinas</a>
        <a class="am-btn" href="./visitas.html?v=${AM_VERSION}">Visitas</a>
        <a class="am-btn" href="./fechamentos.html?v=${AM_VERSION}">Fechamentos</a>
        <a class="am-btn" href="./gestao-cadastros.html?v=${AM_VERSION}">Cadastros</a>
      </div>
    </section>`;
}

/** CRUD genérico reutilizável */
async function renderTipoSimples(host, opts) {
  const { session, msg, titulo, hint, tipo, fieldsBuilder, readFields, headers, columns } = opts;
  let items = (opts.items || []).slice();
  const validate = opts.validate || (() => null);
  const gestora = isGestora(session);

  const paint = () => {
    host.innerHTML = `
      <section class="am-card">
        <div class="am-row between">
          <div><h3 style="margin:0">${escapeHtml(titulo)}</h3><div class="hint">${escapeHtml(hint || "")}</div></div>
          <button class="am-btn primary" id="btnNovo">+ Novo</button>
        </div>
        <div id="body" style="margin-top:12px"></div>
      </section>`;
    const body = host.querySelector("#body");
    if (!items.length) {
      body.innerHTML = emptyState("Sem registros", "Clique em + Novo para começar. Nenhum dado fictício é exibido.");
    } else {
      body.innerHTML = `<div class="am-table-wrap"><table class="am-table"><thead><tr>${headers}</tr></thead>
        <tbody>${items.map((e) => `<tr>${columns(e)}<td><button class="am-btn" data-edit="${e.id}">Editar</button></td></tr>`).join("")}</tbody></table></div>`;
    }
    host.querySelector("#btnNovo").onclick = () => openForm();
    host.querySelectorAll("[data-edit]").forEach((b) => {
      b.onclick = () => openForm(items.find((x) => x.id === b.dataset.edit));
    });
  };

  const openForm = (item = null) => {
    openModal(`
      <div class="am-modal-header"><div><h3 style="margin:0">${item ? "Editar" : "Novo"} registro</h3></div>
      <button class="am-btn" id="mClose">Fechar</button></div>
      <div class="am-modal-body"><div class="am-form-grid">${fieldsBuilder(item)}</div><div id="mMsg" class="am-msg"></div></div>
      <div class="am-modal-actions">
        ${item ? `<button class="am-btn accent" id="mDel">Excluir</button>` : "<span></span>"}
        <div class="am-row"><button class="am-btn" id="mCancel">Cancelar</button><button class="am-btn primary" id="mSave">Salvar</button></div>
      </div>`);
    document.getElementById("mClose").onclick = closeModal;
    document.getElementById("mCancel").onclick = closeModal;
    document.getElementById("mSave").onclick = async () => {
      const payload = readFields();
      const err = validate(payload);
      if (err) { setMsg(document.getElementById("mMsg"), err, "error"); return; }
      if (payload.analista && !gestora && payload.analista !== session.nome) {
        setMsg(document.getElementById("mMsg"), "Você só pode registrar para si.", "error");
        return;
      }
      const id = item?.id || makeId("am_reg");
      try {
        await saveDoc(id, { tipo, ...payload, updatedBy: session.nome, ...(item ? {} : { createdBy: session.nome }) });
        await audit("am_salvar", { tipo, id }, session.nome);
        closeModal();
        items = filtrarPorAnalista(await listByTipo(tipo), session, payload.responsavel ? "responsavel" : "analista");
        // fallback: reload all of tipo filtered
        const all = await listByTipo(tipo);
        items = filtrarPorAnalista(all, session, "analista");
        if (!items.length && gestora) items = all;
        // if still empty but gestora used responsavel field
        if (gestora) items = all;
        else {
          items = all.filter((x) => x.analista === session.nome || x.responsavel === session.nome);
        }
        setMsg(msg, "Salvo com sucesso.", "success");
        paint();
      } catch (e) {
        setMsg(document.getElementById("mMsg"), e?.message || "Erro ao salvar.", "error");
      }
    };
    document.getElementById("mDel")?.addEventListener("click", async () => {
      if (!confirm("Excluir registro?")) return;
      await removeDoc(item.id);
      closeModal();
      items = items.filter((x) => x.id !== item.id);
      paint();
    });
  };

  paint();
}
