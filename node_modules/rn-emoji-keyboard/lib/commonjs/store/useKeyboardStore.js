"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useKeyboardStore = exports.keyboardStateListeners = void 0;
var _react = require("react");
var _reducers = _interopRequireDefault(require("./reducers"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let globalKeyboardState = {
  recentlyUsed: []
};
const keyboardStateListeners = new Set();
exports.keyboardStateListeners = keyboardStateListeners;
const setKeyboardState = action => {
  globalKeyboardState = (0, _reducers.default)(globalKeyboardState, action);
  keyboardStateListeners.forEach(listener => listener(globalKeyboardState));
};
const useKeyboardStore = () => {
  const [keyboardState, setState] = (0, _react.useState)(globalKeyboardState);
  (0, _react.useEffect)(() => {
    const listener = () => setState(globalKeyboardState);
    keyboardStateListeners.add(listener);
    return () => {
      keyboardStateListeners.delete(listener);
    };
  }, [keyboardState]);
  return {
    keyboardState,
    setKeyboardState
  };
};
exports.useKeyboardStore = useKeyboardStore;
useKeyboardStore.setKeyboardState = setKeyboardState;
//# sourceMappingURL=useKeyboardStore.js.map