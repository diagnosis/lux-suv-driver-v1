import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function RidesScreen() {
  return (
    <LinearGradient colors={['#122620', '#1a3329']} style={styles.container}>
      <View style={styles.content}>
        <AntDesign name="car" size={64} color="#d6ad60" />
        <Text style={styles.title}>Rides</Text>
        <Text style={styles.subtitle}>Ride history and management coming soon</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4ebd0',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b68d40',
    textAlign: 'center',
  },
});