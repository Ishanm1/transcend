import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const EmojiSelector = ({ selectedEmojis, onEmojiPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>today i feel</Text>
      <View style={styles.emojiRow}>
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.emojiSlot}
            onPress={() => onEmojiPress(index)}
            activeOpacity={0.7}
          >
            {selectedEmojis[index] ? (
              <Text style={styles.emoji}>{selectedEmojis[index]}</Text>
            ) : (
              <View style={styles.emptySlot}>
                <Text style={styles.plusSign}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  emojiSlot: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSign: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
});

export default EmojiSelector;

