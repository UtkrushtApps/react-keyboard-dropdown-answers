import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import useDropdownPosition from './useDropdownPosition';
import useOnClickOutside from './useOnClickOutside';
import './Dropdown.css';

/**
 * Helper to check equality for value(s).
 * @param {*} v1
 * @param {*} v2
 * @param {boolean} multi
 */
const valueEquals = (v1, v2, multi) => {
  if (!multi) return v1 === v2;
  if (!Array.isArray(v1) || !Array.isArray(v2)) return false;
  if (v1.length !== v2.length) return false;
  // Assume primitives
  return v1.every((v) => v2.includes(v));
};

function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  multi = false,
  disabled = false,
  placeholder = 'Select...',
  renderOption, // function(option, selected)
  renderValue, // function(selectedOption or [options])
  label,
  id,
  menuClassName = '',
  buttonClassName = '',
  listBoxClassName = '',
  ...rest
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  // Controlled/uncontrolled logic
  const isControlled = value != null;
  const [internalValue, setInternalValue] = useState(
    () => defaultValue ?? (multi ? [] : null)
  );
  const selectedValue = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  // For keyboard navigation:
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  // Option value-to-index map for fast lookups
  const value2idx = useMemo(() =>
    options.reduce((map, o, i) => { map[o.value] = i; return map; }, {}),
    [options]
  );

  // Positioning
  const { style: menuStyle, position } = useDropdownPosition(
    buttonRef,
    menuRef,
    open
  );

  useOnClickOutside(menuRef, () => setOpen(false), open, [buttonRef]);

  // Adjust highlightedIdx when menu opens
  useEffect(() => {
    if (open) {
      if (!multi && selectedValue != null && value2idx[selectedValue] != null) {
        setHighlightedIdx(value2idx[selectedValue]);
      } else {
        setHighlightedIdx(0);
      }
    } else {
      setHighlightedIdx(-1);
    }
  }, [open, selectedValue, multi, value2idx]);

  // Option selection logic
  const isSelected = useCallback(
    (optVal) => {
      if (!multi) return selectedValue === optVal;
      return Array.isArray(selectedValue) && selectedValue.includes(optVal);
    },
    [multi, selectedValue]
  );

  const handleSelect = useCallback(
    (option) => {
      if (disabled) return;
      if (multi) {
        const oldVals = Array.isArray(selectedValue) ? selectedValue : [];
        let newVals;
        if (oldVals.includes(option.value)) {
          newVals = oldVals.filter((v) => v !== option.value);
        } else {
          newVals = [...oldVals, option.value];
        }
        if (!isControlled) setInternalValue(newVals);
        if (onChange) onChange(newVals);
      } else {
        if (!isControlled) setInternalValue(option.value);
        if (onChange) onChange(option.value);
        setOpen(false);
      }
    },
    [disabled, multi, selectedValue, isControlled, onChange]
  );

  // Keyboard support
  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          setOpen(true);
          e.preventDefault();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          setHighlightedIdx((idx) => (idx + 1) % options.length);
          e.preventDefault();
          break;
        case 'ArrowUp':
          setHighlightedIdx((idx) =>
            idx <= 0 ? options.length - 1 : idx - 1
          );
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          if (highlightedIdx >= 0 && options[highlightedIdx]) {
            handleSelect(options[highlightedIdx]);
            e.preventDefault();
          }
          break;
        case 'Escape':
          setOpen(false);
          e.preventDefault();
          break;
        case 'Tab':
          setOpen(false);
          break;
        default:
          break;
      }
    },
    [open, disabled, highlightedIdx, options, handleSelect]
  );

  // ARIA ids
  const dropdownId = id || `dropdown-${Math.random().toString(36).slice(2, 10)}`;
  const listboxId = `${dropdownId}-listbox`;

  // Accessibility helpers
  const getA11ySelectedLabel = () => {
    if (!selectedValue || (multi && (!selectedValue.length))) {
      return placeholder;
    }
    if (!multi) {
      const sel = options.find((o) => o.value === selectedValue);
      return sel ? sel.label : placeholder;
    } else {
      return options
        .filter((o) => selectedValue.includes(o.value))
        .map((o) => o.label)
        .join(', ') || placeholder;
    }
  };

  // Render selected value(s)
  const renderedValue = useMemo(() => {
    if (renderValue) {
      if (!multi) {
        return renderValue(
          options.find((o) => o.value === selectedValue) || null
        );
      } else {
        return renderValue(
          options.filter((o) => selectedValue?.includes(o.value))
        );
      }
    }
    return getA11ySelectedLabel();
  }, [renderValue, selectedValue, multi, options]);

  // Each menu item ref for keyboard focus
  const optionRefs = useRef([]);
  useEffect(() => {
    if (open && highlightedIdx >= 0 && optionRefs.current[highlightedIdx]) {
      optionRefs.current[highlightedIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIdx, open]);

  return (
    <div className="dropdown-container" {...rest}>
      {label ? (
        <label htmlFor={dropdownId} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        id={dropdownId}
        ref={buttonRef}
        className={
          'dropdown-trigger' +
          (buttonClassName ? ' ' + buttonClassName : '') +
          (disabled ? ' dropdown-trigger--disabled' : '')
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        tabIndex={0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        data-testid="dropdown-trigger"
      >
        <span className="dropdown-value">{renderedValue}</span>
        <span aria-hidden className="dropdown-arrow">▼</span>
      </button>
      {open && (
        <ul
          className={
            'dropdown-menu' + (menuClassName ? ' ' + menuClassName : '') +
            (listBoxClassName ? ' ' + listBoxClassName : '')
          }
          style={menuStyle}
          ref={menuRef}
          role="listbox"
          id={listboxId}
          aria-labelledby={dropdownId}
          tabIndex={-1}
          data-testid="dropdown-menu"
        >
          {options.map((opt, i) => {
            const selected = isSelected(opt.value);
            const OptionComp = renderOption
              ? renderOption(opt, selected)
              : (
                <>
                  {multi && (
                    <input
                      type="checkbox"
                      tabIndex={-1}
                      checked={selected}
                      readOnly
                      aria-hidden
                      className="dropdown-checkbox"
                    />
                  )}
                  <span>{opt.label}</span>
                </>
              );
            return (
              <li
                key={opt.value}
                ref={el => optionRefs.current[i] = el}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                className={
                  'dropdown-option' +
                  (selected ? ' dropdown-option--selected' : '') +
                  (i === highlightedIdx ? ' dropdown-option--highlighted' : '')
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt);
                }}
                onMouseEnter={() => setHighlightedIdx(i)}
                data-testid={`dropdown-option-${i}`}
              >
                {OptionComp}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  /** Array of options: { label, value } */
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.node.isRequired, value: PropTypes.any.isRequired })
  ).isRequired,
  /** Controlled value (single: value, multi: array of values) */
  value: PropTypes.any,
  /** Default value for uncontrolled mode */
  defaultValue: PropTypes.any,
  /** onChange handler (single: value, multi: values array) */
  onChange: PropTypes.func,
  /** Enable multi-select mode */
  multi: PropTypes.bool,
  /** Disable the dropdown */
  disabled: PropTypes.bool,
  /** Custom option render: (option, selected) => ReactNode */
  renderOption: PropTypes.func,
  /** Custom value render: (selectedOption(s)) => ReactNode */
  renderValue: PropTypes.func,
  label: PropTypes.node,
  id: PropTypes.string,
  placeholder: PropTypes.node,
  menuClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  listBoxClassName: PropTypes.string,
};

export default Dropdown;
