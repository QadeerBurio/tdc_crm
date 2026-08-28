import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Briefcase, Target, Activity, Building2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ placeholder = 'Search...', onSearch, className = '' }) => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'users': Users,
      'projects': Briefcase,
      'tasks': FileText,
      'goals': Target,
      'leads': Building2,
      'clients': Building2,
      'activities': Activity,
      'partners': Users,
      'risks': Activity
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-4 h-4 text-gray-400" />;
  };

  const handleResultClick = (item) => {
    setShowResults(false);
    setQuery('');
    if (item.link) {
      navigate(item.link);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (query.trim().length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((category, idx) => (
                <div key={idx}>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    {category.label}
                  </div>
                  {category.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => handleResultClick(item)}
                      className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                    >
                      {getTypeIcon(category.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        {item.email && (
                          <p className="text-xs text-gray-500 truncate">{item.email}</p>
                        )}
                      </div>
                      {item.status && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          {item.status}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;