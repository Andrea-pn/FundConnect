import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FiMail, FiCheck, FiX, FiHome } from 'react-icons/fi';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  addDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';  // Correct relative path
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const InvitationsPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const q = query(
          collection(db, 'invitations'),
          where('invitedUserId', '==', user.uid),
          where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        const invites = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt
        }));
        
        setInvitations(invites);
      } catch (err) {
        console.error("Error fetching invitations:", err);
        setError("Failed to load invitations. Please refresh to try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [user]);

  const handleRespondToInvitation = async (invitationId, response) => {
    try {
      setProcessingId(invitationId);
      
      // Update invitation status
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: response,
        respondedAt: serverTimestamp()
      });

      if (response === 'accepted') {
        // Add user to chama memberships
        const invitation = invitations.find(i => i.id === invitationId);
        await addDoc(collection(db, 'memberships'), {
          userId: user.uid,
          chamaId: invitation.chamaId,
          role: 'member',
          joinedAt: serverTimestamp(),
          status: 'active'
        });

        // Update chama member count
        const chamaRef = doc(db, 'chamas', invitation.chamaId);
        await updateDoc(chamaRef, {
          memberCount: increment(1)
        });

        toast.success(`You've joined ${invitation.chamaName}!`);
      } else {
        toast.info("Invitation declined");
      }

      // Remove from local state
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast.error("Failed to process invitation. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="d-flex align-items-center mb-4">
        <FiMail className="me-2" /> My Invitations
      </h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading invitations...</p>
        </div>
      ) : invitations.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiMail size={48} className="text-muted mb-3" />
            <h5>No Pending Invitations</h5>
            <p className="text-muted">
              You don't have any pending chama invitations at this time.
            </p>
            <Button as={Link} to="/" variant="primary">
              <FiHome className="me-2" /> Back to Home
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {invitations.map(invitation => (
            <Col key={invitation.id} md={6} lg={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{invitation.chamaName}</Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    Invited by: {invitation.inviterEmail}
                  </Card.Text>
                  <Card.Text className="text-muted small mb-3">
                    Received: {invitation.createdAt.toLocaleDateString()}
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      variant="success"
                      onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                      disabled={processingId === invitation.id}
                    >
                      {processingId === invitation.id ? (
                        <Spinner as="span" size="sm" animation="border" />
                      ) : (
                        <>
                          <FiCheck className="me-2" /> Accept
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleRespondToInvitation(invitation.id, 'declined')}
                      disabled={processingId === invitation.id}
                    >
                      <FiX className="me-2" /> Decline
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default InvitationsPage;