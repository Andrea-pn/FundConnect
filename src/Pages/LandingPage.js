import React, { useEffect, useRef } from "react";
import { Container, Navbar, Nav, Button, Row, Col, Image, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import '../styles.css';
import { Typewriter } from 'react-simple-typewriter';
import logo3 from '../components/logo3.png';
import logo2 from '../components/logo2.png';

const teamMembers = [
    {
      name: "Precious Ndulu",
      image: "/jImages/preciousProfile.jpg",
      description: "Front-end programmer (Project Lead)"
    },
    {
      name: "Jessica Ng'ang'a",
      image: "/jImages/jessProfile.jpg",
      description: "Back-end Programmer"
    },
    {
      name: "Catherine Mumbi",
      image: "/jImages/cateProfile.jpg",
      description: "Web designer."
    },
    {
      name: "Dennis Mbuno",
      image: "/jImages/dennisProfile.jpg",
      description: "Front-end programmer"
      
    },
    {
      name: "Sheilla Achieng'",
      image: "/jImages/sheillaProfile.jpg",
      description: "Back-end Programmer"
    },
    {
      name: "Dr. Lawrence Nderu",
      image: "/jImages/lawrenceProfile.jpg",
      description: "Project Investigator"
    }
  ];

const LandingPage = () => {
  
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    // Create intersection observer for smooth animations that work both ways
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.classList.remove('animate-out');
          } else {
            entry.target.classList.remove('animate-in');
            entry.target.classList.add('animate-out');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe all animatable elements
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <div className="navbar-background"> {/* Wrapper div for background */}
        <Navbar bg="primary" variant="dark" expand="lg" className="px-4">
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <img 
              src={logo2}
              alt="FundConnect Logo" 
              style={{
                height: '30px',
                width: 'auto',
                display: 'block'
              }}
            />
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              whiteSpace: 'nowrap',
              marginLeft: '8px'
            }}>
              FundConnect
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#about">About</Nav.Link>
              <Nav.Link href="#services">Services</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>

      <Container
        fluid
        className="jumuia-container d-flex flex-column align-items-center justify-content-center min-vh-100 text-center w-100 m-0"
        style={{
          backgroundImage: `url('/jImages/bgHome.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img 
          src={logo3}
          alt="FundConnect Logo" 
          style={{
            height: '100px',
            width: 'auto',
            marginBottom: '20px',
            animation: "fadeZoomIn 1s ease-out forwards"
          }}
        />      
        <h1
          style={{ color: "white", animation: "fadeZoomIn 1.2s ease-out forwards" }}
          className="fundconnect-heading"
        >
          FundConnect
        </h1>
          
        <p style={{ color: "white", fontSize: '1.2rem', minHeight: '60px' }}>
        <Typewriter
          words={[
                'Empowering chama groups with seamless financial services and efficient contribution management.'
          ]}
          loop={1}
          cursor
          cursorStyle="|"
          typeSpeed={50}
          deleteSpeed={80}
          delaySpeed={500}
        />
        </p>
          {/* Updated Button to navigate to /signin */}
          <Button className="Hbutton" onClick={() => navigate('/signin')}>Get Started</Button>
      </Container>

      <Container fluid className="py-5 animate-on-scroll" style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, #10b981, #059669)',
        borderRadius: '50%',
        opacity: '0.1',
        zIndex: '1'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
        borderRadius: '50%',
        opacity: '0.1',
        zIndex: '1'
      }}></div>
  
  <Row className="justify-content-center position-relative" style={{ zIndex: '2' }}>
    <Col lg={10} xl={8} className="text-center">
      {/* Icon or visual element */}
      <div className="mb-4 animate-on-scroll">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '20px',
          marginBottom: '1rem',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
        }}>
          <i className="bi bi-graph-up-arrow text-white" style={{ fontSize: '2rem' }}></i>
        </div>
      </div>

      {/* Main heading with enhanced styling */}
      <h2 className="fw-bold mb-4 animate-on-scroll" style={{
        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
        background: 'linear-gradient(135deg, #1f2937, #374151)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: '1.2'
      }}>
        Effortless Chama Management
      </h2>

      {/* Enhanced description with better typography */}
      <div className="animate-on-scroll" style={{ animationDelay: '0.2s' }}>
        <p className="text-muted mx-auto mb-4" style={{ 
          maxWidth: '900px',
          fontSize: '1.1rem',
          lineHeight: '1.7',
          fontWeight: '400'
        }}>
          Whether you're collecting monthly contributions, paying out dividends, or simply tracking expenses — 
          <strong style={{ color: '#014421' }}>FundConnect simplifies every aspect </strong>
           of your chama's financial life.
        </p>
        
        <p className="text-muted mx-auto" style={{ 
          maxWidth: '800px',
          fontSize: '1.05rem',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          Say goodbye to manual record-keeping and hello to <em>automation, insights and transparency</em>.
        </p>
      </div>

      {/* Call-to-action buttons or key features */}
      <div className="mt-5 animate-on-scroll" style={{ animationDelay: '0.4s' }}>
        <Row className="g-4 justify-content-center">
          <Col md={4} sm={6}>
            <div className="feature-highlight text-center p-3">
              <i className="bi bi-lightning-charge text-primary fs-3 mb-2 d-block"></i>
              <h6 className="fw-semibold mb-1">Lightning Fast</h6>
              <small className="text-muted">Real-time processing</small>
            </div>
          </Col>
          <Col md={4} sm={6}>
            <div className="feature-highlight text-center p-3">
              <i className="bi bi-shield-check text-success fs-3 mb-2 d-block"></i>
              <h6 className="fw-semibold mb-1">Bank-Level Security</h6>
              <small className="text-muted">Your funds are protected</small>
            </div>
          </Col>
          <Col md={4} sm={6}>
            <div className="feature-highlight text-center p-3">
              <i className="bi bi-people text-info fs-3 mb-2 d-block"></i>
              <h6 className="fw-semibold mb-1">Community Focused</h6>
              <small className="text-muted">Built for Kenyan chamas</small>
            </div>
          </Col>
        </Row>
      </div>
    </Col>
  </Row>
</Container>

      {/* Compact About Section */}
      {/* Improved About Section */}
<Container id="about" className="py-5 animate-on-scroll">
  <Row className="align-items-center g-4">
    <Col md={6} className="text-center animate-on-scroll" style={{ animationDelay: '0.2s' }}>
      <div className="about-image-wrapper">
        <Image 
          src="/jImages/imageFour.jpg" 
          alt="About Us" 
          fluid 
          rounded 
          className="shadow-lg"
          style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
        />
      </div>
    </Col>
    <Col md={6} className="animate-on-scroll" style={{ animationDelay: '0.4s' }}>
      <div className="about-content">
        <h2 className="fw-bold mb-2">About Us</h2>
        <h5
  className="mb-3"
  style={{
    fontWeight: 500,
    color: '#064e3b'  // dark green matching your theme
  }}
>
  Strengthening communities, one chama at a time
</h5>

        <div className="t-divider my-4" style={{ 
          width: '60px', 
          height: '3px', 
          backgroundColor: '#10b981',
          borderRadius: '2px'
        }}></div>
        <p className="text-muted mb-3" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
          FundConnect is more than just a platform. It's a movement to modernize how community savings groups (chamas) operate.
          We understand the challenges faced by grassroots financial groups in managing contributions, tracking expenses, and maintaining transparency.
        </p>
        <p className="text-muted mb-4" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
          That's why we've built an intuitive, secure and community-focused solution that helps your chama thrive, so members can focus on what matters most: building dreams together.
        </p>
              </div>
    </Col>
  </Row>
</Container>




      {/* Compact Services Section */}
      
     <Container id="services" className="py-5" style={{ backgroundColor: "#ffffff" }}>
  <h2 className="text-center mb-4 animate-on-scroll">Our Services</h2>

  <Row className="align-items-center mb-5 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
    <Col md={6} className="text-center">
      <Image src="/jImages/imageTwo.jpg" alt="Real-Time Transaction Tracking" fluid rounded />
    </Col>
    <Col md={6} className="text-center text-md-start">
      <h3>Real-Time Transaction Tracking</h3>
      <p>
        Stay on top of every contribution and payout instantly. Our platform automatically records and updates all transactions in real time, giving you full transparency and control over your chama’s finances—anytime, anywhere.
      </p>
    </Col>
  </Row>

  <Row className="align-items-center mb-5 flex-md-row-reverse animate-on-scroll" style={{ animationDelay: '0.4s' }}>
    <Col md={6} className="text-center">
      <Image src="/jImages/imageOne.jpg" alt="Automated Record Keeping" fluid rounded />
    </Col>
    <Col md={6} className="text-center text-md-start">
      <h3>Automated Record Keeping</h3>
      <p>
        Say goodbye to tedious manual entries and lost paperwork. Our system securely stores every transaction and activity digitally, so you can access your complete financial history with ease and accuracy, reducing errors and saving time.
      </p>
    </Col>
  </Row>

  <Row className="align-items-center mb-3 animate-on-scroll" style={{ animationDelay: '0.6s' }}>
    <Col md={6} className="text-center">
      <Image src="/jImages/charts.jpg" alt="Financial Reports" fluid rounded />
    </Col>
    <Col md={6} className="text-center text-md-start">
      <h3>Financial Reports</h3>
      <p>
        Gain valuable insights into your chama’s financial health with detailed reports and interactive charts. Track performance, analyze trends, and make informed decisions to help your group grow stronger and more transparent.
      </p>
    </Col>
  </Row>
</Container>


      {/* Compact Features Section */}
      <Container id="features" className="py-4">
        <h2 className="text-center mb-3 animate-on-scroll"style={{ marginBottom: '0.5rem' }}>Why Choose Us?</h2>
        
        <Row>
          <Col md={4} className="mb-3 text-center animate-on-scroll" style={{animationDelay: '0.2s'}}>
            <i className="bi bi-credit-card fs-2 feature-icon"></i>
            <h4>Automated Transactions</h4>
            <p>Effortlessly manage contributions and payouts with our automated system, saving you time and reducing errors.</p>
          </Col>
          <Col md={4} className="mb-3 text-center animate-on-scroll" style={{animationDelay: '0.4s'}}>
            <i className="bi bi-bar-chart fs-2 feature-icon"></i>
            <h4>Transparent Reporting</h4>
            <p>Gain complete visibility into your chama's finances with detailed reports and real-time updates.</p>
          </Col>
          <Col md={4} className="mb-3 text-center animate-on-scroll" style={{animationDelay: '0.6s'}}>
            <i className="bi bi-shield-lock fs-2 feature-icon"></i>
            <h4>Secure Platform</h4>
            <p>Rest assured that your chama's funds are safe and secure with our robust security measures.</p>
          </Col>
        </Row>
      </Container>

      {/* Compact Team Section */}
      <Container id="team" className="TeamSection py-4 animate-on-scroll">
        <h2 className="text-center mb-3">Meet Our Team</h2>
        <p className="text-muted text-center mb-3">Dedicated professionals behind our success.</p>
        <Row className="justify-content-center">
          {teamMembers.map((member, index) => (
            <Col key={index} md={4} sm={6} xs={12} className="d-flex justify-content-center mb-3 animate-on-scroll" style={{animationDelay: `${0.2 + index * 0.1}s`}}>
              <Card className="team-card text-center border-0">
                <Card.Img
                  variant="top"
                  src={member.image}
                  alt={member.name}
                  className="team-img rounded-circle mx-auto d-block"
                />
                <Card.Body>
                  <Card.Title>{member.name}</Card.Title>
                  <Card.Text>{member.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Enhanced Footer Section */}
      <footer id="contact" className="footer-section animate-on-scroll">
        <div className="container footer-content">
          <div className="text-center">
            <h2 className="contact-header animate-on-scroll">Get In Touch</h2>
            <p className="contact-description animate-on-scroll">
              Have questions? Our dedicated team is ready to assist you. Connect with us for support, information, or to discuss how our platform can elevate your chama's financial journey.
            </p>
            
            <div className="contact-methods">
              <a href="mailto:support@gmail.com" className="contact-card animate-on-scroll" style={{animationDelay: '0.2s'}}>
                <div className="contact-icon pulse-animation">
                  <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="36" height="24" rx="2" fill="#ffffff" stroke="#ffffff" strokeWidth="1"/>
                    <path d="M2 8 L20 18 L38 8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 26 L14 16" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M38 26 L26 16" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="contact-title">Email Support</div>
                <div className="contact-info">support@gmail.com</div>
              </a>
              
              <a href="tel:+254700000000" className="contact-card animate-on-scroll" style={{animationDelay: '0.4s'}}>
                <div className="contact-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="2" width="20" height="28" rx="4" fill="#ffffff" stroke="#ffffff" strokeWidth="1"/>
                    <rect x="8" y="6" width="16" height="18" rx="1" fill="#10b981"/>
                    <circle cx="16" cy="26.5" r="1.5" fill="#10b981"/>
                    <rect x="13" y="3.5" width="6" height="1" rx="0.5" fill="#10b981"/>
                    <circle cx="14" cy="21" r="0.5" fill="#ffffff"/>
                    <circle cx="16" cy="21" r="0.5" fill="#ffffff"/>
                    <circle cx="18" cy="21" r="0.5" fill="#ffffff"/>
                    <circle cx="14" cy="19" r="0.5" fill="#ffffff"/>
                    <circle cx="16" cy="19" r="0.5" fill="#ffffff"/>
                    <circle cx="18" cy="19" r="0.5" fill="#ffffff"/>
                  </svg>
                </div>
                <div className="contact-title">Call Us</div>
                <div className="contact-info">+254 700 000 000</div>
              </a>
              
              <div className="contact-card animate-on-scroll" style={{animationDelay: '0.6s'}}>
                <div className="contact-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 4 L18 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M27.6 8.4 L25.1 10.9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M32 18 L28 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8.4 8.4 L10.9 10.9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 18 L8 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="18" cy="18" r="7" fill="#ffffff" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M14 25 L22 25 L21 28 L15 28 Z" fill="#ffffff"/>
                    <path d="M15 29 L21 29" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 31 L21 31" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="contact-title">Feature Requests</div>
                <div className="contact-info">Share your ideas with us</div>
              </div>
            </div>
            
            <div className="footer-bottom animate-on-scroll" style={{animationDelay: '0.8s'}}>
              <div className="footer-links">
                <button className="footer-link" style={{fontSize: '0.9rem', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer'}}>Privacy Policy</button>
                <button className="footer-link" style={{fontSize: '0.9rem', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer'}}>Terms of Service</button>
                <button className="footer-link" style={{fontSize: '0.9rem', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer'}}>Help Center</button>
                <button className="footer-link" style={{fontSize: '0.9rem', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer'}}>About Us</button>
                <button className="footer-link" style={{fontSize: '0.9rem', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer'}}>Blog</button>
              </div>
              <p className="copyright">
                &copy; 2025 FundConnect. All rights reserved. Empowering chamas across Kenya.
              </p>
            </div>
          </div>
        </div>
      </footer>

          </>
  );
};

export default LandingPage;
