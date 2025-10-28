"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTimeout = void 0;
var _react = require("react");
const useTimeout = () => {
  const timeoutRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return (0, _react.useCallback)((callback, time) => {
    timeoutRef.current = setTimeout(callback, time);
  }, []);
};
exports.useTimeout = useTimeout;
//# sourceMappingURL=useTimeout.js.map