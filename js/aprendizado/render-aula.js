import { escapeHtml } from "./usuario.js";

function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Embaralha opções de forma estável por aula/atividade (mesma ordem ao recarregar). */
export function shuffleOptions(opcoes, seedKey) {
  const rand = seededRandom(hashSeed(String(seedKey)));
  const items = (opcoes || []).map((text, originalIndex) => ({ text, originalIndex }));
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function shuffleStrings(items, seedKey) {
  const rand = seededRandom(hashSeed(String(seedKey)));
  const arr = [...(items || [])];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function displayIndexForCorrect(shuffled, correctOriginalIndex) {
  return shuffled.findIndex((item) => item.originalIndex === correctOriginalIndex);
}

function quizShuffle(aula) {
  const shuffled = shuffleOptions(aula.quiz.opcoes, `${aula.id}:quiz`);
  return {
    shuffled,
    correctDisplayIndex: displayIndexForCorrect(shuffled, aula.quiz.correta)
  };
}

function evalShuffle(aula, pIdx, pergunta) {
  const shuffled = shuffleOptions(pergunta.opcoes, `${aula.id}:avaliacao:${pIdx}`);
  return {
    shuffled,
    correctDisplayIndex: displayIndexForCorrect(shuffled, pergunta.correta)
  };
}

function list(items = []) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function checks(items = []) {
  return `<ul class="check-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function visuals(items = []) {
  if (!items.length) return "";
  return `<div class="visual-row">${items.map((item) => `
    <article class="visual-card">
      <strong>${escapeHtml(item.titulo)}</strong>
      <p>${escapeHtml(item.texto)}</p>
    </article>
  `).join("")}</div>`;
}

function bands(items = []) {
  if (!items.length) return "";
  return `<div class="bands">${items.map((item) => `
    <div class="band ${item.tone || "info"}">${escapeHtml(item.texto)}</div>
  `).join("")}</div>`;
}

export function renderAula(aula) {
  const parts = [];

  parts.push(`
    <header class="lesson-title">
      <small>Módulo ${escapeHtml(aula.moduleNumero)} · ${escapeHtml(aula.moduleTitulo)}</small>
      <h2>${escapeHtml(aula.titulo)}</h2>
    </header>
  `);

  if (aula.objetivo) {
    parts.push(`
      <div class="objective-box">
        <span>Objetivo da aula</span>
        <p>${escapeHtml(aula.objetivo)}</p>
      </div>
    `);
  }

  if (aula.lead) {
    parts.push(`<section class="learn-block"><p>${escapeHtml(aula.lead)}</p></section>`);
  }

  if (aula.visuais?.length) {
    parts.push(`<section class="learn-block">${visuals(aula.visuais)}</section>`);
  }

  if (aula.formula) {
    parts.push(`
      <section class="kpi-formula">
        <strong>${escapeHtml(aula.formula.titulo || "Fórmula")}</strong>
        <code>${escapeHtml(aula.formula.texto)}</code>
        ${aula.formula.nota ? `<p>${escapeHtml(aula.formula.nota)}</p>` : ""}
      </section>
    `);
  }

  if (aula.faixas?.length) {
    parts.push(`<section class="learn-block">${bands(aula.faixas)}</section>`);
  }

  if (aula.passos?.length) {
    parts.push(`
      <section class="learn-block">
        <h3>${escapeHtml(aula.passosTitulo || "Passo a passo")}</h3>
        <ol>${aula.passos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </section>
    `);
  }

  if (aula.semana?.length) {
    parts.push(`
      <section class="learn-block">
        <h3>Semana padrão no CD</h3>
        <div class="week-grid">
          ${aula.semana.map((dia) => `
            <div class="week-row">
              <strong>${escapeHtml(dia.dia)}</strong>
              <span>${escapeHtml(dia.foco)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `);
  }

  if (aula.entenda?.length) {
    parts.push(`
      <section class="learn-block block-entenda">
        <h3>Entenda</h3>
        ${list(aula.entenda)}
      </section>
    `);
  }

  if (aula.pratica?.length) {
    parts.push(`
      <section class="learn-block block-pratica">
        <h3>Na prática</h3>
        ${list(aula.pratica)}
      </section>
    `);
  }

  if (aula.papel?.length) {
    parts.push(`
      <section class="learn-block block-papel">
        <h3>Nosso papel como analista</h3>
        ${list(aula.papel)}
      </section>
    `);
  }

  if (aula.checklist?.length) {
    parts.push(`
      <section class="learn-block block-checklist">
        <h3>O que não pode faltar</h3>
        ${checks(aula.checklist)}
      </section>
    `);
  }

  if (aula.mensagem) {
    parts.push(`
      <section class="learn-block block-mensagem">
        <h3>Mensagem principal</h3>
        <p>${escapeHtml(aula.mensagem)}</p>
      </section>
    `);
  }

  if (aula.quiz) {
    const { shuffled, correctDisplayIndex } = quizShuffle(aula);
    parts.push(`
      <section class="quiz-box" data-activity="quiz" data-lesson="${escapeHtml(aula.id)}" data-correct-index="${correctDisplayIndex}">
        <h3>${escapeHtml(aula.quiz.titulo || "Pergunta rápida")}</h3>
        <p>${escapeHtml(aula.quiz.pergunta)}</p>
        <div class="quiz-options">
          ${shuffled.map((item, idx) => `
            <button class="choice-btn" type="button" data-index="${idx}">${escapeHtml(item.text)}</button>
          `).join("")}
        </div>
        <div class="feedback" hidden></div>
      </section>
    `);
  }

  if (aula.ordem) {
    const ordemItens = shuffleStrings(aula.ordem.itens, `${aula.id}:ordem`);
    parts.push(`
      <section class="order-box" data-activity="ordem" data-lesson="${escapeHtml(aula.id)}">
        <h3>${escapeHtml(aula.ordem.titulo || "Atividade")}</h3>
        <p>${escapeHtml(aula.ordem.enunciado)}</p>
        <div class="quiz-options" data-order-list>
          ${ordemItens.map((item, idx) => `
            <button class="order-item" type="button" data-id="${escapeHtml(item)}">${idx + 1}. ${escapeHtml(item)}</button>
          `).join("")}
        </div>
        <div class="page-actions">
          <button class="btn-secondary" type="button" data-order-up>Subir</button>
          <button class="btn-secondary" type="button" data-order-down>Descer</button>
          <button class="btn-primary" type="button" data-order-check>Conferir ordem</button>
        </div>
        <div class="feedback" hidden></div>
      </section>
    `);
  }

  if (aula.cenario) {
    parts.push(`
      <section class="scenario-box" data-activity="cenario" data-lesson="${escapeHtml(aula.id)}">
        <h3>${escapeHtml(aula.cenario.titulo || "Atividade")}</h3>
        <p>${escapeHtml(aula.cenario.enunciado)}</p>
        <div class="scenario-fields">
          ${aula.cenario.campos.map((campo) => `
            <label>
              ${escapeHtml(campo.label)}
              <select data-field="${escapeHtml(campo.id)}">
                <option value="">Selecione...</option>
                ${shuffleStrings(campo.opcoes, `${aula.id}:cenario:${campo.id}`).map((op) => `<option value="${escapeHtml(op)}">${escapeHtml(op)}</option>`).join("")}
              </select>
            </label>
          `).join("")}
        </div>
        <button class="btn-primary" type="button" data-scenario-check>Conferir resposta</button>
        <div class="feedback" hidden></div>
      </section>
    `);
  }

  if (aula.calculos?.length) {
    parts.push(`
      <section class="calc-box" data-activity="calc" data-lesson="${escapeHtml(aula.id)}">
        <h3>Desafios de cálculo</h3>
        ${aula.calculos.map((calc, idx) => `
          <article class="visual-card" data-calc-item="${idx}">
            <strong>${escapeHtml(calc.titulo)}</strong>
            <p>${escapeHtml(calc.enunciado)}</p>
            <div class="calc-fields">
              <label>
                Sua resposta
                <input type="text" inputmode="decimal" data-calc-input placeholder="${escapeHtml(calc.placeholder || "")}" />
              </label>
            </div>
            <button class="btn-secondary" type="button" data-calc-check="${idx}">Conferir</button>
            <div class="feedback" hidden></div>
          </article>
        `).join("")}
      </section>
    `);
  }

  if (aula.painel) {
    parts.push(`
      <section class="panel-box" data-activity="painel" data-lesson="${escapeHtml(aula.id)}">
        <h3>${escapeHtml(aula.painel.titulo || "Simulação de painel")}</h3>
        <p>${escapeHtml(aula.painel.enunciado)}</p>
        <div class="panel-sim">
          ${aula.painel.linhas.map((linha) => `
            <label class="panel-row ${linha.alerta ? "is-alert" : ""}">
              <span>
                <strong>${escapeHtml(linha.nome)}</strong><br>
                <small>${escapeHtml(linha.detalhe)}</small>
              </span>
              <input type="radio" name="painel-desvio" value="${escapeHtml(linha.id)}" />
            </label>
          `).join("")}
        </div>
        <label>
          Qual orientação deve ser feita?
          <select data-painel-acao>
            <option value="">Selecione...</option>
            ${shuffleStrings(aula.painel.acoes, `${aula.id}:painel:acoes`).map((acao) => `<option value="${escapeHtml(acao)}">${escapeHtml(acao)}</option>`).join("")}
          </select>
        </label>
        <button class="btn-primary" type="button" data-painel-check>Conferir priorização</button>
        <div class="feedback" hidden></div>
      </section>
    `);
  }

  if (aula.planejador) {
    parts.push(`
      <section class="planner-box" data-activity="planejador" data-lesson="${escapeHtml(aula.id)}">
        <h3>Planejador semanal</h3>
        <p>${escapeHtml(aula.planejador.enunciado)}</p>
        ${aula.planejador.dias.map((dia) => `
          <label>
            ${escapeHtml(dia)}
            <input type="text" data-planner-day="${escapeHtml(dia)}" placeholder="Principais entregas do dia" />
          </label>
        `).join("")}
        <p class="hint" style="color:var(--muted);font-size:12px;">Salvo automaticamente no seu progresso.</p>
      </section>
    `);
  }

  if (aula.revisao?.length) {
    parts.push(`
      <section class="learn-block">
        <div class="review-grid">
          ${aula.revisao.map((bloco) => `
            <article class="visual-card">
              <strong>${escapeHtml(bloco.titulo)}</strong>
              ${list(bloco.itens)}
            </article>
          `).join("")}
        </div>
      </section>
    `);
  }

  if (aula.avaliacao) {
    parts.push(`
      <section class="quiz-box" data-activity="avaliacao" data-lesson="${escapeHtml(aula.id)}">
        <h3>Avaliação de conhecimento</h3>
        <p>Responda às perguntas essenciais da integração. Você precisa acertar pelo menos ${aula.avaliacao.minimo} de ${aula.avaliacao.perguntas.length}.</p>
        ${aula.avaliacao.perguntas.map((perg, pIdx) => {
          const { shuffled, correctDisplayIndex } = evalShuffle(aula, pIdx, perg);
          return `
          <article data-eval-q="${pIdx}" data-correct-index="${correctDisplayIndex}">
            <p><strong>${pIdx + 1}. ${escapeHtml(perg.pergunta)}</strong></p>
            <div class="quiz-options">
              ${shuffled.map((item, oIdx) => `
                <button class="choice-btn" type="button" data-eval-opt="${oIdx}">${escapeHtml(item.text)}</button>
              `).join("")}
            </div>
          </article>
        `;
        }).join("")}
        <button class="btn-primary" type="button" data-eval-check>Corrigir avaliação</button>
        <div class="feedback" hidden></div>
      </section>
    `);
  }

  if (aula.conclusao) {
    parts.push(`
      <section class="congrats">
        <div class="brand-logo" style="width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#2563eb,#0f766e);color:#fff;font-weight:800;">GP</div>
        <h2>${escapeHtml(aula.conclusao.titulo)}</h2>
        <p>${escapeHtml(aula.conclusao.texto)}</p>
      </section>
    `);
  }

  return parts.join("");
}

function showFeedback(el, ok, text) {
  if (!el) return;
  el.hidden = false;
  el.className = `feedback ${ok ? "ok" : "bad"}`;
  el.textContent = text;
}

export function bindActivities(root, aula, savedAnswer, onAnswer) {
  const quiz = root.querySelector('[data-activity="quiz"]');
  if (quiz && aula.quiz) {
    const correctIdx = Number(quiz.dataset.correctIndex);
    const buttons = [...quiz.querySelectorAll(".choice-btn")];
    const feedback = quiz.querySelector(".feedback");
    const apply = (idx) => {
      buttons.forEach((btn, i) => {
        btn.classList.toggle("is-selected", i === idx);
        btn.classList.toggle("is-correct", i === correctIdx);
        btn.classList.toggle("is-wrong", i === idx && i !== correctIdx);
      });
      const ok = idx === correctIdx;
      showFeedback(feedback, ok, ok ? aula.quiz.acerto : aula.quiz.erro);
      onAnswer({ tipo: "quiz", index: idx, ok });
    };
    buttons.forEach((btn) => btn.addEventListener("click", () => apply(Number(btn.dataset.index))));
    if (savedAnswer?.tipo === "quiz" && Number.isInteger(savedAnswer.index)) apply(savedAnswer.index);
  }

  const ordem = root.querySelector('[data-activity="ordem"]');
  if (ordem && aula.ordem) {
    const listEl = ordem.querySelector("[data-order-list]");
    const feedback = ordem.querySelector(".feedback");
    let selected = null;
    const items = savedAnswer?.itens || shuffleStrings(aula.ordem.itens, `${aula.id}:ordem`);

    const paint = () => {
      listEl.innerHTML = items.map((item, idx) => `
        <button class="order-item${item === selected ? " is-selected" : ""}" type="button" data-id="${escapeHtml(item)}">${idx + 1}. ${escapeHtml(item)}</button>
      `).join("");
      listEl.querySelectorAll(".order-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          selected = btn.dataset.id;
          paint();
        });
      });
    };
    paint();

    ordem.querySelector("[data-order-up]")?.addEventListener("click", () => {
      const i = items.indexOf(selected);
      if (i > 0) {
        [items[i - 1], items[i]] = [items[i], items[i - 1]];
        paint();
      }
    });
    ordem.querySelector("[data-order-down]")?.addEventListener("click", () => {
      const i = items.indexOf(selected);
      if (i >= 0 && i < items.length - 1) {
        [items[i + 1], items[i]] = [items[i], items[i + 1]];
        paint();
      }
    });
    ordem.querySelector("[data-order-check]")?.addEventListener("click", () => {
      const ok = items.join("|") === aula.ordem.correta.join("|");
      showFeedback(feedback, ok, ok ? aula.ordem.acerto : aula.ordem.erro);
      onAnswer({ tipo: "ordem", itens: [...items], ok });
    });
  }

  const cenario = root.querySelector('[data-activity="cenario"]');
  if (cenario && aula.cenario) {
    const feedback = cenario.querySelector(".feedback");
    if (savedAnswer?.valores) {
      Object.entries(savedAnswer.valores).forEach(([id, value]) => {
        const select = cenario.querySelector(`[data-field="${id}"]`);
        if (select) select.value = value;
      });
    }
    cenario.querySelector("[data-scenario-check]")?.addEventListener("click", () => {
      const valores = {};
      let ok = true;
      for (const campo of aula.cenario.campos) {
        const select = cenario.querySelector(`[data-field="${campo.id}"]`);
        valores[campo.id] = select?.value || "";
        if (valores[campo.id] !== campo.correta) ok = false;
      }
      showFeedback(feedback, ok, ok ? aula.cenario.acerto : aula.cenario.erro);
      onAnswer({ tipo: "cenario", valores, ok });
    });
  }

  const calc = root.querySelector('[data-activity="calc"]');
  if (calc && aula.calculos) {
    const saved = savedAnswer?.respostas || {};
    aula.calculos.forEach((item, idx) => {
      const card = calc.querySelector(`[data-calc-item="${idx}"]`);
      const input = card.querySelector("[data-calc-input]");
      const feedback = card.querySelector(".feedback");
      if (saved[idx] != null) input.value = saved[idx];
      card.querySelector("[data-calc-check]")?.addEventListener("click", () => {
        const raw = String(input.value || "").replace(",", ".").replace("%", "").trim();
        const num = Number(raw);
        const ok = Number.isFinite(num) && Math.abs(num - item.resposta) <= (item.tolerancia ?? 0.05);
        showFeedback(feedback, ok, ok ? item.acerto : item.erro);
        onAnswer({
          tipo: "calc",
          respostas: {
            ...(savedAnswer?.respostas || {}),
            [idx]: input.value
          }
        });
      });
    });
  }

  const painel = root.querySelector('[data-activity="painel"]');
  if (painel && aula.painel) {
    const feedback = painel.querySelector(".feedback");
    if (savedAnswer?.desvio) {
      const radio = painel.querySelector(`input[value="${savedAnswer.desvio}"]`);
      if (radio) radio.checked = true;
    }
    if (savedAnswer?.acao) painel.querySelector("[data-painel-acao]").value = savedAnswer.acao;
    painel.querySelector("[data-painel-check]")?.addEventListener("click", () => {
      const desvio = painel.querySelector("input[name='painel-desvio']:checked")?.value || "";
      const acao = painel.querySelector("[data-painel-acao]")?.value || "";
      const ok = desvio === aula.painel.desvioCorreto && acao === aula.painel.acaoCorreta;
      showFeedback(feedback, ok, ok ? aula.painel.acerto : aula.painel.erro);
      onAnswer({ tipo: "painel", desvio, acao, ok });
    });
  }

  const planner = root.querySelector('[data-activity="planejador"]');
  if (planner && aula.planejador) {
    const saved = savedAnswer?.dias || {};
    planner.querySelectorAll("[data-planner-day]").forEach((input) => {
      input.value = saved[input.dataset.plannerDay] || "";
      input.addEventListener("input", () => {
        const dias = {};
        planner.querySelectorAll("[data-planner-day]").forEach((el) => {
          dias[el.dataset.plannerDay] = el.value;
        });
        onAnswer({ tipo: "planejador", dias });
      });
    });
  }

  const avaliacao = root.querySelector('[data-activity="avaliacao"]');
  if (avaliacao && aula.avaliacao) {
    const answers = { ...(savedAnswer?.escolhas || {}) };
    const feedback = avaliacao.querySelector(".feedback");
    avaliacao.querySelectorAll("[data-eval-q]").forEach((qEl) => {
      const pIdx = Number(qEl.dataset.evalQ);
      qEl.querySelectorAll("[data-eval-opt]").forEach((btn) => {
        const oIdx = Number(btn.dataset.evalOpt);
        if (Number(answers[pIdx]) === oIdx) btn.classList.add("is-selected");
        btn.addEventListener("click", () => {
          answers[pIdx] = oIdx;
          qEl.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("is-selected"));
          btn.classList.add("is-selected");
        });
      });
    });
    avaliacao.querySelector("[data-eval-check]")?.addEventListener("click", () => {
      let acertos = 0;
      aula.avaliacao.perguntas.forEach((_perg, idx) => {
        const qEl = avaliacao.querySelector(`[data-eval-q="${idx}"]`);
        const correctIdx = Number(qEl.dataset.correctIndex);
        qEl.querySelectorAll(".choice-btn").forEach((btn, oIdx) => {
          btn.classList.toggle("is-correct", oIdx === correctIdx);
          btn.classList.toggle("is-wrong", Number(answers[idx]) === oIdx && oIdx !== correctIdx);
        });
        if (Number(answers[idx]) === correctIdx) acertos += 1;
      });
      const ok = acertos >= aula.avaliacao.minimo;
      showFeedback(
        feedback,
        ok,
        ok
          ? `Você acertou ${acertos} de ${aula.avaliacao.perguntas.length}. Integração consolidada.`
          : `Você acertou ${acertos} de ${aula.avaliacao.perguntas.length}. Revise os módulos apontados e tente de novo.`
      );
      onAnswer({ tipo: "avaliacao", escolhas: answers, acertos, ok });
    });
  }
}
