const GameCualSobra = (() => {
  let questions = [], current = 0, correct = 0, answered = false;
  let level = 'facil';
  let sessionCallback = null;
  const queues = { facil: null, normal: null };

  function getQueue(l) {
    if (!queues[l]) queues[l] = Shared.createQueue(DATA.cualSobra[l].length);
    return queues[l];
  }

  function init(onComplete) {
    sessionCallback = onComplete || null;
    if (!onComplete) level = 'facil';
    loadQuestions();
  }

  function loadQuestions(newLevel) {
    if (newLevel) level = newLevel;
    questions = getQueue(level).pick(DATA.cualSobra[level], 8);
    current = 0; correct = 0; answered = false;
    render();
  }

  function render() {
    const q = questions[current];
    const opts = Shared.shuffle([...q.items]);
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    answered = false;
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GameCualSobra') : '') +
      '<div class="game-score">Pregunta ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">¿Cuál no encaja con las demás?</div>' +
      '<div class="options-grid">' +
      opts.map(function(item) {
        return '<button class="option-btn" onclick="GameCualSobra.answer(this, \'' + item.replace(/'/g,"\\'") + '\')">' + item + '</button>';
      }).join('') +
      '</div>' +
      '<p id="cs-hint" style="text-align:center;color:var(--text-light);font-weight:600;min-height:24px;font-size:0.95rem;margin-top:8px;"></p>';
  }

  function answer(btn, chosen) {
    if (answered) return;
    answered = true;
    const q = questions[current];
    const isCorrect = chosen === q.odd;
    btn.parentElement.querySelectorAll('.option-btn').forEach(function(b) {
      if (b.textContent.trim() === q.odd) b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
      b.disabled = true;
    });
    document.getElementById('cs-hint').textContent = q.reason;
    if (isCorrect) { correct++; App.showFeedback(true); } else App.showFeedback(false);
    setTimeout(function() { current++; current >= questions.length ? onFinish() : render(); }, 1500);
  }

  function setLevel(l) { loadQuestions(l); }

  function onFinish() {
    Progress.recordGame('cualSobra', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GameCualSobra.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, answer, setLevel, loadQuestions };
})();
