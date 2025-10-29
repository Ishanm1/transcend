import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, TouchableOpacity, Text, Modal, TextInput, Image } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { useFonts, Allura_400Regular } from '@expo-google-fonts/allura';
import * as ImagePicker from 'expo-image-picker';
import SessionCalendar from './SessionCalendar';

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
  const omSoundRef = useRef(null);
  const oceanSoundRef = useRef(null);
  const exhaleSoundRef = useRef(null);
  const inhaleSoundRef = useRef(null);
  const animationRef = useRef(null);
  const pulseRef = useRef(null);
  const hapticTimeoutsRef = useRef([]);
  const bgMusicShouldBePlaying = useRef(false); // Track if background music should be playing
  const currentBackgroundMusic = useRef('ocean'); // Track current background music for callbacks
  const isInitialMount = useRef(true); // Track initial mount to avoid double-playing
  const [isInhaling, setIsInhaling] = React.useState(false);
  const [isExhaling, setIsExhaling] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [username, setUsername] = React.useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = React.useState('ocean'); // 'ocean' or 'none'
  const [omSoundEnabled, setOmSoundEnabled] = useState(false);
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
        
        // Load om sound
        const { sound: omSound } = await Audio.Sound.createAsync(
          require('../assets/omfull.mp3'),
          { 
            shouldPlay: false, 
            isLooping: false, // Set to false initially, will be set to true when selected
            volume: 0,
          }
        );
        
        // Add status update callback to monitor playback - ONLY restart if om is selected
        omSound.setOnPlaybackStatusUpdate((status) => {
          // Only restart if this specific sound should be playing
          if (status.isLoaded && !status.isPlaying && !status.isBuffering && 
              bgMusicShouldBePlaying.current && currentBackgroundMusic.current === 'om') {
            console.log('Om sound stopped unexpectedly, restarting...');
            omSound.playAsync().catch(err => console.log('Error restarting om sound:', err));
          }
        });
        
        omSoundRef.current = omSound;

        // Load ocean waves sound
        const { sound: oceanSound } = await Audio.Sound.createAsync(
          require('../assets/no-copyright-ocean-waves-sound-e.mp3'),
          { 
            shouldPlay: false, 
            isLooping: false, // Set to false initially, will be set to true when selected
            volume: 0,
          }
        );
        
        // Add status update callback for ocean sound - ONLY restart if ocean is selected
        oceanSound.setOnPlaybackStatusUpdate((status) => {
          // Only restart if this specific sound should be playing
          if (status.isLoaded && !status.isPlaying && !status.isBuffering && 
              bgMusicShouldBePlaying.current && currentBackgroundMusic.current === 'ocean') {
            console.log('Ocean sound stopped unexpectedly, restarting...');
            oceanSound.playAsync().catch(err => console.log('Error restarting ocean sound:', err));
          }
        });
        
        oceanSoundRef.current = oceanSound;

        // Load exhale sound effect
        const { sound: exhaleSound } = await Audio.Sound.createAsync(
          require('../assets/exhale.mp3'),
          { 
            shouldPlay: false, 
            isLooping: false,
            volume: 1,
          }
        );
        exhaleSoundRef.current = exhaleSound;

        // Load inhale sound effect
        const { sound: inhaleSound } = await Audio.Sound.createAsync(
          require('../assets/inahlereal.mp3'),
          { 
            shouldPlay: false, 
            isLooping: false,
            volume: 1,
          }
        );
        inhaleSoundRef.current = inhaleSound;
      } catch (error) {
        console.log('Error loading audio:', error);
      }
    }
    
    loadAudio();
    
    return () => {
      if (omSoundRef.current) {
        omSoundRef.current.unloadAsync();
      }
      if (oceanSoundRef.current) {
        oceanSoundRef.current.unloadAsync();
      }
      if (exhaleSoundRef.current) {
        exhaleSoundRef.current.unloadAsync();
      }
      if (inhaleSoundRef.current) {
        inhaleSoundRef.current.unloadAsync();
      }
    };
  }, []);

  // Start background music on mount
  useEffect(() => {
    const startInitialBackgroundMusic = async () => {
      try {
        // Wait a bit for audio to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update ref to match initial state
        currentBackgroundMusic.current = backgroundMusic;
        
        // Only start if not 'none'
        if (backgroundMusic === 'ocean' && oceanSoundRef.current) {
          bgMusicShouldBePlaying.current = true;
          await oceanSoundRef.current.setIsLoopingAsync(true);
          await oceanSoundRef.current.setVolumeAsync(0);
          await oceanSoundRef.current.playAsync();
          await oceanSoundRef.current.setVolumeAsync(isMuted ? 0 : 1, { duration: 1000 });
        } else {
          bgMusicShouldBePlaying.current = false;
        }
        
        // Mark that initial mount is complete
        isInitialMount.current = false;
      } catch (error) {
        console.log('Error starting initial background music:', error);
      }
    };

    startInitialBackgroundMusic();
  }, []); // Only run once on mount

  // Handle isActive state changes
  useEffect(() => {
    if (isActive) {
      // Start breathing cycle when session becomes active
      startBreathingCycle();
    } else {
      // Stop and reset when session ends
      stopAnimation();
      progressAnim.setValue(0);
      glowAnim.setValue(0);
      inhaleOpacity.setValue(0);
      exhaleOpacity.setValue(0);
      setIsInhaling(false);
      setIsExhaling(false);
    }
  }, [isActive]);

  // Handle mute/unmute - only adjust volume for currently playing sounds
  useEffect(() => {
    const updateVolume = async () => {
      try {
        // Only adjust volume for the currently playing background music
        if (backgroundMusic === 'ocean' && oceanSoundRef.current && bgMusicShouldBePlaying.current) {
          const status = await oceanSoundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await oceanSoundRef.current.setVolumeAsync(isMuted ? 0 : 1);
          }
        }
        
        // Adjust breath sounds volume only if they're loaded (they play on demand)
        if (omSoundRef.current && omSoundEnabled) {
          const status = await omSoundRef.current.getStatusAsync();
          if (status.isLoaded) {
            await omSoundRef.current.setVolumeAsync(isMuted ? 0 : 1);
          }
        }
        if (exhaleSoundRef.current && exhaleSoundEnabled) {
          const status = await exhaleSoundRef.current.getStatusAsync();
          if (status.isLoaded) {
            await exhaleSoundRef.current.setVolumeAsync(isMuted ? 0 : 1);
          }
        }
        if (inhaleSoundRef.current && inhaleSoundEnabled) {
          const status = await inhaleSoundRef.current.getStatusAsync();
          if (status.isLoaded) {
            await inhaleSoundRef.current.setVolumeAsync(isMuted ? 0 : 1);
          }
        }
      } catch (error) {
        console.log('Error updating volume:', error);
      }
    };
    
    updateVolume();
  }, [isMuted, backgroundMusic, omSoundEnabled, exhaleSoundEnabled, inhaleSoundEnabled]);

  // Handle background music switching with fade
  useEffect(() => {
    // Update ref so callbacks always have latest value
    currentBackgroundMusic.current = backgroundMusic;
    
    const switchBackgroundMusic = async () => {
      // Skip on initial mount (handled by initial background music useEffect)
      if (isInitialMount.current) {
        return;
      }

      try {
        // Fade out and stop all background music first
        const fadeOutPromises = [];
        
        if (omSoundRef.current) {
          fadeOutPromises.push(
            omSoundRef.current.setVolumeAsync(0, { duration: 300 })
              .then(() => omSoundRef.current.stopAsync())
              .then(() => omSoundRef.current.setPositionAsync(0))
              .catch(err => console.log('Error fading out om sound:', err))
          );
        }
        if (oceanSoundRef.current) {
          fadeOutPromises.push(
            oceanSoundRef.current.setVolumeAsync(0, { duration: 300 })
              .then(() => oceanSoundRef.current.stopAsync())
              .then(() => oceanSoundRef.current.setPositionAsync(0))
              .catch(err => console.log('Error fading out ocean sound:', err))
          );
        }
        
        await Promise.all(fadeOutPromises);
        
        // Small delay for clean transition
        await new Promise(resolve => setTimeout(resolve, 50));

        // Start the selected background music with fade in
        if (backgroundMusic === 'ocean' && oceanSoundRef.current) {
          bgMusicShouldBePlaying.current = true;
          await oceanSoundRef.current.setIsLoopingAsync(true);
          await oceanSoundRef.current.setVolumeAsync(0);
          await oceanSoundRef.current.playAsync();
          await oceanSoundRef.current.setVolumeAsync(isMuted ? 0 : 1, { duration: 500 });
        } else {
          bgMusicShouldBePlaying.current = false;
        }
      } catch (error) {
        console.log('Error switching background music:', error);
      }
    };

    switchBackgroundMusic();
  }, [backgroundMusic]); // Removed isMuted from dependencies to prevent re-triggering on mute toggle

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

        // Play Om sound at the start of each cycle if enabled (plays first to set the tone)
        if (omSoundRef.current && omSoundEnabled) {
          try {
            await omSoundRef.current.setPositionAsync(0);
            await omSoundRef.current.playAsync();
          } catch (error) {
            console.log('Error playing om sound:', error);
          }
        }

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
    
    // Don't stop background music - it continues playing as ambient sound
    // Background music keeps playing between sessions
    
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
          
          // Start session - this will trigger heart rate measurement, then set isActive
          onStart(); // Call parent - will show HR measurement first
          
          // Don't start breathing cycle here - wait for isActive to become true
          // The breathing cycle will start when isActive changes to true
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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Top Left Controls - Vertical Stack */}
      <View style={styles.topLeftControls}>
        {/* Settings Toggle - Top */}
        <GlassView glassEffectStyle="regular" style={styles.glassButton}>
          <TouchableOpacity
            onPress={() => setShowProfile(!showProfile)}
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
        
        {/* Volume Toggle - Middle */}
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
        
        {/* Calendar - Bottom */}
        <GlassView glassEffectStyle="regular" style={styles.glassButton}>
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.7}
            style={styles.buttonTouchable}
          >
            <Ionicons 
              name="calendar-outline" 
              size={24} 
              color="#ffffff"
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        </GlassView>
      </View>

      {/* Session Calendar Modal */}
      <SessionCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfile(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowProfile(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={100} tint="dark" style={styles.settingsMenu}>
              {/* Profile Section */}
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <Ionicons name="person" size={40} color="rgba(255,255,255,0.6)" />
                  )}
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={14} color="rgba(255,255,255,0.9)" />
                  </View>
                </TouchableOpacity>
                <TextInput
                  style={styles.profileNameInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Your Name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  maxLength={20}
                />
              </View>

              {/* Divider */}
              <View style={styles.settingsDivider} />
              
              {/* Background Music Section */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Background Music</Text>
                
                {/* Ocean Waves */}
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setBackgroundMusic('ocean')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingLabel}>Ocean Waves</Text>
                  <View style={[
                    styles.radio,
                    backgroundMusic === 'ocean' && styles.radioActive
                  ]}>
                    {backgroundMusic === 'ocean' && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.optionDivider} />

                {/* None */}
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setBackgroundMusic('none')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingLabel}>None</Text>
                  <View style={[
                    styles.radio,
                    backgroundMusic === 'none' && styles.radioActive
                  ]}>
                    {backgroundMusic === 'none' && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.settingsDivider} />

              {/* Sound Effects Section */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Sound Effects</Text>
                
                {/* Om Sound */}
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setOmSoundEnabled(!omSoundEnabled)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingLabel}>Om Sound</Text>
                  <View style={[
                    styles.radio,
                    omSoundEnabled && styles.radioActive
                  ]}>
                    {omSoundEnabled && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.optionDivider} />

                {/* Exhale Sound */}
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setExhaleSoundEnabled(!exhaleSoundEnabled)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingLabel}>Exhale Sound</Text>
                  <View style={[
                    styles.radio,
                    exhaleSoundEnabled && styles.radioActive
                  ]}>
                    {exhaleSoundEnabled && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.optionDivider} />

                {/* Inhale Sound */}
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => setInhaleSoundEnabled(!inhaleSoundEnabled)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingLabel}>Inhale Sound</Text>
                  <View style={[
                    styles.radio,
                    inhaleSoundEnabled && styles.radioActive
                  ]}>
                    {inhaleSoundEnabled && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Close Button */}
              <GlassView glassEffectStyle="regular" style={styles.closeButtonGlass}>
                <TouchableOpacity
                  style={styles.closeButtonInner}
                  onPress={() => setShowProfile(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </GlassView>
            </BlurView>
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
  topLeftControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'column',
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
    width: width * 0.85,
    maxWidth: 360,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNameInput: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 150,
  },
  settingSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  radioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.85,
  },
  optionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#ffffff',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  closeButtonGlass: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  profileSectionCentered: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  profilePicContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
});

export default BreathingCircle;
