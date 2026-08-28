import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, isAuthenticated, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    acceptTerms: false,
  });

  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardRoute(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDashboardRoute]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setPasswordError('');
    setLoading(true);

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (result.success) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'employee',
          acceptTerms: false,
        });
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
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
              <svg style={styles.logoSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span style={styles.logoText}>Agency OS</span>
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join Agency OS and start your journey</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          <div style={styles.nameContainer}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name</label>
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                style={styles.input}
                disabled={loading}
                autoComplete="given-name"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                style={styles.input}
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
              disabled={loading}
            >
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </select>
            <p style={styles.hintText}>Select your role to get started</p>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              style={{
                ...styles.input,
                borderColor: passwordError ? '#dc2626' : '#e2e8f0',
              }}
              disabled={loading}
              autoComplete="new-password"
            />
            {passwordError && (
              <p style={styles.errorText}>{passwordError}</p>
            )}
            <p style={styles.hintText}>
              Minimum 8 characters with at least one uppercase, one lowercase, and one number
            </p>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={styles.input}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div style={styles.checkboxContainer}>
            <input
              id="accept-terms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              style={styles.checkbox}
              disabled={loading}
            />
            <label htmlFor="accept-terms" style={styles.checkboxLabel}>
              I agree to the{' '}
              <Link to="/terms" style={styles.link}>
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" style={styles.link}>
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={!formData.acceptTerms || loading}
            style={{
              ...styles.submitButton,
              opacity: (!formData.acceptTerms || loading) ? 0.6 : 1,
              cursor: (!formData.acceptTerms || loading) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.loadingContainer}>
                <svg style={styles.spinner} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.linkPrimary}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles remain the same as your existing Register.js
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
    gap: '20px',
  },
  nameContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
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
  select: {
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
    cursor: 'pointer',
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '4px 0',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    marginTop: '2px',
    accentColor: '#1e293b',
    cursor: 'pointer',
    borderRadius: '4px',
    border: '2px solid #cbd5e1',
    transition: 'all 0.2s ease',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
  },
  link: {
    color: '#1e293b',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease',
  },
  linkPrimary: {
    color: '#1e293b',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid #1e293b',
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
    marginTop: '8px',
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
  footerText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
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
  
  input:focus, select:focus {
    border-color: #1e293b !important;
    background-color: #ffffff !important;
    box-shadow: 0 0 0 4px rgba(30, 41, 59, 0.1) !important;
  }
  
  input:hover, select:hover {
    border-color: #94a3b8 !important;
  }
  
  button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
  }
  
  button:not(:disabled):active {
    transform: translateY(0px);
  }
  
  a:hover {
    color: #0f172a !important;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @media (max-width: 640px) {
    .name-container {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Register;