/**
 * Perfil e regras de acesso do portal.
 * Identificação por perfil/matrícula/uidKey — não apenas pelo nome exibido.
 */

import { getSession, getSessionUser, slug, safeParse } from "./aniversario.js";

/** Perfis conhecidos */
export const PERFIL_ANALISTA = "analista";
export const PERFIL_ADMIN = "admin";
export const PERFIL_TREINAMENTO_PRODUTOS = "treinamento_produtos";
export const PERFIL_LOGISTICA = "logistica";

/**
 * Mapa estável: matrícula → perfil.
 * Menu exclusivo de treinamentos de produtos: Alex e Euclecio.
 * Menu logística (visão reduzida): Ercules.
 */
export const PERFIL_POR_MATRICULA = {
  A70: PERFIL_TREINAMENTO_PRODUTOS, // Alex
  ALEX: PERFIL_TREINAMENTO_PRODUTOS,
  E72: PERFIL_TREINAMENTO_PRODUTOS, // Euclecio
  EUCLECIO: PERFIL_TREINAMENTO_PRODUTOS,
  E87: PERFIL_LOGISTICA, // Ercules
  ERCULES: PERFIL_LOGISTICA
};

/** uidKeys com perfil exclusivo (fallback) */
export const PERFIL_POR_UIDKEY = {
  alex: PERFIL_TREINAMENTO_PRODUTOS,
  euclecio: PERFIL_TREINAMENTO_PRODUTOS,
  ercules: PERFIL_LOGISTICA
};

/** Nomes canônicos do menu de produtos */
export const NOMES_MENU_PRODUTOS = new Set(["alex", "euclecio"]);

/** Nomes canônicos do menu logística */
export const NOMES_MENU_LOGISTICA = new Set(["ercules"]);

/** Rotas permitidas para logística (além do próprio menu) */
export const ROTAS_LOGISTICA_PERMITIDAS = [
  "menu_logistica.html",
  "criar-agenda.html",
  "agenda.html",
  "treinamentos.html",
  "biblioteca-treinamentos.html",
  "boas-praticas.html",
  "acompanhamento-entregas.html"
];

/** Identidade do menu de produtos (Alex ou Euclecio) */
export function isIdentidadeMenuProdutos({ nome, matricula, uidKey } = {}) {
  const mat = String(matricula || matriculaDoUsuario(nome) || "").trim().toUpperCase();
  const key = String(uidKey || uidKeyDoUsuario(nome) || "").toLowerCase();
  const nomeKey = slug(nome);
  if (NOMES_MENU_PRODUTOS.has(nomeKey)) return true;
  if (key === "alex" || key === "euclecio") return true;
  if (mat === "A70" || mat === "ALEX" || mat === "E72" || mat === "EUCLECIO") return true;
  if (PERFIL_POR_MATRICULA[mat] === PERFIL_TREINAMENTO_PRODUTOS) return true;
  if (PERFIL_POR_UIDKEY[key] === PERFIL_TREINAMENTO_PRODUTOS) return true;
  return false;
}

/** Identidade do menu logística (Ercules) */
export function isIdentidadeLogistica({ nome, matricula, uidKey, perfil } = {}) {
  const mat = String(matricula || matriculaDoUsuario(nome) || "").trim().toUpperCase();
  const key = String(uidKey || uidKeyDoUsuario(nome) || "").toLowerCase();
  const nomeKey = slug(nome);
  const p = String(perfil || "").trim().toLowerCase();
  if (p === PERFIL_LOGISTICA) return true;
  if (NOMES_MENU_LOGISTICA.has(nomeKey)) return true;
  if (key === "ercules") return true;
  if (mat === "E87" || mat === "ERCULES") return true;
  if (PERFIL_POR_MATRICULA[mat] === PERFIL_LOGISTICA) return true;
  if (PERFIL_POR_UIDKEY[key] === PERFIL_LOGISTICA) return true;
  return false;
}

