import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import BreathingCircle from '../components/BreathingCircle';
import BreathingControls from '../components/BreathingControls';
import SessionTimer from '../components/SessionTimer';
import SessionSummaryModal from '../components/SessionSummaryModal';
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
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({ time: '00:00', cycles: 0 });
  const { sessionTime, start, stopAndReset } = useSessionTimer();
  // const { breathPhase, breathProgress, glowIntensity } = useBreathCycle(isActive);
  const duration = 5; // Fixed 5-second duration
  const videoRef = useRef(null);

  // Load and play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  }, []);

  const handleStart = () => {
    setIsActive(true);
    start(); // Start timer from 00:00
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    // Capture session data before resetting
    setSummaryData({
      time: formatTime(sessionTime), // Format as MM:SS
      cycles: cycleCount,
    });
    
    // Stop session
    setIsActive(false);
    
    // Show summary modal
    setShowSummary(true);
    
    // Reset will happen when modal closes
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    // Reset session data
    stopAndReset();
    setCycleCount(0);
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
      {/* Background Video */}
      <Video
        ref={videoRef}
        source={require('../assets/6010489-uhd_2160_3840_25fps.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay
      />

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        {/* Session & Cycle Counter - Only show when active */}
        {isActive && (
          <SessionTimer 
            time={sessionTime} 
            cycleCount={cycleCount}
            circleSize={width * 0.75} 
          />
        )}

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

        {/* Session Summary Modal */}
        <SessionSummaryModal
          visible={showSummary}
          sessionTime={summaryData.time}
          cycleCount={summaryData.cycles}
          onClose={handleCloseSummary}
          userProfile={{ initials: 'ME', name: 'Friend' }}
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
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  contentOverlay: {
    flex: 1,
    zIndex: 1,
  },
});

export default BreathingScreen;
