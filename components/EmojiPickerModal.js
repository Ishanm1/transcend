import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import EmojiSelector from 'react-native-emoji-selector';

const { width, height } = Dimensions.get('window');

const EmojiPickerModal = ({ visible, onEmojiSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={95} tint="dark" style={styles.emojiPickerOverlay}>
        <View style={styles.emojiPickerContainer}>
          <View style={styles.emojiPickerHeader}>
            <Text style={styles.emojiPickerTitle}>Select Emoji</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
          <View style={styles.emojiSelectorWrapper}>
            <EmojiSelector
              onEmojiSelected={onEmojiSelect}
              showSearchBar={false}
              showTabs={true}
              showHistory={false}
              columns={8}
            />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  emojiPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emojiPickerContainer: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: width * 0.9,
    maxWidth: 400,
    height: height * 0.7,
    maxHeight: 600,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  emojiPickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  emojiSelectorWrapper: {
    flex: 1,
  },
});

export default EmojiPickerModal;

