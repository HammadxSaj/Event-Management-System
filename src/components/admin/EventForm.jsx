// src/components/EventForm.js
import React, { useState } from 'react';
import { db, storage } from '../../Firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { TextField, IconButton } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import '../admin/EventForm.css';
import { useNavigate } from 'react-router-dom';


const EventForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    dateTime: dayjs(),
    description: '',
    details: '',
    images: [],
    embedCode: '',
    upvote: [],
    downvote: [],
  });

  const [mapPreview, setMapPreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateTimeChange = (newValue) => {
    setFormData({ ...formaData, dateTime: newValue });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleEmbedCodeChange = (e) => {
    setFormData({ ...formData, embedCode: e.target.value });
  };

  const handleEmbedCodeSubmit = (e) => {
    e.preventDefault();
    setMapPreview(formData.embedCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Add event details to Firestore (excluding images)
      const docRef = await addDoc(collection(db, 'events'), {
        title: formData.title,
        location: formData.location,
        dateTime: formData.dateTime.toISOString(),
        description: formData.description,
        details: formData.details,
        embedCode: formData.embedCode,
        upvote: [],
        downvote :[]
      });

      // Step 2: Upload images to Firebase Storage and get their download URLs
      const imageUploadPromises = formData.images.map((image) => {
        const storageRef = ref(storage, `events/${docRef.id}/${image.name}`);
        return uploadBytes(storageRef, image).then((snapshot) => getDownloadURL(snapshot.ref));
      });

      const imageUrls = await Promise.all(imageUploadPromises);

      // Step 3: Update the Firestore document with the image URLs
      await addDoc(collection(db, 'events', docRef.id, 'images'), {
        imageUrls: imageUrls,
      });

      alert('Event added successfully');
    } catch (error) {
      console.error('Error adding event: ', error);
      alert('Error adding event');
    }
  };

  return (
    <>
      <button className='back-button' onClick={() => navigate('/event')}>Back</button>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="p-4 shadow-lg form-card">
          <h2 className="text-center mb-4">Add Event</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <TextField
                fullWidth
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <TextField
                fullWidth
                label="Location Name"
                name="location"
                value={formData.location}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <DateTimePicker
                renderInput={(props) => <TextField fullWidth {...props} />}
                label="Date and Time"
                value={formData.dateTime}
                onChange={handleDateTimeChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <TextField
                fullWidth
                label="Event Description (Reason to host event)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <TextField
                fullWidth
                label="Event Details (Menu, Timeline, etc)"
                name="details"
                value={formData.details}
                onChange={handleChange}
                multiline
                rows={5}
                variant="outlined"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title Image</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageChange}
                required
              />
              <div className="image-preview mt-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-container">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`preview ${index}`}
                      className="image-preview-item"
                    />
                    <IconButton
                      className="image-remove-button"
                      onClick={() => removeImage(index)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <TextField
                fullWidth
                label="Google Maps Embed Code"
                name="embedCode"
                value={formData.embedCode}
                onChange={handleEmbedCodeChange}
                multiline
                rows={3}
                variant="outlined"
              />
              <Button
                variant="secondary"
                onClick={handleEmbedCodeSubmit}
                className="w-100 mt-2"
              >
                Preview Map
              </Button>
              <div
                className="map-preview mt-3"
                dangerouslySetInnerHTML={{ __html: mapPreview }}
              ></div>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add Event
            </Button>
          </Form>
        </Card>
      </Container>
    </>
  );
};

export default EventForm;
