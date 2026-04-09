const GameOrdenLogico = (() => {
  let questions = [], current = 0, correct = 0;
  let level = 'facil';
  let sessionCallback = null;
  let queue = null;
  let currentQ = null, shuffled = [], userOrder = [];

  function getQueue() {
    if (!queue) queue = Shared.createQueue(DATA.ordenLogico.length);
    return queue;
  }

  function getPool() {
    const all = DATA.ordenLogico;
    return level === 'facil' ? all.slice(0, Math.ceil(all.length / 2)) : all;
  }

  function init(onComplete) {
    sessionCallback = onComplete || null;
    if (!onComplete) level = 'facil';
    loadQuestions();
  }

  function loadQuestions(newLevel) {
    if (newLevel) level = newLevel;
    questions = getQueue().pick(getPool(), 5);
    current = 0; correct = 0;
    startQuestion();
  }

  function startQuestion() {
    currentQ = questions[current];
    shuffled = Shared.shuffle(currentQ.steps.map(function(s, i) { return { text: s, originalIdx: i }; }));
    userOrder = [];
    render();
  }

  function render() {
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    const placed = new Set(userOrder.map(function(u) { return u.shuffledIdx; }));
    let itemsHTML = '';
    for (let i = 0; i < shuffled.length; i++) {
      const isPlaced = placed.has(i);
      const placeNum = isPlaced ? userOrder.findIndex(function(u) { return u.shuffledIdx === i; }) + 1 : '';
      itemsHTML += '<div class="order-item ' + (isPlaced ? 'placed' : '') + '" onclick="GameOrdenLogico.selectItem(' + i + ')">' +
        '<div class="order-slot ' + (isPlaced ? 'filled' : '') + '">' + placeNum + '</div>' +
        '<span>' + shuffled[i].text + '</span></div>';
    }
    const allPlaced = userOrder.length >= shuffled.length;
    container.innerHTML =
      (!sessionCallback ? Shared.levelSelector(level, 'GameOrdenLogico') : '') +
      '<div class="game-score">Reto ' + (current+1) + ' de ' + questions.length + ' &middot; Aciertos: ' + correct + '</div>' +
      '<div class="game-prompt">' + currentQ.question + '</div>' +
      '<p style="font-weight:700;color:var(--text-mid);margin-bottom:10px;font-size:0.95rem;">Toca para poner en orden (primero → último):</p>' +
      '<div class="order-items">' + itemsHTML + '</div>' +
      '<div style="display:flex;gap:10px;margin-top:12px;">' +
      '<button class="btn-next" style="background:var(--rose);flex:1;padding:14px" onclick="GameOrdenLogico.reset()">🔄 Reiniciar</button>' +
      '<button class="btn-next" style="flex:2;padding:14px;' + (!allPlaced ? 'opacity:0.4' : '') + '" onclick="GameOrdenLogico.checkOrder()" ' + (!allPlaced ? 'disabled' : '') + '>✓ Comprobar</button>' +
      '</div>';
  }

  function selectItem(i) {
    if (userOrder.some(function(u) { return u.shuffledIdx === i; })) {
      userOrder = userOrder.filter(function(u) { return u.shuffledIdx !== i; });
    } else {
      userOrder.push({ shuffledIdx: i, item: shuffled[i] });
    }
    render();
  }

  function reset() { userOrder = []; render(); }

  function checkOrder() {
    if (userOrder.length < shuffled.length) return;
    const userOriginal = userOrder.map(function(u) { return u.item.originalIdx; });
    const isCorrect = JSON.stringify(userOriginal) === JSON.stringify(currentQ.correct);
    const items = document.querySelectorAll('.order-item');
    if (isCorrect) {
      items.forEach(function(el) { el.classList.add('correct'); el.classList.remove('placed'); });
      correct++; App.showFeedback(true);
    } else {
      items.forEach(function(el) { el.classList.add('wrong'); });
      App.showFeedback(false, '¡Vamos con la siguiente!');
    }
    setTimeout(function() { current++; current >= questions.length ? onFinish() : startQuestion(); }, 1600);
  }

  function setLevel(l) { loadQuestions(l); }

  function onFinish() {
    Progress.recordGame('ordenLogico', correct, questions.length);
    if (sessionCallback) { sessionCallback(correct >= Math.ceil(questions.length / 2)); return; }
    document.getElementById('game-container').innerHTML =
      Shared.resultScreen(correct, questions.length, 'GameOrdenLogico.loadQuestions()', 'App.showScreen(\'home\')');
  }

  return { init, selectItem, reset, checkOrder, setLevel, loadQuestions };
})();
