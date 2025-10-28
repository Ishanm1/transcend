"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHeight = void 0;
const getHeight = (value, screenHeight) => typeof value === 'number' ? value : screenHeight / 100 * parseInt(value.replace('%', ''), 10);
exports.getHeight = getHeight;
//# sourceMappingURL=getHeight.js.map