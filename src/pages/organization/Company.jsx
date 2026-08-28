// pages/organization/Company.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import {
  Building2, Edit, Save, X, RefreshCw,
  Globe, Users, DollarSign, Settings,
  AlertCircle, Clock, Globe2, ChevronRight,
  Search, Plus, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Company = () => {
  const { token } = useAuth();
  const { 
    company, 
    loading, 
    fetchCompany, 
    updateCompany,
    loadAllData 
  } = useOrganization();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    industry: '',
    foundedDate: '',
    logo: '',
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      fiscalYearStart: '',
      language: 'en'
    },
    status: 'active'
  });
  const [saving, setSaving] = useState(false);

  // Load all companies on mount
  useEffect(() => {
    fetchAllCompanies();
  }, []);

  const fetchAllCompanies = async () => {
    try {
      const response = await fetch('https://crmserver-production-4a42.up.railway.app/api/organization/companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.data) {
        setCompanies(Array.isArray(data.data) ? data.data : [data.data]);
        if (Array.isArray(data.data) && data.data.length > 0) {
          setSelectedCompany(data.data[0]);
          setFormDataFromCompany(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const setFormDataFromCompany = (comp) => {
    setFormData({
      ...comp,
      foundedDate: comp.foundedDate ? new Date(comp.foundedDate).toISOString().split('T')[0] : '',
      settings: {
        ...comp.settings,
        fiscalYearStart: comp.settings?.fiscalYearStart ? 
          new Date(comp.settings.fiscalYearStart).toISOString().split('T')[0] : ''
      }
    });
  };

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setFormDataFromCompany(comp);
    setEditing(false);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      if (!selectedCompany?._id) {
        toast.error('No company selected');
        return;
      }
      
      const response = await fetch(`https://crmserver-production-4a42.up.railway.app/api/organization/companies/${selectedCompany._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.data) {
        setSelectedCompany(data.data);
        setCompanies(companies.map(c => c._id === data.data._id ? data.data : c));
        setEditing(false);
        toast.success('Company updated successfully');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (selectedCompany) {
      setFormDataFromCompany(selectedCompany);
    }
  };

  const filteredCompanies = companies.filter(comp =>
    comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !companies.length) {
    return (
      <div className="company-loading">
        <div className="company-loading-spinner"></div>
        <p className="company-loading-text">Loading companies...</p>
      </div>
    );
  }

  return (
    <>
      <div className="company-container">
        {/* Header */}
        <div className="company-header">
          <div className="company-header-left">
            <h1 className="company-title">
              <Building2 className="company-title-icon" />
              Companies
            </h1>
            <p className="company-subtitle">Manage your companies</p>
          </div>
          <div className="company-header-right">
            <button
              onClick={fetchAllCompanies}
              className="company-refresh-btn"
              title="Refresh"
            >
              <RefreshCw className="company-refresh-icon" />
            </button>
            <button
              onClick={() => {
                setSelectedCompany(null);
                setFormData({
                  name: '',
                  slug: '',
                  description: '',
                  industry: '',
                  foundedDate: '',
                  logo: '',
                  settings: {
                    timezone: 'America/New_York',
                    currency: 'USD',
                    fiscalYearStart: '',
                    language: 'en'
                  },
                  status: 'active'
                });
                setEditing(true);
              }}
              className="company-add-btn"
            >
              <Plus className="company-add-icon" />
              Add Company
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="company-layout">
          {/* Left Column - Company List */}
          <div className="company-list-panel">
            <div className="company-search">
              <Search className="company-search-icon" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="company-search-input"
              />
            </div>
            
            <div className="company-list">
              {filteredCompanies.length === 0 ? (
                <div className="company-list-empty">
                  <Building2 className="company-list-empty-icon" />
                  <p>No companies found</p>
                </div>
              ) : (
                filteredCompanies.map((comp) => (
                  <div
                    key={comp._id}
                    className={`company-list-item ${selectedCompany?._id === comp._id ? 'company-list-item-active' : ''}`}
                    onClick={() => handleSelectCompany(comp)}
                  >
                    <div className="company-list-item-left">
                      <div className="company-list-avatar">
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                      <div className="company-list-info">
                        <div className="company-list-name">{comp.name}</div>
                        <div className="company-list-meta">
                          <span>{comp.industry || 'No industry'}</span>
                          <span className="company-list-dot">•</span>
                          <span className={`company-list-status ${comp.status === 'active' ? 'company-list-status-active' : 'company-list-status-inactive'}`}>
                            {comp.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="company-list-arrow" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Company Details */}
          <div className="company-detail-panel">
            {selectedCompany ? (
              <>
                {/* Company Header */}
                <div className="company-card">
                  <div className="company-card-header">
                    <div className="company-logo-wrapper">
                      {selectedCompany?.logo ? (
                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="company-logo-img" />
                      ) : (
                        <Building2 className="company-logo-icon" />
                      )}
                    </div>

                    <div className="company-info">
                      <div className="company-name-row">
                        {editing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="company-name-input"
                            placeholder="Company Name"
                          />
                        ) : (
                          <h2 className="company-name">{selectedCompany?.name || 'Company Name'}</h2>
                        )}
                        <span className={`company-status-badge ${selectedCompany?.status === 'active' ? 'company-status-active' : 'company-status-inactive'}`}>
                          {selectedCompany?.status || 'Active'}
                        </span>
                        {selectedCompany?.industry && (
                          <span className="company-industry-badge">
                            {selectedCompany.industry}
                          </span>
                        )}
                      </div>
                      
                      <div className="company-slug-row">
                        {editing ? (
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => handleChange('slug', e.target.value)}
                            className="company-slug-input"
                            placeholder="company-slug"
                          />
                        ) : (
                          <p className="company-slug">{selectedCompany?.slug || 'company-slug'}</p>
                        )}
                      </div>
                      
                      <div className="company-desc-row">
                        {editing ? (
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="company-desc-textarea"
                            rows="2"
                            placeholder="Company description"
                          />
                        ) : (
                          <p className="company-desc">{selectedCompany?.description || 'No description provided'}</p>
                        )}
                      </div>

                      {/* Quick Stats */}
                      {!editing && selectedCompany && (
                        <div className="company-stats">
                          <div className="company-stat">
                            <Users className="company-stat-icon" />
                            <span>Total Users: 0</span>
                          </div>
                          <div className="company-stat">
                            <Building2 className="company-stat-icon" />
                            <span>Segments: 0</span>
                          </div>
                          <div className="company-stat">
                            <Globe2 className="company-stat-icon" />
                            <span>{selectedCompany.settings?.timezone || 'America/New_York'}</span>
                          </div>
                          <div className="company-stat">
                            <DollarSign className="company-stat-icon" />
                            <span>{selectedCompany.settings?.currency || 'USD'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="company-details">
                    <div className="company-details-grid">
                      {/* General Information */}
                      <div className="company-detail-section">
                        <h3 className="company-section-title">
                          <Settings className="company-section-icon" />
                          General Information
                        </h3>
                        <div className="company-section-content">
                          <div className="company-field">
                            <label className="company-field-label">Industry</label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => handleChange('industry', e.target.value)}
                                className="company-field-input"
                                placeholder="e.g., Technology, Healthcare"
                              />
                            ) : (
                              <p className="company-field-value">{selectedCompany?.industry || 'Not specified'}</p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label">Founded Date</label>
                            {editing ? (
                              <input
                                type="date"
                                value={formData.foundedDate}
                                onChange={(e) => handleChange('foundedDate', e.target.value)}
                                className="company-field-input"
                              />
                            ) : (
                              <p className="company-field-value">
                                {selectedCompany?.foundedDate ? new Date(selectedCompany.foundedDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Not specified'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label">Status</label>
                            {editing ? (
                              <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="company-field-select"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                              </select>
                            ) : (
                              <span className={`company-status-dot ${selectedCompany?.status === 'active' ? 'company-status-dot-active' : 'company-status-dot-inactive'}`}>
                                <span className="company-status-dot-indicator"></span>
                                {selectedCompany?.status || 'Active'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="company-detail-section">
                        <h3 className="company-section-title">
                          <Globe className="company-section-icon" />
                          Regional Settings
                        </h3>
                        <div className="company-section-content">
                          <div className="company-field">
                            <label className="company-field-label">Timezone</label>
                            {editing ? (
                              <select
                                value={formData.settings.timezone}
                                onChange={(e) => handleChange('settings.timezone', e.target.value)}
                                className="company-field-select"
                              >
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                <option value="America/Phoenix">Arizona</option>
                                <option value="America/Anchorage">Alaska</option>
                                <option value="Pacific/Honolulu">Hawaii</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Europe/Paris">Paris (CET)</option>
                                <option value="Asia/Dubai">Dubai (GST)</option>
                                <option value="Asia/Karachi">Karachi (PKT)</option>
                                <option value="Asia/Kolkata">Kolkata (IST)</option>
                                <option value="Asia/Singapore">Singapore (SGT)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Australia/Sydney">Sydney (AEST)</option>
                              </select>
                            ) : (
                              <p className="company-field-value company-field-value-with-icon">
                                <Clock className="company-field-icon" />
                                {selectedCompany?.settings?.timezone || 'America/New_York'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label">Currency</label>
                            {editing ? (
                              <select
                                value={formData.settings.currency}
                                onChange={(e) => handleChange('settings.currency', e.target.value)}
                                className="company-field-select"
                              >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="PKR">PKR (Rs)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="SGD">SGD (S$)</option>
                                <option value="JPY">JPY (¥)</option>
                                <option value="AUD">AUD (A$)</option>
                                <option value="CAD">CAD (C$)</option>
                                <option value="CHF">CHF (Fr)</option>
                                <option value="CNY">CNY (¥)</option>
                                <option value="BRL">BRL (R$)</option>
                              </select>
                            ) : (
                              <p className="company-field-value company-field-value-with-icon">
                                <DollarSign className="company-field-icon" />
                                {selectedCompany?.settings?.currency || 'USD'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label">Language</label>
                            {editing ? (
                              <select
                                value={formData.settings.language}
                                onChange={(e) => handleChange('settings.language', e.target.value)}
                                className="company-field-select"
                              >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="zh">Chinese</option>
                                <option value="ja">Japanese</option>
                                <option value="ar">Arabic</option>
                                <option value="ur">Urdu</option>
                                <option value="hi">Hindi</option>
                                <option value="pt">Portuguese</option>
                                <option value="ru">Russian</option>
                                <option value="it">Italian</option>
                              </select>
                            ) : (
                              <p className="company-field-value">{selectedCompany?.settings?.language || 'en'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="company-card-actions">
                    {editing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="company-cancel-btn"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="company-save-btn"
                        >
                          {saving ? (
                            <>
                              <div className="company-save-spinner"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="company-save-icon" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="company-edit-btn-full"
                      >
                        <Edit className="company-edit-icon" />
                        Edit Company
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="company-empty-state">
                <Building2 className="company-empty-state-icon" />
                <h3>Select a Company</h3>
                <p>Choose a company from the list to view and manage its settings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        /* Container */
        .company-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* Header */
        .company-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .company-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .company-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }
        .company-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }
        .company-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .company-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .company-refresh-btn {
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
        .company-refresh-btn:hover {
          background: #f9fafb;
        }
        .company-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }
        .company-add-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
        }
        .company-add-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .company-add-icon {
          width: 16px;
          height: 16px;
        }

        /* Layout */
        .company-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .company-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Left Panel - Company List */
        .company-list-panel {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          height: fit-content;
          max-height: 600px;
          display: flex;
          flex-direction: column;
        }
        .company-search {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f9fafb;
        }
        .company-search-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }
        .company-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: #111827;
          width: 100%;
        }
        .company-list {
          flex: 1;
          overflow-y: auto;
        }
        .company-list-empty {
          padding: 40px 20px;
          text-align: center;
          color: #6b7280;
        }
        .company-list-empty-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 8px;
          color: #d1d5db;
        }
        .company-list-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.15s ease;
          border-bottom: 1px solid #f3f4f6;
        }
        .company-list-item:hover {
          background: #f9fafb;
        }
        .company-list-item-active {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
        }
        .company-list-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .company-list-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .company-list-avatar img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
        }
        .company-list-info {
          flex: 1;
          min-width: 0;
        }
        .company-list-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .company-list-meta {
          font-size: 12px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .company-list-dot {
          color: #d1d5db;
        }
        .company-list-status {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .company-list-status-active {
          background: #dcfce7;
          color: #16a34a;
        }
        .company-list-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        .company-list-arrow {
          color: #9ca3af;
          flex-shrink: 0;
        }

        /* Right Panel - Company Details */
        .company-detail-panel {
          min-height: 400px;
        }
        .company-empty-state {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 60px 20px;
          text-align: center;
        }
        .company-empty-state-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin: 0 auto 12px;
        }
        .company-empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px;
        }
        .company-empty-state p {
          color: #6b7280;
          margin: 0;
        }

        /* Card */
        .company-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .company-card-header {
          padding: 24px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .company-card-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
        .company-logo-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .company-logo-icon {
          width: 40px;
          height: 40px;
          color: #ffffff;
        }
        .company-logo-img {
          width: 64px;
          height: 64px;
          object-fit: contain;
          border-radius: 6px;
        }
        .company-info {
          flex: 1;
          min-width: 0;
        }
        .company-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .company-name {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .company-name-input {
          padding: 4px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          width: 100%;
          max-width: 280px;
          outline: none;
        }
        .company-name-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .company-status-badge {
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
          border: 1px solid;
        }
        .company-status-active {
          background: #dcfce7;
          color: #16a34a;
          border-color: #86efac;
        }
        .company-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
          border-color: #d1d5db;
        }
        .company-industry-badge {
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 500;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 9999px;
          border: 1px solid #bfdbfe;
        }
        .company-slug-row {
          margin-top: 2px;
        }
        .company-slug {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
        }
        .company-slug-input {
          padding: 2px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          color: #111827;
          width: 100%;
          max-width: 280px;
          outline: none;
        }
        .company-slug-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .company-desc-row {
          margin-top: 4px;
        }
        .company-desc {
          color: #4b5563;
          margin: 0;
          font-size: 13px;
        }
        .company-desc-textarea {
          width: 100%;
          max-width: 500px;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          color: #111827;
          outline: none;
          font-family: inherit;
        }
        .company-desc-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .company-stats {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #6b7280;
        }
        .company-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .company-stat-icon {
          width: 14px;
          height: 14px;
        }

        /* Details */
        .company-details {
          padding: 20px 24px;
        }
        .company-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .company-details-grid {
            grid-template-columns: 1fr;
          }
        }
        .company-detail-section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }
        .company-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .company-section-icon {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }
        .company-section-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .company-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .company-field-label {
          font-size: 10px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .company-field-value {
          color: #374151;
          margin: 0;
          font-size: 13px;
        }
        .company-field-value-with-icon {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .company-field-icon {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }
        .company-field-input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          color: #111827;
          outline: none;
        }
        .company-field-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .company-field-select {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          color: #111827;
          background: #ffffff;
          outline: none;
        }
        .company-field-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .company-status-dot {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }
        .company-status-dot-active {
          background: #dcfce7;
          color: #16a34a;
        }
        .company-status-dot-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        .company-status-dot-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }
        .company-status-dot-active .company-status-dot-indicator {
          background: #22c55e;
        }
        .company-status-dot-inactive .company-status-dot-indicator {
          background: #9ca3af;
        }

        /* Card Actions */
        .company-card-actions {
          padding: 16px 24px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .company-edit-btn-full {
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .company-edit-btn-full:hover {
          background: #2563eb;
        }
        .company-cancel-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #4b5563;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
        }
        .company-cancel-btn:hover {
          background: #f9fafb;
        }
        .company-save-btn {
          padding: 8px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .company-save-btn:hover:not(:disabled) {
          background: #2563eb;
        }
        .company-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .company-save-icon {
          width: 14px;
          height: 14px;
        }
        .company-save-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Loading */
        .company-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .company-loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .company-loading-text {
          margin-top: 12px;
          color: #6b7280;
          font-size: 13px;
        }
      `}</style>
    </>
  );
};

export default Company;