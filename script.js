const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gridSize = 600;
const tileSize = 50;

canvas.width = gridSize;
canvas.height = gridSize;

function drawGrid() {
  ctx.strokeStyle = 'darkgrey';
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

drawGrid();