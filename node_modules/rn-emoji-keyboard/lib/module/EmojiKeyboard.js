function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { EmojiStaticKeyboard } from './components/EmojiStaticKeyboard';
import { KeyboardProvider } from './contexts/KeyboardProvider';
export const EmojiKeyboard = props => {
  return /*#__PURE__*/React.createElement(KeyboardProvider, _extends({}, props, {
    open: true,
    onClose: () => {}
  }), /*#__PURE__*/React.createElement(EmojiStaticKeyboard, null));
};
//# sourceMappingURL=EmojiKeyboard.js.map