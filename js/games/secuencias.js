const GameSecuencias = (() => {
  let questions = [], current = 0, correct = 0, answered = false;
  let level = 'facil';
  let sessionCallback = null;
  const queues = { facil: null, normal: null };

  function getQueue(l) {
    if (!queues[l]) queues[l] = Shared.createQueue(DATA.secuencias[l].length);
    return queues[l];
  }

  function init(onComplete) {
    sessionCallback = onComplete || null;
    if (!onComplete) level = 'facil';
    loadQuestions();
  }

  function loadQuestions(newLevel) {
    if (newLevel) level = newLevel;
    questions = getQueue(level).pick(DATA.secuencias[level], 8);
    current = 0; correct = 0; answered = false;
    render();
  }

  function render() {
    const q = questions[current];
    const opts = Shared.shuffle([...q.options]);
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    answered = false;
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GameSecuencias') : '') +
      '<div class="game-score">Pregunta ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">¿Qué viene después?</div>' +
      '<div style="text-align:center;font-size:1.7rem;font-weight:900;margin:10px 0 24px;color:var(--sage-dark);background:white;padding:20px;border-radius:16px;box-shadow:var(--shadow-sm);letter-spacing:2px;">' + q.question + '</div>' +
      '<div class="options-grid">' +
      opts.map(function(opt) {
        return '<button class="option-btn" onclick="GameSecuencias.answer(this, \'' + opt.replace(/'/g,"\\'") + '\')">' + opt + '</button>';
      }).join('') +
      '</div>' +
      '<p id="seq-hint" style="text-align:center;color:var(--text-light);font-weight:600;min-height:24px;font-size:0.9rem;margin-top:8px;"></p>';
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
    document.getElementById('seq-hint').textContent = q.hint;
    if (isCorrect) { correct++; App.showFeedback(true); } else App.showFeedback(false);
    setTimeout(function() { current++; current >= questions.length ? onFinish() : render(); }, 1500);
  }

  function setLevel(l) { loadQuestions(l); }

  function onFinish() {
    Progress.recordGame('secuencias', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GameSecuencias.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, answer, setLevel, loadQuestions };
})();
