import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ darkMode, setDarkMode }) => {
  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar darkMode={darkMode} />
      <div className="main-content" style={{ 
        flex: 1, 
        padding: '20px',
        marginLeft: '250px', // Match sidebar width
        transition: 'all 0.3s ease',
        backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa'
      }}>
        <Outlet /> {/* This renders the child routes */}
      </div>
    </div>
  );
};

export default MainLayout;