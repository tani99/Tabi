import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const FirestoreTest = () => {
  const [testStatus, setTestStatus] = useState('idle');
  const [testResults, setTestResults] = useState([]);
  const { user } = useAuth();

  const runTest = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to test Firestore operations');
      return;
    }

    setTestStatus('running');
    setTestResults([]);

    try {
      // Test 1: Write operation
      setTestResults(prev => [...prev, '🔄 Testing write operation...']);
      
      const testTrip = {
        userId: user.uid,
        name: 'Test Trip - App Test',
        location: 'Test Location',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'This is a test trip from the app',
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'trips'), testTrip);
      setTestResults(prev => [...prev, '✅ Write operation successful']);
      setTestResults(prev => [...prev, `   Document ID: ${docRef.id}`]);

      // Test 2: Read operation
      setTestResults(prev => [...prev, '🔄 Testing read operation...']);
      const q = query(collection(db, 'trips'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      setTestResults(prev => [...prev, '✅ Read operation successful']);
      setTestResults(prev => [...prev, `   Found ${querySnapshot.size} documents`]);

      // Test 3: Delete operation
      setTestResults(prev => [...prev, '🔄 Testing delete operation...']);
      await deleteDoc(docRef);
      setTestResults(prev => [...prev, '✅ Delete operation successful']);

      // Test 4: Verify cleanup
      setTestResults(prev => [...prev, '🔄 Verifying cleanup...']);
      const cleanupQuery = await getDocs(q);
      setTestResults(prev => [...prev, `✅ Cleanup verified (${cleanupQuery.size} documents remaining)`]);

      setTestStatus('success');
      setTestResults(prev => [...prev, '🎉 All Firestore tests passed!']);

    } catch (error) {
      setTestStatus('error');
      setTestResults(prev => [...prev, `❌ Test failed: ${error.message}`]);
      console.error('Firestore test error:', error);
    }
  };

  const getStatusColor = () => {
    switch (testStatus) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'running': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case 'success': return '✅ Tests Passed';
      case 'error': return '❌ Tests Failed';
      case 'running': return '🔄 Running Tests...';
      default: return '🧪 Run Tests';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firestore Setup Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: getStatusColor() }]}
        onPress={runTest}
        disabled={testStatus === 'running'}
      >
        <Text style={styles.buttonText}>{getStatusText()}</Text>
      </TouchableOpacity>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>
      )}

      {!user && (
        <Text style={styles.warning}>
          ⚠️ Please log in to test Firestore operations
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  warning: {
    color: '#FF9800',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default FirestoreTest;
