"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyboardProvider = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _KeyboardContext = require("./KeyboardContext");
var _useKeyboardStore = require("../store/useKeyboardStore");
var _skinToneSelectorUtils = require("../utils/skinToneSelectorUtils");
var _deepMerge = require("../utils/deepMerge");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const KeyboardProvider = /*#__PURE__*/React.memo(props => {
  const [width, setWidth] = React.useState((0, _reactNative.useWindowDimensions)().width);
  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState(0);
  const [shouldAnimateScroll, setShouldAnimateScroll] = React.useState(true);
  const [searchPhrase, setSearchPhrase] = React.useState('');
  const {
    keyboardState
  } = (0, _useKeyboardStore.useKeyboardStore)();
  const {
    height
  } = (0, _reactNative.useWindowDimensions)();
  const [emojiTonesData, setEmojiTonesData] = React.useState(null);
  const numberOfColumns = React.useRef(Math.floor(width / ((props.emojiSize ? props.emojiSize : _KeyboardContext.defaultKeyboardContext.emojiSize) * 2)));

  // On initial render we want to display only emojis that are visible right away after keyboard open
  // Rest of emojis are loaded after user interaction with keyboard
  const calculateMinimalEmojisAmountToDisplay = () => {
    const defaultHeight = props.defaultHeight || _KeyboardContext.defaultKeyboardContext.defaultHeight;
    const emojiSize = props.emojiSize || _KeyboardContext.defaultKeyboardContext.emojiSize;
    const keyboardHeightPercentage = typeof defaultHeight === 'string' ? defaultHeight.substring(0, defaultHeight.length - 1) : defaultHeight;
    const keyboardHeight = height * (Number(keyboardHeightPercentage) / 100);
    const minimalEmojisAmount = Math.ceil(keyboardHeight / (emojiSize * 2) * numberOfColumns.current);
    return minimalEmojisAmount + minimalEmojisAmount / numberOfColumns.current;
  };
  const minimalEmojisAmountToDisplay = calculateMinimalEmojisAmountToDisplay();
  const generateEmojiTones = React.useCallback((emoji, emojiIndex, emojiSizes) => {
    if (!emoji || !emoji.toneEnabled) return;
    const EXTRA_SEARCH_TOP = props.enableSearchBar || props.categoryPosition === 'top' ? 50 : 0;
    const splittedEmoji = emoji.emoji.split('');
    const ZWJIndex = splittedEmoji.findIndex(a => a === _skinToneSelectorUtils.zeroWidthJoiner);
    const selectorIndex = splittedEmoji.findIndex(a => a === _skinToneSelectorUtils.variantSelector);
    const modifiedEmojis = _skinToneSelectorUtils.skinTones.map(tone => {
      const basicEmojiData = {
        index: tone.name,
        name: emoji.name,
        v: emoji.v,
        toneEnabled: true
      };
      // Check for emojis special signs which might break tone modify
      switch (true) {
        case ZWJIndex > 0:
          return {
            ...basicEmojiData,
            emoji: (0, _skinToneSelectorUtils.insertAtCertainIndex)(splittedEmoji, ZWJIndex, tone.color).join('')
          };
        case selectorIndex > 0:
          return {
            ...basicEmojiData,
            emoji: (0, _skinToneSelectorUtils.insertAtCertainIndex)(splittedEmoji, selectorIndex, tone.color).join('')
          };
        default:
          return {
            ...basicEmojiData,
            emoji: emoji.emoji + tone.color
          };
      }
    });
    const skinTonePosition = (0, _skinToneSelectorUtils.generateToneSelectorPosition)(numberOfColumns.current, emojiIndex, width, emojiSizes.width, emojiSizes.height, EXTRA_SEARCH_TOP);
    const funnelXPosition = (0, _skinToneSelectorUtils.generateToneSelectorFunnelPosition)(numberOfColumns.current, emojiIndex, emojiSizes.width);
    setEmojiTonesData({
      emojis: modifiedEmojis,
      position: skinTonePosition,
      funnelXPosition
    });
  }, [props.categoryPosition, props.enableSearchBar, width]);
  const clearEmojiTonesData = () => setEmojiTonesData(null);
  React.useEffect(() => {
    clearEmojiTonesData();
  }, [activeCategoryIndex]);
  React.useEffect(() => {
    if (props.open) setActiveCategoryIndex(0);
    setSearchPhrase('');
    clearEmojiTonesData();
  }, [props.open]);
  const renderList = React.useMemo(() => {
    const emojisByCategory = props.emojisByCategory || _KeyboardContext.defaultKeyboardContext.emojisByCategory;
    let data = emojisByCategory.filter(category => {
      const title = category.title;
      if (props.disabledCategories) return !props.disabledCategories.includes(title);
      return true;
    });
    if (keyboardState.recentlyUsed.length && props.enableRecentlyUsed) {
      data.push({
        title: 'recently_used',
        data: keyboardState.recentlyUsed
      });
    }
    if (props.enableSearchBar) {
      data.push({
        title: 'search',
        data: emojisByCategory.map(group => group.data).flat().filter(emoji => {
          if (searchPhrase.length < 2) return false;
          const isInKeywords = emoji?.keywords && emoji.keywords.length > 0 && emoji.keywords.some(keyword => keyword.toLowerCase().includes(searchPhrase.toLowerCase()));
          return emoji.name.toLowerCase().includes(searchPhrase.toLowerCase()) || emoji.emoji.toLowerCase().includes(searchPhrase) || isInKeywords;
        })
      });
    }
    if (props.categoryOrder) {
      const orderedData = props.categoryOrder.flatMap(name => data.filter(el => el.title === name));
      const restData = data.filter(el => !props?.categoryOrder?.includes(el.title));
      data = [...orderedData, ...restData];
    }
    return data;
  }, [props.emojisByCategory, props.enableRecentlyUsed, props.enableSearchBar, props.categoryOrder, props.disabledCategories, keyboardState.recentlyUsed, searchPhrase]);
  const value = React.useMemo(() => ({
    ..._KeyboardContext.defaultKeyboardContext,
    ..._KeyboardContext.defaultKeyboardValues,
    ...props,
    theme: props.theme ? (0, _deepMerge.deepMerge)(_KeyboardContext.defaultTheme, props.theme) : _KeyboardContext.defaultTheme,
    styles: props.styles ? (0, _deepMerge.deepMerge)(_KeyboardContext.emptyStyles, props.styles) : _KeyboardContext.emptyStyles,
    activeCategoryIndex,
    setActiveCategoryIndex,
    numberOfColumns: numberOfColumns.current,
    width,
    setWidth,
    searchPhrase,
    setSearchPhrase,
    renderList,
    clearEmojiTonesData,
    generateEmojiTones,
    emojiTonesData,
    shouldAnimateScroll,
    setShouldAnimateScroll,
    minimalEmojisAmountToDisplay
  }), [activeCategoryIndex, emojiTonesData, generateEmojiTones, props, renderList, searchPhrase, shouldAnimateScroll, width, minimalEmojisAmountToDisplay]);
  return /*#__PURE__*/React.createElement(_KeyboardContext.KeyboardContext.Provider, {
    value: value
  }, props.children);
});
exports.KeyboardProvider = KeyboardProvider;
KeyboardProvider.displayName = 'KeyboardProvider';
//# sourceMappingURL=KeyboardProvider.js.map