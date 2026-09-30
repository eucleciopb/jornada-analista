/**
 * Relatório de Visita ao CD
 * Registro e devolutiva da visita do Analista de Jornada Comercial.
 *
 * Não é avaliação: não há nota, score, ranking, conceito ou aprovação do CD.
 *
 * Firestore
 * Coleção: apuracoes_treinamentos (já liberada nas regras do portal)
 * tipo: "relatorio_visita_cd"
 * Documento:
 *  - tipo: "relatorio_visita_cd"
 *  - cd, dataInicial, dataFinal
 *  - analistaNome, analistaUidKey, analistaMatricula
 *  - responsavelCd
 *  - destaques, resumo
 *  - reuniaoMatinal, reuniaoVespertina
 *  - rotinasTexto
 *  - processos[] { tema, situacao, orientacao }
 *  - rotas[] { supervisor, vendedor (matrícula), data, cidade, tipo, registro }
 *  - ocorrenciasPercentual, ocorrenciasVendedores, ocorrenciasTipos, ocorrenciasComentarios
 *  - treinamentos[] { origemId, cd, tema, data, modalidade, publico, participantes, observacoes }
 *  - apoioJornada
 *  - combinados[] { combinado, responsavel, apoio, prazo }
 *  - consideracoes
 *  - proximos[] { tema, responsavel, prazo, observacao }
 *  - status: "rascunho" | "finalizado"
 *  - criadoEm, criadoEmIso, atualizadoEm, atualizadoEmIso
 */

