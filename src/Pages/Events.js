import React, { useState } from 'react';
import { Table, Button, Form, Modal, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Events = ({ darkMode }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [events, setEvents] = useState([
    { 
      id: 1, 
      name: 'Wedding Fundraiser', 
      type: 'Wedding', 
      amountCollected: 50000, 
      targetAmount: 100000,
      date: '2023-07-15', 
      location: 'Nairobi', 
      organizer: 'John Doe',
      status: 'Active' 
    },
    { 
      id: 2, 
      name: 'Community Harambee', 
      type: 'Harambee', 
      amountCollected: 75000, 
      targetAmount: 150000,
      date: '2023-07-20', 
      location: 'Mombasa', 
      organizer: 'Jane Smith',
      status: 'Completed' 
    },
    { 
      id: 3, 
      name: 'Family Funeral', 
      type: 'Funeral', 
      amountCollected: 30000, 
      targetAmount: 50000,
      date: '2023-07-10', 
      location: 'Kisumu', 
      organizer: 'Mike Johnson',
      status: 'Active' 
    }
  ]);
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'Wedding',
    amountCollected: 0,
    targetAmount: 0,
    date: new Date().toISOString().split('T')[0],
    location: '',
    organizer: '',
    status: 'Active'
  });
  
  const [error, setError] = useState('');

  // Function to handle the edit button click
  const handleEditClick = (event) => {
    setCurrentEvent(event);
    setNewEvent({
      ...event,
      date: event.date
    });
    setShowEditModal(true);
  };

  // Function to save edited event
  const handleEditEvent = () => {
    if (!newEvent.name || !newEvent.location || !newEvent.date) {
      setError('Please fill in all required fields');
      return;
    }

    setEvents(events.map(event => 
      event.id === currentEvent.id ? {
        ...newEvent,
        amountCollected: parseFloat(newEvent.amountCollected),
        targetAmount: parseFloat(newEvent.targetAmount)
      } : event
    ));
    
    setShowEditModal(false);
    setCurrentEvent(null);
    setError('');
  };

  // Function to handle the delete button click
  const handleDeleteClick = (event) => {
    setCurrentEvent(event);
    setShowDeleteModal(true);
  };

  // Function to confirm event deletion
  const handleDeleteEvent = () => {
    setEvents(events.filter(event => event.id !== currentEvent.id));
    setShowDeleteModal(false);
    setCurrentEvent(null);
  };

  const handleAddEvent = () => {
    if (!newEvent.name || !newEvent.location || !newEvent.date) {
      setError('Please fill in all required fields');
      return;
    }

    setEvents([...events, { 
      ...newEvent, 
      id: events.length + 1,
      amountCollected: parseFloat(newEvent.amountCollected),
      targetAmount: parseFloat(newEvent.targetAmount)
    }]);
    
    setShowAddModal(false);
    setNewEvent({
      name: '',
      type: 'Wedding',
      amountCollected: 0,
      targetAmount: 0,
      date: new Date().toISOString().split('T')[0],
      location: '',
      organizer: '',
      status: 'Active'
    });
    setError('');
  };

  const statusVariant = (status) => {
    switch(status) {
      case 'Active': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const typeVariant = (type) => {
    switch(type) {
      case 'Wedding': return 'info';
      case 'Funeral': return 'dark';
      case 'Harambee': return 'warning';
      default: return 'secondary';
    }
  };

  const colors = {
    cardBg: darkMode ? '#1e1e2d' : '#ffffff',
    cardText: darkMode ? '#e1e1e1' : '#333',
    tableHeaderBg: darkMode ? '#222233' : '#f8f9fa',
    tableBorder: darkMode ? '#444' : '#dee2e6',
    tableStripedBg: darkMode ? '#2a2a3a' : '#f9f9f9',
    mainBg: darkMode ? '#111122' : '#f8f9fa'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Component */}
      <Sidebar darkMode={darkMode} />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        backgroundColor: colors.mainBg,
        backgroundImage: darkMode 
          ? 'radial-gradient(circle at 80% 10%, rgba(33, 33, 60, 0.8) 0%, rgba(22, 22, 36, 0.2) 100%)' 
          : 'radial-gradient(circle at 80% 10%, rgba(54, 135, 90, 0.15) 0%, rgba(240, 255, 244, 0.05) 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '20px',
          alignItems: 'center'
        }}>
          <h1 style={{ color: darkMode ? '#e1e1e1' : '#333' }}>
            Events
          </h1>
          <Button 
            variant={darkMode ? 'outline-danger' : 'danger'} 
            onClick={() => navigate('/')}
          >
            Logout
          </Button>
        </div>
        
        <Card style={{ 
          backgroundColor: colors.cardBg,
          color: colors.cardText,
          marginBottom: '20px',
          border: 'none',
          boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(66, 99, 235, 0.1), rgba(33, 33, 60, 0.1))' 
              : 'linear-gradient(135deg, rgba(54, 135, 90, 0.1), rgba(240, 255, 244, 0.1))',
            zIndex: 0,
            pointerEvents: 'none'
          }}></div>
          
          <Card.Body style={{ position: 'relative', zIndex: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ margin: 0, color: colors.cardText }}>Events Management</h2>
              <Button 
                variant={darkMode ? "outline-primary" : "primary"}
                onClick={() => setShowAddModal(true)}
              >
                Add New Event
              </Button>
            </div>

            <Table 
              striped 
              bordered 
              hover 
              responsive 
              style={{
                backgroundColor: darkMode ? 'rgba(24, 24, 36, 0.6)' : 'white',
                color: colors.cardText,
                borderColor: colors.tableBorder,
                boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.15)' : '0 5px 15px rgba(0,0,0,0.05)',
                borderRadius: '8px'
              }}
            >
              <thead style={{ backgroundColor: colors.tableHeaderBg }}>
                <tr>
                  <th>ID</th>
                  <th>Event Name</th>
                  <th>Type</th>
                  <th>Amount Collected</th>
                  <th>Target Amount</th>
                  <th>Progress</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} style={{ 
                    backgroundColor: darkMode 
                      ? (event.id % 2 === 0 ? 'rgba(40, 40, 60, 0.4)' : 'rgba(30, 30, 45, 0.6)') 
                      : (event.id % 2 === 0 ? 'rgba(249, 249, 249, 0.8)' : 'rgba(255, 255, 255, 0.9)')
                  }}>
                    <td>{event.id}</td>
                    <td>{event.name}</td>
                    <td>
                      <Badge bg={typeVariant(event.type)}>
                        {event.type}
                      </Badge>
                    </td>
                    <td>Ksh {event.amountCollected.toLocaleString()}</td>
                    <td>Ksh {event.targetAmount.toLocaleString()}</td>
                    <td>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ width: `${Math.min(100, (event.amountCollected / event.targetAmount) * 100)}%` }}
                          aria-valuenow={Math.min(100, (event.amountCollected / event.targetAmount) * 100)}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <small>{Math.round((event.amountCollected / event.targetAmount) * 100)}%</small>
                    </td>
                    <td>{event.date}</td>
                    <td>{event.location}</td>
                    <td>
                      <Badge bg={statusVariant(event.status)}>
                        {event.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant={darkMode ? "outline-info" : "info"} 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEditClick(event)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant={darkMode ? "outline-danger" : "danger"} 
                        size="sm"
                        onClick={() => handleDeleteClick(event)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Add Event Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header 
            closeButton 
            className={darkMode ? "bg-dark text-light" : ""}
            closeVariant={darkMode ? "white" : undefined}
          >
            <Modal.Title>Add New Event</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter event name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Type</Form.Label>
                <Form.Select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Funeral">Funeral</option>
                  <option value="Harambee">Harambee</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount Collected (Ksh)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newEvent.amountCollected}
                      onChange={(e) => setNewEvent({...newEvent, amountCollected: e.target.value})}
                      className={darkMode ? "bg-dark text-light" : ""}
                      min="0"
                      step="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Amount (Ksh)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newEvent.targetAmount}
                      onChange={(e) => setNewEvent({...newEvent, targetAmount: e.target.value})}
                      className={darkMode ? "bg-dark text-light" : ""}
                      min="0"
                      step="100"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter event location"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Organizer</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.organizer}
                  onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter organizer name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddEvent}>
              Save Event
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Edit Event Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header 
            closeButton 
            className={darkMode ? "bg-dark text-light" : ""}
            closeVariant={darkMode ? "white" : undefined}
          >
            <Modal.Title>Edit Event</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter event name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Type</Form.Label>
                <Form.Select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Funeral">Funeral</option>
                  <option value="Harambee">Harambee</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount Collected (Ksh)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newEvent.amountCollected}
                      onChange={(e) => setNewEvent({...newEvent, amountCollected: e.target.value})}
                      className={darkMode ? "bg-dark text-light" : ""}
                      min="0"
                      step="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Amount (Ksh)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newEvent.targetAmount}
                      onChange={(e) => setNewEvent({...newEvent, targetAmount: e.target.value})}
                      className={darkMode ? "bg-dark text-light" : ""}
                      min="0"
                      step="100"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter event location"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Organizer</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.organizer}
                  onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter organizer name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditEvent}>
              Update Event
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header 
            closeButton 
            className={darkMode ? "bg-dark text-light" : ""}
            closeVariant={darkMode ? "white" : undefined}
          >
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            Are you sure you want to delete the event "{currentEvent?.name}"? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Events;