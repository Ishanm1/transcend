"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emptyStyles = exports.defaultTheme = exports.defaultKeyboardValues = exports.defaultKeyboardContext = exports.KeyboardContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _en = _interopRequireDefault(require("../translation/en"));
var _types = require("../types");
var _emojis = _interopRequireDefault(require("../assets/emojis.json"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const emptyStyles = {
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
exports.emptyStyles = emptyStyles;
const defaultTheme = {
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
exports.defaultTheme = defaultTheme;
const defaultKeyboardContext = {
  open: false,
  onClose: () => {},
  onEmojiSelected: _emoji => {},
  emojiSize: 28,
  expandable: true,
  hideHeader: false,
  defaultHeight: '40%',
  expandedHeight: '80%',
  onCategoryChangeFailed: info => console.warn(info),
  translation: _en.default,
  disabledCategories: [],
  enableRecentlyUsed: false,
  categoryPosition: 'floating',
  enableSearchBar: false,
  hideSearchBarClearIcon: false,
  customButtons: null,
  categoryOrder: [..._types.CATEGORIES],
  onRequestClose: () => {},
  disableSafeArea: false,
  allowMultipleSelections: false,
  theme: defaultTheme,
  styles: emptyStyles,
  enableSearchAnimation: true,
  enableCategoryChangeAnimation: true,
  selectedEmojis: false,
  enableCategoryChangeGesture: true,
  emojisByCategory: _emojis.default
};
exports.defaultKeyboardContext = defaultKeyboardContext;
const defaultKeyboardValues = {
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
exports.defaultKeyboardValues = defaultKeyboardValues;
const KeyboardContext = /*#__PURE__*/React.createContext({
  ...defaultKeyboardContext,
  ...defaultKeyboardValues
});
exports.KeyboardContext = KeyboardContext;
//# sourceMappingURL=KeyboardContext.js.map