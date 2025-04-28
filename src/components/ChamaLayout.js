import React, { useContext, useEffect, useState, useMemo } from 'react';
import { 
  Container, Row, Col, Nav, Card, Badge, 
  ProgressBar, Button, Spinner, Alert
} from 'react-bootstrap';
import { 
  Outlet, useParams, useNavigate, 
  useLocation, NavLink 
} from 'react-router-dom';
import { 
  FiHome, FiDollarSign, FiCalendar, 
  FiUsers as FiMembers, FiSettings, 
  FiUserPlus, FiPieChart, FiBell,
  FiBarChart2, FiMail, FiLock
} from 'react-icons/fi';
import { ChamaContext } from '../App';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ChamaLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Context values with proper null checks
  const context = useContext(ChamaContext);
  const {
    activeChama = null,
    setActiveChama = () => {},
    chamaLoading = false,
    refreshChama = () => {},
    fetchChamaData = () => {}
  } = context || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chamaStats, setChamaStats] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Memoized chama data calculation
  const calculateStats = (data) => {
    return {
      progress: Math.min(100, Math.round((data.currentBalance / data.targetAmount) * 100) || 0),
      membersPaid: data.membersPaid || 0,
      totalMembers: data.memberCount || 0,
      upcomingEvent: data.nextEvent || null
    };
  };

  // Fetch real-time chama data
  useEffect(() => {
    if (!id) {
      navigate('/home');
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'chamas', id),
      (doc) => {
        try {
          if (!doc.exists()) {
            throw new Error('Chama not found');
          }

          const data = doc.data();
          const updatedChama = {
            id: doc.id,
            ...data,
            isAdmin: data.createdBy === user?.uid
          };

          setActiveChama(updatedChama);
          setChamaStats(calculateStats(data));
          setError(null);
        } catch (err) {
          console.error('Error processing chama data:', err);
          setError(err.message);
          toast.error(err.message);
          navigate('/home');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Failed to load chama data');
        toast.error('Failed to load chama data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, user?.uid, navigate, setActiveChama]);

  // Provide context to child routes
  const outletContext = useMemo(() => ({
    chama: activeChama, 
    stats: chamaStats,
    refresh: refreshChama,
    loading: loading || chamaLoading
  }), [activeChama, chamaStats, refreshChama, loading, chamaLoading]);

  // Handle navigation to invite members
  const handleInviteClick = () => {
    navigate(`/chama/${id}/invitations`);
  };

  // Loading state
  if (loading || chamaLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading chama data...</p>
      </Container>
    );
  }

  // Error states
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading chama</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!activeChama) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>No chama selected</Alert.Heading>
          <p>Please select a chama from the home page</p>
          <Button variant="outline-warning" onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  // Navigation items
  const navItems = [
    { path: `/chama/${id}`, icon: <FiPieChart />, label: 'Dashboard', end: true },
    { path: `/chama/${id}/members`, icon: <FiMembers />, label: 'Members', badge: chamaStats?.totalMembers },
    { path: `/chama/${id}/contributions`, icon: <FiDollarSign />, label: 'Contributions' },
    { path: `/chama/${id}/events`, icon: <FiCalendar />, label: 'Events', 
      badge: chamaStats?.upcomingEvent && <FiBell size={12} /> },
    { path: `/chama/${id}/reports`, icon: <FiBarChart2 />, label: 'Reports' },
    ...(activeChama.isAdmin ? [
      { divider: true },
      { path: `/chama/${id}/invitations`, icon: <FiMail />, label: 'Invitations' },
      { path: `/chama/${id}/settings`, icon: <FiSettings />, label: 'Settings' },
      { path: `/chama/${id}/permissions`, icon: <FiLock />, label: 'Permissions' }
    ] : [])
  ];

  return (
    <Container fluid className="px-0">
      {/* Header with chama info */}
      <div className="bg-primary text-white py-4 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <h2 className="mb-0 me-3">{activeChama.name}</h2>
                <Badge bg={activeChama.isAdmin ? "warning" : "light"} className="text-dark">
                  {activeChama.isAdmin ? 'Admin' : 'Member'}
                </Badge>
              </div>
              <p className="mb-0 mt-2">
                Created on {activeChama.createdAt?.toDate()?.toLocaleDateString() || 'N/A'}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              {activeChama.isAdmin && (
                <Button 
                  variant="light" 
                  onClick={handleInviteClick}
                  className="me-2"
                >
                  <FiUserPlus className="me-1" /> Invite Members
                </Button>
              )}
              <Button 
                variant="outline-light" 
                onClick={refreshChama}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Col>
          </Row>
          
          {chamaStats && (
            <Row className="mt-3">
              <Col>
                <div className="d-flex justify-content-between mb-2">
                  <span>Progress: {chamaStats.progress}%</span>
                  <span>
                    Ksh {activeChama.currentBalance?.toLocaleString() || 0} of {' '}
                    Ksh {activeChama.targetAmount?.toLocaleString() || 0}
                  </span>
                </div>
                <ProgressBar 
                  now={chamaStats.progress} 
                  variant="success"
                  animated 
                  className="mb-2"
                />
                <div className="d-flex justify-content-between small">
                  <span>
                    <FiMembers className="me-1" />
                    {chamaStats.membersPaid}/{chamaStats.totalMembers} members paid
                  </span>
                  {chamaStats.upcomingEvent && (
                    <span>
                      <FiCalendar className="me-1" />
                      Next: {chamaStats.upcomingEvent.title}
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      <Container>
        <Row>
          {/* Sidebar Navigation */}
          <Col md={3} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-2">
                <Nav variant="pills" className="flex-column">
                  {navItems.map((item, index) => (
                    item.divider ? (
                      <div key={`divider-${index}`} className="border-top my-2"></div>
                    ) : (
                      <Nav.Item key={item.path}>
                        <NavLink
                          to={item.path}
                          end={item.end}
                          className={({ isActive }) => 
                            `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                          }
                        >
                          <span className="me-2">{item.icon}</span>
                          {item.label}
                          {item.badge && (
                            <Badge 
                              bg={typeof item.badge === 'number' ? 'primary' : 'warning'} 
                              pill 
                              className="ms-auto"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      </Nav.Item>
                    )
                  ))}
                </Nav>
              </Card.Body>
            </Card>

            {/* Quick Stats Card */}
            {chamaStats && (
              <Card className="border-0 shadow-sm mt-3">
                <Card.Body>
                  <h6 className="mb-3">Quick Stats</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Progress:</span>
                    <strong>{chamaStats.progress}%</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Members Paid:</span>
                    <strong>
                      {chamaStats.membersPaid}/{chamaStats.totalMembers}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Balance:</span>
                    <strong>
                      Ksh {activeChama.currentBalance?.toLocaleString() || 0}
                    </strong>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Main Content Area */}
          <Col md={9}>
            <Outlet context={outletContext} />
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ChamaLayout;