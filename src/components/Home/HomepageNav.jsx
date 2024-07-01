import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './HomepageNav.css';
import Logo from '../../../src/assets/LogoBGremoved.png'

function HomepageNav() {
    const navigate = useNavigate();
    return (
        <Box className="home-page">
            <img src={Logo} alt="Logo" style={{ width: 400, height: 400, paddingTop: 0 }} />
            <Typography variant="h1">One Spot</Typography>
            <Typography variant="h2">Event Planner</Typography>
            <Typography variant="body1">Curate Unforgettable Events</Typography>
            <Box className="buttons">
                <Button
                    className="get-started"
                    sx={{ backgroundColor: '#646cff', color: 'white', padding: '1rem 1.5rem', borderRadius: '2rem', fontSize: '1rem' }}
                    onClick={() => navigate('/signup')}
                >
                    Get Started
                </Button>
                <Button
                    className="login"
                    sx={{ backgroundColor: '#646cff', color: 'white', padding: '1rem 1.5rem', borderRadius: '2rem', fontSize: '1rem' }}
                    onClick={() => navigate('/signin')}
                >
                    Login
                </Button>
            </Box>
        </Box>
    );
}

export default HomepageNav;
