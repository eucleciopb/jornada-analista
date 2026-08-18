export const M4 = {
  id: "m4",
  numero: 4,
  titulo: "Campo, rota e desenvolvimento",
  objetivo: "Preparar o analista para observar a operação real, diagnosticar falhas e transformar evidências de campo em desenvolvimento.",
  mensagem: "O painel mostra o número. O campo mostra o motivo.",
  aulas: [
    {
      id: "m4-a01",
      titulo: "Rotina Básica de Vendas",
      objetivo: "Reconhecer a Rotina Básica de Vendas como o padrão da visita que o ATV precisa enxergar na rua.",
      lead: "A Rotina Básica de Vendas é o fio da visita: do planejamento ao fechamento. Se o vendedor pula etapa, o resultado aparece depois no painel — mas a falha nasceu na rua.",
      visuais: [
        { titulo: "Padrão", texto: "Sequência mínima de uma visita de qualidade." },
        { titulo: "Diagnóstico", texto: "O ATV vê qual etapa quebrou." },
        { titulo: "Desenvolvimento", texto: "Treino e coaching na etapa certa." }
      ],
      entenda: [
        "Sem Rotina Básica, cada vendedor inventa a visita.",
        "O analista usa a rotina como lente, não como checklist policial.",
        "Campo sem padrão vira opinião."
      ],
      pratica: [
        "Observe uma visita completa sem interromper no começo.",
        "Anote a etapa em que a execução saiu do padrão.",
        "Devolva com fato da visita, não com julgamento de pessoa."
      ],
      papel: [
        "Tornar a Rotina Básica visível para SV e VDD.",
        "Usar o padrão para diagnosticar, não para humilhar."
      ],
      checklist: [
        "Etapas da visita conhecidas",
        "Olhar de observação preparado",
        "Fato registrado por etapa"
      ],
      mensagem: "O painel mostra o número. O campo mostra o motivo.",
      quiz: {
        pergunta: "Para que o ATV usa a Rotina Básica de Vendas?",
        opcoes: [
          "Para substituir o pedido no sistema",
          "Para observar, diagnosticar a etapa quebrada e desenvolver",
          "Para acelerar a visita pulando etapas"
        ],
        correta: 1,
        acerto: "Certo. A rotina é lente de diagnóstico.",
        erro: "A Rotina Básica existe para padronizar e diagnosticar a visita."
      }
    },
    {
      id: "m4-a02",
      titulo: "Planejamento do dia e Minuto de Ouro",
      objetivo: "Entender o planejamento da rota e o Minuto de Ouro como início de visita de qualidade.",
      lead: "Antes da loja, há o planejamento do dia: clientes, foco, ruptura conhecida, oportunidade. Na porta, há o Minuto de Ouro: os primeiros instantes em que o vendedor se posiciona, lê o ambiente e abre a visita com propósito.",
      visuais: [
        { titulo: "Planejamento", texto: "Rota pensada, não sorteada no caminho." },
        { titulo: "Minuto de Ouro", texto: "Abertura com olhar, objetivo e respeito ao PDV." }
      ],
      entenda: [
        "Rota sem planejamento vira quilômetro sem resultado.",
        "Minuto de Ouro perdido vira visita de 'tudo bem, tem pedido?'",
        "O ATV observa se o SV preparou o time antes de sair."
      ],
      pratica: [
        "Peça para ver o planejamento da rota antes de embarcar.",
        "Na primeira loja, cale e observe os primeiros minutos.",
        "Marque se havia objetivo claro para aquele cliente."
      ],
      papel: [
        "Desenvolver planejamento e abertura, não só o fechamento do pedido.",
        "Coachar o SV a preparar o time antes da rua."
      ],
      checklist: [
        "Planejamento do dia conferido",
        "Minuto de Ouro observado",
        "Objetivo da visita identificado"
      ],
      mensagem: "Visita boa nasce antes da porta — e se decide no primeiro minuto.",
      quiz: {
        pergunta: "O Minuto de Ouro é:",
        opcoes: [
          "O intervalo do almoço da equipe",
          "A abertura da visita com propósito, leitura e posicionamento",
          "O momento de lançar o pedido sem olhar a loja"
        ],
        correta: 1,
        acerto: "Isso. A abertura define o tom da visita.",
        erro: "Minuto de Ouro é a abertura da visita, não o atalho do pedido."
      }
    },
    {
      id: "m4-a03",
      titulo: "Apresentação do catálogo",
      objetivo: "Ver a apresentação de catálogo como ferramenta de mix e oportunidade, não como folheio.",
      lead: "Catálogo na mão sem leitura de loja é show. Catálogo depois da leitura é consultoria. O ATV observa se o vendedor apresenta o que o PDV precisa e o que a Jornada prioriza.",
      visuais: [
        { titulo: "Antes", texto: "Ler o PDV, ruptura, geladeira e giro." },
        { titulo: "Durante", texto: "Apresentar mix com argumento e prioridade." },
        { titulo: "Depois", texto: "Converter em item, espaço e pedido." }
      ],
      entenda: [
        "Catálogo não é fim: é ponte para mix e volume.",
        "Apresentar tudo é o mesmo que não apresentar nada.",
        "O analista vê se há conexão com IPC, cobertura e campanha."
      ],
      pratica: [
        "Conte quantos itens foram apresentados com argumento versus 'olha isso'.",
        "Veja se o catálogo entra no momento certo da visita.",
        "Ligue a apresentação a uma ruptura ou oportunidade real da loja."
      ],
      papel: [
        "Treinar apresentação com propósito comercial.",
        "Corrigir o vendedor que usa o catálogo para fugir da leitura."
      ],
      checklist: [
        "Momento certo do catálogo",
        "Prioridade de mix visível",
        "Argumento, não folheio"
      ],
      mensagem: "Catálogo sem leitura de loja é volume de página, não de venda.",
      quiz: {
        pergunta: "Quando a apresentação do catálogo é mais eficaz?",
        opcoes: [
          "Antes de olhar a loja, para ganhar tempo",
          "Depois da leitura do PDV, com prioridade e argumento",
          "Somente no fechamento, se o cliente pedir"
        ],
        correta: 1,
        acerto: "Certo. Leitura primeiro, catálogo com propósito depois.",
        erro: "Sem leitura de loja, o catálogo vira folheio."
      }
    },
    {
      id: "m4-a04",
      titulo: "Leitura de loja, ruptura, estoque, geladeira e FIFO",
      objetivo: "Ensinar o olhar técnico do PDV que o ATV precisa cobrar na rota.",
      lead: "A leitura de loja é o exame da visita. Ruptura, estoque da retaguarda, geladeira, ponto extra e FIFO dizem se o PDV está ganhando ou perdendo giro. O analista que não lê loja não diagnostica execução.",
      visuais: [
        { titulo: "Ruptura", texto: "O que deveria estar e não está." },
        { titulo: "Estoque", texto: "O que está parado ou mal posicionado." },
        { titulo: "Geladeira", texto: "Temperatura, sortimento e ocupação." },
        { titulo: "FIFO", texto: "Primeiro que entra é o primeiro que sai — validade e giro." }
      ],
      entenda: [
        "Ruptura escondida vira cobertura e IPC ruins no painel.",
        "FIFO não é detalhe: é perda evitada e execução de marca.",
        "A leitura precisa ser ensinada ao VDD e cobrada pelo SV."
      ],
      pratica: [
        "Faça a leitura em silêncio e compare com o que o vendedor viu.",
        "Fotografe evidência (quando permitido) para o coaching, não para expor.",
        "Transforme cada achado em uma ação da visita."
      ],
      papel: [
        "Desenvolver o olho de loja do time.",
        "Não passar batido em geladeira, ruptura e validade."
      ],
      checklist: [
        "Ruptura conferida",
        "Estoque e geladeira lidos",
        "FIFO observado e corrigido"
      ],
      mensagem: "Quem não lê a loja não lê a venda.",
      quiz: {
        pergunta: "FIFO na visita serve para:",
        opcoes: [
          "Enfeitar o relatório de campo",
          "Garantir giro correto, validade e execução no PDV",
          "Substituir a negociação de preço"
        ],
        correta: 1,
        acerto: "Isso. FIFO é execução e proteção de giro.",
        erro: "FIFO é padrão de execução no PDV, não detalhe estético."
      }
    },
    {
      id: "m4-a05",
      titulo: "Negociação, objeções e cálculo",
      objetivo: "Observar se o vendedor negocia com número, trata objeção e fecha conta na visita.",
      lead: "Negociação sem cálculo é conversa. Objeção sem método é recuo. O ATV precisa ver se o vendedor usa argumento, conta e alternativa — ou se desiste no primeiro 'depois eu vejo'.",
      visuais: [
        { titulo: "Objeção", texto: "Ouvir, entender, responder com fato." },
        { titulo: "Cálculo", texto: "Volume, espaço, giro e ganho para o PDV." },
        { titulo: "Fecho", texto: "Pedido, espaço ou próximo passo marcado." }
      ],
      entenda: [
        "Cálculo no balcão aumenta credibilidade.",
        "Objeção de preço muitas vezes esconde ruptura, prazo ou falta de argumento.",
        "O analista treina o SV a coachar negociação, não a negociar no lugar do VDD."
      ],
      pratica: [
        "Anote a objeção real versus a objeção dita.",
        "Veja se houve conta (giro, margem, mix) ou só desconto.",
        "Devolva um roteiro curto de tratamento de objeção."
      ],
      papel: [
        "Desenvolver segurança numérica e escuta.",
        "Corrigir o vendedor que foge da objeção."
      ],
      checklist: [
        "Objeção ouvida até o fim",
        "Cálculo apresentado",
        "Próximo passo da negociação claro"
      ],
      mensagem: "Na visita, número bem usado vence achismo.",
      quiz: {
        pergunta: "O que o ATV deve observar na negociação?",
        opcoes: [
          "Se o vendedor evita cálculo para não perder tempo",
          "Se ouve a objeção, calcula e propõe fechamento",
          "Se transfere toda objeção para o gerente do CD"
        ],
        correta: 1,
        acerto: "Certo. Escuta, conta e fecho.",
        erro: "Negociação de qualidade junta objeção, cálculo e fechamento."
      }
    },
    {
      id: "m4-a06",
      titulo: "Merchandising e precificação",
      objetivo: "Incluir execução de ponto de venda no olhar de desenvolvimento.",
      lead: "Pedido sem execução é volume que não se sustenta. Merchandising e preço visível são parte da visita, não 'se der tempo'. O ATV vê share of space, ponta, cartaz e preço como comportamento treinável.",
      visuais: [
        { titulo: "Mercha", texto: "Presença, destaque e padrão da marca." },
        { titulo: "Preço", texto: "Visível, correto e competitivo no PDV." }
      ],
      entenda: [
        "Execução ruim quebra campanha mesmo com pedido feito.",
        "Precificação errada gera ruptura percebida e perda de giro.",
        "Campo ensina mais mercha do que sala."
      ],
      pratica: [
        "Feche a visita só depois de olhar preço e exposição.",
        "Transforme um erro de mercha em miniplano com o SV.",
        "Conecte execução visual com o KPI de cobertura e mix."
      ],
      papel: [
        "Cobrar execução completa da visita.",
        "Desenvolver olho de PDV na liderança."
      ],
      checklist: [
        "Exposição conferida",
        "Preço conferido",
        "Desvio de mercha virando ação"
      ],
      mensagem: "Pedido sem mercha e preço é resultado pela metade.",
      quiz: {
        pergunta: "Merchandising e precificação entram na visita porque:",
        opcoes: [
          "São responsabilidade exclusiva do promotor, nunca do VDD",
          "Sustentam giro, presença e o resultado do pedido",
          "Servem só para foto de relatório"
        ],
        correta: 1,
        acerto: "Isso. Execução no PDV sustenta a venda.",
        erro: "Mercha e preço são parte da execução comercial da visita."
      }
    },
    {
      id: "m4-a07",
      titulo: "Fechamento do pedido e da visita",
      objetivo: "Tratar o fechamento como etapa ativa, não como consequência automática.",
      lead: "Muita visita se perde no fim: o vendedor já leu, já falou, e não fecha. Fechar pedido e fechar visita são dois gestos. Um gera volume. O outro gera combinado, próxima ação e saída profissional.",
      visuais: [
        { titulo: "Pedido", texto: "Itens, volume, condição e confirmação." },
        { titulo: "Visita", texto: "Combinados, pendências e agradecimento com próximo passo." }
      ],
      entenda: [
        "Não fechar é deixar o PDV decidir sozinho depois — em geral, contra você.",
        "Fechamento de visita inclui o que ficou para o SV, o GRC ou a próxima rota.",
        "O ATV observa se o vendedor pede o pedido ou apenas informa o catálogo."
      ],
      pratica: [
        "Marque se houve pedido claro de fechamento.",
        "Veja se as pendências saíram registradas.",
        "Treine frases de fechamento com o SV, na rua."
      ],
      papel: [
        "Desenvolver a coragem e o método de fechar.",
        "Não deixar a visita morrer em conversa."
      ],
      checklist: [
        "Pedido solicitado",
        "Pendências registradas",
        "Visita encerrada com próximo passo"
      ],
      mensagem: "Quem não fecha a visita deixa o resultado em aberto.",
      quiz: {
        pergunta: "Fechar a visita inclui:",
        opcoes: [
          "Sair rápido para bater eficiência",
          "Confirmar pedido, pendências e próximo passo",
          "Somente mandar mensagem depois para o cliente"
        ],
        correta: 1,
        acerto: "Certo. Fechamento é pedido + visita completa.",
        erro: "Fechar não é ir embora: é confirmar pedido e combinados."
      }
    },
    {
      id: "m4-a08",
      titulo: "De tirador de pedido para consultor de vendas",
      objetivo: "Mostrar a mudança de postura que o ATV precisa desenvolver no time.",
      lead: "Tirador de pedido pergunta o que falta e anota. Consultor lê o negócio do PDV, sugere mix, corrige execução e constrói volume sustentável. A Jornada pede consultor. O ATV é quem acelera essa virada.",
      visuais: [
        { titulo: "Tirador", texto: "Reativo, apressado, sem leitura." },
        { titulo: "Consultor", texto: "Diagnostica, sugere, executa e acompanha." }
      ],
      entenda: [
        "A virada não acontece em um treino: acontece em coaching repetido na rota.",
        "Indicadores de mix e cobertura sobem quando a visita deixa de ser 'o de sempre'.",
        "O SV precisa modelar o comportamento, não só cobrar número."
      ],
      pratica: [
        "Descreva comportamentos observáveis de consultor na visita.",
        "Reconheça no campo quem já saiu do modo tirador.",
        "Monte miniplano de 2 hábitos por vendedor, não 20."
      ],
      papel: [
        "Puxar o time para consultoria de verdade.",
        "Ajudar o SV a não premiar só o pedido rápido."
      ],
      checklist: [
        "Diferença tirador × consultor clara",
        "Comportamentos observáveis definidos",
        "Plano de hábito na rota"
      ],
      mensagem: "Consultor lê o PDV. Tirador só anota o pedido.",
      quiz: {
        pergunta: "O que caracteriza o consultor de vendas?",
        opcoes: [
          "Passar rápido em mais clientes para ganhar eficiência falsa",
          "Ler o PDV, sugerir mix, executar e construir o pedido",
          "Deixar o catálogo com o cliente e voltar outro dia"
        ],
        correta: 1,
        acerto: "Isso. Consultoria é diagnóstico + sugestão + execução.",
        erro: "Consultor não é o mais rápido: é o que desenvolve o PDV."
      }
    },
    {
      id: "m4-a09",
      titulo: "Coaching na Rota SV/VDD",
      objetivo: "Entender o coaching do supervisor com o vendedor como principal alavanca de desenvolvimento.",
      lead: "A rota SV/VDD é a sala de aula real. O SV observa o vendedor, devolve feedback e combina o próximo comportamento. O ATV desenvolve o SV para esse coaching acontecer com método.",
      visuais: [
        { titulo: "SV", texto: "Coach do vendedor." },
        { titulo: "VDD", texto: "Executa e pratica o novo comportamento." },
        { titulo: "ATV", texto: "Coach do coach — desenvolve o SV." }
      ],
      entenda: [
        "Se o SV só dirige e não coach, a rota é transporte.",
        "O analista não deve 'tomar' o vendedor na frente do SV.",
        "Melhor um coaching curto e repetido do que um discurso no carro."
      ],
      pratica: [
        "Combine com o SV o objetivo da rota antes de sair.",
        "Deixe o SV conduzir o feedback ao VDD.",
        "Depois, dê feedback ao SV sobre a qualidade do coaching."
      ],
      papel: [
        "Desenvolver o SV como formador do time.",
        "Proteger o protagonismo da liderança direta."
      ],
      checklist: [
        "Objetivo da rota SV/VDD combinado",
        "Coaching do SV observado",
        "Feedback ao SV, não exposição do VDD"
      ],
      mensagem: "Na rota SV/VDD, o analista desenvolve quem desenvolve.",
      quiz: {
        pergunta: "Na rota SV/VDD, o ATV deve principalmente:",
        opcoes: [
          "Substituir o SV no feedback ao vendedor",
          "Desenvolver o SV para coachar o VDD com método",
          "Apenas anotar quilometragem"
        ],
        correta: 1,
        acerto: "Certo. ATV é coach do coach.",
        erro: "O analista não toma o lugar do SV na frente do vendedor."
      }
    },
    {
      id: "m4-a10",
      titulo: "Coaching na Rota GG/SV",
      objetivo: "Entender a rota em que o GG desenvolve o supervisor — e o ATV apoia esse elo.",
      lead: "A rota GG/SV é o desenvolvimento da liderança média. O GG precisa ver o SV gerindo na rua: preparação, coaching, padrão e fechamento. O ATV ajuda o GG a fazer isso com método, não só com presença.",
      visuais: [
        { titulo: "GG", texto: "Coach do SV." },
        { titulo: "SV", texto: "Mostra como conduz o time na operação." },
        { titulo: "ATV", texto: "Qualifica o olhar e o roteiro do GG." }
      ],
      entenda: [
        "CD forte tem GG na rua com propósito.",
        "Rota GG/SV não é turismo de PDV.",
        "O analista prepara pauta: o que o GG precisa observar no SV."
      ],
      pratica: [
        "Sugira 2 comportamentos de SV para o GG observar.",
        "Evite monopolizar a conversa com o vendedor.",
        "Feche a rota com plano do GG para o SV, não só recado."
      ],
      papel: [
        "Fortalecer o elo GG → SV.",
        "Dar método de observação ao GG."
      ],
      checklist: [
        "Pauta da rota GG/SV",
        "Observação do SV, não só do PDV",
        "Plano de desenvolvimento da liderança"
      ],
      mensagem: "GG na rua com método forma SV. SV formado forma time.",
      quiz: {
        pergunta: "O foco da rota GG/SV é:",
        opcoes: [
          "O GG fazer o pedido no lugar do vendedor",
          "O GG desenvolver o SV na gestão da rota",
          "Apenas cumprir a agenda de visitas do ATV"
        ],
        correta: 1,
        acerto: "Isso. É desenvolvimento de liderança.",
        erro: "GG/SV não é rota de volume: é rota de formação do supervisor."
      }
    },
    {
      id: "m4-a11",
      titulo: "Etapas do coaching",
      objetivo: "Fixar as cinco etapas: preparo, observação, feedback, plano de ação e acompanhamento.",
      lead: "Coaching sem etapa vira palpite. O ciclo é sempre o mesmo, na rota SV/VDD ou GG/SV.",
      visuais: [
        { titulo: "1. Preparo", texto: "Objetivo, perfil e dado da pessoa/rota." },
        { titulo: "2. Observação", texto: "Ver a execução real em silêncio útil." },
        { titulo: "3. Feedback", texto: "Fato, impacto e combinado." },
        { titulo: "4. Plano de ação", texto: "Um comportamento, um prazo, um dono." },
        { titulo: "5. Acompanhamento", texto: "Voltar para ver se mudou." }
      ],
      passos: [
        "Preparar objetivo e contexto",
        "Observar a execução",
        "Dar feedback com fato",
        "Combinar plano de ação",
        "Acompanhar na próxima evidência"
      ],
      entenda: [
        "Pular observação gera feedback de opinião.",
        "Plano sem acompanhamento é conversa.",
        "O ATV ensina o ciclo até virar hábito da liderança."
      ],
      pratica: [
        "Use as cinco etapas em voz alta com o SV após a primeira visita.",
        "Registre o plano em algo que sobreviva à rota.",
        "Marque na agenda o acompanhamento."
      ],
      papel: [
        "Padronizar o coaching da operação.",
        "Não aceitar 'já falei com ele' como etapa completa."
      ],
      checklist: [
        "Cinco etapas conhecidas",
        "Feedback com fato",
        "Acompanhamento datado"
      ],
      mensagem: "Coaching é ciclo. Sem acompanhamento, não houve coaching.",
      quiz: {
        pergunta: "Qual a ordem das etapas do coaching?",
        opcoes: [
          "Feedback → Observação → Preparo",
          "Preparo → Observação → Feedback → Plano de ação → Acompanhamento",
          "Plano de ação → Cobrança → Arquivo"
        ],
        correta: 1,
        acerto: "Perfeito. Esse é o ciclo.",
        erro: "Revise: preparo, observação, feedback, plano e acompanhamento."
      }
    },
    {
      id: "m4-a12",
      titulo: "Coaching de vendedores novatos",
      objetivo: "Adaptar o método para quem ainda está formando a Rotina Básica.",
      lead: "Novato não precisa de 15 gaps. Precisa de poucos hábitos, repetição e segurança. O ATV ajuda o SV a não comparar o novato com o melhor vendedor do CD no primeiro ciclo.",
      visuais: [
        { titulo: "Foco", texto: "Poucas etapas da Rotina Básica por vez." },
        { titulo: "Ritmo", texto: "Mais observação e prática, menos discurso." },
        { titulo: "Segurança", texto: "Erro tratado como aprendizagem, não como sentença." }
      ],
      entenda: [
        "Novato sobrecarregado desiste do padrão e vira tirador de pedido.",
        "O primeiro coaching forma o jeito como ele vai ouvir os próximos.",
        "Acompanhar cedo evita vício de execução."
      ],
      pratica: [
        "Escolha 1 ou 2 comportamentos por rota para o novato.",
        "Celebre acerto visível de padrão.",
        "Programe retorno curto, não 'daqui a um mês'."
      ],
      papel: [
        "Proteger a formação do novato.",
        "Ajustar a expectativa do SV para o ciclo de aprendizagem."
      ],
      checklist: [
        "Poucos focos por rota",
        "Retorno curto combinado",
        "SV alinhado com o ritmo do novato"
      ],
      mensagem: "Novato se forma na rua, com pouco foco e muito acompanhamento.",
      quiz: {
        pergunta: "No coaching do novato, o ATV deve:",
        opcoes: [
          "Listar todos os erros da visita de uma vez",
          "Priorizar poucos hábitos da Rotina Básica e voltar rápido",
          "Deixar o novato sozinho para 'pegar o jeito'"
        ],
        correta: 1,
        acerto: "Certo. Pouco foco, muita repetição.",
        erro: "Novato não aguenta lista infinita. Forma-se com foco e retorno."
      }
    },
    {
      id: "m4-a13",
      titulo: "As cinco Rotas VDD — Rota Completa",
      objetivo: "Entender a lógica das cinco rotas do vendedor e o que é uma rota completa.",
      lead: "O desenho de cinco rotas VDD organiza a cobertura da carteira ao longo da semana. Rota completa não é 'passar no cliente': é cumprir o padrão de visita naquele ciclo, com qualidade e registro.",
      visuais: [
        { titulo: "Cobertura", texto: "A carteira é vista no ciclo das rotas." },
        { titulo: "Completa", texto: "Visita com Rotina Básica, não só presença." },
        { titulo: "ATV", texto: "Olha se a rota está sendo respeitada ou 'furada'." }
      ],
      entenda: [
        "Furar rota para 'caçar volume' quebra cobertura e eficiência no acumulado.",
        "Rota completa é padrão de execução, não só check-in.",
        "O analista cruza o desenho da rota com o De Olho na Rota e com o campo."
      ],
      pratica: [
        "Peça o mapa das cinco rotas antes de sair.",
        "Confira se os clientes do dia são os da rota.",
        "Diferencie visita completa de passagem rápida."
      ],
      papel: [
        "Defender a disciplina de rota como base da Jornada.",
        "Desenvolver o SV que autoriza furo crônico."
      ],
      checklist: [
        "Lógica das cinco rotas entendida",
        "Conceito de rota completa claro",
        "Furo de rota tratado como desvio de gestão"
      ],
      mensagem: "Rota completa é cobertura com qualidade, não corrida.",
      quiz: {
        pergunta: "Rota completa significa:",
        opcoes: [
          "Passar no maior número possível de portas",
          "Cumprir o ciclo da carteira com visita de qualidade no padrão",
          "Trocar a rota toda vez que aparecer uma oportunidade"
        ],
        correta: 1,
        acerto: "Isso. Completa = ciclo + qualidade.",
        erro: "Completa não é corrida: é cumprir o padrão na carteira."
      }
    },
    {
      id: "m4-a14",
      titulo: "Nosso papel em campo",
      objetivo: "Fixar os cinco verbos da atuação em campo: observar, diagnosticar, orientar, produzir soluções e acompanhar a evolução.",
      lead: "Em campo, o ATV não é visita institucional. O papel cabe em cinco verbos que precisam aparecer nesta ordem.",
      visuais: [
        { titulo: "Observar", texto: "Ver a operação real." },
        { titulo: "Diagnosticar", texto: "Achar a etapa e a causa." },
        { titulo: "Orientar", texto: "Devolver com clareza e respeito." },
        { titulo: "Produzir soluções", texto: "Plano executável, não recado." },
        { titulo: "Acompanhar", texto: "Voltar para ver evolução." }
      ],
      entenda: [
        "Pular observação gera orientação vazia.",
        "Solução que o CD não consegue executar não é solução.",
        "Sem acompanhamento, o campo vira turismo técnico."
      ],
      pratica: [
        "Revise sua última rota: os cinco verbos aconteceram?",
        "Registre evidência para o acompanhamento.",
        "Combine a data de retorno com o SV."
      ],
      papel: [
        "Cumprir os cinco verbos em toda imersão de campo.",
        "Ensinar esse roteiro à liderança."
      ],
      checklist: [
        "Cinco verbos memorizados",
        "Ordem respeitada",
        "Retorno de evolução combinado"
      ],
      mensagem: "O painel mostra o número. O campo mostra o motivo.",
      quiz: {
        pergunta: "Qual a ordem do papel em campo?",
        opcoes: [
          "Orientar → Observar → Arquivar",
          "Observar → Diagnosticar → Orientar → Produzir soluções → Acompanhar a evolução",
          "Produzir soluções antes de ver a rota"
        ],
        correta: 1,
        acerto: "Perfeito. Esses são os cinco verbos.",
        erro: "Sem observar e diagnosticar, a orientação não pega."
      }
    },
    {
      id: "m4-a15",
      titulo: "Atividade: onde a rota falhou",
      objetivo: "Identificar a etapa da visita em que ocorreu a falha.",
      lead: "Rota observada: o vendedor saiu sem revisar a carteira do dia. Na loja, cumprimentou e foi direto ao pedido. Não olhou geladeira nem ruptura. Quando o cliente falou de preço, recuou. O espaço extra ficou vazio. Saiu sem confirmar o próximo passo.",
      visuais: [
        { titulo: "Cena", texto: "Vários erros, mas a atividade pede a falha principal de origem." }
      ],
      entenda: [
        "A falha de origem costuma estar no começo: planejamento e abordagem.",
        "Sem leitura de PDV, negociação e execução já nascem fracas.",
        "O ATV aponta a etapa, não a pessoa."
      ],
      pratica: [
        "Escolha a etapa em que o desvio começou.",
        "Pense o coaching correspondente."
      ],
      papel: [
        "Diagnosticar etapa para treinar etapa — não 'treinar tudo'."
      ],
      checklist: [
        "Etapa identificada",
        "Coaching correspondente pensado"
      ],
      mensagem: "O painel mostra o número. O campo mostra o motivo.",
      quiz: {
        pergunta: "Nesta rota, em qual etapa a falha começou?",
        opcoes: [
          "Somente no fechamento do pedido",
          "No planejamento e na abordagem / Minuto de Ouro, que impediram a leitura do PDV",
          "Apenas na precificação de gôndola, isoladamente"
        ],
        correta: 1,
        acerto: "Certo. A visita nasceu sem planejamento e sem abertura. O resto desmoronou em cadeia.",
        erro: "Houve erros depois, mas a origem está no planejamento e na abordagem — sem leitura de PDV."
      }
    }
  ]
};
