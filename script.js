const GRID_SIZE = 600,
  TILE_SIZE = 50,
  GRID_COLOR = 'darkgray',
  GRID_BG_COLOR = 'lightgray',
  ACTIVE_HIGHLIGHT_COLOR = 'yellow',
  VISITED_HIGHLIGHT_COLOR = 'blue',
  PAINTED_HIGHLIGHT_COLOR = 'red',
  VALID_HIGHLIGHT_COLOR = 'green',
  FILL_COLOR = 'lightblue',
  DRAW_COLOR = 'black',
  DRAW_CURSOR = 'url(cursors/paint.svg) 0 24, auto',
  FILL_CURSOR = 'url(cursors/color-fill.svg) 0 24, auto',
  WAIT_CURSOR = 'wait',
  SPEED_INCREMENT = 0.25,
  MIN_SPEED = SPEED_INCREMENT,
  MAX_SPEED = 2,
  INITIAL_DRAW_DELAY = 500;

const canvas = document.getElementById('canvas'),
  speedDisplay = document.getElementById('speed'),
  decSpeedBtn = document.getElementById('decreaseSpeed'),
  incSpeedBtn = document.getElementById('increaseSpeed'),
  ctx = canvas.getContext('2d'),
  grid = [],
  drawQueue = [];

canvas.width = GRID_SIZE;
canvas.height = GRID_SIZE;
ctx.lineWidth = 2; // workaround for pixel color blending issue

let activeTile, activeTool = 'draw', isDrawing = false,
  drawDelay = INITIAL_DRAW_DELAY, speed = 1, drawInterval;

// initializes the 2d array that holds the grid tiles
function initializeGrid() {
  for (let y = 0; y < GRID_SIZE; y += TILE_SIZE) {
    let row = [];

    for (let x = 0; x < GRID_SIZE; x += TILE_SIZE)      
      row.push({x, y, visited: false, painted: false, willCheck: false});
    
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
  /* there's a possibility the x or y offset coordinate may 
     be off the grid, so ensure they are within the grid */
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE)
    return undefined;

  x = Math.floor(x/TILE_SIZE);
  y = Math.floor(y/TILE_SIZE);

  return grid[y][x];
}

function isActiveTile(t) {
  return activeTile && isSameTile(activeTile, t);
}

function isSameTile(t1, t2) {
  return t1.x == t2.x && t1.y == t2.y;
}

// removes highlight from previously active tile, updates the active tile & highlights it
function setActiveTile(t) {
  if (activeTile) unhighlightTile(activeTile);
  highlightTile(t, ACTIVE_HIGHLIGHT_COLOR);    
  activeTile = t;
}

/* updates the active tile if the pointer event occured on a different tile
   returns true if the active tile was updated and false otherwise */
function updateActiveTile(e) {
  // event.offsetX & event.offsetY give the (x,y) offset from the edge of the canvas
  const currentTile = getTile(e.offsetX, e.offsetY);

  // stop if tile is undefined or it's already the active tile
  if (!currentTile || isActiveTile(currentTile)) return false; 

  // then update the active tile to be the current one
  setActiveTile(currentTile);
  return true;
}

// paints the tile border with the specified color
function highlightTile(t, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.strokeRect(t.x, t.y, TILE_SIZE, TILE_SIZE);
}

// resets the tile border to the initial color
function unhighlightTile(t) {
  highlightTile(t, GRID_COLOR);
}

function paintTile(t, color) {
  if (t.painted) return; // skip if it's already been painted
  
  ctx.fillStyle = color;
  ctx.fillRect(t.x, t.y, TILE_SIZE, TILE_SIZE);
  t.painted = true;
}

