import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, loading: authLoading, isAuthenticated, clearError, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardRoute(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDashboardRoute]);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_email');
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    if (savedEmail && rememberMe) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter your password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    clearError();

    try {
      const result = await login(formData.email.trim(), formData.password);
      
      if (result.success) {
        // Save remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('saved_email', formData.email.trim());
        } else {
          localStorage.removeItem('remember_me');
          localStorage.removeItem('saved_email');
        }

        toast.success(`Welcome back, ${result.user?.firstName || 'User'}! 🎉`);
        
        // Navigate to role-specific dashboard
        const dashboardRoute = result.dashboardRoute || '/dashboard';
        navigate(dashboardRoute, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgDecoration1} />
      <div style={styles.bgDecoration2} />
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <Shield style={styles.logoSvg} size={28} />
            </div>
            <span style={styles.logoText}>Agency OS</span>
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.inputIcon} size={20} />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                disabled={loading || authLoading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                disabled={loading || authLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading || authLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                style={styles.checkbox}
                disabled={loading || authLoading}
              />
              <span style={styles.checkboxText}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            style={{
              ...styles.submitButton,
              opacity: (loading || authLoading) ? 0.7 : 1,
              cursor: (loading || authLoading) ? 'not-allowed' : 'pointer',
            }}
          >
            {(loading || authLoading) ? (
              <span style={styles.loadingContainer}>
                <svg style={styles.spinner} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <LogIn size={20} />
                Sign In
              </span>
            )}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
            <span style={styles.dividerLine} />
          </div>

          <div style={styles.socialContainer}>
            <button 
              type="button"
              style={styles.socialButton} 
              disabled={loading || authLoading}
              onClick={() => toast.info('Google login coming soon!')}
            >
              <svg style={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              type="button"
              style={styles.socialButton} 
              disabled={loading || authLoading}
              onClick={() => toast.info('Facebook login coming soon!')}
            >
              <svg style={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" style={styles.linkPrimary}>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles remain the same as your existing Login.js
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
    gap: '20px',
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
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#94a3b8',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    fontSize: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#1e293b',
    cursor: 'pointer',
    borderRadius: '4px',
    border: '2px solid #cbd5e1',
    transition: 'all 0.2s ease',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#475569',
  },
  forgotLink: {
    fontSize: '14px',
    color: '#1e293b',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease',
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
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
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
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '4px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: '13px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
  },
  socialContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    transition: 'all 0.2s ease',
  },
  socialIcon: {
    width: '20px',
    height: '20px',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '4px',
  },
  footerText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  linkPrimary: {
    color: '#1e293b',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid #1e293b',
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
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  button[type="submit"]:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
  }
  
  button[type="submit"]:not(:disabled):active {
    transform: translateY(0px);
  }
  
  .social-button:hover:not(:disabled) {
    background-color: #ffffff;
    border-color: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .social-button:active:not(:disabled) {
    transform: translateY(0px);
  }
  
  .eye-button:hover:not(:disabled) {
    color: #1e293b;
  }
  
  .forgot-link:hover {
    color: #0f172a;
    text-decoration: underline;
  }
  
  .link-primary:hover {
    color: #0f172a;
    border-bottom-color: #0f172a;
  }
  
  @media (max-width: 640px) {
    .social-container {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;