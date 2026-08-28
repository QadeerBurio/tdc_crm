import React from 'react';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = '',
  ...props
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'transform translate-x-5' : ''
          }`} />
        </div>
      </div>
      {label && <span className="ml-3 text-sm text-gray-700">{label}</span>}
    </label>
  );
};

export { Switch };
export default Switch;
