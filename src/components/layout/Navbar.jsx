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

       
        </div>

        {/* Right Section - Actions & Profile */}
        <div style={styles.rightSection}>
          <button
            onClick={toggleTheme}
            style={styles.iconButton}
          >
            {theme === 'dark' ? (
              <Sun style={styles.icon} />
            ) : (
              <Moon style={styles.icon} />
            )}
          </button>

          <button style={styles.iconButton}>
            <Bell style={styles.icon} />
            <span style={styles.notificationBadge}></span>
          </button>

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
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '10px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 40,
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
    gap: '12px',
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
    transition: 'background-color 0.2s',
  },
  menuIcon: {
    width: '20px',
    height: '20px',
    color: '#6b7280',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    width: '16px',
    height: '16px',
    color: '#9ca3af',
  },
  searchInput: {
    padding: '8px 12px 8px 36px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: '#111827',
    width: '240px',
    borderRadius: '8px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconButton: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '20px',
    height: '20px',
    color: '#6b7280',
  },
  notificationBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
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
    gap: '8px',
    padding: '6px 12px 6px 6px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    display: 'none',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    marginTop: '8px',
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '6px 0',
    zIndex: 50,
  },
  dropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '4px',
  },
  dropdownName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  dropdownEmail: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    color: '#374151',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  },
  dropdownIcon: {
    width: '16px',
    height: '16px',
    color: '#6b7280',
  },
  dropdownLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    color: '#ef4444',
    border: 'none',
    background: 'transparent',
    width: '100%',
    cursor: 'pointer',
    borderTop: '1px solid #e5e7eb',
    marginTop: '4px',
    transition: 'background-color 0.2s',
  },
};

// Media Queries - Add these to your global CSS or use className
// .lg\\:hidden { display: none; } // For menu button
// .dark\\:bg-gray-700 { background-color: #374151; }
// .dark\\:text-white { color: #ffffff; }
// .dark\\:border-gray-600 { border-color: #4b5563; }

export default Navbar;