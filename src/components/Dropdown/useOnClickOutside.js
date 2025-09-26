import { useEffect } from 'react';

/**
 * Calls handler if a click outside the node (or an array of refs) happens.
 * @param {object} ref - The dropdown menu ref
 * @param {function} handler - callback when click outside
 * @param {boolean} active - Whether the outside listener is enabled
 * @param {Array<ref>} extraRefs - Extra refs that also count as inside
 */
function useOnClickOutside(ref, handler, active, extraRefs = []) {
  useEffect(() => {
    if (!active) return;
    function listener(e) {
      const elements = [ref.current, ...extraRefs.map(r => r && r.current).filter(Boolean)];
      if (!elements.some(el => el && el.contains(e.target))) {
        handler(e);
      }
    }
    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);
    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
    };
  }, [ref, handler, active, extraRefs]);
}

export default useOnClickOutside;
