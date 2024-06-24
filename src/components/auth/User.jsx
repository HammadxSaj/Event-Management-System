import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function User() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/event');
  };

  return (
    <Container>
      <Typography variant="h1" gutterBottom>
        User Page here!
      </Typography>
      <Button variant="contained" color="primary" onClick={handleNavigate}>
        View Events
      </Button>
    </Container>
  );
}
