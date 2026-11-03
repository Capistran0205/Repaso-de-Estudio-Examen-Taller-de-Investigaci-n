/* Estado y reglas del cuestionario. */
const Quiz = (() => {
  let state = null;

  function flattenQuestions(bank, sectionId) {
    const sections = sectionId === 'all'
      ? bank.secciones
      : bank.secciones.filter(section => section.id === sectionId);
    return sections.flatMap(section => section.preguntas.map(question => ({ ...question })));
  }

  function start(bank, sectionId, reviewQuestions = null, isReview = false) {
    const questions = reviewQuestions ? reviewQuestions.map(q => ({ ...q })) : flattenQuestions(bank, sectionId);
    state = {
      bank, sectionId, questions, index: 0, answered: false, selected: null,
      correctCount: 0, errors: [], isReview, reviewRound: 0
    };
    return state;
  }

  function answer(optionId) {
    if (!state || state.answered) return state;
    const question = state.questions[state.index];
    state.selected = optionId;
    state.answered = true;
    if (optionId === question.respuestaCorrecta) {
      state.correctCount += 1;
    } else {
      state.errors.push(question);
    }
    return state;
  }

  function next() {
    if (!state || !state.answered) return { type: 'blocked', state };
    if (state.index < state.questions.length - 1) {
      state.index += 1;
      state.answered = false;
      state.selected = null;
      return { type: 'question', state };
    }
    return { type: 'summary', summary: summary() };
  }

  function summary() {
    return {
      total: state.questions.length,
      correct: state.correctCount,
      errors: [...state.errors],
      isReview: state.isReview
    };
  }

  function startReview() {
    if (!state || state.errors.length === 0) return null;
    const bank = state.bank;
    const sectionId = state.sectionId;
    const errors = [...state.errors];
    return start(bank, sectionId, errors, true);
  }

  function getState() { return state; }
  return { start, answer, next, summary, startReview, getState };
})();
