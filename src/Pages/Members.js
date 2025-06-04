import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Button, Table, Modal, Form, Alert, Badge,
  Dropdown, Card, Row, Col, Spinner, Tooltip, OverlayTrigger
} from 'react-bootstrap';
import { 
  FiPlus, FiEdit2, FiTrash2, FiMoreVertical,
  FiSun, FiMoon, FiLogOut, FiUser,
  FiShield, FiUserCheck, FiClock, FiMail, 
  FiPhone, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ChamaContext } from '../App';
import { db } from '../firebase';
import { 
  collection, addDoc, getDocs, doc, 
  updateDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { toast } from 'react-toastify';

const Members = () => {
  const navigate = useNavigate();
  const { chama } = useOutletContext();
  const { activeChama } = useContext(ChamaContext);
  
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    status: 'active'
  });

  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  const isAdmin = activeChama?.isAdmin || false;

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Fetch members and invitations from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!activeChama?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch members
        const membersRef = collection(db, 'memberships');
        const membersQuery = query(membersRef, where('chamaId', '==', activeChama.id));
        const membersSnapshot = await getDocs(membersQuery);
        
        const membersData = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'member'
        }));
        
        // Fetch pending invitations with user details
        const invitationsRef = collection(db, 'invitations');
        const invitationsQuery = query(
          invitationsRef,
          where('chamaId', '==', activeChama.id),
          where('status', '==', 'pending')
        );
        const invitationsSnapshot = await getDocs(invitationsQuery);
        
        // Get user details for each invitation
        const invitationsData = await Promise.all(
          invitationsSnapshot.docs.map(async doc => {
            const inviteData = doc.data();
            // Fetch user details from users collection
            const userQuery = query(
              collection(db, 'users'),
              where('email', '==', inviteData.invitedUserEmail)
            );
            const userSnapshot = await getDocs(userQuery);
            const userData = userSnapshot.docs[0]?.data() || {};
            
            return {
              id: doc.id,
              ...inviteData,
              ...userData, // Merge user details with invitation
              type: 'invitation'
            };
          })
        );
        
        setMembers(membersData);
        setPendingInvitations(invitationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeChama, refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddMember = async () => {
    if (!isAdmin) {
      setError('Only admins can add members');
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    try {
      setLoading(true);
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'memberships'), {
        ...formData,
        chamaId: activeChama.id,
        chamaName: activeChama.name,
        joinDate: new Date().toISOString(),
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      // Update local state
      const newMember = {
        id: docRef.id,
        ...formData,
        joinDate: new Date().toISOString(),
        type: 'member'
      };

      setMembers([...members, newMember]);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'member',
        status: 'active'
      });
      setError('');
      
      toast.success('Member added successfully!');
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member. Please try again.');
      toast.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member) => {
    if (!isAdmin) return;
    
    setCurrentMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      status: member.status
    });
    setShowEditModal(true);
  };

  const handleUpdateMember = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      
      // Update in Firestore
      await updateDoc(doc(db, 'memberships', currentMember.id), {
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.uid
      });

      // Update local state
      const updatedMembers = members.map(member => 
        member.id === currentMember.id ? { ...member, ...formData } : member
      );

      setMembers(updatedMembers);
      setShowEditModal(false);
      setCurrentMember(null);
      
      toast.success('Member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'memberships', memberToDelete.id));

      // Update local state
      setMembers(members.filter(member => member.id !== memberToDelete.id));
      setShowDeleteModal(false);
      setMemberToDelete(null);
      
      toast.success('Member deleted successfully!');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (memberId, newStatus) => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      
      // Update in Firestore
      await updateDoc(doc(db, 'memberships', memberId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.uid
      });

      // Update local state
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, status: newStatus } : member
      ));
      
      toast.success(`Member status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats including pending invitations
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const adminMembers = members.filter(m => m.role === 'admin').length;
  const pendingCount = pendingInvitations.length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Tooltip for refresh button
  const refreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Refresh data
    </Tooltip>
  );

  return (
    <div className="members-page" style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: darkMode ? '#111122' : '#f8f9fa'
    }}>
      <div className="main-content" style={{ 
        flex: 1,
        padding: '20px',
        color: darkMode ? '#e1e1e1' : '#333'
      }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Members</h1>
            <Badge bg={isAdmin ? "primary" : "secondary"}>
              {isAdmin ? 'Admin View' : 'Member View'}
            </Badge>
          </div>
          
          <div className="d-flex gap-2">
            <OverlayTrigger placement="bottom" overlay={refreshTooltip}>
              <Button 
                variant="outline-secondary" 
                onClick={refreshData}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? "spin" : ""} />
              </Button>
            </OverlayTrigger>
            <Button 
              variant={darkMode ? "dark" : "light"} 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiMoon /> : <FiSun />}
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant={darkMode ? "outline-light" : "outline-secondary"}>
                <FiMoreVertical />
              </Dropdown.Toggle>
              <Dropdown.Menu className={darkMode ? "bg-dark" : ""}>
                <Dropdown.Item onClick={handleLogout}>
                  <FiLogOut className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="h-100" bg={darkMode ? 'dark' : 'light'}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title>Total Members</Card.Title>
                    <h3>{totalMembers}</h3>
                  </div>
                  <FiUser size={24} className="text-primary" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100" bg={darkMode ? 'dark' : 'light'}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title>Active Members</Card.Title>
                    <h3>{activeMembers}</h3>
                  </div>
                  <FiUserCheck size={24} className="text-success" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100" bg={darkMode ? 'dark' : 'light'}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title>Admin Members</Card.Title>
                    <h3>{adminMembers}</h3>
                  </div>
                  <FiShield size={24} className="text-warning" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100" bg={darkMode ? 'dark' : 'light'}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title>Pending Invites</Card.Title>
                    <h3>{pendingCount}</h3>
                  </div>
                  <FiClock size={24} className="text-info" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Members Table */}
        <Card className="mb-4" bg={darkMode ? 'dark' : 'light'}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title>Member List</Card.Title>
              {isAdmin && (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <FiPlus className="me-1" /> Add Member
                </Button>
              )}
            </div>
            
            <div className="table-responsive">
              <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Role</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {/* Render members */}
                  {members.map(member => (
                    <tr key={`member-${member.id}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          {member.role === 'admin' ? (
                            <FiShield className="text-warning me-2" />
                          ) : (
                            <FiUser className="text-primary me-2" />
                          )}
                          {member.name}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-1">
                            <FiMail className="me-2 text-muted" size={14} />
                            <small>{member.email}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FiPhone className="me-2 text-muted" size={14} />
                            <small>{member.phone || 'Not provided'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={member.status === 'active' ? 'success' : 'danger'}
                          className="text-capitalize"
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info">Member</Badge>
                      </td>
                      <td>
                        <Badge bg={member.role === 'admin' ? 'warning' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleEditMember(member)}
                              title="Edit member"
                            >
                              <FiEdit2 />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => {
                                setMemberToDelete(member);
                                setShowDeleteModal(true);
                              }}
                              title="Delete member"
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  
                  {/* Render pending invitations with user details */}
                  {pendingInvitations.map(invite => (
                    <tr key={`invite-${invite.id}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiClock className="text-warning me-2" />
                          {invite.displayName || invite.invitedUserEmail.split('@')[0]}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-1">
                            <FiMail className="me-2 text-muted" size={14} />
                            <small>{invite.invitedUserEmail}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FiPhone className="me-2 text-muted" size={14} />
                            <small>{invite.phoneNumber || 'Not provided'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="warning" className="text-capitalize">
                          Pending
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="secondary">Invitation</Badge>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          N/A
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id={`tooltip-${invite.id}`}>
                                Invitation pending acceptance
                              </Tooltip>
                            }
                          >
                            <span>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                disabled
                              >
                                <FiInfo />
                              </Button>
                            </span>
                          </OverlayTrigger>
                        </td>
                      )}
                    </tr>
                  ))}
                  
                  {members.length === 0 && pendingInvitations.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="text-center py-4">
                        <div className="text-muted">
                          No members or pending invitations found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Add Member Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
            <Modal.Title>Add New Member</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  className={darkMode ? "bg-secondary text-light" : ""}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  className={darkMode ? "bg-secondary text-light" : ""}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  className={darkMode ? "bg-secondary text-light" : ""}
                />
                <Form.Text className="text-muted">
                  Format: 0712345678 (10-15 digits)
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={darkMode ? "bg-secondary text-light" : ""}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddMember} disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Member Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
            <Modal.Title>Edit Member</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={darkMode ? "bg-secondary text-light" : ""}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={darkMode ? "bg-secondary text-light" : ""}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={darkMode ? "bg-secondary text-light" : ""}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={darkMode ? "bg-secondary text-light" : ""}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={darkMode ? "bg-secondary text-light" : ""}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateMember} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            {memberToDelete && (
              <>
                <p>Are you sure you want to delete <strong>{memberToDelete.name}</strong>?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMember} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Members;