const GameMemoriaBreve = (() => {
  let questions = [], current = 0, correct = 0, answered = false;
  let level = 'facil';
  let sessionCallback = null;
  let countdownTimer = null;
  let queue = null;

  function getQueue() {
    if (!queue) queue = Shared.createQueue(DATA.memoriaBreve.length);
    return queue;
  }

  function init(onComplete) {
    sessionCallback = onComplete || null;
    if (!onComplete) level = 'facil';
    loadQuestions();
  }

  function loadQuestions(newLevel) {
    if (newLevel) level = newLevel;
    if (countdownTimer) clearInterval(countdownTimer);
    questions = getQueue().pick(DATA.memoriaBreve, 6);
    current = 0; correct = 0; answered = false;
    showPhase();
  }

  function showPhase() {
    const q = questions[current];
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    answered = false;
    const secs = level === 'facil' ? 4 : 3;
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GameMemoriaBreve') : '') +
      '<div class="game-score">Reto ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">¡Mira bien! Tienes ' + secs + ' segundos</div>' +
      '<div class="show-items-grid">' +
      q.showItems.map(function(item) { return '<div class="show-item">' + item + '</div>'; }).join('') +
      '</div>' +
      '<div class="countdown-bar"><div class="countdown-bar-fill" id="countdown-fill" style="width:100%"></div></div>' +
      '<p style="text-align:center;color:var(--text-light);font-weight:600;">Memoriza lo que ves...</p>';

    let elapsed = 0;
    const total = secs * 10;
    countdownTimer = setInterval(function() {
      elapsed++;
      const fill = document.getElementById('countdown-fill');
      if (fill) fill.style.width = (100 - (elapsed / total) * 100) + '%';
      if (elapsed >= total) { clearInterval(countdownTimer); askPhase(q); }
    }, 100);
  }

  function askPhase(q) {
    const opts = Shared.shuffle([...q.options]);
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GameMemoriaBreve') : '') +
      '<div class="game-score">Reto ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">' + q.question + '</div>' +
      '<div class="options-grid">' +
      opts.map(function(opt) {
        return '<button class="option-btn" style="font-size:1.8rem;min-height:90px" onclick="GameMemoriaBreve.answer(this, \'' + opt + '\')">' + opt + '</button>';
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
    setTimeout(function() { current++; current >= questions.length ? onFinish() : showPhase(); }, 1400);
  }

  function setLevel(l) { loadQuestions(l); }

  function onFinish() {
    Progress.recordGame('memoriaBreve', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GameMemoriaBreve.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, answer, setLevel, loadQuestions };
})();
