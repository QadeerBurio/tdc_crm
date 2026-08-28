// components/reports/ReportExport.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Download, FileText, FileSpreadsheet, FileJson,
  FileArchive, X, Check, AlertCircle,
  Calendar, Filter, RefreshCw,
  Loader, File, FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportExport = ({ 
  reportId, 
  reportName,
  isOpen, 
  onClose,
  onExportComplete 
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/reports/${reportId}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          options: {
            includeCharts,
            includeTables,
            includeSummary
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccess(true);
          
          // Handle download
          const data = result.data;
          if (data.url) {
            // Open in new tab or trigger download
            window.open(data.url, '_blank');
            setDownloadUrl(data.url);
          } else if (data.fileData) {
            // Handle base64 or blob data
            const link = document.createElement('a');
            link.href = data.fileData;
            link.download = `report.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          
          toast.success('Report exported successfully!');
          if (onExportComplete) onExportComplete(data);
          
          // Close after delay
          setTimeout(() => {
            onClose();
            setSuccess(false);
          }, 3000);
        } else {
          throw new Error(result.message || 'Failed to export report');
        }
      } else {
        throw new Error('Failed to export report');
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err.message || 'Failed to export report');
      toast.error(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Portable Document Format' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel Spreadsheet' },
    { value: 'csv', label: 'CSV', icon: File, description: 'Comma Separated Values' },
    { value: 'json', label: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' },
    { value: 'zip', label: 'ZIP Archive', icon: FileArchive, description: 'Compressed Archive' }
  ];

  if (!isOpen) return null;

  return (
    <div className="re-modal-overlay" onClick={onClose}>
      <div className="re-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="re-modal-header">
          <div className="re-modal-title-wrapper">
            <div className="re-modal-icon-wrapper">
              <Download className="re-modal-icon" />
            </div>
            <div>
              <h3 className="re-modal-title">Export Report</h3>
              {reportName && (
                <p className="re-modal-subtitle">{reportName}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="re-modal-close">
            <X className="re-modal-close-icon" />
          </button>
        </div>

        {success ? (
          <div className="re-success">
            <div className="re-success-icon-wrapper">
              <Check className="re-success-icon" />
            </div>
            <h4 className="re-success-title">Export Successful!</h4>
            <p className="re-success-text">Your file is being downloaded</p>
            {downloadUrl && (
              <a 
                href={downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="re-success-link"
              >
                Click here if download doesn't start
              </a>
            )}
          </div>
        ) : (
          <div className="re-content">
            {/* Error */}
            {error && (
              <div className="re-error">
                <AlertCircle className="re-error-icon" />
                <p className="re-error-text">{error}</p>
              </div>
            )}

            {/* Format Selection */}
            <div className="re-section">
              <label className="re-label">Export Format</label>
              <div className="re-format-grid">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = format === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setFormat(option.value)}
                      className={`re-format-btn ${isSelected ? 're-format-selected' : ''}`}
                    >
                      <Icon className={`re-format-icon ${isSelected ? 're-format-icon-selected' : ''}`} />
                      <span className="re-format-label">{option.label}</span>
                      <span className="re-format-desc">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="re-section">
              <label className="re-label">Include</label>
              <div className="re-options">
                <label className="re-option">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="re-checkbox"
                  />
                  <span className="re-option-label">Charts & Visualizations</span>
                </label>
                <label className="re-option">
                  <input
                    type="checkbox"
                    checked={includeTables}
                    onChange={(e) => setIncludeTables(e.target.checked)}
                    className="re-checkbox"
                  />
                  <span className="re-option-label">Data Tables</span>
                </label>
                <label className="re-option">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="re-checkbox"
                  />
                  <span className="re-option-label">Executive Summary</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="re-actions">
              <button
                onClick={onClose}
                className="re-btn-cancel"
                disabled={exporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="re-btn-export"
              >
                {exporting ? (
                  <>
                    <div className="re-spinner-small"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="re-btn-icon" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           MODAL OVERLAY
           ============================================ */
        .re-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          animation: reFadeIn 0.3s ease;
        }

        @keyframes reFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .re-modal {
          position: relative;
          background: #ffffff;
          border-radius: 16px;
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: reSlideUp 0.3s ease;
        }

        @keyframes reSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes reSpin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           HEADER
           ============================================ */
        .re-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .re-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .re-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .re-modal-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .re-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .re-modal-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .re-modal-close {
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
          flex-shrink: 0;
        }

        .re-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .re-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           SUCCESS STATE
           ============================================ */
        .re-success {
          text-align: center;
          padding: 48px 24px;
        }

        .re-success-icon-wrapper {
          width: 72px;
          height: 72px;
          background: #d1fae5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .re-success-icon {
          width: 36px;
          height: 36px;
          color: #22c55e;
        }

        .re-success-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .re-success-text {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 12px 0;
        }

        .re-success-link {
          display: inline-block;
          font-size: 14px;
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }

        .re-success-link:hover {
          color: #2563eb;
        }

        /* ============================================
           CONTENT
           ============================================ */
        .re-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ============================================
           ERROR
           ============================================ */
        .re-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .re-error-icon {
          width: 18px;
          height: 18px;
          color: #ef4444;
          flex-shrink: 0;
        }

        .re-error-text {
          font-size: 14px;
          color: #991b1b;
          margin: 0;
        }

        /* ============================================
           SECTION
           ============================================ */
        .re-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .re-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        /* ============================================
           FORMAT GRID
           ============================================ */
        .re-format-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .re-format-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .re-format-btn:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .re-format-selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .re-format-selected:hover {
          border-color: #2563eb;
          background: #dbeafe;
        }

        .re-format-icon {
          width: 20px;
          height: 20px;
          color: #94a3b8;
        }

        .re-format-icon-selected {
          color: #3b82f6;
        }

        .re-format-label {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .re-format-desc {
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
        }

        /* ============================================
           OPTIONS
           ============================================ */
        .re-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .re-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 6px;
          transition: background 0.2s ease;
        }

        .re-option:hover {
          background: #f8fafc;
        }

        .re-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .re-option-label {
          font-size: 14px;
          color: #0f172a;
        }

        /* ============================================
           ACTIONS
           ============================================ */
        .re-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .re-btn-cancel {
          padding: 8px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .re-btn-cancel:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .re-btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .re-btn-export {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .re-btn-export:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .re-btn-export:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .re-btn-icon {
          width: 16px;
          height: 16px;
        }

        .re-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: reSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 480px) {
          .re-modal {
            max-width: 100%;
            margin: 0 16px;
            max-height: 95vh;
          }

          .re-modal-header {
            padding: 16px 18px;
          }

          .re-content {
            padding: 18px;
          }

          .re-format-grid {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }

          .re-format-btn {
            padding: 8px 6px;
          }

          .re-format-label {
            font-size: 12px;
          }

          .re-actions {
            flex-direction: column;
          }

          .re-btn-cancel,
          .re-btn-export {
            width: 100%;
            justify-content: center;
          }

          .re-modal-title {
            font-size: 16px;
          }
        }

        /* Scrollbar */
        .re-modal::-webkit-scrollbar {
          width: 6px;
        }

        .re-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .re-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .re-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ReportExport;