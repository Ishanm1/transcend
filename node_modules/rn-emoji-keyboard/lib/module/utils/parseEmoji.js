export const parseEmoji = emoji => ({
  name: emoji.name,
  emoji: emoji.emoji,
  unicode_version: emoji.v,
  slug: emoji?.name?.replace(/ /g, '_'),
  toneEnabled: emoji.toneEnabled
});
//# sourceMappingURL=parseEmoji.js.map