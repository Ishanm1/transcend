"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useKeyboard = void 0;
var _react = require("react");
var _reactNative = require("react-native");
const useKeyboard = isOpen => {
  const [keyboardVisible, setKeyboardVisible] = (0, _react.useState)(false);
  const [keyboardHeight, setKeyboardHeight] = (0, _react.useState)(0);
  const onKeyboardWillShow = (0, _react.useCallback)(e => {
    if (!isOpen) return;
    setKeyboardHeight(e.endCoordinates.height);
    setKeyboardVisible(true);
  }, [isOpen]);
  const onKeyboardWillHide = (0, _react.useCallback)(() => {
    setKeyboardHeight(0);
    setKeyboardVisible(false);
  }, []);
  (0, _react.useEffect)(() => {
    const showSubscription = _reactNative.Keyboard.addListener('keyboardWillShow', onKeyboardWillShow);
    const hideSubscription = _reactNative.Keyboard.addListener('keyboardWillHide', onKeyboardWillHide);
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [onKeyboardWillHide, onKeyboardWillShow]);
  return {
    keyboardVisible,
    keyboardHeight
  };
};
exports.useKeyboard = useKeyboard;
//# sourceMappingURL=useKeyboard.js.map