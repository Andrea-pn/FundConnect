import React, { useState } from "react";
import { Form, Button, Container, Alert, Card, Row, Col, Image, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle, FaPhone } from "react-icons/fa";
import './style.css';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

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

  const handleSocialLogin = (provider) => {
    // Implement social login logic here
    console.log(`Signing in with ${provider}`);
    toast.info(`${provider} login coming soon!`, {
      position: "top-right"
    });
  };

  return (
    <Container fluid className="auth-container d-flex align-items-center justify-content-center" style={{ marginTop: "2vw" }}>
      <Row className="auth-row g-0">
        {/* Image Card with Social Login Buttons */}
        <Col md={6} className="d-none d-md-block">
          <Card className="auth-image-card h-100 position-relative">
            <Image
              src="/jImages/auth-image.jpg"
              alt="Sign Up"
              className="auth-image"
              fluid
            />
            <div className="social-login-overlay">
              <h3 className="text-white mb-4">Sign Up With</h3>
              <Button 
                variant="primary" 
                className="social-btn facebook-btn mb-3"
                onClick={() => handleSocialLogin('facebook')}
              >
                <FaFacebook className="me-2" />
                Continue with Facebook
              </Button>
              <Button 
                variant="danger" 
                className="social-btn google-btn mb-3"
                onClick={() => handleSocialLogin('google')}
              >
                <FaGoogle className="me-2" />
                Continue with Google
              </Button>
              <Button 
                variant="dark" 
                className="social-btn phone-btn"
                onClick={() => handleSocialLogin('phone')}
              >
                <FaPhone className="me-2" />
                Continue with Phone
              </Button>
            </div>
          </Card>
        </Col>

        {/* Form Card */}
        <Col md={6}>
          <Card className="auth-form-card h-100">
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center mb-4">Create Account</h2>
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="py-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="py-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhoneNumber">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter phone number (optional)"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                  <Form.Text className="text-muted">
                    Minimum 6 characters
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="Hbutton w-100 py-2 mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Form>

              {/* Mobile Social Login Buttons */}
              <div className="d-md-none mt-4">
                <div className="text-center mb-3">
                  <span className="text-muted">Or sign up with</span>
                </div>
                <Button 
                  variant="primary" 
                  className="social-btn facebook-btn mb-auto w-100"
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <FaFacebook className="me-2" />
                  Facebook
                </Button>
                <Button 
                  variant="danger" 
                  className="social-btn google-btn mb-3 w-100"
                  onClick={() => handleSocialLogin('google')}
                >
                  <FaGoogle className="me-2" />
                  Google
                </Button>
                <Button 
                  variant="dark" 
                  className="social-btn phone-btn w-100"
                  onClick={() => handleSocialLogin('phone')}
                >
                  <FaPhone className="me-2" />
                  Phone
                </Button>
              </div>

              <p className="text-center mt-4 mb-0">
                Already have an account? <Link to="/login" className="text-decoration-none">Log In</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;