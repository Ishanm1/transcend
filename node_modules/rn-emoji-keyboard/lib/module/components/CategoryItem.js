import * as React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardContext } from '../contexts/KeyboardContext';
import { Icon } from './Icon';
export const CategoryItem = _ref => {
  let {
    item,
    index,
    handleScrollToCategory
  } = _ref;
  const {
    activeCategoryIndex,
    theme,
    setActiveCategoryIndex
  } = React.useContext(KeyboardContext);
  const handleSelect = () => {
    handleScrollToCategory(index);
    setActiveCategoryIndex(index);
  };
  return /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: handleSelect
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Icon, {
    iconName: item.icon,
    isActive: activeCategoryIndex === index,
    normalColor: theme.category.icon,
    activeColor: theme.category.iconActive
  })));
};
const styles = StyleSheet.create({
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