export function normalizarSessaoLogistica(sessao, nomeUsuario) {
  const nome = String(nomeUsuario || sessao?.nome || "Ercules").trim() || "Ercules";
  return {
    ...(sessao || {}),
    nome,
    matricula: "E87",
    uidKey: "ercules",
    perfil: PERFIL_LOGISTICA,
    tipoUsuario: PERFIL_LOGISTICA
  };
}

/** Corrige sessão para o menu de produtos preservando a identidade do usuário */
export function normalizarSessaoMenuProdutos(sessao, nomeUsuario) {
  const nome = String(nomeUsuario || sessao?.nome || "").trim();
  const nomeKey = slug(nome);
  const isAlex = nomeKey === "alex";
  return {
    ...(sessao || {}),
    nome: nome || (isAlex ? "Alex" : "Euclecio"),
    matricula: isAlex ? "A70" : "E72",
    uidKey: isAlex ? "alex" : "euclecio",
    perfil: PERFIL_TREINAMENTO_PRODUTOS,
    tipoUsuario: PERFIL_TREINAMENTO_PRODUTOS
  };
}

/** Matrículas conhecidas (login analistas) */
export const MATRICULA_POR_USUARIO = {
  Alex: "A70",
  Daniel: "D71",
  Emerson: "B70",
  Euclecio: "E72",
  Felipe: "F73",
  Joice: "J74",
  Maiello: "M75",
  Michel: "M76",
  Muller: "M77",
  Robert: "R78",
  Rodrigo: "R79",
  Rosilene: "R80",
  Tenório: "T81",
  Victor: "V82",
  Marcio: "M83",
  Andre: "A84",
  "Ana Paula": "A85",
  Ercules: "E87"
};

/** Rotas / páginas exclusivas de gestão por SV (bloquear para treinamento_produtos) */
export const ROTAS_EXCLUSIVAS_SV = [
  "menu.html",
  "resultados.html",
  "avaliacao-matinal-geral.html",
  "relatorio_mgr.html",
  "acompanhamento-entregas.html",
  "relatorio-visita-cd.html",
  "kpis-supervisores-importar.html",
  "kpis_cd_mes.html",
  "importar-kpis-cd.html",
  "efetividade_treinamentos.html",
  "processar-correlacao-treinamentos.html",
  "resumo-gerencial-treinamentos.html",
  "painel-matinal-geral-adm.html",
  "painel-entregas-adm.html",
  "painel-entregas-hub-adm.html",
  "metas-analistas-adm.html",
  "responsaveis-cd-adm.html",
  "apuracao.html",
  "dedo-duro.html"
];

export function matriculaDoUsuario(nome) {
  const n = String(nome || "").trim();
  return MATRICULA_POR_USUARIO[n] || n || "";
}

export function uidKeyDoUsuario(nome) {
  return slug(nome);
}

/**
 * Resolve o perfil de acesso a partir de sessão / identidade estável.
 * IDs estáveis (matrícula/uidKey/nome) têm prioridade.
 * Alex e Euclecio recebem treinamento_produtos.
 */
export function resolverPerfil({ nome, matricula, perfil, uidKey } = {}) {
  const mat = String(matricula || matriculaDoUsuario(nome) || "").trim().toUpperCase();
  const key = String(uidKey || uidKeyDoUsuario(nome) || "").toLowerCase();
  const nomeKey = slug(nome);
  const p = String(perfil || "").trim().toLowerCase();

  if (PERFIL_POR_MATRICULA[mat]) return PERFIL_POR_MATRICULA[mat];
  if (PERFIL_POR_UIDKEY[key]) return PERFIL_POR_UIDKEY[key];
  if (NOMES_MENU_PRODUTOS.has(nomeKey)) return PERFIL_TREINAMENTO_PRODUTOS;
  if (NOMES_MENU_LOGISTICA.has(nomeKey)) return PERFIL_LOGISTICA;

  if (p === "alex_produtos" || p === PERFIL_TREINAMENTO_PRODUTOS) {
    // Sem identidade de produtos → analista
    return PERFIL_ANALISTA;
  }
  if (p === PERFIL_LOGISTICA) return PERFIL_LOGISTICA;
  if (p === PERFIL_ADMIN) return PERFIL_ADMIN;
  if (p === PERFIL_ANALISTA) return PERFIL_ANALISTA;

  return PERFIL_ANALISTA;
}

