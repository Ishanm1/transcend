import { CATEGORIES } from '../types';
export const getCategoryIndex = (disabledCategory, category) => ({
  index: CATEGORIES.filter(name => !disabledCategory.includes(name)).indexOf(category)
});
//# sourceMappingURL=getCategoryIndex.js.map