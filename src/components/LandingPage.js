import React from "react";
import { Container, Navbar, Nav, Button, Row, Col, Image, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";

const teamMembers = [
    {
      name: "Dennis Mbuno",
      image: "/jImages/profile_placeholder.webp",
      description: "Front-end programmer"
    },
    {
      name: "Jessica Ng'ang'a",
      image: "/jImages/profile_placeholder.webp",
      description: "Back-end Programmer"
    },
    {
      name: "Catherine Mumbi",
      image: "/jImages/profile_placeholder.webp",
      description: "Web designer."
    },
    {
      name: "Precious Ndulu",
      image: "/jImages/profile_placeholder.webp",
      description: "Front-end programmer (Project Lead)"
    },
    {
      name: "Sheilla Achieng'",
      image: "/jImages/profile_placeholder.webp",
      description: "Back-end Programmer"
    },
    {
      name: "Dr. Lawrence Nderu",
      image: "/jImages/profile_placeholder.webp",
      description: "Project Investigator"
    }
  ];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="navbar-background"> {/* Wrapper div for background */}
        <Navbar bg="primary" variant="dark" expand="lg" className="px-4">
          <Navbar.Brand href="#">FundConnect</Navbar.Brand>
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
        <h1 style={{ color: "white" }}>FundConnect</h1>
        <p style={{ color: "white" }}>
          Empowering chama groups with seamless financial services and efficient contribution management.
        </p>
        {/* Updated Button to navigate to /signin */}
        <Button className="Hbutton" onClick={() => navigate('/signin')}>Get Started</Button>
      </Container>

      {/* Rest of the LandingPage code remains the same */}
      <Container id="about" className="my-5">
        <Row className="align-items-center">
          <Col md={6} className="text-center">
            <Image src="/jImages/imageFour.jpg" alt="About Us" fluid rounded />
          </Col>
          <Col md={6} className="text-center text-md-start">
            <h2 className="text-bold">About Us</h2>
            <h4 className="text-muted">Strengthening communities, one chama at a time</h4>
            <div className="t-divider my-3"></div>
            <p className="text-muted">
              We empower chamas with the tools they need to manage their finances effectively and achieve their goals.
            </p>
          </Col>
        </Row>
      </Container>

      <Container className="my-5 text-center">
        <h2>Effortless Chama Management</h2>
        <p className="text-muted">
          Simplify your chama's financial journey with our intuitive platform. Track contributions, 
          automated record-keeping, and streamline operations with ease.
        </p>
      </Container>

      <Container id="services" className="my-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <Row className="align-items-center mb-4">
          <Col md={6} className="text-center">
            <Image src="/jImages/imageTwo.jpg" alt="Real-Time Transaction Tracking" fluid rounded />
          </Col>
          <Col md={6} className="text-center text-md-start">
            <h3>Real-Time Transaction Tracking</h3>
            <p>Automatically record all contributions and payouts.</p>
          </Col>
        </Row>
        <Row className="align-items-center mb-4 flex-md-row-reverse">
          <Col md={6} className="text-center">
            <Image src=" /jImages/imageOne.jpg" alt="Automated Record Keeping" fluid rounded />
          </Col>
          <Col md={6} className="text-center text-md-start">
            <h3>Automated Record Keeping</h3>
            <p>Eliminate manual ledgers by digitally storing transaction history.</p>
          </Col>
        </Row>
        <Row className="align-items-center mb-4">
          <Col md={6} className="text-center">
            <Image src="/jImages/charts.jpg" alt="Financial Reports" fluid rounded />
          </Col>
          <Col md={6} className="text-center text-md-start">
            <h3>Financial Reports</h3>
            <p>Get insights into your chama's financial health with detailed reports and charts.</p>
          </Col>
        </Row>
      </Container>

      <Container id="features" className="my-5">
        <h2 className="text-center mb-4">Why Choose Us?</h2>
        <Row>
          <Col md={4} className="mb-4 text-center">
            <i className="bi bi-credit-card fs-2 feature-icon"></i>
            <h4>Automated Transactions</h4>
            <p>Effortlessly manage contributions and payouts with our automated system, saving you time and reducing errors.</p>
          </Col>
          <Col md={4} className="mb-4 text-center">
            <i className="bi bi-bar-chart fs-2 feature-icon"></i>
            <h4>Transparent Reporting</h4>
            <p>Gain complete visibility into your chama's finances with detailed reports and real-time updates.</p>
          </Col>
          <Col md={4} className="mb-4 text-center">
            <i className="bi bi-shield-lock fs-2 feature-icon"></i>
            <h4>Secure Platform</h4>
            <p>Rest assured that your chama's funds are safe and secure with our robust security measures.</p>
          </Col>
        </Row>
      </Container>

      <Container id="team" className="TeamSection">
  <h2 className="text-center mb-4">Meet Our Team</h2>
  <p className="text-muted text-center mb-4">Dedicated professionals behind our success.</p>
  <Row className="justify-content-center">
    {teamMembers.map((member, index) => (
      <Col key={index} md={4} sm={6} xs={12} className="d-flex justify-content-center">
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


      <Container id="contact" fluid className="my-5 text-center w-100 m-0">
        <h2>Contact Us</h2>
        <p>
          Have questions? Our dedicated team is ready to assist you. Connect with us for support, information, or to discuss how our platform can elevate your chama's financial journey.
        </p>
        <a href="mailto:support@jumuiyapay.com" className="text-white fs-3">
          <i className="bi bi-envelope-fill"></i>
        </a>
      </Container>
    </>
  );
};

export default LandingPage;


