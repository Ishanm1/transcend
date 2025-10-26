import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BreathingScreen from './screens/BreathingScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BreathingScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
