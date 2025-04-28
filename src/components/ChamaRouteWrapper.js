import { useContext, useEffect } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { ChamaContext } from '../App';
import LoadingScreen from './LoadingScreen';

const ChamaRouteWrapper = ({ darkMode }) => {
  const { id } = useParams();
  const { activeChama, chamaLoading, fetchChamaData } = useContext(ChamaContext);

  useEffect(() => {
    if (id && (!activeChama || activeChama.id !== id)) {
      fetchChamaData(id);
    }
  }, [id]);

  if (chamaLoading) {
    return <LoadingScreen />;
  }

  if (!activeChama) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet context={{ chama: activeChama, darkMode }} />;
};

export default ChamaRouteWrapper;