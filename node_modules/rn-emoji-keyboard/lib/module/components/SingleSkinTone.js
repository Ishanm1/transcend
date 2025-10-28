import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export class SingleSkinTone extends React.Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    const {
      item,
      emojiSize,
      onPress
    } = this.props;
    return /*#__PURE__*/React.createElement(TouchableOpacity, {
      onPress: onPress,
      style: styles.container
    }, /*#__PURE__*/React.createElement(View, {
      style: styles.iconContainer
    }, /*#__PURE__*/React.createElement(Text, {
      style: [styles.emoji, {
        fontSize: emojiSize
      }]
    }, item.emoji)));
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    justifyContent: 'center'
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emoji: {
    color: '#000'
  }
});
//# sourceMappingURL=SingleSkinTone.js.map