import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, TouchableOpacity, Text, Modal, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useFonts, Sacramento_400Regular } from '@expo-google-fonts/sacramento';
import * as ImagePicker from 'expo-image-picker';
import SessionCalendar from './SessionCalendar';
import ENVIRONMENTS from '../utils/environments';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const { width } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BreathingCircle = ({ 
  duration = 5, 
  isActive = false, 
  showCountdown = false,
  countdown = 3,
  onCycleComplete,
  onThemeToggle, 
  currentTheme = 'modern',
  isMuted = false,
  onMuteToggle,
  isHapticsEnabled = true,
  environment = 'ocean',
  onEnvironmentChange,
  onProfileUpdate
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const inhaleOpacity = useRef(new Animated.Value(0)).current;
  const exhaleOpacity = useRef(new Animated.Value(0)).current;
  const environmentSoundsRef = useRef({}); // Store all environment sounds
  const omSoundRef = useRef(null);
  const exhaleSoundRef = useRef(null);
  const inhaleSoundRef = useRef(null);
  const animationRef = useRef(null);
  const pulseRef = useRef(null);
  const hapticTimeoutsRef = useRef([]);
  const bgMusicShouldBePlaying = useRef(false); // Track if background music should be playing
  const currentEnvironment = useRef('ocean'); // Track current environment for callbacks
  const isInitialMount = useRef(true); // Track initial mount to avoid double-playing
  const [isInhaling, setIsInhaling] = React.useState(false);
  const [isExhaling, setIsExhaling] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [username, setUsername] = React.useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [omSoundEnabled, setOmSoundEnabled] = useState(false);
  const [exhaleSoundEnabled, setExhaleSoundEnabled] = React.useState(true);
  const [inhaleSoundEnabled, setInhaleSoundEnabled] = React.useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState(null); // 'name' or 'image'
  const [showLoginInModal, setShowLoginInModal] = useState(false); // Toggle login view in settings modal
  
  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { isAuthenticated, signOut, user, signIn, signUp: signUpUser } = useAuth();
  
  // Load Sacramento font
  const [fontsLoaded] = useFonts({
    Sacramento_400Regular,
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
            isLooping: false,
            volume: 0,
          }
        );
        omSoundRef.current = omSound;

        // Dynamically load all environment sounds
        for (const [key, env] of Object.entries(ENVIRONMENTS)) {
          if (env.audio) {
            const { sound } = await Audio.Sound.createAsync(
              env.audio,
              { 
                shouldPlay: false, 
                isLooping: false,
                volume: 0,
              }
            );
            
            // Add status update callback to monitor playback
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && !status.isPlaying && !status.isBuffering && 
                  bgMusicShouldBePlaying.current && currentEnvironment.current === key) {
                console.log(`${env.name} sound stopped unexpectedly, restarting...`);
                sound.playAsync().catch(err => console.log(`Error restarting ${env.name} sound:`, err));
              }
            });
            
            environmentSoundsRef.current[key] = sound;
          }
        }

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
      // Unload all environment sounds
      Object.values(environmentSoundsRef.current).forEach(sound => {
        if (sound) {
          sound.unloadAsync();
        }
      });
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
        currentEnvironment.current = environment;
        
        // Only start if not 'none' and audio exists
        const envSound = environmentSoundsRef.current[environment];
        if (environment !== 'none' && envSound) {
          bgMusicShouldBePlaying.current = true;
          await envSound.setIsLoopingAsync(true);
          await envSound.setVolumeAsync(0);
          await envSound.playAsync();
          await envSound.setVolumeAsync(isMuted ? 0 : 1, { duration: 1000 });
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
        // Only adjust volume for the currently playing environment music
        const envSound = environmentSoundsRef.current[environment];
        if (environment !== 'none' && envSound && bgMusicShouldBePlaying.current) {
          const status = await envSound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await envSound.setVolumeAsync(isMuted ? 0 : 1);
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
  }, [isMuted, environment, omSoundEnabled, exhaleSoundEnabled, inhaleSoundEnabled]);

  // Handle environment switching with fade
  useEffect(() => {
    // Update ref so callbacks always have latest value
    currentEnvironment.current = environment;
    
    const switchEnvironment = async () => {
      // Skip on initial mount (handled by initial background music useEffect)
      if (isInitialMount.current) {
        return;
      }

      try {
        // Fade out and stop all environment sounds
        const fadeOutPromises = [];
        
        Object.values(environmentSoundsRef.current).forEach(sound => {
          if (sound) {
            fadeOutPromises.push(
              sound.setVolumeAsync(0, { duration: 300 })
                .then(() => sound.stopAsync())
                .then(() => sound.setPositionAsync(0))
                .catch(err => console.log('Error fading out environment sound:', err))
            );
          }
        });
        
        await Promise.all(fadeOutPromises);
        
        // Small delay for clean transition
        await new Promise(resolve => setTimeout(resolve, 50));

        // Start the selected environment music with fade in
        const envSound = environmentSoundsRef.current[environment];
        if (environment !== 'none' && envSound) {
          bgMusicShouldBePlaying.current = true;
          await envSound.setIsLoopingAsync(true);
          await envSound.setVolumeAsync(0);
          await envSound.playAsync();
          await envSound.setVolumeAsync(isMuted ? 0 : 1, { duration: 500 });
        } else {
          bgMusicShouldBePlaying.current = false;
        }
      } catch (error) {
        console.log('Error switching environment:', error);
      }
    };

    switchEnvironment();
  }, [environment]); // Removed isMuted from dependencies to prevent re-triggering on mute toggle

  // Load user's name from auth when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || '';
      if (userName && !username) {
        setUsername(userName);
      }
    }
  }, [isAuthenticated, user]);

  // Notify parent of profile updates
  useEffect(() => {
    if (onProfileUpdate) {
      onProfileUpdate({ name: username, image: profileImage });
    }
  }, [username, profileImage]);

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
    if (!isAuthenticated) {
      setAuthPromptAction('image');
      setShowAuthModal(true);
      return;
    }

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

  const handleNameFocus = () => {
    if (!isAuthenticated) {
      setAuthPromptAction('name');
      setShowAuthModal(true);
    }
  };

  // Auth form validation
  const validateAuthForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your name');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  // Auth form submit
  const handleAuthSubmit = async () => {
    if (!validateAuthForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUpUser(email, password, name);
        if (signUpError) {
          setError(signUpError.message || 'Sign up failed');
          setIsLoading(false);
          return;
        }
        Alert.alert(
          'Account Created',
          'Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => {
            setShowLoginInModal(false);
            resetAuthForm();
          }}]
        );
      } else {
        const { data, error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message || 'Sign in failed');
          setIsLoading(false);
          return;
        }
        setShowLoginInModal(false);
        resetAuthForm();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAuthForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError(null);
    setIsSignUp(false);
    setShowPassword(false);
  };

  const handleLoginButtonPress = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      setShowLoginInModal(true);
      resetAuthForm();
    }
  };

  // Conditional glass style based on environment
  const glassButtonStyle = [
    styles.glassButton,
    environment === 'forest' && styles.glassButtonForest
  ];

  // Button wrapper component based on environment
  const ButtonWrapper = environment === 'forest' ? View : GlassView;
  const buttonWrapperProps = environment === 'forest' 
    ? { style: glassButtonStyle }
    : { glassEffectStyle: "regular", style: glassButtonStyle };

  return (
    <View style={styles.mainContainer}>
      {/* Top Left Controls - Vertical Stack */}
      <View style={styles.topLeftControls}>
        {/* Settings Toggle - Top */}
        <ButtonWrapper {...buttonWrapperProps}>
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
        </ButtonWrapper>
        
        {/* Volume Toggle - Middle */}
        {onMuteToggle && (
          <ButtonWrapper {...buttonWrapperProps}>
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
          </ButtonWrapper>
        )}
      </View>

      {/* Session Calendar Modal */}
      <SessionCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthPromptAction(null);
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          setAuthPromptAction(null);
          // If they were trying to pick an image, open it after auth
          if (authPromptAction === 'image') {
            setTimeout(() => pickImage(), 300);
          }
        }}
        title="Sign In to Customize Profile"
        message={
          authPromptAction === 'image'
            ? "Sign in to add a profile picture and personalize your meditation experience."
            : "Sign in to add your name and personalize your meditation experience."
        }
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
              {/* Header with Login Button */}
              <View style={styles.modalHeader}>
                {!showLoginInModal && (
                  <TouchableOpacity
                    onPress={handleLoginButtonPress}
                    style={styles.loginButtonHeader}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.loginButtonText,
                      isAuthenticated && fontsLoaded && styles.loginButtonGreeting
                    ]}>
                      {isAuthenticated ? 'Welcome!' : 'Login'}
                    </Text>
                  </TouchableOpacity>
                )}
                {showLoginInModal && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowLoginInModal(false);
                      resetAuthForm();
                    }}
                    style={styles.backButtonHeader}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView 
                style={styles.settingsScrollView}
                contentContainerStyle={styles.settingsScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                keyboardShouldPersistTaps="handled"
              >
                  {showLoginInModal ? (
                    /* Login Form View */
                    <>
                      {/* Error Message */}
                      {error && (
                        <View style={styles.authErrorContainer}>
                          <Ionicons name="alert-circle" size={18} color="#ff6b6b" />
                          <Text style={styles.authErrorText}>{error}</Text>
                        </View>
                      )}

                      {/* Name Input (Sign Up Only) */}
                      {isSignUp && (
                        <>
                          <Text style={styles.authLabel}>Name</Text>
                          <GlassView glassEffectStyle="regular" style={styles.authInputContainer}>
                            <TextInput
                              style={styles.authInput}
                              value={name}
                              onChangeText={setName}
                              placeholder="Enter your name"
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              autoCapitalize="words"
                              editable={!isLoading}
                            />
                          </GlassView>
                        </>
                      )}

                      {/* Email Input */}
                      <Text style={styles.authLabel}>Email</Text>
                      <GlassView glassEffectStyle="regular" style={styles.authInputContainer}>
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.authInputIcon}
                        />
                        <TextInput
                          style={styles.authInput}
                          value={email}
                          onChangeText={setEmail}
                          placeholder="Enter your email"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!isLoading}
                        />
                      </GlassView>

                      {/* Password Input */}
                      <Text style={styles.authLabel}>Password</Text>
                      <GlassView glassEffectStyle="regular" style={styles.authInputContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.authInputIcon}
                        />
                        <TextInput
                          style={[styles.authInput, styles.authPasswordInput]}
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Enter your password"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          editable={!isLoading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.authEyeButton}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="rgba(255,255,255,0.6)"
                          />
                        </TouchableOpacity>
                      </GlassView>

                      {/* Confirm Password (Sign Up Only) */}
                      {isSignUp && (
                        <>
                          <Text style={styles.authLabel}>Confirm Password</Text>
                          <GlassView glassEffectStyle="regular" style={styles.authInputContainer}>
                            <Ionicons
                              name="lock-closed-outline"
                              size={20}
                              color="rgba(255,255,255,0.6)"
                              style={styles.authInputIcon}
                            />
                            <TextInput
                              style={[styles.authInput, styles.authPasswordInput]}
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                              placeholder="Confirm your password"
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              secureTextEntry={!showPassword}
                              autoCapitalize="none"
                              editable={!isLoading}
                            />
                          </GlassView>
                        </>
                      )}

                      {/* Submit Button */}
                      <TouchableOpacity
                        onPress={handleAuthSubmit}
                        disabled={isLoading}
                        activeOpacity={0.8}
                        style={styles.authSubmitButton}
                      >
                        <LinearGradient
                          colors={['#4ADEDB', '#6DD5FA']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.authSubmitGradient}
                        >
                          <Text style={styles.authSubmitButtonText}>
                            {isLoading
                              ? 'Please wait...'
                              : isSignUp
                              ? 'Create Account'
                              : 'Sign In'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      {/* Toggle Sign Up/Sign In */}
                      <View style={styles.authToggleContainer}>
                        <Text style={styles.authToggleText}>
                          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                          }}
                          disabled={isLoading}
                        >
                          <Text style={styles.authToggleLink}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    /* Settings View */
                    <>
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
                  onChangeText={(text) => {
                    if (isAuthenticated) {
                      setUsername(text);
                    } else {
                      handleNameFocus();
                    }
                  }}
                  onFocus={handleNameFocus}
                  placeholder={isAuthenticated ? "Your Name" : "Sign in to add name"}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  maxLength={20}
                  editable={isAuthenticated}
                />
              </View>

              {/* Divider */}
              <View style={styles.settingsDivider} />

              {/* Calendar Button */}
              <TouchableOpacity
                style={styles.calendarMenuItem}
                onPress={() => {
                  setShowProfile(false);
                  setShowCalendar(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Session History</Text>
                <Ionicons name="calendar-outline" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.settingsDivider} />

              {/* Environment Section */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Environment</Text>
                
                {Object.entries(ENVIRONMENTS).map(([key, env], index, array) => (
                  <React.Fragment key={key}>
                    <TouchableOpacity
                      style={styles.radioItem}
                      onPress={() => onEnvironmentChange && onEnvironmentChange(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.settingLabel,
                        (env.name === 'Ocean Waves' || env.name === 'Forest Birdsong' || env.name === 'None') && fontsLoaded && styles.settingLabelCursive
                      ]}>{env.name}</Text>
                      <View style={[
                        styles.radio,
                        environment === key && styles.radioActive
                      ]}>
                        {environment === key && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                    </TouchableOpacity>
                    {index < array.length - 1 && <View style={styles.optionDivider} />}
                  </React.Fragment>
                ))}
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
                  <Text style={[
                    styles.settingLabel,
                    fontsLoaded && styles.settingLabelCursive
                  ]}>Om Sound</Text>
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
                  <Text style={[
                    styles.settingLabel,
                    fontsLoaded && styles.settingLabelCursive
                  ]}>Exhale Sound</Text>
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
                  <Text style={[
                    styles.settingLabel,
                    fontsLoaded && styles.settingLabelCursive
                  ]}>Inhale Sound</Text>
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
                    </>
                  )}
                </ScrollView>

              {/* Close Button */}
              {!showLoginInModal && (
                <GlassView glassEffectStyle="regular" style={styles.closeButtonGlass}>
                  <TouchableOpacity
                    style={styles.closeButtonInner}
                    onPress={() => {
                      setShowProfile(false);
                      resetAuthForm();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </GlassView>
              )}
            </BlurView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>


      {/* Start Button or Breathing Circle */}
      <View style={styles.circleWrapper}>
        {!isActive && fontsLoaded && (
          /* Start Button */
          <View style={styles.startButtonContainer}>
            {showCountdown ? (
              <MaskedView
                maskElement={
                  <Text style={styles.startButtonText}>exhale in  {countdown}</Text>
                }
              >
                <LinearGradient
                  colors={['#ffffff', 'rgba(255, 255, 255, 0.6)', '#ffffff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.5, 1]}
                  style={styles.gradientBackground}
                >
                  <Text style={styles.startButtonTextInvisible}>exhale in  {countdown}</Text>
                </LinearGradient>
              </MaskedView>
            ) : (
              <MaskedView
                maskElement={
                  <Text style={styles.startButtonText}>Hold to Start Session</Text>
                }
              >
                <LinearGradient
                  colors={['#ffffff', 'rgba(255, 255, 255, 0.6)', '#ffffff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.5, 1]}
                  style={styles.gradientBackground}
                >
                  <Text style={styles.startButtonTextInvisible}>Hold to Start Session</Text>
                </LinearGradient>
              </MaskedView>
            )}
          </View>
        )}

        {isActive && (
          /* Breathing Circle */
          <View style={styles.circleContainer}>
            <View style={[styles.circleContainer, { width: circleSize, height: circleSize }]}>
              {/* Static glass ring - visible when active */}
              <View
                style={[
                  styles.staticGlassRing,
                  environment === 'forest' && styles.staticGlassRingForest,
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
                  environment === 'forest' && styles.glowCircleForest,
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
                  <Text style={styles.inhaleText}>exhale</Text>
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
                  <Text style={styles.inhaleText}>inhale</Text>
                </Animated.View>
              )}

            </View>
          </View>
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
    // No backgroundColor - GlassView provides the frosted glass effect
  },
  glassButtonForest: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Black opacity for forest theme
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Default white opacity
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  staticGlassRingForest: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Black opacity for forest theme
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Default white opacity
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  glowCircleForest: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Black opacity for forest theme
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
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 3,
    textAlign: 'center',
  },
  startButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 20, // 24 * 0.85 = 20.4, rounded to 20
    fontWeight: '700', // Make it bold
    letterSpacing: 1,
    color: '#ffffff',
  },
  startButtonTextInvisible: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0,
  },
  gradientBackground: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safetyModalContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  loginButtonHeader: {
    paddingVertical: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
  loginButtonGreeting: {
    fontFamily: 'Sacramento_400Regular',
    fontSize: 20,
    fontWeight: '400',
    textDecorationLine: 'none',
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  authErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  authErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#ff6b6b',
    lineHeight: 18,
  },
  authLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  authInputIcon: {
    marginRight: 12,
  },
  authInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 14,
  },
  authPasswordInput: {
    paddingRight: 40,
  },
  authEyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  authSubmitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  authSubmitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSubmitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  authToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  authToggleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  authToggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADEDB',
  },
  settingsMenu: {
    width: width * 0.85,
    maxWidth: 360,
    maxHeight: 600, // Fixed height to enable scrolling
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  settingsScrollView: {
    maxHeight: 500,
  },
  settingsScrollContent: {
    paddingBottom: 20,
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
    fontWeight: '400',
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
  settingLabelCursive: {
    fontFamily: 'Sacramento_400Regular',
    fontSize: 18,
    fontWeight: '400',
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
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  calendarMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
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
