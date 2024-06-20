import React from 'react';
import { Grid } from '@mui/material';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';
import './EventsList.css'; // Import CSS file for styling

const EventsList = ({ events }) => {
  return (
    <div className="events-list-container">
      <NavBar />
      <div className="header-section">
        <h1 className="header-title">Explore the best ideas!</h1>
      </div>
      <Grid container spacing={4} justifyContent="center">
        {events.map((event, index) => (
          <Grid item key={index}>
            <DisplayCards event={event} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default EventsList;
