import React, { useState } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import ArrowCircleLeftSharpIcon from '@mui/icons-material/ArrowCircleLeftSharp';
import ArrowCircleRightSharpIcon from '@mui/icons-material/ArrowCircleRightSharp';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import FeatureCard from './FeatureCard';
import './HomepageCards.css';


const features = [
  {
    title: "Event Creation Made Easy",
    description: "Create events with ease using our intuitive event creation tool. Customize event details, set up voting, and publish your event in minutes.",
    icon: "👥"
  },
  {
    title: "Easy Attendee Management",
    description: "Keep track of attendees with our comprehensive attendee management feature. Easily view and manage RSVPs, track attendance, and collect essential participant information.",
    icon: "👥",
  },
  {
    title: "Find Complete Detail",
    description: "Our platform provides a detailed description of the event, including the date, time, location, and other essential details. Attendees can easily access this information and stay informed about the event.",
    icon: "📝",
    },
];

function HomepageCards() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? features.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === features.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <Container style={{ paddingTop: 100, backgroundColor: '#123456', paddingBottom: 100, maxWidth: 1700, textAlign: 'center' }}>
      <Box sx={{ marginBottom: 4, color: "white" }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Seamless Event Planning and Organization
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton onClick={handlePrev} sx={{ zIndex: 1 }}>
          <ArrowCircleLeftSharpIcon fontSize="large" style={{ color: 'white' }} />
        </IconButton>
        <Box sx={{ width: 600, position: 'relative', overflow: 'hidden', margin: '0 20px' }}>
          <TransitionGroup>
            <CSSTransition key={currentIndex} timeout={300} classNames="fade">
              <FeatureCard feature={features[currentIndex]} />
            </CSSTransition>
          </TransitionGroup>
        </Box>
        <IconButton onClick={handleNext} sx={{ zIndex: 1 }}>
          <ArrowCircleRightSharpIcon fontSize="large" style={{ color: 'white' }} />
        </IconButton>
      </Box>
    </Container>
  );
}

export default HomepageCards;