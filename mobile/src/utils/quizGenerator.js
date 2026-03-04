// quizGenerator.js - Generate quiz questions for spaced repetition learning
import { getWordData, getFillInBlank } from '../data/examples';
import { getWordDefinition } from './definitions';

// Quiz types
export const QUIZ_TYPES = {
  DEFINITION_TO_WORD: 'definition_to_word',
  WORD_TO_DEFINITION: 'word_to_definition',
  FILL_IN_BLANK: 'fill_in_blank'
};

// Generate multiple choice options by finding similar words
const generateDistractors = (correctWord, correctDefinition, allWords, count = 3) => {
  const distractors = [];
  const usedWords = new Set([correctWord.toUpperCase()]);
  
  // Get words with similar length or complexity
  const candidateWords = allWords.filter(word => {
    if (usedWords.has(word.toUpperCase())) return false;
    
    const wordData = getWordData(word);
    if (!wordData) return false;
    
    // Prefer words of similar length
    const lengthDiff = Math.abs(word.length - correctWord.length);
    return lengthDiff <= 3;
  });
  
  // Shuffle and take the needed amount
  for (let i = candidateWords.length - 1; i > 0 && distractors.length < count; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidateWords[i], candidateWords[j]] = [candidateWords[j], candidateWords[i]];
  }
  
  return candidateWords.slice(0, count).map(word => word.toUpperCase());
};

// Generate definition distractors
const generateDefinitionDistractors = (correctDefinition, allWords, count = 3) => {
  const distractors = [];
  const used = new Set([correctDefinition.toLowerCase()]);
  
  // Get definitions from random words
  while (distractors.length < count) {
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    const wordData = getWordData(randomWord);
    
    if (wordData && !used.has(wordData.definition.toLowerCase())) {
      distractors.push(wordData.definition);
      used.add(wordData.definition.toLowerCase());
    }
  }
  
  return distractors;
};

// Generate Definition → Word quiz question
export const generateDefinitionToWordQuestion = (word, allWords) => {
  const wordData = getWordData(word);
  if (!wordData) {
    // Fall back to basic definition
    const definition = getWordDefinition(word);
    if (!definition) return null;
    
    const distractors = generateDistractors(word, definition, allWords);
    const choices = [word.toUpperCase(), ...distractors];
    
    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    return {
      type: QUIZ_TYPES.DEFINITION_TO_WORD,
      word: word.toUpperCase(),
      question: definition,
      choices,
      correctAnswer: word.toUpperCase(),
      definition,
      explanation: `"${word.toUpperCase()}" means: ${definition}`
    };
  }
  
  const distractors = generateDistractors(word, wordData.definition, allWords);
  const choices = [word.toUpperCase(), ...distractors];
  
  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  
  return {
    type: QUIZ_TYPES.DEFINITION_TO_WORD,
    word: word.toUpperCase(),
    question: `Which word means: "${wordData.definition}"?`,
    choices,
    correctAnswer: word.toUpperCase(),
    definition: wordData.definition,
    explanation: `"${word.toUpperCase()}" means: ${wordData.definition}`,
    exampleSentence: wordData.examples && wordData.examples.length > 0 
      ? wordData.examples[Math.floor(Math.random() * wordData.examples.length)]
      : null
  };
};

// Generate Word → Definition quiz question
export const generateWordToDefinitionQuestion = (word, allWords) => {
  const wordData = getWordData(word);
  if (!wordData) {
    // Fall back to basic definition
    const definition = getWordDefinition(word);
    if (!definition) return null;
    
    const distractors = generateDefinitionDistractors(definition, allWords);
    const choices = [definition, ...distractors];
    
    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    return {
      type: QUIZ_TYPES.WORD_TO_DEFINITION,
      word: word.toUpperCase(),
      question: `What does "${word.toUpperCase()}" mean?`,
      choices,
      correctAnswer: definition,
      definition,
      explanation: `"${word.toUpperCase()}" means: ${definition}`
    };
  }
  
  const distractors = generateDefinitionDistractors(wordData.definition, allWords);
  const choices = [wordData.definition, ...distractors];
  
  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  
  return {
    type: QUIZ_TYPES.WORD_TO_DEFINITION,
    word: word.toUpperCase(),
    question: `What does "${word.toUpperCase()}" mean?`,
    choices,
    correctAnswer: wordData.definition,
    definition: wordData.definition,
    explanation: `"${word.toUpperCase()}" means: ${wordData.definition}`,
    exampleSentence: wordData.examples && wordData.examples.length > 0 
      ? wordData.examples[Math.floor(Math.random() * wordData.examples.length)]
      : null
  };
};

