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
import { lightImpact } from '../utils/haptics';

export default function WordsLearnedScreen({ onBack }) {
  const [learnedWords, setLearnedWords] = useState({});
  const [wordsWithDefinitions, setWordsWithDefinitions] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearnedWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [wordsWithDefinitions, searchTerm]);

  const loadLearnedWords = async () => {
    try {
      setLoading(true);
      const learned = await getLearnedWords();
      setLearnedWords(learned);

      // Get definitions for all learned words
      const wordsArray = Object.keys(learned).map(word => {
        const definition = getFormattedDefinition(word);
        return {
          word,
          definition: definition.definition,
          hasDefinition: definition.hasDefinition,
          learnedDate: learned[word].learnedDate,
          reviewCount: learned[word].reviewCount,
        };
      });

      // Sort by most recently learned
      wordsArray.sort((a, b) => new Date(b.learnedDate) - new Date(a.learnedDate));
      
      setWordsWithDefinitions(wordsArray);
    } catch (error) {
      console.error('Error loading learned words:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWords = () => {
    if (!searchTerm.trim()) {
      setFilteredWords(wordsWithDefinitions);
      return;
    }

    const filtered = wordsWithDefinitions.filter(
      item => 
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  const WordCard = ({ item }) => (
    <View style={styles.wordCard}>
      <View style={styles.wordHeader}>
        <Text style={Typography.wordTitle}>{item.word}</Text>
        <Text style={Typography.small}>
          {formatDate(item.learnedDate)}
        </Text>
      </View>
      <Text style={Typography.definition}>
        {item.definition}
      </Text>
      {!item.hasDefinition && (
        <Text style={[Typography.small, styles.noDefinition]}>
          💭 Definition not available
        </Text>
      )}
    </View>
  );

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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