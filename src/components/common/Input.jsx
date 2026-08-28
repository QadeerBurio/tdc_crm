import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  icon: Icon, // Can be a component or element
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

  // Determine if icon is a component or element
  const renderIcon = () => {
    if (!Icon) return null;
    // If Icon is a function (component), render it
    if (typeof Icon === 'function') {
      return <Icon className="h-5 w-5 text-gray-400" />;
    }
    // If Icon is already an element, clone it with className
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, {
        className: `h-5 w-5 text-gray-400 ${Icon.props.className || ''}`
      });
    }
    return null;
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {renderIcon()}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${baseStyles} ${errorStyles} ${disabledStyles} ${Icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { Input };
export default Input;