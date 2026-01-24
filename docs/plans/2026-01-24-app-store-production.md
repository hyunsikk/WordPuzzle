# App Store Production Plan - Word Search by AprilMay

**Date:** 2026-01-24
**Status:** Ready for publishing (pending Apple Developer account)

## App Configuration

- **Name:** Word Search by AprilMay
- **Bundle ID:** com.aprilmay.wordsearch
- **Version:** 1.0.0
- **Platform:** iOS (iPhone + iPad)
- **Age Rating:** 12+
- **Price:** Free
- **Category:** Games > Word

## Technical Stack

- React Native + Expo SDK 54
- EAS Build for cloud builds
- No external API dependencies
- Fully offline capable

## Assets Created

- `assets/icon.png` - 1024x1024 app icon (WS bubbles, ocean gradient)
- `assets/adaptive-icon.png` - Android adaptive icon
- `assets/splash-icon.png` - Splash screen icon
- `assets/favicon.png` - Web favicon

## App Store Listing

**Subtitle:** Relaxing Ocean Word Puzzles

**Description:**
> Dive into relaxing word puzzles! Find hidden words in beautiful ocean-themed grids.
>
> Swipe through letters to discover words from 100+ themed categories - from ocean life to space exploration, emotions to cuisines. No pressure, no timers - just pure word-finding fun.
>
> Features:
> • Soothing ocean-inspired design
> • 100+ word categories
> • Swipe-to-select gameplay
> • Daily streaks & coin rewards
> • Works completely offline
> • No ads, no interruptions

**Keywords:** word search, puzzle, word game, brain game, offline, relaxing, word find

## Publishing Steps

1. Sign up for Apple Developer Program ($99/year)
2. Create Expo account
3. Run `eas init` to initialize project
4. Create app in App Store Connect
5. Run `eas build --platform ios --profile production`
6. Run `eas submit --platform ios --latest`
7. Complete App Store Connect listing (screenshots, description)
8. Submit for review

## Files Reference

- `mobile/eas.json` - EAS Build configuration
- `mobile/app.json` - Expo app configuration
- `mobile/STORE_LISTING.md` - Full store listing content
- `mobile/PUBLISH_CHECKLIST.md` - Step-by-step guide

## Privacy

- No data collection
- No analytics
- No network requests
- Local storage only (AsyncStorage)
- Simple privacy policy required for App Store
