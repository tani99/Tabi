import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomButton from './CustomButton';
import LoadingIndicator from './ui/LoadingIndicator';
import { testOpenAIConnection, getOpenAIStatus } from '../services/openai';
import { colors } from '../theme/colors';

/**
 * Temporary test component for OpenAI API connectivity
 * This component will be removed in later phases
 */
const AITestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      setLastTestResult(null);
      
      console.log('AI Test: Starting connection test...');
      
      const result = await testOpenAIConnection();
      
      setLastTestResult(result);
      
      if (result.success) {
        Alert.alert(
          'AI Connection Test Successful! ✅',
          `Response time: ${result.data.responseTime}ms\nModel: ${result.data.model}\nMessage: ${result.data.message}`,
          [{ text: 'OK' }]
        );
        console.log('AI Test: Success -', result.data);
      } else {
        Alert.alert(
          'AI Connection Test Failed ❌',
          result.error,
          [{ text: 'OK' }]
        );
        console.log('AI Test: Failed -', result.error);
      }
    } catch (error) {
      console.error('AI Test: Unexpected error -', error);
      Alert.alert(
        'Test Error',
        'An unexpected error occurred during testing',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowStatus = () => {
    const status = getOpenAIStatus();
    
    const statusMessage = `
Configuration Status:
• Configured: ${status.configured ? '✅' : '❌'}
• Enabled: ${status.enabled ? '✅' : '❌'}
• Available: ${status.available ? '✅' : '❌'}
• Model: ${status.model}
• Max Tokens: ${status.maxTokens}
• Temperature: ${status.temperature}

${status.error ? `Error: ${status.error}` : ''}
    `.trim();
    
    Alert.alert('AI Service Status', statusMessage, [{ text: 'OK' }]);
    console.log('AI Status:', status);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 AI Integration Test</Text>
      <Text style={styles.subtitle}>
        Temporary testing component - will be removed in later phases
      </Text>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Test OpenAI Connection"
          onPress={handleTestConnection}
          disabled={isLoading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        />
        
        <CustomButton
          title="Show AI Status"
          onPress={handleShowStatus}
          style={[styles.button, { backgroundColor: colors.secondary }]}
        />
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="small" />
          <Text style={styles.loadingText}>Testing AI connection...</Text>
        </View>
      )}
      
      {lastTestResult && (
        <View style={[
          styles.resultContainer,
          { backgroundColor: lastTestResult.success ? colors.successLight : colors.errorLight }
        ]}>
          <Text style={[
            styles.resultText,
            { color: lastTestResult.success ? colors.success : colors.error }
          ]}>
            Last test: {lastTestResult.success ? 'SUCCESS ✅' : 'FAILED ❌'}
          </Text>
          {lastTestResult.success && lastTestResult.data && (
            <Text style={styles.resultDetails}>
              Response time: {lastTestResult.data.responseTime}ms
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AITestComponent;
