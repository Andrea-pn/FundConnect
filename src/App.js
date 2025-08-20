import React, { useState, createContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './components/MainLayout';
import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import SignIn from './Pages/SignIn';
import HomePage from './Pages/HomePage';
import Dashboard from './Pages/AdminDashboard';
import Members from './Pages/Members';
import Contributions from './Pages/Contributions';
import Events from './Pages/Events';
import Settings from './Pages/Settings';
import InvitationsPage from './Pages/Invitations';
import LoadingScreen from './components/LoadingScreen';
import ChamaRouteWrapper from './components/ChamaRouteWrapper';

export const ChamaContext = createContext({
  activeChama: null,
  setActiveChama: () => {},
  chamaLoading: false,
  refreshChama: () => {},
  fetchChamaData: () => {}
});

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeChama, setActiveChama] = useState(null);
  const [chamaLoading, setChamaLoading] = useState(false);
  const [chamaCache, setChamaCache] = useState({});
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchChamaData = async (chamaId) => {
    if (!chamaId) return;
    
    if (chamaCache[chamaId]) {
      setActiveChama(chamaCache[chamaId]);
      return;
    }

    setChamaLoading(true);
    try {
      const chamaRef = doc(db, 'chamas', chamaId);
      const chamaSnap = await getDoc(chamaRef);
      
      if (chamaSnap.exists()) {
        const chamaData = {
          id: chamaSnap.id,
          ...chamaSnap.data(),
          isAdmin: chamaSnap.data().createdBy === user?.uid
        };
        setActiveChama(chamaData);
        setChamaCache(prev => ({ ...prev, [chamaId]: chamaData }));
      } else {
        console.error('Chama not found');
        navigate('/home');
      }
    } catch (err) {
      console.error('Error fetching chama:', err);
      navigate('/home');
    } finally {
      setChamaLoading(false);
    }
  };

  const refreshChama = async () => {
    if (activeChama?.id) {
      await fetchChamaData(activeChama.id);
    }
  };

  // Handle route changes to fetch chama data
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'chama' && pathParts[2]) {
      const chamaId = pathParts[2];
      if (!activeChama || activeChama.id !== chamaId) {
        fetchChamaData(chamaId);
      }
    }
  }, [location.pathname, activeChama, fetchChamaData]);

  // Redirect logged in users away from auth pages
  useEffect(() => {
    if (!loading && user) {
      if (location.pathname === '/login' || location.pathname === '/signin') {
        navigate('/home');
      }
    }
  }, [loading, user, location.pathname, navigate]);

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ChamaContext.Provider value={{ 
      activeChama, 
      setActiveChama, 
      chamaLoading, 
      refreshChama,
      fetchChamaData 
    }}>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<HomePage />} />
          
          {/* Chama routes - Single protection layer */}
          <Route path="/chama/:id" element={
            <ChamaRouteWrapper darkMode={darkMode} />
          }>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="events" element={<Events />} />
            <Route path="settings" element={<Settings />} />
            <Route path="invitations" element={<InvitationsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChamaContext.Provider>
  );
}

export default App;