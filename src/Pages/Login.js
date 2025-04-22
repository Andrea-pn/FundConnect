import React, { useState } from "react";
import { Form, Button, Container, Alert, Card, Row, Col, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle, FaPhone } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import "../styles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!", { position: "bottom-center" });
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
      toast.error(error.message, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`, { position: "bottom-center" });
  };

  return (
    <Container fluid className="auth-container d-flex align-items-center justify-content-center" style={{marginTop: "5vw"}}>
      <Row className="auth-row g-0">
        <Col md={6} className="d-none d-md-block">
          <Card className="auth-image-card h-100 position-relative">
            <Image
              src="/jImages/auth-image.jpg"
              alt="Log In"
              className="auth-image"
              fluid
            />
            <div className="social-login-overlay">
              <h3 className="text-white mb-4">Log In With</h3>
              <Button 
                variant="primary" 
                className="social-btn facebook-btn mb-3"
                onClick={() => handleSocialLogin('Facebook')}
                disabled={loading}
              >
                <FaFacebook className="me-2" />
                Continue with Facebook
              </Button>
              <Button 
                variant="danger" 
                className="social-btn google-btn mb-3"
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
              >
                <FaGoogle className="me-2" />
                Continue with Google
              </Button>
              <Button 
                variant="dark" 
                className="social-btn phone-btn"
                onClick={() => handleSocialLogin('Phone')}
                disabled={loading}
              >
                <FaPhone className="me-2" />
                Continue with Phone
              </Button>
            </div>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="auth-form-card h-100">
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center mb-4">Log In</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2"
                    disabled={loading}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="Hbutton w-100 py-2 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </Form>

              <div className="d-md-none mt-4">
                <div className="text-center mb-3">
                  <span className="text-muted">Or log in with</span>
                </div>
                <Button 
                  variant="primary" 
                  className="social-btn facebook-btn mb-3 w-100"
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={loading}
                >
                  <FaFacebook className="me-2" />
                  Facebook
                </Button>
                <Button 
                  variant="danger" 
                  className="social-btn google-btn mb-3 w-100"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={loading}
                >
                  <FaGoogle className="me-2" />
                  Google
                </Button>
                <Button 
                  variant="dark" 
                  className="social-btn phone-btn w-100"
                  onClick={() => handleSocialLogin('Phone')}
                  disabled={loading}
                >
                  <FaPhone className="me-2" />
                  Phone
                </Button>
              </div>

              <p className="text-center mt-4 mb-0">
                Don't have an account? <Link to="/signin" className="text-decoration-none">Sign Up</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;