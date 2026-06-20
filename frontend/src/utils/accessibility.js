/**
 * Accessibility utilities for WCAG 2.1 compliance
 */

/**
 * Generate unique ID for form inputs
 */
export const generateId = (() => {
  let counter = 0;
  return (prefix = 'id') => `${prefix}-${++counter}`;
})();

/**
 * Keyboard event helpers
 */
export const Keys = {
  Enter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  Space: ' ',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
};

/**
 * Check if a key event is a specific key
 */
export const isKey = (event, key) => {
  return event.key === key || event.code === key;
};

/**
 * Create a skip link for keyboard navigation
 */
export const SkipLink = ({ href = '#main-content', label = 'Skip to main content' }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white"
  >
    {label}
  </a>
);

/**
 * Focus trap for modals/dialogs
 */
export function useFocusTrap(ref) {
  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;

    const focusableElements = ref.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };

  return { handleKeyDown };
}

/**
 * Color contrast utilities
 */
export const contrast = {
  /**
   * Check if text color has sufficient contrast ratio with background
   * WCAG AA: 4.5:1 for normal text, 3:1 for large text
   * WCAG AAA: 7:1 for normal text, 4.5:1 for large text
   */
  getContrastRatio: (foreground, background) => {
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  isAACompliant: (ratio) => ratio >= 4.5,
  isAAACompliant: (ratio) => ratio >= 7,
};

/**
 * Calculate relative luminance
 */
function getLuminance(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map(x => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Announce messages to screen readers
 */
export const announceToScreenReader = (message, politeness = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
};

/**
 * Check if element is visible (not display:none, not visibility:hidden)
 */
export const isElementVisible = (element) => {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
};

/**
 * Debounce function for keyboard input
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get accessible label for form field
 */
export const getAriaLabel = (label, required = false, error = null) => {
  let ariaLabel = label || '';
  if (required) ariaLabel += ', required';
  if (error) ariaLabel += `, error: ${error}`;
  return ariaLabel;
};

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const isResponsive = (breakpoint) => {
  return typeof window !== 'undefined' &&
    window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`).matches;
};
