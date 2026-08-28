import React from 'react';

const Checkbox = ({
  checked = false,
  onChange,
  label,
  name,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        name={name}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
};

export { Checkbox };
export default Checkbox;
