import React, { useState, useEffect, useContext } from 'react';
import { 
  Button, Table, Modal, Form, Alert, Badge,
  Dropdown, Card, Row, Col, Spinner, Tooltip, OverlayTrigger
} from 'react-bootstrap';
import { 
  FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiUser,
  FiShield, FiUserCheck, FiClock, FiRefreshCw
} from 'react-icons/fi';
import { auth } from '../firebase';
import { ChamaContext } from '../App';
import { db } from '../firebase';
import { 
  collection, addDoc, getDoc, getDocs, doc, serverTimestamp, 
  updateDoc, deleteDoc, query, where, onSnapshot
} from 'firebase/firestore';
import { toast } from 'react-toastify';

const Members = () => {
  const { activeChama } = useContext(ChamaContext);
  
  const [darkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    status: 'active'
  });

  const [allMembers, setAllMembers] = useState([]); // Combined members and invitations

  const isAdmin = activeChama?.isAdmin || false;


  // Enhanced helper function to safely get email from member data
  const getMemberEmail = (memberData) => {
    return memberData.email || 
          memberData.invitedUserEmail || 
          memberData.userEmail || 
          memberData.memberEmail ||
          memberData.inviteEmail ||
          null;
  };

  // Enhanced helper function to safely get user ID from member data
  const getMemberUserId = (memberData) => {
    return memberData.userId || 
          memberData.uid || 
          memberData.invitedUserId ||
          memberData.acceptedBy ||
          memberData.memberId ||
          null;
  };

  // Enhanced helper function to safely get and format join date
  const getMemberJoinDate = (memberData) => {
    // List of possible date fields in order of preference
    const dateFields = [
      'joinDate',
      'acceptedAt', 
      'createdAt',
      'inviteAcceptedAt',
      'memberSince',
      'dateJoined',
      'joinedAt',
      'timestamp'
    ];

    for (const field of dateFields) {
      const dateValue = memberData[field];
      if (dateValue) {
        try {
          // Handle Firestore Timestamp objects
          if (dateValue.seconds) {
            return new Date(dateValue.seconds * 1000).toISOString();
          }
          // Handle regular date strings/objects
          if (typeof dateValue === 'string' || dateValue instanceof Date) {
            return new Date(dateValue).toISOString();
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    // Fallback to current date if no valid date found
    return new Date().toISOString();
  };

  // Enhanced helper function to format date for display
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  
  // 1. Enhanced helper function to get phone number from member data
  const getMemberPhone = (memberData, userData = {}) => {
    // Try multiple possible phone field names in order of preference
    const phoneFields = [
      'phone',
      'phoneNumber', 
      'mobile',
      'mobileNumber',
      'contactNumber',
      'cellphone'
    ];
    
    // First check memberData
    for (const field of phoneFields) {
      if (memberData[field]) {
        return memberData[field];
      }
    }
    
    // Then check userData
    for (const field of phoneFields) {
      if (userData[field]) {
        return userData[field];
      }
    }
    
    return '';
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Real-time listeners for members and invitations
  useEffect(() => {
    if (!activeChama?.id) {
      return;
    }

    setLoading(true);

    // Real-time listener for memberships
    const membershipsQuery = query(
      collection(db, 'memberships'),
      where('chamaId', '==', activeChama.id)
    );

    const unsubscribeMembers = onSnapshot(
      membershipsQuery,
      async (snapshot) => {
        
        try {
          const membersData = await Promise.all(
            snapshot.docs.map(async (memberDoc) => {
              const memberData = memberDoc.data();
              const memberEmail = getMemberEmail(memberData);
              const memberUserId = getMemberUserId(memberData);

              // Get and format join date
              const joinDate = getMemberJoinDate(memberData);
              

              // ADD THIS: Check if member needs data backfilling
              if ((!memberData.name || !memberData.joinDate) && memberEmail) {
                // Run backfill in background (don't await to avoid blocking)
                backfillMemberData(memberDoc.id, memberData, memberEmail).catch(error => {
                });
              }

              // Skip if no email or user ID available
              if (!memberEmail && !memberUserId) {
                return {
                  id: memberDoc.id,
                  ...memberData,
                  name: memberData.name || memberData.displayName || 'Unknown User',
                  email: 'No email available',
                  phone: memberData.phone || '',
                  joinDate: joinDate,
                  formattedJoinDate: formatJoinDate(joinDate),
                  type: 'member',
                  displayStatus: memberData.status || 'active'
                };
              }

              // In the memberships onSnapshot callback, replace the user data fetching section:
              try {
                let userData = {};
                
                // First try to get user by userId if available
                if (memberUserId) {
                  try {
                    const userDoc = await getDoc(doc(db, 'users', memberUserId));
                    if (userDoc.exists()) {
                      userData = userDoc.data();
                    }
                  } catch (userIdError) {
                    
                  }
                }
                
                // If no userData yet and we have email, try email query
                if (Object.keys(userData).length === 0 && memberEmail) {
                  try {
                    const userQuery = query(
                      collection(db, 'users'),
                      where('email', '==', memberEmail)
                    );
                    const userSnapshot = await getDocs(userQuery);
                    if (!userSnapshot.empty) {
                      userData = userSnapshot.docs[0].data();
                    }
                  } catch (emailQueryError) {
                    
                  }
                }
                
                // Enhanced fallback - try to get user data by auth UID if available
                if (Object.keys(userData).length === 0 && memberData.uid) {
                  try {
                    const userDoc = await getDoc(doc(db, 'users', memberData.uid));
                    if (userDoc.exists()) {
                      userData = userDoc.data();
                      
                    }
                  } catch (uidError) {
                    
                  }
                }
                
                return {
                  id: memberDoc.id,
                  ...memberData,
                  // Enhanced name resolution with more fallbacks
                  name: memberData.name || 
                        memberData.displayName || 
                        userData.name || 
                        userData.displayName || 
                        userData.firstName || 
                        userData.fullName ||
                        (memberEmail ? memberEmail.split('@')[0] : 'Unknown User'),
                  email: memberEmail || userData.email || 'No email available',
                  phone: userData.phone || memberData.phone || userData.phoneNumber || '', // REPLACE THIS LINE
                  // Enhanced join date resolution
                  joinDate: joinDate,
                  formattedJoinDate: formatJoinDate(joinDate),
                  type: 'member',
                  displayStatus: memberData.status || 'active'
                };
              } catch (error) {
                
                return {
                  id: memberDoc.id,
                  ...memberData,
                  name: memberData.name || 'Unknown User',
                  email: memberEmail || 'No email available',
                  phone: getMemberPhone(memberData, {}),
                  joinDate: joinDate,
                  formattedJoinDate: formatJoinDate(joinDate),
                  type: 'member',
                  displayStatus: memberData.status || 'active'
                };
              }
            })
          );

          updateCombinedMembers(membersData, 'members');
        } catch (error) {
          
          toast.error('Error loading members');
        }
      },
      (error) => {
        
        toast.error('Error listening to members updates');
      }
    );

    // Real-time listener for invitations
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('chamaId', '==', activeChama.id),
      where('status', '==', 'pending')
    );

    const unsubscribeInvitations = onSnapshot(
      invitationsQuery,
      async (snapshot) => {
        

        try {
          const invitationsData = await Promise.all(
            snapshot.docs.map(async (inviteDoc) => {
              const inviteData = inviteDoc.data();
              const inviteEmail = getMemberEmail(inviteData);
              

              if (!inviteEmail) {
                return {
                  id: inviteDoc.id,
                  ...inviteData,
                  name: 'Unknown Invitee',
                  email: 'No email available',
                  phone: '',
                  role: inviteData.role || 'member',
                  type: 'invitation',
                  displayStatus: 'pending'
                };
              }

              try {
                const userQuery = query(
                  collection(db, 'users'),
                  where('email', '==', inviteEmail)
                );
                const userSnapshot = await getDocs(userQuery);
                const userData = userSnapshot.docs[0]?.data() || {};
                
                return {
                  id: inviteDoc.id,
                  ...inviteData,
                  name: userData.name || userData.displayName || inviteEmail,
                  email: inviteEmail,
                  phone: userData.phone || '',
                  role: inviteData.role || 'member',
                  type: 'invitation',
                  displayStatus: 'pending'
                };
              } catch (error) {
                return {
                  id: inviteDoc.id,
                  ...inviteData,
                  name: inviteEmail,
                  email: inviteEmail,
                  phone: '',
                  role: inviteData.role || 'member',
                  type: 'invitation',
                  displayStatus: 'pending'
                };
              }
            })
          );

          updateCombinedMembers(invitationsData, 'invitations');
        } catch (error) {
          toast.error('Error loading invitations');
        }
      },
      (error) => {
        toast.error('Error listening to invitations updates');
      }
    );

    // Cleanup function
    return () => {
      unsubscribeMembers();
      unsubscribeInvitations();
    };
    // eslint-disable-next-line
  }, [activeChama?.id]);

  // Function to update combined members list
  const updateCombinedMembers = (newData, type) => {
    setAllMembers(prevMembers => {
      const otherType = type === 'members' ? 'invitation' : 'member';
      const filtered = prevMembers.filter(m => m.type === otherType);
      const combined = [...filtered, ...newData];
      
      
      setLoading(false);
      return combined;
    });
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
      
      // Check if member already exists
      const existingMemberQuery = query(
        collection(db, 'memberships'),
        where('chamaId', '==', activeChama.id),
        where('email', '==', formData.email)
      );
      const existingMemberSnapshot = await getDocs(existingMemberQuery);
      
      if (!existingMemberSnapshot.empty) {
        setError('A member with this email already exists');
        setLoading(false);
        return;
      }
      
      // Add to Firestore with proper timestamp
      const memberData = {
        ...formData,
        chamaId: activeChama.id,
        chamaName: activeChama.name,
        joinDate: new Date().toISOString(), // Ensure consistent format
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(), // Use Firestore server timestamp
        status: 'active'
      };

      await addDoc(collection(db, 'memberships'), memberData);

      // Reset form and close modal
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
      status: member.status || member.displayStatus
    });
    setShowEditModal(true);
  };

  const handleUpdateMember = async () => {
    if (!isAdmin || !currentMember) return;

    try {
      setLoading(true);
      
      // Update in Firestore
      await updateDoc(doc(db, 'memberships', currentMember.id), {
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.uid
      });

      setShowEditModal(false);
      setCurrentMember(null);
      
      toast.success('Member updated successfully!');
    } catch (error) {
      toast.error('Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!isAdmin || !memberToDelete) return;

    try {
      setLoading(true);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'memberships', memberToDelete.id));

      setShowDeleteModal(false);
      setMemberToDelete(null);
      
      toast.success('Member deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced backfill function
  const backfillMemberData = async (memberId, memberData, memberEmail) => {
    try {
      const updates = {};
      let needsUpdate = false;

      // Try to get user data if name is missing
      if (!memberData.name && memberEmail) {
        const userQuery = query(
          collection(db, 'users'),
          where('email', '==', memberEmail)
        );
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          
          if (userData.name && !memberData.name) {
            updates.name = userData.name;
            needsUpdate = true;
          }
          
          if (userData.phone && !memberData.phone) {
            updates.phone = userData.phone;
            needsUpdate = true;
          }
        }
      }

      // Enhanced: Set join date if missing using the helper function
      const currentJoinDate = getMemberJoinDate(memberData);
      
      // Only update if we don't have a proper joinDate field
      if (!memberData.joinDate) {
        updates.joinDate = currentJoinDate;
        needsUpdate = true;
      }

      // Update the document if we have new data
      if (needsUpdate) {
        await updateDoc(doc(db, 'memberships', memberId), {
          ...updates,
          dataBackfilled: true,
          backfilledAt: serverTimestamp() // Use serverTimestamp for consistency
        });
        
      }
    } catch (error) {

    }
  };

  // Filter members by type
  const pendingInvitations = allMembers.filter(m => m.type === 'invitation');
  const allActiveMembers = allMembers.filter(m => m.displayStatus === 'active');
  const adminMembers = allMembers.filter(m => m.role === 'admin');

  // Calculate stats
  const totalMembers = allMembers.length;
  const activeCount = allActiveMembers.length;
  const adminCount = adminMembers.length;
  const pendingCount = pendingInvitations.length;

  const refreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Refresh data
    </Tooltip>
  );


  return (
    <div className={`container-fluid ${darkMode ? 'dark-mode' : ''}`}>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Members</h2>
          <p className="text-muted">Manage chama members and invitations</p>
        </div>
        <div className="d-flex gap-2">
          <OverlayTrigger placement="bottom" overlay={refreshTooltip}>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                window.location.reload();
              }}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} />
            </Button>
          </OverlayTrigger>
          {isAdmin && (
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <FiPlus className="me-2" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiUser className="text-primary me-3" size={24} />
                <div>
                  <h5 className="mb-0">{totalMembers}</h5>
                  <small className="text-muted">Total Members</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiUserCheck className="text-success me-3" size={24} />
                <div>
                  <h5 className="mb-0">{activeCount}</h5>
                  <small className="text-muted">Active Members</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiShield className="text-warning me-3" size={24} />
                <div>
                  <h5 className="mb-0">{adminCount}</h5>
                  <small className="text-muted">Admins</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiClock className="text-info me-3" size={24} />
                <div>
                  <h5 className="mb-0">{pendingCount}</h5>
                  <small className="text-muted">Pending Invites</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Members Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">All Members & Invitations ({totalMembers})</h5>
        </Card.Header>
        <Card.Body>
          {loading && totalMembers === 0 ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading members...</p>
            </div>
          ) : totalMembers === 0 ? (
            <div className="text-center py-4">
              <FiUser size={48} className="text-muted mb-3" />
              <h5>No members found</h5>
              <p className="text-muted">Start by adding members or sending invitations</p>
              {activeChama?.id && (
                <p className="text-muted small">
                  Chama ID: {activeChama.id}
                </p>
              )}
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Join Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {allMembers.map((member) => (
                  <tr 
                    key={`${member.type}-${member.id}`}
                    className={member.type === 'invitation' ? 'table-warning' : ''}
                  >
                    <td>
                      <div className="d-flex align-items-center">
                        {member.type === 'invitation' ? (
                          <FiClock className="me-2 text-warning" />
                        ) : (
                          <FiUser className="me-2" />
                        )}
                        {member.name || 'Unknown User'}
                      </div>
                    </td>
                    <td>{member.email || 'No email available'}</td>
                    <td>{member.phone || '-'}</td>
                    <td>
                      <Badge bg={member.role === 'admin' ? 'warning' : 'secondary'}>
                        {member.role || 'member'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={
                        member.displayStatus === 'active' ? 'success' : 
                        member.displayStatus === 'pending' ? 'warning' : 'secondary'
                      }>
                        {member.displayStatus === 'pending' ? 'Pending Invitation' : member.displayStatus}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={member.type === 'member' ? 'primary' : 'info'}>
                        {member.type}
                      </Badge>
                    </td>
                    <td>
                      {(() => {
                        const joinDate = member.joinDate || 
                                        member.acceptedAt || 
                                        member.createdAt || 
                                        member.inviteAcceptedAt ||
                                        member.memberSince;
                        
                        if (!joinDate) return '-';
                        
                        try {
                          // Handle different date formats
                          let date;
                          if (typeof joinDate === 'string') {
                            date = new Date(joinDate);
                          } else if (joinDate.seconds) {
                            // Firestore timestamp
                            date = new Date(joinDate.seconds * 1000);
                          } else {
                            date = new Date(joinDate);
                          }
                          
                          return date.toLocaleDateString();
                        } catch (error) {
                          return '-';
                        }
                      })()}
                    </td>
                    {isAdmin && (
                      <td>
                        {member.type === 'member' ? (
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              <FiMoreVertical />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleEditMember(member)}>
                                <FiEdit2 className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => {
                                  setMemberToDelete(member);
                                  setShowDeleteModal(true);
                                }}
                                className="text-danger"
                              >
                                <FiTrash2 className="me-2" />
                                Remove
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        ) : (
                          <Badge bg="info">Invitation</Badge>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
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
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter member name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
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
          <Button variant="primary" onClick={handleAddMember} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Add Member'}
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
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
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
          <Button variant="primary" onClick={handleUpdateMember} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Update Member'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove {memberToDelete?.name} from the chama?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMember} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Members;