"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Knob = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _getHeight = require("../utils/getHeight");
var _KeyboardContext = require("../contexts/KeyboardContext");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const Knob = _ref => {
  let {
    offsetY,
    height,
    onClose,
    setIsExpanded
  } = _ref;
  const {
    height: screenHeight
  } = (0, _reactNative.useWindowDimensions)();
  const {
    expandedHeight,
    defaultHeight,
    theme,
    styles: themeStyles
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const panResponder = React.useRef(_reactNative.PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => _reactNative.Keyboard.dismiss(),
    onPanResponderMove: _reactNative.Animated.event([null, {
      dy: offsetY
    }], {
      useNativeDriver: false
    }),
    onPanResponderRelease: (_, gestureState) => {
      _reactNative.Animated.spring(offsetY, {
        useNativeDriver: false,
        toValue: 0
      }).start();
      if (gestureState.dy < -50) {
        setIsExpanded(true);
        _reactNative.Animated.spring(height, {
          useNativeDriver: false,
          toValue: (0, _getHeight.getHeight)(expandedHeight, screenHeight)
        }).start();
      } else if (gestureState.dy > 150) {
        setIsExpanded(false);
        height.setValue((0, _getHeight.getHeight)(defaultHeight, screenHeight));
        offsetY.setValue(0);
        onClose();
      } else {
        setIsExpanded(false);
        _reactNative.Animated.spring(height, {
          useNativeDriver: false,
          toValue: (0, _getHeight.getHeight)(defaultHeight, screenHeight)
        }).start();
      }
    },
    onShouldBlockNativeResponder: () => true
  })).current;
  return /*#__PURE__*/React.createElement(_reactNative.View, panResponder.panHandlers, /*#__PURE__*/React.createElement(_reactNative.View, {
    style: styles.panContainer
  }, /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
    style: [styles.knob, {
      backgroundColor: theme.knob
    }, themeStyles.knob]
  })));
};
exports.Knob = Knob;
const styles = _reactNative.StyleSheet.create({
  panContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignSelf: 'center',
    flexDirection: 'column-reverse',
    backgroundColor: '#00000000'
  },
  knob: {
    height: 6,
    width: 50,
    marginBottom: 6,
    alignSelf: 'center',
    borderRadius: 4,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 5
  }
});
//# sourceMappingURL=Knob.js.map