import * as React from 'react';
import { Animated } from 'react-native';
type KnobProps = {
    offsetY: Animated.Value;
    height: Animated.Value;
    onClose: () => void;
    setIsExpanded: (isExpanded: boolean) => void;
};
export declare const Knob: ({ offsetY, height, onClose, setIsExpanded }: KnobProps) => React.JSX.Element;
export {};
//# sourceMappingURL=Knob.d.ts.map