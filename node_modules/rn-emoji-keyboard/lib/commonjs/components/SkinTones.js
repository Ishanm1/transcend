"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TONES_CONTAINER_WIDTH = exports.SkinTones = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _useKeyboardStore = require("../store/useKeyboardStore");
var _parseEmoji = require("../utils/parseEmoji");
var _SingleSkinTone = require("./SingleSkinTone");
var _funnel = require("../assets/funnel");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const TONES_CONTAINER_WIDTH = 226;
exports.TONES_CONTAINER_WIDTH = TONES_CONTAINER_WIDTH;
const TONES_CONTAINER_HEIGHT = 48;
const Separator = () => /*#__PURE__*/React.createElement(_reactNative.View, {
  style: styles.separator
});
const SkinTones = _ref => {
  let {
    keyboardScrollOffsetY
  } = _ref;
  const {
    onEmojiSelected,
    emojiTonesData,
    theme
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const {
    setKeyboardState
  } = (0, _useKeyboardStore.useKeyboardStore)();
  const handleEmojiPress = React.useCallback(emoji => {
    if (emoji.name === 'blank emoji') return;
    const parsedEmoji = (0, _parseEmoji.parseEmoji)(emoji);
    onEmojiSelected(parsedEmoji);
    setKeyboardState({
      type: 'RECENT_EMOJI_ADD',
      payload: emoji
    });
  }, [onEmojiSelected, setKeyboardState]);
  const renderItem = React.useCallback(props => {
    return /*#__PURE__*/React.createElement(_SingleSkinTone.SingleSkinTone, _extends({}, props, {
      onPress: () => handleEmojiPress(props.item),
      emojiSize: 32
    }));
  }, [handleEmojiPress]);
  const posX = emojiTonesData?.position?.x || 0;
  const posY = !emojiTonesData?.position?.y ? 0 : emojiTonesData?.position?.y - keyboardScrollOffsetY;
  const funnelXPosition = emojiTonesData?.funnelXPosition || 0;
  if (!emojiTonesData?.emojis?.length) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [styles.floating, {
      left: posX,
      top: posY,
      backgroundColor: theme.skinTonesContainer
    }]
  }, /*#__PURE__*/React.createElement(_reactNative.View, null, /*#__PURE__*/React.createElement(_reactNative.FlatList, {
    data: emojiTonesData.emojis,
    keyExtractor: emoji => emoji.index,
    renderItem: renderItem,
    ItemSeparatorComponent: Separator,
    showsHorizontalScrollIndicator: false,
    ListHeaderComponentStyle: styles.activeIndicatorContainer,
    horizontal: true
  }))), /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [styles.funnelContainer, {
      left: funnelXPosition + 14,
      top: posY + TONES_CONTAINER_HEIGHT - 1
    }]
  }, /*#__PURE__*/React.createElement(_funnel.Funnel, {
    fill: theme.skinTonesContainer
  })));
};
exports.SkinTones = SkinTones;
const styles = _reactNative.StyleSheet.create({
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