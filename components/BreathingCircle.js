import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BreathingCircle = ({ duration = 5, isActive = false, onTouchStart }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const inhaleOpacity = useRef(new Animated.Value(0)).current;
  const soundRef = useRef(null);
  const animationRef = useRef(null);
  const pulseRef = useRef(null);
  const hapticTimeoutsRef = useRef([]);
  const [isInhaling, setIsInhaling] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isHapticsEnabled, setIsHapticsEnabled] = React.useState(true);

  const circleSize = width * 0.75;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Load audio on mount
  useEffect(() => {
    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/breathing-audio.mp3'),
          { 
            shouldPlay: false, 
            isLooping: true,
          }
        );
        soundRef.current = sound;
      } catch (error) {
        console.log('Error loading audio:', error);
      }
    }
    
    loadAudio();
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Handle isActive state changes
  useEffect(() => {
    if (!isActive) {
      stopAnimation();
      progressAnim.setValue(0);
      glowAnim.setValue(0);
      inhaleOpacity.setValue(0);
      setIsInhaling(false);
    }
  }, [isActive]);

  // Handle mute/unmute
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : 1).catch(error => {
        console.log('Error setting volume:', error);
      });
    }
  }, [isMuted]);

  // Haptic control functions
  const triggerHaptic = (type) => {
    if (!isHapticsEnabled) return;
    
    try {
      switch (type) {
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'notification':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Error triggering haptic:', error);
    }
  };

  const clearHapticTimeouts = () => {
    hapticTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    hapticTimeoutsRef.current = [];
  };

  const scheduleExhaleHaptics = () => {
    if (!isHapticsEnabled) return;
    
    const exhalePhase = 8040; // 8.04 seconds
    
    // Descending intensity pattern: Heavy → Heavy → Medium → Light
    const hapticSchedule = [
      { time: 0, type: 'heavy' },        // 0% - "Begin letting go"
      { time: exhalePhase * 0.25, type: 'heavy' },   // 25% - "Releasing deeply"
      { time: exhalePhase * 0.50, type: 'medium' },  // 50% - "Emptying..."
      { time: exhalePhase * 0.75, type: 'light' },   // 75% - "Nearly empty..."
      // 100% - Silence, complete emptiness
    ];

    hapticSchedule.forEach(({ time, type }) => {
      const timeout = setTimeout(() => triggerHaptic(type), time);
      hapticTimeoutsRef.current.push(timeout);
    });
  };

  const scheduleInhaleHaptics = () => {
    if (!isHapticsEnabled) return;
    
    const inhalePhase = 6960; // 6.96 seconds
    
    // Ascending intensity pattern: Light → Medium → Heavy → Heavy
    const hapticSchedule = [
      { time: 0, type: 'notification' },     // Transition - "You've touched emptiness"
      { time: 50, type: 'light' },           // 0% - "Breath returns gently"
      { time: inhalePhase * 0.33, type: 'medium' },  // 33% - "Filling..."
      { time: inhalePhase * 0.66, type: 'heavy' },   // 66% - "Gathering energy"
      { time: inhalePhase * 0.95, type: 'heavy' },   // 95% - "Full. Complete. Whole."
    ];

    hapticSchedule.forEach(({ time, type }) => {
      const timeout = setTimeout(() => triggerHaptic(type), time);
      hapticTimeoutsRef.current.push(timeout);
    });
  };

  const schedulePauseHaptic = () => {
    if (!isHapticsEnabled) return;
    
    // Success notification at the peak - "The cycle is complete"
    const timeout = setTimeout(() => triggerHaptic('notification'), 0);
    hapticTimeoutsRef.current.push(timeout);
  };

  const startBreathingCycle = async () => {
    try {
      // Start audio from beginning
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }

      const breathingLoop = () => {
        // Reset to start position
        progressAnim.setValue(0);
        glowAnim.setValue(0);
        inhaleOpacity.setValue(0);
        setIsInhaling(false);

        // Clear any existing haptic timeouts
        clearHapticTimeouts();

        // Stop any existing animations
        if (pulseRef.current) {
          pulseRef.current.stop();
        }
        if (animationRef.current) {
          animationRef.current.stop();
        }

        // Start exhale haptic pattern
        scheduleExhaleHaptics();

        // Pulse animation - continuous during exhale
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: false,
            }),
          ]),
          { iterations: 4 } // ~8 seconds of pulsing
        );

        pulseRef.current = pulseAnimation;
        pulseAnimation.start();

        // Phase 1: Exhale - 8.04 seconds (fill progresses 0° → 360°)
        const fillAnimation = Animated.timing(progressAnim, {
          toValue: 1,
          duration: 8040, // 8.04 seconds
          useNativeDriver: false,
        });

        animationRef.current = fillAnimation;
        
        fillAnimation.start(({ finished }) => {
          if (!finished) return;
          
          // Stop pulsing
          if (pulseRef.current) {
            pulseRef.current.stop();
          }
          
          // Phase 2: Inhale - Fill empties back to 0°
          const inhaleDuration = 6960; // ~6.96 seconds (15s - 8.04s)
          
          // Stop pulsing during inhale
          glowAnim.setValue(0);
          
          // Start inhale haptic pattern
          scheduleInhaleHaptics();
          
          // Show "INHALE" text immediately
          setIsInhaling(true);
          
          // Fade in "INHALE" text
          const fadeInAnim = Animated.timing(inhaleOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          });
          
          fadeInAnim.start();
          
          // Animate fill emptying (360° → 0°) during inhale
          const emptyAnimation = Animated.timing(progressAnim, {
            toValue: 0,
            duration: inhaleDuration,
            useNativeDriver: false,
          });
          
          animationRef.current = emptyAnimation;
          
          emptyAnimation.start(({ finished }) => {
            if (!finished) return;
            
            // Peak completion haptic - "The cycle is complete"
            schedulePauseHaptic();
            
            // Fade out "INHALE" text at the start of the 1.5s separator
            Animated.timing(inhaleOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setIsInhaling(false);
            });
            
            // Wait for 1.5s separator, then restart the cycle
            const restartTimeout = setTimeout(() => {
              breathingLoop(); // Restart cycle after pause
            }, 1500);
            
            // Store timeout ref for cleanup
            animationRef.current = { 
              stop: () => {
                clearTimeout(restartTimeout);
              }
            };
          });
        });
      };

      breathingLoop();
    } catch (error) {
      console.log('Error starting breathing cycle:', error);
    }
  };

  const stopAnimation = async () => {
    // Stop animations
    if (animationRef.current) {
      animationRef.current.stop();
    }
    if (pulseRef.current) {
      pulseRef.current.stop();
    }
    progressAnim.stopAnimation();
    glowAnim.stopAnimation();
    
    // Clear all haptic timeouts
    clearHapticTimeouts();
    
    // Stop audio
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
    
    // Reset values
    progressAnim.setValue(0);
    glowAnim.setValue(0);
    inhaleOpacity.setValue(0);
    setIsInhaling(false);
  };

  const handlePressIn = async () => {
    if (!isActive && onTouchStart) {
      onTouchStart(); // Set isActive to true
      // Start breathing cycle immediately
      await startBreathingCycle();
    }
  };

  const handlePressOut = async () => {
    if (isActive && onTouchStart) {
      onTouchStart(); // Set isActive to false
      // Stop everything
      await stopAnimation();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleHaptics = () => {
    setIsHapticsEnabled(!isHapticsEnabled);
  };

  // Animate the stroke dash offset to create fill effect
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0], // Start full (invisible), end at 0 (complete circle)
  });

  // Pulse effect on stroke opacity
  const strokeOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.0],
  });

  // Glow effect
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.7],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.container}
    >
      <View style={[styles.circleContainer, { width: circleSize, height: circleSize }]}>
        {/* Static glass ring - always visible */}
        <View
          style={[
            styles.staticGlassRing,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
            },
          ]}
        />

        {/* Glow effect behind the fill */}
        {isActive && (
          <Animated.View
            style={[
              styles.glowCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Blue fill arc - animates 0° → 360° */}
        {isActive && (
          <Svg
            width={circleSize}
            height={circleSize}
            style={styles.svgContainer}
          >
            <AnimatedCircle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="#4A90E2"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${circleSize / 2}, ${circleSize / 2}`}
              opacity={strokeOpacity}
            />
          </Svg>
        )}

        {/* Inner black circle - creates ring effect */}
        <View
          style={[
            styles.innerCircle,
            {
              width: circleSize - strokeWidth * 2 - 10,
              height: circleSize - strokeWidth * 2 - 10,
              borderRadius: (circleSize - strokeWidth * 2 - 10) / 2,
            },
          ]}
        />

        {/* INHALE text - shows during pause */}
        {isActive && isInhaling && (
          <Animated.View
            style={[
              styles.inhaleTextContainer,
              {
                opacity: inhaleOpacity,
              },
            ]}
          >
            <Text style={styles.inhaleText}>INHALE</Text>
          </Animated.View>
        )}

        {/* Volume Toggle Button */}
        <TouchableOpacity
          style={[styles.volumeButton, { left: -40 }]}
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <Text style={styles.volumeIcon}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        {/* Haptics Toggle Button */}
        <TouchableOpacity
          style={[styles.volumeButton, { right: -40 }]}
          onPress={toggleHaptics}
          activeOpacity={0.7}
        >
          <Text style={styles.volumeIcon}>{isHapticsEnabled ? '📳' : '📴'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  staticGlassRing: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  svgContainer: {
    position: 'absolute',
  },
  innerCircle: {
    position: 'absolute',
    backgroundColor: '#000000',
    zIndex: 2,
  },
  inhaleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  inhaleText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 4,
    textAlign: 'center',
  },
  volumeButton: {
    position: 'absolute',
    bottom: -80,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    zIndex: 15,
  },
  volumeIcon: {
    fontSize: 28,
  },
});

export default BreathingCircle;
