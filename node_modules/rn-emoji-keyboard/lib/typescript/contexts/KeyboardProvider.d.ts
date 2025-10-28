import * as React from 'react';
import { type KeyboardProps } from './KeyboardContext';
type ProviderProps = Partial<KeyboardProps> & Pick<KeyboardProps, 'onEmojiSelected'> & {
    children: React.ReactNode;
};
export declare const KeyboardProvider: React.FC<ProviderProps>;
export {};
//# sourceMappingURL=KeyboardProvider.d.ts.map