import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav, Badge } from 'react-bootstrap';
import { 
  FiHome, FiPieChart, FiUsers, FiDollarSign, 
  FiCalendar, FiSettings, FiMail 
} from 'react-icons/fi';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ChamaContext } from '../App';
import logo2 from "../components/logo.png";

const Sidebar = ({ 
  darkMode = false, 
  isCollapsed = false,
  isMobile = false,
  isTablet = false,
  onToggle = () => {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invitationCount, setInvitationCount] = useState(0);
  const auth = getAuth();
  const { activeChama, chamaLoading } = useContext(ChamaContext);
  
  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(db, 'invitations'),
        where('invitedUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setInvitationCount(snapshot.size);
      });

      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path) && 
      (location.pathname === path || location.pathname.charAt(path.length) === '/');
  };

  const handleNavigation = (path) => {
    if (path.includes('/chama/') && !activeChama?.id) {
      console.warn('No active chama selected');
      return;
    }
    navigate(path);
  };

  const getMenuItems = () => {
    const items = [
      { path: '/home', title: 'Home', icon: <FiHome size={18} /> }
    ];

    if (activeChama) {
      const chamaId = activeChama.id;
      items.push(
        { path: `/chama/${chamaId}`, title: 'Dashboard', icon: <FiPieChart size={18} /> },
        { path: `/chama/${chamaId}/members`, title: 'Members', icon: <FiUsers size={18} /> },
        { path: `/chama/${chamaId}/contributions`, title: 'Contributions', icon: <FiDollarSign size={18} /> },
        { path: `/chama/${chamaId}/events`, title: 'Events', icon: <FiCalendar size={18} /> },
        { path: `/chama/${chamaId}/invitations`, title: 'Invitations', icon: <FiMail size={18} />, badge: invitationCount },
        { path: `/chama/${chamaId}/settings`, title: 'Settings', icon: <FiSettings size={18} /> }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  const toggleSidebar = () => {
    // Add safety check for onToggle function
    if (typeof onToggle !== 'function') {
      console.warn('onToggle prop is not a function');
      return;
    }

    onToggle(!isCollapsed);
  };

  // Calculate sidebar styles based on state
  const getSidebarStyles = () => {
    const baseStyles = {
      background: darkMode ? '#1a1a2e' : '#034a31',
      color: 'white',
      position: 'fixed',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    };

    if (isMobile || isTablet) {
      // Mobile/Tablet: Sidebar at bottom
      return {
        ...baseStyles,
        bottom: 0,
        left: 0,
        right: 0,
        height: isMobile ? '70px' : '90px', // Reduced height
        width: '100%',
        padding: '8px 10px', // Reduced padding
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Changed back to space-between
        overflowX: 'hidden', // Hide horizontal scroll
        overflowY: 'hidden'
      };
    }

    // Desktop: Sidebar on left
    return {
      ...baseStyles,
      left: 0,
      top: 0,
      height: '100vh',
      width: isCollapsed ? '70px' : '250px',
      padding: '20px 0',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    };
  };

  // Your JSX return statement goes here (same as provided earlier)
  return (
    <div style={getSidebarStyles()}>
      {/* Desktop Layout */}
      {!isMobile && !isTablet && (
        <>
          {/* Header Section */}
          <div style={{
            padding: '0 20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: (isCollapsed) ? 'center' : 'space-between',
              minHeight: '60px'
            }}>
              {/* Logo/Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                opacity: (isCollapsed) ? 0 : 1,
                transform: (isCollapsed) ? 'translateX(-20px)' : 'translateX(0)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => !(isCollapsed) && handleNavigation('/home')}
              >
                <img 
                  src={logo2} 
                  alt="Logo" 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px'
                  }}
                />
                {!(isCollapsed) && (
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    color: 'white'
                  }}>
                    FundConnect
                  </span>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff6c',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  fontWeight:'bold',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                {isCollapsed ? '☰' : '◀'}
              </button>

              {/* Collapsed State Indicator */}
              {(isCollapsed) && (
                <div 
                  onClick={toggleSidebar}
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.8)';
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.5)';
                    e.target.style.background = 'transparent';
                  }}
                >
                  <i className="fas fa-ellipsis-v"></i>
                </div>
              )}
            </div>
          </div>
          
          {/* Active Chama Section */}
          {activeChama && !(isCollapsed) && (
            <div style={{ 
              padding: '0 20px 15px', 
              color: 'rgba(255,255,255,0.8)',
              opacity: (isCollapsed) ? 0 : 1,
              transform: (isCollapsed) ? 'translateX(-20px)' : 'translateX(0)',
              transition: 'all 0.3s ease 0.1s'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4ade80',
                    borderRadius: '50%'
                  }}></div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Active Chama
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {activeChama.name}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {activeChama.period} • {activeChama.memberCount || 0} members
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <Nav className="flex-column" style={{ padding: '0 10px' }}>
            {menuItems.map((item, index) => (
              <Nav.Item key={item.path || index}>
                <Nav.Link
                  active={isActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    color: 'white',
                    borderRadius: '8px',
                    padding: (isCollapsed) ? '12px' : '12px 20px',
                    margin: '0 10px 5px 10px',
                    background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: (isCollapsed) ? 'center' : 'flex-start',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    minHeight: '44px',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                  title={(isCollapsed) ? item.title : ''}
                >
                  <span style={{ 
                    marginRight: (isCollapsed) ? '0' : '12px', 
                    display: 'flex',
                    fontSize: '1.1rem',
                    minWidth: '20px',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  
                  {!(isCollapsed) && (
                    <>
                      <span style={{
                        flex: 1,
                        whiteSpace: 'nowrap'
                      }}>
                        {item.title}
                      </span>
                      
                      {item.badge > 0 && (
                        <Badge 
                          pill 
                          bg="danger" 
                          style={{ 
                            fontSize: '0.75rem'
                          }}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          
          {/* Loading State for Chama */}
          {chamaLoading && !(isCollapsed) && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.9rem'
            }}>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Loading...
            </div>
          )}
        </>
      )}

      {/* Mobile/Tablet Layout - Bottom Navigation */}
      {(isMobile || isTablet) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          gap: '4px' // Reduced gap
        }}>
          {menuItems.map((item, index) => (
            <div
              key={item.path || index}
              onClick={() => handleNavigation(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px', // Reduced padding
                borderRadius: '6px', // Reduced border radius
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                minWidth: isMobile ? '50px' : '60px', // Smaller width for mobile
                height: '100%',
                flexShrink: 0,
                position: 'relative',
                flex: 1, // Make items flex to fill space
                maxWidth: isMobile ? '60px' : '70px' // Maximum width constraint
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.background = isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent';
                }
              }}
            >
              <div style={{ 
                fontSize: isMobile ? '1rem' : '1.1rem', // Smaller icon for mobile
                marginBottom: '2px' // Reduced margin
              }}>
                {item.icon}
              </div>
              <div style={{ 
                fontSize: isMobile ? '0.6rem' : '0.65rem', // Smaller text for mobile
                textAlign: 'center',
                lineHeight: '1.1', // Reduced line height
                whiteSpace: 'nowrap',
                fontWeight: '500'
              }}>
                {item.title}
              </div>
              {item.badge > 0 && (
                <Badge 
                  pill 
                  bg="danger" 
                  style={{ 
                    position: 'absolute',
                    top: '4px', // Adjusted position
                    right: '4px', // Adjusted position
                    fontSize: '0.5rem', // Smaller badge
                    minWidth: '14px', // Smaller badge
                    height: '14px', // Smaller badge
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;