# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vocab Bubbles is a word search puzzle game featuring SAT/GRE vocabulary words. The mobile app works offline with curated word lists, while the web version can also generate AI-powered puzzles via Claude API.

## Tech Stack

- **Frontend**: Vanilla JavaScript + Tailwind CSS (CDN) + html2canvas (CDN)
- **AI Integration**: Claude API (Anthropic) for word generation
- **No backend** - runs entirely in the browser

## Running the App

Open `index.html` in a web browser. No build step required.

## Running Tests

```bash
.venv/bin/python test_webapp.py
```

Tests use Playwright for browser automation. To set up the test environment:

```bash
python3 -m venv .venv
.venv/bin/pip install playwright
.venv/bin/playwright install chromium
```

## Architecture

```
index.html          Entry point, Tailwind-styled UI
├── api.js          Claude API integration (word generation)
├── puzzle.js       Grid generation & word placement algorithms
├── app.js          Main UI logic, event handlers, game state
└── style.css       Custom animations (bounce, celebrate, spinner)
```

**Data Flow:**
1. User enters mood text → `api.js` calls Claude API → returns word array
2. `puzzle.js` places words in grid (horizontal, vertical, diagonal)
3. `app.js` renders grid, handles letter selection, validates word matches

**Key Global Variables (in app.js):**
- `currentPuzzle` - Contains grid, words, and placement positions
- `selectedCells` - Array of currently selected {x, y} positions
- `foundWords` - Array of successfully found words

## API Integration Notes

- API key stored in `localStorage` under key `claude_api_key`
- Uses `anthropic-dangerous-direct-browser-access` header for browser CORS
- Model: `claude-sonnet-4-20250514`
- Words are validated to be 3-8 uppercase letters only
