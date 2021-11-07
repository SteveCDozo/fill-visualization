const canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  gridSize = 600,
  tileSize = 50,
  gridColor = 'darkgrey',
  highlightColor = 'yellow';

canvas.width = gridSize;
canvas.height = gridSize;
ctx.lineWidth = 2; // workaround for pixel color blending issue

let activeTile = { x: -1, y: -1 };

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
}

function getTile(x, y) {
  // round down to nearest multiple of tileSize
  x -= x % tileSize;
  y -= y % tileSize;
  return { x: x, y: y};
}

function isActiveTile(t) {
  return t.x == activeTile.x && t.y == activeTile.y;
}

// updates the active tile & highlights it, removes highlight from previously active tile
function setActiveTile(t) {
  unhighlightTile(activeTile);
  highlightTile(t);    
  activeTile = t;
}

function highlightTile(t) {
  ctx.strokeStyle = highlightColor;
  ctx.beginPath();
  ctx.strokeRect(t.x, t.y, tileSize, tileSize);
}

function unhighlightTile(t) {
  ctx.strokeStyle = gridColor;
  ctx.beginPath();
  ctx.strokeRect(t.x, t.y, tileSize, tileSize);
}

canvas.addEventListener('mousemove', e => {
  // event.offsetX & event.offsetY give the (x,y) offset from the edge of the canvas
  const currentTile = getTile(e.offsetX, e.offsetY);

  // if the current tile is not the active tile, then update the active tile to be the current one
  if (!isActiveTile(currentTile))
    setActiveTile(currentTile);
});

drawGrid();