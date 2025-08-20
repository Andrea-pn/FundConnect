import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Button, Badge } from 'react-bootstrap';
import { FiBell, FiUser, FiSettings, FiLogOut, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { getAuth, signOut } from 'firebase/auth';
import Sidebar from './Sidebar';

const MainLayout = ({ darkMode, setDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Remember sidebar state from localStorage
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
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

  // Calculate margins and widths based on sidebar state
  const getMainContentStyles = () => {
    if (isMobile) {
      return {
        marginLeft: '0',
        width: '100%',
        padding: '80px 0 0 0', // Increased top padding for fixed navbar on mobile
      };
    }
    
    return {
      marginLeft: sidebarCollapsed ? '70px' : '250px',
      width: `calc(100% - ${sidebarCollapsed ? '70px' : '250px'})`,
      padding: '0', // Remove all padding from main content
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
            top: '90px', // Position below the fixed navbar
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
        {/* Top Navigation Bar */}
        <Navbar 
          bg={darkMode ? 'dark' : 'light'} 
          variant={darkMode ? 'dark' : 'light'}
          style={{
            position: 'fixed', // Changed from 'sticky' to 'fixed'
            top: 0,
            left: sidebarCollapsed ? '70px' : '250px', // Position relative to sidebar
            right: 0,
            zIndex: 1000,
            borderBottom: `2px solid ${darkMode ? '#33a17c' : '#034a31'}`,
            backgroundColor: darkMode ? '#1a1a2e' : '#034a31',
            padding: '15px 20px',
            marginLeft: '0', // Ensure no left margin
            width: 'auto', // Let it fill the available space
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div className="d-flex align-items-center" style={{ flex: 1 }}>
            <h4 style={{ 
              margin: 0, 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>
              FundConnect
            </h4>
          </div>

          {/* Search Bar */}
          <div className="d-flex align-items-center me-3" style={{ minWidth: '300px' }}>
            <div className="position-relative">
              <FiSearch 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'white',
                  zIndex: 1
                }} 
              />
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                style={{
                  paddingLeft: '40px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '25px',
                  fontSize: '14px',
                  height: '40px'
                }}
              />
            </div>
          </div>

          {/* Right Side Navigation Items */}
          <Nav className="ms-auto d-flex align-items-center">
            {/* Dark Mode Toggle */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleDarkMode}
              style={{
                border: '2px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                marginRight: '15px',
                borderRadius: '20px',
                padding: '8px 12px',
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
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </Button>

            {/* Notifications */}
            <Dropdown className="me-3">
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  position: 'relative',
                  borderRadius: '20px',
                  padding: '8px 12px',
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
                <FiBell size={18} />
                {notifications.length > 0 && (
                  <Badge
                    bg="danger"
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      fontSize: '10px',
                      border: '2px solid #fff'
                    }}
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                  border: `2px solid ${darkMode ? '#33a17c' : '#034a31'}`,
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <Dropdown.Item
                      key={index}
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
                      {notification.message}
                    </Dropdown.Item>
                  ))
                ) : (
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
                )}
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
                  gap: '8px',
                  borderRadius: '20px',
                  padding: '8px 15px',
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
                <FiUser size={18} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {user?.displayName || user?.email || 'User'}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                  border: `2px solid ${darkMode ? '#33a17c' : '#034a31'}`,
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                <Dropdown.Item
                  onClick={() => {
                    console.log('Settings button clicked, navigating to /settings');
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
          padding: '80px 20px 20px 20px' // Increased top padding to account for fixed navbar
        }}>
          <Outlet /> {/* This renders the child routes */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;