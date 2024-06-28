import React from 'react';
import { Container, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Homepagewhite.css';
import './HomepageNav.css';
import CreativePotentialImage from '../../assets/CreativePotential.jpg'; // Adjust the path as necessary

function HomePageWhite() {
  const navigate = useNavigate();

  return (
    <Container className="container2" sx={{ paddingBottom: 5 }}>
      <Grid container alignItems="center">
        <Grid item xs={12} md={6}>
          <div className="illustration">
            <img src={CreativePotentialImage} alt="Illustration" className="img-fluid" />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="text-center text-md-left" style={{ paddingRight: 20, paddingLeft: 20 }}>
            <Typography variant="h2" component="h2" sx={{ color: 'burlywood'}}>
              Automate your Event Management
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              Our app empowers you to unleash your ability to organize and be part of remarkable events. Whether you're planning a get-together, lunch, or a picnic, our platform provides the tools and features you need to make your events a resounding success.
            </Typography>
            <div className="buttons" style={{ marginTop: 20 }}>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: '#646cff', color: 'white' }}
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePageWhite;
