"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Categories = exports.CATEGORY_ELEMENT_WIDTH = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _types = require("../types");
var _CategoryItem = require("./CategoryItem");
var _exhaustiveTypeCheck = require("../utils/exhaustiveTypeCheck");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const CATEGORY_ELEMENT_WIDTH = 37;
exports.CATEGORY_ELEMENT_WIDTH = CATEGORY_ELEMENT_WIDTH;
const Separator = () => /*#__PURE__*/React.createElement(_reactNative.View, {
  style: styles.separator
});
const Categories = p => {
  const {
    activeCategoryIndex,
    onCategoryChangeFailed,
    categoryPosition,
    renderList,
    theme,
    styles: themeStyles,
    enableCategoryChangeAnimation,
    setShouldAnimateScroll
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const scrollNav = React.useRef(new _reactNative.Animated.Value(0)).current;
  const handleScrollToCategory = React.useCallback(index => {
    setShouldAnimateScroll(enableCategoryChangeAnimation);
    p.scrollEmojiCategoryListToIndex(index);
  }, [setShouldAnimateScroll, enableCategoryChangeAnimation, p]);
  const renderItem = React.useCallback(_ref => {
    let {
      item,
      index
    } = _ref;
    return /*#__PURE__*/React.createElement(_CategoryItem.CategoryItem, {
      item: item,
      index: index,
      handleScrollToCategory: handleScrollToCategory
    });
  }, [handleScrollToCategory]);
  React.useEffect(() => {
    _reactNative.Animated.spring(scrollNav, {
      toValue: activeCategoryIndex * CATEGORY_ELEMENT_WIDTH,
      useNativeDriver: true
    }).start();
  }, [activeCategoryIndex, scrollNav]);
  const activeIndicator = React.useCallback(() => /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
    style: [styles.activeIndicator, {
      backgroundColor: theme.category.containerActive,
      transform: [{
        translateX: p.scrollNav || scrollNav
      }]
    }]
  }), [theme.category.containerActive, scrollNav, p.scrollNav]);
  const getStylesBasedOnPosition = () => {
    const style = [styles.navigation, themeStyles.category.container];
    switch (categoryPosition) {
      case 'floating':
        style.push(styles.navigationFloating);
        break;
      case 'top':
        style.push(styles.navigationTop);
        break;
      case 'bottom':
        style.push(styles.navigationBottom);
        break;
      default:
        (0, _exhaustiveTypeCheck.exhaustiveTypeCheck)(categoryPosition);
        break;
    }
    if (theme.category.container !== _KeyboardContext.defaultTheme.category.container || categoryPosition === 'floating') style.push({
      backgroundColor: theme.category.container
    });
    return style;
  };
  const renderData = React.useMemo(() => {
    return renderList.map(category => ({
      category: category.title,
      icon: _types.CATEGORIES_NAVIGATION.find(cat => cat.category === category.title)?.icon || 'QuestionMark'
    }));
  }, [renderList]);
  return /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [categoryPosition === 'floating' && styles.floating]
  }, /*#__PURE__*/React.createElement(_reactNative.View, {
    style: getStylesBasedOnPosition()
  }, /*#__PURE__*/React.createElement(_reactNative.FlatList, {
    data: renderData,
    keyExtractor: item => item.category,
    renderItem: renderItem,
    ItemSeparatorComponent: Separator,
    showsHorizontalScrollIndicator: false,
    horizontal: true,
    onScrollToIndexFailed: onCategoryChangeFailed,
    ListHeaderComponent: activeIndicator,
    ListHeaderComponentStyle: styles.activeIndicatorContainer,
    extraData: activeCategoryIndex
  })));
};
exports.Categories = Categories;
const styles = _reactNative.StyleSheet.create({
  floating: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  navigation: {
    padding: 3,
    alignItems: 'center',
    borderColor: '#00000011'
  },
  navigationFloating: {
    borderRadius: 8
  },
  navigationBottom: {
    paddingVertical: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 1
  },
  navigationTop: {
    paddingTop: 12,
    paddingBottom: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: '#00000011',
    marginHorizontal: 4
  },
  activeIndicator: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 6
  },
  activeIndicatorContainer: {
    position: 'absolute',
    width: 28,
    height: 28
  }
});
//# sourceMappingURL=Categories.js.map