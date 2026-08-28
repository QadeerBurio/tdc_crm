// pages/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Direct API call for forgot password
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.trim()
      });

      if (response.data) {
        setSubmitted(true);
        toast.success('Password reset email sent. Please check your inbox.');
      }
    } catch (err) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Email not found. Please check your email address.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid email address.';
        } else if (err.response.status === 429) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
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
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If submitted, show success message
  if (submitted) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span style={styles.logoText}>Agency OS</span>
            </div>
            
            <div style={styles.successIcon}>
              <svg style={styles.successSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 style={styles.successTitle}>Check Your Email</h2>
            <p style={styles.subtitle}>
              We've sent a password reset link to <strong style={styles.emailHighlight}>{email}</strong>
            </p>
            <p style={styles.successMessage}>
              Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <Link to="/login" style={styles.linkPrimary}>
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.loadingContainer}>
                <svg style={styles.spinner} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Reset Link...
              </span>
            ) : (
              'Send Reset Link'
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
  // Success state styles
  successIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
  },
  successSvg: {
    width: '32px',
    height: '32px',
    color: '#ffffff',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  emailHighlight: {
    color: '#1e293b',
    fontWeight: '700',
  },
  successMessage: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '12px',
    lineHeight: '1.6',
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

export default ForgotPassword;