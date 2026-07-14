/**
 * Perfil / aniversário — helpers compartilhados (Firestore collection "perfis").
 * Document id = slug(nome). Campo canônico: dataNascimento (YYYY-MM-DD).
 */

export const PERFIS_COLLECTION = "perfis";

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

export function getSessionUser() {
  const raw = localStorage.getItem("user_session");
  if (raw) {
    const s = safeParse(raw);
    if (s?.nome) {
      return {
        nome: String(s.nome).trim(),
        perfil: String(s.perfil || "").trim() || "analista"
      };
    }
    if (s?.usuario) {
      return {
        nome: String(s.usuario).trim(),
        perfil: String(s.perfil || "").trim() || "analista"
      };
    }
  }

  const nome = (localStorage.getItem("usuarioLogado") || "").trim();
  if (!nome) return null;
  return { nome, perfil: "analista" };
}

export function destinoMenuPorPerfil(perfil) {
  return String(perfil || "").toLowerCase() === "admin"
    ? "menuadm.html"
    : "menu.html";
}

/** Aceita DD/MM/AAAA ou AAAA-MM-DD. Retorna null se inválido. */
export function parseDataNascimento(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  let dia;
  let mes;
  let ano;

  const br = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (br) {
    dia = Number(br[1]);
    mes = Number(br[2]);
    ano = Number(br[3]);
  } else if (iso) {
    ano = Number(iso[1]);
    mes = Number(iso[2]);
    dia = Number(iso[3]);
  } else {
    return null;
  }

  if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(ano)) {
    return null;
  }

  if (ano < 1920 || ano > new Date().getFullYear()) return null;
  if (mes < 1 || mes > 12) return null;
  if (dia < 1 || dia > 31) return null;

  const dt = new Date(ano, mes - 1, dia);
  if (
    dt.getFullYear() !== ano ||
    dt.getMonth() !== mes - 1 ||
    dt.getDate() !== dia
  ) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (dt > hoje) return null;

  const dataNascimento = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const dataNascimentoExibida = `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;

  return {
    dia,
    mes,
    ano,
    dataNascimento,
    dataNascimentoExibida
  };
}

export function formatarDataBR(iso) {
  const parsed = parseDataNascimento(iso);
  return parsed ? parsed.dataNascimentoExibida : "";
}

export function partesDataISO(iso) {
  const parsed = parseDataNascimento(iso);
  if (!parsed) return null;
  return { dia: parsed.dia, mes: parsed.mes, ano: parsed.ano };
}

/** Idade que a pessoa completa (ou completou) no aniversário do ano de referência. */
export function idadeQueCompleta(iso, anoRef = new Date().getFullYear()) {
  const p = partesDataISO(iso);
  if (!p) return null;
  return anoRef - p.ano;
}

export function isAniversarioNoMes(iso, mesAtual = new Date().getMonth() + 1) {
  const p = partesDataISO(iso);
  if (!p) return false;
  return p.mes === Number(mesAtual);
}

export function nomeMes(mes) {
  const nomes = [
    "",
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];
  return nomes[Number(mes)] || "";
}

export function mensagemAniversario(nome) {
  const primeiro = String(nome || "").trim().split(/\s+/)[0] || "colega";
  return `Feliz aniversário, ${primeiro}! Desejamos um mês especial para você.`;
}

export async function obterPerfil(db, { doc, getDoc }, nome) {
  const id = slug(nome);
  if (!id) return null;
  const snap = await getDoc(doc(db, PERFIS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function salvarDataNascimento(db, { doc, setDoc, serverTimestamp }, nome, parsed, extras = {}) {
  const id = slug(nome);
  if (!id || !parsed) throw new Error("Dados inválidos para salvar data de nascimento.");

  const payload = {
    nome: String(nome).trim(),
    uidKey: id,
    dataNascimento: parsed.dataNascimento,
    dataNascimentoExibida: parsed.dataNascimentoExibida,
    diaNascimento: parsed.dia,
    mesNascimento: parsed.mes,
    anoNascimento: parsed.ano,
    atualizadoEm: serverTimestamp(),
    ...extras
  };

  await setDoc(doc(db, PERFIS_COLLECTION, id), payload, { merge: true });
  return payload;
}

export async function listarAniversariantesDoMes(db, { collection, getDocs }, mes = new Date().getMonth() + 1) {
  const snap = await getDocs(collection(db, PERFIS_COLLECTION));
  const mesNum = Number(mes);
  const anoAtual = new Date().getFullYear();
  const lista = [];

  snap.forEach((item) => {
    const data = item.data() || {};
    const iso = data.dataNascimento || "";
    const partes = partesDataISO(iso);
    if (!partes || partes.mes !== mesNum) return;

    lista.push({
      id: item.id,
      nome: data.nome || item.id,
      dia: partes.dia,
      mes: partes.mes,
      ano: partes.ano,
      dataNascimento: iso,
      dataNascimentoExibida: data.dataNascimentoExibida || formatarDataBR(iso),
      idadeQueCompleta: idadeQueCompleta(iso, anoAtual),
      perfil: data.perfil || null
    });
  });

  lista.sort((a, b) => {
    if (a.dia !== b.dia) return a.dia - b.dia;
    return String(a.nome).localeCompare(String(b.nome), "pt-BR");
  });

  return lista;
}

export function temDataNascimento(perfil) {
  if (!perfil) return false;
  return Boolean(parseDataNascimento(perfil.dataNascimento || perfil.dataNascimentoExibida));
}
