export declare const CATEGORIES_NAVIGATION: readonly [{
    readonly icon: "Smile";
    readonly category: "smileys_emotion";
}, {
    readonly icon: "Users";
    readonly category: "people_body";
}, {
    readonly icon: "Trees";
    readonly category: "animals_nature";
}, {
    readonly icon: "Pizza";
    readonly category: "food_drink";
}, {
    readonly icon: "Plane";
    readonly category: "travel_places";
}, {
    readonly icon: "Football";
    readonly category: "activities";
}, {
    readonly icon: "Lightbulb";
    readonly category: "objects";
}, {
    readonly icon: "Ban";
    readonly category: "symbols";
}, {
    readonly icon: "Flag";
    readonly category: "flags";
}, {
    readonly icon: "Clock";
    readonly category: "recently_used";
}, {
    readonly icon: "Search";
    readonly category: "search";
}];
export type IconNames = (typeof CATEGORIES_NAVIGATION)[number]['icon'];
export type CategoryTypes = (typeof CATEGORIES_NAVIGATION)[number]['category'];
export declare const CATEGORIES: readonly CategoryTypes[];
export type JsonEmoji = {
    emoji: string;
    name: string;
    v: string;
    toneEnabled: boolean;
    keywords?: string[];
};
export type ToneSelectorEmoji = Omit<JsonEmoji, 'toneEnabled'> & {
    index: string;
};
export type EmojiType = {
    emoji: string;
    name: string;
    slug: string;
    unicode_version: string;
    toneEnabled: boolean;
    alreadySelected?: boolean;
};
export type CategoryPosition = 'floating' | 'top' | 'bottom';
export type CategoryNavigationItem = {
    icon: IconNames;
    category: CategoryTypes;
};
export type CategoryTranslation = {
    [key in CategoryTypes]: string;
};
export type EmojisByCategory = {
    title: CategoryTypes;
    data: JsonEmoji[];
};
export type EmojiTonesData = {
    emojis: ToneSelectorEmoji[];
    position: {
        x: number;
        y: number;
    };
    funnelXPosition: number;
} | null;
export type EmojiSizes = {
    width: number;
    height: number;
};
export type RecentPicksPersistenceConfig = {
    initialization: () => Promise<JsonEmoji[]>;
    onStateChange: (nextState: Readonly<JsonEmoji[]>) => void | Promise<void>;
};
//# sourceMappingURL=types.d.ts.map