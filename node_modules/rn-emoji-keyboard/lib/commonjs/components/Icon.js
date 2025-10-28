"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;
var React = _interopRequireWildcard(require("react"));
var _exhaustiveTypeCheck = require("../utils/exhaustiveTypeCheck");
var _PngIcon = _interopRequireDefault(require("../assets/icons/PngIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const Icon = _ref => {
  let {
    iconName,
    isActive,
    normalColor,
    activeColor
  } = _ref;
  const color = isActive ? activeColor : normalColor;
  switch (iconName) {
    case 'Smile':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/smile.png')
      });
    case 'Trees':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/trees.png')
      });
    case 'Pizza':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/pizza.png')
      });
    case 'Plane':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/plane.png')
      });
    case 'Football':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/football.png')
      });
    case 'Lightbulb':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/lightbulb.png')
      });
    case 'Flag':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/flag.png')
      });
    case 'Ban':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/ban.png')
      });
    case 'Users':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/users.png')
      });
    case 'Search':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/search.png')
      });
    case 'Close':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/close.png')
      });
    case 'Clock':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/clock.png')
      });
    case 'QuestionMark':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/questionMark.png')
      });
    case 'Backspace':
      return /*#__PURE__*/React.createElement(_PngIcon.default, {
        fill: color,
        source: require('../assets/icons/backspace.png')
      });
    default:
      (0, _exhaustiveTypeCheck.exhaustiveTypeCheck)(iconName);
      return null;
  }
};
exports.Icon = Icon;
//# sourceMappingURL=Icon.js.map