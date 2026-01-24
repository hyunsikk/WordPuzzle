// puzzle.js - Grid generation and word placement algorithms

export const GRID_SIZE = 10;

const DIRECTIONS = [
  { dx: 1, dy: 0, name: 'horizontal' },      // left to right
  { dx: 0, dy: 1, name: 'vertical' },        // top to bottom
  { dx: 1, dy: 1, name: 'diagonal' },        // top-left to bottom-right
];

function createEmptyGrid() {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
}

function canPlaceWord(grid, word, startX, startY, direction) {
  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.dx;
    const y = startY + i * direction.dy;

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      return false;
    }

    if (grid[y][x] !== null && grid[y][x] !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(grid, word, startX, startY, direction) {
  const positions = [];
  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.dx;
    const y = startY + i * direction.dy;
    grid[y][x] = word[i];
    positions.push({ x, y });
  }
  return positions;
}

function tryPlaceWord(grid, word, maxAttempts = 100) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const startX = Math.floor(Math.random() * GRID_SIZE);
    const startY = Math.floor(Math.random() * GRID_SIZE);

    if (canPlaceWord(grid, word, startX, startY, direction)) {
      const positions = placeWord(grid, word, startX, startY, direction);
      return { success: true, positions };
    }
  }
  return { success: false, positions: [] };
}

function fillEmptyCells(grid) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === null) {
        grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

export function generatePuzzle(words) {
  const grid = createEmptyGrid();
  const wordPlacements = [];

  // Sort words by length (longest first) for better placement
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const result = tryPlaceWord(grid, word);
    if (result.success) {
      wordPlacements.push({
        word,
        positions: result.positions
      });
    }
  }

  fillEmptyCells(grid);

  return {
    grid,
    words: wordPlacements.map(wp => wp.word),
    placements: wordPlacements
  };
}

export function isAdjacent(pos1, pos2) {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return dx <= 1 && dy <= 1 && (dx + dy > 0);
}

export function getDirection(pos1, pos2) {
  return {
    dx: Math.sign(pos2.x - pos1.x),
    dy: Math.sign(pos2.y - pos1.y)
  };
}

export function isSameDirection(dir1, dir2) {
  return dir1.dx === dir2.dx && dir1.dy === dir2.dy;
}

export function positionsMatch(positions1, positions2) {
  if (positions1.length !== positions2.length) return false;

  // Check forward match
  const forwardMatch = positions1.every((pos, i) =>
    pos.x === positions2[i].x && pos.y === positions2[i].y
  );
  if (forwardMatch) return true;

  // Check reverse match
  const reversed = [...positions2].reverse();
  return positions1.every((pos, i) =>
    pos.x === reversed[i].x && pos.y === reversed[i].y
  );
}
