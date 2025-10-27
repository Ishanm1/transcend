import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BreathingCircle = ({ duration = 5, isActive = false, onStart, onStop }) => {
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
  
  // Particle animations for whispy breath effect
  // Create 50 particles with varied properties for realistic breath cloud
  const particles = useRef(
    Array.from({ length: 50 }, (_, index) => {
      const size = 3 + Math.random() * 5; // Varied sizes 3-8px
      const baseOpacity = 0.2 + Math.random() * 0.4; // Varied base opacity
      const distance = 50 + Math.random() * 80; // Varied distances
      const speed = 3000 + Math.random() * 4000; // Varied speeds
      
      return {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        size,
        baseOpacity,
        distance,
        speed,
        angle: (index / 50) * Math.PI * 2 + (Math.random() - 0.5) * 0.8, // Distributed around circle
      };
    })
  ).current;

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
          
          // Start particle animations - graceful breath cloud effect
          particles.forEach((particle, index) => {
            // Stagger start times for more organic appearance
            const delay = (index / particles.length) * 1000;
            
            setTimeout(() => {
              // Gentle spiraling outward motion, like breath dispersing
              const spiralAngle = particle.angle + Math.sin(index * 0.3) * 0.5;
              const x1 = Math.cos(spiralAngle) * particle.distance * 0.3;
              const y1 = Math.sin(spiralAngle) * particle.distance * 0.3;
              const x2 = Math.cos(spiralAngle + 0.3) * particle.distance * 0.7;
              const y2 = Math.sin(spiralAngle + 0.3) * particle.distance * 0.7;
              const x3 = Math.cos(spiralAngle + 0.6) * particle.distance;
              const y3 = Math.sin(spiralAngle + 0.6) * particle.distance;
              
              Animated.loop(
                Animated.parallel([
                  // Gentle flowing X movement
                  Animated.sequence([
                    Animated.timing(particle.x, {
                      toValue: x1,
                      duration: particle.speed * 0.3,
                      useNativeDriver: true,
                    }),
                    Animated.timing(particle.x, {
                      toValue: x2,
                      duration: particle.speed * 0.35,
                      useNativeDriver: true,
                    }),
                    Animated.timing(particle.x, {
                      toValue: x3,
                      duration: particle.speed * 0.35,
                      useNativeDriver: true,
                    }),
                  ]),
                  // Gentle flowing Y movement with slight upward drift
                  Animated.sequence([
                    Animated.timing(particle.y, {
                      toValue: y1 - 10,
                      duration: particle.speed * 0.3,
                      useNativeDriver: true,
                    }),
                    Animated.timing(particle.y, {
                      toValue: y2 - 20,
                      duration: particle.speed * 0.35,
                      useNativeDriver: true,
                    }),
                    Animated.timing(particle.y, {
                      toValue: y3 - 30,
                      duration: particle.speed * 0.35,
                      useNativeDriver: true,
                    }),
                  ]),
                  // Gentle fade in and out
                  Animated.sequence([
                    Animated.timing(particle.opacity, {
                      toValue: particle.baseOpacity,
                      duration: particle.speed * 0.25,
                      useNativeDriver: true,
                    }),
                    Animated.timing(particle.opacity, {
                      toValue: particle.baseOpacity * 0.7,
                      duration: particle.speed * 0.5,
                      useNativeDriver: true,
                    }),
                    Animated.timing(particle.opacity, {
                      toValue: 0,
                      duration: particle.speed * 0.25,
                      useNativeDriver: true,
                    }),
                  ]),
                ])
              ).start();
            }, delay);
          });
          
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
              // Reset particles
              particles.forEach(particle => {
                particle.x.setValue(0);
                particle.y.setValue(0);
                particle.opacity.setValue(0);
              });
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
    if (!isActive && onStart) {
      onStart(); // Call parent to start timer and set isActive
      // Start breathing cycle immediately
      await startBreathingCycle();
    }
  };

  const handlePressOut = async () => {
    if (isActive && onStop) {
      onStop(); // Call parent to stop & reset timer and set isActive to false
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
    <View style={styles.mainContainer}>
      {/* Top Right Controls */}
      <View style={styles.topRightControls}>
        {/* Volume Toggle */}
        <TouchableOpacity
          style={styles.glassButton}
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isMuted ? "volume-mute-outline" : "volume-high-outline"} 
            size={24} 
            color="#ffffff"
            style={{ opacity: 0.8 }}
          />
        </TouchableOpacity>
      </View>


      {/* Breathing Circle */}
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.circleWrapper}
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
              stroke="#ffffff"
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

        {/* INHALE text with whispy particles - shows during pause */}
        {isActive && isInhaling && (
          <Animated.View
            style={[
              styles.inhaleTextContainer,
              {
                opacity: inhaleOpacity,
              },
            ]}
          >
            {/* Whispy breath particles - creating a cloud effect */}
            {particles.map((particle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    opacity: particle.opacity,
                    transform: [
                      { translateX: particle.x },
                      { translateY: particle.y },
                    ],
                  },
                ]}
              />
            ))}
            
            {/* INHALE text */}
            <Text style={styles.inhaleText}>INHALE</Text>
          </Animated.View>
        )}
      </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  topRightControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 100,
  },
  glassButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  circleWrapper: {
    flex: 1,
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#ffffff',
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
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
});

export default BreathingCircle;
