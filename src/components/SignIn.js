import React, { useState } from "react";
import { Form, Button, Container, Alert, Card, Row, Col, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaFacebook, FaGoogle, FaPhone } from "react-icons/fa";
import "./styles.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { setDoc,doc } from "firebase/firestore";
import { toast } from "react-toastify";

const SignIn = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit =async (e) => {
    e.preventDefault();
    try{
      await createUserWithEmailAndPassword(auth,email,password);
      const user = auth.currentUser;
      console.log(user);
      if (user){
        await setDoc(doc(db, 'Users', user.uid), {
          email:user.email,
          firstName: firstName,
          lastName: lastName,
        });
      }
      console.log("User is registered successfully");
      toast.success("User registered successfully", {
        position: "top-center",
      })
    }
    catch(error){
       setError(error.message);
        toast.error(error.message, { position: "bottom-center" });
    }
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
    } else {
      setError("");
      console.log("Signing up with:", { firstName, lastName, email, password });
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Signing in with ${provider}`);
  };

  return (
    <Container fluid className="auth-container d-flex align-items-center justify-content-center" style={{marginTop: "2vw"}}>
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
              <h2 className="text-center mb-4">Sign Up</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2"
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
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="Hbutton w-100 py-2 mt-3"
                >
                  Sign Up
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

export default SignIn;