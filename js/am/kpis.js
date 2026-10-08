/**
 * Cálculos de indicadores AM — sempre a partir de registros reais.
 */
import { listByTipo, todayISO, weekBounds, deriveAtraso, currentPeriodo } from "./db.js";
import { TIPO, PESOS_INDICE_PADRAO } from "./config.js";
import { filtrarPorAnalista, podeVerTodos } from "./auth.js";

export async function loadAmBundle(session) {
  const [
    entregas,
    compromissos,
    rotinas,
    modelos,
    fechamentos,
    visitas,
    ondas,
    treinamentos,
    conceitos,
    cdsClass,
    configs
  ] = await Promise.all([
    listByTipo(TIPO.ENTREGA),
    listByTipo(TIPO.COMPROMISSO),
    listByTipo(TIPO.ROTINA_OCORRENCIA),
    listByTipo(TIPO.ROTINA_MODELO),
    listByTipo(TIPO.FECHAMENTO),
    listByTipo(TIPO.VISITA),
    listByTipo(TIPO.ONDA),
    listByTipo(TIPO.TREINAMENTO),
    listByTipo(TIPO.CONCEITO),
    listByTipo(TIPO.CD_CLASS),
    listByTipo(TIPO.CONFIG)
  ]);

  const scope = (lista, campo = "analista") => filtrarPorAnalista(lista, session, campo);

  return {
    entregas: scope(entregas),
    compromissos: scope(compromissos),
    rotinas: scope(rotinas),
    modelos: podeVerTodos(session) ? modelos : modelos.filter((m) => {
      const resp = m.responsaveis || [];
      return !resp.length || resp.includes(session.nome);
    }),
    fechamentos: scope(fechamentos, "responsavel"),
    visitas: scope(visitas),
    ondas: podeVerTodos(session)
      ? ondas
      : ondas.filter((o) =>
          String(o.responsavel || "") === session.nome ||
          (o.analistas || []).includes(session.nome)
        ),
    treinamentos: scope(treinamentos, "analista"),
    conceitos: conceitos.filter((c) =>
      podeVerTodos(session) || c.visibilidade === "time" || (c.analistas || []).includes(session.nome) || c.responsavel === session.nome
    ),
    cdsClass,
    configs,
    allEntregas: podeVerTodos(session) ? entregas : scope(entregas),
    allVisitas: podeVerTodos(session) ? visitas : scope(visitas),
    raw: { entregas, compromissos, rotinas, visitas, fechamentos, ondas, treinamentos }
  };
}

export function inWeek(iso, bounds = weekBounds()) {
  const d = String(iso || "").slice(0, 10);
  if (!d) return false;
  return d >= bounds.inicio && d <= bounds.fim;
}

export function inPeriodo(iso, periodo = currentPeriodo()) {
  return String(iso || "").slice(0, 7) === periodo;
}

export function isConcluida(e) {
  const st = String(e.status || "").toLowerCase();
  return st === "validado" || Boolean(e.dataConclusao) || Number(e.progresso) >= 100;
}

export function dashboardAnalista(data, session) {
  const week = weekBounds();
  const periodo = currentPeriodo();
  const entregasSemana = data.entregas.filter((e) => inWeek(e.prazo, week) || inWeek(e.dataSolicitacao, week));
  const concluidas = entregasSemana.filter(isConcluida);
  const pendentes = entregasSemana.filter((e) => !isConcluida(e) && e.status !== "cancelado");
  const atrasadas = entregasSemana.filter((e) => deriveAtraso(e).atrasada);
  const extras = entregasSemana.filter((e) => String(e.tipoEntrega || "").toLowerCase() === "extra");

  const rotinasMes = data.rotinas.filter((r) => r.competencia === periodo);
  const rotinasOk = rotinasMes.filter((r) => r.status === "concluida" || r.status === "validado");
  const pctRotinas = rotinasMes.length
    ? Math.round((rotinasOk.length / rotinasMes.length) * 100)
    : null;

  const visitasMes = data.visitas.filter((v) => inPeriodo(v.dataVisita, periodo) && v.status !== "cancelada");
  const visitasObrigatorias = visitasMes.filter((v) => v.obrigatoria !== false && v.tipoVisita !== "extraordinaria");

  const proximos = [...data.compromissos]
    .filter((c) => c.status !== "cancelado" && String(c.data || "") >= todayISO())
    .sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")))
    .slice(0, 5);

  const pendencias = [...data.entregas, ...data.rotinas.map((r) => ({
    ...r,
    titulo: r.nome || r.titulo,
    prazo: r.prazo,
    kind: "rotina"
  }))]
    .filter((e) => e.status !== "cancelado" && e.status !== "validado" && e.status !== "concluida")
    .map((e) => ({ ...e, ...deriveAtraso(e) }))
    .filter((e) => e.atrasada || (e.prazo && e.prazo <= todayISO()))
    .sort((a, b) => String(a.prazo || "").localeCompare(String(b.prazo || "")))
    .slice(0, 12);

  return {
    week,
    periodo,
    cards: {
      previstasSemana: entregasSemana.filter((e) => e.status !== "cancelado").length,
      concluidasSemana: concluidas.length,
      pendentes: pendentes.length,
      atrasadas: atrasadas.length,
      extras: extras.length,
      pctRotinas,
      visitasObrigatorias: visitasObrigatorias.length,
      proximo: proximos[0] || null
    },
    entregasSemana,
    concluidas,
    pendentes,
    atrasadas,
    extras,
    rotinasMes,
    visitasMes,
    proximos,
    pendencias
  };
}

