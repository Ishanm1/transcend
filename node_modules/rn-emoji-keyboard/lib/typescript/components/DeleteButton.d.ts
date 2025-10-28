import React from 'react';
import { type StyleProp, type ViewStyle, type PressableProps } from 'react-native';
type CustomButtonType = {
    containerStyle?: StyleProp<ViewStyle>;
    iconNormalColor?: string;
    iconActiveColor?: string;
} & PressableProps;
export declare const DeleteButton: ({ containerStyle, iconNormalColor, iconActiveColor, ...pressableProps }: CustomButtonType) => React.JSX.Element;
export {};
//# sourceMappingURL=DeleteButton.d.ts.map