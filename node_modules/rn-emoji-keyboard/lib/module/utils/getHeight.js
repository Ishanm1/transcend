export const getHeight = (value, screenHeight) => typeof value === 'number' ? value : screenHeight / 100 * parseInt(value.replace('%', ''), 10);
//# sourceMappingURL=getHeight.js.map