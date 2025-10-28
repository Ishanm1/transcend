"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepMerge = void 0;
const deepMerge = (source, additional) => {
  const result = {
    ...source
  };
  Object.keys(additional).forEach(key => {
    if (key in source && key in additional && typeof source[key] === 'object' && typeof additional[key] === 'object') {
      result[key] = deepMerge(source[key], additional[key]);
    } else {
      if (typeof source[key] === 'object' && additional[key] === undefined) return;
      result[key] = additional[key];
    }
  });
  return result;
};
exports.deepMerge = deepMerge;
//# sourceMappingURL=deepMerge.js.map