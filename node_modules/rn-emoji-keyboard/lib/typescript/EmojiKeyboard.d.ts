import * as React from 'react';
import type { KeyboardProps } from './contexts/KeyboardContext';
type EmojiKeyboardProps = Omit<Partial<KeyboardProps>, 'open' | 'onClose'> & Pick<KeyboardProps, 'onEmojiSelected'>;
export declare const EmojiKeyboard: (props: EmojiKeyboardProps) => React.JSX.Element;
export {};
//# sourceMappingURL=EmojiKeyboard.d.ts.map