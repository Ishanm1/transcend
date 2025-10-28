function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { Animated, useWindowDimensions } from 'react-native';
import { EmojiStaticKeyboard } from './components/EmojiStaticKeyboard';
import { Knob } from './components/Knob';
import { KeyboardProvider } from './contexts/KeyboardProvider';
import { defaultKeyboardContext } from './contexts/KeyboardContext';
import { ModalWithBackdrop } from './components/ModalWithBackdrop';
import { getHeight } from './utils/getHeight';
import { useKeyboard } from './hooks/useKeyboard';
export const EmojiPicker = _ref => {
  let {
    onEmojiSelected,
    onRequestClose,
    open,
    onClose,
    expandable = defaultKeyboardContext.expandable,
    defaultHeight = defaultKeyboardContext.defaultHeight,
    allowMultipleSelections = false,
    ...props
  } = _ref;
  const {
    height: screenHeight
  } = useWindowDimensions();
  const offsetY = React.useRef(new Animated.Value(0)).current;
  const height = React.useRef(new Animated.Value(getHeight(defaultHeight, screenHeight))).current;
  const additionalHeight = React.useRef(new Animated.Value(0)).current;
  const {
    keyboardVisible,
    keyboardHeight
  } = useKeyboard(open);
  const [isExpanded, setIsExpanded] = React.useState(false);
  React.useEffect(() => {
    const shouldExpandHeight = keyboardVisible && !isExpanded;
    const newAdditionalHeightValue = shouldExpandHeight ? keyboardHeight : 0;
    Animated.timing(additionalHeight, {
      toValue: newAdditionalHeightValue,
      useNativeDriver: false,
      duration: 200
    }).start();
  }, [additionalHeight, isExpanded, keyboardHeight, keyboardVisible]);
  const close = () => {
    height.setValue(getHeight(defaultHeight, screenHeight));
    offsetY.setValue(0);
    onClose();
  };
  return /*#__PURE__*/React.createElement(KeyboardProvider, _extends({
    onEmojiSelected: emoji => {
      onEmojiSelected(emoji);
      !allowMultipleSelections && close();
    },
    open: open,
    onClose: close,
    expandable: expandable,
    defaultHeight: defaultHeight
  }, props), /*#__PURE__*/React.createElement(ModalWithBackdrop, {
    isOpen: open,
    backdropPress: close,
    onRequestClose: onRequestClose || close
  }, /*#__PURE__*/React.createElement(React.Fragment, null, expandable && /*#__PURE__*/React.createElement(Knob, {
    height: height,
    offsetY: offsetY,
    onClose: onClose,
    setIsExpanded: setIsExpanded
  }), /*#__PURE__*/React.createElement(Animated.View, {
    style: [{
      height: Animated.add(Animated.subtract(height, offsetY), additionalHeight)
    }]
  }, /*#__PURE__*/React.createElement(EmojiStaticKeyboard, null)))));
};
//# sourceMappingURL=EmojiPicker.js.map