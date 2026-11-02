import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Picker from 'react-native-picker-select';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LinearGradient colors={['#6B46C1', '#9333EA', '#D4AF37']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Shalika Salon</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
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
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
});