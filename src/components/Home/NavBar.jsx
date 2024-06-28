import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../Firebase'; // Adjust the import according to your Firebase configuration
import { onAuthStateChanged, signOut } from 'firebase/auth';

function NavBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to home page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Navbar expand='lg' className='custom-NavBar' style={{paddingTop: 0}}>
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: 25}}>
          <img
            alt="Eventiti Logo"
            src="src/assets/LogoCropped.png"
            width="40"
            height="40"
            className="d-inline-block align-top"
          />{' '}
          Eventiti
        </Navbar.Brand>
        <Navbar.Toggle aria-conssssstrols="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
              <Nav.Link className='custom-logout-button' onClick={handleSignOut}>Sign Out</Nav.Link>
              <Nav.Link className='custom-logout-button' onClick = {() => navigate('/event')}> View Events</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link className='custom-signup-button' onClick={() => navigate('/signup')}>Signup</Nav.Link>
                <Nav.Link className='custom-login-button' onClick={() => navigate('/signin')}>Login</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
