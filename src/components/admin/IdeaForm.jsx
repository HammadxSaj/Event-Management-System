import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../Firebase";

const IdeaForm = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({
    title: "",
    location: "",
    dateTime: dayjs(),
    description: "",
    details: "",
    images: [],
    embedCode: "",
    upvote: [],
    downvote: [],
    creator: "",
  
  });

  const [mapPreview, setMapPreview] = useState("");

  useEffect(() => {
    if (eventId) {
      const fetchIdeas = async () => {
        try {
          const ideasCollection = collection(db, "events", eventId, "ideas");
          const ideasSnapshot = await getDocs(ideasCollection);
          const fetchedIdeas = ideasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setIdeas(fetchedIdeas);
        } catch (error) {
          console.error("Error fetching ideas:", error);
        }
      };

      fetchIdeas();
    } else {
      console.error("eventId is undefined");
    }
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewIdea({ ...newIdea, [name]: value });
  };

  const handleDateTimeChange = (newValue) => {
    setNewIdea({ ...newIdea, dateTime: newValue });
  };

  const handleImageChange = (e) => {
    setNewIdea({ ...newIdea, images: Array.from(e.target.files) });
  };

  const removeImage = (index) => {
    setNewIdea({
      ...newIdea,
      images: newIdea.images.filter((_, i) => i !== index),
    });
  };

  const handleEmbedCodeChange = (e) => {
    setNewIdea({ ...newIdea, embedCode: e.target.value });
  };

  const handleEmbedCodeSubmit = (e) => {
    e.preventDefault();
    setMapPreview(newIdea.embedCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (eventId) {
        // Step 1: Add idea details to Firestore (excluding images)
        const docRef = await addDoc(collection(db, "events", eventId, "ideas"), {
          title: newIdea.title,
          location: newIdea.location,
          dateTime: newIdea.dateTime.toISOString(),
          description: newIdea.description,
          details: newIdea.details,
          embedCode: newIdea.embedCode,
          upvote: newIdea.upvote,
          downvote: newIdea.downvote,
          creator: newIdea.creator,
          
        });

        // Step 2: Upload images to Firebase Storage and get their download URLs
        const imageUploadPromises = newIdea.images.map((image) => {
          const storageRef = ref(storage, `events/${eventId}/ideas/${docRef.id}/${image.name}`);
          return uploadBytes(storageRef, image).then((snapshot) => getDownloadURL(snapshot.ref));
        });

        const imageUrls = await Promise.all(imageUploadPromises);

        // Step 3: Update the Firestore document with the image URLs
        await addDoc(collection(db, "events", eventId, "ideas", docRef.id, "images"), {
          imageUrls: imageUrls,
        });

        setIdeas([...ideas, newIdea]);
        setNewIdea({
          title: "",
          location: "",
          dateTime: dayjs(),
          description: "",
          details: "",
          images: [],
          embedCode: "",
          upvote: [],
          downvote: [],
          creator: "",
          date: "",
        });

        alert("Idea added successfully");
      } else {
        console.error("eventId is undefined");
      }
    } catch (error) {
      console.error("Error adding idea: ", error);
      alert("Error adding idea");
    }
  };

  return (
    <Container maxWidth="sm" className="container">
      <Button onClick={() => navigate(`/event/${eventId}/ideas`)}>Back</Button>
      <Paper className="paper">
        <Typography variant="h4" component="div" gutterBottom>
          Add Idea
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Idea Title"
            name="title"
            value={newIdea.title}
            onChange={handleChange}
            variant="outlined"
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location Name"
            name="location"
            value={newIdea.location}
            onChange={handleChange}
            variant="outlined"
            required
            margin="normal"
          />
          <DateTimePicker
            renderInput={(props) => <TextField fullWidth {...props} />}
            label="Date and Time"
            value={newIdea.dateTime}
            onChange={handleDateTimeChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Idea Description"
            name="description"
            value={newIdea.description}
            onChange={handleChange}
            multiline
            rows={3}
            variant="outlined"
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Idea Details"
            name="details"
            value={newIdea.details}
            onChange={handleChange}
            multiline
            rows={5}
            variant="outlined"
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Creator"
            name="creator"
            value={newIdea.creator}
            onChange={handleChange}
            variant="outlined"
            required
            margin="normal"
          />
  
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            required
            style={{ margin: '10px 0' }}
          />
          <div className="image-preview mt-3">
            {newIdea.images.map((image, index) => (
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
          <TextField
            fullWidth
            label="Google Maps Embed Code"
            name="embedCode"
            value={newIdea.embedCode}
            onChange={handleEmbedCodeChange}
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
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
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Add Idea
          </Button>
        </form>
      </Paper>
      <Box mt={4}>
        <Typography variant="h5" component="div" gutterBottom>
          Ideas
        </Typography>
        {ideas.map((idea) => (
          <Paper key={idea.id} className="idea-paper">
            <Typography variant="h6">{idea.title}</Typography>
            <Typography>{idea.description}</Typography>
            <Typography variant="subtitle2">By: {idea.creator}</Typography>
            <Typography variant="subtitle2">Date: {idea.date}</Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default IdeaForm;
