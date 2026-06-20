import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Card from './Card';
import Button from './Button';
import { Settings, X } from 'lucide-react';

export default function AccessibilityPanel({ isOpen, onClose }) {
  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg overflow-y-auto z-50"
        role="dialog"
        aria-labelledby="accessibility-panel-title"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h2 id="accessibility-panel-title" className="text-lg font-semibold">
            Accessibility
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Close accessibility panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Section */}
          <Card title="Display" titleLevel="h3" variant="outline">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Dark Mode</label>
                <button
                  onClick={toggleTheme}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  role="switch"
                  aria-checked={theme === 'dark'}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white
                      transition-transform
                      ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Current theme: <strong>{theme}</strong>
              </p>
            </div>
          </Card>

          {/* Contrast Section */}
          <Card title="Contrast" titleLevel="h3" variant="outline">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">High Contrast</label>
                <button
                  onClick={toggleHighContrast}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    ${highContrast ? 'bg-blue-600' : 'bg-gray-300'}
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  role="switch"
                  aria-checked={highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white
                      transition-transform
                      ${highContrast ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                High contrast: <strong>{highContrast ? 'Enabled' : 'Disabled'}</strong>
              </p>
            </div>
          </Card>

          {/* Keyboard Navigation Section */}
          <Card title="Keyboard Navigation" titleLevel="h3" variant="outline">
            <ul className="space-y-2 text-sm">
              <li>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Tab</kbd>
                <span className="ml-2">Navigate between elements</span>
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd>
                <span className="ml-2">Activate buttons/links</span>
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Space</kbd>
                <span className="ml-2">Toggle checkboxes</span>
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                <span className="ml-2">Close dialogs</span>
              </li>
            </ul>
          </Card>

          {/* Screen Reader Section */}
          <Card title="Screen Readers" titleLevel="h3" variant="outline">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This application supports popular screen readers including NVDA, JAWS, and VoiceOver.
            </p>
          </Card>

          {/* Compliance Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Accessibility:</strong> This application aims to meet WCAG 2.1 Level AA standards.
              Please report any accessibility issues to our support team.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
