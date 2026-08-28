// src/components/layout/ClientLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CheckCircle,
  FileText,
  FolderOpen,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  User,
  Menu,
  X,
  Home,
  Calendar,
  MessageSquare,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation items
  const navigation = [
    {
      name: 'Dashboard',
      href: '/client/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Projects',
      href: '/client/projects',
      icon: FolderOpen
    },
    {
      name: 'Tasks',
      href: '/client/tasks',
      icon: CheckCircle
    },
    {
      name: 'Approvals',
      href: '/client/approvals',
      icon: FileText
    },
    {
      name: 'Reports',
      href: '/client/reports',
      icon: Clock
    },
    {
      name: 'Billing',
      href: '/client/billing',
      icon: DollarSign
    },
    {
      name: 'Documents',
      href: '/client/documents',
      icon: FileText
    },
    {
      name: 'Settings',
      href: '/client/settings',
      icon: Settings
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get client name
  const getClientName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    return 'Client';
  };

  // Get client initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    return 'C';
  };

  // Get company name
  const getCompanyName = () => {
    if (user?.tenantId?.name) {
      return user.tenantId.name;
    }
    if (user?.company) return user.company;
    return 'Client Portal';
  };

  // Check if link is active
  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  // Get page title
  const getPageTitle = () => {
    const current = navigation.find(item => isActiveLink(item.href));
    return current?.name || 'Dashboard';
  };

  return (
    <div style={styles.container}>
      {/* ============================================ */}
      {/* SIDEBAR - Desktop */}
      {/* ============================================ */}
      <div style={{
        ...styles.sidebar,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <Link to="/client/dashboard" style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <span style={styles.logoText}>A</span>
            </div>
            <span style={styles.logoTitle}>Agency OS</span>
            <span style={styles.logoBadge}>Client</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            style={styles.closeButton}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} style={{
                  ...styles.navIcon,
                  ...(isActive ? styles.navIconActive : {})
                }} />
                <span style={{
                  ...styles.navLabel,
                  ...(isActive ? styles.navLabelActive : {})
                }}>
                  {item.name}
                </span>
                {isActive && <div style={styles.navActiveIndicator} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {getInitials()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{getClientName()}</div>
              <div style={styles.userRole}>{getCompanyName()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div style={{
        ...styles.mainContent,
        marginLeft: sidebarOpen ? '280px' : '0'
      }}>
        {/* Top Navigation Bar */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Mobile Menu Button */}
            {/* <button
              onClick={() => setMobileMenuOpen(true)}
              style={styles.menuButton}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button> */}

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <h1 style={styles.pageTitle}>{getPageTitle()}</h1>
          </div>

          {/* Right Section */}
          <div style={styles.headerRight}>
            {/* Help */}
            <button style={styles.iconButton} aria-label="Help">
              <HelpCircle size={20} />
            </button>

            {/* Messages */}
            <button style={styles.iconButton} aria-label="Messages">
              <MessageSquare size={20} />
              <span style={styles.notificationDot} />
            </button>

            {/* Notifications */}
            <button style={styles.iconButton} aria-label="Notifications">
              <Bell size={20} />
              <span style={styles.notificationBadge}>3</span>
            </button>

            {/* User Menu */}
            <div style={styles.userMenuContainer}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={styles.userMenuButton}
              >
                <div style={styles.userAvatarSmall}>
                  {getInitials()}
                </div>
                <span style={styles.userMenuName}>{getClientName()}</span>
                <ChevronDown size={16} style={styles.userMenuChevron} />
              </button>

              {userMenuOpen && (
                <div style={styles.userMenuDropdown}>
                  <Link to="/client/dashboard" style={styles.dropdownItem}>
                    <Home size={16} />
                    Dashboard
                  </Link>
                  <Link to="/client/settings" style={styles.dropdownItem}>
                    <User size={16} />
                    Profile
                  </Link>
                  <Link to="/client/settings" style={styles.dropdownItem}>
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div style={styles.dropdownDivider} />
                  <button onClick={handleLogout} style={styles.dropdownItemLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button (hidden on mobile) */}
            <button
              onClick={handleLogout}
              style={styles.logoutButton}
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.content}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © {new Date().getFullYear()} Agency OS. All rights reserved.
          </p>
        </footer>
      </div>

      {/* ============================================ */}
      {/* MOBILE SIDEBAR - Overlay */}
      {/* ============================================ */}
      {mobileMenuOpen && (
        <div style={styles.mobileOverlay}>
          <div
            style={styles.mobileBackdrop}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div style={styles.mobileSidebar}>
            <div style={styles.mobileHeader}>
              <Link to="/client/dashboard" style={styles.logoContainer}>
                <div style={styles.logoIcon}>
                  <span style={styles.logoText}>A</span>
                </div>
                <span style={styles.logoTitle}>Agency OS</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={styles.closeButton}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav style={styles.mobileNav}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      ...styles.navItem,
                      ...(isActive ? styles.navItemActive : {})
                    }}
                  >
                    <Icon size={20} style={{
                      ...styles.navIcon,
                      ...(isActive ? styles.navIconActive : {})
                    }} />
                    <span style={{
                      ...styles.navLabel,
                      ...(isActive ? styles.navLabelActive : {})
                    }}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              <div style={styles.mobileDivider} />
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                style={styles.mobileLogoutButton}
              >
                <LogOut size={20} style={styles.mobileLogoutIcon} />
                <span style={styles.mobileLogoutText}>Logout</span>
              </button>
            </nav>

            <div style={styles.mobileFooter}>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {getInitials()}
                </div>
                <div style={styles.userDetails}>
                  <div style={styles.userName}>{getClientName()}</div>
                  <div style={styles.userRole}>{getCompanyName()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STYLES - Matching Client Dashboard
// ============================================
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
  },
  // Sidebar
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
  },
  sidebarHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#3B82F6',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
  },
  logoBadge: {
    fontSize: '10px',
    fontWeight: '600',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    padding: '2px 8px',
    borderRadius: '9999px',
    marginLeft: '4px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: '8px',
    color: '#6B7280',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    marginBottom: '2px',
    position: 'relative',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
  },
  navIcon: {
    flexShrink: 0,
    color: '#6B7280',
  },
  navIconActive: {
    color: '#1D4ED8',
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500',
    marginLeft: '12px',
  },
  navLabelActive: {
    fontWeight: '600',
    color: '#1D4ED8',
  },
  navActiveIndicator: {
    position: 'absolute',
    right: '0',
    width: '4px',
    height: '24px',
    backgroundColor: '#1D4ED8',
    borderRadius: '4px 0 0 4px',
  },
  sidebarFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #E5E7EB',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#3B82F6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '12px',
    color: '#6B7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Main Content
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
  },
  // Header
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  pageTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease',
  },
  notificationDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '6px',
    height: '6px',
    backgroundColor: '#EF4444',
    borderRadius: '50%',
  },
  notificationBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '600',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMenuContainer: {
    position: 'relative',
  },
  userMenuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  userAvatarSmall: {
    width: '32px',
    height: '32px',
    backgroundColor: '#3B82F6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
  },
  userMenuName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    display: 'none',
  },
  userMenuChevron: {
    color: '#6B7280',
    display: 'none',
  },
  userMenuDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
    padding: '8px',
    minWidth: '200px',
    border: '1px solid #E5E7EB',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#111827',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.2s ease',
  },
  dropdownItemLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#EF4444',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.2s ease',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#E5E7EB',
    margin: '4px 0',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease',
  },
  // Content
  content: {
    flex: 1,
    padding: '24px',
    backgroundColor: '#F9FAFB',
  },
  // Footer
  footer: {
    borderTop: '1px solid #E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: '12px 24px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  // Mobile Sidebar
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    display: 'block',
  },
  mobileBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mobileSidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
  },
  mobileHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileNav: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
  },
  mobileDivider: {
    height: '1px',
    backgroundColor: '#E5E7EB',
    margin: '8px 0',
  },
  mobileLogoutButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    width: '100%',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#EF4444',
    transition: 'background 0.2s ease',
  },
  mobileLogoutIcon: {
    flexShrink: 0,
    marginRight: '12px',
  },
  mobileLogoutText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  mobileFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #E5E7EB',
  },
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .menu-button:hover,
  .icon-button:hover,
  .logout-button:hover {
    background-color: #F3F4F6;
  }
  
  .user-menu-button:hover {
    background-color: #F3F4F6;
  }
  
  .dropdown-item:hover {
    background-color: #F3F4F6;
  }
  
  .dropdown-item-logout:hover {
    background-color: #FEF2F2;
  }
  
  .mobile-logout-button:hover {
    background-color: #FEF2F2;
  }
  
  @media (min-width: 769px) {
    .user-menu-name,
    .user-menu-chevron {
      display: inline !important;
    }
  }
  
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%) !important;
    }
    
    .main-content {
      margin-left: 0 !important;
    }
    
    .logout-button {
      display: none !important;
    }
    
    .user-menu-name,
    .user-menu-chevron {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ClientLayout;