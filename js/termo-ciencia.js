/**
 * Termo de Ciência — helpers compartilhados.
 *
 * Coleção: apuracoes_treinamentos
 *  - tipo "termo_ciencia" → documento do termo ativo/histórico
 *  - tipo "termo_ciencia_resposta" → resposta por usuário
 */

export const TERMO_COL = "apuracoes_treinamentos";
export const TIPO_TERMO = "termo_ciencia";
export const TIPO_RESPOSTA = "termo_ciencia_resposta";

export const STATUS_CIENTE = "ciente";
export const STATUS_PRECISA_TREINAMENTO = "precisa_treinamento";

export function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function docIdResposta(termoId, nome) {
  return `termo_ciencia_resp_${termoId}_${slug(nome)}`;
}

function makeId(prefix) {
  const suffix = globalThis.crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${suffix}`;
}

/**
 * Busca o termo ativo (mais recente se houver mais de um).
 */
export async function buscarTermoAtivo(db, { collection, getDocs, query, where }) {
  if (!db || typeof getDocs !== "function") return null;

  try {
    const q = query(
      collection(db, TERMO_COL),
      where("tipo", "==", TIPO_TERMO),
      where("ativo", "==", true)
    );
    const snap = await getDocs(q);
    let melhor = null;
    snap.forEach((item) => {
      const data = { id: item.id, ...item.data() };
      if (!melhor) {
        melhor = data;
        return;
      }
      const a = Number(data.atualizadoEmMs || data.criadoEmMs || 0);
      const b = Number(melhor.atualizadoEmMs || melhor.criadoEmMs || 0);
      if (a >= b) melhor = data;
    });
    return melhor;
  } catch (err) {
    console.warn("Falha ao buscar termo ativo:", err);
    return null;
  }
}

/**
 * Lista todos os termos (ativos e históricos).
 */
export async function listarTermos(db, { collection, getDocs, query, where }) {
  const lista = [];
  try {
    const q = query(collection(db, TERMO_COL), where("tipo", "==", TIPO_TERMO));
    const snap = await getDocs(q);
    snap.forEach((item) => lista.push({ id: item.id, ...item.data() }));
  } catch (err) {
    console.warn("Falha ao listar termos:", err);
  }
  lista.sort(
    (a, b) =>
      Number(b.atualizadoEmMs || b.criadoEmMs || 0) -
      Number(a.atualizadoEmMs || a.criadoEmMs || 0)
  );
  return lista;
}

export async function salvarTermo(
  db,
  { doc, setDoc, getDocs, collection, query, where },
  { id, titulo, texto, ativo, criadoPor }
) {
  const agora = Date.now();
  const termoId = id || makeId("termo_ciencia");
  const payload = {
    tipo: TIPO_TERMO,
    titulo: String(titulo || "").trim(),
    texto: String(texto || "").trim(),
    ativo: Boolean(ativo),
    criadoPor: String(criadoPor || "").trim() || null,
    atualizadoEm: new Date().toISOString(),
    atualizadoEmMs: agora
  };

  if (!id) {
    payload.criadoEm = new Date().toISOString();
    payload.criadoEmMs = agora;
  }

  // Se ativando, desativa os demais
  if (payload.ativo && typeof getDocs === "function") {
    try {
      const q = query(
        collection(db, TERMO_COL),
        where("tipo", "==", TIPO_TERMO),
        where("ativo", "==", true)
      );
      const snap = await getDocs(q);
      const ops = [];
      snap.forEach((item) => {
        if (item.id === termoId) return;
        ops.push(
          setDoc(
            doc(db, TERMO_COL, item.id),
            {
              ativo: false,
              atualizadoEm: new Date().toISOString(),
              atualizadoEmMs: Date.now()
            },
            { merge: true }
          )
        );
      });
      await Promise.all(ops);
    } catch (err) {
      console.warn("Falha ao desativar termos anteriores:", err);
    }
  }

  await setDoc(doc(db, TERMO_COL, termoId), payload, { merge: true });
  return { id: termoId, ...payload };
}

export async function buscarRespostaUsuario(
  db,
  { doc, getDoc },
  termoId,
  nome
) {
  if (!termoId || !nome) return null;
  try {
    const ref = doc(db, TERMO_COL, docIdResposta(termoId, nome));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() };
    if (data.pendenteReenvio) return null;
    if (
      data.status !== STATUS_CIENTE &&
      data.status !== STATUS_PRECISA_TREINAMENTO
    ) {
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Falha ao buscar resposta do termo:", err);
    return null;
  }
}

export async function salvarResposta(
  db,
  { doc, setDoc },
  { termoId, nome, status, perfil }
) {
  const uidKey = slug(nome);
  const id = docIdResposta(termoId, nome);
  const agora = Date.now();
  const payload = {
    tipo: TIPO_RESPOSTA,
    termoId,
    nome: String(nome).trim(),
    uidKey,
    perfil: perfil || null,
    status,
    pendenteReenvio: false,
    respondidoEm: new Date().toISOString(),
    respondidoEmMs: agora,
    atualizadoEm: new Date().toISOString(),
    atualizadoEmMs: agora
  };
  await setDoc(doc(db, TERMO_COL, id), payload, { merge: true });
  return { id, ...payload };
}

/**
 * Marca resposta para reenvio — usuário verá o termo novamente no próximo acesso.
 */
export async function marcarReenvio(db, { doc, setDoc, getDoc }, respostaId) {
  const ref = doc(db, TERMO_COL, respostaId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Resposta não encontrada.");
  const agora = Date.now();
  await setDoc(
    ref,
    {
      pendenteReenvio: true,
      statusAnterior: snap.data()?.status || null,
      reenviadoEm: new Date().toISOString(),
      reenviadoEmMs: agora,
      atualizadoEm: new Date().toISOString(),
      atualizadoEmMs: agora
    },
    { merge: true }
  );
}

export async function listarRespostasDoTermo(
  db,
  { collection, getDocs, query, where },
  termoId
) {
  const lista = [];
  if (!termoId) return lista;
  try {
    const q = query(
      collection(db, TERMO_COL),
      where("tipo", "==", TIPO_RESPOSTA),
      where("termoId", "==", termoId)
    );
    const snap = await getDocs(q);
    snap.forEach((item) => {
      const data = { id: item.id, ...item.data() };
      if (data.pendenteReenvio) return;
      lista.push(data);
    });
  } catch (err) {
    console.warn("Falha ao listar respostas:", err);
  }
  lista.sort((a, b) =>
    String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR")
  );
  return lista;
}

/**
 * Verifica se o usuário precisa assinar o termo ativo.
 * Retorna o termo se pendente, ou null se liberado.
 */
export async function termoPendenteParaUsuario(db, fs, nome) {
  const termo = await buscarTermoAtivo(db, fs);
  if (!termo?.id || !termo.texto) return null;
  const resposta = await buscarRespostaUsuario(db, fs, termo.id, nome);
  if (resposta) return null;
  return termo;
}
