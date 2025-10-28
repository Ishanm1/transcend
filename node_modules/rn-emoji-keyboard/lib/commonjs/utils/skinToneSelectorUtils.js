"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zeroWidthJoiner = exports.variantSelector = exports.skinTones = exports.skinToneCodes = exports.removeSkinToneModifier = exports.insertAtCertainIndex = exports.generateToneSelectorPosition = exports.generateToneSelectorFunnelPosition = void 0;
var _SkinTones = require("../components/SkinTones");
const EMOJI_PADDING = 8;
const KEYBOARD_PADDING = 10;
const FUNNEL_HEIGHT = 7;
const sumOfPaddings = KEYBOARD_PADDING + EMOJI_PADDING;
const generateToneSelectorPosition = (numOfColumns, emojiIndex, windowWidth, emojiWidth, emojiHeight, extraSearchTop) => {
  // get column in the center to measure tone selector x position
  const halfOfColumns = numOfColumns / 2;
  const centerColumn = Number.isInteger(halfOfColumns) ? halfOfColumns - 1 : Math.floor(halfOfColumns);

  // emoji index in singleRow perspective based on emojiIndex in flatlist and numberOfColumns
  const emojiIndexInRow = emojiIndex % numOfColumns;

  // maximum x at which tone selector is fully visible on the screen
  const maxXPosition = windowWidth - _SkinTones.TONES_CONTAINER_WIDTH - sumOfPaddings * 2;

  // different x position for emojis before and after center column
  const x = emojiIndexInRow < centerColumn ? emojiIndexInRow * emojiWidth : maxXPosition;

  // current row number
  const rowNumber = emojiIndex / numOfColumns >= 1 ? Math.floor(emojiIndex / numOfColumns) : 0;

  // tone selector y based on emoji size and search input on the top
  const y = rowNumber * emojiHeight + extraSearchTop - FUNNEL_HEIGHT;
  const position = {
    x: emojiIndexInRow === 0 ? sumOfPaddings : x + sumOfPaddings,
    y
  };
  return position;
};
exports.generateToneSelectorPosition = generateToneSelectorPosition;
const generateToneSelectorFunnelPosition = (numOfColumns, emojiIndex, emojiWidth) => {
  const emojiIndexInRow = emojiIndex % numOfColumns;
  const funnelXPosition = emojiIndexInRow === 0 ? sumOfPaddings : emojiIndexInRow * emojiWidth + sumOfPaddings;
  return funnelXPosition;
};
exports.generateToneSelectorFunnelPosition = generateToneSelectorFunnelPosition;
const insertAtCertainIndex = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index)];
exports.insertAtCertainIndex = insertAtCertainIndex;
const zeroWidthJoiner = String.fromCodePoint(0x200d);
exports.zeroWidthJoiner = zeroWidthJoiner;
const variantSelector = String.fromCodePoint(0xfe0f);
exports.variantSelector = variantSelector;
const skinToneCodes = [String.fromCodePoint(0x1f3fb), String.fromCodePoint(0x1f3fc), String.fromCodePoint(0x1f3fe), String.fromCodePoint(0x1f3fd), String.fromCodePoint(0x1f3ff)];
exports.skinToneCodes = skinToneCodes;
const removeSkinToneModifier = emoji => {
  let emojiCopy = emoji;
  for (let i = 0; i < skinToneCodes.length; i++) {
    const skinTone = skinToneCodes[i];
    emojiCopy = skinTone ? emojiCopy.replace(skinTone, '') : emojiCopy;
  }
  return emojiCopy;
};
exports.removeSkinToneModifier = removeSkinToneModifier;
const skinTones = [{
  name: 'light_skin_tone',
  color: '🏻'
}, {
  name: 'medium_light_skin_tone',
  color: '🏼'
}, {
  name: 'medium_skin_tone',
  color: '🏽'
}, {
  name: 'medium_dark_skin_tone',
  color: '🏾'
}, {
  name: 'dark_skin_tone',
  color: '🏿'
}];
exports.skinTones = skinTones;
//# sourceMappingURL=skinToneSelectorUtils.js.map