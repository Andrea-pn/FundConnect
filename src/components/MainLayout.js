import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ darkMode, setDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Remember sidebar state from localStorage
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle screen resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Handle sidebar toggle
  const handleSidebarToggle = (newState) => {
    if (isMobile) {
      setMobileMenuOpen(newState);
    } else {
      setSidebarCollapsed(newState);
    }
  };

  // Handle mobile menu close
  const handleMobileClose = () => {
    setMobileMenuOpen(false);
  };

  // Calculate margins and widths based on sidebar state
  const getMainContentStyles = () => {
    if (isMobile) {
      return {
        marginLeft: '0',
        width: '100%',
        padding: '20px',
        paddingTop: '70px', // Account for mobile menu button
      };
    }
    
    return {
      marginLeft: sidebarCollapsed ? '70px' : '250px',
      width: `calc(100% - ${sidebarCollapsed ? '70px' : '250px'})`,
      padding: '20px',
    };
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`} 
         style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'all 0.3s ease'
          }}
          onClick={handleMobileClose}
        />
      )}

      {/* Sidebar - MAKE SURE ALL PROPS ARE PASSED HERE */}
      <Sidebar 
        darkMode={darkMode}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onToggle={handleSidebarToggle}
        onMobileClose={handleMobileClose}
        logo2={null} // Add your logo here if you have one
      />

      {/* Mobile Menu Button */}
      {isMobile && !mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            backgroundColor: darkMode ? '#1a1a2e' : '#034a31',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <i className="fas fa-bars" style={{ fontSize: '16px' }}></i>
        </button>
      )}

      {/* Main Content Area */}
      <div 
        className="main-content" 
        style={{ 
          ...getMainContentStyles(),
          flex: isMobile ? '1' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden' // Prevent horizontal scroll
        }}
      >
        {/* Content wrapper for better spacing */}
        <div style={{
          maxWidth: '100%',
          margin: '0 auto',
          position: 'relative'
        }}>
          <Outlet /> {/* This renders the child routes */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;