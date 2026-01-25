// ads.web.js - Web stub for Google AdMob (native-only feature)

// All ad functions are no-ops on web

export function loadInterstitialAd() {
  return () => {}; // No-op cleanup function
}

export async function showInterstitialAd() {
  return false;
}

export function isInterstitialReady() {
  return false;
}

export function loadRewardedAd() {
  return () => {}; // No-op cleanup function
}

export async function showRewardedAd(onReward) {
  return false;
}

export function isRewardedReady() {
  return false;
}

// Banner Ad Component Props (null on web)
export const BANNER_AD_UNIT_ID = null;
export const BANNER_SIZE = null;
export const BannerAd = null;

// Initialize all ads (no-op on web)
export function initializeAds() {
  return () => {}; // No-op cleanup function
}

// Track puzzles completed for interstitial frequency
export function onPuzzleCompleted() {
  return false;
}

export function resetPuzzleCount() {
  // No-op on web
}
