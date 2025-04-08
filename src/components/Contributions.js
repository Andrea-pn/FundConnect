import React, { useState } from 'react';
import { Table, Button, Form, Modal, Alert, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
// Explicitly import jsPDF and the autotable plugin
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Contributions = ({ darkMode }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [contributions, setContributions] = useState([
    { 
      id: 1, 
      member: 'John Doe', 
      type: 'Monthly', 
      amount: 5000, 
      date: '2023-06-15', 
      paymentMethod: 'Mpesa', 
      reference: 'MPESA123', 
      status: 'Verified' 
    },
    { 
      id: 2, 
      member: 'Jane Smith', 
      type: 'Event', 
      amount: 2000, 
      date: '2023-06-10', 
      paymentMethod: 'Bank', 
      reference: 'BNK456', 
      status: 'Pending' 
    },
    { 
      id: 3, 
      member: 'Mike Johnson', 
      type: 'Donation', 
      amount: 10000, 
      date: '2023-06-05', 
      paymentMethod: 'Mpesa', 
      reference: 'MPESA789', 
      status: 'Verified' 
    }
  ]);
  
  const [newContribution, setNewContribution] = useState({
    member: '',
    type: 'Monthly',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Mpesa',
    reference: '',
    status: 'Pending'
  });
  
  const [error, setError] = useState('');

  // Function to handle the verification of a contribution
  const handleVerify = (id) => {
    setContributions(contributions.map(contribution => 
      contribution.id === id ? { ...contribution, status: 'Verified' } : contribution
    ));
  };

  // Function to handle the rejection of a contribution
  const handleReject = (id) => {
    setContributions(contributions.map(contribution => 
      contribution.id === id ? { ...contribution, status: 'Rejected' } : contribution
    ));
  };

  const handleAddContribution = () => {
    if (!newContribution.member || !newContribution.amount || !newContribution.reference) {
      setError('Please fill in all required fields');
      return;
    }

    setContributions([...contributions, { 
      ...newContribution, 
      id: contributions.length + 1,
      amount: parseFloat(newContribution.amount)
    }]);
    
    setShowAddModal(false);
    setNewContribution({
      member: '',
      type: 'Monthly',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Mpesa',
      reference: '',
      status: 'Pending'
    });
    setError('');
  };

  // Fixed downloadPDF function
  const downloadPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title to the PDF
    doc.setFontSize(18);
    doc.text('Contributions Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Define the table columns and rows
    const tableColumn = ["ID", "Member", "Type", "Amount", "Date", "Method", "Reference", "Status"];
    const tableRows = [];
    
    // Populate table data
    contributions.forEach(contrib => {
      const contributionData = [
        contrib.id,
        contrib.member,
        contrib.type,
        `Ksh ${contrib.amount.toLocaleString()}`,
        contrib.date,
        contrib.paymentMethod,
        contrib.reference,
        contrib.status
      ];
      tableRows.push(contributionData);
    });
    
    // Use autoTable directly as imported
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: {
        fillColor: [66, 66, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 10 }, // ID 
        3: { halign: 'right' } // Amount
      }
    });
    
    // Add a footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save('contributions-report.pdf');
  };

  const statusVariant = (status) => {
    switch(status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
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
            Contributions
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
              <h2 style={{ margin: 0, color: colors.cardText }}>Contributions Management</h2>
              <div>
                <Button 
                  variant={darkMode ? "outline-success" : "success"}
                  onClick={downloadPDF}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-pdf me-2" viewBox="0 0 16 16">
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                    <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
                  </svg>
                  Download Report
                </Button>
              </div>
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
                  <th>Member</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr key={contribution.id} style={{ 
                    backgroundColor: darkMode 
                      ? (contribution.id % 2 === 0 ? 'rgba(40, 40, 60, 0.4)' : 'rgba(30, 30, 45, 0.6)') 
                      : (contribution.id % 2 === 0 ? 'rgba(249, 249, 249, 0.8)' : 'rgba(255, 255, 255, 0.9)')
                  }}>
                    <td>{contribution.id}</td>
                    <td>{contribution.member}</td>
                    <td>{contribution.type}</td>
                    <td>Ksh {contribution.amount.toLocaleString()}</td>
                    <td>{contribution.date}</td>
                    <td>{contribution.paymentMethod}</td>
                    <td>{contribution.reference}</td>
                    <td>
                      <Badge bg={statusVariant(contribution.status)}>
                        {contribution.status}
                      </Badge>
                    </td>
                    <td>
                      {contribution.status !== 'Verified' && (
                        <Button 
                          variant={darkMode ? "outline-info" : "info"} 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleVerify(contribution.id)}
                        >
                          Verify
                        </Button>
                      )}
                      {contribution.status !== 'Rejected' && (
                        <Button 
                          variant={darkMode ? "outline-danger" : "danger"} 
                          size="sm"
                          onClick={() => handleReject(contribution.id)}
                        >
                          Reject
                        </Button>
                      )}
                      {(contribution.status === 'Verified' || contribution.status === 'Rejected') && (
                        <span className="text-muted small">
                          {contribution.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {/* Modern plus button at the bottom right */}
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant={darkMode ? "outline-success" : "success"}
                onClick={() => setShowAddModal(true)}
                style={{
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Add Contribution Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header 
            closeButton 
            className={darkMode ? "bg-dark text-light" : ""}
            closeVariant={darkMode ? "white" : undefined}
          >
            <Modal.Title>Record New Contribution</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Member Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newContribution.member}
                  onChange={(e) => setNewContribution({...newContribution, member: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="Enter member name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contribution Type</Form.Label>
                <Form.Select
                  value={newContribution.type}
                  onChange={(e) => setNewContribution({...newContribution, type: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Event">Event</option>
                  <option value="Donation">Donation</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount (Ksh)</Form.Label>
                <Form.Control
                  type="number"
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({...newContribution, amount: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  min="0"
                  step="100"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newContribution.date}
                  onChange={(e) => setNewContribution({...newContribution, date: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={newContribution.paymentMethod}
                  onChange={(e) => setNewContribution({...newContribution, paymentMethod: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <option value="Mpesa">Mpesa</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reference Number</Form.Label>
                <Form.Control
                  type="text"
                  value={newContribution.reference}
                  onChange={(e) => setNewContribution({...newContribution, reference: e.target.value})}
                  className={darkMode ? "bg-dark text-light" : ""}
                  placeholder="e.g. MPESA123, BNK456"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleAddContribution}>
              Save Contribution
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Contributions;