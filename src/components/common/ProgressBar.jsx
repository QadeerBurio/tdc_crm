import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${variants[variant]} rounded-full transition-all duration-500 ${sizes[size]}`}
          style={{ width: `${percentage}%` }}
          {...props}
        />
      </div>
    </div>
  );
};

export { ProgressBar };
export default ProgressBar;