// Generate Fill-in-the-blank quiz question
export const generateFillInBlankQuestion = (word, allWords) => {
  const wordData = getWordData(word);
  if (!wordData) return null;
  
  const blankSentence = getFillInBlank(word);
  if (!blankSentence) return null;
  
  const distractors = generateDistractors(word, wordData.definition, allWords);
  const choices = [word.toUpperCase(), ...distractors];
  
  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  
  return {
    type: QUIZ_TYPES.FILL_IN_BLANK,
    word: word.toUpperCase(),
    question: `Fill in the blank: ${blankSentence}`,
    choices,
    correctAnswer: word.toUpperCase(),
    definition: wordData.definition,
    explanation: `The correct word is "${word.toUpperCase()}" which means: ${wordData.definition}`,
    exampleSentence: wordData.examples && wordData.examples.length > 0 
      ? wordData.examples[Math.floor(Math.random() * wordData.examples.length)]
      : null
  };
};

// Generate a random quiz question for a word
export const generateQuizQuestion = (word, allWords) => {
  const quizTypes = Object.values(QUIZ_TYPES);
  const randomType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
  
  switch (randomType) {
    case QUIZ_TYPES.DEFINITION_TO_WORD:
      return generateDefinitionToWordQuestion(word, allWords);
    case QUIZ_TYPES.WORD_TO_DEFINITION:
      return generateWordToDefinitionQuestion(word, allWords);
    case QUIZ_TYPES.FILL_IN_BLANK:
      return generateFillInBlankQuestion(word, allWords) || 
             generateDefinitionToWordQuestion(word, allWords); // Fallback
    default:
      return generateDefinitionToWordQuestion(word, allWords);
  }
};

// Generate a complete quiz session
export const generateQuizSession = (words, allWords, sessionSize = 10) => {
  if (!words || words.length === 0) return [];
  
  const quizWords = words.slice(0, sessionSize);
  const questions = [];
  
  for (const wordData of quizWords) {
    const question = generateQuizQuestion(wordData.word, allWords);
    if (question) {
      // Add word metadata to question
      question.wordMetadata = {
        interval: wordData.interval,
        lastReviewed: wordData.lastReviewed,
        correctCount: wordData.correctCount,
        incorrectCount: wordData.incorrectCount,
        masteryLevel: wordData.masteryLevel
      };
      questions.push(question);
    }
  }
  
  return questions;
};

// Validate quiz answer
export const validateAnswer = (question, selectedAnswer) => {
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    exampleSentence: question.exampleSentence,
    definition: question.definition,
    word: question.word
  };
};

// Get quiz statistics
export const getQuizStats = (questions, answers) => {
  if (!questions || !answers || questions.length !== answers.length) {
    return { score: 0, correct: 0, total: 0, percentage: 0 };
  }
  
  const correct = questions.reduce((count, question, index) => {
    const answer = answers[index];
    return count + (answer === question.correctAnswer ? 1 : 0);
  }, 0);
  
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  return {
    score: `${correct}/${total}`,
    correct,
    total,
    percentage
  };
};

export default {
  QUIZ_TYPES,
  generateDefinitionToWordQuestion,
  generateWordToDefinitionQuestion,
  generateFillInBlankQuestion,
  generateQuizQuestion,
  generateQuizSession,
  validateAnswer,
  getQuizStats
};