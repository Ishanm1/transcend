import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  Alert,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Sacramento_400Regular } from '@expo-google-fonts/sacramento';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import StatCard from './StatCard';
import { saveSession } from '../utils/sessionStorage';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const { width } = Dimensions.get('window');

// Helper: Parse time string "MM:SS" to seconds
const parseSessionTime = (timeString) => {
  const [mins, secs] = timeString.split(':').map(Number);
  return mins * 60 + secs;
};

// Helper: Get encouraging message based on session
const getEncouragementMessage = (timeString, cycleCount) => {
  const seconds = parseSessionTime(timeString);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 2) {
    return "Every breath is a step toward peace";
  } else if (minutes < 5) {
    return "You're building a beautiful practice";
  } else if (minutes < 10) {
    return "Your mind and body thank you";
  } else if (minutes < 15) {
    return "Incredible dedication to your wellbeing";
  } else {
    return "You're a mindfulness master today";
  }
};

// Helper: Get benefits based on session length (deterministic time-based tiers)
const getBenefitsEarned = (timeString) => {
  const seconds = parseSessionTime(timeString);
  const minutes = Math.floor(seconds / 60);
  
  // Tier 1: < 2 minutes (Short Sessions)
  if (minutes < 2) {
    return [
      { text: "Moment of mental clarity" },
      { text: "Quick stress relief" },
      { text: "Breath awareness developed" }
    ];
  }
  
  // Tier 2: 2-4 minutes (Short-Medium Sessions)
  if (minutes < 5) {
    return [
      { text: "Reduced anxiety" },
      { text: "Improved focus" },
      { text: "Calmer nervous system" }
    ];
  }
  
  // Tier 3: 5-9 minutes (Medium Sessions)
  if (minutes < 10) {
    return [
      { text: "Deep relaxation" },
      { text: "Enhanced mindfulness" },
      { text: "Emotional balance" }
    ];
  }
  
  // Tier 4: 10-14 minutes (Long Sessions)
  if (minutes < 15) {
    return [
      { text: "Significant stress reduction" },
      { text: "Heightened awareness" },
      { text: "Mental resilience boost" }
    ];
  }
  
  // Tier 5: 15+ minutes (Extended Sessions)
  return [
    { text: "Enhanced emotional regulation" },
    { text: "Meditation depth achieved" },
    { text: "Neural pathway strengthening" }
  ];
};

// Helper: Format time for display
const formatTimeDisplay = (timeString) => {
  const [mins, secs] = timeString.split(':').map(Number);
  
  if (mins === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  } else if (secs === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  } else {
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  }
};

// Helper: Get title based on session
const getSessionTitle = (timeString) => {
  const seconds = parseSessionTime(timeString);
  const minutes = Math.floor(seconds / 60);
  
  const titles = [
    "Session Complete",
    "Practice Finished",
    "Well Done",
    "Great Focus",
    "Mindful Moment",
  ];
  
  // Cycle through titles based on session length
  return titles[minutes % titles.length];
};

