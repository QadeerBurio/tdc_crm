import React, { useState } from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  ...props
}) => {
  const [active, setActive] = useState(activeTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActive(tabId);
    if (onChange) onChange(tabId);
  };

  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4" {...props}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                (activeTab || active) === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.find(t => t.id === (activeTab || active))?.content}
      </div>
    </div>
  );
};

export { Tabs };
export default Tabs;
