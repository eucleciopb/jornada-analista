export const M5 = {
  id: "m5",
  numero: 5,
  titulo: "Indicadores que o analista precisa dominar",
  objetivo: "Ensinar o analista a entender o número, encontrar o desvio e transformar o dado em ação.",
  aulas: [
    {
      id: "m5-a01",
      titulo: "Por que os indicadores são importantes",
      objetivo: "Posicionar o indicador como linguagem de gestão, não como ranking de pessoas.",
      lead: "Indicador existe para mostrar desvio a tempo de corrigir. O ATV que não lê número vira opiniático. O ATV que só lê número e não vai ao campo vira relator. Os dois lados importam.",
      visuais: [
        { titulo: "Ver", texto: "O que está fora do padrão." },
        { titulo: "Entender", texto: "Qual comportamento gera esse número." },
        { titulo: "Agir", texto: "Plano na rota, no rito e no treino." }
      ],
      entenda: [
        "Indicador sem ação é painel de parede.",
        "Ação sem indicador é achismo.",
        "O analista usa o número para escolher onde estar."
      ],
      pratica: [
        "Antes de ir ao CD, escolha 3 desvios — não 30.",
        "Chegue com hipótese e valide no campo.",
        "Volte o número para o rito com causa e plano."
      ],
      papel: [
        "Traduzir indicador em desenvolvimento.",
        "Nunca usar KPI para expor gente no coletivo."
      ],
      checklist: [
        "Indicador ligado a comportamento",
        "Desvio priorizado",
        "Ação prevista"
      ],
      mensagem: "O número aponta. O analista conduz a correção.",
      quiz: {
        pergunta: "Indicador serve para o ATV:",
        opcoes: [
          "Montar ranking público de piores vendedores",
          "Enxergar desvio e transformar em ação de desenvolvimento",
          "Substituir a visita de campo"
        ],
        correta: 1,
        acerto: "Certo. Número + ação, sem exposição.",
        erro: "KPI não é palco. É ponto de partida para desenvolver."
      }
    },
    {
      id: "m5-a02",
      titulo: "Eficiência de Visita",
      objetivo: "Dominar conceito, cálculo, resultado diário, acumulado e faixas de interpretação.",
      lead: "Eficiência de Visita mede se o planejado da rota foi cumprido. É um dos KPIs mais lidos na Matinal e na RPS porque mostra disciplina de carteira.",
      formula: {
        titulo: "Cálculo",
        texto: "Eficiência de Visita (%) = (Visitas realizadas ÷ Visitas planejadas) × 100",
        nota: "Use o mesmo recorte de carteira/rota do Painel ITA. Diário olha o dia. Acumulado olha o período."
      },
      faixas: [
        { tone: "ok", texto: "≥ 95% · Dentro do padrão" },
        { tone: "info", texto: "90% a 94,9% · Atenção" },
        { tone: "warn", texto: "80% a 89,9% · Desvio" },
        { tone: "bad", texto: "< 80% · Crítico" }
      ],
      visuais: [
        { titulo: "Diário", texto: "Ex.: 16 realizadas / 18 planejadas = 88,9% → desvio do dia." },
        { titulo: "Acumulado", texto: "Ex.: 74 / 80 no período = 92,5% → atenção no acumulado." }
      ],
      entenda: [
        "Realizada conta visita com qualidade de registro no padrão da operação — não 'passou na porta'.",
        "Planejada é a carteira/rota do dia ou do período.",
        "Diário bom com acumulado ruim (ou o contrário) conta histórias diferentes: pico versus consistência."
      ],
      pratica: [
        "Calcule sempre diário e acumulado antes da Matinal.",
        "Se o diário caiu, olhe furo de rota e visita incompleta no mesmo dia.",
        "Não comemore eficiência alta com visita rasa: cruze com campo."
      ],
      papel: [
        "Ensinar o SV a ler faixa, não só o percentual.",
        "Investigar causa no campo quando entrar em desvio ou crítico."
      ],
      checklist: [
        "Fórmula memorizada",
        "Diferença diário × acumulado",
        "Faixas de interpretação usadas na conversa"
      ],
      mensagem: "Eficiência mede disciplina da rota. Interprete a faixa e vá à causa.",
      quiz: {
        pergunta: "18 planejadas e 16 realizadas no dia. Qual a eficiência e a faixa?",
        opcoes: [
          "88,9% · desvio",
          "160% · dentro do padrão",
          "16% · crítico"
        ],
        correta: 0,
        acerto: "16 ÷ 18 × 100 = 88,9%, faixa de desvio (80 a 89,9%).",
        erro: "Calcule 16/18 × 100 = 88,9%. Pela faixa, é desvio."
      }
    },
    {
      id: "m5-a03",
      titulo: "Onde acompanhar a Eficiência de Visita no Painel ITA",
      objetivo: "Saber o caminho de consulta no Painel ITA para o dia e o acumulado.",
      lead: "Não basta saber a fórmula. O ATV precisa achar o indicador no Painel ITA no recorte certo: CD, SV, vendedor, dia e período. Consulta errada gera reunião errada.",
      visuais: [
        { titulo: "Recorte", texto: "CD → equipe → vendedor." },
        { titulo: "Tempo", texto: "Dia e acumulado do mês/semana." },
        { titulo: "Uso", texto: "Levar o print mental para Matinal, RPS e rota." }
      ],
      passos: [
        "Abrir o Painel ITA",
        "Selecionar o CD da visita",
        "Localizar Eficiência de Visita no bloco de indicadores da rota",
        "Olhar o diário e o acumulado no mesmo recorte",
        "Descer até o SV/VDD do desvio antes de generalizar o CD"
      ],
      entenda: [
        "Dado de CD esconde SV. Dado de SV esconde VDD.",
        "O analista desce o funil até achar o dono do desvio.",
        "Painel ITA é fonte oficial da conversa — não planilha paralela sem dono."
      ],
      pratica: [
        "Na véspera do CD, salve os recortes de eficiência.",
        "Na Matinal, confira se a liderança lê o mesmo número.",
        "Na rua, valide se a visita 'realizada' foi visita completa."
      ],
      papel: [
        "Padronizar a fonte: Painel ITA.",
        "Ensinar o caminho ao SV, não só chegar com o número pronto."
      ],
      checklist: [
        "Caminho no Painel ITA conhecido",
        "Recorte certo (CD/SV/VDD)",
        "Diário e acumulado lado a lado"
      ],
      mensagem: "Número certo, recorte certo, conversa certa.",
      quiz: {
        pergunta: "Ao ver eficiência baixa no CD, o próximo passo no Painel ITA é:",
        opcoes: [
          "Treinar todo o CD imediatamente",
          "Descer o recorte para SV e vendedor e cruzar com o campo",
          "Ignorar o acumulado e olhar só o ano"
        ],
        correta: 1,
        acerto: "Certo. Funil de recorte + campo.",
        erro: "Não generalize o CD. Desça no Painel ITA até o dono do desvio."
      }
    },
    {
      id: "m5-a04",
      titulo: "IPC",
      objetivo: "Atualizar o conceito de IPC, sua evolução no mês, a importância de variedade/mix e onde acompanhar no Painel ITA.",
      lead: "IPC acompanha a profundidade da compra: variedade e mix no cliente. Não basta visitar. Não basta um item. O IPC mostra se a visita está construindo sortimento ou só repetindo o pedido fácil.",
      visuais: [
        { titulo: "Conceito", texto: "Mix/variedade por cliente — profundidade da positivação." },
        { titulo: "Mês", texto: "Evolui ao longo do período; deixar para o fim quebra a curva." },
        { titulo: "Painel ITA", texto: "Acompanhar no recorte de CD, SV e carteira." }
      ],
      entenda: [
        "IPC ruim com eficiência alta é visita rasa: passou, mas não construiu mix.",
        "Variedade não é 'empurrar tudo': é completar o sortimento que o PDV precisa e a Jornada prioriza.",
        "A evolução durante o mês precisa de ritmo semanal, não de virada milagrosa."
      ],
      pratica: [
        "Cruze IPC com leitura de loja: ruptura e geladeira explicam mix perdido.",
        "Na RPS, trate IPC como qualidade de visita, não como detalhe.",
        "No Painel ITA, olhe a curva do mês, não só o snapshot de ontem."
      ],
      papel: [
        "Ensinar mix na rua, com catálogo depois da leitura.",
        "Não aceitar eficiência como sucesso se o IPC desaba."
      ],
      checklist: [
        "Conceito atualizado de IPC",
        "Importância de variedade/mix",
        "Caminho de acompanhamento no Painel ITA"
      ],
      mensagem: "IPC é a profundidade da visita. Eficiência sem mix é corrida vazia.",
      quiz: {
        pergunta: "IPC baixo com eficiência alta sugere:",
        opcoes: [
          "Que o time está perfeito",
          "Visitas acontecendo com pouco mix/variedade",
          "Que o Painel ITA está desligado"
        ],
        correta: 1,
        acerto: "Isso. Passou no cliente, mas não construiu sortimento.",
        erro: "Alta eficiência e IPC baixo = visita rasa. Vá ao mix e à loja."
      }
    },
    {
      id: "m5-a05",
      titulo: "Cobertura GP",
      objetivo: "Dominar base de clientes, meta de cobertura, evolução acumulada e meta mínima recomendada.",
      lead: "Cobertura GP mede quantos clientes da base positivaram GP no período. É jogo de carteira. Quem concentra volume em poucos PDVs pode 'fazer caixa' e ainda assim perder cobertura.",
      formula: {
        titulo: "Cálculo",
        texto: "Cobertura GP (%) = (Clientes da base que compraram GP ÷ Base de clientes) × 100",
        nota: "Acompanhe a evolução acumulada no mês contra a meta e contra a curva mínima recomendada."
      },
      visuais: [
        { titulo: "Base", texto: "Universe de clientes que deveriam ser cobertos." },
        { titulo: "Meta", texto: "Percentual combinado para o CD/equipe no período." },
        { titulo: "Acumulado", texto: "Quanto da base já positivou até hoje." },
        { titulo: "Mínima recomendada", texto: "Ritmo mínimo para não deixar a cobertura para a última semana." }
      ],
      faixas: [
        { tone: "ok", texto: "Na meta ou acima · ritmo saudável" },
        { tone: "warn", texto: "Abaixo da meta, acima da mínima · recuperar no ciclo" },
        { tone: "bad", texto: "Abaixo da mínima recomendada · ação imediata na carteira" }
      ],
      entenda: [
        "Cobertura é gente da base, não só hectolitro.",
        "A curva mínima existe para o CD não 'empurrar' cobertura no apagar das luzes.",
        "Sniper GP e rota completa são alavancas clássicas deste indicador."
      ],
      pratica: [
        "Separe clientes sem compra GP e cruze com visitas realizadas.",
        "Veja se a meta está clara para o SV, não só no painel.",
        "Traga a curva acumulada para a RPS."
      ],
      papel: [
        "Tratar cobertura como disciplina de carteira.",
        "Desenvolver rota e argumentação de mix GP, não só volume."
      ],
      checklist: [
        "Base conhecida",
        "Meta e acumulado lidos",
        "Mínima recomendada usada como alerta de ritmo"
      ],
      mensagem: "Cobertura GP é carteira viva. Volume em poucos clientes não substitui base.",
      quiz: {
        pergunta: "Base 400 e 280 clientes com compra GP. Cobertura =",
        opcoes: ["70%", "280%", "40%"],
        correta: 0,
        acerto: "280 ÷ 400 × 100 = 70%. Agora compare com a meta e a mínima recomendada.",
        erro: "280/400 = 0,70 = 70% de cobertura."
      }
    },
    {
      id: "m5-a06",
      titulo: "Onde acompanhar a Cobertura GP",
      objetivo: "Localizar a Cobertura GP no Painel ITA e usar o recorte certo.",
      lead: "Cobertura vista só no total do CD esconde equipe. O ATV precisa do caminho no Painel ITA e do hábito de descer até a carteira sem compra.",
      visuais: [
        { titulo: "Painel ITA", texto: "Indicador de Cobertura GP no recorte de período." },
        { titulo: "Funil", texto: "CD → SV → clientes sem positivação." },
        { titulo: "Ação", texto: "Lista de clientes vira rota, não vira arquivo." }
      ],
      passos: [
        "Abrir Painel ITA no CD",
        "Localizar Cobertura GP (meta, real, acumulado)",
        "Comparar com a curva/mínima recomendada do período",
        "Listar clientes da base sem compra GP",
        "Levar a lista para RPS e para a rota da semana"
      ],
      entenda: [
        "Indicador sem lista não vira visita.",
        "O analista cruza cobertura com Sniper GP e com o De Olho na Rota.",
        "Fonte oficial é o Painel ITA."
      ],
      pratica: [
        "Na preparação da RPS, leve top clientes sem GP.",
        "No campo, valide se 'sem compra' é ruptura, falta de visita ou visita rasa.",
        "Ensine o SV a abrir o mesmo caminho."
      ],
      papel: [
        "Transformar cobertura em carteira nomeada.",
        "Não discutir percentual órfão de lista."
      ],
      checklist: [
        "Caminho no Painel ITA",
        "Lista de clientes sem GP",
        "Uso na RPS e na rota"
      ],
      mensagem: "Cobertura se acompanha no ITA e se resolve na carteira.",
      quiz: {
        pergunta: "O acompanhamento correto da Cobertura GP inclui:",
        opcoes: [
          "Só o percentual do CD no corredor",
          "Painel ITA + lista de clientes sem compra + ação na rota",
          "Esperar o fechamento anual"
        ],
        correta: 1,
        acerto: "Certo. Número, lista e rua.",
        erro: "Percentual sem lista não desenvolve carteira."
      }
    },
    {
      id: "m5-a07",
      titulo: "Entendendo HL",
      objetivo: "Converter litros em hectolitros e praticar com exemplos da operação.",
      lead: "HL (hectolitro) é a unidade de volume da operação. 1 HL = 100 litros. O ATV precisa converter rápido para conversar meta e real sem se perder em mililitro.",
      formula: {
        titulo: "Conversão",
        texto: "HL = Litros ÷ 100    ·    Litros = HL × 100",
        nota: "Litros do SKU = volume da unidade × quantidade de unidades."
      },
      visuais: [
        { titulo: "Exemplo 1", texto: "Fardo 600 ml × 24 un = 14,4 L = 0,144 HL." },
        { titulo: "Exemplo 2", texto: "10 fardos de 1 L × 6 un = 60 L = 0,60 HL." },
        { titulo: "Exemplo 3", texto: "Meta 12 HL = 1.200 litros no período." }
      ],
      entenda: [
        "Conversar em HL alinha com o painel e com a meta do CD.",
        "Erro de conversão gera falso desvio ou falso cumprimento.",
        "O analista usa HL para volume; cobertura e IPC contam outra história."
      ],
      pratica: [
        "Treine conversões rápidas com o SV no carro, entre visitas.",
        "Quando o time falar em fardos, traduza para HL na RPS.",
        "Não misture HL com eficiência de visita: são jogos diferentes."
      ],
      papel: [
        "Dar fluência numérica ao time.",
        "Usar HL com precisão, sem pedantismo."
      ],
      checklist: [
        "1 HL = 100 L",
        "Exemplos de fardo convertidos",
        "Meta em HL traduzida para litros"
      ],
      mensagem: "HL é volume. Converta certo para gerir certo.",
      quiz: {
        pergunta: "Um fardo de 600 ml com 24 unidades equivale a:",
        opcoes: ["0,144 HL", "14,4 HL", "1,44 HL"],
        correta: 0,
        acerto: "24 × 0,6 L = 14,4 L ÷ 100 = 0,144 HL.",
        erro: "24 × 600 ml = 14.400 ml = 14,4 L = 0,144 HL."
      }
    },
    {
      id: "m5-a08",
      titulo: "Giro de equipamentos e vasilhames",
      objetivo: "Entender giro como saúde de ativo e de retornável na operação.",
      lead: "Equipamento parado não gera giro. Vasilhame parado trava volume retornável. O ATV precisa olhar ocupação, funcionamento e ciclo de vasilhame com o mesmo respeito que olha o pedido.",
      visuais: [
        { titulo: "Equipamento", texto: "Geladeira/ativo no PDV: ligado, posicionado, com mix." },
        { titulo: "Vasilhame", texto: "Ciclo de retorno para não faltar casco/caixa na próxima venda." }
      ],
      entenda: [
        "Ativo vazio ou desligado é investimento sem resultado.",
        "Vasilhame é combustível do retornável: sem giro, a venda para.",
        "Campo mostra o que o painel de volume não explica sozinho."
      ],
      pratica: [
        "Na leitura de loja, inclua equipamento e casco.",
        "Leve desvio de ativo para o GG e para o rito operacional.",
        "Conecte falta de vasilhame com queda de HL retornável."
      ],
      papel: [
        "Incluir giro de ativo e vasilhame no diagnóstico de campo.",
        "Não tratar isso como 'problema de outro departamento' se trava a visita."
      ],
      checklist: [
        "Equipamento observado na visita",
        "Vasilhame no diagnóstico de volume",
        "Desvio encaminhado com dono"
      ],
      mensagem: "Ativo e vasilhame também vendem — ou travam a venda.",
      quiz: {
        pergunta: "Por que o ATV olha giro de equipamento e vasilhame?",
        opcoes: [
          "Porque substitui a cobertura GP",
          "Porque ativo parado e casco travado derrubam execução e volume",
          "Porque é o único KPI da Matinal"
        ],
        correta: 1,
        acerto: "Certo. Ativo e retornável sustentam o volume.",
        erro: "Sem giro de equipamento e vasilhame, a operação sangra volume."
      }
    },
    {
      id: "m5-a09",
      titulo: "Atividade: desafios de cálculo",
      objetivo: "Praticar Eficiência de Visita, Cobertura GP e HL com a mesma regra da operação.",
      lead: "Resolva os três desafios. Use vírgula ou ponto. Em percentual, informe o número (ex.: 88,9). Em HL, use três casas quando necessário (ex.: 0,144).",
      visuais: [
        { titulo: "EV", texto: "(realizadas ÷ planejadas) × 100" },
        { titulo: "Cobertura", texto: "(clientes com GP ÷ base) × 100" },
        { titulo: "HL", texto: "litros ÷ 100" }
      ],
      entenda: [
        "A conta é simples. O valor está em ler a faixa e decidir a ação.",
        "Depois de acertar, explique o número em linguagem de rota."
      ],
      pratica: [
        "Faça a conta sem calculadora se puder: vira músculo na Matinal.",
        "Leia a explicação após conferir."
      ],
      papel: [
        "Chegar na rua com fluência de cálculo.",
        "Ensinar o SV a fazer a mesma conta."
      ],
      checklist: [
        "EV calculada",
        "Cobertura calculada",
        "HL calculado"
      ],
      mensagem: "Dado vira ação quando o analista sabe calcular e interpretar.",
      calculos: [
        {
          titulo: "Eficiência de Visita",
          enunciado: "22 visitas planejadas e 19 realizadas. Qual a eficiência (%)?",
          placeholder: "Ex.: 86,4",
          resposta: 86.36,
          tolerancia: 0.15,
          acerto: "19 ÷ 22 × 100 = 86,36%. Faixa de desvio (80 a 89,9%). Causa provável: furo de rota ou visita não registrada. Vá ao De Olho na Rota e ao campo.",
          erro: "Calcule 19/22 × 100. O resultado é aproximadamente 86,4%."
        },
        {
          titulo: "Cobertura GP",
          enunciado: "Base de 250 clientes e 190 com compra GP. Qual a cobertura (%)?",
          placeholder: "Ex.: 76",
          resposta: 76,
          tolerancia: 0.2,
          acerto: "190 ÷ 250 × 100 = 76%. Compare com a meta do CD e com a mínima recomendada. Liste os 60 sem compra e vire rota.",
          erro: "Calcule 190/250 × 100 = 76%."
        },
        {
          titulo: "HL",
          enunciado: "Quantos HL há em 8 fardos de 600 ml com 24 unidades cada?",
          placeholder: "Ex.: 1,152",
          resposta: 1.152,
          tolerancia: 0.01,
          acerto: "Cada fardo = 24 × 0,6 L = 14,4 L = 0,144 HL. Oito fardos = 1,152 HL.",
          erro: "8 × 24 × 0,6 L = 115,2 L ÷ 100 = 1,152 HL."
        }
      ]
    }
  ]
};
