// app.js - Main game logic and UI interactions

let currentPuzzle = null;
let selectedCells = [];
let foundWords = [];
let currentMode = 'prompt'; // 'prompt' or 'category'

// DOM Elements
const apiSetup = document.getElementById('api-setup');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const inputSection = document.getElementById('input-section');
const moodInput = document.getElementById('mood-input');
const generateBtn = document.getElementById('generate-btn');
const prefixInput = document.getElementById('prefix-input');
const categoryBtn = document.getElementById('category-btn');
const categorySuggestions = document.getElementById('category-suggestions');
const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
const promptMode = document.getElementById('prompt-mode');
const categoryMode = document.getElementById('category-mode');
const modePromptBtn = document.getElementById('mode-prompt');
const modeCategoryBtn = document.getElementById('mode-category');
const errorMessage = document.getElementById('error-message');
const gameSection = document.getElementById('game-section');
const puzzleGrid = document.getElementById('puzzle-grid');
const wordList = document.getElementById('word-list');
const saveImageBtn = document.getElementById('save-image-btn');
const newPuzzleBtn = document.getElementById('new-puzzle-btn');
const celebrationModal = document.getElementById('celebration-modal');
const playAgainBtn = document.getElementById('play-again-btn');

// Number of random category suggestions to show
const NUM_CATEGORY_SUGGESTIONS = 10;

// Initialize app
async function init() {
    if (!hasApiKey()) {
        apiSetup.classList.remove('hidden');
    }

    // Load semantic groups
    await loadSemanticGroups();
    renderCategorySuggestions();

    setupEventListeners();
}

function setupEventListeners() {
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    generateBtn.addEventListener('click', handleGenerateFromPrompt);
    categoryBtn.addEventListener('click', handleGenerateFromCategory);
    saveImageBtn.addEventListener('click', handleSaveImage);
    newPuzzleBtn.addEventListener('click', handleNewPuzzle);
    playAgainBtn.addEventListener('click', handlePlayAgain);
    modePromptBtn.addEventListener('click', () => switchMode('prompt'));
    modeCategoryBtn.addEventListener('click', () => switchMode('category'));
    moodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGenerateFromPrompt();
    });
    prefixInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            hideAutocomplete();
            handleGenerateFromCategory();
        }
    });
    prefixInput.addEventListener('input', handleAutocompleteInput);
    prefixInput.addEventListener('focus', handleAutocompleteInput);
    document.addEventListener('click', (e) => {
        if (!prefixInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

function switchMode(mode) {
    currentMode = mode;

    if (mode === 'prompt') {
        promptMode.classList.remove('hidden');
        categoryMode.classList.add('hidden');
        modePromptBtn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white');
        modePromptBtn.classList.remove('text-gray-600');
        modeCategoryBtn.classList.remove('bg-gradient-to-r', 'from-green-500', 'to-emerald-500', 'text-white');
        modeCategoryBtn.classList.add('text-gray-600');
    } else {
        promptMode.classList.add('hidden');
        categoryMode.classList.remove('hidden');
        modeCategoryBtn.classList.add('bg-gradient-to-r', 'from-green-500', 'to-emerald-500', 'text-white');
        modeCategoryBtn.classList.remove('text-gray-600');
        modePromptBtn.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white');
        modePromptBtn.classList.add('text-gray-600');
        renderCategorySuggestions(); // Show fresh random categories
    }

    showError('');
}

function renderCategorySuggestions() {
    while (categorySuggestions.firstChild) {
        categorySuggestions.removeChild(categorySuggestions.firstChild);
    }

    // Get all available group names and pick random ones
    const allGroupNames = getAllGroupNames();
    const randomCategories = shuffleArray(allGroupNames).slice(0, NUM_CATEGORY_SUGGESTIONS);

    for (const category of randomCategories) {
        const btn = document.createElement('button');
        btn.className = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors';
        // Display formatted name (replace underscores with spaces)
        btn.textContent = category.replace(/_/g, ' ');
        btn.addEventListener('click', () => {
            prefixInput.value = category;
            hideAutocomplete();
            handleGenerateFromCategory();
        });
        categorySuggestions.appendChild(btn);
    }
}

function handleAutocompleteInput() {
    const query = prefixInput.value.trim();

    if (query.length < 2) {
        hideAutocomplete();
        return;
    }

    const suggestions = getAutocompleteSuggestions(query, 8);

    if (suggestions.length === 0) {
        hideAutocomplete();
        return;
    }

    renderAutocomplete(suggestions);
}

function renderAutocomplete(suggestions) {
    while (autocompleteDropdown.firstChild) {
        autocompleteDropdown.removeChild(autocompleteDropdown.firstChild);
    }

    for (const suggestion of suggestions) {
        const item = document.createElement('div');
        item.className = 'px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-700 first:rounded-t-lg last:rounded-b-lg';

        // Format: highlight the category parts
        const parts = suggestion.split('_');
        const formatted = parts.map((part, i) => {
            const span = document.createElement('span');
            span.textContent = part;
            if (i === 0) {
                span.className = 'font-semibold text-purple-600';
            }
            return span;
        });

        formatted.forEach((span, i) => {
            item.appendChild(span);
            if (i < formatted.length - 1) {
                const separator = document.createTextNode(' → ');
                item.appendChild(separator);
            }
        });

        item.addEventListener('click', () => {
            prefixInput.value = suggestion;
            hideAutocomplete();
            handleGenerateFromCategory();
        });

        autocompleteDropdown.appendChild(item);
    }

    autocompleteDropdown.classList.remove('hidden');
}

function hideAutocomplete() {
    autocompleteDropdown.classList.add('hidden');
}

function handleSaveApiKey() {
    const key = apiKeyInput.value.trim();
    if (key) {
        setApiKey(key);
        apiSetup.classList.add('hidden');
        showError('');
    }
}

async function handleGenerateFromPrompt() {
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

    setLoading(true, 'prompt');
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
        setLoading(false, 'prompt');
    }
}

async function handleGenerateFromCategory() {
    const prefix = prefixInput.value.trim();
    if (!prefix) {
        showError('Please enter a category prefix!');
        return;
    }

    setLoading(true, 'category');
    showError('');

    try {
        const group = getRandomGroupByPrefix(prefix);
        if (!group) {
            throw new Error(`No groups found for "${prefix}". Try typing a few letters to see suggestions.`);
        }

        // Filter words to fit puzzle constraints (3-8 letters for better fit)
        let words = group.words.filter(w => w.length >= 3 && w.length <= 8);

        if (words.length < 3) {
            throw new Error(`Not enough valid words in this category. Try another!`);
        }

        // Limit to 7 words for the puzzle
        if (words.length > 7) {
            words = shuffleArray(words).slice(0, 7);
        }

        currentPuzzle = generatePuzzle(words);
        foundWords = [];
        selectedCells = [];

        renderPuzzle();
        renderWordList();
        renderCategorySuggestions(); // Refresh with new random categories

        gameSection.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false, 'category');
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
    prefixInput.value = '';
    if (currentMode === 'prompt') {
        moodInput.focus();
    } else {
        prefixInput.focus();
    }
}

function handlePlayAgain() {
    hideCelebration();
    handleNewPuzzle();
}

function setLoading(loading, mode = 'prompt') {
    const btn = mode === 'prompt' ? generateBtn : categoryBtn;
    btn.disabled = loading;
    if (loading) {
        btn.textContent = '';
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        btn.appendChild(spinner);
    } else {
        btn.textContent = 'Go!';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.toggle('hidden', !message);
}

// Start the app
init();