export function perfilDaSessao() {
  const s = getSession() || {};
  const u = getSessionUser();
  return resolverPerfil({
    nome: u?.nome || s.nome || s.usuario,
    matricula: s.matricula,
    perfil: s.perfil || u?.perfil,
    uidKey: s.uidKey
  });
}

export function isPerfilTreinamentoProdutos(perfil) {
  return String(perfil || perfilDaSessao()).toLowerCase() === PERFIL_TREINAMENTO_PRODUTOS;
}

export function isAdmin(perfil) {
  return String(perfil || perfilDaSessao()).toLowerCase() === PERFIL_ADMIN;
}

export function isAnalista(perfil) {
  return String(perfil || perfilDaSessao()).toLowerCase() === PERFIL_ANALISTA;
}

export function isLogistica(perfil) {
  return String(perfil || perfilDaSessao()).toLowerCase() === PERFIL_LOGISTICA;
}

/** Destino do menu após login / navegação */
export function destinoMenuPorPerfil(perfil, { fromRoot = false, encoded = true } = {}) {
  const p = String(perfil || "").toLowerCase();
  let file = "menu.html";
  if (p === PERFIL_ADMIN) file = "menuadm.html";
  if (p === PERFIL_TREINAMENTO_PRODUTOS || p === "alex_produtos") file = "menu_alex.html";
  if (p === PERFIL_LOGISTICA) file = "menu_logistica.html";

  if (fromRoot) {
    const folder = encoded ? "html%20menus" : "html menus";
    return `${folder}/${file}`;
  }
  return file;
}

/** Resolve caminho do menu a partir da sessão (páginas em html usuarios). */
export function resolveMenuPathFromSession() {
  const s = getSession() || {};
  const nome = String(s.nome || s.usuario || "").trim();
  const perfil = resolverPerfil({
    nome,
    matricula: s.matricula,
    perfil: s.perfil,
    uidKey: s.uidKey
  });
  return `../html menus/${destinoMenuPorPerfil(perfil, { fromRoot: false })}`;
}

export function caminhoMenuAtual({ fromRoot = false, encoded = true } = {}) {
  return destinoMenuPorPerfil(perfilDaSessao(), { fromRoot, encoded });
}

export function caminhoLogin({ fromRoot = false } = {}) {
  return fromRoot ? "index.html" : "../index.html";
}

/** Monta payload de sessão no login */
export function montarSessaoLogin(usuario, { perfilOverride } = {}) {
  const matricula = matriculaDoUsuario(usuario);
  const uidKey = uidKeyDoUsuario(usuario);
  const perfil = resolverPerfil({
    nome: usuario,
    matricula,
    uidKey,
    perfil: perfilOverride
  });

  return {
    nome: usuario,
    matricula,
    uidKey,
    perfil,
    tipoUsuario: perfil,
    loginAt: Date.now(),
    nascimentoOk: false
  };
}

export function salvarSessao(sessao) {
  localStorage.setItem("user_session", JSON.stringify(sessao));
  if (sessao?.nome) localStorage.setItem("usuarioLogado", sessao.nome);
}

export function limparSessao() {
  localStorage.removeItem("user_session");
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("analistaLogado");
  localStorage.removeItem("usuarioSelecionado");
}