export function dashboardGestora(raw) {
  const week = weekBounds();
  const periodo = currentPeriodo();
  const entregas = raw.entregas || [];
  const doPeriodoPrazo = entregas.filter((e) => inWeek(e.prazo, week) && e.status !== "cancelado");
  const concluidas = doPeriodoPrazo.filter(isConcluida);
  const noPrazo = concluidas.filter((e) => {
    const d = deriveAtraso(e);
    return !d.foraDoPrazo && !d.atrasada;
  });
  const atrasadas = doPeriodoPrazo.filter((e) => deriveAtraso(e).atrasada || deriveAtraso(e).foraDoPrazo);
  const extras = entregas.filter((e) => String(e.tipoEntrega).toLowerCase() === "extra" && inWeek(e.prazo, week));
  const rotinas = (raw.rotinas || []).filter((r) => r.competencia === periodo);
  const rotinasOk = rotinas.filter((r) => r.status === "concluida" || r.status === "validado");
  const visitas = (raw.visitas || []).filter((v) => inPeriodo(v.dataVisita, periodo));
  const nielsen = (raw.fechamentos || []).filter((f) => f.tipoFechamento === "nielsen" && f.competencia === periodo);
  const strata = (raw.fechamentos || []).filter((f) => f.tipoFechamento === "strata" && f.competencia === periodo);
  const treinos = (raw.treinamentos || []).filter((t) => inPeriodo(t.data, periodo));
  const ondas = raw.ondas || [];

  const porAnalista = {};
  for (const e of entregas) {
    const a = e.analista || "—";
    if (!porAnalista[a]) porAnalista[a] = { nome: a, previstas: 0, concluidas: 0, atrasadas: 0, extras: 0 };
    if (inWeek(e.prazo, week) && e.status !== "cancelado") {
      porAnalista[a].previstas += 1;
      if (isConcluida(e)) porAnalista[a].concluidas += 1;
      if (deriveAtraso(e).atrasada || deriveAtraso(e).foraDoPrazo) porAnalista[a].atrasadas += 1;
      if (String(e.tipoEntrega).toLowerCase() === "extra") porAnalista[a].extras += 1;
    }
  }

  const pctPrazo = doPeriodoPrazo.length
    ? Math.round((noPrazo.length / doPeriodoPrazo.length) * 100)
    : null;

  return {
    week,
    periodo,
    cards: {
      previstas: doPeriodoPrazo.length,
      concluidas: concluidas.length,
      pctPrazo,
      atrasadas: atrasadas.length,
      pctRotinas: rotinas.length ? Math.round((rotinasOk.length / rotinas.length) * 100) : null,
      visitas: visitas.length,
      nielsenOk: nielsen.filter(isConcluida).length,
      nielsenTotal: nielsen.length,
      strataOk: strata.filter(isConcluida).length,
      strataTotal: strata.length,
      treinos: treinos.length,
      ondasAbertas: ondas.filter((o) => o.status === "aberta").length,
      ondasEncerradas: ondas.filter((o) => o.status === "encerrada").length,
      extras: extras.length,
      analistasPendencias: Object.values(porAnalista).filter((a) => a.atrasadas > 0 || (a.previstas - a.concluidas) > 0).length
    },
    porAnalista: Object.values(porAnalista).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    entregas: doPeriodoPrazo,
    atrasadas,
    rotinas,
    visitas,
    nielsen,
    strata,
    treinos,
    ondas
  };
}

export function indiceExecucao(analistaNome, raw, pesos = PESOS_INDICE_PADRAO) {
  const periodo = currentPeriodo();
  const entregas = (raw.entregas || []).filter((e) => e.analista === analistaNome && inPeriodo(e.prazo, periodo) && e.status !== "cancelado");
  const concluidas = entregas.filter(isConcluida);
  const noPrazo = concluidas.filter((e) => !deriveAtraso(e).foraDoPrazo);
  const rotinas = (raw.rotinas || []).filter((r) => r.analista === analistaNome && r.competencia === periodo);
  const rotOk = rotinas.filter((r) => r.status === "concluida" || r.status === "validado");
  const visitas = (raw.visitas || []).filter((v) => v.analista === analistaNome && inPeriodo(v.dataVisita, periodo) && v.obrigatoria !== false);
  const visitasOk = visitas.filter((v) => v.status === "realizada" && (v.evidencia || v.material || (v.anexos || []).length));
  const treinos = (raw.treinamentos || []).filter((t) => t.analista === analistaNome && inPeriodo(t.data, periodo));
  const qualidadeBase = concluidas.filter((e) => e.validacao === "primeira_submissao" || e.aceitePrimeira);

  const componentes = [];
  const add = (key, peso, num, den) => {
    if (!peso || den === 0) return;
    componentes.push({ key, peso, num, den, pct: Math.round((num / den) * 100) });
  };
  add("entregasNoPrazo", pesos.entregasNoPrazo, noPrazo.length, entregas.length);
  add("rotinas", pesos.rotinas, rotOk.length, rotinas.length);
  add("visitas", pesos.visitas, visitasOk.length, visitas.length);
  add("treinamentos", pesos.treinamentos, treinos.length, Math.max(treinos.length, 1));
  add("qualidade", pesos.qualidade, qualidadeBase.length, concluidas.length);

  if (!componentes.length) {
    return { disponivel: false, score: null, componentes: [] };
  }
  const pesoTotal = componentes.reduce((s, c) => s + c.peso, 0);
  const score = Math.round(
    componentes.reduce((s, c) => s + (c.pct * c.peso) / pesoTotal, 0)
  );
  return { disponivel: true, score, componentes, pesoTotal };
}
