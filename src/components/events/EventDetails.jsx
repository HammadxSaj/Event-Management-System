import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../Firebase';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';
import './EventDetails.css';
import { useNavigate } from 'react-router-dom';

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
    details: false,
    location: false,
    termsAndConditions: false,
  });
  const [updatedEvent, setUpdatedEvent] = useState(null);

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
          setUpdatedEvent({ id: eventDoc.id, ...eventData, images });
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleEditToggle = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };

  const handleSave = async (field) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, { [field]: updatedEvent[field] });
      setEvent({ ...event, [field]: updatedEvent[field] });
      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error('Error updating event: ', error);
    }
  };

  if (!event) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxWidth="md" className="container">
      <button className='back-button' onClick={()=>navigate('/event')}>Back</button>
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="div" gutterBottom>
              {editMode.title ? (
                <TextField
                  name="title"
                  value={updatedEvent.title}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                event.title
              )}
            </Typography>
            <Button onClick={() => handleEditToggle('title')}>
              {editMode.title ? 'Cancel' : 'Edit'}
            </Button>
            {editMode.title && (
              <Button onClick={() => handleSave('title')}>Save</Button>
            )}
          </Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {dayjs(event.dateTime).format('MMMM D, YYYY h:mm A')}
          </Typography>
          <Divider style={{ margin: '1rem 0' }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" gutterBottom>
              Event Description
            </Typography>
            <Button onClick={() => handleEditToggle('description')}>
              {editMode.description ? 'Cancel' : 'Edit'}
            </Button>
            {editMode.description && (
              <Button onClick={() => handleSave('description')}>Save</Button>
            )}
          </Box>
          {editMode.description ? (
            <TextField
              name="description"
              value={updatedEvent.description}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
            />
          ) : (
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
          )}
          <Divider style={{ margin: '1rem 0' }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" gutterBottom>
              Event Details
            </Typography>
            <Button onClick={() => handleEditToggle('details')}>
              {editMode.details ? 'Cancel' : 'Edit'}
            </Button>
            {editMode.details && (
              <Button onClick={() => handleSave('details')}>Save</Button>
            )}
          </Box>
          {editMode.details ? (
            <TextField
              name="details"
              value={updatedEvent.details}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={5}
            />
          ) : (
            <Typography variant="body1" paragraph>
              {event.details}
            </Typography>
          )}
          <Divider style={{ margin: '1rem 0' }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" gutterBottom>
              Location
            </Typography>
            <Button onClick={() => handleEditToggle('location')}>
              {editMode.location ? 'Cancel' : 'Edit'}
            </Button>
            {editMode.location && (
              <Button onClick={() => handleSave('location')}>Save</Button>
            )}
          </Box>
          {editMode.location ? (
            <TextField
              name="location"
              value={updatedEvent.location}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
            />
          ) : (
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
          )}
          <Divider style={{ margin: '1rem 0' }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" gutterBottom>
              Terms and Conditions
            </Typography>
            <Button onClick={() => handleEditToggle('termsAndConditions')}>
              {editMode.termsAndConditions ? 'Cancel' : 'Edit'}
            </Button>
            {editMode.termsAndConditions && (
              <Button onClick={() => handleSave('termsAndConditions')}>Save</Button>
            )}
          </Box>
          {editMode.termsAndConditions ? (
            <TextField
              name="termsAndConditions"
              value={updatedEvent.termsAndConditions}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={5}
            />
          ) : (
            <Typography variant="body2" color="textSecondary" paragraph>
              {event.termsAndConditions}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EventDetails;