function floodFill(initialTile) {

  const fillQueue = []; // BFS queue for flood fill
  fillQueue.push({tile: initialTile, step: 0}); // add first tile to the queue

  while (fillQueue.length) { // check nodes in queue until empty

    const currFillQueueElem = fillQueue.shift(), // current elem being checked
      t = currFillQueueElem.tile,
      step = currFillQueueElem.step,
      nextDrawQueueElem = { tile: t, step, highlightDrawn: false }; // next elem to be added to queue
    
    if (t.willCheck) t.willCheck = false; // reset willCheck since it is being checked now

    // check if tile was already visited, painted, or valid; set its highlight accordingly
    if (t.visited)
      nextDrawQueueElem['highlightColor'] = VISITED_HIGHLIGHT_COLOR;
    else if (t.painted)
      nextDrawQueueElem['highlightColor'] = PAINTED_HIGHLIGHT_COLOR;
    else
      nextDrawQueueElem['highlightColor'] = VALID_HIGHLIGHT_COLOR;
    
    drawQueue.push(nextDrawQueueElem); // add elem to draw queue
    
    if (t.visited || t.painted) continue; // move on if tile was already visited or painted

    t.visited = true; // mark valid tile as visited

    // add adjacent tiles to queue with an incremented step
    const adjTiles = getAdjacentTiles(t);

    for (const tile of adjTiles) {
      // only add tiles that aren't already going to be checked
      if (tile.willCheck) continue;
      
      tile.willCheck = true;
      fillQueue.push({tile, step: step+1});
    }
  }
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
  if (drawInterval)
    canvas.style.cursor = WAIT_CURSOR;
  else if (activeTool === 'draw')
    canvas.style.cursor = DRAW_CURSOR;
  else if (activeTool === 'fill')
    canvas.style.cursor = FILL_CURSOR;
}

function reset() {
  resetInterval(); // stop drawing
  
  drawQueue.length = 0; // clear the draw queue

  ctx.fillStyle = GRID_BG_COLOR;
  ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
  drawGrid();

  for (const row of grid)
    for (const tile of row) {
      tile.visited = false;
      tile.painted = false;
    }
}

function resetInterval() {
  if (!drawInterval) return;
  clearInterval(drawInterval);
  drawInterval = undefined;
  updateCursor();
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

function draw() {

  if (drawQueue.length == 0) { // stop drawing when queue is empty
    resetInterval();
    return;
  }

  const currStep = drawQueue[0].step; // current step of the queue

  // check if the highlights have been drawn for the current step
  if (drawQueue[0].highlightDrawn == false) {

    // highlight all tiles of current step
    for (const elem of drawQueue) {

      if (elem.step != currStep) return; // go through all elems until next step is reached

      highlightTile(elem.tile, elem.highlightColor);      
      elem.highlightDrawn = true;
    }
    
  } else {

    // highlights drawn already; unhighlight and paint appropriate tiles
    while (drawQueue.length) {

      if (drawQueue[0].step != currStep) return;
      
      const elem = drawQueue.shift();
      unhighlightTile(elem.tile);

      if (elem.highlightColor === VALID_HIGHLIGHT_COLOR)
        paintTile(elem.tile, FILL_COLOR);
    }
  } 
}

canvas.addEventListener('pointermove', e => {
  if (drawInterval) return; // don't handle pointer if an interval is currently active
  if (!updateActiveTile(e)) return; // if active tile wasn't updated, don't continue
  if (isDrawing) paintTile(activeTile, DRAW_COLOR); // paint the tile if drawing
});

canvas.addEventListener('pointerdown', e => {
  if (drawInterval) return;
  /* need to set the activeTile here if using touch since the pointermove event
     listener won't be triggered beforehand */
  if (e.pointerType === 'touch')
    updateActiveTile(e);

  if (activeTool === 'draw') {
    isDrawing = true;
    paintTile(activeTile, DRAW_COLOR);
  } else if (activeTool === 'fill') {
    if (drawInterval) return; // prevent a new floodfill & interval if one is already active
    floodFill(activeTile);
    drawInterval = setInterval(draw, drawDelay);
    updateCursor();
  }
});

canvas.addEventListener('pointerup', pointerUpAndLeaveListener);
canvas.addEventListener('pointerleave', pointerUpAndLeaveListener);

// used to deactivate draw tool when pointer is no longer active or leaves the canvas
function pointerUpAndLeaveListener() {
  if (drawInterval) return;
  if (isDrawing) isDrawing = false;
}

initializeGrid();
drawGrid();
updateCursor();