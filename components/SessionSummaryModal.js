import React, { useState, useRef, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Allura_400Regular } from '@expo-google-fonts/allura';
import EmojiPicker from 'rn-emoji-keyboard';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import StatCard from './StatCard';
import EmojiSelector from './EmojiSelector';

const { width } = Dimensions.get('window');

const SessionSummaryModal = ({ 
  visible, 
  sessionTime, 
  cycleCount, 
  onClose 
}) => {
  const [selectedEmojis, setSelectedEmojis] = useState(['', '', '', '']);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmojiSlot, setCurrentEmojiSlot] = useState(0);
  const viewRef = useRef(null);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Allura_400Regular,
  });

  // Entrance animation
  useEffect(() => {
    if (visible) {
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
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleEmojiPress = (index) => {
    setCurrentEmojiSlot(index);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji) => {
    const newEmojis = [...selectedEmojis];
    newEmojis[currentEmojiSlot] = emoji.emoji;
    setSelectedEmojis(newEmojis);
    setShowEmojiPicker(false);
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

  const handleDone = () => {
    // Reset emojis
    setSelectedEmojis(['', '', '', '']);
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontFamily: 'Allura_400Regular' }]}>
              session complete
            </Text>
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

          {/* Emoji Section */}
          <EmojiSelector 
            selectedEmojis={selectedEmojis}
            onEmojiPress={handleEmojiPress}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={16} color="#ffffff" />
              <Text style={styles.buttonText}>share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.doneButton]}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#ffffff" />
              <Text style={styles.buttonText}>done</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>

      {/* Emoji Picker */}
      <EmojiPicker
        onEmojiSelected={handleEmojiSelect}
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        enableSearchBar={true}
        categoryPosition="top"
        theme={{
          backdrop: 'rgba(0, 0, 0, 0.8)',
          knob: '#ffffff',
          container: '#1a1a1a',
          header: '#1a1a1a',
          skinTonesContainer: '#1a1a1a',
          category: {
            icon: '#ffffff',
            iconActive: '#8B5CF6',
            container: '#1a1a1a',
            containerActive: 'rgba(139, 92, 246, 0.2)',
          },
        }}
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
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
    padding: 28,
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'left',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  statsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    gap: 8,
  },
  shareButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 0.3,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  doneButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});

export default SessionSummaryModal;

