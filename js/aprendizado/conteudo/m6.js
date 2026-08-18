export const M6 = {
  id: "m6",
  numero: 6,
  titulo: "Painéis e frentes da jornada",
  objetivo: "Mostrar onde estão as informações e como utilizá-las para orientar a liderança e desenvolver o time.",
  mensagem: "Ocorrência não é para expor. É o ponto de partida para orientar, corrigir e desenvolver a execução.",
  aulas: [
    {
      id: "m6-a01",
      titulo: "De Olho na Rota",
      objetivo: "Entender o De Olho na Rota como radar da execução do dia.",
      lead: "De Olho na Rota é o olhar em movimento: o que está acontecendo na carteira agora. O ATV começa o dia ali para saber onde o desvio está vivo — não só no acumulado da semana.",
      visuais: [
        { titulo: "Agora", texto: "Rota do dia, visitas, desvios em curso." },
        { titulo: "Dono", texto: "SV e vendedor da ocorrência." },
        { titulo: "Uso", texto: "Priorizar acompanhamento, não fiscalizar por WhatsApp." }
      ],
      entenda: [
        "É ferramenta de gestão da execução, não mural de denúncia.",
        "O analista cruza o De Olho com a presença em campo.",
        "Olhar todo dia cria repertório; olhar só na crise vira apaga-incêndio."
      ],
      pratica: [
        "Coloque o De Olho na Rota na rotina diária, antes de ligar para o CD.",
        "Escolha 1 ou 2 desvios para aprofundar, não a lista inteira.",
        "Leve a evidência para o SV com pergunta, não com sentença."
      ],
      papel: [
        "Usar o radar para escolher onde desenvolver.",
        "Proteger o uso responsável da informação."
      ],
      checklist: [
        "De Olho na Rota na rotina diária",
        "Desvio priorizado",
        "Conversa com dono, sem exposição"
      ],
      mensagem: "De Olho na Rota mostra o jogo em andamento. Use para orientar, não para expor.",
      quiz: {
        pergunta: "O De Olho na Rota deve ser usado para:",
        opcoes: [
          "Expor o vendedor na Matinal",
          "Priorizar desvio e orientar a liderança com responsabilidade",
          "Substituir a RPS e o campo"
        ],
        correta: 1,
        acerto: "Certo. Radar com uso responsável.",
        erro: "Não é mural de exposição. É ponto de partida para desenvolver."
      }
    },
    {
      id: "m6-a02",
      titulo: "O que o indicador mostra",
      objetivo: "Ler o que o indicador do De Olho realmente diz — e o que ele não diz.",
      lead: "O indicador mostra desvio de execução: visita, registro, ocorrência, atraso, padrão quebrado. Ele não mostra sozinho o 'porquê'. O porquê mora no campo e na conversa com o SV.",
      visuais: [
        { titulo: "Mostra", texto: "Onde saiu do padrão e com que intensidade." },
        { titulo: "Não mostra", texto: "A causa raiz completa nem a melhor solução." },
        { titulo: "ATV", texto: "Completa o indicador com evidência e plano." }
      ],
      entenda: [
        "Tratar o indicador como verdade absoluta gera injustiça.",
        "Tratar o indicador como irrelevante gera cegueira.",
        "O meio-termo é o método do analista."
      ],
      pratica: [
        "Para cada alerta, escreva: o que sei, o que não sei, o que vou ver na rua.",
        "Não feche diagnóstico só com a bolinha vermelha.",
        "Volte ao indicador depois da ação para ver se moveu."
      ],
      papel: [
        "Ensinar leitura crítica do indicador.",
        "Completar o número com a rua."
      ],
      checklist: [
        "O que o indicador mostra",
        "O que ele não mostra",
        "Hipótese a validar no campo"
      ],
      mensagem: "O painel mostra o número. O campo mostra o motivo.",
      quiz: {
        pergunta: "O indicador do De Olho na Rota, sozinho:",
        opcoes: [
          "Já traz a causa raiz e o plano pronto",
          "Mostra o desvio, mas pede validação e ação no campo",
          "Pode ser ignorado se o GG tiver uma opinião"
        ],
        correta: 1,
        acerto: "Isso. Sinaliza. Você investiga e age.",
        erro: "Indicador aponta desvio. Causa e plano nascem com gente e rua."
      }
    },
    {
      id: "m6-a03",
      titulo: "Painel Detalhado",
      objetivo: "Usar o painel detalhado para chegar no recorte fino da ocorrência.",
      lead: "O painel detalhado é o zoom. Aqui o ATV sai do consolidado e vê cliente, horário, tipo de ocorrência e responsável. Sem detalhe, a orientação fica genérica.",
      visuais: [
        { titulo: "Zoom", texto: "Da equipe para o evento." },
        { titulo: "Pergunta", texto: "Onde, quando, quem, o quê." },
        { titulo: "Cuidado", texto: "Detalhe é para diagnosticar, não para colecionar culpa." }
      ],
      entenda: [
        "Detalhe demais sem prioridade vira caça ao erro.",
        "Detalhe de menos vira recado de corredor.",
        "O analista escolhe os eventos que ensinam o padrão."
      ],
      pratica: [
        "Abra o detalhado só depois de priorizar o desvio no consolidado.",
        "Separe ocorrência pontual de padrão repetido.",
        "Leve 1 caso-escola para o coaching, não 15."
      ],
      papel: [
        "Usar o zoom com disciplina.",
        "Proteger a pessoa por trás do evento."
      ],
      checklist: [
        "Quando abrir o detalhado",
        "Evento × padrão",
        "Caso escolhido para desenvolver"
      ],
      mensagem: "Detalhe existe para afinar o coaching, não para ampliar o palco.",
      quiz: {
        pergunta: "O painel detalhado serve para:",
        opcoes: [
          "Exibir todos os erros na Matinal",
          "Afinar o diagnóstico depois de priorizar o desvio",
          "Trocar o acompanhamento de campo"
        ],
        correta: 1,
        acerto: "Certo. Zoom depois da prioridade.",
        erro: "Detalhe sem prioridade vira caça. Priorize, depois abra o zoom."
      }
    },
    {
      id: "m6-a04",
      titulo: "Painel Gerencial",
      objetivo: "Ler o consolidado gerencial para conversar com GG e SV em linguagem de unidade.",
      lead: "O painel gerencial agrega. É a visão de quem precisa priorizar o CD. O ATV usa essa lente na RPS GG e na conversa de prioridade — e desce ao detalhado só no que foi escolhido.",
      visuais: [
        { titulo: "Gerencial", texto: "Tendência, concentração de desvio, comparação de equipes." },
        { titulo: "Uso", texto: "Pauta de GG e foco da semana." }
      ],
      entenda: [
        "GG não precisa do mesmo zoom que o SV.",
        "O analista traduz gerencial em 3 prioridades.",
        "Comparar equipes exige cuidado: contexto de carteira importa."
      ],
      pratica: [
        "Monte um slide mental: 3 alertas gerenciais, 3 pedidos de decisão.",
        "Não jogue o detalhado na mesa do GG sem síntese.",
        "Conecte o gerencial com o Jornal da Jornada."
      ],
      papel: [
        "Ser tradutor de consolidado para decisão.",
        "Evitar inundar a liderança com evento solto."
      ],
      checklist: [
        "Leitura gerencial feita",
        "Três prioridades extraídas",
        "Conversa adequada ao público (GG × SV)"
      ],
      mensagem: "Gerencial é prioridade de unidade. Detalhe é ferramenta, não pauta inteira.",
      quiz: {
        pergunta: "Na conversa com o GG, o ATV deve privilegiar:",
        opcoes: [
          "A lista bruta de ocorrências do dia",
          "A síntese gerencial com poucas prioridades",
          "Somente elogios, sem desvio"
        ],
        correta: 1,
        acerto: "Isso. GG compra prioridade, não dump.",
        erro: "Painel gerencial pede síntese. Detalhe vem depois, no que foi escolhido."
      }
    },
    {
      id: "m6-a05",
      titulo: "Tipos de ocorrência",
      objetivo: "Reconhecer que ocorrência tem tipo — e cada tipo pede resposta diferente.",
      lead: "Ocorrência de visita não é a mesma de registro, de atraso, de execução de PDV ou de rota furada. Se o ATV trata tudo como 'o time está ruim', o treino sai genérico.",
      visuais: [
        { titulo: "Tipo", texto: "Classifique antes de orientar." },
        { titulo: "Resposta", texto: "Coaching, processo, apoio GRC ou correção de rota." }
      ],
      entenda: [
        "Tipo errado gera solução errada.",
        "Repetição do mesmo tipo vira padrão de gestão, não azar.",
        "O analista ensina o SV a classificar."
      ],
      pratica: [
        "No De Olho, agrupe ocorrências por tipo antes de somar.",
        "Escolha o tipo mais frequente do SV em desvio.",
        "Desenhe a orientação daquele tipo, não de 'tudo'."
      ],
      papel: [
        "Diagnosticar tipo para treinar tipo.",
        "Não misturar ocorrência pontual com cultura de furo."
      ],
      checklist: [
        "Tipos reconhecidos",
        "Resposta adequada a cada tipo",
        "Padrão repetido separado do evento isolado"
      ],
      mensagem: "Ocorrência tem nome. Solução também.",
      quiz: {
        pergunta: "Por que classificar o tipo de ocorrência?",
        opcoes: [
          "Para preencher relatório com mais linhas",
          "Porque cada tipo pede uma orientação diferente",
          "Para expor o tipo na frente do cliente"
        ],
        correta: 1,
        acerto: "Certo. Tipo certo, solução certa.",
        erro: "Sem tipo, a orientação vira recado genérico."
      }
    },
    {
      id: "m6-a06",
      titulo: "Como priorizar os maiores desvios",
      objetivo: "Criar critério de prioridade: impacto, repetição, dono e possibilidade de agir nesta semana.",
      lead: "Tudo vermelho não é prioridade. Prioridade é o desvio que mais trava o resultado e que você consegue mexer agora com a liderança.",
      visuais: [
        { titulo: "Impacto", texto: "Quanto mexe em KPI da Jornada." },
        { titulo: "Repetição", texto: "É padrão ou foi um dia?" },
        { titulo: "Ação", texto: "Tem dono e cabe na semana?" }
      ],
      entenda: [
        "Priorizar é o ofício do analista na frente dos painéis.",
        "Cinco focos é nenhum foco.",
        "O maior número nem sempre é o maior desvio de gestão."
      ],
      pratica: [
        "Limite a pauta a 1 desvio principal e 1 secundário.",
        "Explique o critério para o SV: impacto × repetição.",
        "Deixe o restante monitorado, não abandonado."
      ],
      papel: [
        "Ser o filtro que protege o foco do CD.",
        "Resistira tentação de mostrar que viu tudo."
      ],
      checklist: [
        "Critério de prioridade",
        "Um desvio principal",
        "Ação da semana cabível"
      ],
      mensagem: "Prioridade é coragem de deixar o resto em segundo.",
      quiz: {
        pergunta: "O maior desvio a priorizar é aquele que:",
        opcoes: [
          "Aparece primeiro na tela, independentemente do impacto",
          "Combina impacto, repetição e ação possível nesta semana",
          "É o mais fácil de citar na Matinal"
        ],
        correta: 1,
        acerto: "Isso. Impacto + padrão + ação.",
        erro: "Prioridade não é a primeira linha da tela. É impacto, repetição e ação."
      }
    },
    {
      id: "m6-a07",
      titulo: "Uso responsável das informações",
      objetivo: "Fixar feedback individual, comunicação construtiva e confidencialidade.",
      lead: "Ocorrência em tela cheia na Matinal destrói confiança. O padrão da área é outro: feedback individual, linguagem construtiva e dado com confidencialidade.",
      visuais: [
        { titulo: "Individual", texto: "Desvio de pessoa se trata com a pessoa e a liderança dela." },
        { titulo: "Construtiva", texto: "Fato + impacto + próximo comportamento." },
        { titulo: "Confidencial", texto: "Painel não é conteúdo de grupo e nem de corredor." }
      ],
      entenda: [
        "Expor não desenvolve. Encolhe o time e esconde o próximo erro.",
        "O ATV dá o exemplo: nunca usa dado como arma.",
        "GG e SV precisam ser coachados nisso também."
      ],
      pratica: [
        "Se o CD expõe, interrompa o padrão em conversa privada com a liderança.",
        "Leve casos para o 1:1, não para o palco.",
        "Agregue no coletivo ('padrões da rota') e individualize no feedback."
      ],
      papel: [
        "Guardar a ética do dado.",
        "Ensinar o uso responsável como parte da Jornada."
      ],
      checklist: [
        "Feedback individual",
        "Comunicação construtiva",
        "Confidencialidade do painel"
      ],
      mensagem: "Ocorrência não é para expor. É o ponto de partida para orientar, corrigir e desenvolver a execução.",
      quiz: {
        pergunta: "Qual uso é responsável?",
        opcoes: [
          "Projetar o nome do vendedor com ocorrência na Matinal",
          "Tratar o desvio em feedback individual, com fato e plano",
          "Encaminhar o print no grupo geral do CD"
        ],
        correta: 1,
        acerto: "Certo. Individual, construtivo, confidencial.",
        erro: "Expor no coletivo quebra a Jornada. Dado é para desenvolver."
      }
    },
    {
      id: "m6-a08",
      titulo: "SAC",
      objetivo: "Entender conceito, total de SACs, concluídos, sem retorno, no prazo e fora do prazo.",
      lead: "SAC é a voz do cliente que virou ocorrência de atendimento. O ATV não é o dono do SAC, mas precisa ler o indicador porque ele revela falha de execução, ruptura, prazo e relacionamento — e pede desenvolvimento.",
      visuais: [
        { titulo: "Total", texto: "Volume de SACs no recorte." },
        { titulo: "Concluídos", texto: "O que foi encerrado." },
        { titulo: "Sem retorno", texto: "Cliente sem resposta — risco grave." },
        { titulo: "No prazo / fora", texto: "Disciplina de atendimento." }
      ],
      entenda: [
        "SAC alto não é só 'atendimento': muitas vezes é visita e execução ruins.",
        "Sem retorno é prioridade absoluta de gestão.",
        "Fora do prazo mostra processo, não só pessoa."
      ],
      pratica: [
        "Separe volume de SAC e qualidade da resposta (prazo e retorno).",
        "Leve SAC repetido do mesmo tipo para a rota (ruptura, entrega, preço).",
        "Não trate SAC como KPI de outro mundo."
      ],
      papel: [
        "Conectar SAC à execução comercial.",
        "Apoiar a liderança a atacar causa, não só fechar chamado."
      ],
      checklist: [
        "Conceito de SAC",
        "Leitura de total, concluídos, sem retorno e prazo",
        "Ligação com a rua"
      ],
      mensagem: "SAC é cliente falando. Ouça o tipo, não só o total.",
      quiz: {
        pergunta: "Qual recorte de SAC pede ação mais urgente?",
        opcoes: [
          "Somente os concluídos no prazo",
          "Sem retorno e fora do prazo",
          "O total, sem olhar qualidade"
        ],
        correta: 1,
        acerto: "Certo. Sem retorno e fora do prazo queimam o cliente.",
        erro: "Priorize sem retorno e fora do prazo — depois ataque a causa do volume."
      }
    },
    {
      id: "m6-a09",
      titulo: "Onde encontrar o SAC no Painel ITA",
      objetivo: "Localizar o bloco de SAC no Painel ITA para uso na rotina do analista.",
      lead: "O caminho precisa estar no músculo: Painel ITA, recorte do CD, bloco de SAC com total, status e prazo. Sem caminho, o indicador some da RPS.",
      passos: [
        "Abrir o Painel ITA",
        "Selecionar o CD",
        "Localizar o bloco SAC",
        "Ler total, concluídos, sem retorno, no prazo e fora do prazo",
        "Descer ao tipo/repetição antes da RPS"
      ],
      visuais: [
        { titulo: "Fonte", texto: "Painel ITA é a referência da conversa." },
        { titulo: "Rotina", texto: "Olhar SAC junto com De Olho e cobertura, não uma vez por mês." }
      ],
      entenda: [
        "Se o CD não abre SAC no ITA, o analista ensina o caminho.",
        "Print sem recorte gera discussão de número diferente."
      ],
      pratica: [
        "Inclua SAC no checklist de preparação da visita ao CD.",
        "Alinhe com o GG quem é o dono operacional do retorno.",
        "Cruze SAC de ruptura com leitura de loja."
      ],
      papel: [
        "Padronizar a fonte e a pauta.",
        "Não deixar SAC órfão na Jornada."
      ],
      checklist: [
        "Caminho no Painel ITA",
        "Recortes de status lidos",
        "SAC na preparação da visita"
      ],
      mensagem: "O que não está no ITA na pauta, o CD não gere.",
      quiz: {
        pergunta: "O SAC deve ser acompanhado:",
        opcoes: [
          "Só quando o cliente ligar para o analista",
          "No Painel ITA, no recorte do CD, com status e prazo",
          "Apenas no fechamento semestral"
        ],
        correta: 1,
        acerto: "Certo. ITA, recorte e status.",
        erro: "SAC se acompanha no Painel ITA, com o mesmo rigor dos outros KPIs."
      }
    },
    {
      id: "m6-a10",
      titulo: "Sniper GP",
      objetivo: "Entender a frente Sniper GP: clientes sem compra, visitas, registro, oportunidade, feedback e conversão.",
      lead: "Sniper GP é a caça disciplinada aos clientes da base sem compra GP. Não é 'passar raiva na carteira'. É método: listar, visitar, registrar, explorar oportunidade, dar feedback e converter.",
      visuais: [
        { titulo: "Sem compra", texto: "Quem da base não positivou GP." },
        { titulo: "Visitas", texto: "A carteira foi vista de verdade?" },
        { titulo: "Registro", texto: "O que aconteceu na visita ficou documentado." },
        { titulo: "Oportunidade", texto: "Há espaço, ruptura do concorrente, geladeira vazia?" },
        { titulo: "Feedback", texto: "Liderança devolve e ajusta abordagem." },
        { titulo: "Conversão", texto: "Virou compra GP?" }
      ],
      entenda: [
        "Sem registro, o Sniper não ensina: a mesma objeção volta toda semana.",
        "Conversão é o resultado; visita sem abordagem de GP não é Sniper.",
        "O ATV desenvolve o roteiro de abordagem, não só cobra a lista."
      ],
      pratica: [
        "Pegue 5 clientes sem GP e monte o roteiro da visita com o SV.",
        "Veja se há registro da objeção.",
        "Acompanhe a conversão na semana seguinte."
      ],
      papel: [
        "Transformar lista em método de conversão.",
        "Coach da abordagem, não da perseguição."
      ],
      checklist: [
        "Lista de sem compra",
        "Visita com registro",
        "Oportunidade, feedback e conversão acompanhados"
      ],
      mensagem: "Sniper GP é método de carteira, não disparo no escuro.",
      quiz: {
        pergunta: "O ciclo do Sniper GP inclui:",
        opcoes: [
          "Somente enviar mensagem genérica de mix",
          "Clientes sem compra → visita → registro → oportunidade → feedback → conversão",
          "Trocar a base de clientes toda semana"
        ],
        correta: 1,
        acerto: "Perfeito. Esse é o ciclo.",
        erro: "Sniper tem ciclo completo. Lista sem conversão não basta."
      }
    },
    {
      id: "m6-a11",
      titulo: "Onde encontrar o Sniper GP no Painel ITA",
      objetivo: "Saber o caminho do Sniper GP no Painel ITA para usar na preparação e na RPS.",
      lead: "A lista mora no Painel ITA. O ATV precisa abrir, recortar o CD/SV, exportar para a cabeça (e para o plano) os clientes sem compra e o status de visita/conversão.",
      passos: [
        "Abrir o Painel ITA",
        "Selecionar o CD e o período",
        "Localizar Sniper GP / clientes sem compra GP",
        "Ler visitas, registro e conversão",
        "Levar os nomes para a RPS e para a rota"
      ],
      visuais: [
        { titulo: "Fonte", texto: "Painel ITA." },
        { titulo: "Saída", texto: "Nomes na rua nesta semana." }
      ],
      entenda: [
        "Ferramenta que não vira rota é enfeite.",
        "O analista ensina o SV a abrir o mesmo caminho."
      ],
      pratica: [
        "Na véspera, tire a lista dos 10 mais críticos.",
        "No campo, confira 2 deles com leitura de loja.",
        "Na RPS, mostre conversão, não só a lista antiga."
      ],
      papel: [
        "Conectar ITA e carteira.",
        "Medir Sniper por conversão, não por abertura de tela."
      ],
      checklist: [
        "Caminho no ITA",
        "Lista nomeada",
        "Uso na rota da semana"
      ],
      mensagem: "Sniper no ITA só vale se virar visita com GP.",
      quiz: {
        pergunta: "Encontrar o Sniper GP no Painel ITA serve para:",
        opcoes: [
          "Arquivar a lista no e-mail",
          "Nomear clientes e transformar em visita, registro e conversão",
          "Substituir a Matinal"
        ],
        correta: 1,
        acerto: "Certo. ITA → nomes → rua.",
        erro: "Abrir o ITA é o começo. O valor está na conversão na carteira."
      }
    },
    {
      id: "m6-a12",
      titulo: "Atividade: priorize o desvio do painel",
      objetivo: "Simular um painel e escolher o desvio e a orientação corretos.",
      lead: "Você abre o De Olho na Rota e o gerencial do CD. Há vários alertas. Só um combina impacto, repetição e ação possível nesta semana — e pede uso responsável da informação.",
      visuais: [
        { titulo: "Simulação", texto: "Escolha o desvio principal e a orientação." }
      ],
      entenda: [
        "Expor o vendedor na Matinal nunca é a orientação certa.",
        "Um evento isolado de atraso não ganha de um padrão de furo de visita com impacto em eficiência e cobertura.",
        "SAC sem retorno é grave, mas nesta simulação o padrão de rota é o que a Jornada pede para o ATV atacar com coaching nesta semana — o SAC segue com dono de processo. Na prática real, sem retorno pode ser paralelo e urgente: aqui treinamos priorização de execução de rota."
      ],
      pratica: [
        "Marque o desvio de maior impacto recorrente na execução.",
        "Escolha orientação de desenvolvimento, não de exposição."
      ],
      papel: [
        "Priorizar e orientar com ética."
      ],
      checklist: [
        "Desvio certo",
        "Orientação certa"
      ],
      mensagem: "Ocorrência não é para expor. É o ponto de partida para orientar, corrigir e desenvolver a execução.",
      painel: {
        titulo: "Simulação de painel",
        enunciado: "Selecione o desvio a priorizar nesta semana e a orientação correspondente.",
        linhas: [
          { id: "atraso", nome: "1 atraso pontual de um vendedor novato", detalhe: "Primeira ocorrência, sem impacto de KPI da equipe.", alerta: false },
          { id: "furo", nome: "Furo recorrente de visita no SV Alfa — eficiência 78% e 22 clientes GP sem compra", detalhe: "Repetição na semana, impacto em EV e cobertura. Evidência de visita rasa.", alerta: true },
          { id: "foto", nome: "Foto de mercha bonita em um PDV vitrine", detalhe: "Sem desvio. Reconhecimento.", alerta: false }
        ],
        acoes: [
          "Expor o ranking de piores na Matinal presencial",
          "Coaching na rota SV/VDD do Alfa + lista Sniper GP da carteira, com feedback individual",
          "Ignorar o painel e aplicar treino de produto para o CD inteiro"
        ],
        desvioCorreto: "furo",
        acaoCorreta: "Coaching na rota SV/VDD do Alfa + lista Sniper GP da carteira, com feedback individual",
        acerto: "Prioridade certa: padrão recorrente com impacto. Orientação certa: desenvolver na rua, sem expor.",
        erro: "O atraso pontual do novato não é o maior desvio. Expor na Matinal fere o uso responsável. Priorize o furo recorrente do SV Alfa e vá ao coaching + Sniper."
      }
    }
  ]
};
