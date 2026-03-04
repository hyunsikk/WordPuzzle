// QuizScreen.js - Spaced Repetition Quiz Mode for vocabulary learning
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';
import { getWordsForReview, recordQuizResult } from '../utils/spacedRepetition';
import { generateQuizSession, validateAnswer, getQuizStats } from '../utils/quizGenerator';
import { getAllDefinedWords } from '../utils/definitions';
import { lightImpact, mediumImpact, successFeedback } from '../utils/haptics';

const QUIZ_STATES = {
  LOADING: 'loading',
  QUESTION: 'question',
  ANSWER_REVIEW: 'answer_review',
  COMPLETED: 'completed',
  NO_WORDS: 'no_words'
};

export default function QuizScreen({ onBack }) {
  const [quizState, setQuizState] = useState(QUIZ_STATES.LOADING);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setQuizState(QUIZ_STATES.LOADING);
      
      // Get words due for review
      const wordsForReview = await getWordsForReview(10);
      
      if (wordsForReview.length === 0) {
        setQuizState(QUIZ_STATES.NO_WORDS);
        return;
      }
      
      // Get all available words for generating distractors
      const allWords = getAllDefinedWords();
      
      // Generate quiz session
      const quizQuestions = generateQuizSession(wordsForReview, allWords, 10);
      
      if (quizQuestions.length === 0) {
        setQuizState(QUIZ_STATES.NO_WORDS);
        return;
      }
      
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setQuizState(QUIZ_STATES.QUESTION);
      
      // Animate in the first question
      animateSlide();
    } catch (error) {
      console.error('Error loading quiz:', error);
      setQuizState(QUIZ_STATES.NO_WORDS);
    }
  };

  const animateSlide = () => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleAnswerSelect = async (answer) => {
    if (selectedAnswer !== null || quizState !== QUIZ_STATES.QUESTION) return;
    
    lightImpact();
    setSelectedAnswer(answer);
    
    // Validate the answer
    const currentQuestion = questions[currentQuestionIndex];
    const result = validateAnswer(currentQuestion, answer);
    setAnswerResult(result);
    
    // Record the result in spaced repetition system
    await recordQuizResult(currentQuestion.word, result.isCorrect);
    
    // Store the answer
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    // Provide haptic feedback
    if (result.isCorrect) {
      successFeedback();
    } else {
      mediumImpact();
    }
    
    setQuizState(QUIZ_STATES.ANSWER_REVIEW);
  };

  const handleNextQuestion = () => {
    lightImpact();
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setQuizState(QUIZ_STATES.QUESTION);
      animateSlide();
    } else {
      // Quiz completed
      setQuizState(QUIZ_STATES.COMPLETED);
      animateSlide();
    }
  };

  const handleBackPress = () => {
    lightImpact();
    onBack();
  };

  const handleRestartQuiz = () => {
    lightImpact();
    loadQuiz();
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <Text style={Typography.body}>Preparing your vocabulary quiz...</Text>
    </View>
  );

  const renderNoWordsState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={Typography.subheading}>All caught up!</Text>
      <Text style={Typography.caption}>
        No words are due for review right now. Keep playing puzzles to learn more vocabulary!
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleBackPress}
      >
        <Text style={Typography.button}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const slideStyle = {
      transform: [{
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      }],
      opacity: slideAnim,
    };

    return (
      <>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={Typography.small}>
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={slideStyle}>
            {/* Question */}
            <View style={styles.questionCard}>
              <Text style={styles.questionType}>
                {currentQuestion.type.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={Typography.subheading}>{currentQuestion.question}</Text>
            </View>

            {/* Answer Choices */}
            <View style={styles.choicesContainer}>
              {currentQuestion.choices.map((choice, index) => {
                let choiceStyle = styles.choice;
                let textStyle = Typography.body;
                
                if (quizState === QUIZ_STATES.ANSWER_REVIEW && selectedAnswer !== null) {
                  if (choice === currentQuestion.correctAnswer) {
                    choiceStyle = [styles.choice, styles.correctChoice];
                    textStyle = [Typography.body, styles.correctChoiceText];
                  } else if (choice === selectedAnswer && choice !== currentQuestion.correctAnswer) {
                    choiceStyle = [styles.choice, styles.incorrectChoice];
                    textStyle = [Typography.body, styles.incorrectChoiceText];
                  }
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={choiceStyle}
                    onPress={() => handleAnswerSelect(choice)}
                    disabled={quizState !== QUIZ_STATES.QUESTION}
                    activeOpacity={0.7}
                  >
                    <Text style={textStyle}>{choice}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Answer Review */}
            {quizState === QUIZ_STATES.ANSWER_REVIEW && answerResult && (
              <View style={styles.reviewContainer}>
                <View style={[
                  styles.resultCard,
                  answerResult.isCorrect ? styles.correctResult : styles.incorrectResult
                ]}>
                  <Text style={[
                    Typography.subheading,
                    answerResult.isCorrect ? styles.correctResultText : styles.incorrectResultText
                  ]}>
                    {answerResult.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                  </Text>
                  
                  {!answerResult.isCorrect && (
                    <Text style={Typography.caption}>
                      The correct answer is: {answerResult.correctAnswer}
                    </Text>
                  )}
                  
                  <Text style={Typography.definition}>
                    {answerResult.explanation}
                  </Text>
                  
                  {answerResult.exampleSentence && (
                    <View style={styles.exampleContainer}>
                      <Text style={Typography.small}>Example:</Text>
                      <Text style={[Typography.body, styles.exampleText]}>
                        "{answerResult.exampleSentence}"
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextQuestion}
                >
                  <Text style={Typography.button}>
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </>
    );
  };

  const renderCompleted = () => {
    const stats = getQuizStats(questions, answers);
    
    let resultEmoji = '🎉';
    let resultTitle = 'Great job!';
    let resultMessage = 'You\'re building your vocabulary!';
    
    if (stats.percentage >= 90) {
      resultEmoji = '🏆';
      resultTitle = 'Excellent!';
      resultMessage = 'Outstanding vocabulary knowledge!';
    } else if (stats.percentage >= 70) {
      resultEmoji = '🎯';
      resultTitle = 'Well done!';
      resultMessage = 'Your vocabulary is improving!';
    } else if (stats.percentage >= 50) {
      resultEmoji = '📚';
      resultTitle = 'Keep learning!';
      resultMessage = 'Practice makes progress!';
    }

    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.centerContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          transform: [{
            scale: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
          opacity: slideAnim,
        }}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultEmoji}>{resultEmoji}</Text>
            <Text style={Typography.heading}>{resultTitle}</Text>
            <Text style={Typography.caption}>{resultMessage}</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{stats.score}</Text>
              <Text style={Typography.caption}>({stats.percentage}% correct)</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={Typography.coin}>{stats.correct}</Text>
                <Text style={Typography.small}>Correct</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.incorrectStat}>{stats.total - stats.correct}</Text>
                <Text style={Typography.small}>To Review</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestartQuiz}
            >
              <Text style={[Typography.button, styles.secondaryButtonText]}>Quiz Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackPress}
            >
              <Text style={Typography.button}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (quizState) {
      case QUIZ_STATES.LOADING:
        return renderLoadingState();
      case QUIZ_STATES.NO_WORDS:
        return renderNoWordsState();
      case QUIZ_STATES.QUESTION:
      case QUIZ_STATES.ANSWER_REVIEW:
        return renderQuestion();
      case QUIZ_STATES.COMPLETED:
        return renderCompleted();
      default:
        return renderLoadingState();
    }
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={Typography.subheading}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={Typography.heading}>Vocabulary Quiz</Text>
          <Text style={Typography.caption}>Spaced Repetition Learning</Text>
        </View>
      </View>

      {renderContent()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    marginTop: -4,
  },
  titleContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  questionType: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: colors.accent,
    letterSpacing: 1,
    marginBottom: 8,
  },
  choicesContainer: {
    marginBottom: 24,
  },
  choice: {
    backgroundColor: colors.panelBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.panelBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  correctChoice: {
    backgroundColor: '#E8F5E8',
    borderColor: colors.checkmark,
  },
  incorrectChoice: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.accent,
  },
  correctChoiceText: {
    color: colors.checkmark,
    fontFamily: 'Nunito_600SemiBold',
  },
  incorrectChoiceText: {
    color: colors.accent,
  },
  reviewContainer: {
    marginTop: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  correctResult: {
    backgroundColor: '#E8F5E8',
  },
  incorrectResult: {
    backgroundColor: '#FFE8E8',
  },
  correctResultText: {
    color: colors.checkmark,
    marginBottom: 8,
  },
  incorrectResultText: {
    color: colors.accent,
    marginBottom: 8,
  },
  exampleContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  exampleText: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  resultsCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.buttonPrimary,
    lineHeight: 52,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  incorrectStat: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: colors.accent,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.buttonPrimary,
  },
  secondaryButtonText: {
    color: colors.buttonPrimary,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
});