"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojiStaticKeyboard = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _EmojiCategory = require("./EmojiCategory");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _Categories = require("./Categories");
var _SearchBar = require("./SearchBar");
var _useKeyboardStore = require("../store/useKeyboardStore");
var _ConditionalContainer = require("./ConditionalContainer");
var _SkinTones = require("./SkinTones");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const isAndroid = _reactNative.Platform.OS === 'android';
const EmojiStaticKeyboard = /*#__PURE__*/React.memo(() => {
  const {
    activeCategoryIndex,
    setActiveCategoryIndex,
    onCategoryChangeFailed,
    enableCategoryChangeGesture,
    categoryPosition,
    enableSearchBar,
    customButtons,
    searchPhrase,
    renderList,
    disableSafeArea,
    theme,
    styles: themeStyles,
    shouldAnimateScroll,
    enableCategoryChangeAnimation,
    width,
    setWidth
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const {
    keyboardState
  } = (0, _useKeyboardStore.useKeyboardStore)();
  const flatListRef = React.useRef(null);
  const hasMomentumBegan = React.useRef(false);
  const getItemLayout = React.useCallback((_, index) => ({
    length: width,
    offset: width * index,
    index
  }), [width]);
  const [keyboardScrollOffsetY, setKeyboardScrollOffsetY] = React.useState(0);
  const renderItem = React.useCallback(props => {
    const item = {
      ...props.item,
      data: []
    };
    const shouldRenderEmojis = activeCategoryIndex === props.index || activeCategoryIndex === props.index - 1 || activeCategoryIndex === props.index + 1;
    if (shouldRenderEmojis) {
      return /*#__PURE__*/React.createElement(_EmojiCategory.EmojiCategory, _extends({
        setKeyboardScrollOffsetY: setKeyboardScrollOffsetY
      }, props, {
        activeCategoryIndex: activeCategoryIndex
      }));
    } else {
      return /*#__PURE__*/React.createElement(_EmojiCategory.EmojiCategory, _extends({
        setKeyboardScrollOffsetY: setKeyboardScrollOffsetY
      }, props, {
        item: item,
        activeCategoryIndex: activeCategoryIndex
      }));
    }
  }, [activeCategoryIndex]);
  const scrollEmojiCategoryListToIndex = React.useCallback(index => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: shouldAnimateScroll && enableCategoryChangeAnimation
    });
  }, [enableCategoryChangeAnimation, shouldAnimateScroll]);
  React.useEffect(() => {
    setKeyboardScrollOffsetY(0);
  }, [activeCategoryIndex]);
  const keyExtractor = React.useCallback(item => item.title, []);
  const scrollNav = React.useRef(new _reactNative.Animated.Value(0)).current;
  const handleScroll = React.useCallback(el => {
    const index = el.nativeEvent.contentOffset.x / width;
    scrollNav.setValue(index * _Categories.CATEGORY_ELEMENT_WIDTH);
  }, [scrollNav, width]);
  const onMomentumScrollBegin = React.useCallback(() => {
    hasMomentumBegan.current = true;
  }, []);
  const onMomentumScrollEnd = React.useCallback(el => {
    if (!hasMomentumBegan.current) return;
    const index = el.nativeEvent.contentOffset.x / width;
    setActiveCategoryIndex(Math.round(index));
    hasMomentumBegan.current = false;
  }, [setActiveCategoryIndex, width]);
  return /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [styles.container, styles.containerShadow, categoryPosition === 'top' && disableSafeArea && styles.containerReverse, themeStyles.container, {
      backgroundColor: theme.container
    }],
    onLayout: e => setWidth(e.nativeEvent.layout.width)
  }, /*#__PURE__*/React.createElement(_ConditionalContainer.ConditionalContainer, {
    condition: !disableSafeArea,
    container: children => /*#__PURE__*/React.createElement(_reactNative.SafeAreaView, {
      style: [styles.flex, categoryPosition === 'top' && styles.containerReverse]
    }, children)
  }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_reactNative.View, {
    style: categoryPosition === 'top' ? [styles.searchContainer, {
      marginBottom: 16
    }] : styles.searchContainer
  }, enableSearchBar && /*#__PURE__*/React.createElement(_SearchBar.SearchBar, {
    scrollEmojiCategoryListToIndex: scrollEmojiCategoryListToIndex
  }), customButtons), /*#__PURE__*/React.createElement(_reactNative.Animated.FlatList, {
    extraData: [keyboardState.recentlyUsed.length, searchPhrase],
    data: renderList,
    keyExtractor: keyExtractor,
    renderItem: renderItem,
    removeClippedSubviews: isAndroid,
    ref: flatListRef,
    onScrollToIndexFailed: onCategoryChangeFailed,
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    pagingEnabled: true,
    scrollEventThrottle: 16,
    getItemLayout: getItemLayout,
    scrollEnabled: enableCategoryChangeGesture,
    initialNumToRender: 1,
    maxToRenderPerBatch: 1,
    onScroll: handleScroll,
    keyboardShouldPersistTaps: "handled",
    onMomentumScrollBegin: onMomentumScrollBegin,
    onMomentumScrollEnd: onMomentumScrollEnd
  }), /*#__PURE__*/React.createElement(_Categories.Categories, {
    scrollEmojiCategoryListToIndex: scrollEmojiCategoryListToIndex,
    scrollNav: enableCategoryChangeGesture ? scrollNav : undefined
  }), /*#__PURE__*/React.createElement(_SkinTones.SkinTones, {
    keyboardScrollOffsetY: keyboardScrollOffsetY
  }))));
}, () => true);
exports.EmojiStaticKeyboard = EmojiStaticKeyboard;
const styles = _reactNative.StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    borderRadius: 16
  },
  searchContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  containerReverse: {
    flexDirection: 'column-reverse'
  },
  containerShadow: {
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 5,
    elevation: 10
  }
});
//# sourceMappingURL=EmojiStaticKeyboard.js.map