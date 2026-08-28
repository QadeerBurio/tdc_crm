// pages/Billing.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  DollarSign, 
  Download, 
  CreditCard, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Billing = () => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingSummary, setBillingSummary] = useState({
    totalDue: 0,
    paid: 0,
    overdue: 0,
    upcoming: 0
  });
  const [paymentMethods, setPaymentMethods] = useState([]);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/billing`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        const data = response.data.data || {};
        setInvoices(data.invoices || []);
        setBillingSummary(data.summary || {
          totalDue: 0,
          paid: 0,
          overdue: 0,
          upcoming: 0
        });
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
      let errorMessage = 'Failed to load billing data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view billing.';
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

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(`${API_URL}/clients/billing/invoices/${invoiceId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients/billing/invoices/download-all`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all-invoices.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('All invoices downloaded successfully');
    } catch (err) {
      console.error('Error downloading all invoices:', err);
      toast.error('Failed to download invoices. Please try again.');
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      const response = await axios.post(`${API_URL}/clients/billing/invoices/${invoiceId}/pay`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Payment processed successfully');
        await fetchBillingData(); // Refresh data
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      let errorMessage = 'Failed to process payment.';
      
      if (err.response) {
        if (err.response.status === 402) {
          errorMessage = 'Payment failed. Please check your payment method.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'paid': <CheckCircle style={styles.statusIcon} />,
      'pending': <Clock style={styles.statusIcon} />,
      'overdue': <AlertCircle style={styles.statusIcon} />,
      'cancelled': <AlertCircle style={styles.statusIcon} />
    };
    return icons[status] || <Clock style={styles.statusIcon} />;
  };

  // Default payment methods if none exist
  const defaultPaymentMethods = [
    {
      id: 'default',
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    }
  ];

  const displayPaymentMethods = paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods;

  return (
    <div style={styles.container}>
      <div>
        <h1 style={styles.title}>Billing & Payments</h1>
        <p style={styles.subtitle}>View your invoices and payment history</p>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div>
              <p style={styles.summaryLabel}>Total Due</p>
              <p style={{...styles.summaryValue, color: '#DC2626'}}>
                {formatCurrency(billingSummary.totalDue)}
              </p>
            </div>
            <div style={{...styles.summaryIconWrapper, backgroundColor: '#FEE2E2'}}>
              <DollarSign style={{...styles.summaryIcon, color: '#DC2626'}} />
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div>
              <p style={styles.summaryLabel}>Paid</p>
              <p style={{...styles.summaryValue, color: '#16A34A'}}>
                {formatCurrency(billingSummary.paid)}
              </p>
            </div>
            <div style={{...styles.summaryIconWrapper, backgroundColor: '#D1FAE5'}}>
              <CheckCircle style={{...styles.summaryIcon, color: '#16A34A'}} />
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div>
              <p style={styles.summaryLabel}>Overdue</p>
              <p style={{...styles.summaryValue, color: '#EA580C'}}>
                {formatCurrency(billingSummary.overdue)}
              </p>
            </div>
            <div style={{...styles.summaryIconWrapper, backgroundColor: '#FFEDD5'}}>
              <AlertCircle style={{...styles.summaryIcon, color: '#EA580C'}} />
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div>
              <p style={styles.summaryLabel}>Upcoming</p>
              <p style={{...styles.summaryValue, color: '#2563EB'}}>
                {formatCurrency(billingSummary.upcoming)}
              </p>
            </div>
            <div style={{...styles.summaryIconWrapper, backgroundColor: '#DBEAFE'}}>
              <Calendar style={{...styles.summaryIcon, color: '#2563EB'}} />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div style={styles.invoicesCard}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <FileText style={styles.cardHeaderIcon} />
            <h3 style={styles.cardTitle}>Invoices</h3>
          </div>
          <button style={styles.downloadAllButton} onClick={handleDownloadAll}>
            <Download style={styles.buttonIcon} />
            Download All
          </button>
        </div>
        <div style={styles.cardContent}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
            </div>
          ) : invoices.length === 0 ? (
            <div style={styles.emptyState}>
              No invoices available
            </div>
          ) : (
            <div style={styles.invoicesList}>
              {invoices.map((invoice) => (
                <div key={invoice._id} style={styles.invoiceItem}>
                  <div style={styles.invoiceInfo}>
                    <div style={styles.invoiceHeader}>
                      <span style={styles.invoiceNumber}>
                        Invoice #{invoice.number}
                      </span>
                      <span style={{
                        ...styles.invoiceStatus,
                        ...parseColorStyle(getStatusColor(invoice.status))
                      }}>
                        <span style={styles.statusIconWrapper}>
                          {getStatusIcon(invoice.status)}
                        </span>
                        <span style={styles.statusText}>
                          {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'N/A'}
                        </span>
                      </span>
                    </div>
                    <div style={styles.invoiceMeta}>
                      <span>{new Date(invoice.date).toLocaleDateString()}</span>
                      <span style={styles.metaSeparator}>•</span>
                      <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      <span style={styles.metaSeparator}>•</span>
                      <span>{invoice.items?.length || 0} items</span>
                    </div>
                  </div>
                  <div style={styles.invoiceActions}>
                    <div style={styles.invoiceTotal}>
                      {formatCurrency(invoice.total)}
                    </div>
                    <div style={styles.invoiceButtons}>
                      <button 
                        style={styles.invoiceActionButton}
                        onClick={() => handleDownloadInvoice(invoice._id)}
                      >
                        <Printer style={styles.actionIcon} />
                      </button>
                      <button 
                        style={styles.invoiceActionButton}
                        onClick={() => handleDownloadInvoice(invoice._id)}
                      >
                        <Download style={styles.actionIcon} />
                      </button>
                      {invoice.status === 'pending' && (
                        <button 
                          style={styles.payNowButton}
                          onClick={() => handlePayInvoice(invoice._id)}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div style={styles.paymentCard}>
        <div style={styles.cardHeader}>
          <CreditCard style={styles.cardHeaderIcon} />
          <h3 style={styles.cardTitle}>Payment Methods</h3>
        </div>
        <div style={styles.cardContent}>
          <div style={styles.paymentMethodsList}>
            {displayPaymentMethods.map((method) => (
              <div key={method.id} style={styles.paymentMethodItem}>
                <div style={styles.paymentMethodInfo}>
                  <div style={styles.paymentMethodIcon}>
                    <CreditCard style={styles.paymentMethodIconSvg} />
                  </div>
                  <div>
                    <div style={styles.paymentMethodType}>
                      {method.type} ending in {method.last4}
                    </div>
                    <div style={styles.paymentMethodExpiry}>
                      Expires {method.expiry}
                    </div>
                  </div>
                </div>
                {method.isDefault && (
                  <span style={styles.defaultBadge}>Default</span>
                )}
              </div>
            ))}
          </div>
          <button style={styles.addPaymentButton}>
            <Plus style={styles.buttonIcon} />
            Add Payment Method
          </button>
        </div>
      </div>
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '24px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  summaryContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  summaryIconWrapper: {
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    width: '24px',
    height: '24px',
  },
  invoicesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardHeaderIcon: {
    width: '20px',
    height: '20px',
    color: '#6B7280',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  downloadAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIcon: {
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
  emptyState: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#6B7280',
  },
  invoicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  invoiceItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    flexWrap: 'wrap',
    gap: '12px',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  invoiceNumber: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  invoiceStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusIconWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  statusIcon: {
    width: '14px',
    height: '14px',
  },
  statusText: {
    textTransform: 'capitalize',
  },
  invoiceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  metaSeparator: {
    color: '#D1D5DB',
  },
  invoiceActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  invoiceTotal: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  invoiceButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  invoiceActionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    width: '14px',
    height: '14px',
  },
  payNowButton: {
    padding: '6px 12px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  paymentMethodsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  paymentMethodItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
  },
  paymentMethodInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  paymentMethodIcon: {
    padding: '8px',
    backgroundColor: '#DBEAFE',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodIconSvg: {
    width: '20px',
    height: '20px',
    color: '#2563EB',
  },
  paymentMethodType: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  paymentMethodExpiry: {
    fontSize: '12px',
    color: '#6B7280',
  },
  defaultBadge: {
    padding: '4px 8px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  addPaymentButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  
  .download-all-button:hover {
    background-color: #F9FAFB !important;
  }
  
  .invoice-item:hover {
    background-color: #F3F4F6 !important;
  }
  
  .invoice-action-button:hover {
    background-color: #F9FAFB !important;
  }
  
  .pay-now-button:hover {
    background-color: #2563EB !important;
  }
  
  .add-payment-button:hover {
    background-color: #F9FAFB !important;
  }
  
  @media (max-width: 768px) {
    .summary-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .invoice-item {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .invoice-actions {
      justify-content: space-between !important;
      width: 100% !important;
    }
    
    .invoice-buttons {
      flex-wrap: wrap !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .summary-grid {
      grid-template-columns: 1fr !important;
    }
    
    .card-header {
      flex-direction: column !important;
      gap: 12px !important;
    }
    
    .download-all-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .invoice-header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Billing;