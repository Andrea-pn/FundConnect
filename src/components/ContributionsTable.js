import React, { useMemo } from 'react';
import { Table, Badge, Card, Button, ButtonGroup } from 'react-bootstrap';
import { FiDollarSign, FiPlus, FiUser, FiCheck, FiXCircle, FiPrinter } from 'react-icons/fi';

// Helper function to get contribution period cycles
const getContributionCycles = (contributions, period, chamaStartDate) => {
  if (!contributions || contributions.length === 0) return [];
  
  // Sort contributions by date (newest first)
  const sortedContributions = [...contributions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  const startDate = new Date(chamaStartDate || '2024-01-01'); // Use chama start date or default
  
  if (period === 'Weekly') {
    return groupByWeeklyCycles(sortedContributions, startDate);
  } else if (period === 'Monthly') {
    return groupByMonthlyCycles(sortedContributions, startDate);
  } else {
    // For other periods, group by the actual period type
    return groupByPeriod(sortedContributions, period);
  }
};

// Group contributions by weekly cycles
const groupByWeeklyCycles = (contributions, startDate) => {
  const cycles = {};
  
  contributions.forEach(contribution => {
    const contributionDate = new Date(contribution.date);
    const daysDiff = Math.floor((contributionDate - startDate) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    
    // Calculate week start and end dates
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const cycleKey = `week-${weekNumber}`;
    
    if (!cycles[cycleKey]) {
      cycles[cycleKey] = {
        cycleNumber: weekNumber,
        cycleName: `Week ${weekNumber}`,
        dateRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        startDate: weekStart,
        contributions: [],
        totalAmount: 0
      };
    }
    
    cycles[cycleKey].contributions.push(contribution);
    cycles[cycleKey].totalAmount += parseFloat(contribution.amount) || 0;
  });
  
  // Convert to array and sort by cycle number (newest first)
  return Object.values(cycles).sort((a, b) => b.cycleNumber - a.cycleNumber);
};

// Group contributions by monthly cycles
const groupByMonthlyCycles = (contributions, startDate) => {
  const cycles = {};
  
  contributions.forEach(contribution => {
    const contributionDate = new Date(contribution.date);
    const monthsDiff = (contributionDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (contributionDate.getMonth() - startDate.getMonth()) + 1;
    
    const cycleKey = `month-${monthsDiff}`;
    
    if (!cycles[cycleKey]) {
      cycles[cycleKey] = {
        cycleNumber: monthsDiff,
        cycleName: `Month ${monthsDiff}`,
        dateRange: contributionDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate: new Date(contributionDate.getFullYear(), contributionDate.getMonth(), 1),
        contributions: [],
        totalAmount: 0
      };
    }
    
    cycles[cycleKey].contributions.push(contribution);
    cycles[cycleKey].totalAmount += parseFloat(contribution.amount) || 0;
  });
  
  // Convert to array and sort by cycle number (newest first)
  return Object.values(cycles).sort((a, b) => b.cycleNumber - a.cycleNumber);
};

// Group by other periods (daily, bi-weekly, etc.)
const groupByPeriod = (contributions, period) => {
  const groups = {};
  
  contributions.forEach(contribution => {
    const date = new Date(contribution.date);
    let groupKey;
    let groupName;
    
    switch (period?.toLowerCase()) {
      case 'daily':
        groupKey = date.toISOString().split('T')[0];
        groupName = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
        break;
      case 'bi-weekly':
        const weekNumber = Math.floor(date.getDate() / 14) + 1;
        groupKey = `${date.getFullYear()}-${date.getMonth()}-${weekNumber}`;
        groupName = `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Bi-week ${weekNumber}`;
        break;
      default:
        groupKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        groupName = date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        cycleName: groupName,
        dateRange: groupName,
        startDate: date,
        contributions: [],
        totalAmount: 0
      };
    }
    
    groups[groupKey].contributions.push(contribution);
    groups[groupKey].totalAmount += parseFloat(contribution.amount) || 0;
  });
  
  return Object.values(groups).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
};

// Updated table component with contribution cycles
const ContributionsTable = ({ 
  filteredContributions, 
  chamaSettings, 
  darkMode, 
  tableStyle, 
  tableHeadStyle,
  chamaStartDate, // Add this prop - the date when the chama started
  isAdmin,
  handleStatusChange,
  setReceiptData,
  setShowReceiptModal,
  setShowAddModal,
  contributions,
  statusVariant
}) => {
  const contributionCycles = useMemo(() => {
    return getContributionCycles(
      filteredContributions, 
      chamaSettings?.period, 
      chamaStartDate
    );
  }, [filteredContributions, chamaSettings?.period, chamaStartDate]);

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        {filteredContributions.length === 0 ? (
          <div className="text-center py-5">
            <FiDollarSign size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No contributions found</h5>
            <p className="text-muted">
              {contributions.length === 0 
                ? "No contributions have been recorded yet."
                : "No contributions match your current filters."
              }
            </p>
            {isAdmin && contributions.length === 0 && (
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                className="mt-3"
              >
                <FiPlus className="me-2" />
                Record First Contribution
              </Button>
            )}
          </div>
        ) : (
          <div>
            {contributionCycles.map((cycle, cycleIndex) => (
        <div key={cycleIndex} style={{ marginBottom: '2rem' }}>
          {/* Cycle Header */}
          <div style={{ 
            padding: '15px 20px', 
            backgroundColor: darkMode ? 'rgba(51, 161, 124, 0.15)' : 'rgba(3, 74, 49, 0.1)',
            borderRadius: '8px 8px 0 0',
            borderBottom: `3px solid ${darkMode ? '#33a17c' : '#034a31'}`,
            marginBottom: '0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div>
                <h5 style={{ 
                  margin: 0, 
                  color: darkMode ? '#33a17c' : '#034a31',
                  fontWeight: 'bold'
                }}>
                  {cycle.cycleName}
                </h5>
                <p style={{ 
                  margin: '2px 0 0 0', 
                  color: darkMode ? '#a1a1a1' : '#666',
                  fontSize: '0.9rem'
                }}>
                  {cycle.dateRange}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  color: darkMode ? '#33a17c' : '#034a31',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {cycle.contributions.length} contribution{cycle.contributions.length !== 1 ? 's' : ''}
                </div>
                <div style={{ 
                  color: darkMode ? '#a1a1a1' : '#666',
                  fontSize: '0.8rem'
                }}>
                  Total: Ksh {cycle.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Table for this cycle */}
          <Table responsive style={{
            ...tableStyle,
            marginBottom: '0',
            borderRadius: '0 0 8px 8px'
          }} className="align-middle">
            <thead style={{ 
              ...tableHeadStyle, 
              color: darkMode ? '#33a17c' : '#034a31',
              backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.6)' : 'rgba(249, 249, 249, 0.9)'
            }}>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {cycle.contributions.map((contribution) => (
                <tr key={contribution.id} style={{ 
                  backgroundColor: darkMode ? 'rgba(40, 40, 60, 0.4)' : 'rgba(249, 249, 249, 0.8)',
                  color: darkMode ? '#e1e1e1' : '#034a31'
                }}>
                  <td>{new Date(contribution.date).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FiUser className="me-2 text-muted" />
                      {contribution.memberName}
                    </div>
                  </td>
                  <td>{contribution.type}</td>
                  <td className="fw-bold">
                    Ksh {contribution.amount.toLocaleString()}
                  </td>
                  <td>{contribution.paymentMethod || 'N/A'}</td>
                  <td>
                    <code className="text-muted">{contribution.reference}</code>
                  </td>
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
                              title="Verify"
                            >
                              <FiCheck />
                            </Button>
                            <Button
                              variant="outline-danger"
                              onClick={() => handleStatusChange(contribution.id, 'Rejected')}
                              title="Reject"
                            >
                              <FiXCircle />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            setReceiptData(contribution);
                            setShowReceiptModal(true);
                          }}
                          title="View Receipt"
                        >
                          <FiPrinter />
                        </Button>
                      </ButtonGroup>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
                  ))}
            
            {contributionCycles.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: darkMode ? '#a1a1a1' : '#666',
                fontStyle: 'italic'
              }}>
                No contributions found for the selected period.
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ContributionsTable;