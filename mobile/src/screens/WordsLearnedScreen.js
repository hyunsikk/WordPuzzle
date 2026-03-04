// WordsLearnedScreen.js - Review learned vocabulary with definitions
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';
import { getLearnedWords } from '../utils/stats';
import { getFormattedDefinition } from '../utils/definitions';
import { getSpacedRepetitionData, getWordsByMastery } from '../utils/spacedRepetition';
import { getWordData } from '../data/examples';
import { lightImpact } from '../utils/haptics';

export default function WordsLearnedScreen({ onBack }) {
  const [learnedWords, setLearnedWords] = useState({});
  const [wordsWithDefinitions, setWordsWithDefinitions] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, new, learning, mastered
  const [spacedRepData, setSpacedRepData] = useState({});

  useEffect(() => {
    loadLearnedWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [wordsWithDefinitions, searchTerm, selectedFilter]);

  const loadLearnedWords = async () => {
    try {
      setLoading(true);
      const learned = await getLearnedWords();
      const spacedRep = await getSpacedRepetitionData();
      setLearnedWords(learned);
      setSpacedRepData(spacedRep);

      // Get definitions and spaced rep data for all learned words
      const wordsArray = Object.keys(learned).map(word => {
        const definition = getFormattedDefinition(word);
        const wordData = getWordData(word);
        const spacedRepWord = spacedRep[word.toLowerCase()];
        
        return {
          word,
          definition: definition.definition,
          hasDefinition: definition.hasDefinition,
          learnedDate: learned[word].learnedDate,
          reviewCount: learned[word].reviewCount,
          // Spaced repetition data
          masteryLevel: spacedRepWord?.masteryLevel || 'new',
          interval: spacedRepWord?.interval || 1,
          correctCount: spacedRepWord?.correctCount || 0,
          incorrectCount: spacedRepWord?.incorrectCount || 0,
          lastReviewed: spacedRepWord?.lastReviewed,
          nextReview: spacedRepWord?.nextReview,
          // Enhanced data
          isSATWord: wordData?.isSATWord || false,
          examples: wordData?.examples || [],
          synonyms: wordData?.synonyms || [],
          antonyms: wordData?.antonyms || [],
        };
      });

      // Sort by mastery level, then by most recently learned
      wordsArray.sort((a, b) => {
        const masteryOrder = { new: 3, learning: 2, mastered: 1 };
        const aMastery = masteryOrder[a.masteryLevel] || 0;
        const bMastery = masteryOrder[b.masteryLevel] || 0;
        
        if (aMastery !== bMastery) {
          return bMastery - aMastery; // Higher mastery first
        }
        
        return new Date(b.learnedDate) - new Date(a.learnedDate);
      });
      
      setWordsWithDefinitions(wordsArray);
    } catch (error) {
      console.error('Error loading learned words:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWords = () => {
    let filtered = wordsWithDefinitions;
    
    // Filter by mastery level
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.masteryLevel === selectedFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        item => 
          item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredWords(filtered);
  };

  const handleBackPress = () => {
    lightImpact();
    onBack();
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const WordCard = ({ item }) => {
    const getMasteryColor = (level) => {
      switch (level) {
        case 'mastered': return colors.checkmark;
        case 'learning': return colors.buttonPrimary;
        case 'new': return colors.textSecondary;
        default: return colors.textSecondary;
      }
    };

    const getMasteryEmoji = (level) => {
      switch (level) {
        case 'mastered': return '✨';
        case 'learning': return '📖';
        case 'new': return '🆕';
        default: return '❓';
      }
    };

    const getNextReviewText = (nextReview) => {
      if (!nextReview) return 'Ready for review';
      
      const reviewDate = new Date(nextReview);
      const today = new Date();
      const diffTime = reviewDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return 'Review now';
      if (diffDays === 1) return 'Review tomorrow';
      return `Review in ${diffDays} days`;
    };

    return (
      <View style={styles.wordCard}>
        <View style={styles.wordHeader}>
          <View style={styles.wordTitleRow}>
            <Text style={Typography.wordTitle}>{item.word}</Text>
            <View style={styles.wordBadges}>
              {item.isSATWord && (
                <View style={styles.satBadge}>
                  <Text style={styles.satBadgeText}>SAT</Text>
                </View>
              )}
              <View style={[styles.masteryBadge, { borderColor: getMasteryColor(item.masteryLevel) }]}>
                <Text style={[styles.masteryBadgeText, { color: getMasteryColor(item.masteryLevel) }]}>
                  {getMasteryEmoji(item.masteryLevel)} {item.masteryLevel}
                </Text>
              </View>
            </View>
          </View>
          <Text style={Typography.small}>
            {formatDate(item.learnedDate)}
          </Text>
        </View>
        
        <Text style={Typography.definition}>
          {item.definition}
        </Text>
        
        {item.masteryLevel !== 'new' && (
          <View style={styles.progressInfo}>
            <Text style={Typography.small}>
              {item.correctCount}✓ / {item.incorrectCount}✗ • {getNextReviewText(item.nextReview)}
            </Text>
          </View>
        )}
        
        {item.examples && item.examples.length > 0 && (
          <View style={styles.exampleContainer}>
            <Text style={Typography.small}>Example:</Text>
            <Text style={[Typography.body, styles.exampleText]}>
              "{item.examples[0]}"
            </Text>
          </View>
        )}
        
        {!item.hasDefinition && (
          <Text style={[Typography.small, styles.noDefinition]}>
            💭 Definition not available
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundStart, colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading your vocabulary...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={Typography.subheading}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={Typography.heading}>Words Learned</Text>
          <Text style={Typography.caption}>
            {Object.keys(learnedWords).length} words in your vocabulary
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search words or definitions..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All', emoji: '📚' },
          { key: 'new', label: 'New', emoji: '🆕' },
          { key: 'learning', label: 'Learning', emoji: '📖' },
          { key: 'mastered', label: 'Mastered', emoji: '✨' }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => {
              lightImpact();
              setSelectedFilter(filter.key);
            }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.emoji} {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State */}
      {Object.keys(learnedWords).length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={Typography.subheading}>No words learned yet</Text>
          <Text style={Typography.caption}>
            Start playing puzzles to build your vocabulary!
          </Text>
        </View>
      ) : (
        <>
          {/* Word List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredWords.length === 0 && searchTerm ? (
              <View style={styles.noResults}>
                <Text style={Typography.body}>No words match your search</Text>
                <Text style={Typography.caption}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              filteredWords.map((item, index) => (
                <WordCard key={item.word} item={item} />
              ))
            )}
          </ScrollView>

          {/* Summary Footer */}
          <View style={styles.summaryFooter}>
            <Text style={Typography.small}>
              {filteredWords.length} of {Object.keys(learnedWords).length} words
              {searchTerm ? ` matching "${searchTerm}"` : ''}
            </Text>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: colors.panelBackground,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: colors.textPrimary,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  wordCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordHeader: {
    marginBottom: 12,
  },
  wordTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  wordBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  satBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  satBadgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: colors.textLight,
  },
  masteryBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  masteryBadgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
  },
  progressInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
  },
  exampleContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
  },
  exampleText: {
    fontStyle: 'italic',
    marginTop: 4,
    color: colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.panelBackground,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  filterButtonActive: {
    backgroundColor: colors.buttonPrimary,
    borderColor: colors.buttonPrimary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.textPrimary,
  },
  filterButtonTextActive: {
    color: colors.textLight,
  },
  noDefinition: {
    marginTop: 8,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  summaryFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
    backgroundColor: colors.panelBackground,
  },
});