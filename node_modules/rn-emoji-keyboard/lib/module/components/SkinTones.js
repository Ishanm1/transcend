function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { KeyboardContext } from '../contexts/KeyboardContext';
import { useKeyboardStore } from '../store/useKeyboardStore';
import { parseEmoji } from '../utils/parseEmoji';
import { SingleSkinTone } from './SingleSkinTone';
import { Funnel } from '../assets/funnel';
export const TONES_CONTAINER_WIDTH = 226;
const TONES_CONTAINER_HEIGHT = 48;
const Separator = () => /*#__PURE__*/React.createElement(View, {
  style: styles.separator
});
export const SkinTones = _ref => {
  let {
    keyboardScrollOffsetY
  } = _ref;
  const {
    onEmojiSelected,
    emojiTonesData,
    theme
  } = React.useContext(KeyboardContext);
  const {
    setKeyboardState
  } = useKeyboardStore();
  const handleEmojiPress = React.useCallback(emoji => {
    if (emoji.name === 'blank emoji') return;
    const parsedEmoji = parseEmoji(emoji);
    onEmojiSelected(parsedEmoji);
    setKeyboardState({
      type: 'RECENT_EMOJI_ADD',
      payload: emoji
    });
  }, [onEmojiSelected, setKeyboardState]);
  const renderItem = React.useCallback(props => {
    return /*#__PURE__*/React.createElement(SingleSkinTone, _extends({}, props, {
      onPress: () => handleEmojiPress(props.item),
      emojiSize: 32
    }));
  }, [handleEmojiPress]);
  const posX = emojiTonesData?.position?.x || 0;
  const posY = !emojiTonesData?.position?.y ? 0 : emojiTonesData?.position?.y - keyboardScrollOffsetY;
  const funnelXPosition = emojiTonesData?.funnelXPosition || 0;
  if (!emojiTonesData?.emojis?.length) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(View, {
    style: [styles.floating, {
      left: posX,
      top: posY,
      backgroundColor: theme.skinTonesContainer
    }]
  }, /*#__PURE__*/React.createElement(View, null, /*#__PURE__*/React.createElement(FlatList, {
    data: emojiTonesData.emojis,
    keyExtractor: emoji => emoji.index,
    renderItem: renderItem,
    ItemSeparatorComponent: Separator,
    showsHorizontalScrollIndicator: false,
    ListHeaderComponentStyle: styles.activeIndicatorContainer,
    horizontal: true
  }))), /*#__PURE__*/React.createElement(View, {
    style: [styles.funnelContainer, {
      left: funnelXPosition + 14,
      top: posY + TONES_CONTAINER_HEIGHT - 1
    }]
  }, /*#__PURE__*/React.createElement(Funnel, {
    fill: theme.skinTonesContainer
  })));
};
const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 226,
    height: TONES_CONTAINER_HEIGHT,
    borderRadius: 8
  },
  funnelContainer: {
    position: 'absolute'
  },
  separator: {
    width: 1,
    height: 38,
    backgroundColor: '#00000011',
    marginHorizontal: 4,
    marginVertical: 5
  },
  activeIndicatorContainer: {
    position: 'absolute',
    width: 28,
    height: 28
  }
});
//# sourceMappingURL=SkinTones.js.map