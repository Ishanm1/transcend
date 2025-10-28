import * as React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardContext } from '../contexts/KeyboardContext';
import { Icon } from './Icon';
export const SearchBar = _ref => {
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
  } = React.useContext(KeyboardContext);
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
  return /*#__PURE__*/React.createElement(View, {
    style: [styles.container, themeStyles.searchBar.container, {
      backgroundColor: theme.search.background
    }]
  }, /*#__PURE__*/React.createElement(TextInput, {
    style: [styles.input, themeStyles.searchBar.text, {
      color: theme.search.text
    }],
    value: searchPhrase,
    onChangeText: handleSearch,
    placeholder: translation.search,
    ref: inputRef,
    onTouchEndCapture: clearEmojiTonesData,
    placeholderTextColor: theme.search.placeholder
  }), !hideSearchBarClearIcon && !!searchPhrase && /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: clearPhrase,
    style: styles.button
  }, /*#__PURE__*/React.createElement(Icon, {
    iconName: 'Close',
    isActive: true,
    normalColor: theme.search.icon,
    activeColor: theme.search.icon
  })));
};
const styles = StyleSheet.create({
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