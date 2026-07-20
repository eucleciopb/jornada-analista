/**
 * Exportação de fechamento mensal (Excel-like CSV/HTML, PDF via impressão).
 */

function esc(v) {
  return `"${String(v ?? "").replaceAll('"', '""')}"`;
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Gera um arquivo .xls (HTML table) com várias abas simuladas por seções */
export function exportarFechamentoExcel({ mes, ano, metricas, treinamentos, resultadosCd, marcasProdutos, pendentes }) {
  const titulo = `Fechamento_${String(mes).padStart(2, "0")}_${ano}`;

  const sheet = (name, headers, rows) => {
    const head = headers.map(esc).join(";");
    const body = rows.map((r) => headers.map((h) => esc(r[h])).join(";")).join("\n");
    return `### ${name}\n${head}\n${body}`;
  };

  const resumoRows = [
    { Indicador: "Total de treinamentos", Valor: metricas.total },
    { Indicador: "CDs únicos impactados", Valor: metricas.cdsImpactados },
    { Indicador: "Pessoas treinadas", Valor: metricas.pessoasTreinadas },
    { Indicador: "Marcas", Valor: metricas.marcas },
    { Indicador: "Produtos", Valor: metricas.produtos },
    { Indicador: "Presenciais", Valor: metricas.presencial },
    { Indicador: "Online", Valor: metricas.online },
    { Indicador: "Com análise", Valor: metricas.comAnalise },
    { Indicador: "Aguardando análise", Valor: metricas.aguardandoAnalise },
    { Indicador: "% Melhorou", Valor: metricas.pctMelhorou?.toFixed?.(1) },
    { Indicador: "% Manteve", Valor: metricas.pctManteve?.toFixed?.(1) },
    { Indicador: "% Regrediu", Valor: metricas.pctRegrediu?.toFixed?.(1) }
  ];

  const content = [
    sheet("Resumo", ["Indicador", "Valor"], resumoRows),
    sheet(
      "Treinamentos",
      ["Data", "Treinamento", "Marca", "Produto", "Modalidade", "CDs", "Pessoas", "Resultado", "Status"],
      (treinamentos || []).map((t) => ({
        Data: t.data,
        Treinamento: t.nome,
        Marca: t.marca,
        Produto: t.produto,
        Modalidade: t.modalidade,
        CDs: (t.cds || []).map((c) => c.nome || c).join(", "),
        Pessoas: t.quantidadePessoas,
        Resultado: t.resultadoGeral,
        Status: t.statusAnalise
      }))
    ),
    sheet(
      "Resultados por treinamento",
      ["Treinamento", "CobAntes", "CobDepois", "HLAntes", "HLDepois", "Resultado"],
      (treinamentos || []).map((t) => ({
        Treinamento: t.nome,
        CobAntes: t.coberturaAntes,
        CobDepois: t.coberturaDepois,
        HLAntes: t.hlAntes,
        HLDepois: t.hlDepois,
        Resultado: t.resultadoGeral
      }))
    ),
    sheet(
      "Resultados por CD",
      ["CD", "CobAntes", "CobDepois", "HLAntes", "HLDepois", "Resultado"],
      resultadosCd || []
    ),
    sheet("Marcas e produtos", ["Tipo", "Nome", "Quantidade"], marcasProdutos || []),
    sheet(
      "Análises pendentes",
      ["Data", "Treinamento", "Marca", "Produto"],
      (pendentes || []).map((t) => ({
        Data: t.data,
        Treinamento: t.nome,
        Marca: t.marca,
        Produto: t.produto
      }))
    )
  ].join("\n\n");

  // BOM para Excel BR
  downloadBlob(`${titulo}.csv`, `\uFEFF${content}`, "text/csv;charset=utf-8");
}

export function exportarFechamentoPdfPrint({ mesLabel, usuario, metricasHtml, tabelaHtml, destaquesHtml }) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Permita pop-ups para gerar o PDF / impressão.");
    return;
  }
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
    <title>Fechamento Mensal — ${mesLabel}</title>
    <style>
      body{font-family:Inter,Arial,sans-serif;color:#0f172a;padding:24px;}
      h1{font-size:22px;margin:0 0 4px;}
      .meta{color:#64748b;margin-bottom:20px;}
      .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0;}
      .card{border:1px solid #e2e8f0;border-radius:10px;padding:12px;}
      .card strong{display:block;font-size:20px;}
      table{width:100%;border-collapse:collapse;font-size:12px;}
      th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left;}
      th{background:#f8fafc;}
      @media print{.no-print{display:none;}}
    </style></head><body>
    <h1>Fechamento Mensal de Treinamentos</h1>
    <div class="meta">Usuário: ${usuario} · Referência: ${mesLabel}</div>
    ${metricasHtml || ""}
    ${destaquesHtml || ""}
    ${tabelaHtml || ""}
    <p class="no-print"><button onclick="window.print()">Imprimir / Salvar PDF</button></p>
    </body></html>`);
  w.document.close();
}
