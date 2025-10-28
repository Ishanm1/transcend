"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseEmoji = void 0;
const parseEmoji = emoji => ({
  name: emoji.name,
  emoji: emoji.emoji,
  unicode_version: emoji.v,
  slug: emoji?.name?.replace(/ /g, '_'),
  toneEnabled: emoji.toneEnabled
});
exports.parseEmoji = parseEmoji;
//# sourceMappingURL=parseEmoji.js.map