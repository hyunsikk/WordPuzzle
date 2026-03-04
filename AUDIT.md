# Vocab Bubbles — Forge Audit

## Overview
Word search puzzle game with SAT/GRE vocabulary, ocean theme, swipe-to-select, coin economy, hints, combos.

## What's Working Well ✅
- **Content depth is solid** — 584 categories, 3,582 words. Enough for months of play.
- **Core mechanic is sound** — swipe/tap to find words in a grid. Classic and proven.
- **Combo system** — time-pressure mechanic adds engagement layer.
- **Coin economy** — earn per word, per puzzle, no-hint bonus, rewarded ads for more. Decent loop.
- **Accessibility basics** — some accessibilityLabel/Role usage.
- **Gesture handling** — sophisticated line-based swipe with 8-direction snapping, generous hit areas.

## 🔴 Critical Issues

### 1. UI is AI-Generic
- **System fonts everywhere** — no custom font loaded. Instant AI tell.
- **Color palette is generic ocean blue/turquoise** — not bad, but not distinctive.
- **Home screen is barren** — just title + "Play" button + 3 static CSS circles as "bubbles". No stats, no progression, no personality.
- **No animations** — despite having `react-native-reanimated` installed, zero Reanimated usage. No spring animations, no cell press feedback, no word-found celebration animation.
- **Celebration is a static overlay** — no particle effects, no confetti, just a white box with text that auto-dismisses after 2.5s.

### 2. No Stats/Progress/Insights Layer
- Tracks coins only. No puzzles completed count, no words learned, no streaks, no daily tracking.
- No statistics screen at all.
- Zero data compounds over time — the app is the same on day 1 as day 100.
- No spaced repetition or "words you've learned" tracking.

### 3. No Retention Mechanics
- No daily streak
- No push notifications
- No daily challenge/word of the day
- No progression system (levels, stages, unlocks)
- No reason to come back tomorrow

### 4. ASO is Weak
- **App name "Vocab Bubbles"** — no primary keyword. Should be "Vocab Bubbles: Word Search Puzzle" or similar.
- Keywords field only uses ~78/100 characters.
- No competitive keyword research documented.

### 5. Monetization is Ad-Only
- Banner + interstitial + rewarded. No premium tier.
- No subscription or IAP. Missing revenue from users who'd pay to remove ads.
- Coins have no real premium unlock path.

## 🟡 Important Issues

### 6. No Dark Mode
- Only light ocean theme. No dark mode support.

### 7. Word Learning is Passive
- Words are just found in a grid — no definitions shown, no learning reinforcement.
- A user could find "ABSTRUSE" and have zero idea what it means.
- For a "SAT & GRE" app, this is a major gap.

### 8. No Onboarding
- App just shows Home → Play. New user has to figure out swipe mechanics themselves.
- The tap-to-select + swipe hybrid is actually non-obvious.

### 9. Snapshot Feature is Niche
- Camera button for saving puzzle screenshots — takes up prime button real estate for a rarely-used feature.

### 10. No Sound Design
- Completely silent. No satisfying "pop" on word found, no ambient sounds.

## 🟢 Nice-to-Have

- Category difficulty progression (easy → medium → hard words)
- Social features (share scores)
- Widget for daily word
- iPad optimization
- Haptic feedback (only uses basic Vibration API, not expo-haptics)

## Improvement Priority (Forge Standards)

### Phase 1: Core Experience (highest impact)
1. **Custom font** (Nunito) + typography system
2. **Word definitions** — show definition on find + "Words Learned" tracking
3. **Stats screen** — puzzles completed, words learned, accuracy, daily activity chart
4. **Daily streak** with visual indicator on home screen
5. **Animations** — cell press scale, word-found spring animation, celebration confetti
6. **Haptics** via expo-haptics (not raw Vibration)

### Phase 2: Retention & Progression
7. **Daily Challenge** — curated puzzle with bonus rewards
8. **Levels/XP system** — replace raw coins with progression
9. **"Review Words"** screen — spaced repetition of learned vocabulary
10. **Push notifications** for streak reminders

### Phase 3: Monetization & Polish
11. **Premium tier** — remove ads, unlock advanced categories, unlimited hints
12. **ASO overhaul** — keyword-rich name, full 100-char keywords, optimized screenshots
13. **Dark mode**
14. **Improved home screen** — show stats, streak, daily challenge, recent categories
15. **Sound effects** (optional but adds polish)
