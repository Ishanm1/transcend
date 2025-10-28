"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingleEmoji = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const SingleEmoji = /*#__PURE__*/React.memo(p => {
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
  return /*#__PURE__*/React.createElement(_reactNative.TouchableOpacity, {
    onPress: handlePress,
    onLongPress: handleLongPress,
    style: styles.container
  }, /*#__PURE__*/React.createElement(_reactNative.View, {
    pointerEvents: 'none',
    style: [styles.emojiWrapper, p.selectedEmojiStyle]
  }, /*#__PURE__*/React.createElement(_reactNative.Text, {
    style: [styles.emoji, {
      fontSize: p.emojiSize
    }]
  }, p.item.emoji)));
}, (prevProps, nextProps) => prevProps.isSelected === nextProps.isSelected);
exports.SingleEmoji = SingleEmoji;
const styles = _reactNative.StyleSheet.create({
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