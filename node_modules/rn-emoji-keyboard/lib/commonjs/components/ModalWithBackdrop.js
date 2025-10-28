"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalWithBackdrop = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _useTimeout = require("../hooks/useTimeout");
var _ConditionalContainer = require("./ConditionalContainer");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const ModalWithBackdrop = _ref => {
  let {
    isOpen,
    backdropPress,
    children,
    ...rest
  } = _ref;
  const {
    height: screenHeight
  } = (0, _reactNative.useWindowDimensions)();
  const translateY = React.useRef(new _reactNative.Animated.Value(screenHeight)).current;
  const {
    theme,
    disableSafeArea
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const handleTimeout = (0, _useTimeout.useTimeout)();
  React.useEffect(() => {
    _reactNative.Animated.spring(translateY, {
      toValue: isOpen ? 0 : screenHeight,
      useNativeDriver: true
    }).start();
  }, [isOpen, screenHeight, translateY]);
  const handleClose = () => {
    _reactNative.Animated.spring(translateY, {
      toValue: screenHeight,
      useNativeDriver: true
    }).start();
    handleTimeout(() => backdropPress(), 200);
  };
  return /*#__PURE__*/React.createElement(_reactNative.Modal, _extends({
    visible: isOpen,
    animationType: "fade",
    transparent: true
  }, rest), /*#__PURE__*/React.createElement(_reactNative.TouchableOpacity, {
    style: [styles.modalContainer, {
      backgroundColor: theme.backdrop
    }],
    activeOpacity: 1,
    onPress: handleClose
  }, /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [styles.modalContainer, {
      backgroundColor: theme.backdrop
    }]
  }, /*#__PURE__*/React.createElement(_ConditionalContainer.IsSafeAreaWrapper, {
    style: styles.modalContainer,
    isSafeArea: !disableSafeArea
  }, /*#__PURE__*/React.createElement(_reactNative.TouchableOpacity, {
    activeOpacity: 1
  }, /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
    style: {
      transform: [{
        translateY
      }]
    }
  }, children))))));
};
exports.ModalWithBackdrop = ModalWithBackdrop;
const styles = _reactNative.StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 5,
    elevation: 10
  }
});
//# sourceMappingURL=ModalWithBackdrop.js.map