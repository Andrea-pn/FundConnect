import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Modal, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { 
  collection, 
  getDocs,  
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChamaContext } from '../App';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const Events = ({ darkMode }) => {
  const navigate = useNavigate();
  // Remove URL param extraction - use context instead
  const { activeChama, chamaLoading } = useContext(ChamaContext);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [,setLoading] = useState(true);
  const [error, setError] = useState('');
  
  console.log('Active chama from context:', activeChama);
  console.log('Chama loading:', chamaLoading);
  
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

  // Helper function to get the events collection reference for the current chama
  const getEventsCollectionRef = () => {
    if (!activeChama?.id) {
      throw new Error('No chama selected');
    }
    return collection(db, 'chamas', activeChama.id, 'events');
  };

  // Load events when activeChama changes
  useEffect(() => {
    if (!chamaLoading && activeChama?.id) {
      fetchEvents();
      setLoading(false);
    } else if (!chamaLoading && !activeChama) {
      setLoading(false);
    }
    // eslint-disable-next-line 
  }, [activeChama?.id, chamaLoading]);

  // Fetch events specific to the current chama
  const fetchEvents = async () => {
    if (!activeChama?.id) return;
    
    try {
      setError(''); // Clear any previous errors
      
      // Create a query to get events ordered by creation date (newest first)
      const eventsQuery = query(
        getEventsCollectionRef(),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(eventsQuery);
      
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Handle date conversion safely
          date: data.date?.toDate?.()?.toISOString().split('T')[0] || data.date || '',
          // Handle timestamp conversion safely
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
        };
      });
      
      setEvents(eventsData);
      
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError(`Failed to load events for this chama: ${err.message}`);
    }
  };

  // Generate short readable IDs (8 characters)
  const generateShortId = () => {
    return uuidv4().substring(0, 8);
  };

  // Add new event to the current chama
  const handleAddEvent = async () => {
    if (!newEvent.name || !newEvent.location || !newEvent.date) {
      setError('Please fill in all required fields');
      return;
    }

    if (!activeChama?.id) {
      setError('No chama selected');
      return;
    }

    try {
      const eventId = generateShortId();
      const eventData = {
        ...newEvent,
        id: eventId,
        chamaId: activeChama.id, // Use activeChama.id from context
        amountCollected: parseFloat(newEvent.amountCollected) || 0,
        targetAmount: parseFloat(newEvent.targetAmount) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create the event document in the chama's events subcollection
      await setDoc(doc(getEventsCollectionRef(), eventId), eventData);
      
      // Refresh the events list
      await fetchEvents();
      
      // Reset form and close modal
      setShowAddModal(false);
      resetNewEventForm();
      setError('');
      
    } catch (err) {
      console.error("Error adding event: ", err);
      setError(`Failed to add event: ${err.message}`);
    }
  };

  // Edit existing event
  const handleEditEvent = async () => {
    if (!newEvent.name || !newEvent.location || !newEvent.date) {
      setError('Please fill in all required fields');
      return;
    }

    if (!currentEvent || !activeChama?.id) {
      setError('Invalid event or chama selection');
      return;
    }

    try {
      const eventRef = doc(getEventsCollectionRef(), currentEvent.id);
      
      const updatedData = {
        name: newEvent.name,
        type: newEvent.type,
        amountCollected: parseFloat(newEvent.amountCollected) || 0,
        targetAmount: parseFloat(newEvent.targetAmount) || 0,
        date: newEvent.date,
        location: newEvent.location,
        organizer: newEvent.organizer,
        status: newEvent.status,
        updatedAt: serverTimestamp()
      };

      await updateDoc(eventRef, updatedData);
      
      // Refresh the events list to get updated data
      await fetchEvents();
      
      setShowEditModal(false);
      setCurrentEvent(null);
      resetNewEventForm();
      setError('');
      
    } catch (err) {
      console.error("Error updating event: ", err);
      setError(`Failed to update event: ${err.message}`);
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!currentEvent || !activeChama?.id) {
      setError('Invalid event or chama selection');
      return;
    }

    try {
      await deleteDoc(doc(getEventsCollectionRef(), currentEvent.id));
      
      // Remove from local state
      setEvents(events.filter(event => event.id !== currentEvent.id));
      
      setShowDeleteModal(false);
      setCurrentEvent(null);
      setError('');
      
    } catch (err) {
      console.error("Error deleting event: ", err);
      setError(`Failed to delete event: ${err.message}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (event) => {
    setCurrentEvent(event);
    setNewEvent({
      name: event.name || '',
      type: event.type || 'Wedding',
      amountCollected: event.amountCollected || 0,
      targetAmount: event.targetAmount || 0,
      date: event.date || new Date().toISOString().split('T')[0],
      location: event.location || '',
      organizer: event.organizer || '',
      status: event.status || 'Active'
    });
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (event) => {
    setCurrentEvent(event);
    setShowDeleteModal(true);
  };

  // Reset form helper
  const resetNewEventForm = () => {
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
  };

  // UI helper functions
  const colors = {
    // Primary colors from your request
    primaryDark: '#034a31',    // Dark green
    primaryLight: '#33a17c',   // Light green
    
    // Derived colors
    cardBg: darkMode ? '#1e1e2d' : '#ffffff',
    cardText: darkMode ? '#e1e1e1' : '#333',
    tableHeaderBg: darkMode ? '#034a31' : '#33a17c',  // Use your greens here
    tableBorder: darkMode ? '#444' : '#dee2e6',
    tableStripedBg: darkMode ? '#2a2a3a' : '#f9f9f9',
    mainBg: darkMode ? '#111122' : '#f8f9fa',
    
    // Status colors that will work with the green theme
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
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
      case 'Wedding': return 'success';
      case 'Funeral': return 'dark';
      case 'Harambee': return 'warning';
      default: return 'secondary';
    }
  };

  const customButtonStyle = {
    backgroundColor: '#33a17c',
    borderColor: '#33a17c',
    '&:hover': {
      backgroundColor: '#034a31',
      borderColor: '#034a31'
    }
  };

  // Loading state - wait for context to finish loading
  if (chamaLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar darkMode={darkMode} />
        <div style={{ 
          flex: 1, 
          backgroundColor: colors.cardBg,
          color: colors.cardText,
          padding: '20px',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading chama data...</p>
          </div>
        </div>
      </div>
    );
  }

  // No chama selected state - check activeChama from context
  if (!activeChama) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar darkMode={darkMode} />
        <div style={{ 
          flex: 1, 
          backgroundColor: colors.cardBg,
          color: colors.cardText,
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Alert variant="warning">
            <h5>No Chama Selected</h5>
            <p>Please select a chama from your homepage first to view its events.</p>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => navigate('/')}>
                Go to Homepage
              </Button>
              <Button variant="outline-primary" onClick={() => navigate('/chamas')}>
                View All Chamas
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar darkMode={darkMode} />
      <div style={{ 
        flex: 1, 
        backgroundColor: colors.mainBg,
        padding: '20px',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: colors.cardBg,
          borderRadius: '8px',
          padding: '20px',
          color: colors.cardText,
          boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <Row className="mb-4">
            <Col>
              <h2>Events</h2>
              <p className="text-muted">Manage events for {activeChama.name}</p>
            </Col>
            <Col xs="auto">
              <Button 
                  style={darkMode ? null : customButtonStyle}
                  variant={darkMode ? "outline-primary" : "primary"}
                  onClick={() => setShowAddModal(true)}
              >
                Add New Event
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert 
              variant="danger" 
              onClose={() => setError('')} 
              dismissible
            >
              {error}
            </Alert>
          )}

          {events.length === 0 ? (
            <Alert variant="info">
              <h5>No Events Found</h5>
              <p>This chama doesn't have any events yet. Create your first event to get started!</p>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table responsive className="align-items-center">
                <thead className={darkMode ? "thead-dark" : "thead-light"}>
                  <tr>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7">
                      Event Name
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7">
                      Type
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7">
                      Date
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7">
                      Location
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7 text-right">
                      Collected
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7 text-right">
                      Target
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7">
                      Progress
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7">
                      Status
                    </th>
                    <th className="text-secondary text-xxs font-weight-bolder opacity-7 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <div className="d-flex px-2 py-1">
                          <div>
                            <h6 className="mb-0 text-sm">{event.name}</h6>
                            <p className="text-xs text-secondary mb-0">ID: {event.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={typeVariant(event.type)}
                          className="text-xs font-weight-bold"
                        >
                          {event.type}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-xs font-weight-bold">
                          {event.date || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-weight-bold">
                          {event.location || 'N/A'}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-xs font-weight-bold">
                          KSh {event.amountCollected?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-xs font-weight-bold">
                          KSh {event.targetAmount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td>
                        <div className="progress-wrapper">
                          <div className="progress-info">
                            <div className="progress-percentage">
                              <span className="text-xs font-weight-bold">
                                {Math.round(
                                  (event.amountCollected / event.targetAmount) * 100
                                ) || 0}%
                              </span>
                            </div>
                          </div>
                          <div className="progress">
                            <div
                              className={`progress-bar ${
                                (event.amountCollected / event.targetAmount) * 100 >= 100
                                  ? 'bg-success'
                                  : 'bg-primary'
                              }`}
                              role="progressbar"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (event.amountCollected / event.targetAmount) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={statusVariant(event.status)}
                          className="text-xs font-weight-bold"
                        >
                          {event.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditClick(event)}
                          title="Edit Event"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(event)}
                          title="Delete Event"
                        >
                          <FaTrashAlt />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton
            style={{ 
            backgroundColor: '#034a31',
            color: 'white' 
            }}
            closeVariant={darkMode ? "white" : undefined}
        >
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    placeholder="Enter event name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Type</Form.Label>
                  <Form.Select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Funeral">Funeral</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Enter event location"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Organizer</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                    placeholder="Enter organizer name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount Collected (KSh)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newEvent.amountCollected}
                    onChange={(e) => setNewEvent({...newEvent, amountCollected: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Amount (KSh)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newEvent.targetAmount}
                    onChange={(e) => setNewEvent({...newEvent, targetAmount: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddEvent}>
            Add Event
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Event Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    placeholder="Enter event name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Type</Form.Label>
                  <Form.Select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Funeral">Funeral</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Enter event location"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Organizer</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                    placeholder="Enter organizer name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount Collected (KSh)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newEvent.amountCollected}
                    onChange={(e) => setNewEvent({...newEvent, amountCollected: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Amount (KSh)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newEvent.targetAmount}
                    onChange={(e) => setNewEvent({...newEvent, targetAmount: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
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
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the event "{currentEvent?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent}>
            Delete Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Events;