import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export const SingleEmoji = /*#__PURE__*/React.memo(p => {
  const handlePress = () => p.onPress(p.item);
  const handleLongPress = e => {
    // @ts-ignore
    e.target.measure((_x, _y, width, height) => {
      p.onLongPress(p.item, p.index, {
        width,
        height
      });
    });
  };
  return /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: handlePress,
    onLongPress: handleLongPress,
    style: styles.container
  }, /*#__PURE__*/React.createElement(View, {
    pointerEvents: 'none',
    style: [styles.emojiWrapper, p.selectedEmojiStyle]
  }, /*#__PURE__*/React.createElement(Text, {
    style: [styles.emoji, {
      fontSize: p.emojiSize
    }]
  }, p.item.emoji)));
}, (prevProps, nextProps) => prevProps.isSelected === nextProps.isSelected);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emojiWrapper: {
    padding: 4
  },
  emoji: {
    color: '#000'
  }
});
//# sourceMappingURL=SingleEmoji.js.map