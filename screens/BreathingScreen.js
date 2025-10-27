import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import BreathingCircle from '../components/BreathingCircle';
import BreathingControls from '../components/BreathingControls';
import SessionTimer from '../components/SessionTimer';
// import SacredGeometryMandala from '../components/SacredGeometryMandala';
import { useSessionTimer } from '../hooks/useSessionTimer';
// import { useBreathCycle } from '../hooks/useBreathCycle';

const { width } = Dimensions.get('window');

const BreathingScreen = () => {
  const [isActive, setIsActive] = useState(false);
  // const [theme, setTheme] = useState('modern'); // 'modern' or 'thousandPetals'
  const [isMuted, setIsMuted] = useState(false);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const { sessionTime, start, stopAndReset } = useSessionTimer();
  // const { breathPhase, breathProgress, glowIntensity } = useBreathCycle(isActive);
  const duration = 5; // Fixed 5-second duration

  const handleStart = () => {
    setIsActive(true);
    start(); // Start timer from 00:00
  };

  const handleStop = () => {
    setIsActive(false);
    stopAndReset(); // Stop and reset timer to 00:00
    setCycleCount(0); // Reset cycle count
  };

  const handleCycleComplete = () => {
    setCycleCount(prev => prev + 1);
  };

  // const toggleTheme = () => {
  //   setTheme(theme === 'modern' ? 'thousandPetals' : 'modern');
  // };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleHaptics = () => {
    setIsHapticsEnabled(!isHapticsEnabled);
  };

  return (
    <View style={styles.container}>
      {/* Session & Cycle Counter */}
      <SessionTimer 
        time={sessionTime} 
        cycleCount={cycleCount}
        circleSize={width * 0.75} 
      />

      {/* Breathing Circle */}
      <BreathingCircle
        duration={duration}
        isActive={isActive}
        onStart={handleStart}
        onStop={handleStop}
        onCycleComplete={handleCycleComplete}
        // onThemeToggle={toggleTheme}
        // currentTheme={theme}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        isHapticsEnabled={isHapticsEnabled}
      />

      {/* Sacred Geometry Mandala - COMMENTED OUT FOR NOW */}
      {/* {theme === 'thousandPetals' && (
        <SacredGeometryMandala
          isActive={isActive}
          breathPhase={breathPhase}
          breathProgress={breathProgress}
          glowIntensity={glowIntensity}
          onStart={handleStart}
          onStop={handleStop}
          isHapticsEnabled={isHapticsEnabled}
          onThemeToggle={toggleTheme}
          currentTheme={theme}
          isMuted={isMuted}
          onMuteToggle={toggleMute}
        />
      )} */}

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
