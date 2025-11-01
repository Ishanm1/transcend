import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Pressable, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import BreathingCircle from '../components/BreathingCircle';
import BreathingControls from '../components/BreathingControls';
import SessionTimer from '../components/SessionTimer';
import SessionSummaryModal from '../components/SessionSummaryModal';
import EmojiPickerModal from '../components/EmojiPickerModal';
import { useSessionTimer } from '../hooks/useSessionTimer';
import ENVIRONMENTS from '../utils/environments';

const { width } = Dimensions.get('window');

const BreathingScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({ time: '00:00', cycles: 0 });
  const [environment, setEnvironment] = useState('ocean');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: 'Friend', image: null });
  const [beforeEmojis, setBeforeEmojis] = useState([null, null, null]);
  const [afterEmojis, setAfterEmojis] = useState([null, null, null]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmojiSlot, setCurrentEmojiSlot] = useState(null);
  const { sessionTime, start, stopAndReset } = useSessionTimer();
  const duration = 5; // Fixed 5-second duration
  
  // Hold-to-start state
  const [isHolding, setIsHolding] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownIntervalRef = useRef(null);
  
  // Dual video refs for crossfade
  const primaryVideoRef = useRef(null);
  const secondaryVideoRef = useRef(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0); // 0 = primary, 1 = secondary
  const videoOpacity = useRef(new Animated.Value(1)).current;

  // Load and play initial video
  useEffect(() => {
    if (primaryVideoRef.current) {
      primaryVideoRef.current.playAsync();
    }
  }, []);

  // Handle environment change with video crossfade
  const handleEnvironmentChange = async (newEnv) => {
    if (newEnv === environment || isTransitioning) return;
    
    setIsTransitioning(true);
    
    try {
      // Get the inactive video player
      const inactiveVideoRef = activeVideoIndex === 0 ? secondaryVideoRef : primaryVideoRef;
      
      // Load new video in inactive player
      const newVideo = ENVIRONMENTS[newEnv].video;
      if (inactiveVideoRef.current) {
        // Unload previous video
        try {
          await inactiveVideoRef.current.unloadAsync();
        } catch (e) {
          console.log('Video already unloaded:', e);
        }
        
        // Load and play new video
        await inactiveVideoRef.current.loadAsync(newVideo, { 
          shouldPlay: true, 
          isLooping: true, 
          isMuted: true 
        });
        
        // Wait a bit for video to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Crossfade animation (500ms)
      Animated.timing(videoOpacity, {
        toValue: activeVideoIndex === 0 ? 0 : 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Swap active video index and update environment
        setActiveVideoIndex(activeVideoIndex === 0 ? 1 : 0);
        setEnvironment(newEnv);
        setIsTransitioning(false);
      });
    } catch (error) {
      console.log('Error switching environment video:', error);
      setEnvironment(newEnv); // Still update environment for audio
      setIsTransitioning(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clear countdown interval
  const clearCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Handle press in (touch down) anywhere on screen
  const handlePressIn = () => {
    if (isActive) {
      // Already in active session, just track holding
      setIsHolding(true);
      return;
    }

    // Not active, start countdown
    setIsHolding(true);
    setShowCountdown(true);
    setCountdown(3);
    
    // Start countdown
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        // Countdown finished, start session
        clearCountdown();
        setShowCountdown(false);
        setIsActive(true);
        start(); // Start timer from 00:00
      }
    }, 1000);
  };

  // Handle press out (touch release) anywhere on screen
  const handlePressOut = () => {
    setIsHolding(false);
    
    if (isActive) {
      // In active session, stop and show summary
      setSummaryData({
        time: formatTime(sessionTime), // Format as MM:SS
        cycles: cycleCount,
      });
      
      // Stop session
      setIsActive(false);
      stopAndReset();
      
      // Show summary modal
      setShowSummary(true);
    } else if (showCountdown) {
      // In countdown, reset it
      clearCountdown();
      setShowCountdown(false);
      setCountdown(3);
    }
  };

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      clearCountdown();
    };
  }, []);

  const handleCloseSummary = () => {
    setShowSummary(false);
    // Reset session data
    stopAndReset();
    setCycleCount(0);
    // Reset emojis
    setBeforeEmojis([null, null, null]);
    setAfterEmojis([null, null, null]);
  };

  const handleCycleComplete = () => {
    setCycleCount(prev => prev + 1);
  };

  const handleEmojiSlotPress = (type, index) => {
    setCurrentEmojiSlot({ type, index });
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji) => {
    if (currentEmojiSlot) {
      if (currentEmojiSlot.type === 'before') {
        const newEmojis = [...beforeEmojis];
        newEmojis[currentEmojiSlot.index] = emoji;
        setBeforeEmojis(newEmojis);
      } else {
        const newEmojis = [...afterEmojis];
        newEmojis[currentEmojiSlot.index] = emoji;
        setAfterEmojis(newEmojis);
      }
    }
    setShowEmojiPicker(false);
    setCurrentEmojiSlot(null);
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

  const handleProfileUpdate = (profile) => {
    setUserProfile(profile);
  };

  return (
    <View style={styles.container}>
      {/* Dual Background Videos for Crossfade */}
      <Animated.View style={[styles.backgroundVideo, { opacity: videoOpacity }]}>
        <Video
          ref={primaryVideoRef}
          source={ENVIRONMENTS[environment].video}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay
        />
      </Animated.View>
      
      <Animated.View style={[styles.backgroundVideo, { opacity: Animated.subtract(1, videoOpacity) }]}>
        <Video
          ref={secondaryVideoRef}
          source={ENVIRONMENTS.ocean.video}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay={false}
        />
      </Animated.View>

      {/* Content Overlay */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
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
            showCountdown={showCountdown}
            countdown={countdown}
            onCycleComplete={handleCycleComplete}
            isMuted={isMuted}
            onMuteToggle={toggleMute}
            isHapticsEnabled={isHapticsEnabled}
            environment={environment}
            onEnvironmentChange={handleEnvironmentChange}
            onProfileUpdate={handleProfileUpdate}
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
            userProfile={{ 
              name: userProfile.name || 'Friend', 
              image: userProfile.image,
              initials: (userProfile.name || 'ME').substring(0, 2).toUpperCase()
            }}
            beforeEmojis={beforeEmojis}
            afterEmojis={afterEmojis}
            onEmojiSlotPress={handleEmojiSlotPress}
          />

          {/* Emoji Picker Modal */}
          <EmojiPickerModal
            visible={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </View>
      </Pressable>
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
  video: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    flex: 1,
    zIndex: 1,
  },
});

export default BreathingScreen;
