// pages/organization/Company.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import {
  Building2, Edit, Save, X, RefreshCw,
  Globe, Users, DollarSign, Settings,
  AlertCircle, Clock, Globe2, ChevronRight,
  Search, Plus, Filter, Briefcase, Calendar,
  MapPin, Link, Mail, Phone, Star, Award,
  TrendingUp, Shield, Layers, Zap, Check,
  ChevronLeft, Menu
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
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
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
    setIsMobileListOpen(false);
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
            <p className="company-subtitle">Manage and organize your company profiles</p>
          </div>
          <div className="company-header-right">
            <button
              onClick={() => setIsMobileListOpen(!isMobileListOpen)}
              className="company-mobile-toggle"
              aria-label="Toggle company list"
            >
              <Menu size={20} />
            </button>
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
                setIsMobileListOpen(false);
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
          <div className={`company-list-panel ${isMobileListOpen ? 'company-list-panel-open' : ''}`}>
            <div className="company-search">
              <Search className="company-search-icon" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="company-search-input"
              />
              {searchTerm && (
                <button 
                  className="company-clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="company-list">
              {filteredCompanies.length === 0 ? (
                <div className="company-list-empty">
                  <Building2 className="company-list-empty-icon" />
                  <p>No companies found</p>
                  <span>Try adjusting your search</span>
                </div>
              ) : (
                filteredCompanies.map((comp) => (
                  <div
                    key={comp._id}
                    className={`company-list-item ${selectedCompany?._id === comp._id ? 'company-list-item-active' : ''}`}
                    onClick={() => handleSelectCompany(comp)}
                  >
                    <div className="company-list-item-left">
                      <div className="company-list-avatar" style={{ backgroundColor: '#013E37' }}>
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} />
                        ) : (
                          <Building2 size={20} color="#FFFFFF" />
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
                    {selectedCompany?._id === comp._id ? (
                      <Check size={16} className="company-list-check" />
                    ) : (
                      <ChevronRight size={16} className="company-list-arrow" />
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="company-list-footer">
              <span>{filteredCompanies.length} companies</span>
            </div>
          </div>

          {/* Right Column - Company Details */}
          <div className="company-detail-panel">
            {selectedCompany ? (
              <>
                <div className="company-card">
                  {/* Company Header */}
                  <div className="company-card-header">
                    <div className="company-logo-wrapper" style={{ background: 'linear-gradient(135deg, #013E37 0%, #0A5C54 100%)' }}>
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
                          <span className="company-status-dot-indicator-small"></span>
                          {selectedCompany?.status || 'Active'}
                        </span>
                        {selectedCompany?.industry && (
                          <span className="company-industry-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>
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
                          <p className="company-slug">
                            <Link size={14} className="company-slug-icon" />
                            {selectedCompany?.slug || 'company-slug'}
                          </p>
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
                          <div className="company-stat" style={{ backgroundColor: '#FFEFB3' }}>
                            <Users className="company-stat-icon" color="#013E37" />
                            <span>0 Users</span>
                          </div>
                          <div className="company-stat" style={{ backgroundColor: '#FFEFB3' }}>
                            <Building2 className="company-stat-icon" color="#013E37" />
                            <span>0 Segments</span>
                          </div>
                          <div className="company-stat" style={{ backgroundColor: '#FFEFB3' }}>
                            <Globe2 className="company-stat-icon" color="#013E37" />
                            <span>{selectedCompany.settings?.timezone?.split('/')[1]?.replace('_', ' ') || 'EST'}</span>
                          </div>
                          <div className="company-stat" style={{ backgroundColor: '#FFEFB3' }}>
                            <DollarSign className="company-stat-icon" color="#013E37" />
                            <span>{selectedCompany.settings?.currency || 'USD'}</span>
                          </div>
                          {selectedCompany.foundedDate && (
                            <div className="company-stat" style={{ backgroundColor: '#FFEFB3' }}>
                              <Calendar className="company-stat-icon" color="#013E37" />
                              <span>{new Date(selectedCompany.foundedDate).getFullYear()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="company-details">
                    <div className="company-details-grid">
                      {/* General Information */}
                      <div className="company-detail-section" style={{ backgroundColor: '#FFEFB3' }}>
                        <h3 className="company-section-title" style={{ color: '#013E37' }}>
                          <Settings className="company-section-icon" color="#013E37" />
                          General Information
                        </h3>
                        <div className="company-section-content">
                          <div className="company-field">
                            <label className="company-field-label" style={{ color: '#013E37' }}>Industry</label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => handleChange('industry', e.target.value)}
                                className="company-field-input"
                                placeholder="e.g., Technology, Healthcare"
                              />
                            ) : (
                              <p className="company-field-value" style={{ color: '#013E37' }}>
                                {selectedCompany?.industry || 'Not specified'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label" style={{ color: '#013E37' }}>Founded Date</label>
                            {editing ? (
                              <input
                                type="date"
                                value={formData.foundedDate}
                                onChange={(e) => handleChange('foundedDate', e.target.value)}
                                className="company-field-input"
                              />
                            ) : (
                              <p className="company-field-value" style={{ color: '#013E37' }}>
                                {selectedCompany?.foundedDate ? new Date(selectedCompany.foundedDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Not specified'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label" style={{ color: '#013E37' }}>Status</label>
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

                      {/* Regional Settings */}
                      <div className="company-detail-section" style={{ backgroundColor: '#FFEFB3' }}>
                        <h3 className="company-section-title" style={{ color: '#013E37' }}>
                          <Globe className="company-section-icon" color="#013E37" />
                          Regional Settings
                        </h3>
                        <div className="company-section-content">
                          <div className="company-field">
                            <label className="company-field-label" style={{ color: '#013E37' }}>Timezone</label>
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
                              <p className="company-field-value company-field-value-with-icon" style={{ color: '#013E37' }}>
                                <Clock className="company-field-icon" color="#013E37" />
                                {selectedCompany?.settings?.timezone || 'America/New_York'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label" style={{ color: '#013E37' }}>Currency</label>
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
                              <p className="company-field-value company-field-value-with-icon" style={{ color: '#013E37' }}>
                                <DollarSign className="company-field-icon" color="#013E37" />
                                {selectedCompany?.settings?.currency || 'USD'}
                              </p>
                            )}
                          </div>
                          <div className="company-field">
                            <label className="company-field-label" style={{ color: '#013E37' }}>Language</label>
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
                              <p className="company-field-value" style={{ color: '#013E37' }}>
                                {selectedCompany?.settings?.language || 'en'}
                              </p>
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
                          <X size={14} /> Cancel
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="company-save-btn"
                          style={{ backgroundColor: '#013E37' }}
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
                        style={{ backgroundColor: '#013E37' }}
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
                <div className="company-empty-state-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <Building2 className="company-empty-state-icon" color="#013E37" />
                </div>
                <h3 style={{ color: '#013E37' }}>Select a Company</h3>
                <p style={{ color: '#013E37', opacity: 0.6 }}>Choose a company from the list to view and manage its settings</p>
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
                  className="company-empty-add-btn"
                >
                  <Plus size={16} /> Add Your First Company
                </button>
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
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .company-title-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }
        .company-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .company-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .company-mobile-toggle {
          display: none;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #013E37;
        }
        .company-mobile-toggle:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .company-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .company-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .company-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
        }
        .company-add-btn {
          padding: 8px 20px;
          background: #013E37;
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
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }
        .company-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
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
        @media (max-width: 992px) {
          .company-layout {
            grid-template-columns: 1fr;
          }
          .company-mobile-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }

        /* Left Panel - Company List */
        .company-list-panel {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          height: fit-content;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .company-list-panel:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        @media (max-width: 992px) {
          .company-list-panel {
            display: none;
            max-height: 400px;
          }
          .company-list-panel-open {
            display: flex !important;
            animation: slideDown 0.3s ease;
          }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .company-search {
          padding: 12px 16px;
          border-bottom: 1px solid #FFEFB3;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFEFB3;
          position: relative;
        }
        .company-search-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.5;
        }
        .company-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: #013E37;
          width: 100%;
        }
        .company-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .company-clear-search {
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .company-clear-search:hover {
          opacity: 0.8;
        }
        .company-list {
          flex: 1;
          overflow-y: auto;
        }
        .company-list::-webkit-scrollbar {
          width: 4px;
        }
        .company-list::-webkit-scrollbar-track {
          background: #FFEFB3;
        }
        .company-list::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 2px;
        }
        .company-list-empty {
          padding: 40px 20px;
          text-align: center;
          color: #013E37;
          opacity: 0.6;
        }
        .company-list-empty-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 8px;
          color: #013E37;
          opacity: 0.3;
        }
        .company-list-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.15s ease;
          border-bottom: 1px solid #FFEFB3;
        }
        .company-list-item:hover {
          background: #FFEFB3;
        }
        .company-list-item-active {
          background: #FFEFB3;
          border-left: 3px solid #013E37;
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
          color: #013E37;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .company-list-meta {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .company-list-dot {
          color: #013E37;
          opacity: 0.3;
        }
        .company-list-status {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .company-list-status-active {
          background: #013E37;
          color: #ffffff;
        }
        .company-list-status-inactive {
          background: #FFEFB3;
          color: #013E37;
        }
        .company-list-arrow {
          color: #013E37;
          opacity: 0.3;
          flex-shrink: 0;
        }
        .company-list-check {
          color: #013E37;
          flex-shrink: 0;
        }
        .company-list-footer {
          padding: 8px 16px;
          border-top: 1px solid #FFEFB3;
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          text-align: center;
          background: #FAFAFA;
        }

        /* Right Panel - Company Details */
        .company-detail-panel {
          min-height: 400px;
        }
        .company-empty-state {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 60px 20px;
          text-align: center;
        }
        .company-empty-state-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .company-empty-state-icon {
          width: 32px;
          height: 32px;
        }
        .company-empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .company-empty-state p {
          margin: 0;
        }
        .company-empty-add-btn {
          margin-top: 16px;
          padding: 8px 20px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .company-empty-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }

        /* Card */
        .company-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .company-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .company-card-header {
          padding: 24px;
          border-bottom: 1px solid #FFEFB3;
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
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
          transition: transform 0.3s ease;
        }
        .company-logo-wrapper:hover {
          transform: scale(1.05);
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
          font-size: 22px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .company-name-input {
          padding: 4px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 18px;
          font-weight: 700;
          color: #013E37;
          width: 100%;
          max-width: 280px;
          outline: none;
          background: #ffffff;
          transition: all 0.2s ease;
        }
        .company-name-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .company-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
          border: 1px solid;
        }
        .company-status-active {
          background: #013E37;
          color: #ffffff;
          border-color: #013E37;
        }
        .company-status-inactive {
          background: #FFEFB3;
          color: #013E37;
          border-color: #FFEFB3;
        }
        .company-status-dot-indicator-small {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
          background: currentColor;
        }
        .company-industry-badge {
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }
        .company-slug-row {
          margin-top: 2px;
        }
        .company-slug {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #013E37;
          opacity: 0.5;
          font-size: 13px;
          margin: 0;
        }
        .company-slug-icon {
          width: 14px;
          height: 14px;
          opacity: 0.5;
        }
        .company-slug-input {
          padding: 2px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 13px;
          color: #013E37;
          width: 100%;
          max-width: 280px;
          outline: none;
          background: #ffffff;
          transition: all 0.2s ease;
        }
        .company-slug-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .company-desc-row {
          margin-top: 4px;
        }
        .company-desc {
          color: #013E37;
          opacity: 0.7;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .company-desc-textarea {
          width: 100%;
          max-width: 500px;
          padding: 6px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 13px;
          color: #013E37;
          outline: none;
          font-family: inherit;
          background: #ffffff;
          transition: all 0.2s ease;
          resize: vertical;
        }
        .company-desc-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .company-stats {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .company-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          transition: all 0.2s ease;
        }
        .company-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.1);
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
          gap: 16px;
        }
        @media (max-width: 768px) {
          .company-details-grid {
            grid-template-columns: 1fr;
          }
        }
        .company-detail-section {
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .company-detail-section:hover {
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.06);
        }
        .company-section-title {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .company-section-icon {
          width: 14px;
          height: 14px;
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
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .company-field-value {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }
        .company-field-value-with-icon {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .company-field-icon {
          width: 14px;
          height: 14px;
          opacity: 0.5;
        }
        .company-field-input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 13px;
          color: #013E37;
          outline: none;
          background: #ffffff;
          transition: all 0.2s ease;
        }
        .company-field-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .company-field-select {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 13px;
          color: #013E37;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .company-field-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .company-status-dot {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
        }
        .company-status-dot-active {
          background: #013E37;
          color: #ffffff;
        }
        .company-status-dot-inactive {
          background: #FFEFB3;
          color: #013E37;
        }
        .company-status-dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .company-status-dot-active .company-status-dot-indicator {
          background: #ffffff;
        }
        .company-status-dot-inactive .company-status-dot-indicator {
          background: #013E37;
        }

        /* Card Actions */
        .company-card-actions {
          padding: 16px 24px;
          border-top: 1px solid #FFEFB3;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          background: #F8FAFC;
        }
        .company-edit-btn-full {
          padding: 8px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          color: #ffffff;
        }
        .company-edit-btn-full:hover {
          background: #0A5C54 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }
        .company-edit-icon {
          width: 14px;
          height: 14px;
        }
        .company-cancel-btn {
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          background: transparent;
          color: #013E37;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .company-cancel-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .company-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .company-save-btn {
          padding: 8px 20px;
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
          background: #0A5C54 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
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
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .company-loading-text {
          margin-top: 12px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .company-list-panel {
            display: none;
          }
          .company-list-panel-open {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Company;