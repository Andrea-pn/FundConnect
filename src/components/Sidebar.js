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

const Sidebar = ({ darkMode }) => {
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

  return (
    <div style={{
      width: '250px',
      background: darkMode ? '#1a1a2e' : '#36875a',
      color: 'white',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '20px 0',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <h2 style={{ 
        padding: '0 20px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
      }}
      onClick={() => handleNavigation('/home')}
      >
        <FiHome className="me-2" size={20} />
        Chama
      </h2>
      
      {activeChama && (
        <div style={{ padding: '0 20px 10px', color: 'rgba(255,255,255,0.8)' }}>
          <small>Active Chama:</small>
          <h5>{activeChama.name || 'My Chama'}</h5>
        </div>
      )}
      
      <Nav variant="pills" className="flex-column">
        {menuItems.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link
              active={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              style={{
                color: 'white',
                borderRadius: '4px',
                padding: '12px 20px',
                margin: '0 10px 5px 10px',
                background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ marginRight: '12px', display: 'flex' }}>
                {item.icon}
              </span>
              {item.title}
              {item.badge > 0 && (
                <Badge 
                  pill 
                  bg="danger" 
                  style={{ 
                    marginLeft: 'auto',
                    fontSize: '0.75rem'
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;