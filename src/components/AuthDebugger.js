import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { testAuthAndFirestore, testWritePermission } from '../utils/authTest';
import { colors } from '../theme/colors';

const AuthDebugger = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAuthTest = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      const result = await testAuthAndFirestore();
      setTestResults(result);
      
      if (!result.success) {
        Alert.alert('Test Failed', result.error);
      } else {
        Alert.alert('Test Successful', `User: ${result.user.email}\nDocuments found: ${result.documentCount}`);
      }
    } catch (error) {
      setTestResults({ success: false, error: error.message });
      Alert.alert('Test Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const runWriteTest = async () => {
    setLoading(true);
    
    try {
      const result = await testWritePermission();
      
      if (result.success) {
        Alert.alert('Write Test Successful', `Created document: ${result.documentId}`);
      } else {
        Alert.alert('Write Test Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Write Test Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Authentication & Firestore Debugger</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Auth State</Text>
        <Text style={styles.info}>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
        {user && (
          <>
            <Text style={styles.info}>User ID: {user.uid}</Text>
            <Text style={styles.info}>Email: {user.email}</Text>
            <Text style={styles.info}>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tests</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={runAuthTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Running...' : 'Test Auth & Read Access'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={runWriteTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Running...' : 'Test Write Access'}
          </Text>
        </TouchableOpacity>
      </View>

      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <Text style={[styles.result, { color: testResults.success ? colors.status.success.main : colors.status.error.main }]}>
            {testResults.success ? '✅ Success' : '❌ Failed'}
          </Text>
          {testResults.error && (
            <Text style={styles.errorText}>Error: {testResults.error}</Text>
          )}
          {testResults.code && (
            <Text style={styles.errorText}>Code: {testResults.code}</Text>
          )}
          {testResults.user && (
            <Text style={styles.info}>User: {testResults.user.email}</Text>
          )}
          {testResults.documentCount !== undefined && (
            <Text style={styles.info}>Documents found: {testResults.documentCount}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  button: {
    backgroundColor: colors.primary.main,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error.main,
    marginBottom: 5,
  },
});

export default AuthDebugger;
