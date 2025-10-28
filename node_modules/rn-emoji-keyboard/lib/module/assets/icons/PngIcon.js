import * as React from 'react';
import { Image } from 'react-native';
export const iconDimensions = {
  width: 22,
  height: 22
};
export default (_ref => {
  let {
    fill,
    source
  } = _ref;
  return /*#__PURE__*/React.createElement(Image, {
    source: source,
    style: [{
      tintColor: fill
    }, iconDimensions]
  });
});
//# sourceMappingURL=PngIcon.js.map