export const M8 = {
  id: "m8",
  numero: 8,
  titulo: "Fechamento da integração",
  objetivo: "Consolidar os conhecimentos essenciais para o início da atuação do novo analista.",
  mensagem: "Antes de orientar, entenda a operação. Depois, transforme informação em ação.",
  aulas: [
    {
      id: "m8-a01",
      titulo: "Processos que devemos acompanhar",
      objetivo: "Revisar os processos mínimos da operação que o ATV não pode perder de vista.",
      lead: "Se a agenda apertar, estes processos continuam no radar. Eles são o esqueleto da Jornada no CD.",
      revisao: [
        {
          titulo: "Ritos do dia e da semana",
          itens: ["Matinal", "RPS", "Coaching"]
        },
        {
          titulo: "Frentes de painel",
          itens: ["De Olho na Rota", "SAC", "Sniper GP"]
        },
        {
          titulo: "Campo e coringa",
          itens: ["Curinga", "Rotina de campo"]
        }
      ],
      visuais: [
        { titulo: "Curinga", texto: "Frente/visita extra da Jornada: oportunidade que não pode ficar órfã no radar do analista." },
        { titulo: "Campo", texto: "Onde o processo prova se está vivo." }
      ],
      entenda: [
        "Processo sem dono no CD morre. O ATV cobra o rito, não executa no lugar.",
        "Curinga e campo completam o que o painel não alcança sozinho.",
        "Acompanhar não é estar em todos ao mesmo tempo: é não deixar nenhum cego."
      ],
      pratica: [
        "Marque na semana qual processo você vai ver ao vivo.",
        "Os demais entram no painel e no Jornal.",
        "Se um rito não existe no CD, isso em si já é o desvio."
      ],
      papel: [
        "Manter o esqueleto da Jornada de pé.",
        "Desenvolver a liderança para tocar o processo na sua ausência."
      ],
      checklist: [
        "Matinal, RPS e coaching no radar",
        "De Olho, SAC e Sniper no radar",
        "Curinga e rotina de campo no radar"
      ],
      mensagem: "Processo acompanhado vira hábito. Processo invisível vira exceção.",
      quiz: {
        pergunta: "Qual conjunto o ATV precisa acompanhar?",
        opcoes: [
          "Somente treinamentos de produto",
          "Matinal, RPS, coaching, De Olho, SAC, Sniper GP, Curinga e rotina de campo",
          "Apenas o deslocamento entre CDs"
        ],
        correta: 1,
        acerto: "Certo. Esse é o esqueleto.",
        erro: "A lista completa é o mínimo da Jornada no CD."
      }
    },
    {
      id: "m8-a02",
      titulo: "KPIs que devemos entender",
      objetivo: "Revisar os indicadores que o analista precisa ler com fluência.",
      lead: "Você não precisa ser o dono do número. Precisa entendê-lo, achar o desvio e virar ação. Esta é a lista mínima.",
      revisao: [
        {
          titulo: "Carteira e visita",
          itens: ["Eficiência de Visita", "IPC", "Cobertura GP"]
        },
        {
          titulo: "Cliente e radar",
          itens: ["SAC", "De Olho na Rota"]
        },
        {
          titulo: "Rito e comunicação",
          itens: ["RPS", "Coaching", "Indicadores do Jornal da Jornada"]
        }
      ],
      visuais: [
        { titulo: "Ler", texto: "Fórmula, faixa, recorte no ITA." },
        { titulo: "Cruzar", texto: "Eficiência × IPC × cobertura contam uma história." },
        { titulo: "Agir", texto: "KPI sem plano é quadro." }
      ],
      entenda: [
        "KPI do Jornal é o mesmo do ITA.",
        "RPS e coaching também se 'medem' pela qualidade observável.",
        "O analista novo erra ao querer todos os gráficos e nenhum comportamento."
      ],
      pratica: [
        "Explique cada KPI desta lista em uma frase para um SV.",
        "Diga onde acompanha no ITA.",
        "Diga que ação de rua ele pede quando desvia."
      ],
      papel: [
        "Ser fluente, não enciclopédico.",
        "Traduzir KPI em desenvolvimento."
      ],
      checklist: [
        "EV, IPC, Cobertura GP",
        "SAC e De Olho",
        "RPS, coaching e KPIs do Jornal"
      ],
      mensagem: "Entender o KPI é o começo. Virar ação é o ofício.",
      quiz: {
        pergunta: "O ATV precisa entender, no mínimo:",
        opcoes: [
          "Apenas HL de campanha nacional",
          "Eficiência, IPC, Cobertura GP, SAC, De Olho, RPS, coaching e KPIs do Jornal",
          "Somente a senha do painel"
        ],
        correta: 1,
        acerto: "Lista certa.",
        erro: "A lista mínima está neste bloco de revisão. Volte nela se precisar."
      }
    },
    {
      id: "m8-a03",
      titulo: "Campo que devemos sentir",
      objetivo: "Relembrar o que só a rua ensina e que o analista precisa sentir no corpo.",
      lead: "Campo não se terceiriza para o painel. O ATV precisa entender a rotina real, observar SV e VDD, achar gaps, ouvir a equipe e transformar evidência em desenvolvimento.",
      revisao: [
        {
          titulo: "Sentir a operação",
          itens: ["Entender a rotina real", "Observar SV e VDD"]
        },
        {
          titulo: "Virar desenvolvimento",
          itens: ["Identificar gaps", "Ouvir a equipe", "Transformar evidências em desenvolvimento"]
        }
      ],
      visuais: [
        { titulo: "Olhos", texto: "Rotina Básica acontecendo ou não." },
        { titulo: "Ouvidos", texto: "O que o time sente que o número não diz." },
        { titulo: "Mãos", texto: "Plano, coaching, retorno." }
      ],
      entenda: [
        "Ouvir não é concordar com tudo: é coletar causa.",
        "Gap sem evidência vira achismo; evidência sem plano vira turismo.",
        "SV e VDD se desenvolvem na rota, não no corredor."
      ],
      pratica: [
        "Na próxima visita, cumpra os cinco verbos de campo.",
        "Anote uma fala da equipe e valide no dado.",
        "Feche com um comportamento observável."
      ],
      papel: [
        "Ser presença que desenvolve.",
        "Não terceirizar o campo para o print."
      ],
      checklist: [
        "Rotina real observada",
        "SV e VDD vistos na execução",
        "Gap + escuta + plano"
      ],
      mensagem: "O painel mostra o número. O campo mostra o motivo.",
      quiz: {
        pergunta: "Sentir o campo significa:",
        opcoes: [
          "Apenas passar no CD para marcar presença",
          "Ver a rotina real, observar SV/VDD, ouvir, achar gap e desenvolver",
          "Mandar mensagem pedindo prints"
        ],
        correta: 1,
        acerto: "Certo. Campo é presença com método.",
        erro: "Campo é ver, ouvir e transformar evidência em desenvolvimento."
      }
    },
    {
      id: "m8-a04",
      titulo: "Atitudes que vencem o jogo",
      objetivo: "Levar para a operação as atitudes que sustentam a função no dia a dia.",
      lead: "Conteúdo sem atitude não cola no CD. Estas são as atitudes que vencem o jogo do ATV.",
      revisao: [
        {
          titulo: "Presença e olhar",
          itens: ["Presença", "Curiosidade"]
        },
        {
          titulo: "Entrega",
          itens: ["Disciplina", "Senso de dono", "Foco em solução"]
        },
        {
          titulo: "Gente",
          itens: ["Comunicação clara", "Criatividade", "Parceria"]
        }
      ],
      visuais: [
        { titulo: "Presença", texto: "Estar no rito e na rua." },
        { titulo: "Curiosidade", texto: "Perguntar o porquê." },
        { titulo: "Disciplina", texto: "Rotina, painel, follow-up." },
        { titulo: "Senso de dono", texto: "O resultado da Jornada no CD também é seu." },
        { titulo: "Comunicação clara", texto: "Fato, foco, pedido." },
        { titulo: "Criatividade", texto: "Solução que o CD consegue executar." },
        { titulo: "Parceria", texto: "GG, SV, GRC, VDD — jogo de time." },
        { titulo: "Foco em solução", texto: "Menos teatro do problema, mais plano." }
      ],
      entenda: [
        "Atitude se vê quando o CD não está olhando o analista no palco.",
        "Criatividade sem disciplina vira ideia solta.",
        "Dono sem parceria vira analista isolado."
      ],
      pratica: [
        "Escolha 2 atitudes para treinar na primeira semana real.",
        "Peça ao GG para observar uma delas.",
        "Releia esta lista no fechamento do mês."
      ],
      papel: [
        "Encarnar o padrão da área.",
        "Puxar o time para solução, não para desculpa."
      ],
      checklist: [
        "Oito atitudes reconhecidas",
        "Duas escolhidas para treinar",
        "Parceria no centro"
      ],
      mensagem: "Atitude vence conteúdo quando a operação aperta.",
      quiz: {
        pergunta: "Qual conjunto representa as atitudes que vencem o jogo?",
        opcoes: [
          "Presença, curiosidade, disciplina, senso de dono, comunicação clara, criatividade, parceria e foco em solução",
          "Cobrança pública, improviso e sumiço no follow-up",
          "Somente criatividade, sem disciplina"
        ],
        correta: 0,
        acerto: "Essas oito atitudes são o fechamento humano da integração.",
        erro: "Volte à lista das oito atitudes. Elas andam juntas."
      }
    },
    {
      id: "m8-a05",
      titulo: "Avaliação de conhecimento",
      objetivo: "Conferir se o essencial da integração está pronto para a operação.",
      lead: "Responda com o que a trilha ensinou. São perguntas da operação, não de memorização vazia. Você precisa acertar pelo menos 6 de 8.",
      visuais: [
        { titulo: "Régua", texto: "6 acertos no mínimo para consolidar." }
      ],
      entenda: [
        "Errar aponta o módulo para revisar — e as aulas já concluídas continuam abertas.",
        "A avaliação não substitui o campo: ela libera você para o campo com mais clareza."
      ],
      pratica: [
        "Leia cada pergunta até o fim.",
        "Se errar, volte ao módulo indicado e refaça."
      ],
      papel: [
        "Provar para si mesmo que a operação veio antes da orientação."
      ],
      checklist: [
        "Avaliação enviada",
        "Mínimo atingido ou revisão feita"
      ],
      mensagem: "Antes de orientar, entenda a operação. Depois, transforme informação em ação.",
      avaliacao: {
        minimo: 6,
        perguntas: [
          {
            pergunta: "Qual a primeira atitude do ATV diante de um pedido urgente de treino sem diagnóstico?",
            opcoes: [
              "Aplicar o treinamento padrão na mesma hora",
              "Entender a operação: dado, escuta e campo, depois orientar",
              "Recusar qualquer apoio ao CD"
            ],
            correta: 1
          },
          {
            pergunta: "A sequência do dia comercial é:",
            opcoes: [
              "Matinal → Rota → Acompanhamento → Vespertina → Análise → Plano de ação",
              "Rota → Matinal → Folga → Relatório",
              "Painel → Cobrança → Encerramento"
            ],
            correta: 0
          },
          {
            pergunta: "RPS é, principalmente:",
            opcoes: [
              "Reunião de cobrança pública",
              "Planejamento com dados, foco, meta e plano de ação",
              "Substituta da visita de campo"
            ],
            correta: 1
          },
          {
            pergunta: "O painel mostra o número. O campo mostra:",
            opcoes: ["O ranking de pessoas", "O motivo", "A senha do ITA"],
            correta: 1
          },
          {
            pergunta: "16 visitas realizadas em 18 planejadas. Eficiência e faixa:",
            opcoes: ["88,9% · desvio", "18% · crítico", "160% · dentro"],
            correta: 0
          },
          {
            pergunta: "Ocorrência no De Olho na Rota deve ser usada para:",
            opcoes: [
              "Expor o vendedor na Matinal",
              "Orientar, corrigir e desenvolver a execução, com confidencialidade",
              "Preencher o Jornal com nomes"
            ],
            correta: 1
          },
          {
            pergunta: "Na semana padrão no CD, segunda e sexta são, respectivamente:",
            opcoes: [
              "Rota pesada e folga",
              "Planejamento da semana · fechamento e envio",
              "Somente deslocamento · somente deslocamento"
            ],
            correta: 1
          },
          {
            pergunta: "Os dois pilares da área são:",
            opcoes: [
              "Atuação em campo e envolvimento com GRC e área",
              "Cobrança de meta e cadastro de treino",
              "Viagem e reembolso"
            ],
            correta: 0
          }
        ]
      }
    },
    {
      id: "m8-a06",
      titulo: "Conclusão da Integração ATV",
      objetivo: "Encerrar a jornada com o compromisso de atuação do novo analista.",
      lead: "Você percorreu a operação, os ritos, o campo, os indicadores, os painéis e a rotina. A integração acaba aqui. A atuação começa agora.",
      visuais: [
        { titulo: "Operação", texto: "Entendida antes de qualquer orientação." },
        { titulo: "Informação", texto: "Painel, rito e rua no mesmo ciclo." },
        { titulo: "Ação", texto: "Dono, prazo, acompanhamento, gente desenvolvida." }
      ],
      entenda: [
        "Volte às aulas sempre que o CD puxar um tema. A trilha continua aberta.",
        "Seu progresso ficou salvo no seu usuário.",
        "O próximo curso da área de Aprendizado poderá entrar neste mesmo espaço."
      ],
      pratica: [
        "Leve a mensagem final para a primeira Matinal como ATV.",
        "Escolha um CD e aplique um ciclo completo nesta semana.",
        "Peça feedback ao GG no fechamento."
      ],
      papel: [
        "Sair da integração em modo operação, não em modo certificado.",
        "Ser elo: estratégia, dados, pessoas e execução."
      ],
      checklist: [
        "Trilha concluída",
        "Mensagem final incorporada",
        "Primeira semana real planejada"
      ],
      mensagem: "Antes de orientar, entenda a operação. Depois, transforme informação em ação.",
      conclusao: {
        titulo: "Integração concluída",
        texto: "Você está pronto para começar. Presença no CD, curiosidade na rua, disciplina no painel e parceria com a liderança. Boa jornada."
      },
      quiz: {
        pergunta: "Qual é a mensagem final da integração?",
        opcoes: [
          "Antes de orientar, entenda a operação. Depois, transforme informação em ação.",
          "Treine primeiro, veja o CD depois.",
          "O painel substitui o campo."
        ],
        correta: 0,
        acerto: "Essa é a frase que você leva para a área. Marque a aula como concluída e volte ao Aprendizado quando quiser revisar.",
        erro: "A mensagem final é: antes de orientar, entenda a operação. Depois, transforme informação em ação."
      }
    }
  ]
};
