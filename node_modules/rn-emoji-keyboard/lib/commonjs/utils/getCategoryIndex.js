"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCategoryIndex = void 0;
var _types = require("../types");
const getCategoryIndex = (disabledCategory, category) => ({
  index: _types.CATEGORIES.filter(name => !disabledCategory.includes(name)).indexOf(category)
});
exports.getCategoryIndex = getCategoryIndex;
//# sourceMappingURL=getCategoryIndex.js.map