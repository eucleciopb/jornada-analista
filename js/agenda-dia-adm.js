import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function brToday() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

function dayRangeTimestamps() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    startTS: Timestamp.fromDate(start),
    endTS: Timestamp.fromDate(end),
  };
}

function showError(msg) {
  $("errorBox").style.display = "block";
  $("errorBox").textContent = msg;
}

function clearError() {
  $("errorBox").style.display = "none";
  $("errorBox").textContent = "";
}

function pickStatus(a) {
  return a?.tipoDia || a?.status || a?.tipo || "Registrado";
}

function pickLocal(a) {
  return a?.cd || a?.local || a?.cdNome || a?.nomeCD || "-";
}

async function fetchAgendaDoDia(iso, br) {
  // Vamos tentar 3 jeitos: data string ISO, data string BR, e Timestamp interval
  const map = new Map();

  // 1) data == ISO
  try {
    const snapISO = await getDocs(
      query(collection(db, "agenda_dias"), where("data", "==", iso))
    );
    snapISO.forEach((doc) => {
      const a = doc.data();
      if (a?.uid) map.set(a.uid, a);
    });
  } catch (e) {
    console.warn("[agenda-dia-adm] Falha query ISO (data string):", e);
  }

  // 2) data == BR
  try {
    const snapBR = await getDocs(
      query(collection(db, "agenda_dias"), where("data", "==", br))
    );
    snapBR.forEach((doc) => {
      const a = doc.data();
      if (a?.uid) map.set(a.uid, a);
    });
  } catch (e) {
    console.warn("[agenda-dia-adm] Falha query BR (data string):", e);
  }

  // 3) data Timestamp no intervalo do dia
  if (map.size === 0) {
    const { startTS, endTS } = dayRangeTimestamps();

    // tenta campo "data" como Timestamp
    try {
      const snapTS = await getDocs(
        query(
          collection(db, "agenda_dias"),
          where("data", ">=", startTS),
          where("data", "<=", endTS)
        )
      );
      snapTS.forEach((doc) => {
        const a = doc.data();
        if (a?.uid) map.set(a.uid, a);
      });
    } catch (e) {
      console.warn("[agenda-dia-adm] Falha query Timestamp em 'data':", e);
      // tenta createdAt (fallback)
      try {
        const snapCreated = await getDocs(
          query(
            collection(db, "agenda_dias"),
            where("createdAt", ">=", startTS),
            where("createdAt", "<=", endTS)
          )
        );
        snapCreated.forEach((doc) => {
          const a = doc.data();
          if (a?.uid) map.set(a.uid, a);
        });
      } catch (e2) {
        console.warn("[agenda-dia-adm] Falha query Timestamp em 'createdAt':", e2);
      }
    }
  }

  return map;
}

async function fetchUsuarios() {
  const usersSnap = await getDocs(collection(db, "usuarios"));
  const users = [];

  usersSnap.forEach((doc) => {
    const u = doc.data();
    // mostra todos ativos (se não existir 'ativo', considera ativo)
    if (u?.ativo === false) return;

    // nome pode estar em "nome" ou "primeiroNome"
    const nome = u?.nome || u?.primeiroNome || u?.displayName || "(Sem nome)";
    users.push({ uid: doc.id, nome });
  });

  users.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return users;
}

async function load() {
  clearError();

  const iso = isoToday();
  const br = brToday();

  $("todayLabel").textContent = `Data: ${iso} (${br})`;
  $("hint").textContent = "Carregando usuários e agenda do dia…";
  $("tbody").innerHTML = `<tr><td colspan="3">Carregando…</td></tr>`;

  try {
    const users = await fetchUsuarios();
    const agendaMap = await fetchAgendaDoDia(iso, br);

    if (users.length === 0) {
      $("hint").textContent = "";
      showError("Nenhum usuário encontrado na coleção 'usuarios'. Para mostrar pendentes, precisa cadastrar todos lá.");
      $("tbody").innerHTML = `<tr><td colspan="3">Sem usuários.</td></tr>`;
      return;
    }

    let ok = 0;
    let pend = 0;

    const rows = users.map((u) => {
      const a = agendaMap.get(u.uid);

      if (a) ok++;
      else pend++;

      const status = a ? pickStatus(a) : "Sem lançamento";
      const local = a ? pickLocal(a) : "-";

      return `
        <tr>
          <td><b>${u.nome}</b></td>
          <td class="${a ? "ok" : "pend"}">${status}</td>
          <td>${local}</td>
        </tr>
      `;
    }).join("");

    $("tbody").innerHTML = rows;
    $("kpiUsers").textContent = String(users.length);
    $("kpiOk").textContent = String(ok);
    $("kpiPend").textContent = String(pend);

    $("hint").textContent = `OK. Registros encontrados hoje: ${agendaMap.size} (coleção: agenda_dias)`;

  } catch (err) {
    console.error(err);
    $("hint").textContent = "";
    showError(`Erro ao carregar: ${err?.message || err}`);

    $("tbody").innerHTML = `<tr><td colspan="3">Falha ao carregar.</td></tr>`;
    $("kpiUsers").textContent = "0";
    $("kpiOk").textContent = "0";
    $("kpiPend").textContent = "0";
  }
}

$("btnReload").addEventListener("click", load);
load();
