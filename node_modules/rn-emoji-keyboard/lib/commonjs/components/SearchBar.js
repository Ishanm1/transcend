"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchBar = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _Icon = require("./Icon");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const SearchBar = _ref => {
  let {
    scrollEmojiCategoryListToIndex
  } = _ref;
  const {
    searchPhrase,
    setSearchPhrase,
    hideSearchBarClearIcon,
    translation,
    setActiveCategoryIndex,
    renderList,
    theme,
    styles: themeStyles,
    clearEmojiTonesData,
    enableSearchAnimation,
    setShouldAnimateScroll,
    enableCategoryChangeAnimation
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const inputRef = React.useRef(null);
  const handleSearch = text => {
    setSearchPhrase(text);
    if (text === '') {
      setActiveCategoryIndex(0);
      scrollEmojiCategoryListToIndex(0);
      setShouldAnimateScroll(enableCategoryChangeAnimation);
      return;
    }
    const searchIndex = renderList.findIndex(cat => cat.title === 'search');
    if (searchIndex !== -1) {
      setActiveCategoryIndex(searchIndex);
      scrollEmojiCategoryListToIndex(searchIndex);
      setShouldAnimateScroll(enableSearchAnimation);
    }
  };
  const clearPhrase = () => {
    setSearchPhrase('');
    clearEmojiTonesData();
    setActiveCategoryIndex(0);
    setTimeout(() => {
      inputRef.current?.blur();
    }, 0);
    scrollEmojiCategoryListToIndex(0);
  };
  return /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [styles.container, themeStyles.searchBar.container, {
      backgroundColor: theme.search.background
    }]
  }, /*#__PURE__*/React.createElement(_reactNative.TextInput, {
    style: [styles.input, themeStyles.searchBar.text, {
      color: theme.search.text
    }],
    value: searchPhrase,
    onChangeText: handleSearch,
    placeholder: translation.search,
    ref: inputRef,
    onTouchEndCapture: clearEmojiTonesData,
    placeholderTextColor: theme.search.placeholder
  }), !hideSearchBarClearIcon && !!searchPhrase && /*#__PURE__*/React.createElement(_reactNative.TouchableOpacity, {
    onPress: clearPhrase,
    style: styles.button
  }, /*#__PURE__*/React.createElement(_Icon.Icon, {
    iconName: 'Close',
    isActive: true,
    normalColor: theme.search.icon,
    activeColor: theme.search.icon
  })));
};
exports.SearchBar = SearchBar;
const styles = _reactNative.StyleSheet.create({
  container: {
    marginTop: 16,
    marginRight: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#00000011',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1
  },
  button: {
    marginRight: 8
  }
});
//# sourceMappingURL=SearchBar.js.map