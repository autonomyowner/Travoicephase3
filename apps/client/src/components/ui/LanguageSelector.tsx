'use client';

import React, { SelectHTMLAttributes, forwardRef } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
] as const;

type LanguageCode = typeof LANGUAGES[number]['code'];

interface LanguageSelectorProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
  error?: string;
  hint?: string;
}

export const LanguageSelector = forwardRef<HTMLSelectElement, LanguageSelectorProps>(
  ({ label, value, onChange, error, hint, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="matcha-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value as LanguageCode)}
          className={`
            matcha-input
            cursor-pointer
            appearance-none
            bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
            bg-no-repeat
            bg-[right_0.75rem_center]
            bg-[length:1rem]
            pr-10
            ${error ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''}
            ${className}
          `}
          {...props}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

LanguageSelector.displayName = 'LanguageSelector';

// Export language data for use elsewhere
export { LANGUAGES };
export type { LanguageCode };
