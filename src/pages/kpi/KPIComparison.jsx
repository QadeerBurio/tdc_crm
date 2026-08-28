// pages/kpi/KPIComparison.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart2, TrendingUp, TrendingDown, Target,
  CheckCircle, AlertCircle, Users, Filter,
  Download, RefreshCw, ArrowRight, ArrowLeft,
  Plus, X, Calendar, Activity, Zap,
  Award, Star, Layers, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, RadarChart, 
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const KPIComparison = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [availableKPIs, setAvailableKPIs] = useState([]);
  const [viewType, setViewType] = useState('bar');
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  useEffect(() => {
    fetchAvailableKPIs();
    if (selectedKPIs.length > 0) {
      fetchComparisonData();
    } else {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (selectedKPIs.length > 0) {
      fetchComparisonData();
    }
  }, [selectedKPIs]);

  const fetchComparisonData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (selectedKPIs.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('period', period);
      selectedKPIs.forEach(id => params.append('kpiIds', id));
      
      const response = await fetch(
        `${API_URL}/kpis/comparison?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data || []);
        } else {
          console.warn('API returned error:', result.message);
          setData(getMockComparisonData());
          toast.info('Showing sample comparison data');
        }
      } else {
        console.warn('API request failed, using mock data');
        setData(getMockComparisonData());
        toast.info('Showing sample comparison data');
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setData(getMockComparisonData());
      toast.error('Failed to load comparison data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableKPIs = async () => {
    try {
      const response = await fetch(
        `${API_URL}/kpis/definitions?isActive=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const kpis = result.data || [];
          setAvailableKPIs(kpis);
          // Auto-select first 3 KPIs if none selected
          if (selectedKPIs.length === 0 && kpis.length > 0) {
            const defaultSelection = kpis.slice(0, 3).map(k => k._id);
            setSelectedKPIs(defaultSelection);
          }
        } else {
          setAvailableKPIs(getMockKPIs());
        }
      } else {
        setAvailableKPIs(getMockKPIs());
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setAvailableKPIs(getMockKPIs());
    }
  };

  const getMockKPIs = () => {
    return [
      { _id: '1', name: 'Revenue Growth', category: 'financial' },
      { _id: '2', name: 'Customer Satisfaction', category: 'satisfaction' },
      { _id: '3', name: 'Employee Engagement', category: 'growth' },
      { _id: '4', name: 'Project Completion', category: 'productivity' },
      { _id: '5', name: 'Client Retention', category: 'retention' },
      { _id: '6', name: 'Operational Efficiency', category: 'efficiency' }
    ];
  };

  const getMockComparisonData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, idx) => {
      const item = { name: month };
      selectedKPIs.forEach((id, index) => {
        item[`kpi_${id}`] = Math.round(60 + Math.random() * 35);
      });
      return item;
    });
  };

  const toggleKPI = (kpiId) => {
    if (selectedKPIs.includes(kpiId)) {
      setSelectedKPIs(selectedKPIs.filter(id => id !== kpiId));
    } else {
      if (selectedKPIs.length >= 6) {
        toast.error('Maximum 6 KPIs can be compared');
        return;
      }
      setSelectedKPIs([...selectedKPIs, kpiId]);
    }
  };

  const handleRefresh = () => {
    fetchComparisonData(true);
  };

  const filteredKPIs = availableKPIs.filter(kpi =>
    kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kpi.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getKpiName = (id) => {
    const kpi = availableKPIs.find(k => k._id === id);
    return kpi?.name || 'KPI';
  };

  const getKpiCategory = (id) => {
    const kpi = availableKPIs.find(k => k._id === id);
    return kpi?.category || '';
  };

  const getCategoryColor = (category) => {
    const colors = {
      productivity: 'kc-cat-productivity',
      quality: 'kc-cat-quality',
      efficiency: 'kc-cat-efficiency',
      satisfaction: 'kc-cat-satisfaction',
      growth: 'kc-cat-growth',
      retention: 'kc-cat-retention',
      financial: 'kc-cat-financial'
    };
    return colors[category] || 'kc-cat-default';
  };

  if (loading && selectedKPIs.length > 0) {
    return (
      <div className="kc-loading">
        <div className="kc-spinner"></div>
        <p className="kc-loading-text">Loading comparison data...</p>
      </div>
    );
  }

  return (
    <div className="kc-container">
      {/* Header */}
      <div className="kc-header">
        <div className="kc-header-left">
          <div className="kc-title-wrapper">
            <div className="kc-title-icon">
              <BarChart2 className="kc-title-svg" />
            </div>
            <div>
              <h1 className="kc-title">KPI Comparison</h1>
              <p className="kc-subtitle">Compare multiple KPIs side by side</p>
            </div>
          </div>
        </div>
        <div className="kc-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="kc-select"
          >
            <option value="weekly">📅 Weekly</option>
            <option value="monthly">📅 Monthly</option>
            <option value="quarterly">📅 Quarterly</option>
            <option value="annual">📅 Annual</option>
          </select>
          <div className="kc-view-toggle">
            <button
              onClick={() => setViewType('bar')}
              className={`kc-view-btn ${viewType === 'bar' ? 'kc-view-active' : 'kc-view-inactive'}`}
              title="Bar Chart"
            >
              <BarChart2 className="kc-view-icon" />
            </button>
            <button
              onClick={() => setViewType('line')}
              className={`kc-view-btn ${viewType === 'line' ? 'kc-view-active' : 'kc-view-inactive'}`}
              title="Line Chart"
            >
              <TrendingUp className="kc-view-icon" />
            </button>
            <button
              onClick={() => setViewType('radar')}
              className={`kc-view-btn ${viewType === 'radar' ? 'kc-view-active' : 'kc-view-inactive'}`}
              title="Radar Chart"
            >
              <Activity className="kc-view-icon" />
            </button>
          </div>
          <button className="kc-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`kc-refresh-icon ${refreshing ? 'kc-spin' : ''}`} />
          </button>
          <button className="kc-icon-btn">
            <Download className="kc-btn-icon" />
          </button>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="kc-add-btn"
          >
            <Plus className="kc-btn-icon" />
            Add KPI
          </button>
        </div>
      </div>

      {/* Selected KPIs */}
      {selectedKPIs.length > 0 && (
        <div className="kc-selected">
          <span className="kc-selected-label">Selected KPIs:</span>
          <div className="kc-selected-list">
            {selectedKPIs.map((id, index) => (
              <div 
                key={id} 
                className="kc-selected-item"
                style={{ borderColor: COLORS[index % COLORS.length] }}
              >
                <span className="kc-selected-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="kc-selected-name">{getKpiName(id)}</span>
                <button
                  onClick={() => toggleKPI(id)}
                  className="kc-selected-remove"
                >
                  <X className="kc-selected-remove-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Selector Modal */}
      {showSelector && (
        <div className="kc-modal-overlay" onClick={() => setShowSelector(false)}>
          <div className="kc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kc-modal-header">
              <div className="kc-modal-title-wrapper">
                <Eye className="kc-modal-icon" />
                <h3 className="kc-modal-title">Select KPIs to Compare</h3>
              </div>
              <button className="kc-modal-close" onClick={() => setShowSelector(false)}>
                <X className="kc-modal-close-icon" />
              </button>
            </div>
            
            <div className="kc-modal-search">
              <input
                type="text"
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="kc-modal-search-input"
              />
            </div>

            <div className="kc-modal-body">
              <div className="kc-modal-grid">
                {filteredKPIs.map((kpi) => {
                  const isSelected = selectedKPIs.includes(kpi._id);
                  return (
                    <div
                      key={kpi._id}
                      className={`kc-modal-item ${isSelected ? 'kc-modal-item-selected' : ''}`}
                      onClick={() => toggleKPI(kpi._id)}
                    >
                      <div className="kc-modal-item-left">
                        <div className={`kc-modal-item-check ${isSelected ? 'kc-modal-item-checked' : ''}`}>
                          {isSelected && <CheckCircle className="kc-modal-item-check-icon" />}
                        </div>
                        <div>
                          <p className="kc-modal-item-name">{kpi.name}</p>
                          <span className={`kc-modal-item-category ${getCategoryColor(kpi.category)}`}>
                            {kpi.category || 'General'}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="kc-modal-item-indicator" />
                      )}
                    </div>
                  );
                })}
                {filteredKPIs.length === 0 && (
                  <div className="kc-modal-empty">
                    <Target className="kc-modal-empty-icon" />
                    <p>No KPIs found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="kc-modal-footer">
              <div className="kc-modal-footer-info">
                <span className="kc-modal-footer-count">
                  {selectedKPIs.length} KPI{selectedKPIs.length !== 1 ? 's' : ''} selected
                </span>
                <span className="kc-modal-footer-max">(Max 6)</span>
              </div>
              <button
                onClick={() => {
                  setShowSelector(false);
                  if (selectedKPIs.length > 0) {
                    fetchComparisonData();
                  }
                }}
                className="kc-modal-apply"
              >
                <CheckCircle className="kc-btn-icon" />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {selectedKPIs.length === 0 ? (
        <div className="kc-empty">
          <div className="kc-empty-icon-wrapper">
            <BarChart2 className="kc-empty-icon" />
          </div>
          <h3 className="kc-empty-title">No KPIs Selected</h3>
          <p className="kc-empty-subtitle">Click "Add KPI" to start comparing performance metrics</p>
          <button className="kc-empty-btn" onClick={() => setShowSelector(true)}>
            <Plus className="kc-btn-icon" />
            Add KPI
          </button>
        </div>
      ) : (
        <div className="kc-chart-wrapper">
          <div className="kc-chart-card">
            <div className="kc-chart-header">
              <h3 className="kc-chart-title">
                {viewType === 'bar' && 'Bar Chart Comparison'}
                {viewType === 'line' && 'Line Chart Comparison'}
                {viewType === 'radar' && 'Radar Chart Comparison'}
              </h3>
              <span className="kc-chart-badge">
                {selectedKPIs.length} KPIs
              </span>
            </div>
            <div className="kc-chart-body">
              <ResponsiveContainer width="100%" height={350}>
                {viewType === 'bar' ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Legend />
                    {selectedKPIs.map((id, index) => (
                      <Bar 
                        key={id} 
                        dataKey={`kpi_${id}`} 
                        name={getKpiName(id)}
                        fill={COLORS[index % COLORS.length]} 
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                ) : viewType === 'line' ? (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Legend />
                    {selectedKPIs.map((id, index) => (
                      <Line 
                        key={id} 
                        type="monotone" 
                        dataKey={`kpi_${id}`}
                        name={getKpiName(id)}
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <RadarChart outerRadius={150} data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <PolarRadiusAxis stroke="#94a3b8" fontSize={12} />
                    {selectedKPIs.map((id, index) => (
                      <Radar 
                        key={id} 
                        name={getKpiName(id)}
                        dataKey={`kpi_${id}`} 
                        stroke={COLORS[index % COLORS.length]} 
                        fill={COLORS[index % COLORS.length]} 
                        fillOpacity={0.2} 
                      />
                    ))}
                    <Legend />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="kc-chart-legend">
              {selectedKPIs.map((id, index) => (
                <div key={id} className="kc-legend-item">
                  <div 
                    className="kc-legend-dot"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="kc-legend-name">{getKpiName(id)}</span>
                  <span className={`kc-legend-category ${getCategoryColor(getKpiCategory(id))}`}>
                    {getKpiCategory(id) || 'General'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="kc-table-wrapper">
            <div className="kc-table-header">
              <h3 className="kc-table-title">Comparison Summary</h3>
              <span className="kc-table-count">{data.length} periods</span>
            </div>
            <div className="kc-table-container">
              <table className="kc-table">
                <thead>
                  <tr>
                    <th className="kc-table-th">Period</th>
                    {selectedKPIs.map((id, index) => (
                      <th key={id} className="kc-table-th">
                        <span className="kc-table-th-inner">
                          <span 
                            className="kc-table-th-dot"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {getKpiName(id)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx} className="kc-table-row">
                      <td className="kc-table-td kc-table-td-name">{item.name}</td>
                      {selectedKPIs.map((id) => (
                        <td key={id} className="kc-table-td kc-table-td-value">
                          {item[`kpi_${id}`] !== undefined ? item[`kpi_${id}`] : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={selectedKPIs.length + 1} className="kc-table-empty">
                        <div className="kc-table-empty-state">
                          <Activity className="kc-table-empty-icon" />
                          <p>No data available</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .kc-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: kcFadeIn 0.4s ease;
        }

        @keyframes kcFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .kc-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .kc-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: kcSpin 0.8s linear infinite;
        }

        .kc-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes kcSpin {
          to { transform: rotate(360deg); }
        }

        .kc-spin {
          animation: kcSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .kc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .kc-header-left {
          display: flex;
          align-items: center;
        }

        .kc-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kc-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .kc-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .kc-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .kc-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kc-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .kc-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .kc-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kc-view-toggle {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .kc-view-btn {
          padding: 6px 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .kc-view-active {
          background: #3b82f6;
          color: #ffffff;
        }

        .kc-view-inactive {
          background: #ffffff;
          color: #94a3b8;
        }

        .kc-view-inactive:hover {
          background: #f1f5f9;
        }

        .kc-view-icon {
          width: 16px;
          height: 16px;
        }

        .kc-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .kc-icon-btn:hover {
          background: #f1f5f9;
        }

        .kc-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .kc-btn-icon {
          width: 16px;
          height: 16px;
        }

        .kc-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .kc-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* ============================================
           SELECTED KPIs
           ============================================ */
        .kc-selected {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .kc-selected-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
        }

        .kc-selected-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .kc-selected-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 8px;
          border-radius: 9999px;
          border: 2px solid;
          background: #f8fafc;
        }

        .kc-selected-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .kc-selected-name {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .kc-selected-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .kc-selected-remove:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .kc-selected-remove-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .kc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: kcFadeIn 0.3s ease;
        }

        .kc-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: kcModalIn 0.3s ease;
        }

        @keyframes kcModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .kc-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .kc-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kc-modal-icon {
          width: 24px;
          height: 24px;
          color: #3b82f6;
        }

        .kc-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .kc-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kc-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .kc-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .kc-modal-search {
          padding: 12px 24px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .kc-modal-search-input {
          width: 100%;
          padding: 8px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .kc-modal-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kc-modal-body {
          padding: 16px 24px;
          overflow-y: auto;
          flex: 1;
        }

        .kc-modal-body::-webkit-scrollbar {
          width: 4px;
        }

        .kc-modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .kc-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .kc-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .kc-modal-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kc-modal-item:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .kc-modal-item-selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .kc-modal-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .kc-modal-item-check {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .kc-modal-item-checked {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .kc-modal-item-check-icon {
          width: 14px;
          height: 14px;
          color: #ffffff;
        }

        .kc-modal-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .kc-modal-item-category {
          font-size: 10px;
          font-weight: 500;
          padding: 1px 8px;
          border-radius: 10px;
          margin-left: 6px;
        }

        .kc-cat-productivity { background: #dbeafe; color: #1d4ed8; }
        .kc-cat-quality { background: #d1fae5; color: #065f46; }
        .kc-cat-efficiency { background: #f3e8ff; color: #6d28d9; }
        .kc-cat-satisfaction { background: #fef3c7; color: #92400e; }
        .kc-cat-growth { background: #d1fae5; color: #065f46; }
        .kc-cat-retention { background: #ffedd5; color: #9a3412; }
        .kc-cat-financial { background: #fee2e2; color: #991b1b; }
        .kc-cat-default { background: #f3f4f6; color: #374151; }

        .kc-modal-item-indicator {
          width: 4px;
          height: 24px;
          background: #3b82f6;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .kc-modal-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          color: #94a3b8;
        }

        .kc-modal-empty-icon {
          width: 32px;
          height: 32px;
          opacity: 0.3;
          margin-bottom: 8px;
        }

        .kc-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .kc-modal-footer-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .kc-modal-footer-count {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .kc-modal-footer-max {
          font-size: 12px;
          color: #94a3b8;
        }

        .kc-modal-apply {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .kc-modal-apply:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .kc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .kc-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .kc-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .kc-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kc-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .kc-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .kc-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           CHART
           ============================================ */
        .kc-chart-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .kc-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .kc-chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .kc-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .kc-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kc-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .kc-chart-body {
          width: 100%;
          height: 350px;
        }

        .kc-chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .kc-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kc-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .kc-legend-name {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .kc-legend-category {
          font-size: 10px;
          font-weight: 500;
          padding: 1px 8px;
          border-radius: 10px;
        }

        /* ============================================
           TABLE
           ============================================ */
        .kc-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .kc-table-wrapper:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .kc-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .kc-table-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kc-table-count {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .kc-table-container {
          overflow-x: auto;
          padding: 0 4px;
        }

        .kc-table {
          width: 100%;
          border-collapse: collapse;
        }

        .kc-table-th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .kc-table-th-inner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kc-table-th-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .kc-table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .kc-table-row:hover {
          background: #f8fafc;
        }

        .kc-table-td {
          padding: 10px 16px;
          font-size: 14px;
          color: #0f172a;
        }

        .kc-table-td-name {
          font-weight: 500;
        }

        .kc-table-td-value {
          font-weight: 600;
        }

        .kc-table-empty {
          text-align: center;
          padding: 40px 20px;
        }

        .kc-table-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
        }

        .kc-table-empty-icon {
          width: 32px;
          height: 32px;
          opacity: 0.3;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .kc-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .kc-container {
            padding: 16px;
          }

          .kc-header {
            flex-direction: column;
            align-items: stretch;
          }

          .kc-header-right {
            flex-wrap: wrap;
          }

          .kc-select {
            flex: 1;
          }

          .kc-add-btn {
            flex: 1;
            justify-content: center;
          }

          .kc-selected {
            flex-direction: column;
            align-items: flex-start;
          }

          .kc-chart-body {
            height: 280px;
          }

          .kc-modal {
            max-width: 100%;
            margin: 16px;
            max-height: 90vh;
          }

          .kc-modal-grid {
            grid-template-columns: 1fr;
          }

          .kc-title {
            font-size: 22px;
          }

          .kc-title-icon {
            width: 40px;
            height: 40px;
          }

          .kc-title-svg {
            width: 20px;
            height: 20px;
          }

          .kc-table-th,
          .kc-table-td {
            padding: 8px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .kc-container {
            padding: 12px;
          }

          .kc-header-right {
            flex-direction: column;
          }

          .kc-select {
            width: 100%;
          }

          .kc-view-toggle {
            width: 100%;
          }

          .kc-view-btn {
            flex: 1;
          }

          .kc-add-btn {
            width: 100%;
          }

          .kc-icon-btn {
            align-self: flex-end;
          }

          .kc-title-wrapper {
            gap: 10px;
          }

          .kc-title {
            font-size: 20px;
          }

          .kc-subtitle {
            font-size: 13px;
          }

          .kc-chart-body {
            height: 220px;
          }

          .kc-modal {
            padding: 0;
          }

          .kc-modal-header {
            padding: 16px 18px;
          }

          .kc-modal-body {
            padding: 12px 16px;
          }

          .kc-modal-footer {
            flex-direction: column;
            gap: 12px;
          }

          .kc-modal-apply {
            width: 100%;
            justify-content: center;
          }

          .kc-chart-card {
            padding: 16px;
          }

          .kc-table-th,
          .kc-table-td {
            padding: 6px 10px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default KPIComparison;