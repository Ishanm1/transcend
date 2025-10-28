import * as React from 'react';
import en from '../translation/en';
import { CATEGORIES } from '../types';
import emojisByCategory from '../assets/emojis.json';
export const emptyStyles = {
  container: {},
  header: {},
  category: {
    icon: {},
    container: {}
  },
  searchBar: {
    container: {},
    text: {}
  },
  knob: {},
  emoji: {
    selected: {}
  }
};
export const defaultTheme = {
  backdrop: '#00000055',
  knob: '#ffffff',
  container: '#ffffff',
  header: '#00000099',
  skinTonesContainer: '#e3dbcd',
  category: {
    icon: '#000000',
    iconActive: '#005b96',
    container: '#e3dbcd',
    containerActive: '#ffffff'
  },
  search: {
    text: '#000000cc',
    placeholder: '#00000055',
    icon: '#00000055',
    background: '#00000011'
  },
  customButton: {
    icon: '#000000',
    iconPressed: '#005b96',
    background: '#00000011',
    backgroundPressed: '#00000016'
  },
  emoji: {
    selected: '#e3dbcd'
  }
};
export const defaultKeyboardContext = {
  open: false,
  onClose: () => {},
  onEmojiSelected: _emoji => {},
  emojiSize: 28,
  expandable: true,
  hideHeader: false,
  defaultHeight: '40%',
  expandedHeight: '80%',
  onCategoryChangeFailed: info => console.warn(info),
  translation: en,
  disabledCategories: [],
  enableRecentlyUsed: false,
  categoryPosition: 'floating',
  enableSearchBar: false,
  hideSearchBarClearIcon: false,
  customButtons: null,
  categoryOrder: [...CATEGORIES],
  onRequestClose: () => {},
  disableSafeArea: false,
  allowMultipleSelections: false,
  theme: defaultTheme,
  styles: emptyStyles,
  enableSearchAnimation: true,
  enableCategoryChangeAnimation: true,
  selectedEmojis: false,
  enableCategoryChangeGesture: true,
  emojisByCategory: emojisByCategory
};
export const defaultKeyboardValues = {
  activeCategoryIndex: 0,
  setActiveCategoryIndex: () => {},
  numberOfColumns: 5,
  width: 0,
  setWidth: _width => {},
  searchPhrase: '',
  setSearchPhrase: _phrase => {},
  renderList: [],
  isToneSelectorOpened: false,
  clearEmojiTonesData: () => {},
  generateEmojiTones: _emoji => {},
  emojiTonesData: {
    emojis: [],
    position: {
      x: 0,
      y: 0
    },
    funnelXPosition: 0
  },
  shouldAnimateScroll: true,
  setShouldAnimateScroll: _value => {},
  minimalEmojisAmountToDisplay: 50
};
export const KeyboardContext = /*#__PURE__*/React.createContext({
  ...defaultKeyboardContext,
  ...defaultKeyboardValues
});
//# sourceMappingURL=KeyboardContext.js.map