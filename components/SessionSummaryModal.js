import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Allura_400Regular } from '@expo-google-fonts/allura';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import EmojiSelector from 'react-native-emoji-selector';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import StatCard from './StatCard';
import { saveSession } from '../utils/sessionStorage';

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

// Helper: Get benefits based on session length (only 3)
const getBenefitsEarned = (timeString) => {
  const seconds = parseSessionTime(timeString);
  const minutes = Math.floor(seconds / 60);
  
  // 10+ benefits organized by session length
  const allBenefits = [
    // Short sessions (< 2 min)
    { text: "Moment of mental clarity", minTime: 0, maxTime: 2 },
    { text: "Quick stress relief", minTime: 0, maxTime: 2 },
    { text: "Breath awareness developed", minTime: 0, maxTime: 2 },
    
    // Medium sessions (2-5 min)
    { text: "Reduced anxiety", minTime: 2, maxTime: 5 },
    { text: "Improved focus", minTime: 2, maxTime: 5 },
    { text: "Calmer nervous system", minTime: 2, maxTime: 5 },
    { text: "Better breathing control", minTime: 2, maxTime: 5 },
    
    // Longer sessions (5-10 min)
    { text: "Deep relaxation", minTime: 5, maxTime: 10 },
    { text: "Enhanced mindfulness", minTime: 5, maxTime: 10 },
    { text: "Emotional balance", minTime: 5, maxTime: 10 },
    { text: "Better sleep quality", minTime: 5, maxTime: 10 },
    { text: "Lowered blood pressure", minTime: 5, maxTime: 10 },
    
    // Extended sessions (10+ min)
    { text: "Significant stress reduction", minTime: 10, maxTime: Infinity },
    { text: "Heightened awareness", minTime: 10, maxTime: Infinity },
    { text: "Mental resilience boost", minTime: 10, maxTime: Infinity },
    { text: "Enhanced emotional regulation", minTime: 10, maxTime: Infinity },
    { text: "Meditation depth achieved", minTime: 10, maxTime: Infinity },
    { text: "Neural pathway strengthening", minTime: 10, maxTime: Infinity },
  ];
  
  // Filter benefits based on session length
  const qualifiedBenefits = allBenefits.filter(b => 
    minutes >= b.minTime && minutes < b.maxTime
  );
  
  // If we have 3 or more, return 3 random ones; otherwise return all
  if (qualifiedBenefits.length >= 3) {
    // Shuffle and pick 3
    const shuffled = [...qualifiedBenefits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }
  
  return qualifiedBenefits;
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
  userProfile = { initials: 'ME' }
}) => {
  const [beforeEmojis, setBeforeEmojis] = useState([null, null, null]); // 3 empty slots
  const [afterEmojis, setAfterEmojis] = useState([null, null, null]); // 3 empty slots
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmojiSlot, setCurrentEmojiSlot] = useState(null); // { type: 'before'|'after', index: number }
  const [showLogConfirmation, setShowLogConfirmation] = useState(false);
  const viewRef = useRef(null);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const benefitsOpacity = useRef([]).current;
  
  const [fontsLoaded] = useFonts({
    Allura_400Regular,
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
    // Reset emojis to empty
    setBeforeEmojis([null, null, null]);
    setAfterEmojis([null, null, null]);
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
            onPress={() => setShowLogConfirmation(true)}
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
            {/* Header with Profile Picture - Redesigned */}
            <View style={styles.headerRedesigned}>
              <View style={styles.profilePic}>
                <Text style={styles.profileInitials}>{userProfile.initials}</Text>
              </View>
              <View style={styles.textSection}>
                <Text style={styles.greatWorkText}>
                  Great work, {userProfile.name || 'Friend'}!
                </Text>
                <Text style={styles.practiceMessageLeft}>
                  You practiced mindfulness for
                </Text>
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

            {/* Benefits Section - No title */}
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

            {/* Emoji Section - Left Aligned with Arrow */}
            <View style={styles.emojiSection}>
              {/* Before Emojis */}
              <View style={styles.emojiGroup}>
                {beforeEmojis.map((emoji, index) => (
                  <GlassView key={`before-${index}`} glassEffectStyle="regular" style={styles.emojiGlassContainer}>
                    <TouchableOpacity
                      style={styles.emojiSlot}
                      onPress={() => handleEmojiSlotPress('before', index)}
                      activeOpacity={0.6}
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

              {/* Arrow */}
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.5)" style={{ marginHorizontal: 8 }} />

              {/* After Emojis */}
              <View style={styles.emojiGroup}>
                {afterEmojis.map((emoji, index) => (
                  <GlassView key={`after-${index}`} glassEffectStyle="regular" style={styles.emojiGlassContainer}>
                    <TouchableOpacity
                      style={styles.emojiSlot}
                      onPress={() => handleEmojiSlotPress('after', index)}
                      activeOpacity={0.6}
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

          </BlurView>
        </Animated.View>

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <Modal
            visible={showEmojiPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowEmojiPicker(false)}
          >
            <View style={styles.emojiPickerOverlay}>
              <View style={styles.emojiPickerContainer}>
                <View style={styles.emojiPickerHeader}>
                  <Text style={styles.emojiPickerTitle}>Select Emoji</Text>
                  <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <EmojiSelector
                  onEmojiSelected={handleEmojiSelect}
                  showSearchBar={false}
                  showTabs={true}
                  showHistory={false}
                  columns={8}
                />
              </View>
            </View>
          </Modal>
        )}

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
    backgroundColor: 'transparent', // No fill - blend with blur
    borderRadius: 4,
    padding: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerRedesigned: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
  },
  greatWorkText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  practiceMessageLeft: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    textAlign: 'left',
  },
  timeGradientMask: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  timeGradientTransparent: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
    opacity: 0,
  },
  gradientBackground: {
    paddingVertical: 0,
  },
  timeHighlightInline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    color: '#ffffff',
    marginBottom: 2,
  },
  practiceMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  timeHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
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
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 18,
  },
  emojiSection: {
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  emojiGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  emojiPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    fontSize: 20,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SessionSummaryModal;

