import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { FiBell, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { getAuth, signOut } from 'firebase/auth';
import Sidebar from './Sidebar';

const MainLayout = ({ darkMode, setDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Remember sidebar state from localStorage
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  
  // Get the current chama ID from the URL
  const location = useLocation();
  const chamaId = location.pathname.split('/')[2]; // Extract chama ID from /chama/:id/...

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, [auth]);

  // Handle screen resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Handle sidebar toggle
  const handleSidebarToggle = (newState) => {
    setSidebarCollapsed(newState);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Calculate margins and widths based on screen size and sidebar state
  const getMainContentStyles = () => {
    if (isMobile) {
      return {
        marginLeft: 0,
        width: '100%',
        padding: '0',
        marginBottom: '70px', // Adjusted for reduced sidebar height
        flex: '0 0 auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      };
    } else if (isTablet) {
      return {
        marginLeft: 0,
        width: '100%',
        padding: '0',
        marginBottom: '90px', // Adjusted for reduced sidebar height
        flex: '0 0 auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      };
    } else {
      return {
        marginLeft: sidebarCollapsed ? '70px' : '250px',
        width: `calc(100% - ${sidebarCollapsed ? '70px' : '250px'})`,
        padding: '0',
        flex: '0 0 auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      };
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`} 
         style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      
      {/* Sidebar - MAKE SURE ALL PROPS ARE PASSED HERE */}
      <Sidebar 
        darkMode={darkMode}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        isTablet={isTablet}
        onToggle={handleSidebarToggle}
        logo2={null} // Add your logo here if you have one
      />

      {/* Main Content Area */}
      <div 
        className="main-content" 
        style={{ 
          ...getMainContentStyles(),
          flex: '1', // Removed flex: '1'
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden' // Prevent horizontal scroll
        }}
      >
        {/* Top Navigation Bar */}
        <Navbar 
          bg={darkMode ? 'dark' : 'light'} 
          variant={darkMode ? 'dark' : 'light'}
          style={{
            position: 'fixed',
            top: 0,
            left: sidebarCollapsed ? '70px' : '250px',
            right: 0,
            zIndex: 1000,
            borderBottom: `2px solid ${darkMode ? '#33a17c' : '#034a31'}`,
            backgroundColor: darkMode ? '#1a1a2e' : '#034a31',
            padding: isMobile ? '8px 12px' : '15px 20px',
            marginLeft: '0',
            width: 'auto',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            ...(isMobile || isTablet ? {
              left: 0,
              right: 0,
              width: '100%'
            } : {})
          }}
        >
          <div className="d-flex align-items-center" style={{ flex: 1 }}>
            <h4 style={{ 
              margin: 0, 
              color: 'white',
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '1.5rem'
            }}>
              FundConnect
            </h4>
          </div>

          {/* Right Side Navigation Items */}
          <Nav className="ms-auto d-flex align-items-center" style={{
            gap: isMobile ? '4px' : '8px'
          }}>
            {/* Dark Mode Toggle - Available on all devices */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleDarkMode}
              style={{
                border: '2px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                marginRight: 0,
                borderRadius: isMobile ? '16px' : '20px',
                padding: isMobile ? '6px 8px' : '8px 12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              {darkMode ? <FiSun size={isMobile ? 16 : 18} /> : <FiMoon size={isMobile ? 16 : 18} />}
            </Button>

            {/* Notifications - Compact on mobile */}
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  position: 'relative',
                  borderRadius: isMobile ? '16px' : '20px',
                  padding: isMobile ? '6px 8px' : '8px 12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                <FiBell size={isMobile ? 16 : 18} />
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                  border: `2px solid ${darkMode ? '#33a17c' : '#034a31'}`,
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  ...(isMobile || isTablet ? {
                    position: 'fixed',
                    top: 'auto',
                    bottom: isMobile ? '70px' : '90px',
                    left: '10px',
                    right: '10px',
                    width: 'auto',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    zIndex: 1001
                  } : {})
                }}
              >
                <Dropdown.Item
                  style={{
                    color: darkMode ? '#ccc' : '#666',
                    backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                    padding: '10px 15px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = darkMode ? '#33a17c' : '#f8f9fa';
                    e.target.style.color = darkMode ? '#fff' : '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = darkMode ? '#2a2a2a' : '#fff';
                    e.target.style.color = darkMode ? '#fff' : '#333';
                  }}
                >
                  No new notifications
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* User Profile */}
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '8px',
                  borderRadius: isMobile ? '16px' : '20px',
                  padding: isMobile ? '6px 10px' : '8px 15px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                <FiUser size={isMobile ? 16 : 18} />
                {!isMobile && (
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {user?.displayName || user?.email || 'User'}
                  </span>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                  border: `2px solid ${darkMode ? '#33a17c' : '#034a31'}`,
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  ...(isMobile || isTablet ? {
                    position: 'fixed',
                    top: 'auto',
                    bottom: isMobile ? '70px' : '90px',
                    left: '10px',
                    right: '10px',
                    width: 'auto',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    zIndex: 1001
                  } : {})
                }}
              >
                <Dropdown.Item
                  onClick={() => {
                    navigate(`/chama/${chamaId}/settings`);
                  }}
                  style={{
                    color: darkMode ? '#fff' : '#333',
                    backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                    padding: '10px 15px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = darkMode ? '#33a17c' : '#f8f9fa';
                    e.target.style.color = darkMode ? '#fff' : '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = darkMode ? '#2a2a2a' : '#fff';
                    e.target.style.color = darkMode ? '#fff' : '#333';
                  }}
                >
                  <FiSettings className="me-2" />
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  style={{
                    color: '#dc3545',
                    backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                    padding: '10px 15px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc3545';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = darkMode ? '#2a2a2a' : '#fff';
                    e.target.style.color = '#dc3545';
                  }}
                >
                  <FiLogOut className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar>

        {/* Content wrapper for better spacing */}
        <div style={{
          maxWidth: '100%',
          margin: '0 auto',
          position: 'relative',
          padding: isMobile ? '20px 20px 20px 20px' : '20px 20px 20px 20px' // Top padding handled by CSS
        }}>
          <Outlet /> {/* This renders the child routes */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;