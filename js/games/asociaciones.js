const GameAsociaciones = (() => {
  let questions = [], current = 0, correct = 0, answered = false;
  let level = 'facil';
  let sessionCallback = null;
  let queue = null;

  function getQueue() {
    if (!queue) queue = Shared.createQueue(DATA.asociaciones.length);
    return queue;
  }

  function getPool() {
    const all = DATA.asociaciones;
    return level === 'facil' ? all.slice(0, Math.ceil(all.length / 2)) : all;
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
      (!sessionCallback ? Shared.levelSelector(level, 'GameAsociaciones') : '') +
      '<div class="game-score">Pregunta ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">' + q.question + '</div>' +
      '<div class="options-grid">' +
      opts.map(function(opt) {
        return '<button class="option-btn" onclick="GameAsociaciones.answer(this, \'' + opt.replace(/'/g,"\\'") + '\')">' + opt + '</button>';
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
    Progress.recordGame('asociaciones', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GameAsociaciones.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, answer, setLevel, loadQuestions };
})();
