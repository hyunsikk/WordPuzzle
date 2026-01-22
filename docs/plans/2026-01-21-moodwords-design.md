# MoodWords - Word Search Puzzle Game Design

## Overview

A web-based word search puzzle game where users describe their mood/feeling, and the game generates a themed 10x10 puzzle with relevant words using Claude API.

## Core Requirements

- 10x10 grid with capital English letters (A-Z)
- Words placed horizontally, vertically, and diagonally
- AI-generated words based on user's mood input (Claude API)
- Tap-to-select letter interaction
- Found words stay highlighted with gentle bounce animation
- Save puzzle as JPEG functionality
- Colorful & playful visual style

## Tech Stack

- **Frontend**: Vanilla JavaScript + Tailwind CSS (CDN)
- **AI**: Claude API (Anthropic)
- **Image Export**: html2canvas (CDN)
- **No backend** - purely client-side

## File Structure

```
WordPuzzle/
├── index.html        # Single page with all UI
├── style.css         # Custom styles (minimal, mostly Tailwind)
├── app.js            # Main game logic & UI interactions
├── puzzle.js         # Grid generation & word placement algorithms
├── api.js            # Claude API integration
└── README.md         # Setup instructions
```

## User Flow

1. User lands on page, sees mood input prompt
2. User types mood (e.g., "I'm feeling adventurous and excited")
3. User clicks "Generate Puzzle"
4. App calls Claude API, receives 5-7 relevant words
5. App generates grid with words placed, fills remaining with random letters
6. User sees grid + word list sidebar
7. User taps letters in sequence to find words
8. Correct words bounce and stay highlighted
9. All words found triggers celebration
10. User can save puzzle as JPEG or play again

## UI Layout

```
┌─────────────────────────────────────────────┐
│  MoodWords (title/logo)                     │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │ "How are you feeling today?"          │  │
│  │ [____________________________] [Go!]  │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│   ┌──────────────┐    ┌──────────────┐      │
│   │              │    │ Words to Find│      │
│   │   10 x 10    │    │ ☐ ADVENTURE  │      │
│   │    GRID      │    │ ☐ ENERGY     │      │
│   │              │    │ ☑ THRILL     │      │
│   └──────────────┘    └──────────────┘      │
│   [Save as Image]                           │
└─────────────────────────────────────────────┘
```

## Visual Style

- Vibrant gradient background (purple to pink to orange)
- Grid cells: white/light with rounded corners, soft shadows
- Chunky, friendly font for letters
- Found words: bright highlight color (lime green) + gentle bounce animation
- Buttons: rounded, gradient fills, hover effects

## Claude API Integration

**Prompt template:**
```
Given the user's mood: "{user input}"
Generate 5-7 positive words related to this feeling.
Rules:
- Each word 3-8 letters
- Capital letters only
- Single words (no spaces)
- Return as JSON array
```

API key stored in localStorage, user enters on first visit.

## Word Placement Algorithm

1. Sort words by length (longest first)
2. For each word, try random positions and directions:
   - Horizontal (left-to-right)
   - Vertical (top-to-bottom)
   - Diagonal (4 directions: ↘, ↙, ↗, ↖)
3. Check placement validity (no conflicts, or same letter overlap OK)
4. After 100 failed attempts, skip the word
5. Fill empty cells with random A-Z letters

## Letter Selection Logic

- Tap letter to highlight and add to selection
- Next tap must be adjacent (including diagonal) to continue selection
- Non-adjacent tap resets selection
- Matching a word in list triggers success:
  - Gentle bounce animation
  - Word stays highlighted on grid
  - Word crossed off in sidebar list
