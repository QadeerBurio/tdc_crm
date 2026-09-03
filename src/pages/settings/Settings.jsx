// pages/settings/Settings.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import {
  Settings as SettingsIcon,
  Users, Shield, Building2,
  Globe, Zap, Link, Bot, Palette,
  Bell, Lock, Database, Cloud,
  Mail, Phone, MessageSquare, FileText,
  Layers, Target, Award, Star,
  ChevronRight, ChevronDown, Plus,
  Search, Filter, RefreshCw,
  UserPlus, UserCheck, UserX,
  Activity, Clock, Calendar,
  Download, Upload, Save, X,
  Check, AlertCircle, HelpCircle,
  User, LayoutDashboard, FolderTree, GitBranch
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom CSS Module approach - using regular CSS in a <style> tag
// or we can use inline styles with CSS variables

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('general');
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    organization: false,
    users: false,
    workflows: false,
    integrations: false,
    audit: false,
    branding: false
  });

  // Color palette based on your requirements
  const colors = {
    primary: '#013E37',
    secondary: '#FFEFB3',
    white: '#FFFFFF',
    primaryLight: '#015A50',
    primaryDark: '#002A25',
    secondaryLight: '#FFF9E6',
    textPrimary: '#013E37',
    textSecondary: '#5A7A75',
    border: '#E8F0EE',
    bgLight: '#F7FAF9',
  };

  // Settings Sections Configuration with updated colors
  const settingsSections = {
    general: {
      label: 'General',
      icon: SettingsIcon,
      color: colors.primary,
      bgColor: colors.secondary,
      items: [
        { id: 'profile', label: 'Profile Settings', icon: User, path: '/settings/profile' },
        { id: 'preferences', label: 'Preferences', icon: Palette, path: '/settings/preferences' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' },
        { id: 'language', label: 'Language & Region', icon: Globe, path: '/settings/language' }
      ]
    },
    organization: {
      label: 'Organization',
      icon: Building2,
      color: '#2D8B7A',
      bgColor: '#E6F4F0',
      items: [
        { id: 'company', label: 'Company', icon: Building2, path: '/organization/company' },
        { id: 'departments', label: 'Departments', icon: Layers, path: '/organization/departments' },
        { id: 'teams', label: 'Teams', icon: Users, path: '/organization/teams' },
        { id: 'hierarchy', label: 'Hierarchy', icon: GitBranch, path: '/organization/hierarchy' }
      ]
    },
    users: {
      label: 'Users & Roles',
      icon: Users,
      color: '#D4A843',
      bgColor: '#FDF5E6',
      items: [
        { id: 'users', label: 'User Management', icon: Users, path: '/settings/users' },
        // { id: 'roles', label: 'Roles & Permissions', icon: Shield, path: '/settings/roles' },
        // { id: 'tenants', label: 'Tenants', icon: Building2, path: '/settings/tenants' }
      ]
    },
    workflows: {
      label: 'Workflows',
      icon: Zap,
      color: '#E8A838',
      bgColor: '#FDF5E6',
      items: [
        { id: 'workflows', label: 'Workflow Manager', icon: Zap, path: '/workflows' },
        { id: 'automation', label: 'Automation Rules', icon: Bot, path: '/settings/automation' },
        { id: 'triggers', label: 'Triggers & Actions', icon: Link, path: '/settings/triggers' }
      ]
    },
    integrations: {
      label: 'Integrations',
      icon: Link,
      color: '#2D8B7A',
      bgColor: '#E6F4F0',
      items: [
        { id: 'integrations', label: 'Connected Apps', icon: Cloud, path: '/settings/integrations' },
        { id: 'api', label: 'API Keys', icon: Lock, path: '/settings/api' },
        { id: 'webhooks', label: 'Webhooks', icon: Database, path: '/settings/webhooks' }
      ]
    },
    audit: {
      label: 'Audit & Security',
      icon: Shield,
      color: '#C0392B',
      bgColor: '#FDEEEC',
      items: [
        { id: 'audit', label: 'Audit Log', icon: FileText, path: '/audit' },
        { id: 'audit-dashboard', label: 'Audit Dashboard', icon: LayoutDashboard, path: '/audit/dashboard' },
        { id: 'audit-search', label: 'Audit Search', icon: Search, path: '/audit/search' }
      ]
    },
    branding: {
      label: 'Branding',
      icon: Award,
      color: '#013E37',
      bgColor: '#FFEFB3',
      items: [
        { id: 'brands', label: 'Brands', icon: Star, path: '/settings/brands' },
        { id: 'themes', label: 'Themes', icon: Palette, path: '/settings/themes' }
      ]
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const getCurrentSectionItems = () => {
    const section = settingsSections[activeSection];
    return section ? section.items : [];
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="settings-container" style={{ backgroundColor: colors.bgLight }}>
      {/* Header */}
      <div className="settings-header" style={{ backgroundColor: colors.white, borderBottomColor: colors.border }}>
        <div className="settings-header-left">
          <h1 className="settings-title" style={{ color: colors.textPrimary }}>
            <SettingsIcon className="settings-title-icon" style={{ color: colors.primary }} />
            Settings
          </h1>
          <p className="settings-subtitle" style={{ color: colors.textSecondary }}>
            Manage your application settings and preferences
          </p>
        </div>
        <div className="settings-header-right">
          <button
            className="settings-refresh-btn"
            style={{ borderColor: colors.border, backgroundColor: colors.white }}
            onClick={() => toast.success('Settings refreshed')}
          >
            <RefreshCw className="settings-refresh-icon" style={{ color: colors.textSecondary }} />
          </button>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
          <div className="settings-sidebar-header" style={{ borderBottomColor: colors.border }}>
            <span className="settings-sidebar-title" style={{ color: colors.textSecondary }}>
              Settings
            </span>
          </div>
          <nav className="settings-nav">
            {Object.entries(settingsSections).map(([key, section]) => {
              const Icon = section.icon;
              const isActive = activeSection === key;
              const isExpanded = expandedSections[key];
              const items = section.items || [];

              return (
                <div key={key} className="settings-nav-group" style={{ borderBottomColor: colors.border }}>
                  <button
                    className={`settings-nav-item ${isActive ? 'settings-nav-active' : ''}`}
                    style={{
                      backgroundColor: isActive ? colors.secondary : 'transparent',
                      color: isActive ? colors.primary : colors.textSecondary
                    }}
                    onClick={() => {
                      setActiveSection(key);
                      toggleSection(key);
                    }}
                  >
                    <div className="settings-nav-item-left">
                      <div
                        className="settings-nav-icon-wrapper"
                        style={{ backgroundColor: isActive ? colors.secondary : `${section.color}10` }}
                      >
                        <Icon
                          className="settings-nav-icon"
                          style={{ color: isActive ? colors.primary : section.color }}
                        />
                      </div>
                      <span className="settings-nav-label">{section.label}</span>
                    </div>
                    {items.length > 0 && (
                      <div className="settings-nav-chevron">
                        {isExpanded ? (
                          <ChevronDown className="settings-nav-chevron-icon" style={{ color: colors.textSecondary }} />
                        ) : (
                          <ChevronRight className="settings-nav-chevron-icon" style={{ color: colors.textSecondary }} />
                        )}
                      </div>
                    )}
                  </button>

                  {isExpanded && items.length > 0 && (
                    <div className="settings-nav-sub">
                      {items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            className="settings-nav-sub-item"
                            style={{ color: colors.textSecondary }}
                            onClick={() => handleNavigate(item.path)}
                          >
                            <ItemIcon className="settings-nav-sub-icon" style={{ color: section.color }} />
                            <span className="settings-nav-sub-label">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="settings-sidebar-footer" style={{ borderTopColor: colors.border }}>
            <div className="settings-user-info">
              <div
                className="settings-user-avatar"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})` }}
              >
                {getUserInitials()}
              </div>
              <div className="settings-user-details">
                <p className="settings-user-name" style={{ color: colors.textPrimary }}>
                  {user?.firstName} {user?.lastName || 'User'}
                </p>
                <p className="settings-user-role" style={{ color: colors.textSecondary }}>
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* Section Header */}
          <div className="settings-section-header" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
            <div className="settings-section-header-left">
              <h2 className="settings-section-title" style={{ color: colors.textPrimary }}>
                {settingsSections[activeSection]?.label || 'Settings'}
              </h2>
              <p className="settings-section-subtitle" style={{ color: colors.textSecondary }}>
                Manage your {settingsSections[activeSection]?.label?.toLowerCase() || 'settings'} preferences
              </p>
            </div>
          </div>

          {/* Section Items Grid */}
          <div className="settings-items-grid">
            {getCurrentSectionItems().map((item) => {
              const Icon = item.icon;
              const sectionColor = settingsSections[activeSection]?.color || colors.primary;
              const sectionBgColor = settingsSections[activeSection]?.bgColor || colors.secondary;

              return (
                <button
                  key={item.id}
                  className="settings-item-card"
                  style={{ backgroundColor: colors.white, borderColor: colors.border }}
                  onClick={() => handleNavigate(item.path)}
                >
                  <div
                    className="settings-item-card-icon"
                    style={{ backgroundColor: sectionBgColor }}
                  >
                    <Icon className="settings-item-icon" style={{ color: sectionColor }} />
                  </div>
                  <div className="settings-item-card-content">
                    <h3 className="settings-item-card-title" style={{ color: colors.textPrimary }}>
                      {item.label}
                    </h3>
                    <p className="settings-item-card-desc" style={{ color: colors.textSecondary }}>
                      Configure {item.label.toLowerCase()} settings
                    </p>
                  </div>
                  <ChevronRight className="settings-item-card-arrow" style={{ color: colors.textSecondary }} />
                </button>
              );
            })}

            {getCurrentSectionItems().length === 0 && (
              <div className="settings-empty" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
                <div className="settings-empty-icon-wrapper" style={{ backgroundColor: colors.border }}>
                  <SettingsIcon className="settings-empty-icon" style={{ color: colors.textSecondary }} />
                </div>
                <h3 className="settings-empty-title" style={{ color: colors.textPrimary }}>
                  No Settings Available
                </h3>
                <p className="settings-empty-subtitle" style={{ color: colors.textSecondary }}>
                  This section does not have any configurable settings
                </p>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="settings-tips" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
            <div className="settings-tips-header">
              <HelpCircle className="settings-tips-icon" style={{ color: colors.primary }} />
              <h3 className="settings-tips-title" style={{ color: colors.textPrimary }}>
                Quick Tips
              </h3>
            </div>
            <ul className="settings-tips-list">
              <li style={{ color: colors.textSecondary }}>Changes to settings are saved automatically</li>
              <li style={{ color: colors.textSecondary }}>Some settings may require a page refresh to take effect</li>
              <li style={{ color: colors.textSecondary }}>Contact support if you need help with specific settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom CSS - Fixed without jsx attribute */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .settings-container {
          padding: 0 0 24px 0;
          max-width: 100%;
          min-height: 100vh;
        }

        /* ============================================
           HEADER
           ============================================ */
        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .settings-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-title {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .settings-title-icon {
          width: 28px;
          height: 28px;
        }

        .settings-subtitle {
          font-size: 14px;
          margin: 0;
        }

        .settings-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .settings-refresh-btn {
          padding: 8px 10px;
          border: 1px solid;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-refresh-btn:hover {
          transform: rotate(45deg);
          transition: transform 0.3s ease;
        }

        .settings-refresh-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           LAYOUT
           ============================================ */
        .settings-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          padding: 0 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
        }

        /* ============================================
           SIDEBAR
           ============================================ */
        .settings-sidebar {
          border: 1px solid;
          border-radius: 16px;
          overflow: hidden;
          position: sticky;
          top: 24px;
          height: fit-content;
          max-height: calc(100vh - 100px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.06);
        }

        .settings-sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid;
        }

        .settings-sidebar-title {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .settings-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .settings-nav-group {
          border-bottom: 1px solid;
        }

        .settings-nav-group:last-child {
          border-bottom: none;
        }

        .settings-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 16px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 0;
        }

        .settings-nav-item:hover {
          background: #FFEFB3;
          color: #013E37;
        }

        .settings-nav-active {
          font-weight: 600;
        }

        .settings-nav-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .settings-nav-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .settings-nav-icon {
          width: 16px;
          height: 16px;
        }

        .settings-nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .settings-nav-chevron {
          display: flex;
          align-items: center;
        }

        .settings-nav-chevron-icon {
          width: 16px;
          height: 16px;
        }

        .settings-nav-sub {
          padding: 4px 0 8px 0;
        }

        .settings-nav-sub-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 16px 8px 60px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          border-radius: 0;
        }

        .settings-nav-sub-item:hover {
          background: #FFEFB3;
          color: #013E37 !important;
        }

        .settings-nav-sub-icon {
          width: 14px;
          height: 14px;
        }

        .settings-nav-sub-label {
          font-weight: 400;
        }

        .settings-sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid;
        }

        .settings-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .settings-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .settings-user-details {
          flex: 1;
          min-width: 0;
        }

        .settings-user-name {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .settings-user-role {
          font-size: 12px;
          margin: 0;
          text-transform: capitalize;
        }

        /* ============================================
           CONTENT
           ============================================ */
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-section-header {
          border: 1px solid;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .settings-section-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-section-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .settings-section-subtitle {
          font-size: 14px;
          margin: 0;
        }

        .settings-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .settings-item-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border: 1px solid;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .settings-item-card:hover {
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.1);
          transform: translateY(-3px);
          border-color: #013E37;
        }

        .settings-item-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .settings-item-card:hover .settings-item-card-icon {
          transform: scale(1.05);
        }

        .settings-item-icon {
          width: 20px;
          height: 20px;
        }

        .settings-item-card-content {
          flex: 1;
          min-width: 0;
        }

        .settings-item-card-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }

        .settings-item-card-desc {
          font-size: 13px;
          margin: 2px 0 0 0;
        }

        .settings-item-card-arrow {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .settings-item-card:hover .settings-item-card-arrow {
          transform: translateX(6px);
          color: #013E37 !important;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .settings-empty {
          grid-column: 1 / -1;
          padding: 48px 24px;
          text-align: center;
          border: 1px solid;
          border-radius: 16px;
        }

        .settings-empty-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .settings-empty-icon {
          width: 32px;
          height: 32px;
        }

        .settings-empty-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .settings-empty-subtitle {
          margin-top: 4px;
        }

        /* ============================================
           TIPS
           ============================================ */
        .settings-tips {
          border: 1px solid;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .settings-tips-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .settings-tips-icon {
          width: 18px;
          height: 18px;
        }

        .settings-tips-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .settings-tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-tips-list li {
          font-size: 13px;
          padding-left: 20px;
          position: relative;
        }

        .settings-tips-list li::before {
          content: '✦';
          position: absolute;
          left: 0;
          color: #013E37;
          font-weight: 700;
        }

        /* ============================================
           SCROLLBAR
           ============================================ */
        .settings-nav::-webkit-scrollbar {
          width: 4px;
        }

        .settings-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .settings-nav::-webkit-scrollbar-thumb {
          background: #FFEFB3;
          border-radius: 4px;
        }

        .settings-nav::-webkit-scrollbar-thumb:hover {
          background: #013E37;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .settings-header {
            padding: 16px;
          }

          .settings-layout {
            padding: 0 16px;
            gap: 16px;
          }

          .settings-sidebar {
            position: relative;
            top: 0;
            max-height: none;
          }

          .settings-items-grid {
            grid-template-columns: 1fr;
          }

          .settings-section-header {
            padding: 16px;
          }

          .settings-item-card {
            padding: 14px 16px;
          }

          .settings-tips {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .settings-title {
            font-size: 20px;
          }

          .settings-section-title {
            font-size: 18px;
          }

          .settings-nav-item {
            padding: 8px 12px;
          }

          .settings-nav-sub-item {
            padding: 6px 12px 6px 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;