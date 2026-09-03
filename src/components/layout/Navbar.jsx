// components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Left Section - Menu & Search */}
        <div style={styles.leftSection}>
          <button
            onClick={onMenuClick}
            style={styles.menuButton}
            className="lg:hidden"
          >
            <Menu style={styles.menuIcon} />
          </button>

          {/* Search Bar */}
          <div style={styles.searchWrapper}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div style={styles.rightSection}>
          

          

          {/* Profile Dropdown */}
          <div style={styles.profileContainer}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={styles.profileButton}
            >
              <div style={styles.avatar}>
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </div>
              <span style={styles.userName}>
                {user?.firstName || 'User'} {user?.lastName || ''}
              </span>
              <ChevronDown style={styles.chevronIcon} />
            </button>

            {showProfileMenu && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <p style={styles.dropdownName}>
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </p>
                  <p style={styles.dropdownEmail}>{user?.email || ''}</p>
                </div>

                <Link
                  to="/profile"
                  style={styles.dropdownItem}
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User style={styles.dropdownIcon} />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  style={styles.dropdownItem}
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings style={styles.dropdownIcon} />
                  Settings
                </Link>

                <Link
                  to="/help"
                  style={styles.dropdownItem}
                  onClick={() => setShowProfileMenu(false)}
                >
                  <HelpCircle style={styles.dropdownIcon} />
                  Help & Support
                </Link>

                <button
                  onClick={handleLogout}
                  style={styles.dropdownLogout}
                >
                  <LogOut style={styles.dropdownIcon} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#ffffff', // White
    borderBottom: '2px solid #FFEFB3', // Warm cream accent
    padding: '12px 28px',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.08)', // Subtle shadow with primary color
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  menuButton: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  menuButtonHover: {
    backgroundColor: '#FFEFB3', // Warm cream on hover
  },
  menuIcon: {
    width: '22px',
    height: '22px',
    color: '#013E37', // Primary dark teal
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFEFB3', // Warm cream background
    borderRadius: '10px',
    border: '2px solid #013E37', // Primary dark teal border
    transition: 'all 0.3s ease',
  },
  searchWrapperFocus: {
    boxShadow: '0 0 0 3px rgba(1, 62, 55, 0.15)',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    width: '18px',
    height: '18px',
    color: '#013E37', // Primary dark teal
  },
  searchInput: {
    padding: '10px 14px 10px 42px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: '#013E37', // Primary dark teal
    width: '260px',
    borderRadius: '10px',
    fontWeight: '400',
  },
  searchInputPlaceholder: {
    color: 'rgba(1, 62, 55, 0.6)',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  iconButton: {
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonHover: {
    backgroundColor: '#FFEFB3',
  },
  icon: {
    width: '22px',
    height: '22px',
    color: '#013E37', // Primary dark teal
    transition: 'transform 0.2s ease',
  },
  notificationBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '10px',
    height: '10px',
    backgroundColor: '#FF6B6B', // Red for notifications
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },
  profileContainer: {
    position: 'relative',
    marginLeft: '4px',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px 6px 6px',
    borderRadius: '10px',
    border: '2px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  profileButtonHover: {
    borderColor: '#FFEFB3',
    backgroundColor: '#FFEFB3',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#013E37', // Primary dark teal
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37', // Primary dark teal
    display: 'none',
  },
  chevronIcon: {
    width: '18px',
    height: '18px',
    color: '#013E37', // Primary dark teal
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    marginTop: '12px',
    width: '260px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 12px 30px rgba(1, 62, 55, 0.15)',
    border: '2px solid #FFEFB3', // Warm cream border
    padding: '8px 0',
    zIndex: 50,
    animation: 'slideDown 0.2s ease',
  },
  dropdownHeader: {
    padding: '14px 18px',
    borderBottom: '2px solid #FFEFB3', // Warm cream
    marginBottom: '4px',
  },
  dropdownName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#013E37', // Primary dark teal
    margin: 0,
  },
  dropdownEmail: {
    fontSize: '13px',
    color: 'rgba(1, 62, 55, 0.7)',
    margin: '4px 0 0 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37', // Primary dark teal
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    borderRadius: '0',
  },
  dropdownItemHover: {
    backgroundColor: '#FFEFB3', // Warm cream
  },
  dropdownIcon: {
    width: '18px',
    height: '18px',
    color: '#013E37', // Primary dark teal
  },
  dropdownLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FF6B6B', // Red for logout
    border: 'none',
    background: 'transparent',
    width: '100%',
    cursor: 'pointer',
    borderTop: '2px solid #FFEFB3', // Warm cream
    marginTop: '4px',
    transition: 'all 0.2s ease',
    borderRadius: '0 0 14px 14px',
  },
  dropdownLogoutHover: {
    backgroundColor: '#FFEFB3',
  },
};

// Add this to your global CSS or component styles
const globalStyles = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Media Queries for Responsive */
  @media (min-width: 1024px) {
    .lg\\:hidden {
      display: none !important;
    }
  }

  @media (max-width: 768px) {
    .userName {
      display: none !important;
    }
  }

  /* Hover States - You'll need to handle these with CSS or use className */
  .navbar-button:hover {
    background-color: #FFEFB3 !important;
  }

  .navbar-search:hover {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1) !important;
  }

  /* Dark Theme Overrides (if needed) */
  .dark-theme .navbar {
    background-color: #013E37 !important;
    border-bottom-color: #FFEFB3 !important;
  }

  .dark-theme .searchWrapper {
    background-color: rgba(255, 239, 179, 0.1) !important;
    border-color: #FFEFB3 !important;
  }

  .dark-theme .searchInput {
    color: #FFEFB3 !important;
  }

  .dark-theme .searchIcon {
    color: #FFEFB3 !important;
  }

  .dark-theme .icon {
    color: #FFEFB3 !important;
  }

  .dark-theme .menuIcon {
    color: #FFEFB3 !important;
  }

  .dark-theme .dropdown {
    background-color: #013E37 !important;
    border-color: #FFEFB3 !important;
  }

  .dark-theme .dropdownName {
    color: #FFEFB3 !important;
  }

  .dark-theme .dropdownEmail {
    color: rgba(255, 239, 179, 0.7) !important;
  }

  .dark-theme .dropdownItem {
    color: #FFEFB3 !important;
  }

  .dark-theme .dropdownItem:hover {
    background-color: rgba(255, 239, 179, 0.1) !important;
  }

  .dark-theme .dropdownIcon {
    color: #FFEFB3 !important;
  }

  .dark-theme .avatar {
    background-color: #FFEFB3 !important;
    color: #013E37 !important;
  }

  .dark-theme .userName {
    color: #FFEFB3 !important;
  }

  .dark-theme .chevronIcon {
    color: #FFEFB3 !important;
  }

  .dark-theme .dropdownHeader {
    border-bottom-color: rgba(255, 239, 179, 0.2) !important;
  }

  .dark-theme .dropdownLogout {
    border-top-color: rgba(255, 239, 179, 0.2) !important;
  }
`;

// You can inject the global styles or add them to your main CSS file
// For React, you can add this to your index.js or App.js
// if (typeof document !== 'undefined') {
//   const styleTag = document.createElement('style');
//   styleTag.textContent = globalStyles;
//   document.head.appendChild(styleTag);
// }

export default Navbar;