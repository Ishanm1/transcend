"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojiPicker = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _EmojiStaticKeyboard = require("./components/EmojiStaticKeyboard");
var _Knob = require("./components/Knob");
var _KeyboardProvider = require("./contexts/KeyboardProvider");
var _KeyboardContext = require("./contexts/KeyboardContext");
var _ModalWithBackdrop = require("./components/ModalWithBackdrop");
var _getHeight = require("./utils/getHeight");
var _useKeyboard = require("./hooks/useKeyboard");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const EmojiPicker = _ref => {
  let {
    onEmojiSelected,
    onRequestClose,
    open,
    onClose,
    expandable = _KeyboardContext.defaultKeyboardContext.expandable,
    defaultHeight = _KeyboardContext.defaultKeyboardContext.defaultHeight,
    allowMultipleSelections = false,
    ...props
  } = _ref;
  const {
    height: screenHeight
  } = (0, _reactNative.useWindowDimensions)();
  const offsetY = React.useRef(new _reactNative.Animated.Value(0)).current;
  const height = React.useRef(new _reactNative.Animated.Value((0, _getHeight.getHeight)(defaultHeight, screenHeight))).current;
  const additionalHeight = React.useRef(new _reactNative.Animated.Value(0)).current;
  const {
    keyboardVisible,
    keyboardHeight
  } = (0, _useKeyboard.useKeyboard)(open);
  const [isExpanded, setIsExpanded] = React.useState(false);
  React.useEffect(() => {
    const shouldExpandHeight = keyboardVisible && !isExpanded;
    const newAdditionalHeightValue = shouldExpandHeight ? keyboardHeight : 0;
    _reactNative.Animated.timing(additionalHeight, {
      toValue: newAdditionalHeightValue,
      useNativeDriver: false,
      duration: 200
    }).start();
  }, [additionalHeight, isExpanded, keyboardHeight, keyboardVisible]);
  const close = () => {
    height.setValue((0, _getHeight.getHeight)(defaultHeight, screenHeight));
    offsetY.setValue(0);
    onClose();
  };
  return /*#__PURE__*/React.createElement(_KeyboardProvider.KeyboardProvider, _extends({
    onEmojiSelected: emoji => {
      onEmojiSelected(emoji);
      !allowMultipleSelections && close();
    },
    open: open,
    onClose: close,
    expandable: expandable,
    defaultHeight: defaultHeight
  }, props), /*#__PURE__*/React.createElement(_ModalWithBackdrop.ModalWithBackdrop, {
    isOpen: open,
    backdropPress: close,
    onRequestClose: onRequestClose || close
  }, /*#__PURE__*/React.createElement(React.Fragment, null, expandable && /*#__PURE__*/React.createElement(_Knob.Knob, {
    height: height,
    offsetY: offsetY,
    onClose: onClose,
    setIsExpanded: setIsExpanded
  }), /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
    style: [{
      height: _reactNative.Animated.add(_reactNative.Animated.subtract(height, offsetY), additionalHeight)
    }]
  }, /*#__PURE__*/React.createElement(_EmojiStaticKeyboard.EmojiStaticKeyboard, null)))));
};
exports.EmojiPicker = EmojiPicker;
//# sourceMappingURL=EmojiPicker.js.map