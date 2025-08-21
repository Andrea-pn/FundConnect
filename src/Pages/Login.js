import React, { useState } from "react";
import { Form, Button, Container, Alert, Card, Row, Col, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import logo from "../components/logo.png";
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


  return (
    <Container fluid className="auth-container d-flex align-items-center justify-content-center" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)",
      padding: "20px",
      margin: 0
    }}>
      <Row className="justify-content-center w-100 g-0">
        <Col xs={12} md={8} lg={6} xl={5}>
        {/* Logo Container */}
          <div className="text-center mb-4">
            <img 
              src={logo} // Update with your logo path
              alt="Company Logo"
              style={{
                height: "60px", // Adjust size as needed
                width: "auto",
                marginBottom: "1.5rem",
                objectFit: "contain"
              }}
            />
            <p style={{
              color: "#5a6d61",
              fontSize: "0.95rem",
              fontWeight: "500",
              letterSpacing: "0.3px",
              margin: "0.5rem 0 0",
              lineHeight: "1.4",
              fontStyle: "italic"
            }}>
              Simplifying financial management for chamas
            </p>
          </div>

          <Card className="border-0 shadow-lg" style={{
            borderRadius: "15px",
            overflow: "hidden",
            backgroundColor: "#ffffff"
          }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 style={{
                  color: "#034a31",
                  fontWeight: "600",
                  marginBottom: "0.5rem"
                }}>Log In</h2>
                <p style={{ color: "#5a6d61", fontSize: "0.9rem" }}>Welcome back! Please enter your details</p>
              </div>

              {error && <Alert variant="danger" className="text-center" style={{
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                marginBottom: "1.5rem"
              }}>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label style={{
                    color: "#034a31",
                    fontWeight: "500",
                    marginBottom: "0.5rem"
                  }}>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1e7dd",
                      transition: "all 0.3s",
                      padding: "0.75rem 1rem"
                    }}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label style={{
                    color: "#034a31",
                    fontWeight: "500",
                    marginBottom: "0.5rem"
                  }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1e7dd",
                      transition: "all 0.3s",
                      padding: "0.75rem 1rem"
                    }}
                    disabled={loading}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mt-3"
                  disabled={loading}
                  style={{
                    backgroundColor: "#034a31",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 6px rgba(3, 74, 49, 0.2)",
                    height: "3rem",
                    display: "block",    // Ensures proper centering
                    width: "100%",       // Takes full container width
                    margin: "1.5rem auto 0" // Top margin only, auto for horizontal centering
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#033a27"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#034a31"}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Logging in...
                    </>
                  ) : 'Log In'}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0" style={{ color: "#5a6d61" }}>
                Don't have an account?{' '}
                <Link to="/signin" className="text-decoration-none" style={{
                  color: "#33a17c",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.color = "#034a31"}
                onMouseLeave={(e) => e.target.style.color = "#33a17c"}
                >
                  Sign Up
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;