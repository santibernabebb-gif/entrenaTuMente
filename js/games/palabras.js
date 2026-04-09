const GamePalabras = (() => {
  let questions = [], current = 0, correct = 0, answered = false;
  let level = 'facil';
  let sessionCallback = null;
  let queue = null;

  function getQueue() {
    if (!queue) queue = Shared.createQueue(DATA.palabras.length);
    return queue;
  }

  function getPool() {
    const all = DATA.palabras;
    // Filtro de seguridad: nunca mostrar una pregunta donde scrambled === answer
    const valid = all.filter(function(q) {
      return q.scrambled !== q.answer;
    });
    return level === 'facil' ? valid.filter(function(q) { return q.scrambled.length <= 4; }) : valid;
  }

  function init(onComplete) {
    sessionCallback = onComplete || null;
    if (!onComplete) level = 'facil';
    loadQuestions();
  }

  function loadQuestions(newLevel) {
    if (newLevel) level = newLevel;
    questions = getQueue().pick(getPool(), 8);
    current = 0; correct = 0; answered = false;
    render();
  }

  function render() {
    const q = questions[current];
    const opts = Shared.shuffle([...q.options]);
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    answered = false;
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GamePalabras') : '') +
      '<div class="game-score">Pregunta ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">¿Cuál es la palabra correcta?</div>' +
      '<div style="text-align:center;background:white;border-radius:20px;padding:24px;margin-bottom:24px;box-shadow:var(--shadow-sm)">' +
      '<div style="font-size:0.95rem;color:var(--text-light);font-weight:600;margin-bottom:8px;">Letras desordenadas:</div>' +
      '<div style="font-size:2.4rem;font-weight:900;letter-spacing:4px;color:var(--sage-dark);">' + q.scrambled + '</div></div>' +
      '<div class="options-grid">' +
      opts.map(function(opt) {
        return '<button class="option-btn" onclick="GamePalabras.answer(this, \'' + opt + '\')">' + opt + '</button>';
      }).join('') +
      '</div>';
  }

  function answer(btn, chosen) {
    if (answered) return;
    answered = true;
    const q = questions[current];
    const isCorrect = chosen === q.answer;
    btn.parentElement.querySelectorAll('.option-btn').forEach(function(b) {
      if (b.textContent.trim() === q.answer) b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
      b.disabled = true;
    });
    if (isCorrect) { correct++; App.showFeedback(true); } else App.showFeedback(false);
    setTimeout(function() { current++; current >= questions.length ? onFinish() : render(); }, 1400);
  }

  function setLevel(l) { loadQuestions(l); }

  function onFinish() {
    Progress.recordGame('palabras', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GamePalabras.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, answer, setLevel, loadQuestions };
})();
