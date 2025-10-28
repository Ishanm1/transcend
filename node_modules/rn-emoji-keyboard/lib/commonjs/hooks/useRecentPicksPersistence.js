"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRecentPicksPersistence = void 0;
var _react = require("react");
var _useKeyboardStore = require("../store/useKeyboardStore");
const useRecentPicksPersistence = config => {
  (0, _react.useEffect)(() => {
    const onChangeWrapper = nextState => {
      config.onStateChange(nextState.recentlyUsed);
    };
    const initialize = async () => {
      try {
        const persistedState = (await config.initialization()) || [];
        _useKeyboardStore.useKeyboardStore.setKeyboardState({
          type: 'RECENT_EMOJI_INIT',
          payload: persistedState
        });
      } catch (e) {
        console.error('there was a problem with initialization of rn-emoji-keyboard recent picks');
        console.error(e);
      }
    };
    initialize().then(() => {
      _useKeyboardStore.keyboardStateListeners.add(onChangeWrapper);
    });
    return () => {
      _useKeyboardStore.keyboardStateListeners.delete(onChangeWrapper);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
exports.useRecentPicksPersistence = useRecentPicksPersistence;
//# sourceMappingURL=useRecentPicksPersistence.js.map