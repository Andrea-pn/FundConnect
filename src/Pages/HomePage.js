import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, 
  Modal, Badge, Spinner, Alert,
  InputGroup, ProgressBar,
  FormControl, Dropdown, ButtonGroup
} from 'react-bootstrap';
import { 
  FiPlusCircle, FiDollarSign, 
  FiUsers, FiCheckCircle,
  FiStar, FiHome, FiSearch,
  FiMail, FiUserPlus, FiAlertCircle, FiInfo
} from 'react-icons/fi';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Tabs from '@radix-ui/react-tabs';

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

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      // ===== VALIDATION SECTION =====
  
      
      // Validate user is logged in
      if (!user || !user.uid) {
        toast.error("You must be logged in to send invitations");
        return;
      }

      // Validate chama is selected
      if (!currentChama || !currentChama.id) {
        toast.error("No chama selected");
        return;
      }

      // Validate email is provided
      if (!inviteEmail || !inviteEmail.trim()) {
        toast.error("Please enter an email address");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }

      // ===== VERIFY ADMIN STATUS =====
      const userMembershipsQuery = query(
        collection(db, 'memberships'),
        where('userId', '==', user.uid),
        where('chamaId', '==', currentChama.id)
      );
      const userMembershipSnapshot = await getDocs(userMembershipsQuery);
      
      if (userMembershipSnapshot.empty) {
        toast.error("You are not a member of this chama");
        return;
      }
      
      const userMembership = userMembershipSnapshot.docs[0].data();
      
      if (userMembership.role !== 'admin') {
        toast.error("You must be an admin to invite members");
        return;
      }

      // ===== FIND USER TO INVITE =====
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', inviteEmail.trim()));
      const userQuerySnapshot = await getDocs(userQuery);
    
      if (userQuerySnapshot.empty) {
        toast.error("User with this email not found. They need to register first.");
        return;
      }
    
      const userToInvite = userQuerySnapshot.docs[0].data();
      

      // ===== CHECK FOR EXISTING MEMBERSHIP =====
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

      // ===== CHECK FOR PENDING INVITATIONS =====
      const invitationsRef = collection(db, 'invitations');
      const invitationQuery = query(
        invitationsRef,
        where('chamaId', '==', currentChama.id),
        where('invitedUserEmail', '==', inviteEmail.trim()),
        where('status', '==', 'pending')
      );
      const invitationSnapshot = await getDocs(invitationQuery);
    
      if (!invitationSnapshot.empty) {
        toast.info("Invitation already sent to this user");
        return;
      }

      // ===== CREATE ONLY INVITATION RECORD (NOT MEMBERSHIP) =====
      const invitationData = {
        chamaId: currentChama.id,
        chamaName: currentChama.name,
        invitedUserId: userToInvite.uid,
        invitedUserEmail: inviteEmail.trim(),
        invitedUserName: userToInvite.displayName || userToInvite.name || inviteEmail.split('@')[0],
        invitedUserPhone: userToInvite.phoneNumber || userToInvite.phone || '',
        inviterUserId: user.uid,
        inviterEmail: user.email,
        inviterName: user.displayName || user.email || 'Admin',
        proposedRole: 'member', // Default role for invited users
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
      };

              const inviteDocRef = await addDoc(collection(db, 'invitations'), invitationData);

      // ===== SUCCESS HANDLING =====
      toast.success(`Successfully invited ${inviteEmail} to ${currentChama.name}`);
      setInviteEmail('');
      setShowInviteModal(false);

      // TODO: Send email notification to the invited user
      // You might want to implement email sending here or trigger a cloud function

      return {
        success: true,
        invitationId: inviteDocRef.id
      };

    } catch (error) {
      console.error("❌ Error in invitation process:", {
        error: error,
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // Specific error handling
      if (error.code === 'permission-denied') {
        toast.error("You don't have permission to invite members");
      } else if (error.code === 'invalid-argument') {
        toast.error("Invalid data. Please check all fields.");
      } else if (error.message.includes('network')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to send invitation. Please try again.");
      }

      return { success: false, error };
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

    

    // Get user details from auth or fetch from users collection
    let userName = user.displayName || user.email?.split('@')[0] || 'Admin';
    let userPhone = user.phoneNumber || '';

    // Optional: Fetch additional user details from users collection if needed
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', user.email)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        userName = userData.displayName || userData.name || userName;
        userPhone = userData.phoneNumber || userData.phone || userPhone;
      }
    } catch (userFetchError) {
      console.log("Could not fetch additional user details:", userFetchError);
      // Continue with auth user data
    }

    // Create the membership with all required fields
    await addDoc(collection(db, 'memberships'), {
      userId: user.uid,
      chamaId: chamaRef.id,
      chamaName: chamaData.name, // Add chama name
      name: userName, // Add user's display name
      email: user.email, // Add user's email
      phone: userPhone, // Add user's phone
      role: 'admin',
      status: 'active',
      joinDate: new Date().toISOString(), // Use consistent date format
      joinedAt: serverTimestamp(), // Keep your original field too
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      isCreator: true // Flag to identify the chama creator
    });

    

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
            style={{margin:"3px", backgroundColor:"#198754"}}
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
    <Container className="py-4" fluid="md">
      {/* Header with Search */}
      <Row className="mb-4 align-items-center g-3">
        <Col md={6}>
          <div className="d-flex align-items-center">
            <FiHome className="text-primary me-2" size={24} />
            <h1 className="h2 mb-0">My Chamas</h1>
          </div>
        </Col>
        <Col md={6}>
          <InputGroup className="shadow-sm">
            <InputGroup.Text className="bg-white">
              <FiSearch className="text-muted" />
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
              className="border-start-0"
            />
            <Button 
              variant="primary" 
              onClick={searchChamas}
              disabled={!searchTerm.trim() || isSearching}
              className="px-3"
            >
              {isSearching ? (
                <Spinner as="span" size="sm" animation="border" role="status" />
              ) : (
                <span>Search</span>
              )}
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Chama Selector and Create Button */}
      {!searchTerm && userChamas.length > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center">
              <span className="me-2">
                {activeChama ? activeChama.name : 'Select Chama'}
              </span>
              {activeChama?.isAdmin && (
                <FiStar size={16} className="text-warning" />
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm">
              {userChamas.map(chama => (
                <Dropdown.Item 
                  key={chama.id} 
                  onClick={() => navigateToChama(chama.id)}
                  active={activeChama?.id === chama.id}
                  className="d-flex align-items-center"
                >
                  <span className="flex-grow-1">{chama.name}</span>
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
            className="d-flex align-items-center"
          >
            <FiPlusCircle className="me-2" size={18} />
            Create New Chama
          </Button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4 shadow-sm">
          <div className="d-flex align-items-center">
            <FiAlertCircle className="me-2" size={20} />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {/* Search Results */}
      {searchTerm && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Search Results for "{searchTerm}"</h3>
          {isSearching ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" />
              <p className="mt-2 text-muted">Searching chamas...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <Row className="g-4">
              {searchResults.map(renderChamaCard)}
            </Row>
          ) : (
            <Alert variant="info" className="text-center shadow-sm">
              <FiInfo className="me-2" size={18} />
              No chamas found matching "<strong>{searchTerm}</strong>"
            </Alert>
          )}
        </div>
      )}

      {/* My Chamas Section (only shown when not searching) */}
      {!searchTerm && (
        <Tabs.Root 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-4"
        >
          {/* Tab List - Styled to match Bootstrap */}
          <Tabs.List className="nav nav-tabs mb-3">
            <Tabs.Trigger 
              value="all" 
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            >
              All ({userChamas.length})
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="admin" 
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
            >
              Admin ({adminChamas.length})
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="member" 
              className={`nav-link ${activeTab === 'member' ? 'active' : ''}`}
            >
              Member ({memberChamas.length})
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab Content with proper spacing and animations */}
          {loadingChamas ? (
            <Tabs.Content value={activeTab} className="pt-2">
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading your chamas...</p>
              </div>
            </Tabs.Content>
          ) : userChamas.length === 0 ? (
            <Tabs.Content value={activeTab} className="pt-2">
              <Card className="text-center py-5 border-0 shadow-sm">
                <Card.Body className="px-4 py-5">
                  <FiUsers size={48} className="text-muted mb-3" />
                  <h4 className="mb-2">No Chamas Found</h4>
                  <p className="text-muted mb-4">
                    You haven't joined any chamas yet. Create or join one to get started.
                  </p>
                  <Button 
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    size="lg"
                  >
                    <FiPlusCircle className="me-2" />
                    Create Your First Chama
                  </Button>
                </Card.Body>
              </Card>
            </Tabs.Content>
          ) : (
            <>
              <Tabs.Content value="all" className="pt-2">
                <Row className="g-4">
                  {userChamas.map(renderChamaCard)}
                </Row>
              </Tabs.Content>
              <Tabs.Content value="admin" className="pt-2">
                <Row className="g-4">
                  {adminChamas.map(renderChamaCard)}
                </Row>
              </Tabs.Content>
              <Tabs.Content value="member" className="pt-2">
                <Row className="g-4">
                  {memberChamas.map(renderChamaCard)}
                </Row>
              </Tabs.Content>
            </>
          )}
        </Tabs.Root>
      )}

      {/* Chama Creation Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5">Create New Chama</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateChama}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Label>Chama Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={chamaData.name}
                onChange={handleChamaChange}
                placeholder="e.g. Umoja Group"
                required
                autoFocus
              />
            </Form.Group>

            <Row className="mb-3 g-3">
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
                <option value="">Select period</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Spinner as="span" size="sm" animation="border" className="me-2" />
                  Creating...
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
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5">
            Invite Member to {currentChama?.name}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInviteMember}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Label>Member Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter member's registered email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                autoFocus
              />
              <Form.Text className="text-muted">
                <small>User must have an existing account with this email</small>
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isInviting || !inviteEmail}>
              {isInviting ? (
                <Spinner as="span" size="sm" animation="border" className="me-2" />
              ) : (
                <FiMail className="me-2" />
              )}
              Send Invitation
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default HomePage;