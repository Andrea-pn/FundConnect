import React, { useContext, useEffect, useState } from 'react';
import { 
  Container, Row, Col, Nav, Card, Badge, 
  ProgressBar, Button, Spinner, Alert
} from 'react-bootstrap';
import { 
  Link, Outlet, useParams, useNavigate, 
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
  const { activeChama, setActiveChama, refreshChama } = useContext(ChamaContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chamaStats, setChamaStats] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch real-time chama data
  useEffect(() => {
    if (!id) {
      navigate('/home');
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'chamas', id), 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setActiveChama({
            id: doc.id,
            ...data,
            isAdmin: data.createdBy === user?.uid
          });
          
          // Calculate some basic stats
          setChamaStats({
            progress: Math.min(100, Math.round((data.currentBalance / data.targetAmount) * 100)),
            membersPaid: 15, // You would fetch this from your data
            totalMembers: data.memberCount,
            upcomingEvent: data.nextEvent || null
          });
          setError(null);
        } else {
          setError('Chama not found');
          toast.error('Chama not found');
          navigate('/home');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching chama:', err);
        setError('Failed to load chama data');
        toast.error('Failed to load chama data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, user?.uid]);

  // Handle navigation to invite members
  const handleInviteClick = () => {
    navigate(`/chama/${id}/invitations`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading chama data...</p>
      </Container>
    );
  }

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
                Created on {activeChama.createdAt?.toDate().toLocaleDateString()}
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
              >
                Refresh
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
                    Ksh {activeChama.targetAmount.toLocaleString()}
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
                  <Nav.Item>
                    <NavLink 
                      to={`/chama/${id}`} 
                      end
                      className={({ isActive }) => 
                        `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                      }
                    >
                      <FiHome className="me-2" /> Dashboard
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink 
                      to={`/chama/${id}/members`}
                      className={({ isActive }) => 
                        `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                      }
                    >
                      <FiMembers className="me-2" /> Members
                      <Badge bg="primary" pill className="ms-auto">
                        {chamaStats?.totalMembers}
                      </Badge>
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink 
                      to={`/chama/${id}/contributions`}
                      className={({ isActive }) => 
                        `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                      }
                    >
                      <FiDollarSign className="me-2" /> Contributions
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink 
                      to={`/chama/${id}/events`}
                      className={({ isActive }) => 
                        `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                      }
                    >
                      <FiCalendar className="me-2" /> Events
                      {chamaStats?.upcomingEvent && (
                        <Badge bg="warning" pill className="ms-auto">
                          <FiBell size={12} />
                        </Badge>
                      )}
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink 
                      to={`/chama/${id}/reports`}
                      className={({ isActive }) => 
                        `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                      }
                    >
                      <FiBarChart2 className="me-2" /> Reports
                    </NavLink>
                  </Nav.Item>
                  
                  {activeChama.isAdmin && (
                    <>
                      <div className="border-top my-2"></div>
                      <Nav.Item>
                        <NavLink 
                          to={`/chama/${id}/invitations`}
                          className={({ isActive }) => 
                            `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                          }
                        >
                          <FiMail className="me-2" /> Invitations
                        </NavLink>
                      </Nav.Item>
                      <Nav.Item>
                        <NavLink 
                          to={`/chama/${id}/settings`}
                          className={({ isActive }) => 
                            `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                          }
                        >
                          <FiSettings className="me-2" /> Settings
                        </NavLink>
                      </Nav.Item>
                      <Nav.Item>
                        <NavLink 
                          to={`/chama/${id}/permissions`}
                          className={({ isActive }) => 
                            `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                          }
                        >
                          <FiLock className="me-2" /> Permissions
                        </NavLink>
                      </Nav.Item>
                    </>
                  )}
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
            <Outlet context={{ 
              chama: activeChama, 
              stats: chamaStats,
              refresh: refreshChama 
            }} />
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ChamaLayout;