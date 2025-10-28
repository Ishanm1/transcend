"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojiCategory = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _types = require("../types");
var _SingleEmoji = require("./SingleEmoji");
var _KeyboardContext = require("../contexts/KeyboardContext");
var _useKeyboardStore = require("../store/useKeyboardStore");
var _parseEmoji = require("../utils/parseEmoji");
var _skinToneSelectorUtils = require("../utils/skinToneSelectorUtils");
var _useKeyboard = require("../hooks/useKeyboard");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const emptyEmoji = {
  emoji: '',
  name: 'blank emoji',
  v: '0',
  toneEnabled: false
};
const ListFooterComponent = _ref => {
  let {
    categoryPosition
  } = _ref;
  return /*#__PURE__*/React.createElement(_reactNative.View, {
    style: categoryPosition === 'floating' ? styles.footerFloating : styles.footer
  });
};
const EmojiCategory = /*#__PURE__*/React.memo(_ref2 => {
  let {
    item: {
      title,
      data
    },
    setKeyboardScrollOffsetY,
    activeCategoryIndex
  } = _ref2;
  const {
    onEmojiSelected,
    emojiSize,
    numberOfColumns,
    width,
    hideHeader,
    translation,
    categoryPosition,
    clearEmojiTonesData,
    generateEmojiTones,
    theme,
    styles: themeStyles,
    selectedEmojis,
    minimalEmojisAmountToDisplay
  } = React.useContext(_KeyboardContext.KeyboardContext);
  const {
    keyboardHeight
  } = (0, _useKeyboard.useKeyboard)(true);
  const contentContainerStyle = {
    paddingBottom: keyboardHeight
  };
  const {
    setKeyboardState,
    keyboardState
  } = (0, _useKeyboardStore.useKeyboardStore)();
  const [empty, setEmpty] = React.useState([]);
  React.useEffect(() => {
    if (data.length % numberOfColumns) {
      const fillWithEmpty = new Array(numberOfColumns - data.length % numberOfColumns).fill(emptyEmoji);
      setEmpty(fillWithEmpty);
    }
  }, [numberOfColumns, data]);
  const handleEmojiPress = React.useCallback(emoji => {
    if (emoji.name === 'blank emoji') return;
    clearEmojiTonesData();
    const parsedEmoji = (0, _parseEmoji.parseEmoji)(emoji);
    setKeyboardState({
      type: 'RECENT_EMOJI_ADD',
      payload: emoji
    });
    if (Array.isArray(selectedEmojis)) return onEmojiSelected({
      ...parsedEmoji,
      alreadySelected: selectedEmojis.includes(emoji.name)
    });
    onEmojiSelected(parsedEmoji);
  }, [selectedEmojis, onEmojiSelected, setKeyboardState, clearEmojiTonesData]);
  const handleEmojiLongPress = React.useCallback((emoji, emojiIndex, emojiSizes) => {
    clearEmojiTonesData();
    const emojiWithoutTone = {
      ...emoji,
      emoji: (0, _skinToneSelectorUtils.removeSkinToneModifier)(emoji.emoji)
    };
    generateEmojiTones(emojiWithoutTone, emojiIndex, emojiSizes);
  }, [clearEmojiTonesData, generateEmojiTones]);
  const renderItem = React.useCallback(props => {
    const recentlyUsed = keyboardState?.recentlyUsed || [];
    const recentlyUsedEmoji = recentlyUsed?.find(emoji => emoji.name === props.item.name);
    const isSelected = selectedEmojis && selectedEmojis.includes(props.item.name);
    return /*#__PURE__*/React.createElement(_SingleEmoji.SingleEmoji, _extends({}, props, {
      isSelected: isSelected,
      item: recentlyUsedEmoji || props.item,
      emojiSize: emojiSize,
      onPress: handleEmojiPress,
      onLongPress: handleEmojiLongPress,
      selectedEmojiStyle: isSelected ? [styles.selectedEmoji, {
        backgroundColor: theme.emoji.selected
      }, themeStyles.emoji.selected] : {}
    }));
  }, [keyboardState?.recentlyUsed, selectedEmojis, emojiSize, handleEmojiPress, handleEmojiLongPress, theme.emoji.selected, themeStyles.emoji.selected]);
  const handleOnScroll = ev => {
    setKeyboardScrollOffsetY(ev.nativeEvent.contentOffset.y);
    clearEmojiTonesData();
  };
  const keyExtractor = React.useCallback(item => item.name, []);
  const [maxIndex, setMaxIndex] = React.useState(0);

  // with InteractionManager we can show emojis after interaction is finished
  // It helps with delay during category change animation
  _reactNative.InteractionManager.runAfterInteractions(() => {
    if (maxIndex === 0 && data.length) {
      setMaxIndex(minimalEmojisAmountToDisplay);
    }
  });
  const onEndReached = () => {
    if (maxIndex <= data.length) {
      setMaxIndex(data.length);
    }
  };
  React.useEffect(() => {
    if (_types.CATEGORIES[activeCategoryIndex] !== title) {
      setMaxIndex(0);
    }
  }, [activeCategoryIndex, title]);
  const flatListData = data.slice(0, maxIndex);
  return /*#__PURE__*/React.createElement(_reactNative.View, {
    style: [styles.container, {
      width
    }]
  }, !hideHeader && /*#__PURE__*/React.createElement(_reactNative.Text, {
    style: [styles.sectionTitle, themeStyles.header, {
      color: theme.header
    }]
  }, translation[title]), flatListData.length === 0 ? null : /*#__PURE__*/React.createElement(_reactNative.FlatList, {
    data: [...flatListData, ...empty],
    onEndReached: onEndReached,
    onEndReachedThreshold: 0.3,
    keyExtractor: keyExtractor,
    numColumns: numberOfColumns,
    renderItem: renderItem,
    onScroll: handleOnScroll,
    ListFooterComponent: /*#__PURE__*/React.createElement(ListFooterComponent, {
      categoryPosition: categoryPosition
    }),
    initialNumToRender: 10,
    windowSize: 16,
    maxToRenderPerBatch: 5,
    keyboardShouldPersistTaps: "handled",
    contentContainerStyle: contentContainerStyle,
    scrollEventThrottle: 16
  }));
}, (prevProps, nextProps) => {
  if (prevProps.activeCategoryIndex !== nextProps.activeCategoryIndex) return false;
  if (nextProps.item.title !== 'search') return true;
  if (prevProps.item.data.length !== nextProps.item.data.length) return false;
  return prevProps.item.data.map(d => d.name).join() === nextProps.item.data.map(d => d.name).join();
});
exports.EmojiCategory = EmojiCategory;
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 6
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 12
  },
  footer: {
    height: 8
  },
  footerFloating: {
    height: 70
  },
  selectedEmoji: {
    borderRadius: 25
  }
});
//# sourceMappingURL=EmojiCategory.js.map