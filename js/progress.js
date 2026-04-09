// js/progress.js — localStorage-based progress tracking

const Progress = (() => {
  const KEY = 'entrena-tu-mente-progress';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || defaultData();
    } catch {
      return defaultData();
    }
  }

  function defaultData() {
    return {
      totalGames: 0,
      gameCounts: {},
      daysPlayed: [],
      lastPlayed: null,
      currentStreak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
    };
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function recordGame(gameId, correct = 0, total = 0) {
    const data = load();
    data.totalGames++;
    data.gameCounts[gameId] = (data.gameCounts[gameId] || 0) + 1;
    data.totalCorrect += correct;
    data.totalAnswered += total;

    const today = new Date().toISOString().slice(0, 10);
    data.lastPlayed = today;

    if (!data.daysPlayed.includes(today)) {
      data.daysPlayed.push(today);
      // Update streak
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      if (data.daysPlayed.includes(yesterday)) {
        data.currentStreak = (data.currentStreak || 0) + 1;
      } else {
        data.currentStreak = 1;
      }
      if (data.currentStreak > (data.bestStreak || 0)) {
        data.bestStreak = data.currentStreak;
      }
    }

    save(data);
  }

  function getTopGames() {
    const data = load();
    return Object.entries(data.gameCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }

  function reset() {
    save(defaultData());
  }

  function renderScreen() {
    const data = load();
    const top = getTopGames();

    const gameNames = {
      memory: '🃏 Parejas',
      cualSobra: '❓ ¿Cuál sobra?',
      secuencias: '🔢 Secuencias',
      memoriaBreve: '⏱️ Memoria breve',
      asociaciones: '🔗 Asociaciones',
      ordenLogico: '📋 Orden lógico',
      atencionVisual: '👁️ Atención visual',
      palabras: '🔤 Palabras',
      categorias: '📦 Categorías',
    };

    const pct = data.totalAnswered > 0
      ? Math.round((data.totalCorrect / data.totalAnswered) * 100)
      : 0;

    const el = document.getElementById('progress-content');
    el.innerHTML = `
      <div class="progress-grid" style="margin-bottom:14px">
        <div class="progress-card">
          <h3>Días jugados</h3>
          <div class="progress-big-num">${data.daysPlayed.length}</div>
          <div class="progress-label">días distintos</div>
        </div>
        <div class="progress-card">
          <h3>Partidas totales</h3>
          <div class="progress-big-num">${data.totalGames}</div>
          <div class="progress-label">juegos completados</div>
        </div>
        <div class="progress-card">
          <h3>Racha actual</h3>
          <div class="progress-big-num">${data.currentStreak || 0}</div>
          <div class="progress-label">días seguidos 🔥</div>
        </div>
        <div class="progress-card">
          <h3>Aciertos</h3>
          <div class="progress-big-num">${pct}%</div>
          <div class="progress-label">de respuestas correctas</div>
        </div>
      </div>

      <div class="progress-card" style="margin-bottom:14px">
        <h3>Mejor racha</h3>
        <div class="progress-row">
          <span>Mejor racha seguida</span>
          <span class="progress-row-val">${data.bestStreak || 0} días</span>
        </div>
        <div class="progress-row">
          <span>Última vez jugado</span>
          <span class="progress-row-val">${data.lastPlayed || 'Nunca'}</span>
        </div>
      </div>

      ${top.length > 0 ? `
      <div class="progress-card" style="margin-bottom:14px">
        <h3>Tus juegos favoritos</h3>
        ${top.map(([id, count]) => `
          <div class="progress-row">
            <span>${gameNames[id] || id}</span>
            <span class="progress-row-val">${count} veces</span>
          </div>
        `).join('')}
      </div>
      ` : `
      <div class="progress-card center" style="color:var(--text-light);margin-bottom:14px">
        <p>¡Juega tu primera partida para ver tu progreso!</p>
      </div>
      `}

      <div class="progress-card">
        <button class="btn-reset-progress" onclick="if(confirm('¿Borrar todo el progreso?')){Progress.reset();Progress.renderScreen();}">
          🗑️ Borrar mi progreso
        </button>
      </div>
    `;
  }

  return { recordGame, reset, renderScreen, load };
})();
