/* Punto de entrada: carga bancos y conecta las vistas con la lógica. */
(() => {
  const banks = {};
  let activeBank = null;
  let activeSection = 'all';

  async function loadBank(id) {
    if (banks[id]) return banks[id];
    const response = await fetch(`data/${id}.json`);
    if (!response.ok) throw new Error(`No se pudo cargar data/${id}.json (${response.status}).`);
    banks[id] = await response.json();
    return banks[id];
  }

  function showHome() {
    activeBank = null;
    activeSection = 'all';
    window.location.hash = 'inicio';
    window.location.reload();
  }

  function renderCurrentQuestion() {
    const state = Quiz.getState();
    Views.renderQuestion(state, {
      onAnswer(optionId) {
        Quiz.answer(optionId);
        renderCurrentQuestion();
      },
      onNext() {
        const result = Quiz.next();
        if (result.type === 'question') renderCurrentQuestion();
        else if (result.type === 'summary') renderSummary(result.summary);
      },
      onExit: showHome
    });
  }

  function renderSummary(summary) {
    Views.renderSummary(summary, {
      onReview() {
        Quiz.startReview();
        renderCurrentQuestion();
      },
      onRepeat() {
        Quiz.start(activeBank, activeSection);
        renderCurrentQuestion();
      },
      onHome: showHome
    });
  }

  document.querySelectorAll('[data-bank]').forEach(card => {
    card.addEventListener('click', async () => {
      const id = card.dataset.bank;
      card.disabled = true;
      try {
        activeBank = await loadBank(id);
        Views.renderSelection(activeBank, sectionId => {
          activeSection = sectionId;
          Quiz.start(activeBank, activeSection);
          renderCurrentQuestion();
        }, showHome);
      } catch (error) {
        console.error(error);
        alert('No fue posible cargar las preguntas. Verifica que estés ejecutando el proyecto mediante un servidor local.');
      } finally {
        card.disabled = false;
      }
    });
  });
})();
