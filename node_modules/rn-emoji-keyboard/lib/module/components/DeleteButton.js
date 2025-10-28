function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { KeyboardContext } from '../contexts/KeyboardContext';
import { Icon } from './Icon';
export const DeleteButton = _ref => {
  let {
    containerStyle,
    iconNormalColor,
    iconActiveColor,
    ...pressableProps
  } = _ref;
  const {
    theme
  } = React.useContext(KeyboardContext);
  return /*#__PURE__*/React.createElement(View, {
    style: [styles.buttonContainer, containerStyle]
  }, /*#__PURE__*/React.createElement(Pressable, _extends({
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
    return /*#__PURE__*/React.createElement(Icon, {
      iconName: "Backspace",
      isActive: pressed,
      normalColor: iconNormalColor || theme.customButton.icon,
      activeColor: iconActiveColor || theme.customButton.iconPressed
    });
  }));
};
const styles = StyleSheet.create({
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