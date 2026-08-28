// components/layout/Footer.jsx
import React from 'react';
import { Heart, Github, Twitter, Linkedin, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Left Section */}
        <div style={styles.leftSection}>
          <span style={styles.copyright}>
            &copy; {currentYear} AgencyOS. All rights reserved.
          </span>
          <div style={styles.divider} />
          <div style={styles.links}>
            <a href="#" style={styles.link}>Privacy</a>
            <a href="#" style={styles.link}>Terms</a>
            <a href="#" style={styles.link}>Support</a>
          </div>
        </div>

        {/* Center Section */}
        <div style={styles.centerSection}>
          <span style={styles.madeWith}>
            Made with
            <Heart size={14} style={styles.heartIcon} />
            for agencies
          </span>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          <div style={styles.socialLinks}>
            <a href="#" style={styles.socialLink} aria-label="Github">
              <Github size={16} />
            </a>
            <a href="#" style={styles.socialLink} aria-label="Twitter">
              <Twitter size={16} />
            </a>
            <a href="#" style={styles.socialLink} aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="#" style={styles.socialLink} aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
          
          <button
            onClick={scrollToTop}
            style={styles.scrollButton}
            aria-label="Scroll to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    padding: '16px 24px',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  copyright: {
    fontSize: '13px',
    color: '#6b7280',
  },
  divider: {
    width: '1px',
    height: '16px',
    backgroundColor: '#e5e7eb',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  link: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
  },
  madeWith: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  heartIcon: {
    color: '#ef4444',
    fill: '#ef4444',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  socialLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  socialLink: {
    padding: '6px',
    borderRadius: '6px',
    color: '#6b7280',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  },
  scrollButton: {
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Add hover effects via CSS (include in your global CSS)
/*
.footer-link:hover {
  color: #111827;
}

.footer-social-link:hover {
  background-color: #f3f4f6;
  color: #111827;
  transform: translateY(-1px);
}

.footer-scroll-button:hover {
  background-color: #e5e7eb;
  color: #111827;
}
*/

export default Footer;