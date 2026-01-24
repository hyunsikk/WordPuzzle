# Vocab Bubbles

A word search puzzle game featuring SAT/GRE vocabulary words. Build your vocabulary while having fun - works offline!

## Features

- AI-generated word puzzles based on your mood (powered by Claude API)
- 10x10 letter grid with words hidden horizontally, vertically, and diagonally
- Colorful, playful visual design
- Save puzzles as JPEG images
- Works entirely in the browser (no backend required)

## Setup

1. Open `index.html` in a web browser
2. Enter your Claude API key when prompted (get one at https://console.anthropic.com)
3. Start playing!

## How to Play

1. Describe your mood in the text box (e.g., "I'm feeling happy and energetic")
2. Click "Go!" to generate a puzzle
3. Find the hidden words by tapping letters in sequence
4. Words can be horizontal, vertical, or diagonal
5. Found words will be highlighted in green
6. Save your puzzle as an image anytime

## Development

No build step required. Just edit the files and refresh the browser.

**Files:**
- `index.html` - Main HTML structure
- `style.css` - Custom styles and animations
- `api.js` - Claude API integration
- `puzzle.js` - Puzzle generation logic
- `app.js` - Main application and UI logic

## API Key

Your Claude API key is stored in localStorage and never sent anywhere except to Anthropic's API.
