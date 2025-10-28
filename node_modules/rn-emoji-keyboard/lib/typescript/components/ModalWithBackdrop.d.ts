import * as React from 'react';
import { type ModalProps } from 'react-native';
type ModalWithBackdropProps = {
    isOpen: boolean;
    backdropPress: () => void;
    children: React.ReactNode;
};
export declare const ModalWithBackdrop: ({ isOpen, backdropPress, children, ...rest }: ModalWithBackdropProps & ModalProps) => React.JSX.Element;
export {};
//# sourceMappingURL=ModalWithBackdrop.d.ts.map