import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/event');
  };

  const handleIdeas = () => {
    navigate('/ideas');
  }

  return (
    <Container>
      <Typography variant="h1" gutterBottom>
        Admin Page here!
      </Typography>
      <Button variant="contained" color="primary" onClick={handleNavigate}>
        View Events
      </Button>
      <h1>Event Ideas:</h1>
      <Button variant="contained" color="primary" onClick={handleIdeas}>
        View Ideas
      </Button>
    
    </Container>
  );
}
