import * as React from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import type { CategoryTranslation, EmojiType, CategoryTypes, CategoryPosition, EmojisByCategory, JsonEmoji, EmojiTonesData, EmojiSizes } from '../types';
import type { RecursivePartial } from '../utils/deepMerge';
export type OnEmojiSelected = (emoji: EmojiType) => void;
export type Styles = {
    container: ViewStyle;
    header: TextStyle;
    knob: ViewStyle;
    category: {
        container: ViewStyle;
        icon: TextStyle;
    };
    searchBar: {
        container: ViewStyle;
        text: TextStyle;
    };
    emoji: {
        selected: ViewStyle;
    };
};
export type Theme = {
    backdrop: string;
    knob: string;
    container: string;
    header: string;
    skinTonesContainer: string;
    category: {
        icon: string;
        iconActive: string;
        container: string;
        containerActive: string;
    };
    search: {
        background: string;
        text: string;
        placeholder: string;
        icon: string;
    };
    customButton: {
        icon: string;
        iconPressed: string;
        background: string;
        backgroundPressed: string;
    };
    emoji: {
        selected: string;
    };
};
export type KeyboardProps = {
    open: boolean;
    onClose: () => void;
    onEmojiSelected: OnEmojiSelected;
    emojiSize?: number;
    expandable?: boolean;
    hideHeader?: boolean;
    defaultHeight?: number | string;
    expandedHeight?: number | string;
    onCategoryChangeFailed?: (info: {
        index: number;
        highestMeasuredFrameIndex: number;
        averageItemLength: number;
    }) => void;
    translation?: CategoryTranslation;
    disabledCategories?: CategoryTypes[];
    enableRecentlyUsed?: boolean;
    categoryPosition?: CategoryPosition;
    enableSearchBar?: boolean;
    hideSearchBarClearIcon?: boolean;
    customButtons?: React.ReactNode;
    categoryOrder?: CategoryTypes[];
    onRequestClose?: () => void;
    disableSafeArea?: boolean;
    allowMultipleSelections?: boolean;
    theme?: RecursivePartial<Theme>;
    styles?: RecursivePartial<Styles>;
    enableSearchAnimation?: boolean;
    enableCategoryChangeAnimation?: boolean;
    selectedEmojis?: string[] | false;
    enableCategoryChangeGesture?: boolean;
    emojisByCategory?: EmojisByCategory[];
};
export type ContextValues = {
    activeCategoryIndex: number;
    setActiveCategoryIndex: (index: number) => void;
    numberOfColumns: number;
    width: number;
    setWidth: (width: number) => void;
    searchPhrase: string;
    setSearchPhrase: (phrase: string) => void;
    renderList: EmojisByCategory[];
    isToneSelectorOpened: boolean;
    clearEmojiTonesData: () => void;
    generateEmojiTones: (emoji: JsonEmoji, emojiIndex: number, emojiSizes: EmojiSizes) => void;
    emojiTonesData: EmojiTonesData;
    shouldAnimateScroll: boolean;
    setShouldAnimateScroll: (value: boolean) => void;
    minimalEmojisAmountToDisplay: number;
};
export declare const emptyStyles: Styles;
export declare const defaultTheme: Theme;
export declare const defaultKeyboardContext: Required<KeyboardProps> & {
    theme: Theme;
    styles: Styles;
};
export declare const defaultKeyboardValues: ContextValues;
export declare const KeyboardContext: React.Context<Required<KeyboardProps> & ContextValues & {
    theme: Theme;
    styles: Styles;
}>;
//# sourceMappingURL=KeyboardContext.d.ts.map