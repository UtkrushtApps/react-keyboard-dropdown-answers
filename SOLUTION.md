# Solution Steps

1. Create a new directory src/components/Dropdown/.

2. Implement Dropdown.js: Build the Dropdown component supporting controlled/uncontrolled, multi/single selection, keyboard and ARIA, positioning, and reused children.

3. Implement useDropdownPosition.js: A custom hook that computes dropdown menu position relative to the button and prevents viewport overflow.

4. Implement useOnClickOutside.js: A custom hook that closes the dropdown when clicking outside of it (supporting multiple refs as inside).

5. Add Dropdown.css for styling and focus/hover/active visible states, as well as accessibility cues.

6. In Dropdown.js, glue everything together: handle keyboard navigation, ARIA, click outside, and option highlighting, and connect custom hooks for positioning and outside click.

7. Add propTypes for robust, reusable API and testing-friendliness.

8. Test the component by rendering with various controlled/uncontrolled, single/multi, and custom renderOption scenarios and ensure full keyboard support works.

