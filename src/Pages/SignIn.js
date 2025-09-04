import React, { useState } from "react";
import { Form, Button, Container, Alert, Card, Row, Col, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import './style.css';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import logo from "../components/logo.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: false,
        profileComplete: false,
        chamas: [] // Array to store chamas this user belongs to
      });

      toast.success("Account created successfully!", {
        position: "top-center",
        autoClose: 3000
      });

      // Redirect to dashboard or verification page
      navigate("/dashboard");

    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage, { 
        position: "bottom-center",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container fluid className="auth-container d-flex align-items-center justify-content-center" style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)",
      padding: "1rem"  // Reduced padding for mobile
    }}>
      <Row className="auth-row g-0 justify-content-center" style={{ 
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Form Card */}
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>  {/* Better mobile-first sizing */}
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

          <Card className="auth-form-card" style={{
            border: "none",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            width: "100%"
          }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 style={{
                  color: "#034a31",
                  fontWeight: "600",
                  marginBottom: "10px"
                }}>Create Account</h2>
                <p style={{ color: "#5a6d61" }}>Join our community today</p>
              </div>
              
              {error && <Alert variant="danger" className="text-center" style={{
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#f8d7da",
                color: "#721c24"
              }}>{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label style={{ color: "#034a31", fontWeight: "500" }}>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="py-2"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #d1e7dd",
                          transition: "all 0.3s"
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label style={{ color: "#034a31", fontWeight: "500" }}>Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="py-2"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #d1e7dd",
                          transition: "all 0.3s"
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label style={{ color: "#034a31", fontWeight: "500" }}>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    className="py-2"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1e7dd",
                      transition: "all 0.3s"
                    }}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhoneNumber">
                  <Form.Label style={{ color: "#034a31", fontWeight: "500" }}>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter phone number (optional)"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="py-2"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1e7dd",
                      transition: "all 0.3s"
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label style={{ color: "#034a31", fontWeight: "500" }}>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="py-2"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1e7dd",
                      transition: "all 0.3s"
                    }}
                    required
                  />
                  <Form.Text className="text-muted" style={{ color: "#6c757d" }}>
                    Minimum 6 characters
                  </Form.Text>
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
                    padding: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 6px rgba(3, 74, 49, 0.2)",
                    display: "block",    // Ensures proper centering
                    width: "100%",       // Takes full container width
                    margin: "1.5rem auto 0" // Top margin only, auto for horizontal centering
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#033a27"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#034a31"}
                >
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0" style={{ color: "#5a6d61" }}>
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none" style={{
                  color: "#33a17c",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.color = "#034a31"}
                onMouseLeave={(e) => e.target.style.color = "#33a17c"}
                >
                  Log In
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;