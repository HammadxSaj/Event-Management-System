import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';

const DisplayCards = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <Card sx={{ maxWidth: 345, margin: 2 }} onClick={handleClick}>
      <CardActionArea>
        <CardMedia component="img" height="140" image={event.image} alt={event.title} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.date}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DisplayCards;
