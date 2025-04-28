import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Alert, 
  Card, 
  Row, 
  Col,
  Badge,
  Dropdown
} from "react-bootstrap";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiSun,
  FiMoon,
  FiLogOut,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiSettings
} from "react-icons/fi";
import { auth } from '../firebase'; 
import { signOut } from "firebase/auth";
import { ChamaContext } from '../App';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { chama, stats, refresh, loading } = useOutletContext();
  const { activeChama, setActiveChama } = useContext(ChamaContext);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState([
    { 
      id: 1,
      date: '7/7/2024', 
      event: "Sam's Wedding", 
      member: 'Raphael Mutill', 
      amount: 2000, 
      paymentMethod: 'Mpesa', 
      transactionId: 'XMLSLSL123', 
      mpesaReference: 'N/A', 
      status: 'pending' 
    },
    { 
      id: 2,
      date: '7/7/2024', 
      event: "Mike's Rurado", 
      member: 'Raphael Mutill', 
      amount: 15000, 
      paymentMethod: 'Mpesa', 
      transactionId: 'LSPSP45678', 
      mpesaReference: 'N/A', 
      status: 'pending' 
    },
    { 
      id: 3,
      date: '7/7/2024', 
      event: "Sam's Wedding", 
      member: 'Raphael Mutill', 
      amount: 20000, 
      paymentMethod: 'Bank', 
      transactionId: '12345ABCDE', 
      mpesaReference: 'N/A', 
      status: 'completed' 
    }
  ]);
  
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    event: '',
    member: '',
    amount: 0,
    paymentMethod: 'Mpesa',
    transactionId: '',
    mpesaReference: 'N/A',
    status: 'pending'
  });
  
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const isAdmin = activeChama?.isAdmin || false;

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const validateTransactionId = (id) => {
    const regex = /^[A-Z0-9]{10}$/;
    return regex.test(id);
  };

  const handleAddTransaction = () => {
    if (!isAdmin) {
      setError('Only admins can add transactions');
      return;
    }
    
    if (!validateTransactionId(newTransaction.transactionId)) {
      setError('Transaction ID must be exactly 10 characters (uppercase letters and numbers only)');
      return;
    }
    
    if (editingId) {
      // Update existing transaction
      setTransactions(transactions.map(t => 
        t.id === editingId ? { ...newTransaction, id: editingId } : t
      ));
    } else {
      // Add new transaction
      setTransactions([...transactions, {
        ...newTransaction,
        id: Math.max(...transactions.map(t => t.id), 0) + 1
      }]);
    }
    
    setShowAddModal(false);
    setNewTransaction({
      date: '',
      event: '',
      member: '',
      amount: 0,
      paymentMethod: 'Mpesa',
      transactionId: '',
      mpesaReference: 'N/A',
      status: 'pending'
    });
    setEditingId(null);
    setError('');
  };

  const handleEditTransaction = (transaction) => {
    if (!isAdmin) return;
    
    setNewTransaction(transaction);
    setEditingId(transaction.id);
    setShowAddModal(true);
  };

  const handleDeleteTransaction = (id) => {
    if (!isAdmin) return;
    
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleTransactionIdChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setNewTransaction({...newTransaction, transactionId: value});
    setError('');
  };

  // Theme colors based on mode
  const colors = {
    cardBg: darkMode ? '#1e1e2d' : '#ffffff',
    cardText: darkMode ? '#e1e1e1' : '#333',
    mainBg: darkMode 
      ? 'radial-gradient(circle at 80% 10%, rgba(33, 33, 60, 0.8) 0%, rgba(22, 22, 36, 0.2) 100%)' 
      : 'radial-gradient(circle at 80% 10%, rgba(54, 135, 90, 0.15) 0%, rgba(240, 255, 244, 0.05) 100%)',
    tableHeaderBg: darkMode ? '#222233' : '#f8f9fa',
    tableBorder: darkMode ? '#444' : '#dee2e6',
    tableStripedBg: darkMode ? '#2a2a3a' : '#f9f9f9',
    textPrimary: darkMode ? '#e1e1e1' : '#333',
    textSecondary: darkMode ? '#aaa' : '#666'
  };

  // Card styles
  const moneyInCardStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
    height: '100%',
    maxHeight: '180px',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    color: colors.cardText,
    background: darkMode 
      ? 'linear-gradient(135deg, #192f2b 0%, #0d2018 100%)'
      : 'linear-gradient(135deg, #f6fefa 0%, #e1f5ec 100%)',
    borderLeft: '5px solid #0d8066'
  };

  const moneyOutCardStyle = {
    ...moneyInCardStyle,
    background: darkMode
      ? 'linear-gradient(135deg, #2a1a1a 0%, #301515 100%)'
      : 'linear-gradient(135deg, #fff9f9 0%, #f5e1e1 100%)',
    borderLeft: '5px solid #d13030'
  };

  const balanceCardStyle = {
    ...moneyInCardStyle,
    background: darkMode
      ? 'linear-gradient(135deg, #182236 0%, #101827 100%)'
      : 'linear-gradient(135deg, #f0f6ff 0%, #e1ebf5 100%)',
    borderLeft: '5px solid #2f7dc5'
  };

  const iconContainerStyle = (bgColor, darkModeBgColor) => ({
    backgroundColor: darkMode ? darkModeBgColor : bgColor,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: darkMode ? '0 4px 10px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.1)'
  });

  // Main content background styles
  const mainContentStyle = {
    backgroundColor: darkMode ? '#111122' : '#ffffff',
    color: colors.textPrimary,
    backgroundImage: colors.mainBg,
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    position: 'relative',
    minHeight: '100vh',
    transition: 'all 0.3s ease',
    flex: 1,
    overflowX: 'hidden'
  };

  // Decorative shapes
  const decorativeShapes = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ 
        position: 'absolute', 
        top: '5%', 
        right: '15%', 
        width: '300px', 
        height: '300px', 
        borderRadius: '50%', 
        background: darkMode ? 'rgba(66, 99, 235, 0.03)' : 'rgba(54, 135, 90, 0.03)', 
        filter: 'blur(40px)'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        bottom: '10%', 
        left: '10%', 
        width: '200px', 
        height: '200px', 
        borderRadius: '50%', 
        background: darkMode ? 'rgba(66, 99, 235, 0.02)' : 'rgba(54, 135, 90, 0.02)', 
        filter: 'blur(30px)'
      }}></div>
    </div>
  );

  // Custom table styles
  const tableStyle = {
    backgroundColor: darkMode ? 'rgba(24, 24, 36, 0.6)' : 'white',
    color: colors.textPrimary,
    borderColor: colors.tableBorder,
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.15)' : '0 5px 15px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
    fontSize: '0.9rem'
  };

  const tableHeadStyle = {
    backgroundColor: colors.tableHeaderBg,
    color: colors.textPrimary,
    fontSize: '0.9rem'
  };

  // Container style
  const containerStyle = {
    background: darkMode 
      ? 'rgba(30, 30, 45, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: darkMode 
      ? '0 8px 20px rgba(0, 0, 0, 0.3)' 
      : '0 8px 20px rgba(0, 0, 0, 0.1)',
    marginRight: '20px',
    transition: 'all 0.3s ease',
    color: darkMode ? '#e1e1e1' : '#333',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '100%'
  };

  // Calculate summary data
  const moneyIn = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const moneyOut = 20000; // This would come from your data
  const balance = moneyIn - moneyOut;

  return (
    <div className="admin-dashboard" style={{ 
      display: 'flex',
      minHeight: '100vh',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <div className="main-content" style={mainContentStyle}>
        {decorativeShapes}
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 0px 20px 20px', width: '100%' }}>
          <div className="admin-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingRight: '20px'
          }}>
            <div>
              <h1 style={{ color: colors.textPrimary, fontWeight: '600', margin: 0, fontSize: '1.8rem' }}>
                {activeChama?.name || 'My'} Dashboard
              </h1>
              {activeChama && (
                <Badge bg={isAdmin ? "primary" : "secondary"} className="mt-1">
                  {isAdmin ? 'Admin' : 'Member'}
                </Badge>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                variant={darkMode ? "dark" : "light"} 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  height: '38px',
                  width: '38px'
                }}
              >
                {darkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
              </Button>
              <Dropdown>
                <Dropdown.Toggle variant={darkMode ? "outline-light" : "outline-secondary"} id="dropdown-basic">
                  <FiMoreVertical size={18} />
                </Dropdown.Toggle>
                <Dropdown.Menu className={darkMode ? "bg-dark" : ""}>
                  <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                    <FiLogOut className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          
          <div style={containerStyle}>
            {/* Summary Cards */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card style={moneyInCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div style={{ color: darkMode ? '#aaa' : '#666' }} className="h6 mb-0">Money In</div>
                      <div style={iconContainerStyle('#e6f7f0', '#143328')}>
                        <FiDollarSign size={20} style={{ color: darkMode ? '#36875a' : '#0d8066' }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">Ksh {moneyIn.toLocaleString()}</h3>
                      <div className="text-success d-flex align-items-center" style={{ fontSize: '0.8rem' }}>
                        <span>▲</span>
                        <span className="ms-1">23.36%</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card style={moneyOutCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div style={{ color: darkMode ? '#aaa' : '#666' }} className="h6 mb-0">Money Out</div>
                      <div style={iconContainerStyle('#f9e6e6', '#331515')}>
                        <FiDollarSign size={20} style={{ color: darkMode ? '#ff6b6b' : '#d13030' }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">Ksh {moneyOut.toLocaleString()}</h3>
                      <div className="text-danger d-flex align-items-center" style={{ fontSize: '0.8rem' }}>
                        <span>▼</span>
                        <span className="ms-1">9.05%</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card style={balanceCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div style={{ color: darkMode ? '#aaa' : '#666' }} className="h6 mb-0">Balance</div>
                      <div style={iconContainerStyle('#e6f0f9', '#15273a')}>
                        <FiDollarSign size={20} style={{ color: darkMode ? '#5e9de6' : '#2f7dc5' }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">Ksh {balance.toLocaleString()}</h3>
                      <div style={{ height: '21px' }}></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Recent Transactions */}
            <div style={{ marginTop: '25px', position: 'relative', zIndex: 1 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 style={{ color: colors.textPrimary, marginBottom: 0 }}>
                  Recent Transactions
                </h4>
                {isAdmin && (
                  <Button 
                    variant={darkMode ? "outline-success" : "success"}
                    onClick={() => setShowAddModal(true)}
                    className="d-flex align-items-center"
                    size="sm"
                  >
                    <FiPlus className="me-1" /> Add Transaction
                  </Button>
                )}
              </div>
              
              <div className="table-responsive">
                <Table 
                  striped 
                  bordered 
                  hover 
                  responsive 
                  style={tableStyle}
                  variant={darkMode ? "dark" : "light"}
                  className="table-sm"
                >
                  <thead style={tableHeadStyle}>
                    <tr>
                      <th>DATE</th>
                      <th>EVENT</th>
                      <th>MEMBER</th>
                      <th>AMOUNT</th>
                      <th>METHOD</th>
                      <th>TRANSACTION ID</th>
                      {isAdmin && <th>REFERENCE</th>}
                      <th>STATUS</th>
                      {isAdmin && <th>ACTIONS</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} style={{ 
                        backgroundColor: darkMode 
                          ? 'rgba(40, 40, 60, 0.4)' 
                          : 'rgba(249, 249, 249, 0.8)'
                      }}>
                        <td>{transaction.date}</td>
                        <td>{transaction.event}</td>
                        <td>{transaction.member}</td>
                        <td>Ksh {transaction.amount.toLocaleString()}</td>
                        <td>{transaction.paymentMethod}</td>
                        <td>{transaction.transactionId}</td>
                        {isAdmin && <td>{transaction.mpesaReference}</td>}
                        <td>
                          <Badge 
                            bg={transaction.status === 'completed' ? 'success' : 'warning'} 
                            className="text-capitalize"
                          >
                            {transaction.status}
                          </Badge>
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => handleEditTransaction(transaction)}
                              >
                                <FiEdit2 size={14} />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <FiTrash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => {
          setShowAddModal(false);
          setError('');
          setEditingId(null);
        }}
        contentClassName={darkMode ? "bg-dark text-light" : ""}
        centered
      >
        <Modal.Header closeButton className={darkMode ? "border-secondary" : ""}>
          <Modal.Title>
            {editingId ? 'Edit Transaction' : 'Add New Transaction'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Event</Form.Label>
              <Form.Control 
                type="text" 
                value={newTransaction.event}
                onChange={(e) => setNewTransaction({...newTransaction, event: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Member</Form.Label>
              <Form.Control 
                type="text" 
                value={newTransaction.member}
                onChange={(e) => setNewTransaction({...newTransaction, member: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount (Ksh)</Form.Label>
              <Form.Control 
                type="number" 
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select 
                value={newTransaction.paymentMethod}
                onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              >
                <option value="Mpesa">Mpesa</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Transaction ID</Form.Label>
              <Form.Control 
                type="text" 
                value={newTransaction.transactionId}
                onChange={handleTransactionIdChange}
                maxLength={10}
                placeholder="10 characters (A-Z, 0-9)"
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              />
              <Form.Text className={darkMode ? "text-light-50" : "text-muted"}>
                Must be exactly 10 uppercase letters and/or numbers
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                value={newTransaction.status}
                onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "border-secondary" : ""}>
          <Button 
            variant={darkMode ? "outline-light" : "secondary"} 
            onClick={() => {
              setShowAddModal(false);
              setError('');
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddTransaction}
          >
            {editingId ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;