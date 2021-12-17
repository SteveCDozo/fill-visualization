const GRID_SIZE = 600,
  TILE_SIZE = 50,
  GRID_COLOR = 'darkgray',
  GRID_BG_COLOR = 'lightgray',
  HIGHLIGHT_COLOR = 'yellow',
  MARK_COLOR = 'lightblue',
  PAINT_COLOR = 'black',
  DRAW_CURSOR = 'url(cursors/paint.svg) 0 24, auto',
  FILL_CURSOR = 'url(cursors/color-fill.svg) 0 24, auto',
  SPEED_INCREMENT = 0.25,
  MIN_SPEED = SPEED_INCREMENT,
  MAX_SPEED = 2,
  INITIAL_DRAW_DELAY = 500;

const canvas = document.getElementById('canvas'),
  speedDisplay = document.getElementById('speed'),
  decSpeedBtn = document.getElementById('decreaseSpeed'),
  incSpeedBtn = document.getElementById('increaseSpeed'),
  ctx = canvas.getContext('2d'),
  grid = [];

canvas.width = GRID_SIZE;
canvas.height = GRID_SIZE;
ctx.lineWidth = 2; // workaround for pixel color blending issue

let activeTile, currentTile, activeTool = 'draw', isDrawing = false,
  drawDelay = INITIAL_DRAW_DELAY, speed = 1;

// initializes the 2d array that holds the grid tiles
function initializeGrid() {
  for (let y = 0; y < GRID_SIZE; y += TILE_SIZE) {
    let row = [];

    for (let x = 0; x < GRID_SIZE; x += TILE_SIZE)      
      row.push({x, y, visited: false, painted: false});
    
    grid.push(row);
  }
}

function drawGrid() {
  ctx.strokeStyle = GRID_COLOR;
  ctx.beginPath();

  // draw columns
  for (let x = TILE_SIZE; x < GRID_SIZE; x += TILE_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GRID_SIZE)
  }

  // draw rows
  for (let y = TILE_SIZE; y < GRID_SIZE; y += TILE_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(GRID_SIZE, y)
  }

  ctx.stroke();

  // draw borders
  ctx.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);
}

function getTile(x, y) {
  // there's a possibility the x or y offset coordinate may 
  // be off the grid, so just adjust it accordingly
  if (x < 0)
    x = 0;
  else if (x >= GRID_SIZE)
    x = GRID_SIZE-1;
  if (y < 0)
    y = 0;
  else if (y >= GRID_SIZE)
    y = GRID_SIZE-1;

  x = Math.floor(x/TILE_SIZE);
  y = Math.floor(y/TILE_SIZE);

  return grid[y][x];
}

function isActiveTile(t) {
  return activeTile && t.x == activeTile.x && t.y == activeTile.y;
}

// removes highlight from previously active tile, updates the active tile & highlights it
function setActiveTile(t) {
  if (activeTile) unhighlightTile(activeTile);
  highlightTile(t);    
  activeTile = t;
}

function highlightTile(t) {
  colorTile(t, HIGHLIGHT_COLOR);
}

function unhighlightTile(t) {
  colorTile(t, GRID_COLOR);
}

function markTile(t) {
  paintTile(t, MARK_COLOR);
}

function paintTile(t, color) {
  if (t.painted) return; // skip if it's already been painted
  
  ctx.fillStyle = color ? color : PAINT_COLOR;
  ctx.fillRect(t.x, t.y, TILE_SIZE, TILE_SIZE);
  t.painted = true;
}

function colorTile(t, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.strokeRect(t.x, t.y, TILE_SIZE, TILE_SIZE);
}

function floodFill(t) {
  // display blue border if tile was already visited
  if (t.visited) {
    colorTile(t, 'blue');
    setTimeout(() => colorTile(t, GRID_COLOR), drawDelay);
    return;
  }

  // display red border if tile was already painted
  if (t.painted) {
    colorTile(t, 'red');
    setTimeout(() => colorTile(t, GRID_COLOR), drawDelay);
    return;
  }

  // display green border and continue flood fill
  colorTile(t, 'green');
  setTimeout(() => {
    
    colorTile(t, GRID_COLOR); // reset the border color
    markTile(t); // color tile and mark it as visited
    t.visited = true;

    // repeat for adjacent tiles
    const adjTiles = getAdjacentTiles(t);
    for (const tile of adjTiles)
      setTimeout(() => floodFill(tile), drawDelay);

  }, drawDelay);
}

// returns the tiles directly north, south, east, & west that are within the grid
function getAdjacentTiles(t) {
  const lowerBound = 0, upperBound = GRID_SIZE - TILE_SIZE;
  let adj = [];

  if (t.y > lowerBound) // north tile
    adj.push( getTile(t.x, t.y - TILE_SIZE) );
  if (t.y < upperBound)  // south tile
    adj.push( getTile(t.x, t.y + TILE_SIZE) );
  if (t.x < upperBound) // east tile
    adj.push( getTile(t.x + TILE_SIZE, t.y) );
  if (t.x > lowerBound) // west tile
    adj.push( getTile(t.x - TILE_SIZE, t.y) );
  
  return adj;
}

function setActiveTool(tool) {
  activeTool = tool;
  updateCursor();  
}

function updateCursor() {
  if (activeTool === 'draw')
    canvas.style.cursor = DRAW_CURSOR;
  else if (activeTool === 'fill')
    canvas.style.cursor = FILL_CURSOR;
}

function reset() {
  ctx.fillStyle = GRID_BG_COLOR;
  ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
  drawGrid();

  for (const row of grid)
    for (const tile of row) {
      tile.visited = false;
      tile.painted = false;
    }
}

// increases anim speed if increase is true, otherwise decreases speed
function changeSpeed(increase) {

  if ((increase && speed == MAX_SPEED) ||
     (!increase && speed == MIN_SPEED))
    return;

  speed += increase ? SPEED_INCREMENT : -SPEED_INCREMENT;

  drawDelay = Math.floor(INITIAL_DRAW_DELAY / speed);
  speedDisplay.innerText = speed;

  updateSpeedControls();
}

// determines which speed controls should be enabled/disabled
function updateSpeedControls() {
  switch (speed) {
    case MIN_SPEED:
      enableSpeedControls(false, true);
      break;
    case MAX_SPEED:
      enableSpeedControls(true, false);
      break;
    default:
      enableSpeedControls(true, true);
  }
}

// enables/disables the speed controls as specified
function enableSpeedControls(decEnabled, incEnabled) {

  if ((decEnabled && decSpeedBtn.disabled) ||
      (!decEnabled && !decSpeedBtn.disabled))
    decSpeedBtn.disabled = !decSpeedBtn.disabled;
  
  if ((incEnabled && incSpeedBtn.disabled) ||
      (!incEnabled && !incSpeedBtn.disabled))
    incSpeedBtn.disabled = !incSpeedBtn.disabled;
}

canvas.addEventListener('mousemove', e => {
  // event.offsetX & event.offsetY give the (x,y) offset from the edge of the canvas
  currentTile = getTile(e.offsetX, e.offsetY);

  // if the current tile is not the active tile, then update the active tile to be the current one
  if (!isActiveTile(currentTile)) {
    setActiveTile(currentTile);
    if (isDrawing) paintTile(currentTile); // paint the tile if drawing
  }
});

canvas.addEventListener('mousedown', () => {
  if (activeTool === 'draw') {
    isDrawing = true;
    paintTile(activeTile);
  }
  else if (activeTool === 'fill')
    floodFill(currentTile)
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) isDrawing = false;
});

initializeGrid();
drawGrid();
updateCursor();