import type { KeyboardAction, KeyboardState } from './reducers';
type KeyboardStateSetter = (nextState: Readonly<KeyboardState>) => void;
export declare const keyboardStateListeners: Set<KeyboardStateSetter>;
export declare const useKeyboardStore: {
    (): {
        keyboardState: import("./reducers/RecentEmojiReducer").RecentEmojiState;
        setKeyboardState: (action: KeyboardAction) => void;
    };
    setKeyboardState: (action: KeyboardAction) => void;
};
export {};
//# sourceMappingURL=useKeyboardStore.d.ts.map