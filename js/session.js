// js/session.js — Sesión rápida (5 mini-retos variados)

const Session = (() => {
  const GAME_POOL = [
    { id: 'cualSobra',     fn: () => GameCualSobra.init(Session.nextStep) },
    { id: 'secuencias',    fn: () => GameSecuencias.init(Session.nextStep) },
    { id: 'asociaciones',  fn: () => GameAsociaciones.init(Session.nextStep) },
    { id: 'atencionVisual',fn: () => GameAtencionVisual.init(Session.nextStep) },
    { id: 'memoriaBreve',  fn: () => GameMemoriaBreve.init(Session.nextStep) },
    { id: 'palabras',      fn: () => GamePalabras.init(Session.nextStep) },
    { id: 'categorias',    fn: () => GameCategorias.init(Session.nextStep) },
    { id: 'ordenLogico',   fn: () => GameOrdenLogico.init(Session.nextStep) },
  ];

  const TOTAL = 5;
  let plan = [];
  let stepIndex = 0;
  let resultsOk = 0;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function start() {
    plan = shuffle([...GAME_POOL]).slice(0, TOTAL);
    stepIndex = 0;
    resultsOk = 0;
    App.showScreen('session');
    runStep();
  }

  function runStep() {
    updateCounter();
    const step = plan[stepIndex];
    const container = document.getElementById('session-container');
    container.innerHTML = `<p style="text-align:center;padding:40px;color:var(--text-light);font-weight:700;font-size:1.1rem;">Cargando...</p>`;
    setTimeout(() => {
      step.fn();
    }, 200);
  }

  function nextStep(wasOk) {
    if (wasOk) resultsOk++;
    stepIndex++;
    if (stepIndex >= TOTAL) {
      showEnd();
    } else {
      runStep();
    }
  }

  function updateCounter() {
    const el = document.getElementById('session-counter');
    if (el) el.textContent = `${stepIndex + 1} / ${TOTAL}`;
  }

  function showEnd() {
    App.showScreen('session');
    const container = document.getElementById('session-container');
    const emoji = resultsOk >= TOTAL * 0.8 ? '🌟' : resultsOk >= TOTAL * 0.5 ? '😊' : '💪';
    const msg = resultsOk >= TOTAL * 0.8
      ? '¡Sesión brillante!'
      : resultsOk >= TOTAL * 0.5
      ? '¡Muy buen trabajo!'
      : '¡Ya has hecho tu sesión de hoy!';

    container.innerHTML = `
      <div class="session-end">
        <div class="session-end-icon">${emoji}</div>
        <div class="session-end-title">${msg}</div>
        <div class="session-end-sub">Hoy has jugado ${TOTAL} retos distintos.<br>Eso mantiene tu mente activa y despierta.</div>
        <div class="session-stats">
          <div class="session-stat">
            <div class="session-stat-num">${TOTAL}</div>
            <div class="session-stat-label">Retos jugados</div>
          </div>
          <div class="session-stat">
            <div class="session-stat-num">${resultsOk}</div>
            <div class="session-stat-label">Superados</div>
          </div>
        </div>
        <button class="btn-next" onclick="Session.start()">🔄 Jugar otra sesión</button>
        <button class="btn-next" style="background:var(--sky);margin-top:12px" onclick="App.showScreen('home')">Volver al inicio</button>
      </div>
    `;
  }

  function end() {
    App.showScreen('home');
  }

  return { start, nextStep, end };
})();
