// puzzle.js - Grid generation and word placement algorithms

export const GRID_SIZE = 10;

const DIRECTIONS = [
  { dx: 1, dy: 0, name: 'horizontal' },       // left to right
  { dx: -1, dy: 0, name: 'horizontal-rev' },  // right to left
  { dx: 0, dy: 1, name: 'vertical' },         // top to bottom
  { dx: 0, dy: -1, name: 'vertical-rev' },    // bottom to top
  { dx: 1, dy: 1, name: 'diagonal' },         // top-left to bottom-right
  { dx: -1, dy: -1, name: 'diagonal-rev' },   // bottom-right to top-left
  { dx: 1, dy: -1, name: 'diagonal-up' },     // bottom-left to top-right
  { dx: -1, dy: 1, name: 'diagonal-down' },   // top-right to bottom-left
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

// Count how many letters would overlap with existing letters
function countOverlaps(grid, word, startX, startY, direction) {
  let overlaps = 0;
  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.dx;
    const y = startY + i * direction.dy;
    if (grid[y][x] === word[i]) {
      overlaps++;
    }
  }
  return overlaps;
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

// Find all valid placements and prefer those with overlaps
function tryPlaceWord(grid, word) {
  const validPlacements = [];

  // Try all positions and directions
  for (const direction of DIRECTIONS) {
    for (let startY = 0; startY < GRID_SIZE; startY++) {
      for (let startX = 0; startX < GRID_SIZE; startX++) {
        if (canPlaceWord(grid, word, startX, startY, direction)) {
          const overlaps = countOverlaps(grid, word, startX, startY, direction);
          validPlacements.push({ startX, startY, direction, overlaps });
        }
      }
    }
  }

  if (validPlacements.length === 0) {
    return { success: false, positions: [] };
  }

  // Sort by overlaps (most overlaps first) and pick from top candidates
  validPlacements.sort((a, b) => b.overlaps - a.overlaps);

  // If there are placements with overlaps, strongly prefer them
  const maxOverlaps = validPlacements[0].overlaps;
  let candidates;

  if (maxOverlaps > 0) {
    // Pick from placements that have overlaps (at least 1)
    candidates = validPlacements.filter(p => p.overlaps > 0);
  } else {
    // No overlaps possible, pick randomly from all valid placements
    candidates = validPlacements;
  }

  // Pick a random placement from top candidates
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const positions = placeWord(grid, word, chosen.startX, chosen.startY, chosen.direction);

  return { success: true, positions, overlaps: chosen.overlaps };
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
