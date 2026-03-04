// wordOfTheDay.js - Daily word selection with deterministic seeding
import { getWordData, getSATWords } from '../data/examples';
import { getSpacedRepetitionData, addWordToSpacedRep } from './spacedRepetition';
import { getAllDefinedWords } from './definitions';

// Simple hash function for deterministic random selection
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get today's date as a string seed (YYYY-MM-DD)
const getTodaySeed = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Phonetic pronunciation guide for common words
const pronunciationGuide = {
  'ABSTRUSE': 'ab-STROOS',
  'ABERRANT': 'uh-BAIR-uhnt',
  'ACQUIESCE': 'ak-wee-ESS',
  'ACRIMONY': 'AK-ruh-moh-nee',
  'ADMONISH': 'ad-MON-ish',
  'ALACRITY': 'uh-LAK-ri-tee',
  'AMALGAMATE': 'uh-MAL-guh-mayt',
  'AMELIORATE': 'uh-MEE-lee-uh-rayt',
  'ANACHRONISM': 'uh-NAK-ruh-niz-uhm',
  'ANTIPATHY': 'an-TIP-uh-thee',
  'APATHY': 'AP-uh-thee',
  'APPEASE': 'uh-PEEZ',
  'ARBITRARY': 'AHR-bi-trer-ee',
  'ARCHAIC': 'ahr-KAY-ik',
  'ARDUOUS': 'AHR-joo-uhs',
  'ARTICULATE': 'ahr-TIK-yuh-lit',
  'ASCETIC': 'uh-SET-ik',
  'ASSUAGE': 'uh-SWAYJ',
  'AUDACIOUS': 'aw-DAY-shuhs',
  'AUSTERE': 'aw-STEER',
  'AVARICE': 'AV-uh-ris',
  'BANAL': 'buh-NAL',
  'BELLIGERENT': 'buh-LIJ-uh-ruhnt',
  'BENEVOLENT': 'buh-NEV-uh-luhnt',
  'BOMBASTIC': 'bom-BAS-tik',
  'CAPRICIOUS': 'kuh-PRISH-uhs',
  'CASTIGATE': 'KAS-ti-gayt',
  'CAUSTIC': 'KAW-stik',
  'CHICANERY': 'shi-KAY-nuh-ree',
  'CIRCUMLOCUTION': 'sur-kuhm-loh-KYOO-shuhn',
  'COALESCE': 'koh-uh-LESS',
  'COGENT': 'KOH-juhnt',
  'CONUNDRUM': 'kuh-NUHN-druhm',
  'PERFIDIOUS': 'pur-FID-ee-uhs',
  'PERSPICACIOUS': 'pur-spi-KAY-shuhs',
  'PRODIGIOUS': 'pruh-DIJ-uhs',
  'PROLIFIC': 'pruh-LIF-ik',
  'TENACIOUS': 'tuh-NAY-shuhs',
  'UBIQUITOUS': 'yoo-BIK-wi-tuhs',
  'VACILLATE': 'VAS-uh-layt',
  'VENERABLE': 'VEN-er-uh-buhl',
  'VERBOSE': 'vur-BOHS',
  'VEXING': 'VEK-sing',
  'VINDICATE': 'VIN-di-kayt',
  'ZEALOUS': 'ZEL-uhs'
};

// Get pronunciation guide for a word
const getPronunciation = (word) => {
  return pronunciationGuide[word.toUpperCase()] || null;
};

