// js/games/shared.js — utilidades compartidas por todos los juegos

const Shared = (() => {

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createQueue(total) {
    let used = [];
    return {
      pick(pool, count) {
        if (used.length >= Math.floor(pool.length * 0.75)) used = [];
        const available = pool.filter((_, i) => !used.includes(i));
        const chosen = shuffle(available).slice(0, count);
        chosen.forEach(item => {
          const idx = pool.indexOf(item);
          if (idx !== -1) used.push(idx);
        });
        return shuffle(chosen);
      }
    };
  }

  // Fixed: uses game name string so onclick works in all browsers
  
function levelSelector(currentLevel, gameName) {
  return `
    <div class="level-panel">
      <div class="level-panel-title">Elige dificultad</div>
      <div class="level-btns">
        <button class="level-btn ${currentLevel === 'facil' ? 'active' : ''}"
          onclick="${gameName}.setLevel('facil')">
          🌱 Fácil
        </button>
        <button class="level-btn ${currentLevel === 'normal' ? 'active' : ''}"
          onclick="${gameName}.setLevel('normal')">
          ⭐ Normal
        </button>
      </div>
    </div>
  `;
}

  function resultScreen(correct, total, onReplayCall, onHomeCall) {
    const pct = Math.round((correct / total) * 100);
    const great = pct >= 70;
    return `
      <div class="result-block">
        <div class="result-icon">${great ? '🌟' : '💪'}</div>
        <div class="result-title">${great ? '¡Muy bien!' : '¡Buen intento!'}</div>
        <div class="result-sub">Has acertado <strong>${correct} de ${total}</strong> preguntas.<br>${great ? '¡Estupendo trabajo!' : '¡Con práctica mejora!'}</div>
        <button class="btn-next" onclick="${onReplayCall}">🔄 Jugar otra vez</button>
        <button class="btn-next" style="background:var(--sky);margin-top:10px" onclick="${onHomeCall}">🏠 Volver al inicio</button>
      </div>
    `;
  }

  return { shuffle, createQueue, levelSelector, resultScreen };
})();
