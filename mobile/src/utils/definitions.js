// definitions.js - Word definitions lookup
import wordDefinitions from '../../assets/word_definitions.json';

// Get definition for a word
export const getWordDefinition = (word) => {
  const upperWord = word.toUpperCase();
  return wordDefinitions[upperWord] || null;
};

// Check if word has definition
export const hasDefinition = (word) => {
  const upperWord = word.toUpperCase();
  return upperWord in wordDefinitions;
};

// Get all words with definitions
export const getAllDefinedWords = () => {
  return Object.keys(wordDefinitions);
};

// Get word definition formatted for display
export const getFormattedDefinition = (word) => {
  const definition = getWordDefinition(word);
  if (!definition) {
    return {
      word: word,
      definition: "Definition not available for this word.",
      hasDefinition: false
    };
  }
  
  return {
    word: word.toUpperCase(),
    definition: definition,
    hasDefinition: true
  };
};

export default {
  getWordDefinition,
  hasDefinition,
  getAllDefinedWords,
  getFormattedDefinition
};