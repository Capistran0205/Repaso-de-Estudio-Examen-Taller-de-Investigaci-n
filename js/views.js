/* Funciones de presentación. No contiene reglas de evaluación. */
const Views = (() => {
  const app = document.getElementById('app');
  const backHome = document.getElementById('back-home');

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  // Permite conservar únicamente la notación **negrita** usada en algunos enunciados.
  function formatText(value = '') {
    return escapeHTML(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function setBackButton(visible, handler) {
    backHome.classList.toggle('hidden', !visible);
    backHome.onclick = visible ? handler : null;
  }

  function renderSelection(bank, onStart, onHome) {
    const count = bank.secciones.reduce((sum, section) => sum + section.preguntas.length, 0);
    const sections = bank.secciones.map((section, index) => `
      <label class="section-option">
        <input type="radio" name="section" value="${escapeHTML(section.id)}" ${index === 0 ? '' : ''}>
        <span class="section-radio"></span>
        <span class="section-option-copy"><strong>${escapeHTML(section.titulo)}</strong><small>${section.preguntas.length} preguntas</small></span>
      </label>`).join('');

    app.innerHTML = `
      <section class="selection-header">
        <button class="back-link" id="selection-home" type="button">← Volver al inicio</button>
        <div class="eyebrow"><span class="eyebrow-line"></span> CONFIGURAR REPASO</div>
        <h1>${escapeHTML(bank.titulo)}</h1>
        <p class="hero-description">${escapeHTML(bank.descripcion)}</p>
      </section>
      <section class="selection-layout">
        <div class="selection-main">
          <div class="section-heading"><div><span class="step-label">01 / CONTENIDO</span><h2>¿Qué quieres estudiar?</h2></div><span class="total-pill">${count} preguntas</span></div>
          <label class="section-option all-option">
            <input type="radio" name="section" value="all" checked>
            <span class="section-radio"></span>
            <span class="section-option-copy"><strong>Todo el contenido</strong><small>Practicar todas las preguntas en orden</small></span>
            <span class="all-count">${count}</span>
          </label>
          <div class="section-list">${sections}</div>
          <button class="primary-button start-button" id="start-quiz" type="button">Comenzar repaso <span>→</span></button>
        </div>
        <aside class="study-aside">
          <span class="aside-symbol">✳</span>
          <span class="step-label">MODO DE ESTUDIO</span>
          <h3>Aprende de cada respuesta.</h3>
          <p>La explicación aparecerá en cuanto selecciones una opción. Al terminar podrás repetir las preguntas que hayas contestado incorrectamente.</p>
          <div class="aside-rule"></div>
          <div class="aside-feature"><span>✓</span><div><strong>Retroalimentación inmediata</strong><small>Respuesta y explicación en cada pregunta.</small></div></div>
          <div class="aside-feature"><span>↻</span><div><strong>Repaso de errores</strong><small>Una ronda adicional con tus preguntas pendientes.</small></div></div>
        </aside>
      </section>`;
    document.getElementById('selection-home').addEventListener('click', onHome);
    document.getElementById('start-quiz').addEventListener('click', () => {
      const selected = document.querySelector('input[name="section"]:checked')?.value || 'all';
      onStart(selected);
    });
    setBackButton(true, onHome);
  }

  function renderQuestion(state, handlers) {
    const { bank, questions, index, answered, selected, correctCount, isReview, reviewRound } = state;
    const question = questions[index];
    const section = bank.secciones.find(item => item.preguntas.some(q => q.id === question.id));
    const percentage = ((index + (answered ? 1 : 0)) / questions.length) * 100;
    const options = question.opciones.map(option => {
      const isSelected = selected === option.id;
      const isCorrect = option.id === question.respuestaCorrecta;
      let stateClass = '';
      if (answered && isCorrect) stateClass = ' is-correct';
      else if (answered && isSelected && !isCorrect) stateClass = ' is-wrong';
      else if (answered) stateClass = ' is-muted';
      return `<button class="answer-option${stateClass}" type="button" data-option="${escapeHTML(option.id)}" ${answered ? 'disabled' : ''}>
        <span class="option-letter">${escapeHTML(option.id.toUpperCase())}</span>
        <span class="option-text">${formatText(option.texto)}</span>
        <span class="option-status">${answered && isCorrect ? '✓' : (answered && isSelected ? '×' : '')}</span>
      </button>`;
    }).join('');

    let feedback = '';
    if (answered) {
      const isCorrect = selected === question.respuestaCorrecta;
      const correctOption = question.opciones.find(option => option.id === question.respuestaCorrecta);
      feedback = `<section class="feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}" role="status">
        <div class="feedback-heading"><span class="feedback-icon">${isCorrect ? '✓' : '!'}</span><div><strong>${isCorrect ? '¡Muy bien! Respuesta correcta.' : 'Respuesta incorrecta.'}</strong><small>${isCorrect ? 'Este concepto lo tienes dominado.' : `La respuesta correcta es ${question.respuestaCorrecta.toUpperCase()}.`}</small></div></div>
        ${!isCorrect ? `<p class="correct-answer"><strong>${question.respuestaCorrecta.toUpperCase()}.</strong> ${formatText(correctOption.texto)}</p>` : ''}
        <div class="explanation"><span class="explanation-label">¿POR QUÉ?</span><p>${formatText(question.explicacion)}</p></div>
      </section>`;
    }

    const sectionTitle = section ? section.titulo : bank.titulo;
    app.innerHTML = `
      <section class="quiz-wrap">
        <div class="quiz-topline"><div><span class="step-label">${isReview ? 'RONDA DE REPASO' : 'SESIÓN DE ESTUDIO'}</span><h1>${escapeHTML(sectionTitle)}</h1></div><button class="exit-button" id="exit-quiz" type="button">Salir del repaso</button></div>
        <div class="progress-meta"><span>Pregunta <strong>${index + 1}</strong> de ${questions.length}</span><span>${Math.round(percentage)}% completado</span></div>
        <div class="progress-track"><span style="width:${percentage}%"></span></div>
        <article class="question-card">
          <div class="question-overline"><span>${escapeHTML(question.id)}</span><span>${isReview ? 'REPASO DE ERRORES' : 'SELECCIONA UNA RESPUESTA'}</span></div>
          <h2>${formatText(question.enunciado)}</h2>
          <div class="options-list">${options}</div>
          ${feedback}
          ${answered ? `<div class="question-actions"><span class="session-score">${correctCount} ${correctCount === 1 ? 'respuesta correcta' : 'respuestas correctas'} en esta ronda</span><button class="primary-button next-button" id="next-question" type="button">${index === questions.length - 1 ? 'Ver resumen' : 'Siguiente pregunta'} <span>→</span></button></div>` : '<p class="answer-hint">Selecciona una opción para comprobar tu respuesta.</p>'}
        </article>
        <div class="quiz-footnote"><span>✳</span> No se trata de obtener una calificación, sino de comprender cada tema.</div>
      </section>`;

    document.querySelectorAll('[data-option]').forEach(button => {
      button.addEventListener('click', () => handlers.onAnswer(button.dataset.option));
    });
    document.getElementById('exit-quiz').addEventListener('click', handlers.onExit);
    document.getElementById('next-question')?.addEventListener('click', handlers.onNext);
    setBackButton(false);
  }

  function renderSummary(summary, handlers) {
    const { total, correct, errors, isReview } = summary;
    const isDone = errors.length === 0;
    const errorList = errors.length ? errors.map(question => `
      <div class="error-row"><span class="error-id">${escapeHTML(question.id)}</span><span>${formatText(question.enunciado)}</span></div>`).join('') : '';
    app.innerHTML = `
      <section class="summary-wrap">
        <div class="summary-symbol ${isDone ? 'summary-success' : ''}">${isDone ? '✓' : '↻'}</div>
        <span class="step-label">${isReview ? 'REPASO FINALIZADO' : 'SESIÓN COMPLETADA'}</span>
        <h1>${isDone ? '¡Buen trabajo!' : 'Un paso más cerca.'}</h1>
        <p class="summary-description">${isDone ? 'Has respondido correctamente todas las preguntas de esta ronda.' : 'Terminaste esta ronda. Identificamos algunos conceptos que vale la pena volver a practicar.'}</p>
        <div class="summary-stats"><div><strong>${correct}</strong><span>Correctas</span></div><div><strong>${errors.length}</strong><span>Por reforzar</span></div><div><strong>${total}</strong><span>Contestadas</span></div></div>
        ${errors.length ? `<section class="error-review"><div class="error-review-heading"><div><span class="step-label">SIGUIENTE PASO</span><h2>Preguntas por reforzar</h2></div><span class="error-count">${errors.length}</span></div><div class="error-list">${errorList}</div></section>` : ''}
        <div class="summary-actions">
          ${errors.length ? `<button class="primary-button" id="review-errors" type="button">${isReview ? 'Volver a repasar errores' : 'Repasar preguntas incorrectas'} <span>→</span></button>` : ''}
          <button class="${errors.length ? 'secondary-button' : 'primary-button'}" id="repeat-section" type="button">Volver a practicar</button>
          <button class="text-button summary-home" id="summary-home" type="button">Elegir otro contenido</button>
        </div>
      </section>`;
    document.getElementById('review-errors')?.addEventListener('click', handlers.onReview);
    document.getElementById('repeat-section').addEventListener('click', handlers.onRepeat);
    document.getElementById('summary-home').addEventListener('click', handlers.onHome);
    setBackButton(true, handlers.onHome);
  }

  return { renderSelection, renderQuestion, renderSummary, setBackButton };
})();