// Select word of the day based on user's learning progress
export const getWordOfTheDay = async () => {
  try {
    const todaySeed = getTodaySeed();
    const spacedRepData = await getSpacedRepetitionData();
    
    // Get all available words
    const allDefinedWords = getAllDefinedWords();
    const satWords = getSATWords();
    
    // Prioritize words the user hasn't mastered yet
    const unmasteredWords = allDefinedWords.filter(word => {
      const wordKey = word.toLowerCase();
      const wordData = spacedRepData[wordKey];
      return !wordData || wordData.masteryLevel !== 'mastered';
    });
    
    // Prefer SAT words among unmastered words
    let candidateWords = unmasteredWords.filter(word => 
      satWords.includes(word.toUpperCase())
    );
    
    // If no unmastered SAT words, use all unmastered words
    if (candidateWords.length === 0) {
      candidateWords = unmasteredWords;
    }
    
    // If all words are mastered, use all SAT words
    if (candidateWords.length === 0) {
      candidateWords = satWords;
    }
    
    // Fallback to all words
    if (candidateWords.length === 0) {
      candidateWords = allDefinedWords;
    }
    
    // Select word deterministically based on today's date
    const hash = simpleHash(todaySeed);
    const selectedWord = candidateWords[hash % candidateWords.length];
    
    // Get word data
    const wordData = getWordData(selectedWord);
    
    if (!wordData) {
      return null;
    }
    
    // Get a random example sentence
    const exampleSentence = wordData.examples && wordData.examples.length > 0
      ? wordData.examples[hash % wordData.examples.length]
      : null;
    
    const pronunciation = getPronunciation(selectedWord);
    
    // Check if user has this word in their learning system
    const userWordData = spacedRepData[selectedWord.toLowerCase()];
    
    return {
      word: selectedWord.toUpperCase(),
      definition: wordData.definition,
      pronunciation,
      exampleSentence,
      synonyms: wordData.synonyms || [],
      antonyms: wordData.antonyms || [],
      isSATWord: wordData.isSATWord || false,
      isInLearning: !!userWordData,
      masteryLevel: userWordData?.masteryLevel || 'new',
      seed: todaySeed
    };
  } catch (error) {
    console.error('Error getting word of the day:', error);
    return null;
  }
};

// Add word of the day to user's learning queue
export const addWordOfTheDayToQueue = async () => {
  try {
    const wordOfTheDay = await getWordOfTheDay();
    if (!wordOfTheDay) return false;
    
    // Add to spaced repetition system
    const result = await addWordToSpacedRep(wordOfTheDay.word, wordOfTheDay.definition);
    return !!result;
  } catch (error) {
    console.error('Error adding word of the day to queue:', error);
    return false;
  }
};

// Get word of the day with learning stats
export const getWordOfTheDayWithStats = async () => {
  try {
    const wordOfTheDay = await getWordOfTheDay();
    if (!wordOfTheDay) return null;
    
    const spacedRepData = await getSpacedRepetitionData();
    const userWordData = spacedRepData[wordOfTheDay.word.toLowerCase()];
    
    let learningStats = null;
    if (userWordData) {
      learningStats = {
        totalReviews: userWordData.totalReviews,
        correctCount: userWordData.correctCount,
        incorrectCount: userWordData.incorrectCount,
        accuracy: userWordData.totalReviews > 0 
          ? Math.round((userWordData.correctCount / userWordData.totalReviews) * 100)
          : 0,
        interval: userWordData.interval,
        nextReview: userWordData.nextReview,
        masteryLevel: userWordData.masteryLevel
      };
    }
    
    return {
      ...wordOfTheDay,
      learningStats
    };
  } catch (error) {
    console.error('Error getting word of the day with stats:', error);
    return null;
  }
};

// Check if word of the day has changed (for cache invalidation)
export const hasWordOfTheDayChanged = (lastCheckedSeed) => {
  const todaySeed = getTodaySeed();
  return lastCheckedSeed !== todaySeed;
};

// Get word history for the week (for interesting stats)
export const getWeeklyWordHistory = async () => {
  try {
    const words = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const seed = date.toISOString().split('T')[0];
      
      // Get all available words
      const allDefinedWords = getAllDefinedWords();
      const hash = simpleHash(seed);
      const selectedWord = allDefinedWords[hash % allDefinedWords.length];
      
      const wordData = getWordData(selectedWord);
      if (wordData) {
        words.push({
          date: seed,
          word: selectedWord.toUpperCase(),
          definition: wordData.definition,
          isSATWord: wordData.isSATWord || false
        });
      }
    }
    
    return words;
  } catch (error) {
    console.error('Error getting weekly word history:', error);
    return [];
  }
};

export default {
  getWordOfTheDay,
  addWordOfTheDayToQueue,
  getWordOfTheDayWithStats,
  hasWordOfTheDayChanged,
  getWeeklyWordHistory
};