export const M2 = {
  id: "m2",
  numero: 2,
  titulo: "Entendendo o dia comercial",
  objetivo: "Mostrar como funciona a rotina comercial dentro do CD, desde a preparação até o fechamento do dia.",
  aulas: [
    {
      id: "m2-a01",
      titulo: "Como funciona o dia comercial",
      objetivo: "Enxergar o dia comercial como uma sequência, não como eventos soltos.",
      lead: "O dia comercial no CD tem começo, meio e fim. Quem não enxerga a sequência trata Matinal, rota e Vespertina como reuniões isoladas. O ATV precisa ver o filme inteiro.",
      visuais: [
        { titulo: "Matinal", texto: "Abre o dia, alinha foco, meta e mesa." },
        { titulo: "Rota", texto: "Executa o combinado no ponto de venda." },
        { titulo: "Acompanhamento", texto: "ATV e liderança olham desvio em movimento." },
        { titulo: "Vespertina", texto: "Fecha o dia, ajusta rota e prepara o amanhã." },
        { titulo: "Análise", texto: "Lê o resultado do dia com dado e evidência." },
        { titulo: "Plano de ação", texto: "Transforma o que foi visto em dono, prazo e próxima atitude." }
      ],
      passos: [
        "Matinal: preparação e alinhamento",
        "Rota: execução da visita",
        "Acompanhamento: olhar do ATV e da liderança durante o dia",
        "Vespertina: fechamento da operação",
        "Análise: leitura do resultado",
        "Plano de ação: correção para o próximo ciclo"
      ],
      passosTitulo: "Sequência do dia",
      entenda: [
        "Cada etapa alimenta a seguinte. Matinal ruim vira rota sem foco.",
        "Fechar o dia é tão importante quanto abrir.",
        "O analista acompanha o ciclo, não só um recorte."
      ],
      pratica: [
        "Na primeira visita ao CD, acompanhe o dia completo pelo menos uma vez.",
        "Anote o que quebra entre uma etapa e outra.",
        "Use essa sequência para localizar o gap antes de sugerir treino."
      ],
      papel: [
        "Conhecer o dia comercial de ponta a ponta.",
        "Ajudar o CD a manter ritmo: abrir, executar, fechar, corrigir."
      ],
      checklist: [
        "Sequência do dia memorizada",
        "Sei onde o ATV entra em cada etapa",
        "Não trato ritual como evento isolado"
      ],
      mensagem: "O dia comercial é um ciclo. Quebre uma etapa e o resultado quebra junto.",
      quiz: {
        pergunta: "Qual é a sequência correta do dia comercial?",
        opcoes: [
          "Rota → Treinamento → Matinal → Folga",
          "Matinal → Rota → Acompanhamento → Vespertina → Análise → Plano de ação",
          "Painel → Cobrança → Pedido → Encerramento"
        ],
        correta: 1,
        acerto: "Perfeito. Guarde essa ordem: ela volta na atividade do módulo.",
        erro: "Revise o ciclo: o dia começa na Matinal e fecha com análise e plano."
      }
    },
    {
      id: "m2-a02",
      titulo: "Matinal: onde o dia comercial começa",
      objetivo: "Entender a Matinal como o ponto de partida da execução, não como reunião de recados.",
      lead: "A Matinal é o momento em que o time sai do 'ontem' e entra no 'hoje'. É ali que o foco do dia nasce. Se a Matinal for fraca, a rota herda a fraqueza.",
      visuais: [
        { titulo: "Começo", texto: "O dia comercial começa na Matinal, não na primeira visita." },
        { titulo: "Foco", texto: "Tema do dia, KPIs e alinhamento da mesa." },
        { titulo: "Saída", texto: "Time na rua com clareza do que precisa acontecer." }
      ],
      entenda: [
        "Matinal não é café com recado. É gestão do dia.",
        "Existem formatos diferentes (presencial, online, MGR), mas a função é a mesma: alinhar execução.",
        "O ATV observa o rito e a qualidade, não só a presença."
      ],
      pratica: [
        "Chegue antes do início para ver preparação da mesa e do material.",
        "Note se o time sai sabendo o tema, a meta e o 'como'.",
        "Compare o que foi dito na Matinal com o que acontece na primeira visita."
      ],
      papel: [
        "Proteger a qualidade da abertura do dia.",
        "Apoiar o GG/SV a transformar Matinal em direção, não em discurso."
      ],
      checklist: [
        "Sei que o dia começa na Matinal",
        "Olho preparação, condução e saída para a rua",
        "Conecto Matinal com a rota do mesmo dia"
      ],
      mensagem: "Quem perde a Matinal perde o começo do jogo.",
      quiz: {
        pergunta: "Por que a Matinal é o começo do dia comercial?",
        opcoes: [
          "Porque é o único horário em que o ATV pode treinar",
          "Porque é nela que o time alinha foco, meta e execução do dia",
          "Porque substitui a Vespertina e a RPS"
        ],
        correta: 1,
        acerto: "Certo. Matinal abre o jogo do dia.",
        erro: "A Matinal existe para alinhar a execução do dia, não para cumprir horário."
      }
    },
    {
      id: "m2-a03",
      titulo: "Matinal presencial",
      objetivo: "Dominar a estrutura da Matinal presencial: duração, planejamento, mesa, tema, fechamento e KPIs foco.",
      lead: "A Matinal presencial é o rito nobre da abertura. Tem estrutura, tempo e padrão. O ATV precisa reconhecer cada bloco para saber se o CD está no jogo ou só 'fazendo reunião'.",
      visuais: [
        { titulo: "Estrutura", texto: "Abertura, indicadores, tema, alinhamento da mesa e fechamento." },
        { titulo: "Duração", texto: "Objetiva: tempo suficiente para foco, sem virar palestra." },
        { titulo: "Planejamento", texto: "Quem conduz já chega com dado, tema e recado da área." },
        { titulo: "Mesa", texto: "Alinhamento visual: prioridades, rupturas, oportunidades e combinados." },
        { titulo: "Tema do dia", texto: "Uma mensagem executável, não uma lista infinita." },
        { titulo: "Fechamento", texto: "Time sai sabendo o que fazer na primeira visita." },
        { titulo: "6 KPIs foco", texto: "Eficiência, IPC, cobertura, volume/HL, execução e ocorrências da Jornada." }
      ],
      passos: [
        "Planejar: dado do dia anterior, tema e materiais da mesa",
        "Abrir no horário com energia e padrão",
        "Ler os seis KPIs foco com desvio e dono",
        "Alinhar a mesa: o que precisa ser visto na rua",
        "Fixar o tema do dia em comportamento observável",
        "Fechar com combinado claro para a rota"
      ],
      entenda: [
        "Sem planejamento, a Matinal vira improviso.",
        "Mesa desalinhada gera recado que não chega no PDV.",
        "KPI sem interpretação é número lido em voz alta."
      ],
      pratica: [
        "Observe se os seis KPIs são lidos com meta, real e gap.",
        "Veja se o tema do dia aparece depois na visita.",
        "Cronometre: objetividade é parte do padrão."
      ],
      papel: [
        "Apoiar a preparação da Matinal com o olhar da Jornada.",
        "Dar feedback ao condutor sobre estrutura, tempo e clareza — em particular, nunca expondo o time."
      ],
      checklist: [
        "Estrutura da Matinal presencial conhecida",
        "Papel da mesa e do tema do dia claros",
        "Seis KPIs foco reconhecidos na condução"
      ],
      mensagem: "Matinal presencial de qualidade cabe no relógio e muda a rota.",
      quiz: {
        pergunta: "O que não pode faltar na Matinal presencial?",
        opcoes: [
          "Somente recados administrativos do CD",
          "Estrutura, tempo, mesa, tema, fechamento e leitura dos KPIs foco",
          "Treinamento longo de catálogo no lugar do alinhamento"
        ],
        correta: 1,
        acerto: "Isso. Esses blocos definem o padrão da Matinal presencial.",
        erro: "A Matinal presencial tem estrutura completa: não é recado nem aula longa."
      }
    },
    {
      id: "m2-a04",
      titulo: "O olhar do ATV durante a Matinal Presencial",
      objetivo: "Treinar o que o analista deve observar enquanto a Matinal acontece.",
      lead: "O ATV não está na Matinal para 'assistir'. Está para ler qualidade de gestão. O olhar é técnico: preparação, condução, participação, dado e clareza de saída.",
      visuais: [
        { titulo: "Antes", texto: "Material, dado, mesa e pontualidade." },
        { titulo: "Durante", texto: "Quem fala, quem participa, se o KPI vira ação." },
        { titulo: "Depois", texto: "O time sai com foco? O tema sobrevive na rua?" }
      ],
      entenda: [
        "Participação do SV e do VDD mostra se a Matinal é do time ou do palco.",
        "Tema genérico ('vamos vender mais') não é tema.",
        "O analista anota evidências, não impressões vagas."
      ],
      pratica: [
        "Use um bloco curto de observação: pontualidade, dado, tema, mesa, fechamento.",
        "Converse com o GG após a Matinal, nunca durante a condução.",
        "Leve uma evidência da Matinal para cruzar com a primeira visita."
      ],
      papel: [
        "Ser observador qualificado, não plateia.",
        "Devolver feedback construtivo para elevar o rito."
      ],
      checklist: [
        "Roteiro de observação da Matinal",
        "Feedback combinado com a liderança",
        "Ligação Matinal → rota verificada"
      ],
      mensagem: "Na Matinal, o ATV lê a gestão do dia — não a oratória.",
      quiz: {
        pergunta: "Qual é o olhar correto do ATV na Matinal presencial?",
        opcoes: [
          "Corrigir o GG no meio da reunião para mostrar domínio",
          "Observar padrão, dado, participação e clareza de saída, com feedback depois",
          "Aproveitar o horário para responder e-mails da área"
        ],
        correta: 1,
        acerto: "Certo. Observar com método e devolver depois.",
        erro: "O analista não expõe a liderança no rito. Observa e desenvolve depois."
      }
    },
    {
      id: "m2-a05",
      titulo: "Matinal Online",
      objetivo: "Conhecer horários, participantes, regras e o primeiro atendimento da Matinal Online.",
      lead: "A Matinal Online existe para quem não está no mesmo espaço físico, mas precisa do mesmo alinhamento. Sem regra, ela vira chamada solta. Com padrão, ela abre o dia com a mesma força da presencial.",
      visuais: [
        { titulo: "Horários", texto: "Começa no horário combinado da operação. Atraso quebra o dia de quem já está na rua." },
        { titulo: "Participantes", texto: "Liderança e time da operação que precisam do alinhamento do dia." },
        { titulo: "Regras", texto: "Câmera, pontualidade, fala objetiva, dado na tela, sem paralelismo." },
        { titulo: "1º atendimento", texto: "O primeiro cliente do dia já deve nascer do alinhamento da Matinal." }
      ],
      entenda: [
        "Online não é versão 'menor' da presencial: é o mesmo rito em outro canal.",
        "Quem entra mudo e sai sem recado não participou.",
        "O primeiro atendimento testa se a Matinal funcionou."
      ],
      pratica: [
        "Confira se o dado está compartilhado na tela, não só 'falado'.",
        "Observe se há regra de participação e se ela é cobrada.",
        "Pergunte no campo: o primeiro cliente recebeu o tema do dia?"
      ],
      papel: [
        "Ajudar o CD a manter padrão também no formato online.",
        "Não aceitar Matinal Online como desculpa para ritual fraco."
      ],
      checklist: [
        "Horário e participantes claros",
        "Regras de condução conhecidas",
        "Primeiro atendimento ligado ao alinhamento"
      ],
      mensagem: "Online também é Matinal. Padrão não viaja de formato.",
      quiz: {
        pergunta: "O que diferencia uma Matinal Online de qualidade?",
        opcoes: [
          "Flexibilizar horário e deixar o dado para depois",
          "Horário, participantes, regras e ligação com o primeiro atendimento",
          "Transformar a chamada em treino longo de produto"
        ],
        correta: 1,
        acerto: "Isso. O padrão vai junto, mesmo à distância.",
        erro: "Sem horário, regra e primeiro atendimento, a Matinal Online não abre o dia."
      }
    },
    {
      id: "m2-a06",
      titulo: "Matinal Geral de Resultados — MGR",
      objetivo: "Entender a MGR como rito de leitura de resultado, não como Matinal do dia operacional.",
      lead: "A Matinal Geral de Resultados (MGR) amplia a lente: sai do dia e entra no resultado consolidado. É o momento de ver tendência, desvio estrutural e o que precisa de plano, não só de recado da manhã.",
      visuais: [
        { titulo: "Dia", texto: "Matinal operacional: execução de hoje." },
        { titulo: "Resultado", texto: "MGR: leitura consolidada e direcionamento." },
        { titulo: "ATV", texto: "Leva evidência de campo para explicar o número da MGR." }
      ],
      entenda: [
        "MGR não substitui a Matinal do dia.",
        "É espaço para qualidade de análise e dono de desvio.",
        "Resultado sem evidência vira debate de opinião."
      ],
      pratica: [
        "Prepare 2 ou 3 evidências de campo que expliquem os principais gaps.",
        "Ajude a liderança a sair da MGR com foco, não com 20 temas.",
        "Conecte o que saiu da MGR com a RPS e com a rua da semana."
      ],
      papel: [
        "Qualificar a leitura de resultado com operação real.",
        "Impedir que a MGR vire teatro de números."
      ],
      checklist: [
        "Diferença Matinal do dia × MGR clara",
        "Evidência preparada para o resultado",
        "Foco de saída combinado"
      ],
      mensagem: "MGR é resultado com dono. Não é Matinal alongada.",
      quiz: {
        pergunta: "Qual é o papel da MGR?",
        opcoes: [
          "Substituir a rota do dia",
          "Ler resultado consolidado e direcionar desvios com evidência",
          "Ser o único momento em que se fala de KPI"
        ],
        correta: 1,
        acerto: "Certo. MGR olha resultado e direciona.",
        erro: "A MGR não substitui a operação do dia: ela lê o resultado e aponta o foco."
      }
    },
    {
      id: "m2-a07",
      titulo: "Rituais para fechamento do mês",
      objetivo: "Reconhecer os ritos que fecham o ciclo mensal e preparam o próximo.",
      lead: "O mês não fecha no último dia do calendário se os rituais de fechamento não aconteceram. Há um padrão para consolidar resultado, aprender com o desvio e entrar no mês seguinte com foco.",
      visuais: [
        { titulo: "Consolidar", texto: "O que foi meta, real e gap no mês." },
        { titulo: "Aprender", texto: "O que a rua ensinou sobre o número." },
        { titulo: "Recomeçar", texto: "Prioridades, donos e rotina do mês que entra." }
      ],
      entenda: [
        "Fechamento sem aprendizagem repete o mesmo desvio.",
        "O ATV ajuda a transformar o mês em memória útil, não em arquivo morto.",
        "Rituais de fechamento conversam com RPS, Jornal da Jornada e campo."
      ],
      pratica: [
        "Antecipe os ritos de fim de mês na sua agenda de CD.",
        "Leve comparativos: o que evoluiu de fato na execução.",
        "Garanta que o mês novo não comece só com meta nova e sem plano."
      ],
      papel: [
        "Dar método ao fechamento: dado + evidência + próximo foco.",
        "Evitar a correria de última hora sem leitura de qualidade."
      ],
      checklist: [
        "Rituais de fechamento conhecidos",
        "Aprendizado do mês registrado",
        "Entrada do mês seguinte com prioridade"
      ],
      mensagem: "Mês que não fecha com aprendizagem reabre o mesmo buraco.",
      quiz: {
        pergunta: "O fechamento do mês deve gerar principalmente:",
        opcoes: [
          "Um arquivo de números sem dono",
          "Aprendizado da execução e foco claro para o ciclo seguinte",
          "A suspensão da rota até o mês novo"
        ],
        correta: 1,
        acerto: "Isso. Fechar é aprender e redirecionar.",
        erro: "Fechamento não é arquivo: é aprendizagem e próximo foco."
      }
    },
    {
      id: "m2-a08",
      titulo: "Fechando o dia do time comercial",
      objetivo: "Entender por que o dia precisa ser fechado com o time, não apenas encerrado no relógio.",
      lead: "Fechar o dia é reconferir o combinado da Matinal. O que foi planejado aconteceu? O que travou? O que vai diferente amanhã? Sem fechamento, o time só 'para de vender'.",
      visuais: [
        { titulo: "Combinado", texto: "O que a Matinal pediu." },
        { titulo: "Realizado", texto: "O que a rota entregou." },
        { titulo: "Ajuste", texto: "O que a Vespertina corrige para amanhã." }
      ],
      entenda: [
        "Fechamento é gestão, não desabafo.",
        "Número do dia sem conversa perde causa raiz.",
        "O ATV observa se o fechamento gera plano ou só cansaço."
      ],
      pratica: [
        "Participe de um fechamento completo.",
        "Veja se eficiência, visitas e pendências entram na conversa.",
        "Note se o SV sai com ajuste de rota para o dia seguinte."
      ],
      papel: [
        "Fortalecer o hábito de fechar o dia com qualidade.",
        "Conectar o fechamento à Vespertina e à análise."
      ],
      checklist: [
        "Diferença entre parar o dia e fechar o dia",
        "Combinado versus realizado revisado",
        "Ajuste para amanhã visível"
      ],
      mensagem: "Dia sem fechamento é dia pela metade.",
      quiz: {
        pergunta: "Fechar o dia do time comercial significa:",
        opcoes: [
          "Desligar o sistema no horário",
          "Confrontar combinado × realizado e ajustar o próximo dia",
          "Repetir a Matinal inteira no fim da tarde"
        ],
        correta: 1,
        acerto: "Certo. Fechar é gerir o que aconteceu e o que vem.",
        erro: "Fechamento não é encerrar o expediente: é fechar o ciclo de gestão do dia."
      }
    },
    {
      id: "m2-a09",
      titulo: "Vespertina",
      objetivo: "Dominar objetivo, planejamento, visita, negociação, execução, fechamento e checklist da Vespertina.",
      lead: "A Vespertina é o rito de fechamento da operação do dia. Ela organiza o que foi a rua, o que ficou pendente e o que precisa ser preparado para o amanhã. Tem checklist próprio — e o ATV precisa conhecê-lo de cor.",
      visuais: [
        { titulo: "Objetivo", texto: "Fechar o dia com leitura de execução e próximo passo." },
        { titulo: "Planejamento", texto: "Olhar o que foi a rota versus o que ainda precisa acontecer." },
        { titulo: "Visita", texto: "Qualidade do que foi feito no PDV, não só quantidade." },
        { titulo: "Negociação", texto: "Onde o pedido travou e o que foi combinado com o cliente." },
        { titulo: "Execução", texto: "Mercha, preço, ruptura, FIFO e padrão da visita." },
        { titulo: "Fechamento", texto: "Números do dia, pendências e dono." },
        { titulo: "Checklist", texto: "Roteiro mínimo para a Vespertina não virar conversa solta." }
      ],
      passos: [
        "Preparar dado e evidências do dia",
        "Revisar visitas realizadas × planejadas",
        "Tratar qualidade: negociação, execução e fechamento de pedido",
        "Registrar pendências e rupturas críticas",
        "Definir ajuste de rota e foco de amanhã",
        "Conferir o checklist antes de encerrar"
      ],
      entenda: [
        "Vespertina sem checklist vira café da tarde.",
        "É o elo entre a rua de hoje e a Matinal de amanhã.",
        "O analista usa a Vespertina para ver se o SV está gerindo ou apenas recebendo recado."
      ],
      pratica: [
        "Leve um checklist visível: visitas, eficiência, rupturas, pedidos, coaching e plano de amanhã.",
        "Peça exemplos de visita, não só totais.",
        "Garanta que o combinado da Vespertina apareça na Matinal seguinte."
      ],
      papel: [
        "Elevar a Vespertina ao status de rito de gestão.",
        "Ajudar o SV a fechar o dia com método."
      ],
      checklist: [
        "Objetivo da Vespertina claro",
        "Blocos: planejamento, visita, negociação, execução, fechamento",
        "Checklist aplicado no rito"
      ],
      mensagem: "Vespertina boa alimenta a Matinal de amanhã.",
      quiz: {
        pergunta: "A Vespertina deve principalmente:",
        opcoes: [
          "Repetir o treinamento da manhã",
          "Fechar o dia com qualidade de execução, pendências e foco de amanhã",
          "Substituir a visita de campo do ATV"
        ],
        correta: 1,
        acerto: "Isso. Vespertina fecha o dia e prepara o próximo.",
        erro: "A Vespertina é o rito de fechamento da operação, com checklist e próximo foco."
      }
    },
    {
      id: "m2-a10",
      titulo: "Atividade: a ordem do dia comercial",
      objetivo: "Fixar a sequência do dia comercial na ordem correta de execução.",
      lead: "Arraste a sequência mental do analista: o dia não começa na rua e não termina no último pedido. Há ordem. Monte o ciclo corretamente.",
      visuais: [
        { titulo: "Regra", texto: "Cada etapa alimenta a próxima." },
        { titulo: "Erro comum", texto: "Pular análise e plano, ou inverter Matinal e rota." }
      ],
      entenda: [
        "Matinal abre. Rota executa. Acompanhamento observa em movimento.",
        "Vespertina fecha. Análise interpreta. Plano corrige."
      ],
      pratica: [
        "Ordene as etapas até a sequência ficar estável na sua cabeça.",
        "Use essa ordem para diagnosticar em qual etapa o CD está falhando."
      ],
      papel: [
        "Ensinar o ciclo ao time com essa ordem, sem pular etapa."
      ],
      checklist: [
        "Ordem correta montada",
        "Sei explicar por que cada etapa vem naquela posição"
      ],
      mensagem: "Matinal → Rota → Acompanhamento → Vespertina → Análise → Plano de ação.",
      ordem: {
        titulo: "Coloque o dia na ordem",
        enunciado: "Use as setas ↑ ↓ ao lado de cada etapa para reorganizar. Depois confira.",
        itens: ["Análise", "Rota", "Plano de ação", "Matinal", "Vespertina", "Acompanhamento"],
        correta: ["Matinal", "Rota", "Acompanhamento", "Vespertina", "Análise", "Plano de ação"],
        acerto: "Sequência correta. Esse é o filme do dia comercial.",
        erro: "Ainda não está na ordem. Lembre: abre na Matinal, executa na rota, acompanha, fecha na Vespertina, analisa e planeja a ação."
      }
    }
  ]
};
