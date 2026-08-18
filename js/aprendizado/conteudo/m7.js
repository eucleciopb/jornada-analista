export const M7 = {
  id: "m7",
  numero: 7,
  titulo: "Comunicação e rotina do analista",
  objetivo: "Ensinar como organizar a semana, comunicar os resultados e dar visibilidade às prioridades da Jornada Comercial.",
  aulas: [
    {
      id: "m7-a01",
      titulo: "Jornal da Jornada",
      objetivo: "Entender o Jornal da Jornada como veículo oficial de visibilidade da operação.",
      lead: "O Jornal da Jornada é o recorte que a área usa para mostrar o jogo: o que está no foco, o que desviou e o que precisa de olho da liderança. Não é newsletter institucional. É ferramenta de gestão.",
      visuais: [
        { titulo: "Visível", texto: "Prioridades da Jornada no CD." },
        { titulo: "Útil", texto: "GG e SV sabem onde olhar." },
        { titulo: "Vivo", texto: "Conectado ao painel e ao campo da semana." }
      ],
      entenda: [
        "Jornal sem dado vira recado. Jornal sem campo vira planilha.",
        "O ATV é autor e curador: escolhe o que entra.",
        "Frequência e padrão importam mais do que texto longo."
      ],
      pratica: [
        "Leia o último Jornal antes de montar o próximo.",
        "Marque o que realmente pediu ação da liderança.",
        "Corte o que não muda decisão."
      ],
      papel: [
        "Manter o Jornal como instrumento de gestão.",
        "Não transformar em relatório para arquivo."
      ],
      checklist: [
        "Propósito do Jornal claro",
        "Público da liderança em mente",
        "Ligação com a semana real"
      ],
      mensagem: "Jornal da Jornada existe para fazer a liderança olhar o que importa.",
      quiz: {
        pergunta: "O Jornal da Jornada é:",
        opcoes: [
          "Um mural de fotos da equipe",
          "Ferramenta de visibilidade e direcionamento da Jornada",
          "Substituição da visita ao CD"
        ],
        correta: 1,
        acerto: "Certo. Visibilidade com propósito de gestão.",
        erro: "O Jornal não é decoração: é gestão visível."
      }
    },
    {
      id: "m7-a02",
      titulo: "Para que serve o Jornal",
      objetivo: "Fixar as três funções: visibilidade, orientação e pontos de atenção.",
      lead: "O Jornal serve para três movimentos que se repetem toda semana: dar visibilidade, orientar a liderança e direcionar pontos de atenção. Se faltar um, o recado fica manco.",
      visuais: [
        { titulo: "Visibilidade", texto: "O que está acontecendo na Jornada." },
        { titulo: "Orientação", texto: "O que a liderança precisa fazer com isso." },
        { titulo: "Atenção", texto: "Onde está o risco desta semana." }
      ],
      entenda: [
        "Informar sem orientar gera 'fiquei sabendo'.",
        "Orientar sem dado gera 'achismo da área'.",
        "Ponto de atenção demais vira alarme falso."
      ],
      pratica: [
        "Estruture o rascunho em três blocos, sempre.",
        "Um ponto de atenção principal por CD, se possível.",
        "Feche com o 'então faça'."
      ],
      papel: [
        "Garantir as três funções em cada edição.",
        "Escrever para quem vai agir, não para quem vai arquivar."
      ],
      checklist: [
        "Três funções memorizadas",
        "Rascunho em três blocos",
        "Chamada para ação"
      ],
      mensagem: "Jornal bom informa, orienta e aponta — na mesma página.",
      quiz: {
        pergunta: "Quais funções o Jornal precisa cumprir?",
        opcoes: [
          "Somente divulgar aniversariantes",
          "Dar visibilidade, orientar a liderança e direcionar atenção",
          "Substituir o Painel ITA"
        ],
        correta: 1,
        acerto: "Isso. As três funções juntas.",
        erro: "Sem as três funções, o Jornal não cumpre o papel."
      }
    },
    {
      id: "m7-a03",
      titulo: "Dar visibilidade",
      objetivo: "Praticar visibilidade com clareza: o que a liderança precisa ver primeiro.",
      lead: "Dar visibilidade não é copiar o painel. É escolher o recorte que a liderança não pode perder: tendência, desvio concentrado e avanço real.",
      visuais: [
        { titulo: "Escolha", texto: "Poucos números, os que decidem." },
        { titulo: "Contexto", texto: "Meta, real, gap, tendência." },
        { titulo: "Tom", texto: "Fato, sem drama e sem maquiagem." }
      ],
      entenda: [
        "Visibilidade honesta constrói confiança na área.",
        "Esconder desvio queima o analista na semana seguinte.",
        "Celebrar avanço de execução também é visibilidade."
      ],
      pratica: [
        "Abra com 3 bullets de visibilidade, não com 3 páginas.",
        "Use o mesmo recorte do Painel ITA.",
        "Nomeie o CD/equipe, não 'alguns times'."
      ],
      papel: [
        "Ser fonte confiável.",
        "Dar luz ao que o rito precisa tratar."
      ],
      checklist: [
        "Recorte fiel ao ITA",
        "Desvio e avanço visíveis",
        "Texto curto"
      ],
      mensagem: "Visibilidade é recorte honesto, não volume de gráfico.",
      quiz: {
        pergunta: "Visibilidade de qualidade no Jornal é:",
        opcoes: [
          "Colar todos os prints do ITA",
          "Poucos fatos decisivos, com meta, real e tendência",
          "Só os indicadores no verde"
        ],
        correta: 1,
        acerto: "Certo. Recorte honesto e útil.",
        erro: "Visibilidade não é dump nem maquiagem."
      }
    },
    {
      id: "m7-a04",
      titulo: "Orientar a liderança",
      objetivo: "Transformar o que está visível em pedido claro para GG e SV.",
      lead: "Orientar é o 'então faça'. Sem isso, o Jornal informa e o CD segue igual. A orientação precisa ser executável na semana: rito, rota, carteira ou coaching.",
      visuais: [
        { titulo: "Quem", texto: "GG, SV ou ambos." },
        { titulo: "O quê", texto: "Comportamento ou rito a ajustar." },
        { titulo: "Quando", texto: "Nesta semana, neste rito, nesta rota." }
      ],
      entenda: [
        "Orientação genérica ('melhorar eficiência') não é orientação.",
        "O tom é de parceria, não de ordem de cima para baixo.",
        "O ATV alinha a orientação com o que vai acompanhar no campo."
      ],
      pratica: [
        "Escreva a orientação como ação observável.",
        "Ligue ao desvio mostrado no bloco de visibilidade.",
        "Não peça 10 coisas: peça a que move o ponteiro."
      ],
      papel: [
        "Ser claro sem ser autoritário.",
        "Acompanhar se a orientação entrou na RPS e na rua."
      ],
      checklist: [
        "Dono da orientação",
        "Ação observável",
        "Prazo da semana"
      ],
      mensagem: "Jornal que não orienta só informa. Informação sem ação não muda CD.",
      quiz: {
        pergunta: "Uma orientação útil no Jornal é:",
        opcoes: [
          "'Melhorar os números'",
          "'SV Alfa: coaching de visita completa em 2 rotas até sexta, com lista Sniper'",
          "'Ver com carinho o painel'"
        ],
        correta: 1,
        acerto: "Isso. Dono, ação, prazo.",
        erro: "Orientação precisa ser observável e datada."
      }
    },
    {
      id: "m7-a05",
      titulo: "Direcionar pontos de atenção",
      objetivo: "Escolher o alerta da semana sem virar central de alarme.",
      lead: "Ponto de atenção é holofote, não sirene eterna. O ATV destaca o risco que, se ninguém olhar, vira desvio consolidado: curva de cobertura, SAC sem retorno, furo de rota, rito fraco.",
      visuais: [
        { titulo: "Um holofote", texto: "O principal risco da semana." },
        { titulo: "Por quê", texto: "Impacto se ninguém agir." },
        { titulo: "Olho", texto: "Onde acompanhar (ITA, rito, rua)." }
      ],
      entenda: [
        "Muitos alertas anestesiam a liderança.",
        "Ponto de atenção precisa de dono implícito ou explícito.",
        "O analista revisita o alerta na edição seguinte: resolveu ou piorou?"
      ],
      pratica: [
        "Termine o Jornal com 1 box de atenção.",
        "Na semana seguinte, feche o ciclo: o que aconteceu com aquele ponto.",
        "Não recicle o mesmo alerta sem mostrar evolução."
      ],
      papel: [
        "Ser criterioso no alarme.",
        "Fechar o ciclo do alerta."
      ],
      checklist: [
        "Um ponto principal",
        "Impacto explicado",
        "Retorno na edição seguinte"
      ],
      mensagem: "Atenção demais é ruído. Atenção certa é gestão.",
      quiz: {
        pergunta: "Ponto de atenção no Jornal deve ser:",
        opcoes: [
          "Uma lista de 20 riscos para 'garantir'",
          "O risco principal da semana, com impacto e acompanhamento",
          "Um recado vago de motivação"
        ],
        correta: 1,
        acerto: "Certo. Holofote, não sirene.",
        erro: "Se tudo é atenção, nada é atenção."
      }
    },
    {
      id: "m7-a06",
      titulo: "KPIs acompanhados no Jornal da Jornada",
      objetivo: "Saber quais indicadores sustentam o Jornal e por que eles entram juntos.",
      lead: "O Jornal acompanha os KPIs da Jornada que a operação vive: eficiência de visita, IPC, cobertura GP, ocorrências/De Olho, SAC, volume/HL quando couber, e a qualidade dos ritos (Matinal, RPS, coaching). Não invente um painel paralelo.",
      visuais: [
        { titulo: "Execução", texto: "Eficiência, rota, De Olho." },
        { titulo: "Mix e base", texto: "IPC e Cobertura GP." },
        { titulo: "Cliente e rito", texto: "SAC, RPS, coaching." }
      ],
      entenda: [
        "KPI no Jornal precisa ser o mesmo do Painel ITA.",
        "A combinação conta a história: eficiência alta + IPC baixo, por exemplo.",
        "Rito também é indicador qualitativo que o analista traduz em fato."
      ],
      pratica: [
        "Monte o Jornal cruzando 2 KPIs, não isolando 1.",
        "Cite a faixa (dentro, atenção, desvio, crítico) quando fizer sentido.",
        "Ligue KPI a uma evidência de campo de uma linha."
      ],
      papel: [
        "Manter o Jornal aderente aos KPIs oficiais.",
        "Ensinar a liderança a ler o cruzamento."
      ],
      checklist: [
        "KPIs do Jornal listados",
        "Fonte = Painel ITA",
        "Cruzamento, não número órfão"
      ],
      mensagem: "O Jornal fala a língua dos KPIs da Jornada — com evidência.",
      quiz: {
        pergunta: "Os KPIs do Jornal devem:",
        opcoes: [
          "Ser uma métrica nova criada pelo analista",
          "Ser os da Jornada, com fonte no Painel ITA e leitura cruzada",
          "Aparecer só quando estiverem bons"
        ],
        correta: 1,
        acerto: "Certo. Oficiais, cruzados, honestos.",
        erro: "Não crie painel paralelo. Use os KPIs da Jornada."
      }
    },
    {
      id: "m7-a07",
      titulo: "Rotina padrão do Analista de Treinamento",
      objetivo: "Enxergar a rotina como sistema: painel, CD, rito, campo, registro e comunicação.",
      lead: "O ATV performa quando a semana tem ritmo. Sem rotina, a agenda vira apaga-incêndio. A rotina padrão combina olhar o dado, estar no CD, desenvolver gente e dar visibilidade.",
      visuais: [
        { titulo: "Dado", texto: "Painel, Book, De Olho, SAC, Sniper." },
        { titulo: "Gente", texto: "GG, SV, VDD, GRC." },
        { titulo: "Rua", texto: "Rota, coaching, evidência." },
        { titulo: "Voz", texto: "RPS, Jornal, plano de ação." }
      ],
      entenda: [
        "Rotina não é burocracia: é proteção de foco.",
        "O analista que só reage a convite não conduz a área.",
        "Registro (agenda, evidência, plano) faz a rotina sobreviver à viagem."
      ],
      pratica: [
        "Bloqueie na agenda os blocos inegociáveis da rotina.",
        "Não deixe o Jornal e o campo competirem: os dois cabem na semana.",
        "Revise a rotina sexta: o que furou e por quê."
      ],
      papel: [
        "Ser previsível na entrega, flexível na abordagem.",
        "Ensinar o CD a saber quando e como o ATV atua."
      ],
      checklist: [
        "Blocos da rotina claros",
        "Agenda protegida",
        "Registro em dia"
      ],
      mensagem: "Rotina do ATV é o sistema que transforma intenção em presença.",
      quiz: {
        pergunta: "A rotina padrão do analista combina:",
        opcoes: [
          "Somente treinamentos de sala",
          "Dado, CD, campo, rito e comunicação",
          "Apenas deslocamento entre cidades"
        ],
        correta: 1,
        acerto: "Isso. Sistema completo.",
        erro: "Rotina não é só sala e nem só viagem. É o ciclo inteiro."
      }
    },
    {
      id: "m7-a08",
      titulo: "Semana padrão de visita ao CD",
      objetivo: "Memorizar o desenho da semana quando o analista está no CD.",
      lead: "A semana no CD tem cara. Não é cinco dias iguais. Cada dia tem um papel para o analista fechar o ciclo com o time.",
      semana: [
        { dia: "Segunda", foco: "Planejamento da semana: dado, pauta, alinhamento com GG/SV, foco da Jornada." },
        { dia: "Terça", foco: "Rota e acompanhamento: De Olho, execução, primeiros coachings." },
        { dia: "Quarta", foco: "Rota, campo e desenvolvimento: profundidade de visita e liderança." },
        { dia: "Quinta", foco: "Rota, direcionamento e apoio: ajustar plano, GRC, pontos de atenção." },
        { dia: "Sexta", foco: "Fechamento e envio: consolidar evidências, Jornal, combinados e próxima semana." }
      ],
      visuais: [
        { titulo: "Ritmo", texto: "Planeja → executa → aprofunda → direciona → fecha." }
      ],
      entenda: [
        "Segunda sem planejamento vira semana aleatória.",
        "Sexta sem fechamento joga evidência no lixo.",
        "O meio da semana é rua de verdade, não corredor de CD."
      ],
      pratica: [
        "Mostre esse desenho ao GG no início da visita.",
        "Adapte se o rito do CD cair em outro dia, sem perder a lógica.",
        "Não acumule todo o campo na sexta."
      ],
      papel: [
        "Conduzir a semana com cara de método.",
        "Fechar e comunicar na sexta."
      ],
      checklist: [
        "Papel de cada dia",
        "GG alinhado com o desenho",
        "Sexta com envio"
      ],
      mensagem: "Semana no CD tem script. Improviso vira turismo.",
      quiz: {
        pergunta: "Na semana padrão, sexta-feira é principalmente:",
        opcoes: [
          "O único dia de rota",
          "Fechamento e envio (evidência, Jornal, combinados)",
          "Folga do analista"
        ],
        correta: 1,
        acerto: "Certo. Sexta fecha e comunica.",
        erro: "Sexta é fechamento e envio. Rua pesada fica no meio da semana."
      }
    },
    {
      id: "m7-a09",
      titulo: "Rotina diária",
      objetivo: "Fixar o checklist diário: De Olho na Rota, Book, evidências, oportunidades e plano de ação.",
      lead: "Todo dia útil do ATV, mesmo fora do CD, tem um mínimo inegociável. Sem ele, a visita vira surpresa e o Jornal vira madrugada de sexta.",
      visuais: [
        { titulo: "De Olho na Rota", texto: "Radar do dia." },
        { titulo: "Book", texto: "Estudar o material/indicadores da área antes de opinar." },
        { titulo: "Evidências", texto: "Levar fatos aos gestores, não impressões." },
        { titulo: "Oportunidades", texto: "Registrar o que a carteira e o PDV mostraram." },
        { titulo: "Plano de ação", texto: "Dono, prazo, acompanhamento." }
      ],
      passos: [
        "Olhar o De Olho na Rota",
        "Estudar o Book / indicadores do dia",
        "Evidenciar ações aos gestores",
        "Registrar oportunidades",
        "Criar ou atualizar o plano de ação"
      ],
      entenda: [
        "Diário fraco vira semana fraca.",
        "Book não lido gera analista desatualizado na Matinal.",
        "Oportunidade não registrada morre na estrada."
      ],
      pratica: [
        "Coloque os cinco passos no início do dia, antes das mensagens.",
        "Use um bloco único de notas da Jornada.",
        "Feche o dia conferindo se o plano andou."
      ],
      papel: [
        "Ser disciplinado no mínimo diário.",
        "Dar visibilidade do plano aos gestores no mesmo dia."
      ],
      checklist: [
        "De Olho",
        "Book",
        "Evidência",
        "Oportunidade",
        "Plano"
      ],
      mensagem: "O dia do analista começa no radar e termina no plano.",
      quiz: {
        pergunta: "Qual item faz parte da rotina diária?",
        opcoes: [
          "Somente responder e-mails ao fim da noite",
          "De Olho na Rota, Book, evidências, oportunidades e plano de ação",
          "Apenas o deslocamento para o aeroporto"
        ],
        correta: 1,
        acerto: "Perfeito. Os cinco passos.",
        erro: "A rotina diária é o conjunto: radar, estudo, evidência, registro e plano."
      }
    },
    {
      id: "m7-a10",
      titulo: "Boas práticas do analista",
      objetivo: "Consolidar comportamentos que separam o ATV médio do ATV padrão ouro.",
      lead: "Boas práticas não são 'jeitinho'. São o padrão da função: pontualidade no rito, respeito ao papel alheio, evidência, confidencialidade, follow-up e humildade para observar antes de falar.",
      visuais: [
        { titulo: "Presença", texto: "Chega no rito e na rota no horário." },
        { titulo: "Método", texto: "Dado → campo → plano → acompanha." },
        { titulo: "Ética", texto: "Não expõe, não inventa, não some." }
      ],
      entenda: [
        "Credibilidade é o capital do ATV. Gasta rápido, reconstrói devagar.",
        "Boa prática visível ensina o CD mais do que slide.",
        "O analista é observado o tempo todo: Matinal, carro, PDV, corredor."
      ],
      pratica: [
        "Peça feedback ao GG no fim da semana: o que ajudou de verdade.",
        "Corrija uma prática sua que quebrou o padrão (atraso, dump de painel, sumiço no depois).",
        "Reconheça o SV que executou o combinado."
      ],
      papel: [
        "Modelar o padrão que você cobra.",
        "Manter a ética do dado e da gente."
      ],
      checklist: [
        "Pontualidade",
        "Evidência",
        "Follow-up",
        "Confidencialidade"
      ],
      mensagem: "O analista ensina pelo que faz no CD, não só pelo que fala.",
      quiz: {
        pergunta: "Uma boa prática central do ATV é:",
        opcoes: [
          "Expor desvio no coletivo para 'dar exemplo'",
          "Observar, evidenciar, planejar e acompanhar, com respeito ao papel da liderança",
          "Improvisar a semana inteira para parecer disponível"
        ],
        correta: 1,
        acerto: "Certo. Método + respeito.",
        erro: "Boa prática é ciclo com ética, não palco e nem improviso."
      }
    },
    {
      id: "m7-a11",
      titulo: "Comparar para aprender",
      objetivo: "Usar comparação entre CDs, equipes e períodos como aprendizagem, não como ranking pejorativo.",
      lead: "Comparar revela padrão. O CD A fecha Matinal em 20 minutos com foco; o CD B se perde em 50. O ATV leva a prática, não o troféu. Comparação sem contexto é injustiça; com contexto é escola.",
      visuais: [
        { titulo: "O quê", texto: "Prática de rito, rota e indicador." },
        { titulo: "Como", texto: "Fato + contexto de carteira/estrutura." },
        { titulo: "Para quê", texto: "Levar aprendizagem, não constranger." }
      ],
      entenda: [
        "Benchmark interno é ouro da área.",
        "Nunca use o nome do 'pior' como espelho público.",
        "Compare períodos do mesmo CD para mostrar evolução."
      ],
      pratica: [
        "Leve uma prática do CD forte como convite, não como ordem.",
        "Compare o próprio CD com ele mesmo na semana anterior.",
        "Registre o que foi replicado e o que não coube."
      ],
      papel: [
        "Ser ponte de aprendizagem entre operações.",
        "Proteger a dignidade de cada time."
      ],
      checklist: [
        "Comparação com contexto",
        "Aprendizado replicável",
        "Sem ranking pejorativo"
      ],
      mensagem: "Comparar é aprender. Expor é perder o time.",
      quiz: {
        pergunta: "A comparação correta é:",
        opcoes: [
          "Usar o pior CD como exemplo negativo na reunião geral",
          "Levar prática de um CD a outro com contexto, e comparar o CD com ele mesmo",
          "Ignorar outros CDs para não gerar ciúme"
        ],
        correta: 1,
        acerto: "Isso. Escola, não pelourinho.",
        erro: "Comparação sem ética quebra confiança. Use como aprendizagem."
      }
    },
    {
      id: "m7-a12",
      titulo: "Fechamento da semana",
      objetivo: "Encerrar o ciclo semanal com aprendizado, envio e próxima pauta.",
      lead: "Sexta não é só deslocamento. É o rito pessoal do analista: o que a semana ensinou, o que foi combinado, o que vai no Jornal, o que entra na segunda seguinte.",
      visuais: [
        { titulo: "Consolidar", texto: "Evidências e KPIs da semana." },
        { titulo: "Comunicar", texto: "Jornal e devolutiva ao GG." },
        { titulo: "Preparar", texto: "Pauta da próxima semana já nascida." }
      ],
      entenda: [
        "Sem fechamento, a segunda começa no zero.",
        "O envio precisa ser pontual: Jornal atrasado perde o rito da liderança.",
        "Fechar inclui o que não deu tempo — com honestidade."
      ],
      pratica: [
        "Bloqueie um slot de fechamento na sexta.",
        "Mande o combinado por escrito ao GG/SV.",
        "Deixe a segunda com 3 focos, não com 30 pendências."
      ],
      papel: [
        "Fechar o ciclo com a mesma seriedade da rota de quarta.",
        "Não sumir no fim da semana."
      ],
      checklist: [
        "Evidências consolidadas",
        "Envio feito",
        "Próxima semana pauta"
      ],
      mensagem: "Semana que não fecha não ensina. Só cansa.",
      quiz: {
        pergunta: "O fechamento da semana do ATV inclui:",
        opcoes: [
          "Somente o check-out do hotel",
          "Consolidar, comunicar (Jornal/combinados) e preparar a próxima pauta",
          "Apagar os registros para 'começar limpo'"
        ],
        correta: 1,
        acerto: "Certo. Consolidar, comunicar, preparar.",
        erro: "Fechamento é gestão do ciclo, não só viagem de volta."
      }
    },
    {
      id: "m7-a13",
      titulo: "Viagens a CD",
      objetivo: "Conhecer o fluxo de viagem: solicitação, aprovação, planejamento, reembolso, comprovação e política vigente.",
      lead: "Viagem é ferramenta da função, não benefício. Existe fluxo: solicitar, acompanhar aprovação, planejar a agenda no CD, executar, reembolsar e comprovar. A política vigente manda — o analista não improvisa regra.",
      visuais: [
        { titulo: "Solicitação", texto: "Pedido com objetivo da visita e datas." },
        { titulo: "Aprovação", texto: "Acompanhar até autorizar. Sem aprovação, não viaja." },
        { titulo: "Planejamento", texto: "Agenda com GG/SV, ritos e rotas." },
        { titulo: "Reembolso", texto: "Despesas dentro da política, no prazo." },
        { titulo: "Comprovação", texto: "Notas e evidências exigidas pela política vigente." },
        { titulo: "Política", texto: "O documento atual da empresa prevalece sobre costume." }
      ],
      entenda: [
        "Viagem sem objetivo de Jornada é custo sem retorno.",
        "Aprovação não é detalhe: é compliance.",
        "Comprovação incompleta trava o analista e a área."
      ],
      pratica: [
        "Ligue cada viagem a um objetivo: rito, coaching, desvio, desenvolvimento.",
        "Antes de embarcar, confirme aprovação e agenda do CD.",
        "No retorno, feche reembolso com a política na mão, não de memória."
      ],
      papel: [
        "Tratar deslocamento com profissionalismo de operação.",
        "Atualizar-se na política vigente — ela muda, o hábito não pode ficar velho."
      ],
      checklist: [
        "Solicitação com objetivo",
        "Aprovação acompanhada",
        "Agenda planejada",
        "Reembolso e comprovação na política vigente"
      ],
      mensagem: "Viagem boa começa na solicitação e termina na comprovação correta.",
      quiz: {
        pergunta: "Sobre viagens a CD, o que é correto?",
        opcoes: [
          "Viajar e regularizar depois, se o CD pediu",
          "Seguir solicitação, aprovação, planejamento, reembolso e política vigente",
          "Ignorar comprovação quando a visita foi boa"
        ],
        correta: 1,
        acerto: "Certo. O fluxo inteiro, com a política vigente.",
        erro: "Não improvise. Solicitação, aprovação e comprovação fazem parte da função."
      }
    },
    {
      id: "m7-a14",
      titulo: "Atividade: planejador semanal",
      objetivo: "Organizar as principais entregas da semana no formato da rotina do ATV.",
      lead: "Preencha o planejador com entregas reais da sua operação (ou da sua primeira semana tipo). O conteúdo é salvo no seu progresso automaticamente.",
      visuais: [
        { titulo: "Segunda", texto: "Planejamento." },
        { titulo: "Meio", texto: "Rota e desenvolvimento." },
        { titulo: "Sexta", texto: "Fechamento e envio." }
      ],
      entenda: [
        "Planejador vazio é semana reativa.",
        "Escreva entregas observáveis: 'RPS com SV Alfa', não 'dar uma olhada'."
      ],
      pratica: [
        "Inclua dado, rua e comunicação na mesma semana.",
        "Deixe um espaço de folga para o imprevisto do CD."
      ],
      papel: [
        "Dono da própria agenda de valor."
      ],
      checklist: [
        "Cinco dias com entrega",
        "Pelo menos uma rota",
        "Fechamento na sexta"
      ],
      mensagem: "Quem não planeja a semana do analista vira agenda dos outros.",
      planejador: {
        enunciado: "Registre a principal entrega de cada dia da sua semana padrão de visita ao CD.",
        dias: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"]
      }
    }
  ]
};
