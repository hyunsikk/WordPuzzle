# Word Search by AprilMay - Mobile App Design (v2)

## Overview

A playful, engaging word search puzzle game for iPhone built with React Native + Expo. Features Ocean Bubbles theme with gamification elements inspired by top App Store word games.

## Design Direction: Ocean Bubbles

**Style:** Playful & Bold
**Theme:** Ocean/Sky - bright blues, teals, sunny yellows
**Feel:** Fresh, cheerful, satisfying

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background Start | Sky Blue | `#87CEEB` |
| Background End | Turquoise | `#40E0D0` |
| Bubble Default | White | `#FFFFFF` |
| Bubble Border | Powder Blue | `#B0E0E6` |
| Bubble Selected | Sunny Yellow | `#FFE135` |
| Bubble Found | Light Green | `#90EE90` |
| Text Primary | Deep Ocean | `#1E3A5F` |
| Text Secondary | Ocean Gray | `#5A7A8A` |
| Accent/Coral | Coral | `#FF6B6B` |
| Coin Gold | Gold | `#FFD700` |
| Streak Fire | Orange | `#FF8C00` |
| Panel Background | White | `#FFFFFF` |

## Typography

- **Title:** Bold, rounded sans-serif, 28px
- **Subtitle:** Medium weight, 16px
- **Grid Letters:** Bold, 18-20px
- **Word List:** Semibold, 14px
- **UI Elements:** Medium, 14px

## Grid Design: Bubble Letters

- Circular cells (border-radius: 50%)
- White fill with soft powder blue border
- Subtle drop shadow for depth
- Letters centered, bold font
- Size: ~32-36px diameter per bubble

### Cell States

| State | Appearance |
|-------|------------|
| Default | White bubble, powder blue border, subtle shadow |
| Selected | Yellow fill, scale 1.15, deeper shadow (pop up effect) |
| Found | Light green fill, gentle pulse animation |

## Layout (iPhone)

```
┌─────────────────────────────┐
│  🔥 5    Word Search   💰 120 │  ← Header: Streak + Title + Coins
│         by AprilMay           │
├─────────────────────────────┤
│      ⭐ Daily Challenge ⭐     │  ← Daily badge (when applicable)
├─────────────────────────────┤
│                              │
│    ┌─────────────────┐      │
│    │ ○ ○ ○ ○ ○ ○ ○ ○ │      │
│    │ ○ ○ ○ ○ ○ ○ ○ ○ │      │  ← Bubble Grid (10x10)
│    │ ○ ○ ○ ○ ○ ○ ○ ○ │      │
│    │ ○ ○ ○ ○ ○ ○ ○ ○ │      │
│    │ ○ ○ ○ ○ ○ ○ ○ ○ │      │
│    └─────────────────┘      │
│                              │
├─────────────────────────────┤
│  Words to Find:    +2 bonus  │  ← Word Panel
│  ☐ OCEAN  ☐ WAVE  ☐ FISH    │
│  ☐ CORAL  ☐ REEF            │
├─────────────────────────────┤
│            💡 Hint (20)      │  ← Hint Button
└─────────────────────────────┘
```

## Gamification Features

### 1. Coin System
- +10 coins per word found
- +50 coins for puzzle completion
- +5 coins per bonus word (words not in list)
- Coins displayed in header with gold icon

### 2. Streak System
- Fire icon with day count
- Grows visually at milestones (5, 10, 30 days)
- Streak broken if no play for 24 hours
- Streak bonus: +20 coins per puzzle during streak

### 3. Daily Challenge
- One special category per day (same for all users)
- Special "Daily Challenge" badge
- Extra rewards for daily completion

### 4. Bonus Words
- Finding valid words not in target list
- Shows "+1 bonus" notification
- Adds to coin total

### 5. Hint System
- Reveal random letter: 20 coins
- Hint button in footer
- No penalty for not using hints

## Interactions & Animations

### Swipe Selection
1. Touch bubble → Pops up (scale 1.15, shadow deepens)
2. Drag to adjacent → Next bubble pops up
3. Drag back → Previous bubbles sink back
4. Release → Validate word

### Word Found
1. All bubbles in word pulse once
2. Fill transitions to green
3. Word in list gets checkmark
4. "+10" coin animation floats up
5. If bonus word: "+5 bonus" toast

### Puzzle Complete
1. All bubbles do wave animation
2. Confetti burst from center
3. "Amazing!" message with stats
4. Auto-transition to next puzzle (2s)

### Streak Milestone
- Fire icon pulses and grows
- Brief celebration overlay

## Screens

### 1. Home Screen
- Large "Word Search" title
- "by AprilMay" subtitle
- Large "Play" button (turquoise)
- Streak counter (if active)
- Settings icon (top right)

### 2. Game Screen
- Header with streak + coins
- Bubble grid
- Word panel
- Hint button

### 3. Settings Screen (Future)
- Sound toggle
- Colorblind mode
- Font size
- Reset progress

## Accessibility (Phase 2)

- Colorblind mode: Patterns on found bubbles
- Font size options: S / M / L
- High contrast mode
- VoiceOver labels

## Data Persistence

- AsyncStorage for:
  - Coin balance
  - Current streak count
  - Last play date
  - Category queue position
  - Settings preferences

## No Punishing Mechanics

- No lives system
- No time limits
- No penalties for wrong swipes
- Hints are optional, not required

## Technical Notes

- React Native + Expo
- No complex animations library (web compatible)
- Touch/mouse events for cross-platform swipe
- JSON word data bundled in app
