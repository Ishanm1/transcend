import * as React from 'react';
import { Image } from 'react-native';
const iconDimensions = {
  width: 12,
  height: 10
};
export const Funnel = _ref => {
  let {
    fill
  } = _ref;
  return /*#__PURE__*/React.createElement(Image, {
    source: require('./funnel.png'),
    style: [{
      tintColor: fill
    }, iconDimensions]
  });
};
//# sourceMappingURL=index.js.map