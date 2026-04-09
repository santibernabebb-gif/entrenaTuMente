
// js/games/memory.js — Parejas con niveles fáciles y feedback claro

const GameMemory = (() => {
  let cards = [], flipped = [], matched = 0, moves = 0, locked = false;
  let currentLevel = 6;
  let startTime = null;
  let sessionCallback = null;
  const usedEmojis = [];

  function getConfig(level) {
    if (level === 6) return { pairs: 6, cols: 'cols-3', label: 'facil' };
    return { pairs: 8, cols: 'cols-4', label: 'normal' };
  }

  function pickEmojis(count) {
    const pool = DATA.memoryEmojis;
    if (usedEmojis.length >= pool.length - count) usedEmojis.length = 0;
    const available = pool.filter(e => !usedEmojis.includes(e));
    const chosen = Shared.shuffle(available).slice(0, count);
    chosen.forEach(e => usedEmojis.push(e));
    return chosen;
  }

  function getContainer() {
    return document.getElementById(sessionCallback ? 'session-container' : 'game-container');
  }

  function init(level, onComplete) {
    sessionCallback = onComplete || null;
    currentLevel = level || 6;
    const cfg = getConfig(currentLevel);
    const pool = pickEmojis(cfg.pairs);
    cards = Shared.shuffle([...pool, ...pool]).map((emoji, i) => ({ id: i, emoji, matched: false }));
    flipped = [];
    matched = 0;
    moves = 0;
    locked = false;
    startTime = Date.now();
    render(cfg);
  }

  function render(cfg) {
    const cfgUse = cfg || getConfig(currentLevel);
    const el = getContainer();
    const levelHtml = sessionCallback ? '' : `
      <div class="level-panel">
        <div class="level-panel-title">Elige dificultad</div>
        <div class="level-btns">
          <button class="level-btn ${currentLevel===6?'active':''}" onclick="GameMemory.changeLevel(6)">🌱 Fácil</button>
          <button class="level-btn ${currentLevel===8?'active':''}" onclick="GameMemory.changeLevel(8)">⭐ Normal</button>
        </div>
      </div>`;

    el.innerHTML = `
      ${levelHtml}
      <div class="memory-info">
        <span>Movimientos: <strong id="mem-moves">0</strong></span>
        <span>Parejas: <strong id="mem-matched">0</strong> / ${cfgUse.pairs}</span>
      </div>
      <div class="memory-board ${cfgUse.cols}" id="memory-board">
        ${cards.map((c, i) => `
          <div class="memory-card" id="mcard-${i}" onclick="GameMemory.flip(${i})" aria-label="Carta de memoria">
            <div class="card-face card-back">🌟</div>
            <div class="card-face card-front"><span class="memory-emoji">${c.emoji}</span></div>
          </div>
        `).join('')}
      </div>
      <p class="memory-tip">Encuentra dos cartas iguales.</p>
    `;
  }

  function flip(i) {
    if (locked || cards[i].matched || flipped.includes(i) || flipped.length >= 2) return;
    document.getElementById(`mcard-${i}`)?.classList.add('flipped');
    flipped.push(i);
    if (flipped.length === 2) {
      moves++;
      const movesEl = document.getElementById('mem-moves');
      if (movesEl) movesEl.textContent = moves;
      locked = true;
      checkPair();
    }
  }

  function checkPair() {
    const [a, b] = flipped;
    if (cards[a].emoji === cards[b].emoji) {
      setTimeout(() => {
        const ca = document.getElementById(`mcard-${a}`);
        const cb = document.getElementById(`mcard-${b}`);
        [ca, cb].forEach((cardEl, idx) => {
          if (!cardEl) return;
          cardEl.classList.add('matched');
          const emoji = idx === 0 ? cards[a].emoji : cards[b].emoji;
          const front = cardEl.querySelector('.card-front');
          if (front) {
            front.innerHTML = `
              <span class="memory-emoji">${emoji}</span>
              <span class="memory-check">✅</span>
            `;
          }
        });
        cards[a].matched = true;
        cards[b].matched = true;
        matched++;
        const matchedEl = document.getElementById('mem-matched');
        if (matchedEl) matchedEl.textContent = matched;
        App.showFeedback(true, '¡Pareja encontrada!');
        flipped = [];
        locked = false;
        if (matched === getConfig(currentLevel).pairs) setTimeout(onWin, 500);
      }, 260);
    } else {
      setTimeout(() => {
        document.getElementById(`mcard-${a}`)?.classList.remove('flipped');
        document.getElementById(`mcard-${b}`)?.classList.remove('flipped');
        flipped = [];
        locked = false;
      }, 900);
    }
  }

  function onWin() {
    const secs = Math.round((Date.now() - startTime) / 1000);
    Progress.recordGame('memory', matched, matched);
    if (sessionCallback) { sessionCallback(true); return; }
    getContainer().innerHTML = `
      <div class="result-block">
        <div class="result-icon">🎉</div>
        <div class="result-title">¡Fantástico!</div>
        <div class="result-sub">Has encontrado todas las parejas en ${moves} movimientos y ${secs} segundos.</div>
        <button class="btn-next" onclick="GameMemory.init(${currentLevel})">🔄 Jugar otra vez</button>
        <button class="btn-next" style="background:var(--sky);margin-top:10px" onclick="App.showScreen('home')">🏠 Volver al inicio</button>
      </div>
    `;
  }

  function changeLevel(l) { init(l, sessionCallback); }

  return { init, flip, changeLevel };
})();
