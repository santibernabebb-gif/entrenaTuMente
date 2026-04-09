// js/app.js — Main application controller

const App = (() => {
  const GAMES = [
    { id: 'memory',        emoji: '🃏', title: 'Parejas',          color: 'sage',  init: () => GameMemory.init(6) },
    { id: 'cualSobra',     emoji: '❓', title: '¿Cuál sobra?',     color: 'rose',  init: () => GameCualSobra.init() },
    { id: 'secuencias',    emoji: '🔢', title: 'Secuencias',       color: 'sky',   init: () => GameSecuencias.init() },
    { id: 'memoriaBreve',  emoji: '⏱️', title: 'Memoria breve',    color: 'amber', init: () => GameMemoriaBreve.init() },
    { id: 'asociaciones',  emoji: '🔗', title: 'Asociaciones',     color: 'lav',   init: () => GameAsociaciones.init() },
    { id: 'ordenLogico',   emoji: '📋', title: 'Orden lógico',     color: 'sage',  init: () => GameOrdenLogico.init() },
    { id: 'atencionVisual',emoji: '👁️', title: 'Atención visual',  color: 'rose',  init: () => GameAtencionVisual.init() },
    { id: 'palabras',      emoji: '🔤', title: 'Palabras',         color: 'amber', init: () => GamePalabras.init() },
    { id: 'categorias',    emoji: '📦', title: 'Categorías',       color: 'lav',   init: () => GameCategorias.init() },
  ];

  let feedbackTimer = null;

  function init() {
    renderGameGrid();
  }

  function renderGameGrid() {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = GAMES.map(g => `
      <div class="game-card color-${g.color}" onclick="App.startGame('${g.id}')">
        <span class="game-card-emoji">${g.emoji}</span>
        <div class="game-card-title">${g.title}</div>
      </div>
    `).join('');
  }

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    window.scrollTo(0, 0);
    if (name === 'progress') {
      Progress.renderScreen();
    }
  }

  function startGame(id) {
    const g = GAMES.find(x => x.id === id);
    if (!g) return;
    document.getElementById('game-title-header').textContent = g.emoji + ' ' + g.title;
    document.getElementById('game-container').innerHTML = '';
    showScreen('game');
    g.init();
  }

  function startQuickSession() {
    Session.start();
  }

  function backFromGame() {
    showScreen('home');
  }

  function endSession() {
    Session.end();
  }

  function showFeedback(isCorrect, customMsg) {
    const overlay = document.getElementById('feedback-overlay');
    const icon    = document.getElementById('feedback-icon');
    const text    = document.getElementById('feedback-text');

    if (isCorrect) {
      icon.textContent = '✅';
      const msgs = ['¡Muy bien!', '¡Correcto!', '¡Estupendo!', '¡Así se hace!', '¡Perfecto!'];
      text.textContent = customMsg || msgs[Math.floor(Math.random() * msgs.length)];
      overlay.querySelector('.feedback-box').style.borderTop = '5px solid var(--sage)';
    } else {
      icon.textContent = '💪';
      const msgs = ['¡Buen intento!', 'Casi lo tenías', '¡Vamos con la siguiente!', 'Sin problema, ¡adelante!'];
      text.textContent = customMsg || msgs[Math.floor(Math.random() * msgs.length)];
      overlay.querySelector('.feedback-box').style.borderTop = '5px solid var(--rose)';
    }

    overlay.classList.remove('hidden');
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      overlay.classList.add('hidden');
    }, 900);
  }

  // Init on load
  document.addEventListener('DOMContentLoaded', init);

  return { showScreen, startGame, startQuickSession, backFromGame, endSession, showFeedback };
})();
