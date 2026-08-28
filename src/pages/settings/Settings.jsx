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
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('general');
  const [expandedSections, setExpandedSections] = useState({});

  // Settings Sections Configuration
  const settingsSections = {
    general: {
      label: 'General',
      icon: SettingsIcon,
      color: '#3b82f6',
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
      color: '#8b5cf6',
      items: [
        { id: 'company', label: 'Company', icon: Building2, path: '/organization/company' },
        { id: 'departments', label: 'Departments', icon: Layers, path: '/organization/departments' },
        { id: 'teams', label: 'Teams', icon: Users, path: '/organization/teams' },
        { id: 'hierarchy', label: 'Hierarchy', icon: Activity, path: '/organization/hierarchy' }
      ]
    },
    users: {
      label: 'Users & Roles',
      icon: Users,
      color: '#22c55e',
      items: [
        { id: 'users', label: 'User Management', icon: Users, path: '/settings/users' },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield, path: '/settings/roles' },
        { id: 'tenants', label: 'Tenants', icon: Building2, path: '/settings/tenants' }
      ]
    },
    workflows: {
      label: 'Workflows',
      icon: Zap,
      color: '#f59e0b',
      items: [
        { id: 'workflows', label: 'Workflow Manager', icon: Zap, path: '/workflows' },
        { id: 'automation', label: 'Automation Rules', icon: Bot, path: '/settings/automation' },
        { id: 'triggers', label: 'Triggers & Actions', icon: Link, path: '/settings/triggers' }
      ]
    },
    integrations: {
      label: 'Integrations',
      icon: Link,
      color: '#ec4899',
      items: [
        { id: 'integrations', label: 'Connected Apps', icon: Cloud, path: '/settings/integrations' },
        { id: 'api', label: 'API Keys', icon: Lock, path: '/settings/api' },
        { id: 'webhooks', label: 'Webhooks', icon: Database, path: '/settings/webhooks' }
      ]
    },
    audit: {
      label: 'Audit & Security',
      icon: Shield,
      color: '#ef4444',
      items: [
        { id: 'audit', label: 'Audit Log', icon: FileText, path: '/audit' },
        { id: 'audit-dashboard', label: 'Audit Dashboard', icon: Activity, path: '/audit/dashboard' },
        { id: 'audit-search', label: 'Audit Search', icon: Search, path: '/audit/search' }
      ]
    },
    branding: {
      label: 'Branding',
      icon: Award,
      color: '#14b8a6',
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
    <>
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-left">
            <h1 className="settings-title">
              <SettingsIcon className="settings-title-icon" />
              Settings
            </h1>
            <p className="settings-subtitle">Manage your application settings and preferences</p>
          </div>
          <div className="settings-header-right">
            <button 
              className="settings-refresh-btn"
              onClick={() => toast.success('Settings refreshed')}
            >
              <RefreshCw className="settings-refresh-icon" />
            </button>
          </div>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <div className="settings-sidebar-header">
              <span className="settings-sidebar-title">Settings</span>
            </div>
            <nav className="settings-nav">
              {Object.entries(settingsSections).map(([key, section]) => {
                const Icon = section.icon;
                const isActive = activeSection === key;
                const isExpanded = expandedSections[key];
                const items = section.items || [];

                return (
                  <div key={key} className="settings-nav-group">
                    <button
                      className={`settings-nav-item ${isActive ? 'settings-nav-active' : ''}`}
                      onClick={() => {
                        setActiveSection(key);
                        toggleSection(key);
                      }}
                    >
                      <div className="settings-nav-item-left">
                        <div 
                          className="settings-nav-icon-wrapper"
                          style={{ backgroundColor: `${section.color}15` }}
                        >
                          <Icon 
                            className="settings-nav-icon" 
                            style={{ color: section.color }}
                          />
                        </div>
                        <span className="settings-nav-label">{section.label}</span>
                      </div>
                      {items.length > 0 && (
                        <div className="settings-nav-chevron">
                          {isExpanded ? (
                            <ChevronDown className="settings-nav-chevron-icon" />
                          ) : (
                            <ChevronRight className="settings-nav-chevron-icon" />
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
                              onClick={() => handleNavigate(item.path)}
                            >
                              <ItemIcon className="settings-nav-sub-icon" />
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

            <div className="settings-sidebar-footer">
              <div className="settings-user-info">
                <div className="settings-user-avatar">
                  {getUserInitials()}
                </div>
                <div className="settings-user-details">
                  <p className="settings-user-name">
                    {user?.firstName} {user?.lastName || 'User'}
                  </p>
                  <p className="settings-user-role">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="settings-content">
            {/* Section Header */}
            <div className="settings-section-header">
              <div className="settings-section-header-left">
                <h2 className="settings-section-title">
                  {settingsSections[activeSection]?.label || 'Settings'}
                </h2>
                <p className="settings-section-subtitle">
                  Manage your {settingsSections[activeSection]?.label?.toLowerCase() || 'settings'} preferences
                </p>
              </div>
            </div>

            {/* Section Items Grid */}
            <div className="settings-items-grid">
              {getCurrentSectionItems().map((item) => {
                const Icon = item.icon;
                const sectionColor = settingsSections[activeSection]?.color || '#3b82f6';

                return (
                  <button
                    key={item.id}
                    className="settings-item-card"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <div className="settings-item-card-icon" style={{ backgroundColor: `${sectionColor}15` }}>
                      <Icon className="settings-item-icon" style={{ color: sectionColor }} />
                    </div>
                    <div className="settings-item-card-content">
                      <h3 className="settings-item-card-title">{item.label}</h3>
                      <p className="settings-item-card-desc">
                        Configure {item.label.toLowerCase()} settings
                      </p>
                    </div>
                    <ChevronRight className="settings-item-card-arrow" />
                  </button>
                );
              })}

              {getCurrentSectionItems().length === 0 && (
                <div className="settings-empty">
                  <div className="settings-empty-icon-wrapper">
                    <SettingsIcon className="settings-empty-icon" />
                  </div>
                  <h3 className="settings-empty-title">No Settings Available</h3>
                  <p className="settings-empty-subtitle">
                    This section does not have any configurable settings
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="settings-tips">
              <div className="settings-tips-header">
                <HelpCircle className="settings-tips-icon" />
                <h3 className="settings-tips-title">Quick Tips</h3>
              </div>
              <ul className="settings-tips-list">
                <li>Changes to settings are saved automatically</li>
                <li>Some settings may require a page refresh to take effect</li>
                <li>Contact support if you need help with specific settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .settings-container {
          padding: 0 0 24px 0;
          max-width: 100%;
          min-height: 100vh;
          background: #f8fafc;
        }

        /* ============================================
           HEADER
           ============================================ */
        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
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
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .settings-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .settings-subtitle {
          color: #6b7280;
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
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-refresh-btn:hover {
          background: #f9fafb;
        }

        .settings-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
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
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
          position: sticky;
          top: 24px;
          height: fit-content;
          max-height: calc(100vh - 100px);
          display: flex;
          flex-direction: column;
        }

        .settings-sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .settings-sidebar-title {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .settings-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .settings-nav-group {
          border-bottom: 1px solid #f9fafb;
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
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .settings-nav-item:hover {
          background: #f9fafb;
          color: #111827;
        }

        .settings-nav-active {
          background: #eff6ff;
          color: #3b82f6;
        }

        .settings-nav-active .settings-nav-icon {
          color: #3b82f6;
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
          color: #9ca3af;
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
          color: #6b7280;
          font-size: 13px;
        }

        .settings-nav-sub-item:hover {
          background: #f9fafb;
          color: #111827;
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
          border-top: 1px solid #f3f4f6;
        }

        .settings-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .settings-user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
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
          color: #111827;
          margin: 0;
        }

        .settings-user-role {
          font-size: 12px;
          color: #6b7280;
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
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px 24px;
        }

        .settings-section-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .settings-section-subtitle {
          font-size: 14px;
          color: #6b7280;
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
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .settings-item-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
          border-color: #d1d5db;
        }

        .settings-item-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
          color: #111827;
          margin: 0;
        }

        .settings-item-card-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }

        .settings-item-card-arrow {
          width: 16px;
          height: 16px;
          color: #9ca3af;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .settings-item-card:hover .settings-item-card-arrow {
          transform: translateX(4px);
          color: #3b82f6;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .settings-empty {
          grid-column: 1 / -1;
          padding: 48px 24px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
        }

        .settings-empty-icon-wrapper {
          width: 64px;
          height: 64px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .settings-empty-icon {
          width: 32px;
          height: 32px;
          color: #9ca3af;
        }

        .settings-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .settings-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        /* ============================================
           TIPS
           ============================================ */
        .settings-tips {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px 24px;
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
          color: #3b82f6;
        }

        .settings-tips-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
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
          color: #6b7280;
          padding-left: 20px;
          position: relative;
        }

        .settings-tips-list li::before {
          content: '•';
          position: absolute;
          left: 4px;
          color: #3b82f6;
          font-weight: 700;
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
    </>
  );
};

export default Settings;