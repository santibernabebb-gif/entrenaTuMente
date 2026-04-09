// js/games/memory.js — Parejas con animación de acierto y antirrepetición

const GameMemory = (() => {
  let cards = [], flipped = [], matched = 0, moves = 0, locked = false;
  let currentLevel = 8;
  let startTime = null;
  let sessionCallback = null;
  const usedEmojis = [];

  function getConfig(level) {
    if (level === 6) return { pairs: 6, cols: 'cols-3' };
    if (level === 8) return { pairs: 8, cols: 'cols-4' };
    return { pairs: 6, cols: 'cols-3' };
  }

  function pickEmojis(count) {
    const pool = DATA.memoryEmojis;
    // reset if mostly used
    if (usedEmojis.length >= pool.length - count) usedEmojis.length = 0;
    const available = pool.filter(e => !usedEmojis.includes(e));
    const chosen = Shared.shuffle(available).slice(0, count);
    chosen.forEach(e => usedEmojis.push(e));
    return chosen;
  }

  function init(level, onComplete) {
    currentLevel = level || 8;
    sessionCallback = onComplete || null;
    const cfg = getConfig(currentLevel);
    const pool = pickEmojis(cfg.pairs);
    cards = Shared.shuffle([...pool, ...pool]).map((emoji, i) => ({ id: i, emoji, matched: false }));
    flipped = []; matched = 0; moves = 0; locked = false;
    startTime = Date.now();
    render(cfg);
  }

  function render(cfg) {
    const cfgUse = cfg || getConfig(currentLevel);
    const el = document.getElementById('game-container');
    el.innerHTML = `
      <div class="memory-info">
        <span>Movimientos: <strong id="mem-moves">0</strong></span>
        <span>Parejas: <strong id="mem-matched">0</strong> / ${cfgUse.pairs}</span>
      </div>
      <div class="level-btns level-btns-large" style="margin-bottom:16px">
        <button class="level-btn ${currentLevel===6?'active':''}" onclick="GameMemory.changeLevel(6)">🌱 Fácil</button>
        <button class="level-btn ${currentLevel===8?'active':''}" onclick="GameMemory.changeLevel(8)">⭐ Normal</button>
      </div>
      <div class="memory-board ${cfgUse.cols}" id="memory-board">
        ${cards.map((c, i) => `
          <div class="memory-card" id="mcard-${i}" onclick="GameMemory.flip(${i})">
            <div class="card-face card-back">🌟</div>
            <div class="card-face card-front">${c.emoji}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function flip(i) {
    if (locked || cards[i].matched || flipped.includes(i) || flipped.length >= 2) return;
    document.getElementById(`mcard-${i}`).classList.add('flipped');
    flipped.push(i);
    if (flipped.length === 2) {
      moves++;
      document.getElementById('mem-moves').textContent = moves;
      locked = true;
      checkPair();
    }
  }

  function checkPair() {
    const [a, b] = flipped;
    if (cards[a].emoji === cards[b].emoji) {
      // Show match animation
      setTimeout(() => {
        const ca = document.getElementById(`mcard-${a}`);
        const cb = document.getElementById(`mcard-${b}`);
        if (ca) { ca.classList.add('matched'); ca.querySelector('.card-front').innerHTML = `<span style="font-size:1.6rem">${cards[a].emoji}</span><div style="font-size:1.2rem;color:var(--sage)">✅</div>`; }
        if (cb) { cb.classList.add('matched'); cb.querySelector('.card-front').innerHTML = `<span style="font-size:1.6rem">${cards[b].emoji}</span><div style="font-size:1.2rem;color:var(--sage)">✅</div>`; }
        cards[a].matched = true;
        cards[b].matched = true;
        matched++;
        document.getElementById('mem-matched').textContent = matched;
        App.showFeedback(true, '¡Pareja encontrada!');
        flipped = [];
        locked = false;
        if (matched === getConfig(currentLevel).pairs) setTimeout(onWin, 500);
      }, 300);
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
    document.getElementById('game-container').innerHTML = `
      <div class="result-block">
        <div class="result-icon">🎉</div>
        <div class="result-title">¡Fantástico!</div>
        <div class="result-sub">Todas las parejas en ${moves} movimientos y ${secs} segundos. ¡Excelente memoria!</div>
        <button class="btn-next" onclick="GameMemory.init(${currentLevel})">🔄 Jugar otra vez</button>
        <button class="btn-next" style="background:var(--sky);margin-top:10px" onclick="App.showScreen('home')">🏠 Volver al inicio</button>
      </div>
    `;
  }

  function changeLevel(l) { init(l); }

  return { init, flip, changeLevel };
})();
