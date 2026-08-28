// pages/Documents.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  File, 
  Folder, 
  Download, 
  Upload, 
  Trash2,
  Search,
  Plus,
  FileText,
  Image,
  Video,
  Archive,
  FileCode,
  FileSpreadsheet,
  Eye,
  Share2
} from 'lucide-react';

const Documents = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');
  const [description, setDescription] = useState('');

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/documents`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setDocuments(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      let errorMessage = 'Failed to load documents.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view documents.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', currentFolder || '');
      formData.append('description', description || '');

      const response = await axios.post(`${API_URL}/clients/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        toast.success('Document uploaded successfully');
        setShowUploadModal(false);
        setSelectedFile(null);
        setCurrentFolder('');
        setDescription('');
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      let errorMessage = 'Failed to upload document.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to upload documents.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await axios.delete(`${API_URL}/clients/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Document deleted successfully');
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      let errorMessage = 'Failed to delete document.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this document.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      'pdf': <FileText style={styles.fileIcon} />,
      'doc': <FileText style={styles.fileIcon} />,
      'docx': <FileText style={styles.fileIcon} />,
      'xls': <FileSpreadsheet style={styles.fileIcon} />,
      'xlsx': <FileSpreadsheet style={styles.fileIcon} />,
      'jpg': <Image style={styles.fileIcon} />,
      'jpeg': <Image style={styles.fileIcon} />,
      'png': <Image style={styles.fileIcon} />,
      'gif': <Image style={styles.fileIcon} />,
      'mp4': <Video style={styles.fileIcon} />,
      'avi': <Video style={styles.fileIcon} />,
      'zip': <Archive style={styles.fileIcon} />,
      'rar': <Archive style={styles.fileIcon} />,
      'js': <FileCode style={styles.fileIcon} />,
      'html': <FileCode style={styles.fileIcon} />,
      'css': <FileCode style={styles.fileIcon} />
    };
    return icons[type] || <File style={styles.fileIcon} />;
  };

  const getFileTypeColor = (type) => {
    const colors = {
      'pdf': 'bg-red-100 text-red-600',
      'doc': 'bg-blue-100 text-blue-600',
      'docx': 'bg-blue-100 text-blue-600',
      'xls': 'bg-green-100 text-green-600',
      'xlsx': 'bg-green-100 text-green-600',
      'jpg': 'bg-purple-100 text-purple-600',
      'jpeg': 'bg-purple-100 text-purple-600',
      'png': 'bg-purple-100 text-purple-600',
      'mp4': 'bg-pink-100 text-pink-600',
      'zip': 'bg-yellow-100 text-yellow-600',
      'rar': 'bg-yellow-100 text-yellow-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Documents</h1>
          <p style={styles.subtitle}>Access and manage your project documents</p>
        </div>
        <button 
          style={styles.uploadButton}
          onClick={() => setShowUploadModal(true)}
        >
          <Upload style={styles.uploadIcon} />
          Upload Document
        </button>
      </div>

      {/* Search & Filter */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search style={styles.searchIcon} />}
            style={styles.searchInput}
          />
        </div>
        <button style={styles.folderButton}>
          <Folder style={styles.folderIcon} />
          All Folders
        </button>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
        </div>
      ) : (
        <div style={styles.documentsGrid}>
          {filteredDocuments.map((doc) => (
            <div key={doc._id} style={styles.documentCard}>
              <div style={styles.documentContent}>
                <div style={styles.documentHeader}>
                  <div style={styles.documentInfo}>
                    <div style={{
                      ...styles.fileIconWrapper,
                      ...parseColorStyle(getFileTypeColor(doc.type))
                    }}>
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <h4 style={styles.documentName}>{doc.name}</h4>
                      <div style={styles.documentSize}>
                        {formatFileSize(doc.size)}
                      </div>
                    </div>
                  </div>
                  <span style={styles.fileBadge}>
                    {doc.type?.toUpperCase() || 'FILE'}
                  </span>
                </div>

                <div style={styles.documentDate}>
                  Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                </div>

                <div style={styles.documentActions}>
                  <button 
                    style={{...styles.actionButton, ...styles.actionButtonOutline}}
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Eye style={styles.actionIcon} />
                    View
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.actionButtonOutline}}
                    onClick={() => window.open(doc.url, '_download')}
                  >
                    <Download style={styles.actionIcon} />
                    Download
                  </button>
                  <button 
                    style={styles.deleteButton}
                    onClick={() => handleDelete(doc._id)}
                  >
                    <Trash2 style={styles.actionIcon} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <File style={styles.emptyIcon} />
          <p style={styles.emptyText}>No documents found</p>
          <button 
            style={{...styles.uploadButton, ...styles.uploadButtonOutline}}
            onClick={() => setShowUploadModal(true)}
          >
            <Plus style={styles.uploadIcon} />
            Upload First Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setCurrentFolder('');
          setDescription('');
        }}
        title="Upload Document"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} style={styles.modalForm}>
          <div style={styles.uploadArea}>
            <input
              type="file"
              id="fileUpload"
              style={styles.hiddenInput}
              onChange={handleFileUpload}
            />
            <label htmlFor="fileUpload" style={styles.uploadLabel}>
              <Upload style={styles.uploadAreaIcon} />
              <p style={styles.uploadText}>
                {selectedFile ? selectedFile.name : 'Click to select a file'}
              </p>
              <p style={styles.uploadSubtext}>
                or drag and drop
              </p>
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Folder</label>
            <input
              type="text"
              placeholder="Folder name (optional)"
              value={currentFolder}
              onChange={(e) => setCurrentFolder(e.target.value)}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <input
              type="text"
              placeholder="Document description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.formInput}
            />
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              style={styles.modalCancelButton}
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setCurrentFolder('');
                setDescription('');
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.modalSubmitButton,
                opacity: (uploading || !selectedFile) ? 0.6 : 1,
                cursor: (uploading || !selectedFile) ? 'not-allowed' : 'pointer',
              }}
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Helper function to parse color styles
const parseColorStyle = (colorString) => {
  const parts = colorString.split(' ');
  return {
    backgroundColor: parts[0] || '#f3f4f6',
    color: parts[1] || '#6b7280'
  };
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  uploadButtonOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  uploadIcon: {
    width: '16px',
    height: '16px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    flex: 1,
    minWidth: '200px',
  },
  searchIcon: {
    width: '16px',
    height: '16px',
    color: '#9CA3AF',
  },
  searchInput: {
    width: '100%',
  },
  folderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  folderIcon: {
    width: '16px',
    height: '16px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  documentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s ease',
    overflow: 'hidden',
  },
  documentContent: {
    padding: '16px',
  },
  documentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  documentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  fileIconWrapper: {
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileIcon: {
    width: '20px',
    height: '20px',
  },
  documentName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '150px',
  },
  documentSize: {
    fontSize: '12px',
    color: '#6B7280',
  },
  fileBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '500',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    flexShrink: 0,
    marginLeft: '8px',
  },
  documentDate: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#6B7280',
  },
  documentActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F3F4F6',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  actionIcon: {
    width: '14px',
    height: '14px',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    flex: 0.5,
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
    marginBottom: '12px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  uploadArea: {
    border: '2px dashed #D1D5DB',
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center',
    transition: 'border-color 0.2s ease',
    cursor: 'pointer',
  },
  hiddenInput: {
    display: 'none',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  uploadAreaIcon: {
    width: '48px',
    height: '48px',
    color: '#9CA3AF',
    margin: '0 auto 12px',
  },
  uploadText: {
    color: '#374151',
    margin: 0,
  },
  uploadSubtext: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  formInput: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  modalCancelButton: {
    padding: '8px 16px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  modalSubmitButton: {
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .upload-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .upload-button-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .folder-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .document-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .action-button-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .delete-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #E5E7EB !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .upload-area:hover {
    border-color: #3B82F6 !important;
  }
  
  .form-input:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .upload-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .search-container {
      flex-direction: column !important;
    }
    
    .search-wrapper {
      width: 100% !important;
    }
    
    .folder-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 640px) {
    .container {
      padding: 16px !important;
    }
    
    .documents-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Documents;