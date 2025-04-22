import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChamaContext } from '../App'; // Adjust the import path as needed

const MainLayout = ({ darkMode }) => {
  // Remove the activeChama extraction since it's accessed via context in Sidebar
  
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