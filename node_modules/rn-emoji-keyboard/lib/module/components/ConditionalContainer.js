import React from 'react';
import { SafeAreaView, View } from 'react-native';
export const ConditionalContainer = _ref => {
  let {
    children,
    container,
    condition
  } = _ref;
  return /*#__PURE__*/React.createElement(React.Fragment, null, condition ? container(children) : children);
};
export const IsSafeAreaWrapper = _ref2 => {
  let {
    children,
    isSafeArea,
    ...props
  } = _ref2;
  return isSafeArea ? /*#__PURE__*/React.createElement(SafeAreaView, props, children) : /*#__PURE__*/React.createElement(View, props, children);
};
//# sourceMappingURL=ConditionalContainer.js.map