const SessionSummaryModal = ({ 
  visible, 
  sessionTime, 
  cycleCount, 
  onClose,
  userProfile = { initials: 'ME' },
  beforeEmojis = [null, null, null, null, null],
  afterEmojis = [null, null, null, null, null],
  onEmojiSlotPress = () => {},
}) => {
  const [showLogConfirmation, setShowLogConfirmation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const viewRef = useRef(null);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const benefitsOpacity = useRef([]).current;
  
  const [fontsLoaded] = useFonts({
    Sacramento_400Regular,
  });
  
  // Get dynamic content - useMemo to keep benefits static
  const sessionTitle = useMemo(() => getSessionTitle(sessionTime), [sessionTime]);
  const encouragementMessage = useMemo(() => getEncouragementMessage(sessionTime, cycleCount), [sessionTime, cycleCount]);
  const benefits = useMemo(() => getBenefitsEarned(sessionTime), [sessionTime]);
  const formattedTime = useMemo(() => formatTimeDisplay(sessionTime), [sessionTime]);
  
  // Initialize benefit animations - only once when modal opens
  useEffect(() => {
    if (visible) {
      benefits.forEach((_, index) => {
        if (!benefitsOpacity[index]) {
          benefitsOpacity[index] = new Animated.Value(0);
        }
      });
    }
  }, [visible]); // Only depend on visible, not benefits

  // Save session when modal opens
  useEffect(() => {
    if (visible && sessionTime && cycleCount) {
      saveSession({
        time: sessionTime,
        cycles: cycleCount,
      });
    }
  }, [visible]);

  // Entrance animation
  useEffect(() => {
    if (visible) {
      // Main modal animation
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Staggered benefits animation
      benefits.forEach((_, index) => {
        if (benefitsOpacity[index]) {
          Animated.timing(benefitsOpacity[index], {
            toValue: 1,
            duration: 400,
            delay: 600 + (index * 150), // Start after modal, stagger by 150ms
            useNativeDriver: true,
          }).start();
        }
      });
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.9);
      benefits.forEach((_, index) => {
        if (benefitsOpacity[index]) {
          benefitsOpacity[index].setValue(0);
        }
      });
    }
  }, [visible]); // Only depend on visible to prevent re-animation

  const handleShare = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Share failed', 'Could not share your session summary');
    }
  };

  const handleLogSession = async () => {
    try {
      // Capture screenshot
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      // Save session with screenshot
      const success = await saveSession({
        time: sessionTime,
        cycles: cycleCount,
        screenshot: uri,
      });

      setShowLogConfirmation(false);
      
      if (success) {
        Alert.alert('Success', 'Session logged to calendar with screenshot!');
      } else {
        Alert.alert('Error', 'Failed to log session');
      }
    } catch (error) {
      console.log('Error logging session:', error);
      Alert.alert('Error', 'Could not capture and log session');
      setShowLogConfirmation(false);
    }
  };

  const handleDone = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!fontsLoaded) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleDone}
    >
      <BlurView intensity={90} tint="dark" style={styles.overlay}>
        {/* Action Icons - Top Left, outside modal */}
        <View style={styles.topLeftActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              if (isAuthenticated) {
                setShowLogConfirmation(true);
              } else {
                setShowAuthModal(true);
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        <Animated.View 
          ref={viewRef}
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <BlurView intensity={100} tint="dark" style={styles.glassContainer}>
            {/* Header with Profile Picture */}
            <View style={styles.headerRedesigned}>
              <View style={styles.profilePic}>
                {userProfile.image ? (
                  <Image source={{ uri: userProfile.image }} style={styles.profileImage} />
                ) : (
                  <Text style={styles.profileInitials}>{userProfile.initials}</Text>
                )}
              </View>
              <View style={styles.textSection}>
                <Text style={styles.greatWorkText}>
                  {isAuthenticated && userProfile.name 
                    ? `Great work, ${userProfile.name}!` 
                    : 'Great work!'}
                </Text>
                <MaskedView
                  maskElement={
                    <Text style={styles.practiceMessageMask}>You practiced mindfulness for</Text>
                  }
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.75)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    <Text style={styles.practiceMessageTransparent}>You practiced mindfulness for</Text>
                  </LinearGradient>
                </MaskedView>
                <MaskedView
                  maskElement={
                    <Text style={styles.timeGradientMask}>{formattedTime}</Text>
                  }
                >
                  <LinearGradient
                    colors={['#4ADEDB', '#6DD5FA', '#2193B0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    <Text style={styles.timeGradientTransparent}>{formattedTime}</Text>
                  </LinearGradient>
                </MaskedView>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <StatCard 
                value={sessionTime} 
                label="time" 
              />
              <StatCard 
                value={cycleCount.toString().padStart(4, '0')} 
                label="cycles" 
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <View style={styles.benefitsList}>
                {benefits.map((benefit, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.benefitItem,
                      {
                        opacity: benefitsOpacity[index] || 0,
                        transform: [{
                          translateY: benefitsOpacity[index]?.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }) || 0
                        }]
                      }
                    ]}
                  >
                    <Text style={styles.benefitCheckmark}>✓</Text>
                    <Text style={styles.benefitText}>{benefit.text}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Emoji Section - Two Rows */}
            <View style={styles.emojiSection}>
              {/* Before Emojis Row */}
              <View style={styles.emojiRow}>
                <MaskedView
                  maskElement={
                    <Text style={styles.emojiLabelMask}>Before my session</Text>
                  }
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.75)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    <Text style={styles.emojiLabelTransparent}>Before my session</Text>
                  </LinearGradient>
                </MaskedView>
                <View style={styles.emojiGroup}>
                  {beforeEmojis.map((emoji, index) => (
                    <GlassView key={`before-${index}`} glassEffectStyle="regular" style={styles.emojiGlassContainer}>
                      <TouchableOpacity
                        style={styles.emojiSlot}
                        onPress={() => {
                          if (onEmojiSlotPress) {
                            onEmojiSlotPress('before', index);
                          }
                        }}
                        activeOpacity={0.6}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {emoji ? (
                          <Text style={styles.emojiText}>{emoji}</Text>
                        ) : (
                          <Ionicons name="add" size={20} color="rgba(255,255,255,0.3)" />
                        )}
                      </TouchableOpacity>
                    </GlassView>
                  ))}
                </View>
              </View>

              {/* After Emojis Row */}
              <View style={styles.emojiRow}>
                <MaskedView
                  maskElement={
                    <Text style={styles.emojiLabelMask}>After my session</Text>
                  }
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.75)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    <Text style={styles.emojiLabelTransparent}>After my session</Text>
                  </LinearGradient>
                </MaskedView>
                <View style={styles.emojiGroup}>
                  {afterEmojis.map((emoji, index) => (
                    <GlassView key={`after-${index}`} glassEffectStyle="regular" style={styles.emojiGlassContainer}>
                      <TouchableOpacity
                        style={styles.emojiSlot}
                        onPress={() => {
                          if (onEmojiSlotPress) {
                            onEmojiSlotPress('after', index);
                          }
                        }}
                        activeOpacity={0.6}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {emoji ? (
                          <Text style={styles.emojiText}>{emoji}</Text>
                        ) : (
                          <Ionicons name="add" size={20} color="rgba(255,255,255,0.3)" />
                        )}
                      </TouchableOpacity>
                    </GlassView>
                  ))}
                </View>
              </View>
            </View>

          </BlurView>
        </Animated.View>

        {/* Log Session Confirmation Modal */}
        {showLogConfirmation && (
          <View style={styles.confirmationOverlay}>
            <BlurView intensity={80} tint="dark" style={styles.confirmationBlur}>
              <View style={styles.confirmationContent}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#ffffff" style={{ opacity: 0.9 }} />
                <Text style={styles.confirmationText}>Log Session?</Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleLogSession}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowLogConfirmation(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </BlurView>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          setShowLogConfirmation(true);
        }}
        title="Sign In to Save Sessions"
        message="Create an account to save your sessions and track your progress over time."
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width * 0.94,
    maxWidth: 480,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  glassContainer: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    padding: 24,
    overflow: 'hidden',
  },
  headerRedesigned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  profilePic: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  profileInitials: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 18,
    fontWeight: '400',
    color: '#ffffff',
    letterSpacing: 1,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  greatWorkText: {
    fontFamily: 'Sacramento_400Regular',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 2,
  },
  practiceMessageMask: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  practiceMessageTransparent: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
    opacity: 0,
  },
  timeGradientMask: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  timeGradientTransparent: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
    opacity: 0,
  },
  gradientBackground: {
    paddingVertical: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  statsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  benefitsSection: {
    paddingVertical: 0,
  },
  benefitsList: {
    gap: 5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
  },
  benefitCheckmark: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  benefitText: {
    fontFamily: 'Sacramento_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 18,
  },
  emojiSection: {
    paddingVertical: 0,
    flexDirection: 'column',
    gap: 16,
  },
  emojiRow: {
    flexDirection: 'column',
    gap: 8,
  },
  emojiLabelMask: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  emojiLabelTransparent: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0,
  },
  emojiGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  emojiGlassContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emojiSlot: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-only',
  },
  emojiText: {
    fontSize: 24,
  },
  topLeftActions: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    gap: 20,
    zIndex: 100,
  },
  iconButton: {
    padding: 8,
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmationContent: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minWidth: 260,
  },
  confirmationText: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmButtonText: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SessionSummaryModal;

