import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../Firebase'; // Adjust the import according to your Firebase configuration
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './NavBar.css';
import Logo from '../../assets/LogoCropped.png';

function NavBar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="relative" className="custom-NavBar">
      <Toolbar>
        {/* <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton> */}
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img
            alt="Eventiti Logo"
            src={Logo}
            width="40"
            height="40"
            className="d-inline-block align-top"
          />{' '}
          Eventiti
        </Typography>
        {user ? (
          <>
            <Button color="inherit" className="custom-logout-button" onClick={handleSignOut}>Sign Out</Button>
            <Button color="inherit" className="custom-logout-button" onClick={() => navigate('/event')}>View Events</Button>
          </>
        ) : (
          <>
            <Button color="inherit" className="custom-signup-button" onClick={() => navigate('/signup')}>Signup</Button>
            <Button color="inherit" className="custom-login-button" onClick={() => navigate('/signin')}>Login</Button>
          </>
        )}
      </Toolbar>
      {/* <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {user ? (
          <>
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            <MenuItem onClick={() => navigate('/event')}>View Events</MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => navigate('/signup')}>Signup</MenuItem>
            <MenuItem onClick={() => navigate('/signin')}>Login</MenuItem>
          </>
        )}
      </Menu> */}
    </AppBar>
  );
}

export default NavBar;
