import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../Firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import dayjs from 'dayjs';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          

          // Fetch event images
          const imagesCollection = collection(eventRef, 'images');
          const imagesSnapshot = await getDocs(imagesCollection);
          const images = [];
          imagesSnapshot.forEach((imageDoc) => {
            const imageUrl = imageDoc.data().imageUrls;
            if (imageUrl) {
              images.push(imageUrl[0]);
            }
          });

          setEvent({ id: eventDoc.id, ...eventData, images });
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (!event) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxWidth="md" className="container">
      <Card>
        {event.images.length > 0 && (
          <CardMedia
            component="img"
            height="300"
            image={event.images[0]}
            alt={event.title}
          />
        )}
        <CardContent className="card-content">
          <Typography variant="h4" component="div" gutterBottom>
            {event.title}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {dayjs(event.dateTime).format('MMMM D, YYYY h:mm A')}
          </Typography>
          <Divider style={{ margin: '1rem 0' }} />

          <Typography variant="h5" component="div" gutterBottom>
            Event Description
          </Typography>
          <Typography variant="body1" paragraph>
            {event.description}
          </Typography>

          <Divider style={{ margin: '1rem 0' }} />

          <Typography variant="h5" component="div" gutterBottom>
            Event Details
          </Typography>
          <Typography variant="body1" paragraph>
            {event.details}
          </Typography>

          <Divider style={{ margin: '1rem 0' }} />

          <Typography variant="h5" component="div" gutterBottom>
            Location
          </Typography>
          <Paper elevation={3} className="location-container">
            {event.embedCode && (
              <div
                dangerouslySetInnerHTML={{ __html: event.embedCode }}
                className="location-iframe"
              />
            )}
            <Typography variant="body1" style={{ marginTop: '0.5rem' }}>
              {event.location}
            </Typography>
          </Paper>

          <Divider style={{ margin: '1rem 0' }} />

          <Typography variant="h5" component="div" gutterBottom>
            Terms and Conditions
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {event.termsAndConditions}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EventDetails;
