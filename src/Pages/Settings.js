import React, { useState } from 'react';
import {
  Tabs, Tab, Card, Form, Button, Row, Col, Spinner,
  Container, Image, InputGroup, FormControl, Alert, Badge, Table
} from 'react-bootstrap';
import { FiUser, FiBell, FiLock, FiSettings, FiUsers, FiMail, FiPhone, FiBriefcase, FiCreditCard, FiDollarSign } from 'react-icons/fi';

const Settings = () => {
  const [currentUser] = useState({
    name: 'John Doe',
    email: 'john@chama.com',
    company: 'Jumuiya Investments',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    phone: '+254712345678',
    lastLogin: '2023-06-15T10:30:00Z'
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ ...currentUser });
  const [isSaving, setIsSaving] = useState(false);
  const [billingHistory] = useState([
    { id: 1, date: '2023-06-01', description: 'Premium Plan', amount: '$49.99', status: 'Paid' },
    { id: 2, date: '2023-05-01', description: 'Premium Plan', amount: '$49.99', status: 'Paid' },
    { id: 3, date: '2023-04-01', description: 'Premium Plan', amount: '$49.99', status: 'Paid' },
  ]);
  const [paymentMethod] = useState({
    cardType: 'Visa',
    lastFour: '4242',
    expiry: '12/25'
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Settings</h2>
      
      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
            id="settings-tabs"
          >
            <Tab eventKey="profile" title={
              <span><FiUser className="me-2" />Profile</span>
            }>
              {/* Profile tab content remains the same */}
              <div className="mt-4">
                <div className="text-center mb-4">
                  <Image 
                    src={currentUser.avatar} 
                    roundedCircle 
                    width={120}
                    height={120}
                    className="border"
                  />
                  <div className="mt-3">
                    <Button variant="outline-primary" size="sm">
                      Change Photo
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Badge bg="info" pill>
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FiUser className="me-2" />Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FiMail className="me-2" />Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FiBriefcase className="me-2" />Company</Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={profileForm.company}
                          onChange={handleProfileChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FiPhone className="me-2" />Phone</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>+254</InputGroup.Text>
                          <FormControl
                            type="tel"
                            name="phone"
                            value={profileForm.phone.replace('+254', '')}
                            onChange={(e) => handleProfileChange({
                              target: {
                                name: 'phone',
                                value: '+254' + e.target.value
                              }
                            })}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Alert variant="info" className="mt-4">
                    <strong>Last login:</strong> {new Date(currentUser.lastLogin).toLocaleString()}
                  </Alert>

                  <div className="text-end mt-4">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Spinner as="span" size="sm" animation="border" />
                          <span className="ms-2">Saving...</span>
                        </>
                      ) : 'Update Profile'}
                    </Button>
                  </div>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="notifications" title={
              <span><FiBell className="me-2" />Notifications</span>
            }>
              {/* Notifications tab content remains the same */}
              <div className="mt-4">
                <h4><FiBell className="me-2" />Notification Settings</h4>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Contribution Reminders"
                      checked={true}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Meeting Reminders"
                      checked={true}
                    />
                  </Form.Group>
                  <div className="text-end mt-4">
                    <Button variant="primary">Save Settings</Button>
                  </div>
                </Form>
              </div>
            </Tab>

            {/* New Billings Tab */}
            <Tab eventKey="billings" title={
              <span><FiCreditCard className="me-2" />Billings</span>
            }>
              <div className="mt-4">
                <h4><FiDollarSign className="me-2" />Billing Information</h4>
                
                <Card className="mb-4">
                  <Card.Body>
                    <h5>Payment Method</h5>
                    <div className="d-flex align-items-center mt-3">
                      <div className="bg-light p-2 rounded me-3">
                        <FiCreditCard size={24} />
                      </div>
                      <div>
                        <strong>{paymentMethod.cardType} ending in {paymentMethod.lastFour}</strong>
                        <div className="text-muted">Expires {paymentMethod.expiry}</div>
                      </div>
                      <Button variant="outline-primary" size="sm" className="ms-auto">
                        Change Payment Method
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                <h5 className="mt-4">Billing History</h5>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.description}</td>
                        <td>{item.amount}</td>
                        <td>
                          <Badge bg={item.status === 'Paid' ? 'success' : 'warning'}>
                            {item.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            Download Invoice
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="mt-4">
                  <h5>Current Plan</h5>
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Premium Plan</h6>
                          <div className="text-muted">$49.99/month</div>
                        </div>
                        <div>
                          <Badge bg="success">Active</Badge>
                        </div>
                        <Button variant="outline-danger" size="sm">
                          Cancel Subscription
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;  