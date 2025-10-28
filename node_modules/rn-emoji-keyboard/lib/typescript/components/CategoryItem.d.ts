import * as React from 'react';
import type { CategoryNavigationItem } from '../types';
type CategoryItemProps = {
    item: CategoryNavigationItem;
    index: number;
    handleScrollToCategory: (index: number) => void;
};
export declare const CategoryItem: ({ item, index, handleScrollToCategory }: CategoryItemProps) => React.JSX.Element;
export {};
//# sourceMappingURL=CategoryItem.d.ts.map