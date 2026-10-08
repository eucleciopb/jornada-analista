/**
 * Portal AM (Inteligência de Mercado) — configuração e constantes.
 * Escopo isolado: não mistura dados com index10 / Vanessa entregas.
 */

export const AM_VERSION = "20261008am1";
export const AM_COLLECTION = "apuracoes_treinamentos";
export const AM_ESCOPO = "am";

export const PERFIL_AM_ANALISTA = "am_analista";
export const PERFIL_AM_GESTORA = "am_gestora";
export const PERFIL_AM_ADMIN = "am_admin";

export const TIPO = {
  USUARIO: "am_usuario",
  USUARIO_SEED: "am_usuario_seed_flag",
  COMPROMISSO: "am_compromisso",
  ENTREGA: "am_entrega",
  ROTINA_MODELO: "am_rotina_modelo",
  ROTINA_OCORRENCIA: "am_rotina_ocorrencia",
  FECHAMENTO: "am_fechamento",
  VISITA: "am_visita",
  ONDA: "am_onda",
  CD_CLASS: "am_cd_classificacao",
  TREINAMENTO: "am_treinamento",
  CONCEITO: "am_conceito",
  NOTIFICACAO: "am_notificacao",
  CONFIG: "am_config",
  AUDITORIA: "am_auditoria"
};

export const STATUS_ENTREGA = [
  "pendente",
  "em_andamento",
  "enviado_validacao",
  "validado",
  "devolvido",
  "cancelado"
];

export const PRIORIDADES = ["alta", "media", "baixa"];

export const TIPOS_COMPROMISSO = [
  "Visita ao CD",
  "Treinamento",
  "Reciclagem",
  "Pesquisa",
  "Entrega de rotina",
  "Entrega extraordinária",
  "Abertura de onda",
  "Fechamento de onda",
  "Reunião",
  "Outros"
];

export const FREQUENCIAS = [
  "unica",
  "diaria",
  "semanal",
  "quinzenal",
  "mensal",
  "trimestral",
  "por_onda",
  "personalizada"
];

export const CURVAS_ABC = ["A", "B", "C", "Sem classificação"];

/** Seed inicial dos analistas AM — senhas só no bootstrap Firestore. */
export const SEED_ANALISTAS_AM = [
  { nome: "Romulo Souza", senha: "Am1101" },
  { nome: "Anderson Rueda", senha: "Am1102" },
  { nome: "Matheus Sinivaldo", senha: "Am1103" },
  { nome: "Bernardo Bastos", senha: "Am1104" },
  { nome: "Naiane Vieira", senha: "Am1105" },
  { nome: "George Fonseca", senha: "Am1106" },
  { nome: "Caio Ewerton", senha: "Am1107" },
  { nome: "Yasmin Lima", senha: "Am1108" },
  { nome: "Augusto Martins", senha: "Am1109" },
  { nome: "Jeferson Silva", senha: "Am1110" }
];

export const SEED_GESTORA_AM = {
  nome: "Vanessa",
  senha: "908070",
  perfil: PERFIL_AM_GESTORA
};

export const SEED_ADMIN_AM = {
  nome: "Admin AM",
  senha: "AmAdmin11",
  perfil: PERFIL_AM_ADMIN
};

/** Modelos de rotina iniciais (aplicabilidade configurável — não força aos 10). */
export const SEED_ROTINAS = [
  { nome: "Fechamento Nielsen", categoria: "fechamento", frequencia: "mensal", evidenciaObrigatoria: true },
  { nome: "Fechamento Strata", categoria: "fechamento", frequencia: "mensal", evidenciaObrigatoria: true },
  { nome: "Visitas obrigatórias com materiais", categoria: "visita", frequencia: "mensal", quantidadeEsperada: 2, evidenciaObrigatoria: true },
  { nome: "Abertura das ondas", categoria: "onda", frequencia: "por_onda", evidenciaObrigatoria: false },
  { nome: "Fechamento das ondas", categoria: "onda", frequencia: "por_onda", evidenciaObrigatoria: false },
  { nome: "Treinamentos e reciclagens de pesquisa", categoria: "treinamento", frequencia: "mensal", evidenciaObrigatoria: false },
  { nome: "Conceito de Mercado", categoria: "conceito", frequencia: "mensal", evidenciaObrigatoria: false }
];

/** Pesos padrão do Índice de Execução AM (editáveis via config). */
export const PESOS_INDICE_PADRAO = {
  entregasNoPrazo: 35,
  rotinas: 25,
  visitas: 20,
  treinamentos: 10,
  qualidade: 10
};

export const PATH_INDEX11 = "../index11.html";
export const PATH_MENU_AM = "../html%20menus/menuam.html";
export const PATH_AM = "../html%20am/";

export const MENU_ANALISTA = [
  { id: "visao-geral", label: "Minha Visão Geral", href: "visao-geral.html", icon: "📊" },
  { id: "agenda", label: "Minha Agenda", href: "agenda.html", icon: "📅" },
  { id: "entregas-semana", label: "Entregas da Semana", href: "entregas-semana.html", icon: "📦" },
  { id: "entregas-rotina", label: "Entregas de Rotina", href: "entregas-rotina.html", icon: "✅" },
  { id: "fechamentos", label: "Fechamentos Nielsen e Strata", href: "fechamentos.html", icon: "📈" },
  { id: "visitas", label: "Visitas aos CDs", href: "visitas.html", icon: "🏪" },
  { id: "ondas", label: "Abertura e Fechamento de Ondas", href: "ondas.html", icon: "🌊" },
  { id: "cds", label: "CDs e Curva ABC", href: "cds.html", icon: "🏷️" },
  { id: "treinamentos", label: "Treinamentos e Reciclagens", href: "treinamentos.html", icon: "🎓" },
  { id: "conceito", label: "Conceito de Mercado", href: "conceito-mercado.html", icon: "💡" },
  { id: "indicadores", label: "Meus Indicadores", href: "indicadores.html", icon: "📉" },
  { id: "historico", label: "Histórico de Atividades", href: "historico.html", icon: "🗂️" }
];

export const MENU_ACOES = [
  { id: "nova-entrega", label: "Nova Entrega", href: "nova-entrega.html", icon: "➕", perfis: [PERFIL_AM_ANALISTA, PERFIL_AM_GESTORA, PERFIL_AM_ADMIN] },
  { id: "nova-atividade", label: "Nova Atividade", href: "nova-atividade.html", icon: "📝", perfis: [PERFIL_AM_ANALISTA, PERFIL_AM_GESTORA, PERFIL_AM_ADMIN] },
  { id: "nova-rotina", label: "Nova Rotina", href: "nova-rotina.html", icon: "🔁", perfis: [PERFIL_AM_GESTORA, PERFIL_AM_ADMIN] },
  { id: "configuracoes", label: "Configurações", href: "configuracoes.html", icon: "⚙️", perfis: [PERFIL_AM_ANALISTA, PERFIL_AM_GESTORA, PERFIL_AM_ADMIN] },
  { id: "gestao-cadastros", label: "Gestão de Cadastros", href: "gestao-cadastros.html", icon: "👥", perfis: [PERFIL_AM_GESTORA, PERFIL_AM_ADMIN] },
  { id: "gestao", label: "Painel Gerencial", href: "gestao.html", icon: "🧭", perfis: [PERFIL_AM_GESTORA, PERFIL_AM_ADMIN] }
];
