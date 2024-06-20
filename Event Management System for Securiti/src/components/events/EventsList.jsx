import React from 'react';
import { Grid } from '@mui/material';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';



const EventsList = ({ events }) => {
  return (
    <div>
      <NavBar/>

      <div>
        <h1>Explore the best ideas!  </h1>
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
