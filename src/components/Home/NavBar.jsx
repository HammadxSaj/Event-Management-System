import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../Firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './NavBar.css';
import Logo from '../../assets/Logo.png';
import { useAuth } from '../auth/AuthContext';
import securiti2 from '../../assets/securiti2.png';
import { Link, Element, animateScroll as scroll, scroller } from 'react-scroll';

function NavBar({eventId, ideaId = ""}) {
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser && authUser.uid) {
        console.log('Fetching user profile for UID:', authUser.uid);
        const userDoc = await getDoc(doc(db, 'user_data', authUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          console.log('User profile data:', userData);
          console.log('Profile photo URL:', userData.photoURL);
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserProfile();
    fetchUserRole();

  }, [authUser]);

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to home page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleScroll = (target) => {
    scroller.scrollTo(target, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleImageError = (e) => {
    console.error('Error loading profile image:', e);
    console.log('Failed image URL:', e.target.src);
    if (retryCount < 3) { // Retry up to 3 times
      setRetryCount(retryCount + 1);
      e.target.src = userProfile.photoURL + `?retry=${retryCount}`; // Append a query parameter to force reload
    } else {
      e.target.onerror = null; 
      e.target.src = 'https://via.placeholder.com/40'; // Placeholder image URL
    }
  };

  if (loading) {
    console.log('Loading...');
    return null; // Or a loading spinner
  }

  const renderNavButtons = () => {
    switch (location.pathname) {
      case '/events':
        return (
          <>
           {userRole === "admin" && (
            <Button color="inherit" className="custom-event-button" onClick={() => navigate('/eventform')}>Add Event +</Button>)}
            <Button color="inherit" className="custom-event-button" onClick={() => handleScroll('pastEvents')}>Past Events</Button>
            <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button>
          </>
        );
   


      case '/eventform':
        return (
          <>
           {userRole === "admin" && (
            <Button color="inherit" className="custom-event-button" onClick={() => navigate('/events')}>View Events</Button>)}
            <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button>
          </>
        );

      case `/events/${eventId}/ideas/${ideaId}/analytics`:
        return (
          <>
             <Button color="inherit" className="custom-event-button" onClick={() => navigate(`/events/${eventId}/ideas`)}>View Ideas</Button>
             <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button>
          </>
        );
      case `/events/${eventId}/ideas/winningIdea/${ideaId}`:
        return (
          <>
             <Button color="inherit" className="custom-event-button" onClick={() => navigate(`/events`)}>View Events</Button>
             <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button>
          </>
        );

      case `/events/${eventId}/ideas/${ideaId}`:
        return (
          <>
             <Button color="inherit" className="custom-event-button" onClick={() => navigate(`/events`)}>View Events</Button>
             <Button color="inherit" className="custom-event-button" onClick={() => navigate(`/events/${eventId}/ideas`)}>View Ideas</Button>
             <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button>
          </>
        );

      default:
        return (
          <>
             <Button color="inherit" className="custom-event-button" onClick={() => navigate('/events')}>View Events</Button>
             <Button color="inherit" className="custom-event-button" onClick={() => navigate(`/events/${eventId}/ideas`)}>View Ideas</Button>
             {userRole === "admin" && !location.pathname.includes("rsvp") && (
             <Button color="inherit" className="custom-event-button" onClick={() => navigate(`/events/${eventId}/ideaform`)}> Add Idea + </Button>)}
             <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button>
          </>
        );
    }
  };


  return (
    <AppBar position="relative" className="custom-NavBar">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, marginTop: 1}}>
          <img
            alt="Eventiti Logo"
            src={Logo}
            width="45"
            height="45"
            className="d-inline-block align-top"
            style={{ flexGrow: 1, cursor: 'pointer'}}
            onClick={() => {navigate('/events')}}
          />{' '}
          <img src={securiti2} width="200"
            height="50" className="d-inline-block align-top" alt="Securiti" />
          {/* <Button color="inherit" className="custom-event-button" onClick={() => { handleSignOut(); navigate('/');}}>Sign Out</Button> */}

        </Typography>
        <div>
          {renderNavButtons()};    
        </div>
        {userProfile ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL} 
                referrerPolicy="no-referrer"
                alt="Profile"
                className="profile-pic"
                style={{ borderRadius: '50%', marginLeft: '10px', width: '40px', height: '40px' }}
                onError={handleImageError}
              />
            ) : (
              <Typography variant="body1" color="inherit" style={{ marginLeft: '10px' }}>Profile</Typography>
            )}
          </div>
        ) : (
          <Button color="inherit" className="custom-login-button" onClick={() => navigate('/login')}>Sign In</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
