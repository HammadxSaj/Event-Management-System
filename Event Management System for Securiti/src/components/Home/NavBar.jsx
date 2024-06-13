import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import './NavBar.css';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate()

  return (
    <Navbar expand='lg' className='custom-NavBar' style={{paddingTop: 30}}>
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: 25}}>
          <img
            alt="../../assets/LogoCropped.png"
            src="src/assets/LogoCropped.png"
            width="40"
            height="40"
            className="d-inline-block align-top"
          />{' '}
          Eventiti
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link className='custom-signup-button' onClick={() => navigate('/signup')}>Signup</Nav.Link>
            <Nav.Link className='custom-login-button' onClick={() => navigate('/signin')}>Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
