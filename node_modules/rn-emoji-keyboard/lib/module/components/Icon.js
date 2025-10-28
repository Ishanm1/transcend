import * as React from 'react';
import { exhaustiveTypeCheck } from '../utils/exhaustiveTypeCheck';
import PngIcon from '../assets/icons/PngIcon';
export const Icon = _ref => {
  let {
    iconName,
    isActive,
    normalColor,
    activeColor
  } = _ref;
  const color = isActive ? activeColor : normalColor;
  switch (iconName) {
    case 'Smile':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/smile.png')
      });
    case 'Trees':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/trees.png')
      });
    case 'Pizza':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/pizza.png')
      });
    case 'Plane':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/plane.png')
      });
    case 'Football':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/football.png')
      });
    case 'Lightbulb':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/lightbulb.png')
      });
    case 'Flag':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/flag.png')
      });
    case 'Ban':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/ban.png')
      });
    case 'Users':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/users.png')
      });
    case 'Search':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/search.png')
      });
    case 'Close':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/close.png')
      });
    case 'Clock':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/clock.png')
      });
    case 'QuestionMark':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/questionMark.png')
      });
    case 'Backspace':
      return /*#__PURE__*/React.createElement(PngIcon, {
        fill: color,
        source: require('../assets/icons/backspace.png')
      });
    default:
      exhaustiveTypeCheck(iconName);
      return null;
  }
};
//# sourceMappingURL=Icon.js.map