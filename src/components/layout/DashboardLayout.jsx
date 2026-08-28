// components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div style={styles.container}>
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <div style={styles.mainContent}>
          {/* Navbar */}
          <Navbar onMenuClick={toggleSidebar} />

          {/* Page Content */}
          <main style={styles.main}>
            <div style={styles.contentWrapper}>
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#f9fafb',
  },
  contentWrapper: {
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
    padding: '0',
  },
};

// Mobile responsive styles
const mobileStyles = `
  @media (max-width: 1024px) {
    .main-content {
      padding: 16px !important;
    }
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 12px !important;
    }
    
    .main {
      padding: 16px !important;
    }
  }

  @media (max-width: 640px) {
    .main-content {
      padding: 8px !important;
    }
    
    .main {
      padding: 12px !important;
    }
  }
`;

// Inject mobile styles
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);

export default DashboardLayout;