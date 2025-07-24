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
  mobileMenuOpen = false, 
  onToggle = () => {}, 
  onMobileClose = () => {}
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
    // Close mobile menu after navigation
    if (isMobile && typeof onMobileClose === 'function') {
      onMobileClose();
    }
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

    if (isMobile) {
      onToggle(!mobileMenuOpen);
    } else {
      onToggle(!isCollapsed);
    }
  };

  // Calculate sidebar styles based on state
  const getSidebarStyles = () => {
    const baseStyles = {
      background: darkMode ? '#1a1a2e' : '#034a31',
      color: 'white',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '20px 0',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    };

    if (isMobile) {
      return {
        ...baseStyles,
        width: '250px',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
      };
    }

    return {
      ...baseStyles,
      width: isCollapsed ? '70px' : '250px',
      transform: 'translateX(0)'
    };
  };

  // Your JSX return statement goes here (same as provided earlier)
  return (
    <div style={getSidebarStyles()}>
      {/* Header Section with Logo and Toggle */}
      <div 
        style={{  
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
          minHeight: '60px'
        }}
      >
        {/* Logo and Title */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: '10px',
            opacity: (isCollapsed && !isMobile) ? 0 : 1,
            transform: (isCollapsed && !isMobile) ? 'translateX(-20px)' : 'translateX(0)',
            transition: 'all 0.3s ease'
          }}
          onClick={() => !(isCollapsed && !isMobile) && handleNavigation('/home')}
        >
          <img 
            src={logo2}
            alt="Chama Logo" 
            style={{
              height: '30px',
              width: 'auto',
              filter: darkMode ? 'none' : 'brightness(0) invert(1)',
              display: 'block'
            }}
          />
          {!(isCollapsed && !isMobile) && (
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              whiteSpace: 'nowrap'
            }}>
              FundConnect
            </span>
          )}
          </div>

          {/* Toggle Button */}
          {!isMobile && (
          <button
            onClick={toggleSidebar}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            {isCollapsed ? '☰' : '✕'}
          </button>
        )}


        {/* Mobile Toggle Button */}
        {isMobile && (
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
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Active Chama Section */}
      {activeChama && !(isCollapsed && !isMobile) && (
        <div style={{ 
          padding: '0 20px 15px', 
          color: 'rgba(255,255,255,0.8)',
          opacity: (isCollapsed && !isMobile) ? 0 : 1,
          transform: (isCollapsed && !isMobile) ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'all 0.3s ease 0.1s'
        }}>
          <small style={{ fontSize: '0.8rem' }}>Active Chama:</small>
          <h6 style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            margin: '2px 0 0 0',
            fontWeight: '600'
          }}>
            {activeChama.name || 'My Chama'}
          </h6>
        </div>
      )}
      
      {/* Navigation Menu */}
      <Nav variant="pills" className="flex-column" style={{ marginTop: '10px' }}>
        {menuItems.map((item, index) => (
          <Nav.Item key={item.path || index}>
            <Nav.Link
              active={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              style={{
                color: 'white',
                borderRadius: '8px',
                padding: (isCollapsed && !isMobile) ? '12px' : '12px 20px',
                margin: '0 10px 5px 10px',
                background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
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
              title={(isCollapsed && !isMobile) ? item.title : ''}
            >
              <span style={{ 
                marginRight: (isCollapsed && !isMobile) ? '0' : '12px', 
                display: 'flex',
                fontSize: '1.1rem',
                minWidth: '20px',
                justifyContent: 'center'
              }}>
                {item.icon}
              </span>
              
              {!(isCollapsed && !isMobile) && (
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
      {chamaLoading && !(isCollapsed && !isMobile) && (
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
      
      {/* Collapsed State Indicator */}
      {(isCollapsed && !isMobile) && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.7rem',
          textAlign: 'center'
        }}>
          <i className="fas fa-ellipsis-v"></i>
        </div>
      )}
    </div>
  );
};

export default Sidebar;