import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Alert, 
  Badge,
  Dropdown,
  Card,
  Row,
  Col
} from 'react-bootstrap';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUser,
  FiShield,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ChamaContext } from '../App';

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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    status: 'active'
  });

  // Sample member data - in a real app, this would come from your API
  const [members, setMembers] = useState([
    { 
      id: '1',
      name: 'Martin Ndundu',
      email: 'martin@example.com',
      phone: '+254722321456',
      role: 'admin',
      status: 'active',
      joinDate: '2023-01-15'
    },
    { 
      id: '2',
      name: 'Jackson Kamau',
      email: 'jackson@example.com',
      phone: '+254721709743',
      role: 'admin',
      status: 'active',
      joinDate: '2023-02-20'
    },
    { 
      id: '3',
      name: 'Sultan Asman',
      email: 'asman@example.com',
      phone: '+254723709777',
      role: 'admin',
      status: 'active',
      joinDate: '2023-03-10'
    },
    { 
      id: '4',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254712709755',
      role: 'member',
      status: 'active',
      joinDate: '2023-04-05'
    },
    { 
      id: '5',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+254712709741',
      role: 'member',
      status: 'inactive',
      joinDate: '2023-05-12'
    }
  ]);

  const isAdmin = activeChama?.isAdmin || false;

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

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

  const handleAddMember = () => {
    if (!isAdmin) {
      setError('Only admins can add members');
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill all required fields');
      return;
    }

    // Add new member
    const newMember = {
      id: `mem-${Date.now()}`,
      ...formData,
      joinDate: new Date().toISOString().split('T')[0]
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

  const handleUpdateMember = () => {
    if (!isAdmin) return;

    const updatedMembers = members.map(member => 
      member.id === currentMember.id ? { ...member, ...formData } : member
    );

    setMembers(updatedMembers);
    setShowEditModal(false);
    setCurrentMember(null);
  };

  const handleDeleteMember = () => {
    if (!isAdmin) return;

    setMembers(members.filter(member => member.id !== memberToDelete.id));
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const handleStatusChange = (memberId, newStatus) => {
    if (!isAdmin) return;

    setMembers(members.map(member => 
      member.id === memberId ? { ...member, status: newStatus } : member
    ));
  };

  // Theme colors
  const colors = {
    cardBg: darkMode ? '#1e1e2d' : '#ffffff',
    cardText: darkMode ? '#e1e1e1' : '#333',
    tableHeaderBg: darkMode ? '#222233' : '#f8f9fa',
    tableBorder: darkMode ? '#444' : '#dee2e6',
    textPrimary: darkMode ? '#e1e1e1' : '#333'
  };

  // Card styles
  const statsCardStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
    height: '100%',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    color: colors.cardText,
    background: darkMode 
      ? 'linear-gradient(135deg, #182236 0%, #101827 100%)'
      : 'linear-gradient(135deg, #f0f6ff 0%, #e1ebf5 100%)'
  };

  // Calculate stats
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const adminMembers = members.filter(m => m.role === 'admin').length;

  return (
    <div className="members-page" style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: darkMode ? '#111122' : '#f8f9fa'
    }}>
      {/* Sidebar would be included from your layout */}
      
      <div className="main-content" style={{ 
        flex: 1,
        padding: '20px',
        color: colors.textPrimary
      }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Members</h1>
            <Badge bg={isAdmin ? "primary" : "secondary"}>
              {isAdmin ? 'Admin View' : 'Member View'}
            </Badge>
          </div>
          
          <div className="d-flex gap-2">
            <Button 
              variant={darkMode ? "dark" : "light"} 
              onClick={() => setDarkMode(!darkMode)}
              className="d-flex align-items-center"
            >
              {darkMode ? <FiMoon className="me-1" /> : <FiSun className="me-1" />}
              Theme
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
          <Col md={4}>
            <Card style={statsCardStyle}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Members</h6>
                    <h3>{totalMembers}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FiUser size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card style={statsCardStyle}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Active Members</h6>
                    <h3>{activeMembers}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FiUserCheck size={24} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card style={statsCardStyle}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Admin Members</h6>
                    <h3>{adminMembers}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FiShield size={24} className="text-warning" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Members Table */}
        <Card style={{ 
          border: 'none',
          boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Member List</h5>
              
              {isAdmin && (
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddModal(true)}
                  className="d-flex align-items-center"
                >
                  <FiPlus className="me-1" /> Add Member
                </Button>
              )}
            </div>
            
            <div className="table-responsive">
              <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            {member.role === 'admin' ? (
                              <FiShield className="text-warning" />
                            ) : (
                              <FiUser className="text-primary" />
                            )}
                          </div>
                          {member.name}
                        </div>
                      </td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>
                        <Badge bg={member.role === 'admin' ? 'warning' : 'primary'}>
                          {member.role}
                        </Badge>
                      </td>
                      <td>
                        {isAdmin ? (
                          <Dropdown>
                            <Dropdown.Toggle 
                              variant={member.status === 'active' ? 'success' : 'danger'} 
                              size="sm"
                              id={`status-dropdown-${member.id}`}
                            >
                              {member.status}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleStatusChange(member.id, 'active')}>
                                Set Active
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusChange(member.id, 'inactive')}>
                                Set Inactive
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        ) : (
                          <Badge bg={member.status === 'active' ? 'success' : 'danger'}>
                            {member.status}
                          </Badge>
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleEditMember(member)}
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
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Add Member Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddMember}>
              Add Member
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Member Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
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
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateMember}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {memberToDelete && (
              <>
                <p>Are you sure you want to delete <strong>{memberToDelete.name}</strong>?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMember}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Members;