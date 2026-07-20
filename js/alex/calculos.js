/**
 * Cálculos de cobertura, HL e classificação de resultados
 * para análises de treinamentos de produtos.
 */

/** Tolerância configurável (manutenção): variação entre 0 e -toleranciaMantem */
export const TOLERANCIA_MANTEM_PCT = 5;

export const STATUS = {
  MELHOROU: "Melhorou",
  MANTEVE: "Manteve",
  REGREDIU: "Regrediu",
  MISTO: "Resultado misto",
  SEM_ANALISE: "Sem análise",
  AGUARDANDO: "Aguardando análise",
  NA: "N/A"
};

/**
 * Cobertura = clientes que compraram / base elegível
 * Retorna percentual (0–100) ou null se inválido.
 */
export function calcularCobertura(clientesCompraram, baseElegivel) {
  const a = Number(clientesCompraram);
  const b = Number(baseElegivel);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return null;
  return (a / b) * 100;
}

/** Variação em pontos percentuais */
export function variacaoCoberturaPp(coberturaFinal, coberturaInicial) {
  const f = Number(coberturaFinal);
  const i = Number(coberturaInicial);
  if (!Number.isFinite(f) || !Number.isFinite(i)) return null;
  return f - i;
}

/** Evolução relativa: (final - inicial) / inicial */
export function evolucaoRelativa(final, inicial) {
  const f = Number(final);
  const i = Number(inicial);
  if (!Number.isFinite(f) || !Number.isFinite(i)) return null;
  if (i === 0) return null; // evitar divisão por zero
  return (f - i) / i;
}

export function variacaoHl(hlFinal, hlInicial) {
  const f = Number(hlFinal);
  const i = Number(hlInicial);
  if (!Number.isFinite(f) || !Number.isFinite(i)) return null;
  return f - i;
}

/**
 * Variação percentual de HL.
 * Se HL inicial = 0: retorna null (N/A) e flag inicioVenda.
 */
export function variacaoPercentualHl(hlFinal, hlInicial) {
  const f = Number(hlFinal);
  const i = Number(hlInicial);
  if (!Number.isFinite(f) || !Number.isFinite(i)) {
    return { percentual: null, inicioVenda: false, aplicavel: false };
  }
  if (i === 0) {
    return {
      percentual: null,
      inicioVenda: f > 0,
      aplicavel: false,
      diferencaAbsoluta: f - i
    };
  }
  return {
    percentual: (f - i) / i,
    inicioVenda: false,
    aplicavel: true,
    diferencaAbsoluta: f - i
  };
}

/**
 * Classifica um indicador numérico.
 * Melhorou: variação > 0
 * Manteve: variação entre 0 e -tolerancia (%)
 * Regrediu: variação < -tolerancia
 *
 * Para cobertura usamos pontos percentuais; tolerancia é em "pontos" ou %
 * conforme o tipo. Por padrão: tolerância relativa ao valor inicial quando > 0,
 * senão absoluta.
 */
export function classificarIndicador(valorFinal, valorInicial, {
  toleranciaPct = TOLERANCIA_MANTEM_PCT,
  usarPontosPercentuais = false
} = {}) {
  const f = Number(valorFinal);
  const i = Number(valorInicial);
  if (!Number.isFinite(f) || !Number.isFinite(i)) return STATUS.SEM_ANALISE;

  const delta = f - i;

  if (delta > 0) return STATUS.MELHOROU;

  // faixa de manutenção: 0 até -tolerancia
  let limiarNegativo;
  if (usarPontosPercentuais) {
    limiarNegativo = -Math.abs(toleranciaPct);
  } else if (i === 0) {
    limiarNegativo = 0;
  } else {
    limiarNegativo = -Math.abs(toleranciaPct / 100) * Math.abs(i);
  }

  if (delta >= limiarNegativo) return STATUS.MANTEVE;
  return STATUS.REGREDIU;
}

/**
 * Resultado geral a partir dos status de cobertura e HL.
 */
export function resultadoGeral(statusCobertura, statusHl) {
  const c = statusCobertura || STATUS.SEM_ANALISE;
  const h = statusHl || STATUS.SEM_ANALISE;

  if (c === STATUS.SEM_ANALISE && h === STATUS.SEM_ANALISE) return STATUS.SEM_ANALISE;

  const criticos = [STATUS.REGREDIU];
  const positivos = [STATUS.MELHOROU];
  const neutros = [STATUS.MANTEVE, STATUS.SEM_ANALISE];

  const cobMelhorou = positivos.includes(c);
  const hlMelhorou = positivos.includes(h);
  const cobRegrediu = criticos.includes(c);
  const hlRegrediu = criticos.includes(h);
  const cobNeutro = neutros.includes(c);
  const hlNeutro = neutros.includes(h);

  if (cobMelhorou && hlRegrediu) return STATUS.MISTO;
  if (hlMelhorou && cobRegrediu) return STATUS.MISTO;
  if (cobRegrediu || hlRegrediu) return STATUS.REGREDIU;
  if (cobMelhorou || hlMelhorou) return STATUS.MELHOROU;
  if (cobNeutro && hlNeutro) return STATUS.MANTEVE;
  return STATUS.MANTEVE;
}

