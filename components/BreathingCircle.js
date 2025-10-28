import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { useFonts, Allura_400Regular } from '@expo-google-fonts/allura';

const { width } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BreathingCircle = ({ 
  duration = 5, 
  isActive = false, 
  onStart, 
  onStop, 
  onCycleComplete,
  onThemeToggle, 
  currentTheme = 'modern',
  isMuted = false,
  onMuteToggle,
  isHapticsEnabled = true
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const inhaleOpacity = useRef(new Animated.Value(0)).current;
  const exhaleOpacity = useRef(new Animated.Value(0)).current;
  const soundRef = useRef(null);
  const exhaleSoundRef = useRef(null);
  const inhaleSoundRef = useRef(null);
  const animationRef = useRef(null);
  const pulseRef = useRef(null);
  const hapticTimeoutsRef = useRef([]);
  const omShouldBePlaying = useRef(false); // Track if om sound should be playing
  const [isInhaling, setIsInhaling] = React.useState(false);
  const [isExhaling, setIsExhaling] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [omSoundEnabled, setOmSoundEnabled] = React.useState(true);
  const [exhaleSoundEnabled, setExhaleSoundEnabled] = React.useState(true);
  const [inhaleSoundEnabled, setInhaleSoundEnabled] = React.useState(true);
  const [showCountdown, setShowCountdown] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);

  // Load Allura font
  const [fontsLoaded] = useFonts({
    Allura_400Regular,
  });

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
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
          interruptionModeIOS: 2, // Mix with others
          interruptionModeAndroid: 2, // Duck others (allows mixing)
        });
        
        // Load main breathing audio (om sound)
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/omfull.mp3'),
          { 
            shouldPlay: false, 
            isLooping: true,
          }
        );
        
        // Add status update callback to monitor playback and keep it playing continuously
        sound.setOnPlaybackStatusUpdate((status) => {
          // If the sound stops unexpectedly while it should be playing, restart it
          if (status.isLoaded && !status.isPlaying && !status.isBuffering && omShouldBePlaying.current) {
            console.log('Om sound stopped unexpectedly, restarting...');
            sound.playAsync().catch(err => console.log('Error restarting om sound:', err));
          }
        });
        
        soundRef.current = sound;

        // Load exhale sound effect
        const { sound: exhaleSound } = await Audio.Sound.createAsync(
          require('../assets/exhale.mp3'),
          { 
            shouldPlay: false, 
            isLooping: false,
          }
        );
        exhaleSoundRef.current = exhaleSound;

        // Load inhale sound effect
        const { sound: inhaleSound } = await Audio.Sound.createAsync(
          require('../assets/inahlereal.mp3'),
          { 
            shouldPlay: false, 
            isLooping: false,
          }
        );
        inhaleSoundRef.current = inhaleSound;
      } catch (error) {
        console.log('Error loading audio:', error);
      }
    }
    
    loadAudio();
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (exhaleSoundRef.current) {
        exhaleSoundRef.current.unloadAsync();
      }
      if (inhaleSoundRef.current) {
        inhaleSoundRef.current.unloadAsync();
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
      exhaleOpacity.setValue(0);
      setIsInhaling(false);
      setIsExhaling(false);
    }
  }, [isActive]);

  // Handle mute/unmute
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : 1).catch(error => {
        console.log('Error setting volume:', error);
      });
    }
    if (exhaleSoundRef.current) {
      exhaleSoundRef.current.setVolumeAsync(isMuted ? 0 : 1).catch(error => {
        console.log('Error setting exhale volume:', error);
      });
    }
    if (inhaleSoundRef.current) {
      inhaleSoundRef.current.setVolumeAsync(isMuted ? 0 : 1).catch(error => {
        console.log('Error setting inhale volume:', error);
      });
    }
  }, [isMuted]);

  // Handle om sound enable/disable while active
  useEffect(() => {
    if (soundRef.current && isActive) {
      if (omSoundEnabled && omShouldBePlaying.current) {
        // If enabled and should be playing, ensure it's playing
        soundRef.current.getStatusAsync().then(status => {
          if (status.isLoaded && !status.isPlaying) {
            soundRef.current.playAsync().catch(error => {
              console.log('Error restarting om sound:', error);
            });
          }
        });
      } else if (!omSoundEnabled) {
        // If disabled, stop it
        omShouldBePlaying.current = false;
        soundRef.current.stopAsync().catch(error => {
          console.log('Error stopping om sound:', error);
        });
      }
    }
  }, [omSoundEnabled, isActive]);

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
    
    // Wave Pattern: Rising waves - building intensity throughout
    // Creates crescendo effect as you fill with breath
    const inhalePhase = 6960; // 6.96 seconds
    const waveInterval = 600; // Every 0.6s (slightly faster than exhale)
    const numWaves = Math.floor(inhalePhase / waveInterval);
    
    const hapticSchedule = [];
    for (let i = 0; i <= numWaves; i++) {
      const progress = i / numWaves;
      let intensity;
      
      if (progress < 0.33) {
        intensity = 'light'; // First third: gentle beginning
      } else if (progress < 0.66) {
        intensity = 'medium'; // Middle third: building
      } else {
        intensity = 'heavy'; // Final third: powerful crescendo
      }
      
      hapticSchedule.push({
        time: i * waveInterval,
        type: intensity
      });
    }

    hapticSchedule.forEach(({ time, type }) => {
      const timeout = setTimeout(() => triggerHaptic(type), time);
      hapticTimeoutsRef.current.push(timeout);
    });
  };

  const schedulePauseHaptic = () => {
    if (!isHapticsEnabled) return;
    
    // Monk Design: Gentle notification - "Rest, the cycle is complete"
    const timeout = setTimeout(() => triggerHaptic('notification'), 0);
    hapticTimeoutsRef.current.push(timeout);
  };

  const startBreathingCycle = async () => {
    try {
      const breathingLoop = async () => {
        // Reset to start position
        progressAnim.setValue(0);
        glowAnim.setValue(0);
        inhaleOpacity.setValue(0);
        exhaleOpacity.setValue(0);
        setIsInhaling(false);

        // Play exhale sound at the start of each cycle - if enabled
        if (exhaleSoundRef.current && exhaleSoundEnabled) {
          try {
            await exhaleSoundRef.current.setPositionAsync(0);
            await exhaleSoundRef.current.playAsync();
          } catch (error) {
            console.log('Error playing exhale sound:', error);
          }
        }

        // Show "EXHALE" text immediately at start of cycle
        setIsExhaling(true);
        Animated.timing(exhaleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

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
        
          fillAnimation.start(async ({ finished }) => {
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
          
          // Play inhale sound effect - if enabled
          if (inhaleSoundRef.current && inhaleSoundEnabled) {
            try {
              await inhaleSoundRef.current.setPositionAsync(0);
              await inhaleSoundRef.current.playAsync();
            } catch (error) {
              console.log('Error playing inhale sound:', error);
            }
          }
          
          // Fade out "EXHALE" text
          Animated.timing(exhaleOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsExhaling(false);
          });
          
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
            
            // Increment cycle count - one complete exhale+inhale cycle finished
            if (onCycleComplete) {
              onCycleComplete();
            }
            
            // Fade out "INHALE" text
            Animated.timing(inhaleOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setIsInhaling(false);
            });
            
            // Restart cycle after 0.25s pause
            const restartTimeout = setTimeout(() => {
              breathingLoop(); // Restart cycle after brief pause
            }, 250);
            
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
    
    // Stop main audio
    if (soundRef.current) {
      try {
        omShouldBePlaying.current = false; // Mark that om sound should stop
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
    
    // Stop exhale sound
    if (exhaleSoundRef.current) {
      try {
        await exhaleSoundRef.current.stopAsync();
        await exhaleSoundRef.current.setPositionAsync(0);
      } catch (error) {
        console.log('Error stopping exhale sound:', error);
      }
    }
    
    // Stop inhale sound
    if (inhaleSoundRef.current) {
      try {
        await inhaleSoundRef.current.stopAsync();
        await inhaleSoundRef.current.setPositionAsync(0);
      } catch (error) {
        console.log('Error stopping inhale sound:', error);
      }
    }
    
    // Reset values
    progressAnim.setValue(0);
    glowAnim.setValue(0);
    inhaleOpacity.setValue(0);
    exhaleOpacity.setValue(0);
    setIsInhaling(false);
    setIsExhaling(false);
    setShowCountdown(false);
    setCountdown(3);
  };

  const handlePressIn = async () => {
    if (!isActive && onStart) {
      // Show countdown
      setShowCountdown(true);
      setCountdown(3);
      
      // Countdown from 3 to 1
      let count = 3;
      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          
          // Start session
          onStart(); // Call parent to start timer and set isActive
          
          // Start main audio from beginning (only once when first pressing) - if enabled
          if (soundRef.current && omSoundEnabled) {
            omShouldBePlaying.current = true; // Mark that om sound should be playing
            soundRef.current.setPositionAsync(0).catch(err => console.log('Error:', err));
            soundRef.current.setIsLoopingAsync(true).catch(err => console.log('Error:', err));
            soundRef.current.playAsync().catch(err => console.log('Error:', err));
          }
          
          // Start breathing cycle immediately
          startBreathingCycle();
        }
      }, 1000); // 1 second intervals
    }
  };

  const handlePressOut = async () => {
    if (isActive && onStop) {
      onStop(); // Call parent to stop & reset timer and set isActive to false
      // Stop everything
      await stopAnimation();
    }
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
        {/* Theme Toggle - COMMENTED OUT FOR NOW */}
        {/* {onThemeToggle && (
          <GlassView glassEffectStyle="regular" style={styles.glassButton}>
            <TouchableOpacity
              onPress={onThemeToggle}
              activeOpacity={0.7}
              style={styles.buttonTouchable}
            >
              <Ionicons 
                name={currentTheme === 'modern' ? "flower-outline" : "ellipse-outline"} 
                size={24} 
                color="#ffffff"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </GlassView>
        )} */}
        
        {/* Settings Toggle */}
        <GlassView glassEffectStyle="regular" style={styles.glassButton}>
          <TouchableOpacity
            onPress={() => setShowSettings(!showSettings)}
            activeOpacity={0.7}
            style={styles.buttonTouchable}
          >
            <Ionicons 
              name="settings-outline" 
              size={24} 
              color="#ffffff"
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        </GlassView>
        
        {/* Volume Toggle */}
        {onMuteToggle && (
          <GlassView glassEffectStyle="regular" style={styles.glassButton}>
            <TouchableOpacity
              onPress={onMuteToggle}
              activeOpacity={0.7}
              style={styles.buttonTouchable}
            >
              <Ionicons 
                name={isMuted ? "volume-mute-outline" : "volume-high-outline"} 
                size={24} 
                color="#ffffff"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </GlassView>
        )}
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <GlassView glassEffectStyle="regular" style={styles.settingsMenu}>
              <Text style={styles.settingsTitle}>Audio Settings</Text>
              
              {/* Om Sound Toggle */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setOmSoundEnabled(!omSoundEnabled)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Ionicons 
                    name="musical-notes-outline" 
                    size={20} 
                    color="#ffffff"
                    style={{ opacity: 0.8 }}
                  />
                  <Text style={styles.settingLabel}>Om Sound</Text>
                </View>
                <View style={[
                  styles.toggle,
                  omSoundEnabled && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    omSoundEnabled && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>

              {/* Exhale Sound Toggle */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setExhaleSoundEnabled(!exhaleSoundEnabled)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Ionicons 
                    name="arrow-down-circle-outline" 
                    size={20} 
                    color="#ffffff"
                    style={{ opacity: 0.8 }}
                  />
                  <Text style={styles.settingLabel}>Exhale Sound</Text>
                </View>
                <View style={[
                  styles.toggle,
                  exhaleSoundEnabled && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    exhaleSoundEnabled && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>

              {/* Inhale Sound Toggle */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setInhaleSoundEnabled(!inhaleSoundEnabled)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Ionicons 
                    name="arrow-up-circle-outline" 
                    size={20} 
                    color="#ffffff"
                    style={{ opacity: 0.8 }}
                  />
                  <Text style={styles.settingLabel}>Inhale Sound</Text>
                </View>
                <View style={[
                  styles.toggle,
                  inhaleSoundEnabled && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    inhaleSoundEnabled && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </GlassView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>


      {/* Start Button or Countdown or Breathing Circle */}
      <View style={styles.circleWrapper}>
        {!isActive && !showCountdown && fontsLoaded && (
          /* Start Button */
          <TouchableOpacity
            onPressIn={handlePressIn}
            activeOpacity={0.8}
            style={styles.startButtonContainer}
          >
            <Text style={styles.startButtonText}>Hold to Start Session</Text>
          </TouchableOpacity>
        )}

        {showCountdown && fontsLoaded && (
          /* Countdown */
          <View style={styles.countdownContainer}>
            <Text style={[styles.countdownText, { fontFamily: 'Allura_400Regular' }]}>
              exhale in   {countdown}
            </Text>
          </View>
        )}

        {isActive && (
          /* Breathing Circle */
          <TouchableOpacity
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.circleContainer}
          >
            <View style={[styles.circleContainer, { width: circleSize, height: circleSize }]}>
              {/* Static glass ring - visible when active */}
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

              {/* Blue fill arc - animates 0° → 360° */}
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

              {/* Inner black glass circle with blur - creates ring effect */}
              <BlurView
                intensity={100}
                tint="dark"
                style={[
                  styles.innerCircle,
                  {
                    width: circleSize - strokeWidth * 2 - 10,
                    height: circleSize - strokeWidth * 2 - 10,
                    borderRadius: (circleSize - strokeWidth * 2 - 10) / 2,
                    overflow: 'hidden',
                  },
                ]}
              />

              {/* EXHALE text - shows during exhale phase */}
              {isExhaling && (
                <Animated.View
                  style={[
                    styles.inhaleTextContainer,
                    {
                      opacity: exhaleOpacity,
                    },
                  ]}
                >
                  <Text style={styles.inhaleText}>EXHALE</Text>
                </Animated.View>
              )}

              {/* INHALE text - shows during inhale phase */}
              {isInhaling && (
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
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  startButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 36,
    color: '#ffffff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsMenu: {
    width: width * 0.8,
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default BreathingCircle;
