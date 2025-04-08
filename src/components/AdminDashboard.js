import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Modal, Form, Alert, Card, Row, Col } from "react-bootstrap";
import "./AdminDashboard.css";
import Sidebar from './Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState([
    { date: '7/7/2024', event: "Sam's Wedding", member: 'Raphael Mutill', amount: 2000, paymentMethod: 'Mpesa', transactionId: 'XMLSLSL123', mpesaReference: 'N/A', status: 'pending' },
    { date: '7/7/2024', event: "Mike's Rurado", member: 'Raphael Mutill', amount: 15000, paymentMethod: 'Mpesa', transactionId: 'LSPSP45678', mpesaReference: 'N/A', status: 'pending' },
    { date: '7/7/2024', event: "Sam's Wedding", member: 'Raphael Mutill', amount: 20000, paymentMethod: 'Bank', transactionId: '12345ABCDE', mpesaReference: 'N/A', status: 'pending' }
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

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleLogout = () => {
    navigate("/");
  };

  const validateTransactionId = (id) => {
    const regex = /^[A-Z0-9]{10}$/;
    return regex.test(id);
  };

  const handleAddTransaction = () => {
    if (!validateTransactionId(newTransaction.transactionId)) {
      setError('Transaction ID must be exactly 10 characters (uppercase letters and numbers only)');
      return;
    }
    
    setTransactions([...transactions, newTransaction]);
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
    setError('');
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

  // Modern icons for dark mode toggle
  const modernIcons = {
    sun: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    ),
    moon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    )
  };

  // Card styles - Fixed sizing issues
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
    borderRadius: '12px',
    border: 'none',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
    height: '100%',
    maxHeight: '180px',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    color: colors.cardText,
    background: darkMode
      ? 'linear-gradient(135deg, #2a1a1a 0%, #301515 100%)'
      : 'linear-gradient(135deg, #fff9f9 0%, #f5e1e1 100%)',
    borderLeft: '5px solid #d13030'
  };

  const balanceCardStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
    height: '100%',
    maxHeight: '180px',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    color: colors.cardText,
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

  // Main content background styles with decorative elements - Fixed size issues
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
    overflowX: 'hidden' // Prevent horizontal overflow
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
      <div style={{ 
        position: 'absolute', 
        top: '30%', 
        left: '5%', 
        width: '150px', 
        height: '150px', 
        borderRadius: '30%', 
        background: darkMode ? 'rgba(161, 99, 235, 0.015)' : 'rgba(92, 182, 130, 0.025)', 
        filter: 'blur(25px)'
      }}></div>
    </div>
  );

  // Custom table styles for dark mode
  const tableStyle = {
    backgroundColor: darkMode ? 'rgba(24, 24, 36, 0.6)' : 'white',
    color: colors.textPrimary,
    borderColor: colors.tableBorder,
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.15)' : '0 5px 15px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
    fontSize: '0.9rem' // Reduce font size for better table fit
  };

  const tableHeadStyle = {
    backgroundColor: colors.tableHeaderBg,
    color: colors.textPrimary,
    fontSize: '0.9rem' // Consistent font size
  };

  // Container style - Add max-width to prevent expansion
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
    maxWidth: '100%' // Prevents container from expanding too wide
  };

  return (
    <div className="admin-dashboard" style={{ 
      display: 'flex',
      minHeight: '100vh',
      maxWidth: '100vw', // Prevent horizontal overflow
      overflowX: 'hidden' // Hide horizontal scrollbar
    }}>
      <Sidebar darkMode={darkMode} />
      
      <div className="main-content" style={mainContentStyle}>
        {decorativeShapes}
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 0px 20px 20px', width: '100%' }}>
          <div className="admin-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px', // Reduced margin
            paddingRight: '20px'
          }}>
            <h1 style={{ color: colors.textPrimary, fontWeight: '600', margin: 0, fontSize: '1.8rem' }}>My Dashboard</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                style={{ 
                  backgroundColor: darkMode ? '#333' : '#f0f0f0', 
                  border: 'none',
                  color: darkMode ? '#fff' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  transition: 'all 0.3s ease',
                  height: '38px', // Fixed height
                  width: '38px'   // Fixed width
                }} 
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? modernIcons.moon : modernIcons.sun}
              </Button>
              <Button 
                variant={darkMode ? "outline-danger" : "danger"} 
                onClick={handleLogout}
                size="sm" // Smaller button
              >
                Logout
              </Button>
            </div>
          </div>
          
          {/* Single Container for everything */}
          <div style={containerStyle}>
            {/* Decorative Gradient Overlay */}
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
            
            {/* Money Cards Row - Fixed sizing */}
            <Row className="g-3"> {/* Added spacing between columns */}
              <Col md={4}>
                <Card style={moneyInCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3"> {/* Reduced padding */}
                    <div className="d-flex justify-content-between align-items-center mb-2"> {/* Reduced margin */}
                      <div style={{ color: darkMode ? '#aaa' : '#666' }} className="h6 mb-0">Money In</div> {/* Reduced font size */}
                      <div style={iconContainerStyle('#e6f7f0', '#143328')}>
                        <span style={{ color: darkMode ? '#36875a' : '#0d8066', fontSize: '20px' }}>💰</span> {/* Reduced emoji size */}
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">Kshs 45,000</h3> {/* Changed from h2 to h3 */}
                      <div className="text-success d-flex align-items-center" style={{ fontSize: '0.8rem' }}> {/* Reduced font size */}
                        <span>▲</span>
                        <span className="ms-1">23.36%</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card style={moneyOutCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3"> {/* Reduced padding */}
                    <div className="d-flex justify-content-between align-items-center mb-2"> {/* Reduced margin */}
                      <div style={{ color: darkMode ? '#aaa' : '#666' }} className="h6 mb-0">Money Out</div> {/* Reduced font size */}
                      <div style={iconContainerStyle('#f9e6e6', '#331515')}>
                        <span style={{ color: darkMode ? '#ff6b6b' : '#d13030', fontSize: '20px' }}>💳</span> {/* Reduced emoji size */}
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">Kshs 20,000</h3> {/* Changed from h2 to h3 */}
                      <div className="text-danger d-flex align-items-center" style={{ fontSize: '0.8rem' }}> {/* Reduced font size */}
                        <span>▼</span>
                        <span className="ms-1">9.05%</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card style={balanceCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3"> {/* Reduced padding */}
                    <div className="d-flex justify-content-between align-items-center mb-2"> {/* Reduced margin */}
                      <div style={{ color: darkMode ? '#aaa' : '#666' }} className="h6 mb-0">Balance</div> {/* Reduced font size */}
                      <div style={iconContainerStyle('#e6f0f9', '#15273a')}>
                        <span style={{ color: darkMode ? '#5e9de6' : '#2f7dc5', fontSize: '20px' }}>⚖️</span> {/* Reduced emoji size */}
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">Kshs 25,000</h3> {/* Changed from h2 to h3 */}
                      <div style={{ height: '21px' }}></div> {/* Reduced height of spacer */}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Recent Transactions - Fixed table sizing */}
            <div style={{ marginTop: '25px', position: 'relative', zIndex: 1 }}> {/* Reduced margin */}
              <h4 style={{ color: colors.textPrimary, marginBottom: '12px' }}>Recent Transactions</h4> {/* Changed from h2 to h4 */}
              
              <div className="table-responsive"> {/* Added responsive wrapper */}
                <Table 
                  striped 
                  bordered 
                  hover 
                  responsive 
                  style={tableStyle}
                  variant={darkMode ? "dark" : "light"}
                  className="table-sm" // Added Bootstrap's small table class
                >
                  <thead style={tableHeadStyle}>
                    <tr>
                      <th>DATE</th>
                      <th>EVENT</th>
                      <th>MEMBER</th>
                      <th>AMOUNT</th>
                      <th>PAYMENT METHOD</th>
                      <th>TRANSACTION ID</th>
                      <th>MPESA REFERENCE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} style={{ 
                        backgroundColor: darkMode 
                          ? (index % 2 === 0 ? 'rgba(40, 40, 60, 0.4)' : 'rgba(30, 30, 45, 0.6)') 
                          : (index % 2 === 0 ? 'rgba(249, 249, 249, 0.8)' : 'rgba(255, 255, 255, 0.9)')
                      }}>
                        <td>{transaction.date}</td>
                        <td>{transaction.event}</td>
                        <td>{transaction.member}</td>
                        <td>{transaction.amount.toLocaleString()}</td>
                        <td>{transaction.paymentMethod}</td>
                        <td>{transaction.transactionId}</td>
                        <td>{transaction.mpesaReference}</td>
                        <td>
                          <span className={`badge bg-${transaction.status === 'pending' ? 'warning' : 'success'}`} style={{ fontSize: '0.75rem' }}>{transaction.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Plus button below the table on the far right */}
              <div className="d-flex justify-content-end mt-2"> {/* Reduced margin */}
                <Button 
                  variant={darkMode ? "outline-success" : "success"}
                  onClick={() => setShowAddModal(true)}
                  style={{ 
                    borderRadius: '50%', 
                    width: '36px',  // Reduced size
                    height: '36px', // Reduced size
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => {
          setShowAddModal(false);
          setError('');
        }}
        contentClassName={darkMode ? "bg-dark text-light" : ""}
        size="md" // Medium sized modal
      >
        <Modal.Header closeButton className={darkMode ? "border-secondary" : ""}>
          <Modal.Title style={{ fontSize: '1.2rem' }}>Add New Transaction</Modal.Title> {/* Reduced title font size */}
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>{error}</Alert>} {/* Smaller alert */}
          <Form>
            <Form.Group className="mb-2"> {/* Reduced margin */}
              <Form.Label style={{ fontSize: '0.9rem' }}>Date</Form.Label> {/* Reduced font size */}
              <Form.Control 
                type="text" 
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
                size="sm" // Smaller input
              />
            </Form.Group>
            <Form.Group className="mb-2"> {/* Reduced margin */}
              <Form.Label style={{ fontSize: '0.9rem' }}>Event</Form.Label> {/* Reduced font size */}
              <Form.Control 
                type="text" 
                value={newTransaction.event}
                onChange={(e) => setNewTransaction({...newTransaction, event: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
                size="sm" // Smaller input
              />
            </Form.Group>
            <Form.Group className="mb-2"> {/* Reduced margin */}
              <Form.Label style={{ fontSize: '0.9rem' }}>Member</Form.Label> {/* Reduced font size */}
              <Form.Control 
                type="text" 
                value={newTransaction.member}
                onChange={(e) => setNewTransaction({...newTransaction, member: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
                size="sm" // Smaller input
              />
            </Form.Group>
            <Form.Group className="mb-2"> {/* Reduced margin */}
              <Form.Label style={{ fontSize: '0.9rem' }}>Amount</Form.Label> {/* Reduced font size */}
              <Form.Control 
                type="number" 
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
                size="sm" // Smaller input
              />
            </Form.Group>
            <Form.Group className="mb-2"> {/* Reduced margin */}
              <Form.Label style={{ fontSize: '0.9rem' }}>Payment Method</Form.Label> {/* Reduced font size */}
              <Form.Select 
                value={newTransaction.paymentMethod}
                onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value})}
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
                size="sm" // Smaller select
              >
                <option value="Mpesa">Mpesa</option>
                <option value="Bank">Bank</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2"> {/* Reduced margin */}
              <Form.Label style={{ fontSize: '0.9rem' }}>Transaction ID</Form.Label> {/* Reduced font size */}
              <Form.Control 
                type="text" 
                value={newTransaction.transactionId}
                onChange={handleTransactionIdChange}
                maxLength={10}
                placeholder="10 characters (A-Z, 0-9)"
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
                size="sm" // Smaller input
              />
              <Form.Text className={darkMode ? "text-light-50" : "text-muted"} style={{ fontSize: '0.8rem' }}> {/* Smaller help text */}
                Must be exactly 10 uppercase letters and/or numbers
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "border-secondary" : ""}>
          <Button variant={darkMode ? "outline-light" : "secondary"} onClick={() => {
            setShowAddModal(false);
            setError('');
          }} size="sm"> {/* Smaller button */}
            Close
          </Button>
          <Button variant={darkMode ? "primary" : "success"} onClick={handleAddTransaction} size="sm"> {/* Smaller button */}
            Add Transaction
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;