export const COLECAO_RELATORIO_VISITA = "apuracoes_treinamentos";
export const TIPO_RELATORIO_VISITA = "relatorio_visita_cd";
export const STATUS_RASCUNHO = "rascunho";
export const STATUS_FINALIZADO = "finalizado";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const CHAVES = {
  processos: ["tema", "situacao", "orientacao"],
  rotas: ["supervisor", "vendedor", "data", "cidade", "tipo", "registro"],
  treinamentos: ["origemId", "cd", "tema", "data", "modalidade", "publico", "participantes", "observacoes"],
  combinados: ["combinado", "responsavel", "apoio", "prazo"],
  proximos: ["tema", "responsavel", "prazo", "observacao"]
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function texto(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function textoLivre(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

export function normalizarStatus(status) {
  return String(status || "").trim().toLowerCase() === STATUS_FINALIZADO
    ? STATUS_FINALIZADO
    : STATUS_RASCUNHO;
}

export function rotuloStatus(status) {
  return normalizarStatus(status) === STATUS_FINALIZADO ? "Finalizado" : "Rascunho";
}

function partesData(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mes = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mes < 1 || mes > 12 || d < 1 || d > 31) return null;
  return { y, m: mes, d };
}

export function formatarDataCurta(iso) {
  const p = partesData(iso);
  if (!p) return "—";
  return `${String(p.d).padStart(2, "0")}/${String(p.m).padStart(2, "0")}/${p.y}`;
}

export function formatarDataRegistro(iso) {
  const p = partesData(iso);
  if (!p) return "—";
  return `${String(p.d).padStart(2, "0")}/${String(p.m).padStart(2, "0")}/${p.y}`;
}

export function formatarPeriodo(inicio, fim) {
  const a = partesData(inicio);
  const b = partesData(fim || inicio);
  if (!a && !b) return "—";
  if (!a) return formatarPeriodo(fim, fim);
  const anoCurto = (ano) => String(ano).slice(-2);
  if (!b || (a.y === b.y && a.m === b.m && a.d === b.d)) {
    return `${a.d} de ${MESES[a.m - 1]}/${anoCurto(a.y)}`;
  }
  if (a.y === b.y && a.m === b.m) {
    return `${a.d} a ${b.d} de ${MESES[a.m - 1]}/${anoCurto(b.y)}`;
  }
  if (a.y === b.y) {
    return `${a.d} de ${MESES[a.m - 1]} a ${b.d} de ${MESES[b.m - 1]}/${anoCurto(b.y)}`;
  }
  return `${a.d} de ${MESES[a.m - 1]}/${anoCurto(a.y)} a ${b.d} de ${MESES[b.m - 1]}/${anoCurto(b.y)}`;
}

export function nomeCd(cd) {
  const limpo = String(cd || "")
    .replace(/^cd\s*[-–—]\s*/i, "")
    .trim();
  return limpo || "—";
}

export function isoDeFirestore(valor) {
  if (!valor) return "";
  if (typeof valor === "string") return valor;
  if (typeof valor.toDate === "function") {
    try { return valor.toDate().toISOString(); } catch { return ""; }
  }
  if (typeof valor.seconds === "number") {
    return new Date(valor.seconds * 1000).toISOString();
  }
  return "";
}

function limparLista(lista, chaves) {
  if (!Array.isArray(lista)) return [];
  return lista.map((item) => {
    const out = {};
    chaves.forEach((chave) => {
      out[chave] = chave === "registro" || chave === "observacoes" || chave === "situacao" || chave === "orientacao" || chave === "observacao"
        ? textoLivre(item?.[chave])
        : texto(item?.[chave]);
    });
    return out;
  }).filter((item) => Object.values(item).some(Boolean));
}

export function relatorioVazio(usuario = {}) {
  return {
    id: "",
    cd: "",
    dataInicial: "",
    dataFinal: "",
    analistaNome: texto(usuario.nome),
    analistaUidKey: texto(usuario.uidKey),
    analistaMatricula: texto(usuario.matricula),
    responsavelCd: "",
    destaques: "",
    resumo: "",
    reuniaoMatinal: "",
    reuniaoVespertina: "",
    rotinasTexto: "",
    processos: [],
    rotas: [],
    ocorrenciasPercentual: "",
    ocorrenciasVendedores: "",
    ocorrenciasTipos: "",
    ocorrenciasComentarios: "",
    treinamentos: [],
    apoioJornada: "",
    combinados: [],
    consideracoes: "",
    proximos: [],
    status: STATUS_RASCUNHO,
    criadoEmIso: "",
    atualizadoEmIso: ""
  };
}

export function normalizarRelatorio(raw) {
  const base = relatorioVazio();
  const r = raw || {};
  return {
    ...base,
    id: texto(r.id),
    cd: texto(r.cd),
    dataInicial: texto(r.dataInicial),
    dataFinal: texto(r.dataFinal),
    analistaNome: texto(r.analistaNome),
    analistaUidKey: texto(r.analistaUidKey),
    analistaMatricula: texto(r.analistaMatricula),
    responsavelCd: texto(r.responsavelCd),
    destaques: textoLivre(r.destaques),
    resumo: textoLivre(r.resumo),
    reuniaoMatinal: textoLivre(r.reuniaoMatinal),
    reuniaoVespertina: textoLivre(r.reuniaoVespertina),
    rotinasTexto: textoLivre(r.rotinasTexto),
    processos: limparLista(r.processos, CHAVES.processos),
    rotas: limparLista(r.rotas, CHAVES.rotas),
    ocorrenciasPercentual: texto(r.ocorrenciasPercentual),
    ocorrenciasVendedores: textoLivre(r.ocorrenciasVendedores),
    ocorrenciasTipos: textoLivre(r.ocorrenciasTipos),
    ocorrenciasComentarios: textoLivre(r.ocorrenciasComentarios),
    treinamentos: limparLista(r.treinamentos, CHAVES.treinamentos),
    apoioJornada: textoLivre(r.apoioJornada),
    combinados: limparLista(r.combinados, CHAVES.combinados),
    consideracoes: textoLivre(r.consideracoes),
    proximos: limparLista(r.proximos, CHAVES.proximos),
    status: normalizarStatus(r.status),
    criadoEmIso: isoDeFirestore(r.criadoEmIso) || isoDeFirestore(r.criadoEm),
    atualizadoEmIso: isoDeFirestore(r.atualizadoEmIso) || isoDeFirestore(r.atualizadoEm)
  };
}

export function validarRelatorio(relatorio, { finalizar = false } = {}) {
  const r = normalizarRelatorio(relatorio);
  const erros = [];

  if (!r.cd) erros.push("Selecione o CD visitado.");
  if (!r.dataInicial) erros.push("Informe a data inicial da visita.");
  if (!r.dataFinal) erros.push("Informe a data final da visita.");
  if (r.dataInicial && r.dataFinal && r.dataFinal < r.dataInicial) {
    erros.push("A data final precisa ser igual ou posterior à data inicial.");
  }
  if (r.rotas.some((rota) => rota.vendedor && !/^\d{1,6}$/.test(rota.vendedor))) {
    erros.push("A matrícula do vendedor deve conter somente números e no máximo 6 dígitos.");
  }

  if (finalizar) {
    if (!r.responsavelCd) {
      erros.push("Informe o responsável pelo CD acompanhado durante a visita.");
    }
    const temDevolutiva = [
      r.destaques,
      r.resumo,
      r.reuniaoMatinal,
      r.reuniaoVespertina,
      r.rotinasTexto,
      r.apoioJornada,
      r.consideracoes,
      r.ocorrenciasComentarios
    ].some(Boolean)
      || r.processos.length
      || r.rotas.length
      || r.treinamentos.length
      || r.combinados.length
      || r.proximos.length;

    if (!temDevolutiva) {
      erros.push("Registre ao menos um acompanhamento, uma orientação ou a devolutiva final antes de concluir.");
    }
  }

  return erros;
}

export function chaveCd(cd) {
  return String(cd || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^cd\s*[-–—]\s*/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function normalizarTreinamentoRealizado(raw) {
  const item = raw || {};
  const participantes = Number(item.totalPessoas);
  return {
    origemId: texto(item.id),
    cd: texto(item.cd),
    tema: texto(item.treinamento || item.tema),
    data: texto(item.data),
    modalidade: texto(item.tipoTreinamento || item.modalidade),
    publico: texto(item.publico),
    participantes: Number.isFinite(participantes) && participantes >= 0
      ? String(participantes)
      : texto(item.participantes),
    observacoes: textoLivre(item.obs || item.observacoes)
  };
}

export function filtrarTreinamentosDaVisita(lista, {
  cd,
  dataInicial,
  dataFinal
} = {}) {
  const cdKey = chaveCd(cd);
  if (!cdKey || !dataInicial || !dataFinal) return [];

  return (lista || [])
    .map(normalizarTreinamentoRealizado)
    .filter((item) =>
      chaveCd(item.cd) === cdKey &&
      item.data >= dataInicial &&
      item.data <= dataFinal
    )
    .sort((a, b) =>
      String(a.data).localeCompare(String(b.data)) ||
      String(a.tema).localeCompare(String(b.tema), "pt-BR")
    );
}

export function filtrarRelatorios(lista, filtros = {}) {
  const cd = texto(filtros.cd);
  const analista = texto(filtros.analista);
  const inicio = texto(filtros.inicio);
  const fim = texto(filtros.fim);
  const status = texto(filtros.status);

  return (lista || []).filter((item) => {
    const r = item?.cd ? item : normalizarRelatorio(item);
    if (cd && chaveCd(r.cd) !== chaveCd(cd)) return false;
    if (analista && texto(r.analistaNome).toLowerCase() !== analista.toLowerCase()) return false;
    if (status && normalizarStatus(r.status) !== normalizarStatus(status)) return false;
    if (inicio || fim) {
      const a1 = r.dataInicial || r.dataFinal;
      const a2 = r.dataFinal || r.dataInicial;
      if (!a1 || !a2) return false;
      if (fim && a1 > fim) return false;
      if (inicio && a2 < inicio) return false;
    }
    return true;
  });
}

export function ordenarRelatorios(lista) {
  return [...(lista || [])].sort((a, b) => {
    const da = a.dataInicial || a.criadoEmIso || "";
    const db = b.dataInicial || b.criadoEmIso || "";
    if (da !== db) return db.localeCompare(da);
    return String(b.atualizadoEmIso || "").localeCompare(String(a.atualizadoEmIso || ""));
  });
}

export function podeEditarRelatorio(relatorio, usuario) {
  if (!usuario) return false;
  if (usuario.isAdmin || String(usuario.perfil || "").toLowerCase() === "admin") return true;
  if (!relatorio?.id) return true;
  const uid = texto(usuario.uidKey).toLowerCase();
  const nome = texto(usuario.nome).toLowerCase();
  if (uid && texto(relatorio.analistaUidKey).toLowerCase() === uid) return true;
  if (nome && texto(relatorio.analistaNome).toLowerCase() === nome) return true;
  return false;
}

export function formatarOcorrencia(valor) {
  const t = texto(valor);
  if (!t) return "";
  if (t.includes("%")) return t;
  if (/^\d+([.,]\d+)?$/.test(t)) return `${t.replace(".", ",")}%`;
  return t;
}

function paragrafo(valor) {
  const t = textoLivre(valor);
  if (!t) return "";
  return `<p class="doc-text">${escapeHtml(t).replaceAll("\n", "<br>")}</p>`;
}

function secao(titulo, html) {
  if (!html) return "";
  return `<section class="doc-sec"><h2>${escapeHtml(titulo)}</h2>${html}</section>`;
}

function htmlReunioes(r) {
  const blocos = [];
  if (r.reuniaoMatinal) {
    blocos.push(`<h3>Matinal</h3>${paragrafo(r.reuniaoMatinal)}`);
  }
  if (r.reuniaoVespertina) {
    blocos.push(`<h3>Vespertina</h3>${paragrafo(r.reuniaoVespertina)}`);
  }
  return blocos.join("");
}

function htmlProcessos(r) {
  const itens = r.processos.map((p) => {
    const partes = [
      p.situacao ? `<p><strong>Situação encontrada.</strong> ${escapeHtml(p.situacao).replaceAll("\n", "<br>")}</p>` : "",
      p.orientacao ? `<p><strong>Orientação.</strong> ${escapeHtml(p.orientacao).replaceAll("\n", "<br>")}</p>` : ""
    ].join("");
    return `<article class="doc-item"><h3>${escapeHtml(p.tema || "Processo / tema")}</h3>${partes}</article>`;
  }).join("");
  return `${paragrafo(r.rotinasTexto)}${itens}`;
}

function htmlRotas(r) {
  return r.rotas.map((rota) => {
    const metas = [
      rota.supervisor ? `Supervisor: ${rota.supervisor}` : "",
      rota.vendedor ? `Matrícula do vendedor: ${rota.vendedor}` : "",
      rota.data ? `Data: ${formatarDataCurta(rota.data)}` : "",
      rota.cidade ? `Cidade / região: ${rota.cidade}` : "",
      rota.tipo ? `Tipo: ${rota.tipo}` : ""
    ].filter(Boolean);
    const meta = metas.length
      ? `<p class="doc-meta-line">${escapeHtml(metas.join(" · "))}</p>`
      : "";
    return `<article class="doc-item">${meta}${paragrafo(rota.registro)}</article>`;
  }).join("");
}

function htmlDeOlho(r) {
  const fatos = [];
  const percentual = formatarOcorrencia(r.ocorrenciasPercentual);
  if (percentual) fatos.push(["% de ocorrências do CD", percentual]);
  if (r.ocorrenciasVendedores) fatos.push(["Vendedores com maior concentração", r.ocorrenciasVendedores]);
  if (r.ocorrenciasTipos) fatos.push(["Principais tipos de ocorrência", r.ocorrenciasTipos]);
  const lista = fatos.length
    ? `<ul class="doc-facts">${fatos.map(([k, v]) => `<li><span>${escapeHtml(k)}</span><strong>${escapeHtml(v).replaceAll("\n", "<br>")}</strong></li>`).join("")}</ul>`
    : "";
  const comentario = paragrafo(r.ocorrenciasComentarios);
  if (!lista && !comentario) return "";
  return `<p class="doc-note">Leitura do indicador no momento da visita.</p>${lista}${comentario}`;
}

function htmlTreinamentos(r) {
  if (!r.treinamentos.length) return "";
  const linhas = r.treinamentos.map((t) => `
    <tr>
      <td>${escapeHtml(t.tema || "—")}</td>
      <td>${escapeHtml(t.data ? formatarDataCurta(t.data) : "—")}</td>
      <td>${escapeHtml(t.modalidade || "—")}</td>
      <td>${escapeHtml(t.publico || "—")}</td>
      <td>${escapeHtml(t.participantes || "—")}</td>
      <td>${escapeHtml(t.observacoes || "—")}</td>
    </tr>
  `).join("");
  return `
    <table class="doc-table">
      <thead>
        <tr>
          <th>Tema</th>
          <th>Data</th>
          <th>Modalidade</th>
          <th>Público</th>
          <th>Participantes</th>
          <th>Observações</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function htmlCombinados(r) {
  if (!r.combinados.length) return "";
  const linhas = r.combinados.map((c) => `
    <tr>
      <td>${escapeHtml(c.combinado || "—")}</td>
      <td>${escapeHtml(c.responsavel || "—")}</td>
      <td>${escapeHtml(c.apoio || "—")}</td>
      <td>${escapeHtml(c.prazo || "—")}</td>
    </tr>
  `).join("");
  return `
    <table class="doc-table">
      <thead>
        <tr>
          <th>O que ficou combinado?</th>
          <th>Quem ficou responsável?</th>
          <th>Como a Jornada Comercial apoiará?</th>
          <th>Prazo</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function htmlProximos(r) {
  if (!r.proximos.length) return "";
  const linhas = r.proximos.map((p) => `
    <tr>
      <td>${escapeHtml(p.tema || "—")}</td>
      <td>${escapeHtml(p.responsavel || "—")}</td>
      <td>${escapeHtml(p.prazo || "—")}</td>
      <td>${escapeHtml(p.observacao || "—")}</td>
    </tr>
  `).join("");
  return `
    <table class="doc-table">
      <thead>
        <tr>
          <th>Tema</th>
          <th>Responsável</th>
          <th>Data / prazo</th>
          <th>Observação</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

export function htmlCorpoDocumento(relatorio) {
  const r = normalizarRelatorio(relatorio);
  const status = rotuloStatus(r.status);
  const quando = r.criadoEmIso ? formatarDataRegistro(r.criadoEmIso) : "";
  const secoes = [
    secao("Destaques da Visita", paragrafo(r.destaques)),
    secao("Resumo da Visita", paragrafo(r.resumo)),
    secao("Reuniões", htmlReunioes(r)),
    secao("Rotinas e Processos", htmlProcessos(r)),
    secao("Acompanhamento em Rota", htmlRotas(r)),
    secao("De Olho na Rota", htmlDeOlho(r)),
    secao("Treinamentos Realizados", htmlTreinamentos(r)),
    secao("Como a Jornada Comercial pode apoiar?", paragrafo(r.apoioJornada)),
    secao("Combinados da Visita", htmlCombinados(r)),
    secao("Considerações Finais", paragrafo(r.consideracoes)),
    secao("Próximos Acompanhamentos", htmlProximos(r))
  ].join("");

  const vazio = secoes
    ? ""
    : `<p class="doc-text">Ainda não há devolutiva registrada neste relatório.</p>`;

  return `
    <header class="doc-head">
      <div class="doc-brand">
        <div class="doc-mark" aria-hidden="true">GP</div>
        <div>
          <strong>Jornada Comercial | Grupo Petrópolis</strong>
          <span>Registro e devolutiva de visita</span>
        </div>
      </div>
      <h1>RELATÓRIO DE VISITA AO CD</h1>
      <div class="doc-grid">
        <div><span>CD</span><strong>${escapeHtml(nomeCd(r.cd))}</strong></div>
        <div><span>Período</span><strong>${escapeHtml(formatarPeriodo(r.dataInicial, r.dataFinal))}</strong></div>
        <div><span>Analista</span><strong>${escapeHtml(r.analistaNome || "—")}</strong></div>
        <div><span>Responsável pelo CD</span><strong>${escapeHtml(r.responsavelCd || "—")}</strong></div>
      </div>
      <p class="doc-status">${escapeHtml(status)}${quando ? ` · ${escapeHtml(quando)}` : ""}</p>
    </header>
    ${secoes || vazio}
    <footer class="doc-foot">
      Jornada Comercial · Grupo Petrópolis · Registro da devolutiva da visita e dos combinados feitos com o CD.
    </footer>
  `;
}

export const CSS_DOCUMENTO = `
  .rv-paper {
    background: #fff;
    color: #0f172a;
    font-family: Inter, "Segoe UI", Arial, sans-serif;
    line-height: 1.5;
  }
  .doc-head { margin-bottom: 22px; }
  .doc-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0f172a;
    color: #fff;
    border-radius: 16px;
    padding: 14px 16px;
  }
  .doc-mark {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .doc-brand strong { display: block; font-size: 14px; }
  .doc-brand span { display: block; color: #cbd5e1; font-size: 12px; margin-top: 2px; }
  .rv-paper h1 {
    margin: 18px 0 12px;
    font-size: 22px;
    letter-spacing: 0.04em;
    font-weight: 800;
  }
  .doc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 18px;
    padding: 12px 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
  .doc-grid span {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #64748b;
  }
  .doc-grid strong { display: block; font-size: 15px; margin-top: 2px; }
  .doc-status { margin: 10px 0 0; color: #475569; font-size: 12px; }
  .doc-sec { margin-top: 22px; }
  .doc-sec h2 {
    margin: 0 0 8px;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #1d4ed8;
    border-bottom: 1px solid #dbeafe;
    padding-bottom: 6px;
  }
  .doc-sec h3 { margin: 12px 0 4px; font-size: 15px; color: #0f172a; }
  .doc-text { margin: 0 0 8px; white-space: normal; font-size: 14px; }
  .doc-item {
    margin-top: 10px;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
  }
  .doc-item p { margin: 4px 0 0; font-size: 14px; }
  .doc-meta-line { margin: 0; color: #334155; font-size: 13px; font-weight: 600; }
  .doc-note { margin: 0 0 8px; color: #64748b; font-size: 12px; }
  .doc-facts { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 8px; }
  .doc-facts li {
    display: grid;
    gap: 2px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
  }
  .doc-facts span { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }
  .doc-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px; }
  .doc-table th, .doc-table td {
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  .doc-table th { background: #f8fafc; font-size: 11px; letter-spacing: 0.03em; text-transform: uppercase; color: #475569; }
  .doc-foot {
    margin-top: 28px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 11px;
  }
  @media print {
    .no-print { display: none !important; }
    .rv-paper { box-shadow: none !important; }
    .doc-item, .doc-table tr { break-inside: avoid; page-break-inside: avoid; }
  }
`;

export function tituloDocumento(relatorio) {
  const r = normalizarRelatorio(relatorio);
  const cd = nomeCd(r.cd).replace(/[^\p{L}\p{N}]+/gu, " ").trim() || "CD";
  const data = r.dataInicial ? formatarDataCurta(r.dataInicial).replaceAll("/", "-") : "";
  return `Relatorio de Visita - ${cd}${data ? ` - ${data}` : ""}`;
}

export function htmlDocumento(relatorio) {
  const r = normalizarRelatorio(relatorio);
  const titulo = escapeHtml(tituloDocumento(r));
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${titulo}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body { margin: 0; background: #fff; }
    .rv-paper { padding: 0; }
    .doc-brand { border-radius: 0; }
    ${CSS_DOCUMENTO}
    .no-print { margin: 0 0 16px; }
    .no-print button {
      border: 0;
      background: #1d4ed8;
      color: #fff;
      border-radius: 10px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .no-print p { color: #64748b; font: 12px/1.4 Inter, Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="no-print">
    <button type="button" onclick="window.print()">Salvar como PDF</button>
    <p>Na janela de impressão, escolha “Salvar como PDF”.</p>
  </div>
  <article class="rv-paper">
    ${htmlCorpoDocumento(r)}
  </article>
  <script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 300); });</script>
</body>
</html>`;
}

export function abrirPdfRelatorio(relatorio) {
  const janela = window.open("", "_blank");
  if (!janela) return false;
  janela.document.open();
  janela.document.write(htmlDocumento(relatorio));
  janela.document.close();
  return true;
}
