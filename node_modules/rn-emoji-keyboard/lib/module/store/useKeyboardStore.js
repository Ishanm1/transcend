import { useEffect, useState } from 'react';
import keyboardReducer from './reducers';
let globalKeyboardState = {
  recentlyUsed: []
};
export const keyboardStateListeners = new Set();
const setKeyboardState = action => {
  globalKeyboardState = keyboardReducer(globalKeyboardState, action);
  keyboardStateListeners.forEach(listener => listener(globalKeyboardState));
};
export const useKeyboardStore = () => {
  const [keyboardState, setState] = useState(globalKeyboardState);
  useEffect(() => {
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
useKeyboardStore.setKeyboardState = setKeyboardState;
//# sourceMappingURL=useKeyboardStore.js.map