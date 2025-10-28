"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IsSafeAreaWrapper = exports.ConditionalContainer = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const ConditionalContainer = _ref => {
  let {
    children,
    container,
    condition
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, condition ? container(children) : children);
};
exports.ConditionalContainer = ConditionalContainer;
const IsSafeAreaWrapper = _ref2 => {
  let {
    children,
    isSafeArea,
    ...props
  } = _ref2;
  return isSafeArea ? /*#__PURE__*/_react.default.createElement(_reactNative.SafeAreaView, props, children) : /*#__PURE__*/_react.default.createElement(_reactNative.View, props, children);
};
exports.IsSafeAreaWrapper = IsSafeAreaWrapper;
//# sourceMappingURL=ConditionalContainer.js.map