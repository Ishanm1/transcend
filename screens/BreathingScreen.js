import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import BreathingCircle from '../components/BreathingCircle';
import BreathingControls from '../components/BreathingControls';
import SessionTimer from '../components/SessionTimer';
import { useSessionTimer } from '../hooks/useSessionTimer';

const { width } = Dimensions.get('window');

const BreathingScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const { sessionTime, start, stopAndReset } = useSessionTimer();
  const duration = 5; // Fixed 5-second duration

  const handleStart = () => {
    setIsActive(true);
    start(); // Start timer from 00:00
  };

  const handleStop = () => {
    setIsActive(false);
    stopAndReset(); // Stop and reset timer to 00:00
  };

  return (
    <View style={styles.container}>
      {/* Session Timer */}
      <SessionTimer time={sessionTime} circleSize={width * 0.75} />

      {/* Breathing Circle */}
      <BreathingCircle
        duration={duration}
        isActive={isActive}
        onStart={handleStart}
        onStop={handleStop}
      />

      {/* Controls */}
      <BreathingControls
        isActive={isActive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default BreathingScreen;
