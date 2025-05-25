let size, grid, tiles = [], score = 0, gameStarted = false;
  const gap = 10;
  let tileSize;
  const startBtn = document.getElementById('start-btn');
  const gridElem = document.getElementById('grid');
  const scoreElem = document.getElementById('score');
  const startScreen = document.getElementById('start-screen');
  const gameContainer = document.getElementById('game-container');
  const resetBtn = document.getElementById('reset-btn');
  const backBtn = document.getElementById('back-btn');
  const gameControls = document.getElementById('game-controls');

  function calculateTileSize() {
    const maxGridPx = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    return Math.floor((maxGridPx - gap * (size + 1)) / size);
  }

  function createGrid() {
    grid = Array.from({ length: size }, () => Array(size).fill(0));
    tiles.forEach(t => t.el.remove());
    tiles = [];
    score = 0;
    scoreElem.textContent = score;

    tileSize = calculateTileSize();
    gridElem.style.width = (tileSize * size + gap * (size + 1)) + 'px';
    gridElem.style.height = (tileSize * size + gap * (size + 1)) + 'px';
    gridElem.style.gridTemplateColumns = `repeat(${size}, ${tileSize}px)`;
    gridElem.style.gridTemplateRows = `repeat(${size}, ${tileSize}px)`;
  }

  function addRandomTile() {
    let emptyCells = [];
    for(let r=0; r<size; r++) {
      for(let c=0; c<size; c++) {
        if(grid[r][c] === 0) emptyCells.push({r, c});
      }
    }
    if(emptyCells.length === 0) return false;
    const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;
    grid[r][c] = val;
    const tileEl = document.createElement('div');
    tileEl.classList.add('tile');
    tileEl.textContent = val;
    tileEl.style.width = tileSize + 'px';
    tileEl.style.height = tileSize + 'px';
    tileEl.style.lineHeight = tileSize + 'px';
    tileEl.style.fontSize = Math.floor(tileSize * 0.5) + 'px';
    tileEl.style.backgroundColor = getTileColor(val);
    tileEl.style.borderRadius = '8px';
    tileEl.style.position = 'absolute';
    setTilePosition(tileEl, r, c);
    gridElem.appendChild(tileEl);
    tiles.push({r, c, val, el: tileEl});
    return true;
  }

  function getTileColor(val) {
    const colors = {
      2: '#ffeb3b', 4: '#ffc107', 8: '#ff9800', 16: '#ff5722',
      32: '#f44336', 64: '#e91e63', 128: '#9c27b0', 256: '#673ab7',
      512: '#3f51b5', 1024: '#2196f3', 2048: '#03a9f4'
    };
    return colors[val] || '#009688';
  }

  function setTilePosition(tileEl, r, c) {
    tileEl.style.transform = `translate(${gap + c*(tileSize + gap)}px, ${gap + r*(tileSize + gap)}px)`;
  }

  function renderTiles() {
    tiles.forEach(t => {
      t.el.textContent = t.val;
      t.el.style.backgroundColor = getTileColor(t.val);
      setTilePosition(t.el, t.r, t.c);
    });
    scoreElem.textContent = score;
  }

  function moveTiles(direction) {
    let moved = false;
    const merged = Array.from({ length: size }, () => Array(size).fill(false));
    const vector = {
      'ArrowUp':    {r: -1, c: 0, rStart: 1, rEnd: size, rStep: 1, cStart: 0, cEnd: size, cStep: 1},
      'ArrowDown':  {r: 1, c: 0, rStart: size-2, rEnd: -1, rStep: -1, cStart: 0, cEnd: size, cStep:1},
      'ArrowLeft':  {r: 0, c: -1, rStart: 0, rEnd: size, rStep:1, cStart:1, cEnd: size, cStep:1},
      'ArrowRight': {r: 0, c: 1, rStart: 0, rEnd: size, rStep:1, cStart:size-2, cEnd:-1, cStep:-1}
    }[direction];
    if(!vector) return false;

    for(let r = vector.rStart; r !== vector.rEnd; r += vector.rStep) {
      for(let c = vector.cStart; c !== vector.cEnd; c += vector.cStep) {
        if(grid[r][c] === 0) continue;
        let cr = r, cc = c;
        let val = grid[r][c];
        while(true) {
          let nr = cr + vector.r;
          let nc = cc + vector.c;
          if(nr < 0 || nr >= size || nc < 0 || nc >= size) break;

          if(grid[nr][nc] === 0) {
            grid[nr][nc] = grid[cr][cc];
            grid[cr][cc] = 0;
            const tile = tiles.find(t => t.r === cr && t.c === cc);
            tile.r = nr;
            tile.c = nc;
            cr = nr;
            cc = nc;
            moved = true;
          } else if(grid[nr][nc] === val && !merged[nr][nc]) {
            grid[nr][nc] *= 2;
            score += grid[nr][nc];
            grid[cr][cc] = 0;
            merged[nr][nc] = true;
            const tile = tiles.find(t => t.r === cr && t.c === cc);
            tile.r = nr;
            tile.c = nc;
            tile.val = grid[nr][nc];
            const idx = tiles.findIndex(t => t.r === nr && t.c === nc && t !== tile);
            if(idx !== -1) {
              tiles[idx].el.remove();
              tiles.splice(idx, 1);
            }
            moved = true;
            break;
          } else {
            break;
          }
        }
      }
    }

    if(moved) renderTiles();
    return moved;
  }

  function checkGameOver() {
    for(let r=0; r<size; r++) {
      for(let c=0; c<size; c++) {
        if(grid[r][c] === 0) return false;
        const val = grid[r][c];
        for(let [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          let nr = r + dr, nc = c + dc;
          if(nr>=0 && nr<size && nc>=0 && nc<size && grid[nr][nc] === val) return false;
        }
      }
    }
    return true;
  }

  function startGame() {
    size = parseInt(document.getElementById('grid-size').value);
    if(isNaN(size) || size < 4) size = 4;
    if(size > 8) size = 8;
    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    gameControls.style.display = 'block';
    gameStarted = true;
    createGrid();
    addRandomTile();
    addRandomTile();
    renderTiles();
  }

  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', () => {
    createGrid();
    addRandomTile();
    addRandomTile();
    renderTiles();
  });
  backBtn.addEventListener('click', () => {
    startScreen.style.display = 'block';
    gameContainer.style.display = 'none';
    gameControls.style.display = 'none';
    gameStarted = false;
  });

  window.addEventListener('keydown', e => {
    if (!gameStarted) return;
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    if (moveTiles(e.key)) {
      setTimeout(() => {
        if (!addRandomTile()) {
          alert('Game Over! Your score: ' + score);
          startScreen.style.display = 'block';
          gameContainer.style.display = 'none';
          gameControls.style.display = 'none';
          gameStarted = false;
          return;
        }
        if (checkGameOver()) {
          alert('Game Over! Your score: ' + score);
          startScreen.style.display = 'block';
          gameContainer.style.display = 'none';
          gameControls.style.display = 'none';
          gameStarted = false;
        }
        renderTiles();
      }, 180);
    }
  });
