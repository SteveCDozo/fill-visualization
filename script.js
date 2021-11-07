const canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  gridSize = 600,
  tileSize = 50,
  gridColor = 'darkgrey',
  gridBgColor = 'lightgray',
  highlightColor = 'yellow',
  markColor = 'blue',
  paintColor = 'black',
  drawDelay = 200;

canvas.width = gridSize;
canvas.height = gridSize;
ctx.lineWidth = 2; // workaround for pixel color blending issue

const grid = [];
let activeTile, currentTile, activeTool = 'draw', isDrawing = false;

function initializeGrid() {
  for (let y = 0; y < gridSize; y += tileSize) {
    let row = [];

    for (let x = 0; x < gridSize; x += tileSize)      
      row.push({x, y, visited: false});
    
    grid.push(row);
  }
}

function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.beginPath();

  // draw columns
  for (let x = tileSize; x < gridSize; x += tileSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridSize)
  }

  // draw rows
  for (let y = tileSize; y < gridSize; y += tileSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(gridSize, y)
  }

  ctx.stroke();

  // draw borders
  ctx.strokeRect(0, 0, gridSize, gridSize);
}

function getTile(x, y) {
  // there's a possibility the x or y offset coordinate may 
  // be off the grid, so just adjust it accordingly
  if (x < 0)
    x = 0;
  else if (x >= gridSize)
    x = gridSize-1;
  if (y < 0)
    y = 0;
  else if (y >= gridSize)
    y = gridSize-1;

  x = Math.floor(x/tileSize);
  y = Math.floor(y/tileSize);

  return grid[y][x];
}

function isActiveTile(t) {
  if (t == undefined) console.log('undefined');
  return activeTile && t.x == activeTile.x && t.y == activeTile.y;
}

// updates the active tile & highlights it, removes highlight from previously active tile
function setActiveTile(t) {
  if (activeTile) unhighlightTile(activeTile);
  highlightTile(t);    
  activeTile = t;
}

function highlightTile(t) {
  colorTile(t, highlightColor);
}

function unhighlightTile(t) {
  colorTile(t, gridColor);
}

function markTile(t) {
  colorTile(t, markColor);
}

function paintTile(t) {
  ctx.fillStyle = paintColor;
  ctx.fillRect(t.x, t.y, tileSize, tileSize);
}

function colorTile(t, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.strokeRect(t.x, t.y, tileSize, tileSize);
}

function fill(t) {
  if (t.visited) return;

  // color tile and mark it as visited
  markTile(t)
  t.visited = true;

  // repeat for adjacent tiles
  const adjTiles = getAdjacentTiles(t);
  for (const tile of adjTiles)
    setTimeout(() => fill(tile), drawDelay);
}

// returns the tiles directly north, south, east, & west that are within the grid
function getAdjacentTiles(t) {
  const lowerBound = 0, upperBound = gridSize - tileSize;
  let adj = [];

  if (t.y > lowerBound) // north tile
    adj.push( getTile(t.x, t.y - tileSize) );
  if (t.y < upperBound)  // south tile
    adj.push( getTile(t.x, t.y + tileSize) );
  if (t.x < upperBound) // east tile
    adj.push( getTile(t.x + tileSize, t.y) );
  if (t.x > lowerBound) // west tile
    adj.push( getTile(t.x - tileSize, t.y) );
  
  return adj;
}

function setActiveTool(tool) {
  activeTool = tool;
}

function reset() {
  ctx.fillStyle = gridBgColor;
  ctx.fillRect(0, 0, gridSize, gridSize);
  drawGrid();

  for (const row of grid)
    for (const tile of row)
      tile.visited = false;
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
    fill(currentTile)
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) isDrawing = false;
});

initializeGrid();
drawGrid();