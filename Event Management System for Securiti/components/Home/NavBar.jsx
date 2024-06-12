import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import './NavBar.css';

function NavBar() {
  return (
    <Navbar className='custom-NavBar' style={{paddingTop: 20}}>
      <Container>
        <Navbar.Brand href="#home">
          <img
            alt=""
            src="/img/logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          Event Management System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#signup" className='custom-signup-button'>Signup</Nav.Link>
            <Nav.Link href="#login" className='custom-login-button'>Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
