import React from 'react';

// Main Table Component
const Table = ({ 
  children, 
  className = '', 
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  ...props 
}) => {
  // If there are children, render them directly (for custom table content)
  if (children) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full" {...props}>
          {children}
        </table>
      </div>
    );
  }

  // If no children, use the columns and data props
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full" {...props}>
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-700"
                  >
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : item[column.accessor] || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Sub-components for more flexible usage
const TableHead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-50 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', onClick, ...props }) => {
  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors ${className}`} 
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHeadCell = ({ children, className = '', ...props }) => {
  return (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '', colSpan, style, ...props }) => {
  return (
    <td 
      className={`px-4 py-3 text-sm text-gray-700 ${className}`}
      colSpan={colSpan}
      style={style}
      {...props}
    >
      {children}
    </td>
  );
};

// Export all components
export { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeadCell, 
  TableCell 
};

export default Table;