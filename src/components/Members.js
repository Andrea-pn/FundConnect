import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Sidebar from './Sidebar';
import './AdminDashboard.css';

const Members = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'member',
    password: '',
    confirmPassword: '',
    isSuperAdmin: false
  });
  
  // State for member list
  const [members, setMembers] = useState([
    { 
      id: '12345678',
      name: 'Martin Ndundu',
      email: 'martin@example.com',
      phone: '+254722321456',
      role: 'admin',
      isSuperAdmin: true 
    },
    { 
      id: '23456789',
      name: 'Jackson Kamau',
      email: 'jackson@example.com',
      phone: '+254721709743',
      role: 'admin',
      isSuperAdmin: true
    },
    { 
      id: '34567890',
      name: 'Sultan Asman',
      email: 'asman@example.com',
      phone: '+254723709777',
      role: 'admin',
      isSuperAdmin: true
    },
    { 
      id: '45678901',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254712709755',
      role: 'member',
      isSuperAdmin: false
    },
    { 
      id: '56789012',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+254712709741',
      role: 'member',
      isSuperAdmin: false
    }
  ]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleLogout = () => navigate('/');
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Generate a random 8-digit ID
  const generateRandomId = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Set a random ID when opening the add modal
  useEffect(() => {
    if (showAddModal) {
      setFormData(prev => ({
        ...prev,
        id: generateRandomId()
      }));
    }
  }, [showAddModal]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Check if ID is 8 digits
    if (!/^\d{8}$/.test(formData.id)) {
      alert("ID must be exactly 8 digits");
      return;
    }
    
    // Check if ID already exists
    if (members.some(member => member.id === formData.id)) {
      alert("This ID already exists. Please use a different ID.");
      return;
    }
    
    // Add new member to the list
    const newMember = {
      id: formData.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      isSuperAdmin: formData.isSuperAdmin
    };
    
    // Update the members array with the new member
    setMembers([...members, newMember]);
    
    // Close modal and reset form
    setShowAddModal(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'member',
      password: '',
      confirmPassword: '',
      isSuperAdmin: false
    });
  };

  const handleEdit = (id) => {
    // Find the member to edit
    const memberToEdit = members.find(member => member.id === id);
    if (memberToEdit) {
      // Set the current member and populate form data
      setCurrentMember(memberToEdit);
      setFormData({
        id: memberToEdit.id,
        name: memberToEdit.name,
        email: memberToEdit.email,
        phone: memberToEdit.phone,
        role: memberToEdit.role,
        password: '', // Don't populate password for security
        confirmPassword: '',
        isSuperAdmin: memberToEdit.isSuperAdmin
      });
      // Show edit modal
      setShowEditModal(true);
    }
  };

  const handleUpdate = (e) => {
    if (e) e.preventDefault();
    
    if (currentMember) {
      // Update member in the members array
      const updatedMembers = members.map(member => {
        if (member.id === currentMember.id) {
          return {
            ...member,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            isSuperAdmin: formData.isSuperAdmin
          };
        }
        return member;
      });
      
      // Update state
      setMembers(updatedMembers);
      
      // Close modal and reset
      setShowEditModal(false);
      setCurrentMember(null);
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'member',
        password: '',
        confirmPassword: '',
        isSuperAdmin: false
      });
    }
  };

  const initiateDelete = (id) => {
    // Find the member to delete
    const memberToDelete = members.find(member => member.id === id);
    if (memberToDelete) {
      setMemberToDelete(memberToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleDelete = () => {
    if (memberToDelete) {
      // In a real app with the described requirements, we would disable instead of delete
      // For this example, we'll just remove from the list
      const updatedMembers = members.filter(member => member.id !== memberToDelete.id);
      setMembers(updatedMembers);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  // Render member form (reused for both add and edit)
  const renderMemberForm = (isEdit = false) => (
    <Form onSubmit={isEdit ? handleUpdate : handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID (8 digits)</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Enter 8-digit ID" 
          name="id"
          value={formData.id}
          onChange={handleInputChange}
          required
          pattern="\d{8}"
          readOnly={isEdit} // ID can't be changed when editing
          maxLength={8}
        />
        <Form.Text className="text-muted">
          ID must be exactly 8 digits
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Enter name" 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email address</Form.Label>
        <Form.Control 
          type="email" 
          placeholder="Enter email" 
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="+254xxxxxxxxx" 
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
          <option value="admin">admin</option>
          <option value="member">member</option>
        </Form.Select>
      </Form.Group>

      {!isEdit && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Enter password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!isEdit}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Confirm password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required={!isEdit}
            />
          </Form.Group>
        </>
      )}

      <Form.Group className="mb-3">
        <Form.Check 
          type="checkbox" 
          label="Is Super Admin" 
          name="isSuperAdmin"
          checked={formData.isSuperAdmin}
          onChange={handleInputChange}
        />
      </Form.Group>
    </Form>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div style={{ 
        flex: 1, 
        padding: '20px',
        backgroundColor: darkMode ? '#111122' : '#ffffff'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '20px' 
          }}>
          <h1 style={{ color: darkMode ? '#e1e1e1' : '#333' }}>
            Members
          </h1>
          <Button 
           variant={darkMode ? 'outline-danger' : 'danger'} 
            onClick={handleLogout}
          >
           Logout
          </Button>
        </div>

        <Button 
          variant={darkMode ? 'outline-success' : 'success'}
          onClick={() => setShowAddModal(true)}
          style={{ marginBottom: '20px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus me-2" viewBox="0 0 16 16">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
          </svg>
          Add New User
        </Button>

        <Table striped bordered hover variant={darkMode ? 'dark' : 'light'}>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>ROLE</th>
              <th>SUPER ADMIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{member.role}</td>
                <td className="text-center">
                  {member.isSuperAdmin ? (
                    <div style={{ color: 'green', fontSize: '1.2rem' }}>✓</div>
                  ) : (
                    <div style={{ color: 'red', fontSize: '1.2rem' }}>✗</div>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      variant={darkMode ? "outline-primary" : "primary"} 
                      size="sm" 
                      onClick={() => handleEdit(member.id)}
                      style={{ width: "40px", height: "40px" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                      </svg>
                    </Button>
                    <Button 
                      variant={darkMode ? "outline-danger" : "danger"} 
                      size="sm" 
                      onClick={() => initiateDelete(member.id)}
                      style={{ width: "40px", height: "40px" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add Member Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {renderMemberForm(false)}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save Member
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Member Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {renderMemberForm(true)}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Update Member
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Custom Delete Confirmation Modal */}
        {/* Improved Delete Confirmation Modal */}
<Modal
  show={showDeleteModal}
  onHide={() => setShowDeleteModal(false)}
  centered
  size="sm"
  backdrop="static"
  className={darkMode ? "dark-modal" : ""}
>
  <Modal.Header closeButton className="border-0 pb-0">
    <Modal.Title className="fs-5">Delete User</Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center pt-0">
    <div className="my-3">
      <div className="delete-icon-wrapper mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-danger" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
        </svg>
      </div>
      
      <p className="mb-1 fw-bold">Delete user?</p>
      
      {memberToDelete && (
        <div className="user-info my-2">
          <p className="mb-0 fw-semibold">{memberToDelete.name}</p>
          <p className="text-muted small mb-0">{memberToDelete.email}</p>
        </div>
      )}
      
      <p className="text-muted small mt-2">This action cannot be undone.</p>
    </div>
  </Modal.Body>
  <Modal.Footer className="border-0 pt-0 d-flex justify-content-between">
    <Button 
      variant={darkMode ? "outline-secondary" : "light"} 
      size="sm" 
      onClick={() => setShowDeleteModal(false)}
      className="px-3"
    >
      Cancel
    </Button>
    <Button 
      variant="danger" 
      size="sm" 
      onClick={handleDelete}
      className="px-3"
    >
      Delete
    </Button>
  </Modal.Footer>
</Modal>
      </div>
    </div>
  );
};

export default Members;