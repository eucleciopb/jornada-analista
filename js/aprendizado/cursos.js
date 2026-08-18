/**
 * Catálogo de cursos da área Aprendizado.
 * Estrutura pronta para novos conteúdos: basta incluir um item em CURSOS
 * e o respectivo arquivo de conteúdo.
 */

export const CURSOS = [
  {
    id: "integracao-atv",
    titulo: "Integração ATV",
    subtitulo: "Tudo o que você precisa saber para arrebentar na sua área!",
    descricao: "Uma jornada completa para o novo Analista de Treinamento de Vendas entender a operação comercial, acompanhar os principais processos, interpretar indicadores e desenvolver a equipe em campo.",
    selo: "Integração",
    capa: "./capa-integracao-atv.svg",
    player: "./curso.html?curso=integracao-atv",
    conteudoUrl: "./conteudo/integracao-atv.js"
  }
];

export function getCursoMeta(id) {
  return CURSOS.find((c) => c.id === id) || null;
}

export async function loadCursoConteudo(id) {
  const meta = getCursoMeta(id);
  if (!meta) throw new Error("Curso não encontrado.");
  if (id === "integracao-atv") {
    return import("./conteudo/integracao-atv.js");
  }
  throw new Error("Conteúdo do curso ainda não foi publicado.");
}

export function flattenAulas(curso) {
  const aulas = [];
  for (const modulo of curso.modulos || []) {
    for (const aula of modulo.aulas || []) {
      aulas.push({
        ...aula,
        moduleId: modulo.id,
        moduleTitulo: modulo.titulo,
        moduleNumero: modulo.numero
      });
    }
  }
  return aulas;
}

export function isLessonUnlocked(aulas, index, completed) {
  if (index <= 0) return true;
  const prev = aulas[index - 1];
  return Boolean(prev && completed.includes(prev.id));
}
