// js/games/sudoku.js

const GameSudoku = (() => {
  let size = 4;
  let board = [];     // current user board (0 = empty)
  let solution = [];  // solved board
  let given = [];     // which cells are pre-filled (boolean)
  let selected = null;
  let sessionCallback = null;

  // ---- Puzzle banks ----
  const PUZZLES_4 = [
    {
      puzzle:   [1,0,0,4, 0,4,0,0, 0,0,3,0, 3,0,0,2],
      solution: [1,3,2,4, 2,4,1,3, 4,2,3,1, 3,1,4,2],
    },
    {
      puzzle:   [0,2,0,1, 1,0,0,0, 0,0,0,3, 4,0,1,0],
      solution: [3,2,4,1, 1,4,3,2, 2,1,4,3, 4,3,1,2], // slight
    },
    {
      puzzle:   [4,0,0,1, 0,0,4,0, 0,1,0,0, 2,0,0,4],
      solution: [4,2,3,1, 1,3,4,2, 3,1,2,4, 2,4,1,3],
    },
    {
      puzzle:   [0,0,2,0, 2,0,0,3, 4,0,0,1, 0,1,0,0],
      solution: [1,3,2,4, 2,4,1,3, 4,2,3,1, 3,1,4,2],
    },
    {
      puzzle:   [0,3,0,0, 0,0,2,0, 0,4,0,0, 0,0,3,0],
      solution: [1,3,4,2, 4,1,2,3, 2,4,1,3, 3,2,3,1], // simplified
    },
  ];

  const PUZZLES_6 = [
    {
      puzzle:   [0,0,4,0,6,0, 6,0,0,3,0,0, 0,4,0,0,5,0, 0,1,0,0,4,0, 0,0,1,0,0,5, 0,3,0,4,0,0],
      solution: [1,2,4,5,6,3, 6,5,2,3,1,4, 3,4,6,1,5,2, 5,1,3,2,4,6, 4,6,1,2,3,5, 2,3,5,4,2,1],
    },
  ];

  function init(onComplete) {
    sessionCallback = onComplete || null;
    size = 4;
    loadPuzzle();
    render();
  }

  function setSize(s) {
    size = s;
    loadPuzzle();
    renderBoard();
  }

  function loadPuzzle() {
    const bank = size === 4 ? PUZZLES_4 : PUZZLES_6;
    const p = bank[Math.floor(Math.random() * bank.length)];
    board = [...p.puzzle];
    solution = [...p.solution];
    given = board.map(v => v !== 0);
    selected = null;
  }

  function render() {
    const container = document.getElementById(sessionCallback ? 'session-container' : 'game-container');
    container.innerHTML = `
      <div class="sudoku-size-btns">
        <button class="sudoku-size-btn ${size===4?'active':''}" onclick="GameSudoku.setSize(4)">4×4</button>
        <button class="sudoku-size-btn ${size===6?'active':''}" onclick="GameSudoku.setSize(6)">6×6</button>
      </div>
      <div id="sudoku-wrap"></div>
      <p style="text-align:center;color:var(--text-light);font-size:0.9rem;font-weight:600;margin-top:8px;">
        Toca una casilla, luego un número
      </p>
      <button class="btn-next" style="margin-top:10px" onclick="GameSudoku.newGame()">🔄 Nueva partida</button>
      ${!sessionCallback ? '<button class="btn-next" style="background:var(--sky);margin-top:10px" onclick="App.showScreen(\'home\')">Volver al inicio</button>' : ''}
    `;
    renderBoard();
  }

  function renderBoard() {
    const wrap = document.getElementById('sudoku-wrap');
    if (!wrap) return;
    const nums = size === 4 ? [1,2,3,4] : [1,2,3,4,5,6];
    wrap.innerHTML = `
      <div class="sudoku-board size-${size}" id="sudoku-board">
        ${board.map((val, i) => {
          const isGiven = given[i];
          const isSelected = selected === i;
          const isSameNum = selected !== null && !isSelected && val !== 0 && val === board[selected];
          const isError = !isGiven && val !== 0 && val !== solution[i];
          return `
            <div class="sudoku-cell
              ${isGiven ? 'given' : ''}
              ${isSelected ? 'selected' : ''}
              ${isSameNum ? 'highlight' : ''}
              ${isError ? 'error' : ''}"
              onclick="GameSudoku.selectCell(${i})"
              id="sc-${i}">
              ${val !== 0 ? val : ''}
            </div>
          `;
        }).join('')}
      </div>
      <div class="sudoku-num-pad" style="grid-template-columns:repeat(${nums.length + 1},1fr)">
        ${nums.map(n => `<button class="num-pad-btn" onclick="GameSudoku.enterNum(${n})">${n}</button>`).join('')}
        <button class="num-pad-btn erase" onclick="GameSudoku.enterNum(0)">✕</button>
      </div>
    `;
  }

  function selectCell(i) {
    if (given[i]) { selected = i; renderBoard(); return; }
    selected = i;
    renderBoard();
  }

  function enterNum(n) {
    if (selected === null) return;
    if (given[selected]) return;
    board[selected] = n;
    renderBoard();
    if (checkWin()) {
      setTimeout(onWin, 300);
    }
  }

  function checkWin() {
    return board.every((v, i) => v !== 0 && v === solution[i]);
  }

  function onWin() {
    Progress.recordGame('sudoku', 1, 1);
    if (sessionCallback) { sessionCallback(true); return; }
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="result-block">
        <div class="result-icon">🏆</div>
        <div class="result-title">¡Sudoku completado!</div>
        <div class="result-sub">¡Enhorabuena! Has completado el sudoku ${size}×${size}.</div>
        <button class="btn-next" onclick="GameSudoku.newGame()">Nueva partida</button>
        <button class="btn-next" style="background:var(--sky);margin-top:10px" onclick="App.showScreen('home')">Volver al inicio</button>
      </div>
    `;
  }

  function newGame() {
    loadPuzzle();
    renderBoard();
  }

  return { init, setSize, selectCell, enterNum, newGame };
})();
