import React, { type ReactNode } from 'react';
import { type ViewProps } from 'react-native';
type ConditionalContainerTypes = {
    children: ReactNode;
    container: (children: ReactNode) => ReactNode;
    condition: boolean;
};
export declare const ConditionalContainer: ({ children, container, condition, }: ConditionalContainerTypes) => React.JSX.Element;
type IsSafeAreaWrapperProps = {
    children: ReactNode;
    isSafeArea: boolean;
} & ViewProps;
export declare const IsSafeAreaWrapper: ({ children, isSafeArea, ...props }: IsSafeAreaWrapperProps) => React.JSX.Element;
export {};
//# sourceMappingURL=ConditionalContainer.d.ts.map