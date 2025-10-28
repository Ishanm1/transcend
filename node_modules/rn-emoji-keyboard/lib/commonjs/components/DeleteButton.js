"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteButton = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _Icon = require("./Icon");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const DeleteButton = _ref => {
  let {
    containerStyle,
    iconNormalColor,
    iconActiveColor,
    ...pressableProps
  } = _ref;
  const {
    theme
  } = _react.default.useContext(_KeyboardContext.KeyboardContext);
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.buttonContainer, containerStyle]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, _extends({
    style: _ref2 => {
      let {
        pressed
      } = _ref2;
      return [{
        backgroundColor: pressed ? theme.customButton.backgroundPressed : theme.customButton.background,
        padding: 8,
        borderRadius: 100
      }, styles.button];
    }
  }, pressableProps), _ref3 => {
    let {
      pressed
    } = _ref3;
    return /*#__PURE__*/_react.default.createElement(_Icon.Icon, {
      iconName: "Backspace",
      isActive: pressed,
      normalColor: iconNormalColor || theme.customButton.icon,
      activeColor: iconActiveColor || theme.customButton.iconPressed
    });
  }));
};
exports.DeleteButton = DeleteButton;
const styles = _reactNative.StyleSheet.create({
  buttonContainer: {
    marginTop: 16,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
//# sourceMappingURL=DeleteButton.js.map