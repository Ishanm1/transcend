import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import BreathingCircle from '../components/BreathingCircle';
import BreathingControls from '../components/BreathingControls';

const BreathingScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const duration = 5; // Fixed 5-second duration

  const handleStart = () => {
    setIsActive(true);
  };

  const handleTouchStart = () => {
    // Toggle state
    if (!isActive) {
      handleStart();
    } else {
      handleStop();
    }
  };

  const handleStop = () => {
    setIsActive(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Breathing Circle */}
        <View style={styles.circleContainer}>
          <BreathingCircle
            duration={duration}
            isActive={isActive}
            onTouchStart={handleTouchStart}
          />
        </View>

        {/* Controls */}
        <BreathingControls
          isActive={isActive}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BreathingScreen;
