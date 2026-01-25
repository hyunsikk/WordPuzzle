// ads.js - Google AdMob integration for Vocab Bubbles

import { Platform } from 'react-native';

// Try to import ads module - it may not be available in Expo Go
let AdsModule = null;
let InterstitialAd = null;
let RewardedAd = null;
let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;
let AdEventType = null;
let RewardedAdEventType = null;

try {
  AdsModule = require('react-native-google-mobile-ads');
  InterstitialAd = AdsModule.InterstitialAd;
  RewardedAd = AdsModule.RewardedAd;
  BannerAd = AdsModule.BannerAd;
  BannerAdSize = AdsModule.BannerAdSize;
  TestIds = AdsModule.TestIds;
  AdEventType = AdsModule.AdEventType;
  RewardedAdEventType = AdsModule.RewardedAdEventType;
} catch (e) {
  console.log('Google Mobile Ads not available (running in Expo Go?)');
}

// Use test IDs during development, replace with real IDs for production
// To get real IDs: https://admob.google.com/
const AD_UNIT_IDS = AdsModule ? {
  banner: __DEV__ ? TestIds?.BANNER : Platform.select({
    ios: 'ca-app-pub-7846673001617739/1153809614',
    android: 'ca-app-pub-7846673001617739/1153809614',
  }),
  interstitial: __DEV__ ? TestIds?.INTERSTITIAL : Platform.select({
    ios: 'ca-app-pub-7846673001617739/8840727946',
    android: 'ca-app-pub-7846673001617739/8840727946',
  }),
  rewarded: __DEV__ ? TestIds?.REWARDED : Platform.select({
    ios: 'ca-app-pub-7846673001617739/1071200512',
    android: 'ca-app-pub-7846673001617739/1071200512',
  }),
} : {};

// Interstitial Ad Management
let interstitialAd = null;
let isInterstitialLoaded = false;

export function loadInterstitialAd() {
  if (!InterstitialAd) {
    return () => {}; // No-op if ads not available
  }

  interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
    requestNonPersonalizedAdsOnly: true,
  });

  const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isInterstitialLoaded = true;
  });

  const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    isInterstitialLoaded = false;
    // Preload next ad
    loadInterstitialAd();
  });

  interstitialAd.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeClosed();
  };
}

export async function showInterstitialAd() {
  if (!AdsModule) return false;
  if (isInterstitialLoaded && interstitialAd) {
    await interstitialAd.show();
    return true;
  }
  return false;
}

export function isInterstitialReady() {
  if (!AdsModule) return false;
  return isInterstitialLoaded;
}

// Rewarded Ad Management
let rewardedAd = null;
let isRewardedLoaded = false;
let rewardCallback = null;

export function loadRewardedAd() {
  if (!RewardedAd) {
    return () => {}; // No-op if ads not available
  }

  rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
    requestNonPersonalizedAdsOnly: true,
  });

  const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    isRewardedLoaded = true;
  });

  const unsubscribeEarned = rewardedAd.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    (reward) => {
      if (rewardCallback) {
        rewardCallback(reward);
        rewardCallback = null;
      }
    }
  );

  const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    isRewardedLoaded = false;
    // Preload next ad
    loadRewardedAd();
  });

  rewardedAd.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeEarned();
    unsubscribeClosed();
  };
}

export async function showRewardedAd(onReward) {
  if (!AdsModule) return false;
  if (isRewardedLoaded && rewardedAd) {
    rewardCallback = onReward;
    await rewardedAd.show();
    return true;
  }
  return false;
}

export function isRewardedReady() {
  if (!AdsModule) return false;
  return isRewardedLoaded;
}

// Banner Ad Component Props
export const BANNER_AD_UNIT_ID = AD_UNIT_IDS?.banner || null;
export const BANNER_SIZE = BannerAdSize?.ANCHORED_ADAPTIVE_BANNER || null;
export { BannerAd };

// Initialize all ads
export function initializeAds() {
  const unsubscribeInterstitial = loadInterstitialAd();
  const unsubscribeRewarded = loadRewardedAd();

  return () => {
    unsubscribeInterstitial();
    unsubscribeRewarded();
  };
}

// Track puzzles completed for interstitial frequency
let puzzlesCompleted = 0;
const INTERSTITIAL_FREQUENCY = 3; // Show ad every N puzzles

export function onPuzzleCompleted() {
  puzzlesCompleted++;
  if (puzzlesCompleted >= INTERSTITIAL_FREQUENCY) {
    puzzlesCompleted = 0;
    return true; // Should show interstitial
  }
  return false;
}

export function resetPuzzleCount() {
  puzzlesCompleted = 0;
}
