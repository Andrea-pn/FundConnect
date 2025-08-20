// components/ContributionsAnalytics.js
import React from 'react';
import { Card, Row, Col, Alert, ListGroup, Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDollarSign, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const ContributionsAnalytics = ({ analysis, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Contributions</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  const {
    totalContributions,
    totalAmount,
    monthlyTrend,
    contributionsByTypeGrouped, // Add this line
    contributionsByStatus,
    topContributors,
    recentContributions,
    monthlyStats
  } = analysis;

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare pie chart data
  const pieChartData = Object.entries(contributionsByTypeGrouped || {}).map(([type, amount]) => ({
    name: type,
    value: amount
  }));

  // Status badge variant
  const getStatusVariant = (status) => {
    switch(status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="contributions-analytics">
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiDollarSign size={24} className="me-3" />
                <div>
                  <h6 className="mb-0">Total Amount</h6>
                  <h4 className="mb-0">Ksh {totalAmount.toLocaleString()}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiCalendar size={24} className="me-3" />
                <div>
                  <h6 className="mb-0">Total Contributions</h6>
                  <h4 className="mb-0">{totalContributions}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-info text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiDollarSign size={24} className="me-3" />
                <div>
                  <h6 className="mb-0">This Month</h6>
                  <h4 className="mb-0">Ksh {monthlyStats.currentMonth.toLocaleString()}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`text-white ${monthlyStats.growth >= 0 ? 'bg-success' : 'bg-danger'}`}>
            <Card.Body>
              <div className="d-flex align-items-center">
                {monthlyStats.growth >= 0 ? 
                  <FiTrendingUp size={24} className="me-3" /> : 
                  <FiTrendingDown size={24} className="me-3" />
                }
                <div>
                  <h6 className="mb-0">Monthly Growth</h6>
                  <h4 className="mb-0">{monthlyStats.growth}%</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Monthly Trend Chart */}
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Monthly Contributions Trend</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={{ fill: '#0088FE' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Contribution Types Pie Chart */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Contributions by Type</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Top Contributors */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Contributors</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {topContributors.map((contributor, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{contributor.memberName}</strong>
                      <br />
                      <small className="text-muted">{contributor.contributionCount} contributions</small>
                    </div>
                    <Badge bg="primary" pill>
                      Ksh {contributor.totalAmount.toLocaleString()}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {topContributors.length === 0 && (
                <p className="text-muted text-center py-3">No contributions yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Contributions */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Contributions</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {recentContributions.map((contribution, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{contribution.memberName}</strong>
                      <br />
                      <small className="text-muted">
                        {contribution.type} • {new Date(contribution.date).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge bg={getStatusVariant(contribution.status)} className="mb-1">
                        {contribution.status}
                      </Badge>
                      <br />
                      <span className="fw-bold">Ksh {contribution.amount.toLocaleString()}</span>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {recentContributions.length === 0 && (
                <p className="text-muted text-center py-3">No recent contributions</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Summary */}
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Contribution Status Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(contributionsByStatus).map(([status, count]) => (
                  <Col md={3} key={status}>
                    <div className="text-center p-3 border rounded">
                      <h4 className="mb-0">{count}</h4>
                      <Badge bg={getStatusVariant(status)} className="mt-1">
                        {status}
                      </Badge>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContributionsAnalytics;