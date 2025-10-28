import * as React from 'react';
import { type ViewStyle, type StyleProp } from 'react-native';
import type { EmojiSizes, JsonEmoji } from '../types';
type Props = {
    item: JsonEmoji;
    emojiSize: number;
    index: number;
    onPress: (emoji: JsonEmoji) => void;
    onLongPress: (emoji: JsonEmoji, emojiIndex: number, emojiSizes: EmojiSizes) => void;
    selectedEmojiStyle?: StyleProp<ViewStyle>;
    isSelected?: boolean;
};
export declare const SingleEmoji: React.MemoExoticComponent<(p: Props) => React.JSX.Element>;
export {};
//# sourceMappingURL=SingleEmoji.d.ts.map