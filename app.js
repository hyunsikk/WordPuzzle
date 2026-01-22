// app.js - Main game logic and UI interactions

let currentPuzzle = null;
let selectedCells = [];
let foundWords = [];

// DOM Elements
const apiSetup = document.getElementById('api-setup');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const moodSection = document.getElementById('mood-section');
const moodInput = document.getElementById('mood-input');
const generateBtn = document.getElementById('generate-btn');
const errorMessage = document.getElementById('error-message');
const gameSection = document.getElementById('game-section');
const puzzleGrid = document.getElementById('puzzle-grid');
const wordList = document.getElementById('word-list');
const saveImageBtn = document.getElementById('save-image-btn');
const newPuzzleBtn = document.getElementById('new-puzzle-btn');
const celebrationModal = document.getElementById('celebration-modal');
const playAgainBtn = document.getElementById('play-again-btn');

// Initialize app
function init() {
    if (!hasApiKey()) {
        apiSetup.classList.remove('hidden');
    }

    setupEventListeners();
}

function setupEventListeners() {
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    generateBtn.addEventListener('click', handleGenerate);
    saveImageBtn.addEventListener('click', handleSaveImage);
    newPuzzleBtn.addEventListener('click', handleNewPuzzle);
    playAgainBtn.addEventListener('click', handlePlayAgain);
    moodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGenerate();
    });
}

function handleSaveApiKey() {
    const key = apiKeyInput.value.trim();
    if (key) {
        setApiKey(key);
        apiSetup.classList.add('hidden');
        showError('');
    }
}

async function handleGenerate() {
    const mood = moodInput.value.trim();
    if (!mood) {
        showError('Please describe your mood first!');
        return;
    }

    if (!hasApiKey()) {
        apiSetup.classList.remove('hidden');
        showError('Please set up your API key first');
        return;
    }

    setLoading(true);
    showError('');

    try {
        const words = await generateWords(mood);
        if (words.length === 0) {
            throw new Error('No valid words generated. Try a different mood!');
        }

        currentPuzzle = generatePuzzle(words);
        foundWords = [];
        selectedCells = [];

        renderPuzzle();
        renderWordList();

        gameSection.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function renderPuzzle() {
    // Clear existing grid
    while (puzzleGrid.firstChild) {
        puzzleGrid.removeChild(puzzleGrid.firstChild);
    }

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            // Grid letters are single uppercase A-Z characters from controlled source
            cell.textContent = currentPuzzle.grid[y][x];
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', () => handleCellClick(x, y, cell));
            puzzleGrid.appendChild(cell);
        }
    }
}

function renderWordList() {
    // Clear existing list
    while (wordList.firstChild) {
        wordList.removeChild(wordList.firstChild);
    }

    for (const word of currentPuzzle.words) {
        const item = document.createElement('li');
        item.className = 'word-item';
        // Words are validated uppercase A-Z strings from API
        item.textContent = word;
        item.dataset.word = word;
        wordList.appendChild(item);
    }
}

function handleCellClick(x, y, cell) {
    const pos = { x, y };

    // If cell is already found, ignore
    if (cell.classList.contains('found')) {
        return;
    }

    // Check if this cell is already selected
    const existingIndex = selectedCells.findIndex(s => s.x === x && s.y === y);
    if (existingIndex !== -1) {
        // Deselect this and all following cells
        deselectFrom(existingIndex);
        return;
    }

    // Check if this cell is adjacent to last selected (or first selection)
    if (selectedCells.length > 0) {
        const lastSelected = selectedCells[selectedCells.length - 1];
        if (!isAdjacent(lastSelected, pos)) {
            // Not adjacent, reset selection
            deselectAll();
        }
    }

    // Select this cell
    selectedCells.push(pos);
    cell.classList.add('selected');

    // Check if selection forms a word
    checkForWord();
}

function deselectFrom(index) {
    const cells = puzzleGrid.querySelectorAll('.grid-cell');
    for (let i = index; i < selectedCells.length; i++) {
        const pos = selectedCells[i];
        const cellIndex = pos.y * GRID_SIZE + pos.x;
        cells[cellIndex].classList.remove('selected');
    }
    selectedCells = selectedCells.slice(0, index);
}

function deselectAll() {
    const cells = puzzleGrid.querySelectorAll('.grid-cell.selected');
    cells.forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];
}

function checkForWord() {
    // Build string from selected cells
    const selectedWord = selectedCells
        .map(pos => currentPuzzle.grid[pos.y][pos.x])
        .join('');

    // Check against placements
    for (const placement of currentPuzzle.placements) {
        if (foundWords.includes(placement.word)) continue;

        if (positionsMatch(selectedCells, placement.positions)) {
            // Found a word!
            markWordFound(placement.word, selectedCells);
            return;
        }
    }
}

function markWordFound(word, positions) {
    foundWords.push(word);

    // Mark cells as found with animation
    const cells = puzzleGrid.querySelectorAll('.grid-cell');
    positions.forEach(pos => {
        const cellIndex = pos.y * GRID_SIZE + pos.x;
        const cell = cells[cellIndex];
        cell.classList.remove('selected');
        cell.classList.add('found', 'bounce-gentle');

        // Remove animation class after it completes
        setTimeout(() => cell.classList.remove('bounce-gentle'), 300);
    });

    // Mark word in list
    const wordItem = wordList.querySelector(`[data-word="${word}"]`);
    if (wordItem) {
        wordItem.classList.add('found');
    }

    selectedCells = [];

    // Check if all words found
    if (foundWords.length === currentPuzzle.words.length) {
        setTimeout(showCelebration, 500);
    }
}

function showCelebration() {
    celebrationModal.classList.remove('hidden');
    celebrationModal.classList.add('flex');
    celebrationModal.querySelector('div').classList.add('celebrate');
}

function hideCelebration() {
    celebrationModal.classList.add('hidden');
    celebrationModal.classList.remove('flex');
}

async function handleSaveImage() {
    const container = document.getElementById('puzzle-container');

    try {
        const canvas = await html2canvas(container, {
            backgroundColor: null,
            scale: 2
        });

        const link = document.createElement('a');
        link.download = 'moodwords-puzzle.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    } catch (error) {
        showError('Failed to save image');
    }
}

function handleNewPuzzle() {
    gameSection.classList.add('hidden');
    moodInput.value = '';
    moodInput.focus();
}

function handlePlayAgain() {
    hideCelebration();
    handleNewPuzzle();
}

function setLoading(loading) {
    generateBtn.disabled = loading;
    if (loading) {
        generateBtn.textContent = '';
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        generateBtn.appendChild(spinner);
    } else {
        generateBtn.textContent = 'Go!';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.toggle('hidden', !message);
}

// Start the app
init();
