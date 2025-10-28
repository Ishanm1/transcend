"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CategoryItem = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _Icon = require("./Icon");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const CategoryItem = _ref => {
  let {
    item,
    index,
    handleScrollToCategory
  } = _ref;
  const {
    activeCategoryIndex,
    theme,
    setActiveCategoryIndex
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const handleSelect = () => {
    handleScrollToCategory(index);
    setActiveCategoryIndex(index);
  };
  return /*#__PURE__*/React.createElement(_reactNative.TouchableOpacity, {
    onPress: handleSelect
  }, /*#__PURE__*/React.createElement(_reactNative.View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(_Icon.Icon, {
    iconName: item.icon,
    isActive: activeCategoryIndex === index,
    normalColor: theme.category.icon,
    activeColor: theme.category.iconActive
  })));
};
exports.CategoryItem = CategoryItem;
const styles = _reactNative.StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    borderRadius: 6
  },
  icon: {
    textAlign: 'center'
  }
});
//# sourceMappingURL=CategoryItem.js.map