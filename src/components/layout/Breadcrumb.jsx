import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getLabel = (path) => {
    const labels = {
      'dashboard': 'Dashboard',
      'admin': 'Admin',
      'crm': 'CRM',
      'leads': 'Leads',
      'deals': 'Deals',
      'projects': 'Projects',
      'tasks': 'Tasks',
      'employees': 'Employees',
      'clients': 'Clients',
      'goals': 'Goals',
      'kpis': 'KPIs',
      'activities': 'Activities',
      'risks': 'Risks',
      'partners': 'Partners',
      'retainers': 'Retainers',
      'settings': 'Settings',
      'organization': 'Organization',
      'calendar': 'Calendar',
      'performance': 'Performance',
      'timesheet': 'Timesheet',
      'attendance': 'Attendance',
      'standups': 'Standups'
    };
    return labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <Link to="/dashboard" className="hover:text-gray-700">
        <Home className="w-4 h-4" />
      </Link>
      {pathnames.map((path, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
            {isLast ? (
              <span className="font-medium text-gray-700">{getLabel(path)}</span>
            ) : (
              <Link to={routeTo} className="hover:text-gray-700">
                {getLabel(path)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;