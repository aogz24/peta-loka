'use client';

import React from 'react';
import PropTypes from 'prop-types';

export default function ModernField({ label, value, onChange, type = 'text', step, disabled = false, icon = null, placeholder = '', min, max }) {
  return (
    <div>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <div className="flex items-center gap-3">
          {icon ? <div className="flex-none w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-200">{icon}</div> : null}

          <div className="flex-1">
            <input
              aria-label={label}
              placeholder={placeholder}
              type={type}
              step={step}
              min={min}
              max={max}
              value={value}
              onChange={onChange}
              disabled={disabled}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
          </div>
        </div>
      </label>
    </div>
  );
}

ModernField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  placeholder: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
};