export function obterUsuarioLogado() {
  const u = getSessionUser();
  if (!u?.nome) return null;
  const s = getSession() || {};
  const perfil = resolverPerfil({
    nome: u.nome,
    matricula: s.matricula,
    perfil: s.perfil || u.perfil,
    uidKey: s.uidKey
  });
  return {
    nome: u.nome,
    matricula: s.matricula || matriculaDoUsuario(u.nome),
    uidKey: s.uidKey || uidKeyDoUsuario(u.nome),
    perfil,
    nascimentoOk: Boolean(u.nascimentoOk),
    dataNascimento: u.dataNascimento || null,
    isAdmin: perfil === PERFIL_ADMIN,
    isTreinamentoProdutos: perfil === PERFIL_TREINAMENTO_PRODUTOS,
    isLogistica: perfil === PERFIL_LOGISTICA
  };
}

/** Verifica se a URL atual é rota exclusiva de SV */
export function rotaAtualEhExclusivaSV(pathname = window.location.pathname) {
  const path = decodeURIComponent(String(pathname || "")).toLowerCase();
  return ROTAS_EXCLUSIVAS_SV.some((rota) => path.endsWith(rota.toLowerCase()) || path.includes(`/${rota.toLowerCase()}`));
}

/**
 * Protege a página atual:
 * - sem sessão → login
 * - perfil treinamento_produtos em rota SV → menu exclusivo
 * - páginas do menu exclusivo exigem o perfil (ou admin)
 */
export function protegerPagina({
  exigirPerfis = null,
  bloquearSvParaAlex = true,
  fromRoot = false,
  redirectLogin = true
} = {}) {
  let user = obterUsuarioLogado();
  if (!user) {
    if (redirectLogin) {
      window.location.replace(caminhoLogin({ fromRoot }));
    }
    return null;
  }

  // Garante perfil correto para Alex/Euclecio com sessão antiga
  if (isIdentidadeMenuProdutos(user) && user.perfil !== PERFIL_TREINAMENTO_PRODUTOS) {
    localStorage.setItem("user_session", JSON.stringify(normalizarSessaoMenuProdutos(getSession() || {}, user.nome)));
    user = obterUsuarioLogado();
  }

  // Garante perfil logística (Ercules)
  if (isIdentidadeLogistica(user) && user.perfil !== PERFIL_LOGISTICA) {
    localStorage.setItem("user_session", JSON.stringify(normalizarSessaoLogistica(getSession() || {}, user.nome)));
    user = obterUsuarioLogado();
  }

  if (bloquearSvParaAlex && user.isTreinamentoProdutos && rotaAtualEhExclusivaSV()) {
    const dest = destinoMenuPorPerfil(PERFIL_TREINAMENTO_PRODUTOS, {
      fromRoot: pathEstaEmMenus(),
      encoded: false
    });
    const prefix = pathEstaEmMenus() ? "" : pathEstaEmUsuariosAlex() ? "../../html menus/" : pathEstaEmUsuarios() ? "../html menus/" : "html menus/";
    window.location.replace(`${prefix}${dest.split("/").pop()}?v=20260720g`);
    return null;
  }

  // Logística: só rotas permitidas
  if (user.isLogistica && !rotaAtualPermitidaLogistica()) {
    const prefix = pathEstaEmMenus() ? "" : pathEstaEmUsuariosAlex() ? "../../html menus/" : pathEstaEmUsuarios() ? "../html menus/" : "html menus/";
    window.location.replace(`${prefix}menu_logistica.html?v=20261008a`);
    return null;
  }

  if (Array.isArray(exigirPerfis) && exigirPerfis.length) {
    const ok = exigirPerfis.map((x) => String(x).toLowerCase()).includes(String(user.perfil).toLowerCase());
    if (!ok && !user.isAdmin && !user.isTreinamentoProdutos) {
      const dest = destinoMenuPorPerfil(user.perfil, { fromRoot: false, encoded: false });
      const prefix = pathEstaEmMenus() ? "" : pathEstaEmUsuariosAlex() ? "../../html menus/" : pathEstaEmUsuarios() ? "../html menus/" : "html menus/";
      window.location.replace(`${prefix}${dest}`);
      return null;
    }
  }

  return user;
}

