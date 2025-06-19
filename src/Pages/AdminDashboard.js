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
  FiEdit2, 
  FiMoreVertical,
  FiSun,
  FiMoon,
  FiLogOut,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiTarget,
  FiPercent,
  FiSettings
} from "react-icons/fi";
import { auth } from '../firebase'; 
import { signOut } from "firebase/auth";
import { ChamaContext } from '../App';
import { toast } from 'react-toastify';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ListGroup from 'react-bootstrap/ListGroup';
import { FiSearch } from "react-icons/fi";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { chama, stats, refresh, loading } = useOutletContext();
  const { activeChama, setActiveChama } = useContext(ChamaContext);
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

  // Theme colors based on mode
  const colors = {
    cardBg: darkMode ? '#1e1e2d' : '#ffffff',
    cardText: darkMode ? '#e1e1e1' : '#333',
    mainBg: darkMode 
      ? '#111122'  // Dark mode background
      : '#ffffff', // Pure white for light mode
    tableHeaderBg: darkMode ? '#222233' : '#f8f9fa',
    tableBorder: darkMode ? '#444' : '#dee2e6',
    tableStripedBg: darkMode ? '#2a2a3a' : '#f9f9f9',
    textPrimary: darkMode ? '#e1e1e1' : '#333',
    textSecondary: darkMode ? '#aaa' : '#666'
  };

  // Card styles
  // Single unified style for all cards:
  // Add these before your component's return statement
  const greenCardStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
    height: '100%',
    maxHeight: '180px',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    color: darkMode ? '#e1e1e1' : '#034a31',
    background: darkMode ? 'rgba(30, 30, 45, 0.8)' : '#ffffff',
    borderLeft: `5px solid ${darkMode ? '#33a17c' : '#034a31'}`
  };

  const iconContainerStyle = {
    backgroundColor: darkMode ? '#033a28' : '#d1e7dd',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: darkMode ? '0 4px 10px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.1)'
  };

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
  // Either remove decorativeShapes completely or make them very subtle:
  const decorativeShapes = darkMode ? (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Keep minimal shapes for dark mode if needed */}
    </div>
  ) : null;

  // Custom table styles
  const tableStyle = {
    backgroundColor: darkMode ? 'rgba(24, 24, 36, 0.6)' : 'white',
    color: darkMode ? '#e1e1e1' : '#034a31',
    borderColor: darkMode ? '#033a28' : '#d1e7dd',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.15)' : '0 5px 15px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
    fontSize: '0.9rem'
  };

  const tableHeadStyle = {
    backgroundColor: darkMode ? '#033a28' : '#e8f5f0',
    fontSize: '0.9rem',
    fontWeight: '600'
  };

  // Container style
  const containerStyle = {
    background: darkMode 
      ? 'rgba(30, 30, 45, 0.8)' 
      : '#ffffff', // Pure white background
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: darkMode 
      ? '0 8px 20px rgba(0, 0, 0, 0.3)' 
      : '0 8px 20px rgba(0, 0, 0, 0.05)', // Lighter shadow for light mode
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
  const [searchTerm, setSearchTerm] = useState('');
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
              <h1 style={{ color: colors.textPrimary, fontWeight: '300', margin: 0, fontSize: '0.6rem', lineHeight: '1.4' }}>
                <h1>Welcome to {activeChama?.name || 'your chama'}</h1>
              </h1>
              {/* New Subheading */}
              <p style={{
                color: colors.textSecondary,
                margin: '4px 0 0 0',
                fontSize: '0.9rem',
                fontWeight: '400'
              }}>
                Here is your contribution overview.
              </p>
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
              <Col md={3}>
                <Card style={greenCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div style={{ color: darkMode ? '#aaa' : '#33a17c' }} className="h6 mb-0">Total Contributions</div>
                        <div style={iconContainerStyle}>
                         <FiDollarSign size={20} style={{ color: darkMode ? '#33a17c' : '#034a31' }} />
                        </div>
                       </div>
                      <div>
                        <h3 className="mt-2 mb-1">Ksh {moneyIn.toLocaleString()}</h3>
                        <div className="text-success d-flex align-items-center" style={{ fontSize: '0.8rem' }}>
                        <span>▲</span>
                        <span className="ms-1">23.36% from last month</span>
                      </div>
                      </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card style={greenCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                   <div className="d-flex justify-content-between align-items-center mb-2">
                     <div style={{ color: darkMode ? '#aaa' : '#33a17c' }} className="h6 mb-0">Contribution Goal</div>
                      <div style={iconContainerStyle}>
                        <FiTarget size={20} style={{ color: darkMode ? '#33a17c' : '#034a31' }} />
                      </div>
                      </div>
                       <div>
                      <h3 className="mt-2 mb-1">Ksh 100,000</h3>
                      <div style={{ color: darkMode ? '#aaa' : '#33a17c' }} className="small">
                     Target amount
                    </div>
                  </div>
                 </Card.Body>
               </Card>
              </Col>

              <Col md={3}>
                <Card style={greenCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div style={{ color: darkMode ? '#aaa' : '#33a17c' }} className="h6 mb-0">Remaining to Goal</div>
                      <div style={iconContainerStyle}>
                        <FiCalendar size={20} style={{ color: darkMode ? '#33a17c' : '#034a31' }} />
                       </div>
                      </div>
                      <div>
                        <h3 className="mt-2 mb-1">Ksh {(100000 - moneyIn).toLocaleString()}</h3>
                        <div style={{ color: darkMode ? '#aaa' : '#33a17c' }} className="small">
                          {((100000 - moneyIn)/1000).toFixed(0)}k left
                        </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card style={greenCardStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                    <div style={{ color: darkMode ? '#aaa' : '#33a17c' }} className="h6 mb-0">Percentage Reached</div>
                      <div style={iconContainerStyle}>
                        <FiPercent size={20} style={{ color: darkMode ? '#33a17c' : '#034a31' }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="mt-2 mb-1">{(moneyIn/100000 * 100).toFixed(1)}%</h3>
                      <div className="progress" style={{ height: '6px', backgroundColor: darkMode ? '#033a28' : '#e8f5f0' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ 
                            width: `${moneyIn/100000 * 100}%`,
                            backgroundColor: darkMode ? '#33a17c' : '#034a31'
                          }} 
                      ></div>
                     </div>
                   </div>
                 </Card.Body>
               </Card>
              </Col>
            </Row>
            
            {/* Contribution Types and Recent Activity */}
            <Row className="g-3 mb-4">
                <Col md={8}>
                  <Card style={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    overflow: 'hidden',
                    backgroundColor: darkMode ? 'rgba(30, 30, 45, 0.8)' : '#ffffff',
                    color: colors.textPrimary
                  }}>
                    <Card.Body>
                      <Card.Title style={{ color: colors.textPrimary }}>Contribution Types</Card.Title>
                      <div style={{ height: '300px' }}>
                        {/* Pie Chart - Using react-chartjs-2 */}
                        <Pie
                          data={{
                            labels: ['Wedding', 'Ruracio', 'Harambee', 'Emergency', 'Other'],
                            datasets: [{
                              data: [45, 25, 15, 10, 5],
                              backgroundColor: [
                                '#034a31',  // Dark green
                                '#33a17c',  // Light green
                                '#5cb85c',  // Medium green
                                '#8fd19e',  // Pale green
                                '#c8e6c9'   // Very pale green
                              ],
                            borderColor: darkMode ? '#222233' : '#ffffff',
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: colors.textPrimary
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.label}: ${context.raw}%`;
                                }
                              }
                            }
                          }
                        }}
                      />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Recent Activity Column (md={4}) */}
                <Col md={4}>
                  <Card style={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
                  height: '100%',
                  backgroundColor: darkMode ? 'rgba(30, 30, 45, 0.8)' : '#ffffff',
                 }}>
                  <Card.Body>
                    <Card.Title style={{ color: darkMode ? '#33a17c' : '#034a31', marginBottom: '1rem' }}>
                      Recent Activity
                    </Card.Title>
                    <div style={{ height: '300px', overflowY: 'auto' }}>
                      <ListGroup as="ol" numbered style={{ 
                        border: 'none',
                        '--bs-list-group-bg': 'transparent',
                        '--bs-list-group-border-color': darkMode ? '#033a28' : '#d1e7dd'
                      }}>
                          <ListGroup.Item 
                            as="li"
                            className="d-flex align-items-start py-3"
                            style={{
                              backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : '#f8f9fa',
                              borderColor: darkMode ? '#033a28' : '#d1e7dd'
                            }}
                          >
                            <div className="ms-2 me-auto">
                              <div className="d-flex align-items-center" style={{ color: darkMode ? '#33a17c' : '#034a31' }}>
                                <FiUser className="me-2" size={16} />
                                <strong>John Doe</strong>
                              </div>
                              <small className="text-muted mt-1">
                                Made contribution of Ksh 5,000 • 2 mins ago
                              </small>
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item 
                            as="li"
                            className="d-flex align-items-start py-3"
                            style={{
                              backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : '#f8f9fa',
                              borderColor: darkMode ? '#033a28' : '#d1e7dd'
                            }}
                          >
                            <div className="ms-2 me-auto">
                              <div className="d-flex align-items-center" style={{ color: darkMode ? '#33a17c' : '#034a31' }}>
                                <FiEdit2 className="me-2" size={16} />
                                <strong>Admin</strong>
                              </div>
                              <small className="text-muted mt-1">
                                Updated records • 15 mins ago
                              </small>
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item 
                            as="li"
                            className="d-flex align-items-start py-3"
                            style={{
                              backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : '#f8f9fa',
                              borderColor: darkMode ? '#033a28' : '#d1e7dd'
                            }}
                          >
                            <div className="ms-2 me-auto">
                              <div className="d-flex align-items-center" style={{ color: darkMode ? '#33a17c' : '#034a31' }}>
                                <FiCalendar className="me-2" size={16} />
                                <strong>New Event</strong>
                              </div>
                              <small className="text-muted mt-1">
                                Mary's Wedding • 1 hour ago
                              </small>
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item 
                            as="li"
                            className="d-flex align-items-start py-3"
                            style={{
                              backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : '#f8f9fa',
                              borderColor: darkMode ? '#033a28' : '#d1e7dd'
                            }}
                          >
                            <div className="ms-2 me-auto">
                              <div className="d-flex align-items-center" style={{ color: darkMode ? '#33a17c' : '#034a31' }}>
                                <FiDollarSign className="me-2" size={16} />
                                <strong>Jane Smith</strong>
                              </div>
                              <small className="text-muted mt-1">
                                Contributed Ksh 10,000 • 3 hours ago
                              </small>
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item 
                            as="li"
                            className="d-flex align-items-start py-3"
                            style={{
                              backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : '#f8f9fa',
                              borderColor: darkMode ? '#033a28' : '#d1e7dd'
                            }}
                          >
                            <div className="ms-2 me-auto">
                              <div className="d-flex align-items-center" style={{ color: darkMode ? '#33a17c' : '#034a31' }}>
                                <FiSettings className="me-2" size={16} />
                                <strong>System Update</strong>
                              </div>
                              <small className="text-muted mt-1">
                                Settings modified • 5 hours ago
                              </small>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
             
            {/* Recent Transactions */}
            <div style={{ marginTop: '25px', position: 'relative', zIndex: 1 }}>
            <div className="position-relative">
              <h4 style={{ color: colors.textPrimary, marginBottom: '16px' }}>
                Recent Transactions
              </h4>
              <p style={{ 
                color: colors.textSecondary, 
                fontSize: '0.9rem',
                marginBottom: '16px'
              }}>
                Search and filter transaction history
              </p>
              <div className="d-flex align-items-center gap-3">
                {/* Search Bar */}
                <div className="position-relative" style={{ width: '600px' }}>
                  <Form.Control
                    type="search"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={darkMode ? "bg-dark text-light border-secondary" : ""}
                    style={{
                      borderRadius: '20px',
                      paddingLeft: '40px',
                      borderColor: darkMode ? '#444' : '#dee2e6'
                    }}
                  />
                  <FiSearch 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: darkMode ? '#aaa' : '#666'
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <Table responsive style={tableStyle} className="align-middle">
              <thead style={{ ...tableHeadStyle, color: darkMode ? '#33a17c' : '#034a31' }}>
                <tr>
                  <th>Transaction ID</th>
                  <th>Contributor</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Category</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} style={{ 
                    backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : 'rgba(249, 249, 249, 0.8)',
                    color: darkMode ? '#e1e1e1' : '#034a31'
                  }}>
                    <td>{transaction.transactionId}</td>
                    <td>{transaction.member}</td>
                    <td>Ksh {transaction.amount.toLocaleString()}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{transaction.event}</td>
                    <td className="text-end">
                      <Badge 
                        bg={transaction.status === 'completed' ? 'success' : 'warning'} 
                        className="text-capitalize"
                        style={{
                          backgroundColor: transaction.status === 'completed' 
                            ? darkMode ? '#33a17c' : '#034a31'
                            : darkMode ? '#d4a017' : '#ffc107'
                        }}
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;