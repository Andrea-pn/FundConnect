import React, { useState, useEffect, useRef } from 'react';
import {
  Tabs, Tab, Card, Form, Button, Row, Col, Spinner,
  Container, Image, InputGroup, FormControl, Alert, Badge, Table,
  Modal, ListGroup, Dropdown
} from 'react-bootstrap';
import { 
  FiUser, FiBell, FiMail, FiPhone, 
  FiBriefcase, FiCreditCard, FiDollarSign, FiSave,
  FiLock, FiShield, FiUsers,
  FiPlus, FiTrash2, FiEdit2
} from 'react-icons/fi';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { updateEmail, updateProfile, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    company: '',
    photoURL: ''
  });
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // Add for email change
  const [currentPassword, setCurrentPassword] = useState(''); // Add for reauth
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const photoInputRef = useRef(null);

  // Chama-specific settings
  const [chamaDetails, setChamaDetails] = useState({
    name: '',
    description: '',
    meetingFrequency: 'monthly',
    contributionAmount: 0,
    contributionCurrency: 'KES',
    meetingDay: '1',
    meetingTime: '10:00'
  });
  const [members, setMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member'
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    passwordChangeRequired: false
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Existing state for other tabs
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
  const [notifications, setNotifications] = useState({
    contributionReminders: true,
    meetingReminders: true,
    latePaymentAlerts: true,
    withdrawalNotifications: true
  });

  // Fetch user data from Firestore
  // Add auth state listener + auto-create user doc if missing
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setCurrentUser(currentUser);
      if (currentUser) fetchUserData(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (currentUser) => {
    try {
      setLoadingProfile(true);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      // Auto-create user doc if missing
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          email: currentUser.email,
          displayName: currentUser.displayName || '',
          phone: '',
          company: '',
          photoURL: currentUser.photoURL || '',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Update state with merged data
      const userData = userDoc.exists() ? userDoc.data() : {};
      setProfileForm({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: userData.phone || '',
        company: userData.company || '',
        photoURL: currentUser.photoURL || ''
      });
      setAvatarPreview(currentUser.photoURL || defaultAvatar);
    } catch (err) {
      setProfileError('Failed to fetch user data');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Default avatar URL
  const defaultAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Add validation
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image must be less than 5MB');
      return;
    }

    try {
      // Delete old photo if exists
      if (currentUser.photoURL && currentUser.photoURL.includes('firebase')) {
        try {
          await deleteObject(ref(storage, currentUser.photoURL));
        } catch (err) {
          console.log('Old photo deletion failed (ignoring)', err);
        }
      }

      // Upload new photo with timestamp
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `profilePhotos/${currentUser.uid}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setAvatarPreview(downloadURL);
      setProfileForm(prev => ({ ...prev, photoURL: downloadURL }));
    } catch (err) {
      setProfileError('Photo upload failed: ' + err.message);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChamaChange = (e) => {
    const { name, value } = e.target;
    setChamaDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSaving(true);

    try {
      // Check for email change
      if (profileForm.email !== currentUser.email) {
        setShowPasswordPrompt(true); // Trigger reauth
        setIsSaving(false);
        return;
      }

      // Normal update
      await updateProfile(currentUser, {
        displayName: profileForm.displayName,
        photoURL: profileForm.photoURL
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        company: profileForm.company,
        photoURL: profileForm.photoURL,
        lastUpdated: new Date().toISOString()
      });

      setProfileSuccess('Profile updated!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Add email update with reauth
  const handleEmailUpdate = async () => {
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      await updateEmail(currentUser, profileForm.email);
      await updateDoc(doc(db, 'users', currentUser.uid), { email: profileForm.email });
      
      setProfileSuccess('Email updated successfully!');
      setShowPasswordPrompt(false);
    } catch (err) {
      setProfileError('Reauthentication failed: ' + err.message);
    }
  };

  const handleChamaSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'chamas', currentUser.uid), chamaDetails);
      setProfileSuccess('Chama settings updated successfully!');
    } catch (err) {
      setProfileError('Failed to update chama settings');
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    try {
      await addDoc(collection(db, 'chamas', currentUser.uid, 'members'), newMember);
      setMembers([...members, { ...newMember, id: Date.now().toString() }]);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        role: 'member'
      });
      setShowAddMemberModal(false);
      setProfileSuccess('Member added successfully!');
    } catch (err) {
      setProfileError('Failed to add member');
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await deleteDoc(doc(db, 'chamas', currentUser.uid, 'members', memberId));
      setMembers(members.filter(member => member.id !== memberId));
      setProfileSuccess('Member removed successfully!');
    } catch (err) {
      setProfileError('Failed to remove member');
      console.error(err);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setProfileSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      setProfileError(err.message || 'Failed to send reset email');
    }
  };

  const handleToggle = (field) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSecurityToggle = (field) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDeleteAccount = async () => {
    // Implement account deletion logic
    // This is a sensitive operation and should be handled carefully
    setShowDeleteModal(false);
    setProfileSuccess('Account deletion request received. We will contact you shortly.');
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
            <Tab eventKey="profile" title={<span><FiUser className="me-2" />Profile</span>}>
              {loadingProfile ? (
                <div className="text-center my-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p>Loading profile...</p>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="text-center mb-4">
                    <Image
                      src={avatarPreview}
                      roundedCircle
                      width={120}
                      height={120}
                      className="border"
                      alt="Profile"
                    />
                    <div className="mt-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => photoInputRef.current.click()}
                      >
                        Change Photo
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="mt-2">
                      <Badge bg={currentUser.emailVerified ? "success" : "warning"} pill>
                        {currentUser.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>

                  {profileError && <Alert variant="danger">{profileError}</Alert>}
                  {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}

                  <Form onSubmit={handleProfileSubmit}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><FiUser className="me-2" />Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="displayName"
                            value={profileForm.displayName}
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
                          <Form.Label><FiBriefcase className="me-2" />Company/Chama</Form.Label>
                          <Form.Control
                            type="text"
                            name="company"
                            value={profileForm.company}
                            onChange={handleProfileChange}
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
                      <strong>Account created:</strong> {new Date(currentUser.metadata.creationTime).toLocaleString()}
                      <br />
                      <strong>Last login:</strong> {new Date(currentUser.metadata.lastSignInTime).toLocaleString()}
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
                        ) : (
                          <>
                            <FiSave className="me-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </Tab>

            <Tab eventKey="chama" title={<span><FiUsers className="me-2" />Chama Settings</span>}>
              <div className="mt-4">
                <h4><FiUsers className="me-2" />Chama Details</h4>
                
                <Form onSubmit={handleChamaSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Chama Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={chamaDetails.name}
                          onChange={handleChamaChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={chamaDetails.description}
                          onChange={handleChamaChange}
                          rows={1}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contribution Amount</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>{chamaDetails.contributionCurrency}</InputGroup.Text>
                          <FormControl
                            type="number"
                            name="contributionAmount"
                            value={chamaDetails.contributionAmount}
                            onChange={handleChamaChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Meeting Frequency</Form.Label>
                        <Form.Select
                          name="meetingFrequency"
                          value={chamaDetails.meetingFrequency}
                          onChange={handleChamaChange}
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Meeting Day</Form.Label>
                        <Form.Select
                          name="meetingDay"
                          value={chamaDetails.meetingDay}
                          onChange={handleChamaChange}
                        >
                          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-end mt-4">
                    <Button variant="primary" type="submit">
                      <FiSave className="me-2" />
                      Save Chama Settings
                    </Button>
                  </div>
                </Form>

                <h4 className="mt-5"><FiUsers className="me-2" />Members Management</h4>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Current Members ({members.length})</h5>
                  <Button variant="primary" size="sm" onClick={() => setShowAddMemberModal(true)}>
                    <FiPlus className="me-1" /> Add Member
                  </Button>
                </div>

                <ListGroup>
                  {members.map(member => (
                    <ListGroup.Item key={member.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{member.name}</strong>
                        <div className="text-muted small">{member.email || member.phone}</div>
                        <Badge bg={member.role === 'admin' ? 'primary' : 'secondary'} className="mt-1">
                          {member.role}
                        </Badge>
                      </div>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" id="dropdown-member-actions">
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item><FiEdit2 className="me-2" />Edit</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleRemoveMember(member.id)}>
                            <FiTrash2 className="me-2" />Remove
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Tab>

            <Tab eventKey="notifications" title={<span><FiBell className="me-2" />Notifications</span>}>
              <div className="mt-4">
                <h4><FiBell className="me-2" />Notification Settings</h4>
                <Form>
                  <h5 className="mt-4">Contribution Notifications</h5>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Contribution Reminders"
                      checked={notifications.contributionReminders}
                      onChange={() => handleToggle('contributionReminders')}
                    />
                    <Form.Text className="text-muted">
                      Receive reminders when contributions are due
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Late Payment Alerts"
                      checked={notifications.latePaymentAlerts}
                      onChange={() => handleToggle('latePaymentAlerts')}
                    />
                    <Form.Text className="text-muted">
                      Get notified when members miss payments
                    </Form.Text>
                  </Form.Group>

                  <h5 className="mt-4">Meeting Notifications</h5>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Meeting Reminders"
                      checked={notifications.meetingReminders}
                      onChange={() => handleToggle('meetingReminders')}
                    />
                    <Form.Text className="text-muted">
                      Receive reminders before scheduled meetings
                    </Form.Text>
                  </Form.Group>

                  <h5 className="mt-4">Financial Notifications</h5>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Withdrawal Notifications"
                      checked={notifications.withdrawalNotifications}
                      onChange={() => handleToggle('withdrawalNotifications')}
                    />
                    <Form.Text className="text-muted">
                      Get notified when funds are withdrawn from the chama account
                    </Form.Text>
                  </Form.Group>

                  <div className="text-end mt-4">
                    <Button variant="primary">Save Notification Settings</Button>
                  </div>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="security" title={<span><FiShield className="me-2" />Security</span>}>
              <div className="mt-4">
                <h4><FiShield className="me-2" />Security Settings</h4>
                
                <Card className="mb-4">
                  <Card.Body>
                    <h5><FiLock className="me-2" />Password</h5>
                    <p>Last changed: 3 months ago</p>
                    <Button variant="outline-primary" onClick={handlePasswordReset}>
                      Change Password
                    </Button>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Body>
                    <h5><FiShield className="me-2" />Security Features</h5>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Two-Factor Authentication"
                          checked={securitySettings.twoFactorAuth}
                          onChange={() => handleSecurityToggle('twoFactorAuth')}
                        />
                        <Form.Text className="text-muted">
                          Add an extra layer of security to your account
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Login Alerts"
                          checked={securitySettings.loginAlerts}
                          onChange={() => handleSecurityToggle('loginAlerts')}
                        />
                        <Form.Text className="text-muted">
                          Get notified when someone logs into your account
                        </Form.Text>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>

                <Card className="border-danger">
                  <Card.Body>
                    <h5 className="text-danger"><FiTrash2 className="me-2" />Danger Zone</h5>
                    <p>Permanently delete your account and all associated data.</p>
                    <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                      Delete Account
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="billings" title={<span><FiCreditCard className="me-2" />Billings</span>}>
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

      {/* Add Member Modal */}
      <Modal show={showAddMemberModal} onHide={() => setShowAddMemberModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newMember.name}
                onChange={handleMemberChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newMember.email}
                onChange={handleMemberChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <InputGroup>
                <InputGroup.Text>+254</InputGroup.Text>
                <FormControl
                  type="tel"
                  name="phone"
                  value={newMember.phone.replace('+254', '')}
                  onChange={(e) => handleMemberChange({
                    target: {
                      name: 'phone',
                      value: '+254' + e.target.value
                    }
                  })}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={newMember.role}
                onChange={handleMemberChange}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="treasurer">Treasurer</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddMember}>
            Add Member
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><FiTrash2 className="me-2" />Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <p className="fw-bold">All your data including chama records will be permanently deleted.</p>
          <Form.Group className="mb-3">
            <Form.Label>Type "DELETE" to confirm</Form.Label>
            <Form.Control type="text" placeholder="DELETE" required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>  
      {showPasswordPrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Password</h3>
            <p>To change your email, please enter your current password:</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
            <div>
              <button onClick={handleEmailUpdate}>Confirm</button>
              <button onClick={() => setShowPasswordPrompt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}    
    </Container>
  );
};

export default Settings;