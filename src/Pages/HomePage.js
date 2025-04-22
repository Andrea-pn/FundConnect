import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, 
  Modal, Badge, Spinner, Alert,
  InputGroup, ProgressBar, Tab, Tabs,
  FormControl, Dropdown, ButtonGroup
} from 'react-bootstrap';
import { 
  FiPlusCircle, FiDollarSign, 
  FiUsers, FiCheckCircle,
  FiStar, FiHome, FiSearch,
  FiMail, FiUserPlus
} from 'react-icons/fi';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chamaData, setChamaData] = useState({
    name: '',
    targetAmount: '',
    memberCount: '',
    period: 'monthly'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [loadingChamas, setLoadingChamas] = useState(true);
  const [userChamas, setUserChamas] = useState([]);
  const [adminChamas, setAdminChamas] = useState([]);
  const [memberChamas, setMemberChamas] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [activeChama, setActiveChama] = useState(null);
  const [navigating, setNavigating] = useState(false);
  
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Invitation functionality state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentChama, setCurrentChama] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Centralized navigation logic
  const navigateToChama = async (chamaId) => {
    setNavigating(true);
    try {
      const chama = userChamas.find(c => c.id === chamaId);
      if (chama) {
        setActiveChama(chama);
        await navigate(`/chama/${chamaId}`);
      }
    } finally {
      setNavigating(false);
    }
  };

  // Fetch user's chamas
  useEffect(() => {
    const fetchUserChamas = async () => {
      if (!user) return;
      
      try {
        setLoadingChamas(true);
        
        const membershipsQuery = query(
          collection(db, 'memberships'),
          where('userId', '==', user.uid)
        );
        const membershipsSnapshot = await getDocs(membershipsQuery);
        
        const chamaIds = membershipsSnapshot.docs.map(doc => doc.data().chamaId);
        const adminChamaIds = membershipsSnapshot.docs
          .filter(doc => doc.data().role === 'admin')
          .map(doc => doc.data().chamaId);
        
        if (chamaIds.length > 0) {
          const chamasQuery = query(
            collection(db, 'chamas'),
            where('__name__', 'in', chamaIds)
          );
          const chamasSnapshot = await getDocs(chamasQuery);
          
          const allChamas = chamasSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isAdmin: adminChamaIds.includes(doc.id),
            createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt
          }));
          
          setUserChamas(allChamas);
          setAdminChamas(allChamas.filter(chama => chama.isAdmin));
          setMemberChamas(allChamas.filter(chama => !chama.isAdmin));
          
          // Sync active chama with URL if navigating back
          const pathParts = window.location.pathname.split('/');
          if (pathParts[1] === 'chama' && pathParts[2]) {
            const chamaId = pathParts[2];
            const chama = allChamas.find(c => c.id === chamaId);
            if (chama) setActiveChama(chama);
          } else if (allChamas.length > 0 && !activeChama) {
            setActiveChama(allChamas[0]);
          }
        } else {
          setUserChamas([]);
          setAdminChamas([]);
          setMemberChamas([]);
          setActiveChama(null);
        }
      } catch (err) {
        console.error("Error fetching chamas:", err);
        setError("Failed to load your chamas. Please refresh to try again.");
      } finally {
        setLoadingChamas(false);
      }
    };
    
    fetchUserChamas();
  }, [user]);

  // Search for chamas by name
  const searchChamas = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const chamasRef = collection(db, 'chamas');
      
      const querySnapshot = await getDocs(chamasRef);
      const searchTermLower = searchTerm.toLowerCase();
      
      const results = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          isAdmin: adminChamas.some(c => c.id === doc.id),
          createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt
        }))
        .filter(chama => 
          chama.name.toLowerCase().includes(searchTermLower)
        );
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching chamas:", error);
      setError("Failed to search chamas");
      toast.error("Failed to search chamas");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle inviting members to chama
  const handleInviteMember = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', inviteEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error("User with this email not found");
        return;
      }
      
      const userToInvite = querySnapshot.docs[0].data();
      
      const membershipsRef = collection(db, 'memberships');
      const membershipQuery = query(
        membershipsRef,
        where('chamaId', '==', currentChama.id),
        where('userId', '==', userToInvite.uid)
      );
      const membershipSnapshot = await getDocs(membershipQuery);
      
      if (!membershipSnapshot.empty) {
        toast.warning("User is already a member of this chama");
        return;
      }
      
      const invitationsRef = collection(db, 'invitations');
      const invitationQuery = query(
        invitationsRef,
        where('chamaId', '==', currentChama.id),
        where('invitedUserId', '==', userToInvite.uid),
        where('status', '==', 'pending')
      );
      const invitationSnapshot = await getDocs(invitationQuery);
      
      if (!invitationSnapshot.empty) {
        toast.info("Invitation already sent to this user");
        return;
      }
      
      await addDoc(collection(db, 'invitations'), {
        chamaId: currentChama.id,
        chamaName: currentChama.name,
        invitedUserId: userToInvite.uid,
        invitedUserEmail: inviteEmail,
        inviterUserId: user.uid,
        inviterEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleChamaChange = (e) => {
    const { name, value } = e.target;
    setChamaData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateChama = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    
    if (!user) {
      setError("User not authenticated");
      setIsCreating(false);
      return;
    }
  
    try {
      // Create the chama first
      const chamaRef = await addDoc(collection(db, 'chamas'), {
        name: chamaData.name,
        targetAmount: Number(chamaData.targetAmount),
        memberCount: Number(chamaData.memberCount),
        period: chamaData.period,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        currentBalance: 0,
        currency: "KES",
        status: "active"
      });
  
      console.log("Chama created with ID:", chamaRef.id);
  
      // Then create the membership
      const membershipRef = await addDoc(collection(db, 'memberships'), {
        userId: user.uid,
        chamaId: chamaRef.id,
        role: 'admin',
        joinedAt: serverTimestamp(),
        status: 'active'
      });
  
      console.log("Membership created with ID:", membershipRef.id);
  
      const newChama = {
        id: chamaRef.id,
        ...chamaData,
        isAdmin: true,
        createdAt: new Date(),
        currentBalance: 0
      };
      
      setUserChamas(prev => [...prev, newChama]);
      setAdminChamas(prev => [...prev, newChama]);
      setActiveChama(newChama);
      setChamaData({
        name: '',
        targetAmount: '',
        memberCount: '',
        period: 'monthly'
      });
      setShowCreateModal(false);
      toast.success(`Chama "${chamaData.name}" created successfully!`);
      
      // Navigate to the new chama's dashboard
      navigate(`/chama/${chamaRef.id}`);
    } catch (err) {
      console.error("Error creating chama:", err);
      setError("Failed to create chama. Please try again.");
      toast.error(`Failed to create chama: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const renderChamaCard = (chama) => (
    <Col key={chama.id} xs={12} md={6} lg={4} className="mb-4">
      <Card 
        className={`h-100 ${activeChama?.id === chama.id ? 'border-primary' : ''}`}
        onClick={() => navigateToChama(chama.id)}
        style={{ cursor: 'pointer' }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="mb-0">
              {chama.name}
            </Card.Title>
            <div>
              {chama.isAdmin && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentChama(chama);
                    setShowInviteModal(true);
                  }}
                >
                  <FiUserPlus size={14} />
                </Button>
              )}
              {chama.isAdmin && (
                <Badge bg="primary" pill className="ms-2">
                  <FiStar size={12} className="me-1" /> Admin
                </Badge>
              )}
            </div>
          </div>
          
          <Card.Text className="text-muted small mb-3">
            Created: {chama.createdAt.toLocaleDateString()}
          </Card.Text>
          
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>Target:</span>
              <strong>Ksh {chama.targetAmount.toLocaleString()}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>Members:</span>
              <strong>{chama.memberCount}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Contribution:</span>
              <strong className="text-capitalize">{chama.period}</strong>
            </div>
          </div>
          
          <ProgressBar 
            now={(chama.currentBalance / chama.targetAmount) * 100 || 0} 
            label={`${Math.round((chama.currentBalance / chama.targetAmount) * 100) || 0}%`}
            className="mb-3"
          />
          
          <div className="d-flex justify-content-between">
            <span className="small">Balance: Ksh {chama.currentBalance?.toLocaleString() || 0}</span>
            <span className="small">Target: Ksh {chama.targetAmount.toLocaleString()}</span>
          </div>
          
          <Button 
            variant={activeChama?.id === chama.id ? 'primary' : 'outline-primary'}
            size="sm"
            className="w-100 mt-3"
            onClick={(e) => {
              e.stopPropagation();
              navigateToChama(chama.id);
            }}
            disabled={navigating && activeChama?.id === chama.id}
          >
            {navigating && activeChama?.id === chama.id ? (
              <Spinner as="span" size="sm" animation="border" />
            ) : activeChama?.id === chama.id ? (
              'Currently Viewing'
            ) : (
              'View Details'
            )}
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container className="py-4">
      {/* Header with Search */}
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2 className="d-flex align-items-center">
            <FiHome className="me-2" /> My Chamas
          </h2>
        </Col>
        <Col md={6} className="mt-2 mt-md-0">
          <InputGroup>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search all chamas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (searchTimeout) clearTimeout(searchTimeout);
                setSearchTimeout(
                  setTimeout(() => {
                    searchChamas();
                  }, 500)
                );
              }}
              onKeyPress={(e) => e.key === 'Enter' && searchChamas()}
            />
            <Button 
              variant="primary" 
              onClick={searchChamas}
              disabled={!searchTerm.trim() || isSearching}
            >
              {isSearching ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : (
                'Search'
              )}
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Chama Selector and Create Button */}
      {!searchTerm && userChamas.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="outline-primary">
              {activeChama ? activeChama.name : 'Select Chama'}
              {activeChama?.isAdmin && (
                <FiStar size={14} className="ms-2 text-warning" />
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {userChamas.map(chama => (
                <Dropdown.Item 
                  key={chama.id} 
                  onClick={() => navigateToChama(chama.id)}
                  active={activeChama?.id === chama.id}
                >
                  {chama.name}
                  {chama.isAdmin && (
                    <FiStar size={14} className="ms-2 text-warning" />
                  )}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlusCircle className="me-2" />
            Create New Chama
          </Button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchTerm && (
        <div className="mb-4">
          <h5>Search Results for "{searchTerm}"</h5>
          {isSearching ? (
            <div className="text-center py-3">
              <Spinner animation="border" />
              <p className="mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <Row>
              {searchResults.map(renderChamaCard)}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              No chamas found matching "<strong>{searchTerm}</strong>"
            </Alert>
          )}
        </div>
      )}

      {/* My Chamas Section (only shown when not searching) */}
      {!searchTerm && (
        <>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="all" title={`All (${userChamas.length})`} />
            <Tab eventKey="admin" title={`Admin (${adminChamas.length})`} />
            <Tab eventKey="member" title={`Member (${memberChamas.length})`} />
          </Tabs>

          {loadingChamas ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading your chamas...</p>
            </div>
          ) : userChamas.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FiUsers size={48} className="text-muted mb-3" />
                <h5>No Chamas Found</h5>
                <p className="text-muted mb-4">
                  You haven't joined any chamas yet. Create or join one to get started.
                </p>
                <Button 
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FiPlusCircle className="me-2" />
                  Create Your First Chama
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {activeTab === 'all' && userChamas.map(renderChamaCard)}
              {activeTab === 'admin' && adminChamas.map(renderChamaCard)}
              {activeTab === 'member' && memberChamas.map(renderChamaCard)}
            </Row>
          )}
        </>
      )}

      {/* Chama Creation Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Chama</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateChama}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Chama Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={chamaData.name}
                onChange={handleChamaChange}
                placeholder="e.g. Umoja Group"
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Target Amount (Ksh)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FiDollarSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="targetAmount"
                      value={chamaData.targetAmount}
                      onChange={handleChamaChange}
                      placeholder="100000"
                      min="1000"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Number of Members</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FiUsers /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="memberCount"
                      value={chamaData.memberCount}
                      onChange={handleChamaChange}
                      placeholder="10"
                      min="2"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Contribution Period</Form.Label>
              <Form.Select
                name="period"
                value={chamaData.period}
                onChange={handleChamaChange}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Spinner as="span" size="sm" animation="border" />
                  <span className="ms-2">Creating...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="me-2" />
                  Create Chama
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Member to {currentChama?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInviteMember}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Member Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter member's registered email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                User must have an existing account with this email
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isInviting || !inviteEmail}>
              {isInviting ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : (
                <>
                  <FiMail className="me-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default HomePage;