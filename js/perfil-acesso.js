/**
 * Perfil e regras de acesso do portal.
 * Identificação por perfil/matrícula/uidKey — não apenas pelo nome exibido.
 */

import { getSession, getSessionUser, slug, safeParse } from "./aniversario.js";

/** Perfis conhecidos */
export const PERFIL_ANALISTA = "analista";
export const PERFIL_ADMIN = "admin";
export const PERFIL_TREINAMENTO_PRODUTOS = "treinamento_produtos";

/**
 * Mapa estável: matrícula → perfil.
 * Preferir matrícula/uidKey a nome, pois o nome pode mudar.
 */
export const PERFIL_POR_MATRICULA = {
  A70: PERFIL_TREINAMENTO_PRODUTOS, // Alex (senha/matrícula oficial)
  ALEX: PERFIL_TREINAMENTO_PRODUTOS // sessão antiga gravava matricula = nome
};

/** uidKeys com perfil exclusivo (fallback) */
export const PERFIL_POR_UIDKEY = {
  alex: PERFIL_TREINAMENTO_PRODUTOS
};

/** Nomes canônicos (fallback; não é a única regra) */
export const PERFIL_POR_NOME = {
  alex: PERFIL_TREINAMENTO_PRODUTOS
};

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
  Andre: "A84"
};

/** Rotas / páginas exclusivas de gestão por SV (bloquear para treinamento_produtos) */
export const ROTAS_EXCLUSIVAS_SV = [
  "menu.html",
  "resultados.html",
  "avaliacao-matinal-geral.html",
  "relatorio_mgr.html",
  "acompanhamento-entregas.html",
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
 * IDs estáveis (matrícula/uidKey/nome) têm prioridade sobre perfil "analista" antigo.
 */
export function resolverPerfil({ nome, matricula, perfil, uidKey } = {}) {
  const mat = String(matricula || matriculaDoUsuario(nome) || "").trim().toUpperCase();
  const key = String(uidKey || uidKeyDoUsuario(nome) || "").toLowerCase();
  const nomeKey = slug(nome);
  const p = String(perfil || "").trim().toLowerCase();

  // Identidade estável primeiro (corrige sessão antiga com perfil=analista)
  if (PERFIL_POR_MATRICULA[mat]) return PERFIL_POR_MATRICULA[mat];
  if (PERFIL_POR_UIDKEY[key]) return PERFIL_POR_UIDKEY[key];
  if (PERFIL_POR_NOME[nomeKey]) return PERFIL_POR_NOME[nomeKey];

  if (p === "alex_produtos" || p === PERFIL_TREINAMENTO_PRODUTOS) return PERFIL_TREINAMENTO_PRODUTOS;
  if (p === PERFIL_ADMIN) return PERFIL_ADMIN;
  if (p === PERFIL_ANALISTA) return PERFIL_ANALISTA;

  return PERFIL_ANALISTA;
}

/** Detecta Alex mesmo com sessão antiga */
export function isIdentidadeAlex({ nome, matricula, perfil, uidKey } = {}) {
  return resolverPerfil({ nome, matricula, perfil, uidKey }) === PERFIL_TREINAMENTO_PRODUTOS;
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

/** Destino do menu após login / navegação */
export function destinoMenuPorPerfil(perfil, { fromRoot = false, encoded = true } = {}) {
  const p = String(perfil || "").toLowerCase();
  let file = "menu.html";
  if (p === PERFIL_ADMIN) file = "menuadm.html";
  if (p === PERFIL_TREINAMENTO_PRODUTOS || p === "alex_produtos") file = "menu_alex.html";

  if (fromRoot) {
    const folder = encoded ? "html%20menus" : "html menus";
    return `${folder}/${file}`;
  }
  return file;
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
    isTreinamentoProdutos: perfil === PERFIL_TREINAMENTO_PRODUTOS
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
 * - identidade Alex em rota SV → menu Alex
 * - páginas Alex: se for Alex com sessão antiga, corrige perfil (não joga de volta ao menu.html)
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

  // Corrige sessão antiga do Alex (perfil ainda "analista")
  if (isIdentidadeAlex(user) && user.perfil !== PERFIL_TREINAMENTO_PRODUTOS) {
    const s = getSession() || {};
    const next = {
      ...s,
      nome: user.nome,
      matricula: "A70",
      uidKey: "alex",
      perfil: PERFIL_TREINAMENTO_PRODUTOS,
      tipoUsuario: PERFIL_TREINAMENTO_PRODUTOS
    };
    localStorage.setItem("user_session", JSON.stringify(next));
    user = obterUsuarioLogado();
  }

  if (bloquearSvParaAlex && user?.isTreinamentoProdutos && rotaAtualEhExclusivaSV()) {
    const dest = destinoMenuPorPerfil(PERFIL_TREINAMENTO_PRODUTOS, {
      fromRoot: pathEstaEmMenus(),
      encoded: false
    });
    const prefix = pathEstaEmMenus() ? "" : pathEstaEmUsuariosAlex() ? "../../html menus/" : pathEstaEmUsuarios() ? "../html menus/" : "html menus/";
    window.location.replace(`${prefix}${dest.split("/").pop()}?v=20260720c`);
    return null;
  }

  if (Array.isArray(exigirPerfis) && exigirPerfis.length) {
    const ok = exigirPerfis.map((x) => String(x).toLowerCase()).includes(String(user.perfil).toLowerCase());
    // Alex nunca é expulso do próprio menu por causa de sessão antiga
    if (!ok && !user.isAdmin && !user.isTreinamentoProdutos) {
      const dest = destinoMenuPorPerfil(user.perfil, { fromRoot: false, encoded: false });
      const prefix = pathEstaEmMenus() ? "" : pathEstaEmUsuariosAlex() ? "../../html menus/" : pathEstaEmUsuarios() ? "../html menus/" : "html menus/";
      window.location.replace(`${prefix}${dest}`);
      return null;
    }
  }

  return user;
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

  // Analistas: recursos gerais do portal (sem menu Alex exclusivo)
  if (user.perfil === PERFIL_ANALISTA) {
    const bloqueados = ["menu_alex", "admin_permissoes", "admin_config"];
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
