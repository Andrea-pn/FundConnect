
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Events = ({ darkMode }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // Default events data
  const defaultEvents = [
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
  ];

  // Load events from memory or use default data (localStorage removed)
  const [events, setEvents] = useState(defaultEvents);
  
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

  // Function to generate next ID
  const getNextId = () => {
    return events.length > 0 ? Math.max(...events.map(event => event.id)) + 1 : 1;
  };

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
      id: getNextId(),
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
      
      {/* Main Content - Full Width */}
      <div style={{ 
        flex: 1, 
        backgroundColor: colors.cardBg,
        color: colors.cardText,
        padding: '20px',
        minHeight: '100vh'
      }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ margin: 0, color: colors.cardText }}>Events Management</h2>
          <Button 
            variant={darkMode ? "outline-primary" : "primary"}
            onClick={() => setShowAddModal(true)}
          >
            Add New Event
          </Button>
        </div>

        {/* Table Section */}
        <div style={{ overflowX: 'visible' }}>
          <Table 
            style={{
              backgroundColor: darkMode ? '#1a1a2e' : 'white',
              color: colors.cardText,
              border: `1px solid ${colors.tableBorder}`,
              borderRadius: '8px',
              borderCollapse: 'separate',
              borderSpacing: '0',
              width: '100%',
              boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)'
            }}
          >
            <thead>
              <tr style={{ 
                backgroundColor: darkMode ? '#16213e' : '#f8f9fa',
                borderBottom: `2px solid ${colors.tableBorder}`
              }}>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'center',
                  width: '40px'
                }}>ID</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  minWidth: '140px',
                  maxWidth: '160px'
                }}>Event Name</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'center',
                  width: '80px'
                }}>Type</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'right',
                  width: '100px'
                }}>Amount Collected</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'right',
                  width: '100px'
                }}>Target Amount</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'center',
                  width: '80px'
                }}>Progress</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'center',
                  width: '90px'
                }}>Date</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  width: '100px',
                  maxWidth: '100px'
                }}>Location</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  borderRight: `1px solid ${colors.tableBorder}`,
                  textAlign: 'center',
                  width: '80px'
                }}>Status</th>
                <th style={{ 
                  padding: '16px 8px', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: colors.cardText,
                  textAlign: 'center',
                  width: '120px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event.id} style={{ 
                  backgroundColor: darkMode 
                    ? (index % 2 === 0 ? '#1e1e2d' : '#252538')
                    : (index % 2 === 0 ? '#ffffff' : '#f8f9fa'),
                  borderBottom: `1px solid ${colors.tableBorder}`,
                  transition: 'background-color 0.2s ease'
                }}>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>{event.id}</td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    fontWeight: '500',
                    maxWidth: '160px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.3'
                  }}>{event.name}</td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'center'
                  }}>
                    <Badge 
                      bg={typeVariant(event.type)}
                      style={{ 
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {event.type}
                    </Badge>
                  </td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'right',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}>Ksh {event.amountCollected.toLocaleString()}</td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'right',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}>Ksh {event.targetAmount.toLocaleString()}</td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div 
                        style={{ 
                          width: '50px', 
                          height: '8px', 
                          backgroundColor: darkMode ? '#2a2a3a' : '#e9ecef',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div 
                          style={{ 
                            height: '100%',
                            width: `${Math.min(100, (event.amountCollected / event.targetAmount) * 100)}%`,
                            backgroundColor: '#28a745',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                      <small style={{ 
                        fontSize: '10px', 
                        fontWeight: '500',
                        color: colors.cardText
                      }}>
                        {Math.round((event.amountCollected / event.targetAmount) * 100)}%
                      </small>
                    </div>
                  </td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>{event.date}</td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    maxWidth: '100px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.3',
                    fontSize: '13px'
                  }}>{event.location}</td>
                  <td style={{ 
                    padding: '12px 8px',
                    borderRight: `1px solid ${colors.tableBorder}`,
                    textAlign: 'center'
                  }}>
                    <Badge 
                      bg={statusVariant(event.status)}
                      style={{ 
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td style={{ 
                    padding: '12px 8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '4px', 
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Button 
                        variant="outline-primary"
                        size="sm" 
                        onClick={() => handleEditClick(event)}
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          minWidth: '40px'
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(event)}
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          minWidth: '45px'
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

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