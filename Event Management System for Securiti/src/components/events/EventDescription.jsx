import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Container } from '@mui/material';

// Sample event data - replace with your actual data source or state management
const eventData = [
  {
    id: '1',
    title: 'Event 1',
    date: '2024-07-01',
    description: 'This is a detailed description of Event 1.',
    image: '/path/to/image1.jpg',
  },
  {
    id: '2',
    title: 'Event 2',
    date: '2024-07-15',
    description: 'This is a detailed description of Event 2.',
    image: '/path/to/image2.jpg',
  },
  {
    id: '3',
    title: 'Event 3',
    date: '2024-08-01',
    description: 'This is a detailed description of Event 3.',
    image: '/path/to/image3.jpg',
  },
  // Add more events as needed
];

const EventDescription = () => {
  const { eventId } = useParams();
  const event = eventData.find((e) => e.id === eventId);

  if (!event) {
    return <p>Event not found</p>;
  }

  return (
    <Container>
      <Card>
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
      </Card>
    </Container>
  );
};

export default EventDescription;
