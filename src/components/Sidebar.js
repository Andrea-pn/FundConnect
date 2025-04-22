import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active menu item based on current path
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path.includes('/contributions')) return 'Contributions';
    if (path.includes('/members')) return 'Members';
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/events')) return 'Events'; // Added Events check
    return 'Dashboard'; // Default
  };

  const activeMenuItem = getActiveMenuItem();
 
  // Sidebar styling 
  const colors = {
    sidebar: darkMode 
      ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(180deg, #36875a 0%, #287045 100%)',
  };
 
  // Modern icons for sidebar
  const modernIcons = {
    dashboard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    contributions: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    ),
    members: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    events: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    briefcase: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    )
  };

  // Sidebar menu item style
  const menuItemStyle = (item) => ({
    padding: '12px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderRadius: '4px',
    marginBottom: '5px',
    backgroundColor: activeMenuItem === item 
      ? (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)') 
      : 'transparent',
    color: activeMenuItem === item 
      ? '#fff' 
      : (darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)'),
    fontWeight: activeMenuItem === item ? '600' : '400',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  });

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar" style={{ 
      background: colors.sidebar, 
      padding: '20px 0',
      boxShadow: darkMode ? '2px 0 10px rgba(0,0,0,0.2)' : '2px 0 10px rgba(0,0,0,0.1)',
      width: '250px',
      transition: 'all 0.3s ease'
    }}>
      <h2 style={{ 
        color: 'white', 
        padding: '0 20px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ marginRight: '10px' }}>{modernIcons.briefcase}</span>
        Admin Panel
      </h2>
      <div>
        {[
          { name: 'Dashboard', path: '/dashboard', icon: modernIcons.dashboard },
          { name: 'Members', path: '/members', icon: modernIcons.members },
          { name: 'Contributions', path: '/contributions', icon: modernIcons.contributions },
          { name: 'Events', path: '/events', icon: modernIcons.events } // Added Events menu item
        ].map((item) => (
          <div 
            key={item.name} 
            style={menuItemStyle(item.name)}
            onClick={() => handleNavigation(item.path)}
            onMouseEnter={(e) => {
              if (activeMenuItem !== item.name) {
                e.target.style.backgroundColor = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeMenuItem !== item.name) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.icon}
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;