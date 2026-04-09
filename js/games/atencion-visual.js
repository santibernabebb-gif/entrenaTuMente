const GameAtencionVisual = (() => {
  let questions = [], current = 0, correct = 0, answered = false;
  let level = 'facil';
  let sessionCallback = null;
  let queue = null;

  function getQueue() {
    if (!queue) queue = Shared.createQueue(DATA.atencionVisual.length);
    return queue;
  }

  function getPool() {
    const all = DATA.atencionVisual;
    return level === 'facil' ? all.filter(function(q) { return q.items.length === 9; }) : all;
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
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    answered = false;
    let itemsHTML = '';
    for (let i = 0; i < q.items.length; i++) {
      itemsHTML += '<div class="attention-item" onclick="GameAtencionVisual.answer(' + i + ')" >' + q.items[i] + '</div>';
    }
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GameAtencionVisual') : '') +
      '<div class="game-score">Reto ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">' + q.question + '</div>' +
      '<div class="attention-grid cols-' + q.cols + '">' + itemsHTML + '</div>' +
      '<p style="text-align:center;color:var(--text-light);font-size:0.9rem;font-weight:600;margin-top:8px;">Observa bien: la diferencia es pequeña. Toca el distinto.</p>';
  }

  function answer(i) {
    if (answered) return;
    answered = true;
    const q = questions[current];
    const isCorrect = i === q.odd;
    document.querySelectorAll('.attention-item').forEach(function(el, idx) {
      el.style.cursor = 'default';
      if (idx === q.odd) { el.style.border = '3px solid var(--sage)'; el.style.background = '#d4edda'; }
      if (idx === i && !isCorrect) { el.style.border = '3px solid var(--rose)'; el.style.background = '#fddede'; }
    });
    if (isCorrect) { correct++; App.showFeedback(true); } else App.showFeedback(false);
    setTimeout(function() { current++; current >= questions.length ? onFinish() : render(); }, 1400);
  }

  function setLevel(l) { loadQuestions(l); }

  function onFinish() {
    Progress.recordGame('atencionVisual', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GameAtencionVisual.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, answer, setLevel, loadQuestions };
})();
