import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, 
  Modal, Badge, Spinner, Alert, Table,
  InputGroup, Dropdown, ButtonGroup, Tab, Tabs, ListGroup, FormControl
} from 'react-bootstrap';
import { 
  FiDollarSign, FiPlus, FiEdit2, FiTrash2, 
  FiCheckCircle, FiXCircle, FiDownload, 
  FiSearch, FiUser, FiCalendar, FiCreditCard,
  FiFilter, FiPrinter, FiMail, FiRefreshCw, FiCheck
} from 'react-icons/fi';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ChamaContext } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Contributions = () => {
  const navigate = useNavigate();
  const { chama } = useOutletContext();
  const { activeChama } = useContext(ChamaContext);
  const auth = getAuth();
  
  // State for UI and modals
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentContribution, setCurrentContribution] = useState(null);
  const [contributionToDelete, setContributionToDelete] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    type: 'Monthly',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'M-Pesa',
    reference: '',
    status: 'Pending',
    notes: ''
  });

  const [bulkFormData, setBulkFormData] = useState({
    type: 'Monthly',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'M-Pesa',
    contributions: []
  });

  // Data states
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);

  const isAdmin = activeChama?.isAdmin || false;

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch members
        const membersQuery = query(
          collection(db, 'memberships'),
          where('chamaId', '==', activeChama?.id)
        );
        const membersSnapshot = await getDocs(membersQuery);
        const membersData = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);

        // Fetch contributions
        const contributionsQuery = query(
          collection(db, 'contributions'),
          where('chamaId', '==', activeChama?.id)
        );
        const contributionsSnapshot = await getDocs(contributionsQuery);
        const contributionsData = contributionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContributions(contributionsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please refresh the page.');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (activeChama?.id) {
      fetchData();
    }
  }, [activeChama]);

  // Apply filters and search
  useEffect(() => {
    let result = contributions;
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(c => c.status === filter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.memberName.toLowerCase().includes(term) || 
        c.reference.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term)
      );  
    }
    
    setFilteredContributions(result);
  }, [contributions, filter, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bulk form changes
  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle member selection
  const handleMemberSelect = (memberId) => {
    const selectedMember = members.find(m => m.id === memberId);
    setFormData(prev => ({
      ...prev,
      memberId,
      memberName: selectedMember?.name || ''
    }));
  };

  // Add a new contribution
  const handleAddContribution = async () => {
    if (!isAdmin) {
      setError('Only admins can add contributions');
      return;
    }

    // Validate form
    if (!formData.memberId || !formData.amount || !formData.reference) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'contributions'), {
        ...formData,
        chamaId: activeChama.id,
        chamaName: activeChama.name,
        amount: parseFloat(formData.amount),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        createdByName: auth.currentUser.displayName || 'Admin'
      });

      // Update local state
      const newContribution = {
        id: docRef.id,
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      
      setContributions(prev => [...prev, newContribution]);
      setShowAddModal(false);
      setFormData({
        memberId: '',
        memberName: '',
        type: 'Monthly',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        reference: '',
        status: 'Pending',
        notes: ''
      });
      setError('');
      
      toast.success('Contribution recorded successfully!');
      
      // Show receipt
      setReceiptData(newContribution);
      setShowReceiptModal(true);
      
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError('Failed to record contribution. Please try again.');
      toast.error('Failed to record contribution');
    } finally {
      setLoading(false);
    }
  };

  // Record bulk contributions (e.g., monthly contributions for all members)
  const handleBulkContributions = async () => {
    if (!isAdmin) {
      setError('Only admins can record bulk contributions');
      return;
    }

    if (bulkFormData.contributions.length === 0) {
      setError('Please add at least one contribution');
      return;
    }

    try {
      setLoading(true);
      
      // Add each contribution to Firestore
      const newContributions = [];
      const batch = [];
      
      for (const contrib of bulkFormData.contributions) {
        const docRef = await addDoc(collection(db, 'contributions'), {
          ...bulkFormData,
          memberId: contrib.memberId,
          memberName: contrib.memberName,
          amount: parseFloat(contrib.amount),
          reference: contrib.reference || `BULK-${Date.now()}`,
          chamaId: activeChama.id,
          chamaName: activeChama.name,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
          createdByName: auth.currentUser.displayName || 'Admin'
        });
        
        newContributions.push({
          id: docRef.id,
          ...bulkFormData,
          memberId: contrib.memberId,
          memberName: contrib.memberName,
          amount: parseFloat(contrib.amount),
          reference: contrib.reference || `BULK-${Date.now()}`,
          createdAt: new Date().toISOString()
        });
      }
      
      // Update local state
      setContributions(prev => [...prev, ...newContributions]);
      setShowBulkModal(false);
      setBulkFormData({
        type: 'Monthly',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        contributions: []
      });
      setError('');
      
      toast.success(`${newContributions.length} contributions recorded successfully!`);
      
    } catch (error) {
      console.error('Error adding bulk contributions:', error);
      setError('Failed to record contributions. Please try again.');
      toast.error('Failed to record contributions');
    } finally {
      setLoading(false);
    }
  };

  // Add member to bulk contribution list
  const addMemberToBulkList = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const exists = bulkFormData.contributions.some(c => c.memberId === memberId);
    if (exists) return;
    
    setBulkFormData(prev => ({
      ...prev,
      contributions: [
        ...prev.contributions,
        {
          memberId,
          memberName: member.name,
          amount: '',
          reference: ''
        }
      ]
    }));
  };

  // Update bulk contribution amount
  const updateBulkContribution = (index, field, value) => {
    const updated = [...bulkFormData.contributions];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    setBulkFormData(prev => ({
      ...prev,
      contributions: updated
    }));
  };

  // Remove member from bulk list
  const removeFromBulkList = (index) => {
    const updated = bulkFormData.contributions.filter((_, i) => i !== index);
    setBulkFormData(prev => ({
      ...prev,
      contributions: updated
    }));
  };

  // Generate receipt PDF
  const generateReceipt = (contribution) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(`${activeChama.name} - Contribution Receipt`, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Receipt #: ${contribution.reference}`, 20, 40);
    doc.text(`Date: ${new Date(contribution.date).toLocaleDateString()}`, 20, 50);
    doc.text(`Member: ${contribution.memberName}`, 20, 60);
    
    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    
    // Contribution details
    doc.setFontSize(14);
    doc.text('Contribution Details', 20, 80);
    
    doc.setFontSize(12);
    doc.text(`Type: ${contribution.type}`, 20, 90);
    doc.text(`Amount: Ksh ${contribution.amount.toLocaleString()}`, 20, 100);
    doc.text(`Payment Method: ${contribution.paymentMethod}`, 20, 110);
    
    if (contribution.notes) {
      doc.text(`Notes: ${contribution.notes}`, 20, 120);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your contribution!', 105, 150, { align: 'center' });
    doc.text('Generated by ChamaPro', 105, 280, { align: 'center' });
    
    return doc;
  };

  // Download receipt
  const downloadReceipt = () => {
    if (!receiptData) return;
    const doc = generateReceipt(receiptData);
    doc.save(`receipt-${receiptData.reference}.pdf`);
  };

  // Print receipt
  const printReceipt = () => {
    if (!receiptData) return;
    const doc = generateReceipt(receiptData);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  // Calculate stats
  const stats = {
    total: contributions.length,
    totalAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
    pending: contributions.filter(c => c.status === 'Pending').length,
    pendingAmount: contributions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0),
    verified: contributions.filter(c => c.status === 'Verified').length,
    verifiedAmount: contributions.filter(c => c.status === 'Verified').reduce((sum, c) => sum + c.amount, 0)
  };

  // Status badge variant
  const statusVariant = (status) => {
    switch(status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  // Add this function inside your component before the return statement
const downloadPDF = (filterType) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(`${activeChama.name} - Contributions Report`, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Report Type: ${filterType === 'all' ? 'All Contributions' : 'Filtered Contributions'}`, 20, 40);
    
    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    // Get the data to export based on filter
    const dataToExport = filterType === 'all' ? contributions : filteredContributions;
    
    // Table header
    const headers = ['Date', 'Member', 'Type', 'Amount', 'Method', 'Reference', 'Status'];
    let y = 55;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    headers.forEach((header, index) => {
      doc.text(header, 20 + (index * 25), y);
    });
    
    // Table content
    doc.setFont(undefined, 'normal');
    y += 10;
    
    dataToExport.forEach(item => {
      const row = [
        new Date(item.date).toLocaleDateString(),
        item.memberName.substring(0, 10),
        item.type,
        `Ksh ${item.amount.toLocaleString()}`,
        item.paymentMethod,
        item.reference.substring(0, 10),
        item.status
      ];
      
      row.forEach((cell, index) => {
        doc.text(String(cell), 20 + (index * 25), y);
      });
      
      y += 8;
      
      // New page if needed
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text(`Total: Ksh ${dataToExport.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`, 20, y + 10);
    doc.text('Generated by ChamaPro', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`${activeChama.name}-contributions-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('PDF downloaded successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
  }
  };

  // Add this function inside your component before the return statement
const handleStatusChange = async (id, newStatus) => {
  if (!isAdmin) {
    toast.error('Only admins can change contribution status');
    return;
  }
  
  try {
    setLoading(true);
    
    // Update in Firestore
    const contribRef = doc(db, 'contributions', id);
    await updateDoc(contribRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid,
      updatedByName: auth.currentUser.displayName || 'Admin'
    });
    
    // Update local state
    setContributions(prev => 
      prev.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      )
    );
    
    toast.success(`Contribution marked as ${newStatus}`);
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error('Failed to update status');
  } finally {
    setLoading(false);
  }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center">
            <FiDollarSign className="me-2" /> Contributions Management
            <Badge bg="primary" className="ms-3">
              {activeChama?.name}
            </Badge>
          </h2>
          <p className="text-muted">
            {isAdmin ? 'Admin' : 'Member'} view - Record and track all contributions
          </p>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="success" 
                  onClick={() => setShowAddModal(true)}
                  className="d-flex align-items-center"
                >
                  <FiPlus className="me-2" /> Record Single Contribution
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={() => setShowBulkModal(true)}
                  className="d-flex align-items-center"
                >
                  <FiUser className="me-2" /> Record Bulk Contributions
                </Button>
                
                <Button 
                  variant="outline-primary" 
                  onClick={() => window.print()}
                  className="d-flex align-items-center"
                >
                  <FiPrinter className="me-2" /> Print Report
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => window.location.reload()}
                  className="d-flex align-items-center"
                >
                  <FiRefreshCw className="me-2" /> Refresh Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Total Contributions</h6>
                  <h3>{stats.total}</h3>
                  <p className="mb-0">Ksh {stats.totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FiDollarSign size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Verified</h6>
                  <h3>{stats.verified}</h3>
                  <p className="mb-0">Ksh {stats.verifiedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiCheckCircle size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Pending Verification</h6>
                  <h3>{stats.pending}</h3>
                  <p className="mb-0">Ksh {stats.pendingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FiDollarSign size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search contributions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="mt-2 mt-md-0">
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">
                <FiFilter className="me-2" /> Filter: {filter === 'all' ? 'All' : filter}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilter('all')}>All</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('Pending')}>Pending</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('Verified')}>Verified</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('Rejected')}>Rejected</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary">
                <FiDownload className="me-2" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => downloadPDF('all')}>All Contributions</Dropdown.Item>
                <Dropdown.Item onClick={() => downloadPDF(filter)}>Current View</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {/* Contributions Table */}
      <Card>
        <Card.Body className="p-0">
          <Table striped hover responsive>
            <thead className="bg-light">
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Type</th>
                <th className="text-end">Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredContributions.length > 0 ? (
                filteredContributions.map(contribution => (
                  <tr key={contribution.id}>
                    <td>{new Date(contribution.date).toLocaleDateString()}</td>
                    <td>{contribution.memberName}</td>
                    <td>{contribution.type}</td>
                    <td className="text-end">Ksh {contribution.amount.toLocaleString()}</td>
                    <td>{contribution.paymentMethod}</td>
                    <td>{contribution.reference}</td>
                    <td>
                      <Badge bg={statusVariant(contribution.status)}>
                        {contribution.status}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td>
                        <ButtonGroup size="sm">
                          {contribution.status === 'Pending' && (
                            <>
                              <Button 
                                variant="outline-success" 
                                onClick={() => handleStatusChange(contribution.id, 'Verified')}
                              >
                                <FiCheckCircle /> Verify
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                onClick={() => handleStatusChange(contribution.id, 'Rejected')}
                              >
                                <FiXCircle /> Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline-primary" 
                            onClick={() => {
                              setCurrentContribution(contribution);
                              setShowEditModal(true);
                            }}
                          >
                            <FiEdit2 />
                          </Button>
                        </ButtonGroup>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-4">
                    {contributions.length === 0 ? 'No contributions recorded yet' : 'No matching contributions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Contribution Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Record New Contribution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Member *</Form.Label>
                <Form.Select
                  name="memberId"
                  value={formData.memberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  required
                >
                  <option value="">Select a member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contribution Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Monthly">Monthly Contribution</option>
                  <option value="Loan Repayment">Loan Repayment</option>
                  <option value="Fine">Fine</option>
                  <option value="Donation">Donation</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount (Ksh) *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>Ksh</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method *</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Reference Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="e.g. MPESA123, BNK456"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddContribution}>
            Record Contribution
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Contributions Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Record Bulk Contributions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Contribution Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={bulkFormData.type}
                  onChange={handleBulkInputChange}
                  required
                >
                  <option value="Monthly">Monthly Contribution</option>
                  <option value="Loan Repayment">Loan Repayment</option>
                  <option value="Fine">Fine</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Payment Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={bulkFormData.date}
                  onChange={handleBulkInputChange}
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Payment Method *</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={bulkFormData.paymentMethod}
                  onChange={handleBulkInputChange}
                  required
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={5}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Available Members</span>
                    <Badge bg="primary">{members.length}</Badge>
                  </div>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <ListGroup>
                    {members.map(member => (
                      <ListGroup.Item 
                        key={member.id}
                        action
                        onClick={() => addMemberToBulkList(member.id)}
                        disabled={bulkFormData.contributions.some(c => c.memberId === member.id)}
                      >
                        <div className="d-flex justify-content-between">
                          <span>{member.name}</span>
                          {bulkFormData.contributions.some(c => c.memberId === member.id) && (
                            <FiCheck className="text-success" />
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={7}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Selected Members ({bulkFormData.contributions.length})</span>
                  </div>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {bulkFormData.contributions.length > 0 ? (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Amount (Ksh)</th>
                          <th>Reference</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkFormData.contributions.map((contrib, index) => (
                          <tr key={contrib.memberId}>
                            <td>{contrib.memberName}</td>
                            <td>
                              <Form.Control
                                type="number"
                                value={contrib.amount}
                                onChange={(e) => updateBulkContribution(index, 'amount', e.target.value)}
                                min="0"
                                step="100"
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                value={contrib.reference}
                                onChange={(e) => updateBulkContribution(index, 'reference', e.target.value)}
                                placeholder="Optional"
                              />
                            </td>
                            <td>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => removeFromBulkList(index)}
                              >
                                <FiTrash2 />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      Select members from the left panel
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkContributions}
            disabled={bulkFormData.contributions.length === 0}
          >
            Record All Contributions
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Receipt Modal */}
      <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Contribution Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {receiptData && (
            <Card>
              <Card.Body>
                <div className="text-center mb-4">
                  <h4>{activeChama?.name}</h4>
                  <p className="text-muted">Contribution Receipt</p>
                </div>
                
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <p className="mb-1"><strong>Receipt #:</strong></p>
                    <p>{receiptData.reference}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1"><strong>Date:</strong></p>
                    <p>{new Date(receiptData.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <p className="mb-1"><strong>Member:</strong></p>
                  <p>{receiptData.memberName}</p>
                </div>
                
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount (Ksh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{receiptData.type} Contribution</td>
                      <td>{receiptData.amount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-end">
                        <strong>Total: Ksh {receiptData.amount.toLocaleString()}</strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                
                <div className="mt-3">
                  <p className="mb-1"><strong>Payment Method:</strong></p>
                  <p>{receiptData.paymentMethod}</p>
                </div>
                
                {receiptData.notes && (
                  <div className="mt-3">
                    <p className="mb-1"><strong>Notes:</strong></p>
                    <p>{receiptData.notes}</p>
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <p className="text-muted">Thank you for your contribution!</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceiptModal(false)}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={printReceipt}>
            <FiPrinter className="me-2" /> Print Receipt
          </Button>
          <Button variant="primary" onClick={downloadReceipt}>
            <FiDownload className="me-2" /> Download Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Contributions;