export function montarResultadoLinha({
  coberturaInicial,
  coberturaFinal,
  hlInicial,
  hlFinal,
  toleranciaPct = TOLERANCIA_MANTEM_PCT
} = {}) {
  const varCob = variacaoCoberturaPp(coberturaFinal, coberturaInicial);
  const varHlAbs = variacaoHl(hlFinal, hlInicial);
  const varHlPct = variacaoPercentualHl(hlFinal, hlInicial);

  const statusCobertura = classificarIndicador(coberturaFinal, coberturaInicial, {
    toleranciaPct,
    usarPontosPercentuais: true
  });
  const statusHl = classificarIndicador(hlFinal, hlInicial, {
    toleranciaPct,
    usarPontosPercentuais: false
  });

  return {
    coberturaInicial: Number(coberturaInicial) || 0,
    coberturaFinal: Number(coberturaFinal) || 0,
    variacaoCobertura: varCob,
    evolucaoRelativaCobertura: evolucaoRelativa(coberturaFinal, coberturaInicial),
    statusCobertura,
    hlInicial: Number(hlInicial) || 0,
    hlFinal: Number(hlFinal) || 0,
    variacaoHl: varHlAbs,
    percentualVariacaoHl: varHlPct.percentual,
    percentualVariacaoHlAplicavel: varHlPct.aplicavel,
    inicioVendaHl: varHlPct.inicioVenda,
    statusHl,
    resultadoGeral: resultadoGeral(statusCobertura, statusHl)
  };
}

export function formatPct(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(digits)}%`;
}

export function formatPp(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)} p.p.`;
}

export function formatHl(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
}

export function formatVariacaoHl(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatHl(n, digits)} HL`;
}

export function formatEvolucaoPct(ratio, digits = 2) {
  if (ratio === null || ratio === undefined || Number.isNaN(Number(ratio))) return "N/A";
  const pct = Number(ratio) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export function classeStatus(status) {
  const s = String(status || "");
  if (s === STATUS.MELHOROU) return "st-up";
  if (s === STATUS.MANTEVE) return "st-flat";
  if (s === STATUS.REGREDIU) return "st-down";
  if (s === STATUS.MISTO) return "st-mixed";
  return "st-none";
}

/** Valida períodos da análise em relação à data do treinamento */
export function validarPeriodosAnalise(dataTreinamento, periodoInicial, periodoAnalise) {
  const erros = [];
  const avisos = [];

  const treino = parseISODate(dataTreinamento);
  const piIni = parseISODate(periodoInicial?.dataInicial);
  const piFim = parseISODate(periodoInicial?.dataFinal);
  const paIni = parseISODate(periodoAnalise?.dataInicial);
  const paFim = parseISODate(periodoAnalise?.dataFinal);

  if (!piIni || !piFim || !paIni || !paFim) {
    erros.push("Informe o período inicial e o período de análise completos.");
    return { ok: false, erros, avisos };
  }

  if (piFim < piIni) erros.push("No período inicial, a data final não pode ser menor que a inicial.");
  if (paFim < paIni) erros.push("No período de análise, a data final não pode ser menor que a inicial.");

  if (treino) {
    if (piFim >= treino) erros.push("O período inicial deve ser anterior à data do treinamento.");
    if (paIni <= treino) erros.push("O período de análise deve ser posterior à data do treinamento.");
  }

  const diasIni = diasEntre(piIni, piFim);
  const diasAna = diasEntre(paIni, paFim);
  if (diasIni > 0 && diasAna > 0) {
    const ratio = Math.max(diasIni, diasAna) / Math.min(diasIni, diasAna);
    if (ratio >= 2) {
      avisos.push(
        `Os períodos têm durações muito diferentes (${diasIni} vs ${diasAna} dias). Considere ajustar para uma comparação mais justa.`
      );
    }
  }

  return { ok: erros.length === 0, erros, avisos, diasIni, diasAna };
}

export function parseISODate(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function diasEntre(a, b) {
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / 86400000) + 1;
}

export function toBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}
