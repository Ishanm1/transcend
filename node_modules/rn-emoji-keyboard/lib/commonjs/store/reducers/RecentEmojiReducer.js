"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = recentEmojiReducer;
function recentEmojiReducer(state, action) {
  switch (action.type) {
    case 'RECENT_EMOJI_INIT':
      return {
        ...state,
        recentlyUsed: action.payload
      };
    case 'RECENT_EMOJI_ADD':
      return {
        ...state,
        recentlyUsed: [action.payload, ...filterEmoji(state, action.payload)]
      };
    case 'RECENT_EMOJI_REMOVE':
      return {
        ...state,
        recentlyUsed: filterEmoji(state, action.payload)
      };
    case 'RECENT_EMOJI_CLEAR':
      return {
        ...state,
        recentlyUsed: []
      };
    default:
      return state;
  }
}
const filterEmoji = (state, emoji) => state.recentlyUsed.filter(usedEmoji => usedEmoji.name !== emoji.name);
//# sourceMappingURL=RecentEmojiReducer.js.map