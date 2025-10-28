function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { StyleSheet, View, Animated, SafeAreaView, Platform } from 'react-native';
import { EmojiCategory } from './EmojiCategory';
import { KeyboardContext } from '../contexts/KeyboardContext';
import { Categories, CATEGORY_ELEMENT_WIDTH } from './Categories';
import { SearchBar } from './SearchBar';
import { useKeyboardStore } from '../store/useKeyboardStore';
import { ConditionalContainer } from './ConditionalContainer';
import { SkinTones } from './SkinTones';
const isAndroid = Platform.OS === 'android';
export const EmojiStaticKeyboard = /*#__PURE__*/React.memo(() => {
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
  } = React.useContext(KeyboardContext);
  const {
    keyboardState
  } = useKeyboardStore();
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
      return /*#__PURE__*/React.createElement(EmojiCategory, _extends({
        setKeyboardScrollOffsetY: setKeyboardScrollOffsetY
      }, props, {
        activeCategoryIndex: activeCategoryIndex
      }));
    } else {
      return /*#__PURE__*/React.createElement(EmojiCategory, _extends({
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
  const scrollNav = React.useRef(new Animated.Value(0)).current;
  const handleScroll = React.useCallback(el => {
    const index = el.nativeEvent.contentOffset.x / width;
    scrollNav.setValue(index * CATEGORY_ELEMENT_WIDTH);
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
  return /*#__PURE__*/React.createElement(View, {
    style: [styles.container, styles.containerShadow, categoryPosition === 'top' && disableSafeArea && styles.containerReverse, themeStyles.container, {
      backgroundColor: theme.container
    }],
    onLayout: e => setWidth(e.nativeEvent.layout.width)
  }, /*#__PURE__*/React.createElement(ConditionalContainer, {
    condition: !disableSafeArea,
    container: children => /*#__PURE__*/React.createElement(SafeAreaView, {
      style: [styles.flex, categoryPosition === 'top' && styles.containerReverse]
    }, children)
  }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(View, {
    style: categoryPosition === 'top' ? [styles.searchContainer, {
      marginBottom: 16
    }] : styles.searchContainer
  }, enableSearchBar && /*#__PURE__*/React.createElement(SearchBar, {
    scrollEmojiCategoryListToIndex: scrollEmojiCategoryListToIndex
  }), customButtons), /*#__PURE__*/React.createElement(Animated.FlatList, {
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
  }), /*#__PURE__*/React.createElement(Categories, {
    scrollEmojiCategoryListToIndex: scrollEmojiCategoryListToIndex,
    scrollNav: enableCategoryChangeGesture ? scrollNav : undefined
  }), /*#__PURE__*/React.createElement(SkinTones, {
    keyboardScrollOffsetY: keyboardScrollOffsetY
  }))));
}, () => true);
const styles = StyleSheet.create({
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