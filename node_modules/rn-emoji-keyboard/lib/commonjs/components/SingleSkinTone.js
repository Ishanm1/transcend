"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingleSkinTone = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class SingleSkinTone extends React.Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    const {
      item,
      emojiSize,
      onPress
    } = this.props;
    return /*#__PURE__*/React.createElement(_reactNative.TouchableOpacity, {
      onPress: onPress,
      style: styles.container
    }, /*#__PURE__*/React.createElement(_reactNative.View, {
      style: styles.iconContainer
    }, /*#__PURE__*/React.createElement(_reactNative.Text, {
      style: [styles.emoji, {
        fontSize: emojiSize
      }]
    }, item.emoji)));
  }
}
exports.SingleSkinTone = SingleSkinTone;
const styles = _reactNative.StyleSheet.create({
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