import { useEffect, useState } from 'react';

// Helper: get viewport dimensions
const getViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});
/**
 * Hook to compute menu positioning below the button, adjusting for overflows.
 * Returns a style object to apply to the dropdown menu, and the position name.
 * @param {ref} buttonRef
 * @param {ref} menuRef
 * @param {boolean} open
 * @returns {Object}
 */
function useDropdownPosition(buttonRef, menuRef, open) {
  const [style, setStyle] = useState({ visibility: 'hidden' });
  const [position, setPosition] = useState('bottom');

  useEffect(() => {
    if (!open) {
      setStyle({ visibility: 'hidden' });
      return;
    }
    function updatePosition() {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button || !menu) return;
      const buttonRect = button.getBoundingClientRect();
      // For fixed-position menu relative to viewport
      const menuRect = menu.getBoundingClientRect();
      const viewport = getViewport();
      // Compute vertical position
      let top = buttonRect.bottom;
      let left = buttonRect.left;
      let pos = 'bottom';
      // If menu would overflow bottom, open upwards if possible
      if (top + menuRect.height > viewport.height && buttonRect.top > menuRect.height + 8) {
        top = buttonRect.top - menuRect.height;
        pos = 'top';
      }
      // If menu too wide, adjust left
      let adjustedLeft = left;
      if (left + menuRect.width > viewport.width) {
        adjustedLeft = Math.max(
          8,
          viewport.width - menuRect.width - 8
        );
      }
      setStyle({
        position: 'fixed',
        zIndex: 1000,
        top: Math.round(top),
        left: Math.round(adjustedLeft),
        minWidth: Math.max(buttonRect.width, 160),
        visibility: 'visible',
      });
      setPosition(pos);
    }
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [buttonRef, menuRef, open]);

  return { style, position };
}

export default useDropdownPosition;
