import type { JsonEmoji } from 'src/types';
export type RecentEmojiState = {
    recentlyUsed: JsonEmoji[];
};
export type RecentEmojiAction = {
    type: 'RECENT_EMOJI_INIT';
    payload: JsonEmoji[];
} | {
    type: 'RECENT_EMOJI_ADD';
    payload: JsonEmoji;
} | {
    type: 'RECENT_EMOJI_REMOVE';
    payload: JsonEmoji;
} | {
    type: 'RECENT_EMOJI_CLEAR';
};
export default function recentEmojiReducer(state: RecentEmojiState, action: RecentEmojiAction): RecentEmojiState;
//# sourceMappingURL=RecentEmojiReducer.d.ts.map