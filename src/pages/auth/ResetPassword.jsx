// pages/auth/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset link');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setPasswordError('');
    setLoading(true);

    try {
      // Direct API call for password reset
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: formData.password,
      });

      if (response.data) {
        toast.success('Password reset successfully! You can now login with your new password.');
        // Clear form data
        setFormData({
          password: '',
          confirmPassword: '',
        });
        // Navigate to login after a short delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (err) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid reset token or request.';
        } else if (err.response.status === 404) {
          errorMessage = 'Reset token not found or expired. Please request a new reset link.';
        } else if (err.response.status === 410) {
          errorMessage = 'Reset link has expired. Please request a new password reset.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decoration */}
      <div style={styles.bgDecoration1} />
      <div style={styles.bgDecoration2} />
      
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <svg style={styles.logoSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span style={styles.logoText}>Agency OS</span>
          </div>
          <h2 style={styles.title}>Create New Password</h2>
          <p style={styles.subtitle}>Enter your new password below</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              style={{
                ...styles.input,
                borderColor: passwordError ? '#dc2626' : '#e2e8f0',
              }}
              disabled={loading || !token}
              autoComplete="new-password"
            />
            {passwordError && (
              <p style={styles.errorText}>{passwordError}</p>
            )}
            <p style={styles.hintText}>
              Minimum 8 characters with at least one uppercase, one lowercase, and one number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              style={styles.input}
              disabled={loading || !token}
              autoComplete="new-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !token}
            style={{
              ...styles.submitButton,
              opacity: (loading || !token) ? 0.6 : 1,
              cursor: (loading || !token) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.loadingContainer}>
                <svg style={styles.spinner} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          {/* Footer */}
          <div style={styles.footer}>
            <Link to="/login" style={styles.linkPrimary}>
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 16px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(30, 41, 59, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(15, 23, 42, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    maxWidth: '448px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 0, 0, 0.06)',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
  },
  logoSvg: {
    width: '28px',
    height: '28px',
    color: '#ffffff',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '13px',
    margin: '4px 0 0 0',
  },
  hintText: {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '4px 0 0 0',
  },
  submitButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '4px',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.5px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    opacity: 0.25,
  },
  spinnerPath: {
    opacity: 0.75,
  },
  footer: {
    textAlign: 'center',
    paddingTop: '4px',
  },
  linkPrimary: {
    color: '#1e293b',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    display: 'inline-block',
    padding: '4px 0',
  },
};

// Add keyframe animation and hover styles
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
  
  input:focus {
    border-color: #1e293b !important;
    background-color: #ffffff !important;
    box-shadow: 0 0 0 4px rgba(30, 41, 59, 0.1) !important;
  }
  
  input:hover {
    border-color: #94a3b8 !important;
  }
  
  button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
  }
  
  button:not(:disabled):active {
    transform: translateY(0px);
  }
  
  .link-primary:hover {
    border-bottom-color: #1e293b;
    color: #0f172a;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @media (max-width: 640px) {
    .card {
      padding: 32px 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ResetPassword;