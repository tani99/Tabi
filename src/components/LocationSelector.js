import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import locationService from '../services/location';

const LocationSelector = ({
  label,
  value,
  onChangeText,
  placeholder = "Search for a location...",
  error,
  style,
  onLocationSelect,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentLocations, setRecentLocations] = useState([]);
  const [popularLocations] = useState(locationService.getPopularDestinations());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  // Load recent locations from storage
  useEffect(() => {
    const loadRecentLocations = async () => {
      const recent = await locationService.getRecentLocations();
      setRecentLocations(recent);
    };
    loadRecentLocations();
  }, []);

  // Update search text when value prop changes
  useEffect(() => {
    setSearchText(value || '');
  }, [value]);

  // Animate suggestions panel
  useEffect(() => {
    if (showSuggestions) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSuggestions]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for touch events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSearchTextChange = (text) => {
    setSearchText(text);
    onChangeText?.(text);
    
    if (text.trim().length > 2) {
      searchLocations(text);
    } else {
      setSuggestions([]);
    }
  };

  const searchLocations = async (query) => {
    setLoading(true);
    
    try {
      const result = await locationService.searchLocations(query);
      if (result.success) {
        setSuggestions(result.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (location) => {
    setSearchText(location.name);
    onChangeText?.(location.name);
    onLocationSelect?.(location);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    // Add to recent locations
    await locationService.addToRecentLocations(location);
    const updatedRecent = await locationService.getRecentLocations();
    setRecentLocations(updatedRecent);
  };

  const renderLocationItem = ({ item, section }) => {
    const getIconName = () => {
      switch (item.icon) {
        case 'time': return 'time-outline';
        case 'search': return 'search-outline';
        case 'airplane': return 'airplane-outline';
        case 'business': return 'business-outline';
        case 'water': return 'water-outline';
        case 'train': return 'train-outline';
        default: return 'location-outline';
      }
    };

    return (
      <TouchableOpacity
        style={styles.locationItem}
        onPress={() => handleLocationSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.locationItemContent}>
          <Ionicons
            name={getIconName()}
            size={20}
            color={colors.text.secondary}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.text.tertiary}
        />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color={colors.text.secondary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSuggestionsContent = () => {
    const sections = [];
    
    // Recent locations
    if (recentLocations.length > 0) {
      sections.push({
        title: 'Recent',
        icon: 'time-outline',
        data: recentLocations,
      });
    }
    
    // Search results
    if (suggestions.length > 0) {
      sections.push({
        title: 'Search Results',
        icon: 'search-outline',
        data: suggestions,
      });
    }
    
    // Popular locations (only show if no search results)
    if (suggestions.length === 0 && searchText.length <= 2) {
      sections.push({
        title: 'Popular Destinations',
        icon: 'star-outline',
        data: popularLocations,
      });
    }

    return (
      <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}
        
        {sections.map((section, index) => (
          <View key={section.title}>
            {renderSectionHeader(section.title, section.icon)}
            {section.data.map((item) => (
              <View key={item.id}>
                {renderLocationItem({ item, section })}
              </View>
            ))}
            {index < sections.length - 1 && <View style={styles.sectionDivider} />}
          </View>
        ))}
        
        {!loading && sections.length === 0 && searchText.length > 2 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={24} color={colors.text.tertiary} />
            <Text style={styles.noResultsText}>No locations found</Text>
            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    style,
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="location-outline"
            size={20}
            color={isFocused ? colors.primary.main : colors.input.placeholder}
            style={styles.inputIcon}
          />
          <TextInput
            style={inputStyle}
            value={searchText}
            onChangeText={handleSearchTextChange}
            placeholder={placeholder}
            placeholderTextColor={colors.input.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            {...props}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                onChangeText?.('');
                setSuggestions([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {showSuggestions && (
        <Animated.View
          style={[
            styles.suggestionsOverlay,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderSuggestionsContent()}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.input.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 12,
    backgroundColor: colors.input.background,
    minHeight: 56,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.input.text,
    paddingVertical: 16,
    paddingRight: 16,
  },
  inputFocused: {
    borderColor: colors.primary.main,
  },
  inputError: {
    borderColor: colors.input.borderError,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  errorText: {
    color: colors.status.error.main,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  suggestionsOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 300,
  },
  suggestionsContainer: {
    padding: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  locationItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border.secondary,
    marginVertical: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
    fontWeight: '500',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 4,
  },
});

export default LocationSelector;
