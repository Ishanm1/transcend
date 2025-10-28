import { useEffect } from 'react';
import { keyboardStateListeners, useKeyboardStore } from '../store/useKeyboardStore';
export const useRecentPicksPersistence = config => {
  useEffect(() => {
    const onChangeWrapper = nextState => {
      config.onStateChange(nextState.recentlyUsed);
    };
    const initialize = async () => {
      try {
        const persistedState = (await config.initialization()) || [];
        useKeyboardStore.setKeyboardState({
          type: 'RECENT_EMOJI_INIT',
          payload: persistedState
        });
      } catch (e) {
        console.error('there was a problem with initialization of rn-emoji-keyboard recent picks');
        console.error(e);
      }
    };
    initialize().then(() => {
      keyboardStateListeners.add(onChangeWrapper);
    });
    return () => {
      keyboardStateListeners.delete(onChangeWrapper);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
//# sourceMappingURL=useRecentPicksPersistence.js.map