export function rotaAtualPermitidaLogistica(pathname = window.location.pathname) {
  const path = decodeURIComponent(String(pathname || "")).toLowerCase();
  return ROTAS_LOGISTICA_PERMITIDAS.some(
    (rota) => path.endsWith(rota.toLowerCase()) || path.includes(`/${rota.toLowerCase()}`)
  );
}

function pathEstaEmMenus() {
  return /html\s*menus/i.test(decodeURIComponent(window.location.pathname));
}

function pathEstaEmUsuarios() {
  return /html\s*usuarios/i.test(decodeURIComponent(window.location.pathname));
}

function pathEstaEmUsuariosAlex() {
  return /html\s*usuarios\/alex/i.test(decodeURIComponent(window.location.pathname));
}

/** Permissões do perfil treinamento_produtos */
export function podeAcessar(recurso, user = obterUsuarioLogado()) {
  if (!user) return false;
  if (user.isAdmin) return true;

  const regrasAlex = {
    menu_alex: true,
    visao_geral: true,
    cadastrar_treinamento: true,
    editar_proprios_treinamentos: true,
    excluir_proprios_treinamentos: true,
    visualizar_proprios_treinamentos: true,
    criar_analise: true,
    editar_analise: true,
    fechamento_mensal: true,
    agenda: true,
    aniversariantes: true,
    materiais: true,
    perfil: true,
    alterar_senha: true,
    dashboard_sv: false,
    ranking_sv: false,
    resultados_sv: false,
    admin_permissoes: false,
    admin_config: false,
    alterar_responsavel_treinamento: false
  };

  if (user.isTreinamentoProdutos) {
    return Boolean(regrasAlex[recurso]);
  }

  if (user.isLogistica || user.perfil === PERFIL_LOGISTICA) {
    const regrasLogistica = {
      menu_logistica: true,
      agenda_criar: true,
      agenda: true,
      treinamentos: true,
      biblioteca: true,
      boas_praticas: true,
      entregas: true,
      dashboard_sv: false,
      relatorio_visita: false,
      resultados_sv: false,
      matinal: false,
      aprendizado: false,
      links: false,
      menu_alex: false,
      admin_permissoes: false,
      admin_config: false
    };
    return Boolean(regrasLogistica[recurso]);
  }

  // Analistas: recursos gerais do portal (sem menu Alex exclusivo)
  if (user.perfil === PERFIL_ANALISTA) {
    const bloqueados = ["menu_alex", "menu_logistica", "admin_permissoes", "admin_config"];
    return !bloqueados.includes(recurso);
  }

  return false;
}

export function podeEditarResponsavel(user = obterUsuarioLogado()) {
  return Boolean(user?.isAdmin);
}

export function podeVerTodosTreinamentos(user = obterUsuarioLogado()) {
  return Boolean(user?.isAdmin);
}

/** Atualiza perfil na sessão (ex.: migração) sem perder outros campos */
export function garantirPerfilNaSessao() {
  const s = getSession();
  if (!s) return null;
  const perfil = resolverPerfil({
    nome: s.nome || s.usuario,
    matricula: s.matricula,
    perfil: s.perfil,
    uidKey: s.uidKey
  });
  if (s.perfil !== perfil || !s.matricula || !s.uidKey) {
    const next = {
      ...s,
      perfil,
      tipoUsuario: perfil,
      matricula: s.matricula || matriculaDoUsuario(s.nome || s.usuario),
      uidKey: s.uidKey || uidKeyDoUsuario(s.nome || s.usuario)
    };
    localStorage.setItem("user_session", JSON.stringify(next));
    return next;
  }
  return s;
}

export { getSession, getSessionUser, slug, safeParse };
