import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../Firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Container, Form, Button, Card } from "react-bootstrap";
import { TextField, IconButton } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";
import "../admin/EventForm.css";
import { ThreeDots } from "react-loader-spinner";
import { alignCenter } from "fontawesome";

const EventForm = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
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

  const [descriptionCount, setDescriptionCount] = useState(0);
  const [detailsCount, setDetailsCount] = useState(0);
  const [mapPreview, setMapPreview] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [embedCodeError, setEmbedCodeError] = useState(false);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false); // Set to false initially
  const [formErrors, setFormErrors] = useState({
    title: false,
    location: false,
    dateTime: false,
    description: false,
    details: false,
    images: false,
    embedCode: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");

  const fetchUserEmails = async () => {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      return usersSnapshot.docs.map((doc) => doc.data().email);
    } catch (error) {
      console.error("Error fetching user emails:", error);
      return [];
    }
  };

  const openDialog = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

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
    if (name === "description") {
      setDescriptionCount(value.length);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        description: value.length > 250,
      }));
    }
    if (name === "details") {
      setDetailsCount(value.length);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        details: value.length > 1000,
      }));
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleDateTimeChange = (newValue) => {
    const currentDate = dayjs();
    const isValidDateTime = newValue.isAfter(currentDate);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      dateTime: !isValidDateTime,
    }));
    setFormData({ ...formData, dateTime: newValue });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const invalidFiles = files.filter(
      (file) => !validImageTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setImageError("Please upload valid image files (jpeg, jpg, png)");
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        images: true,
      }));
    } else {
      setImageError("");
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        images: false,
      }));
      setFormData({ ...formData, images: files });
    }
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
    try {
      const doc = new DOMParser().parseFromString(
        formData.embedCode,
        "text/html"
      );
      if (doc.body.children.length > 0) {
        setMapPreview(formData.embedCode);
        setEmbedCodeError(false);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          embedCode: false,
        }));
      } else {
        setEmbedCodeError(true);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          embedCode: true,
        }));
      }
    } catch (error) {
      setEmbedCodeError(true);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        embedCode: true,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Set loading to true when submission starts
      // Step 1: Add event details to Firestore (excluding images)
      const docRef = await addDoc(collection(db, "events"), {
        title: formData.title,
        // Add other event details here
      });

      // Step 2: Upload images to Firebase Storage and get their download URLs
      const imageUploadPromises = formData.images.map((image) => {
        const storageRef = ref(storage, `events/${docRef.id}/${image.name}`);
        return uploadBytes(storageRef, image).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });

      const imageUrls = await Promise.all(imageUploadPromises);

      // Step 3: Update the Firestore document with the image URLs
      await addDoc(collection(db, "events", docRef.id, "images"), {
        imageUrls: imageUrls,
      });

      // Fetch all user emails
      const userEmails = await fetchUserEmails();

      // Send email notifications
      await axios.post("http://localhost:3000/send-email", {
        to: userEmails,
        subject: "New Event Created",
        html: `<strong>${formData.title} event has been created!</strong>
              <p>You can now go ahead and vote for the idea that suits you the most.</p>`,
      });

      openDialog("Success", "The event has been added successfully");

      // Navigate to /event page after successful addition
      navigate("/event");
    } catch (error) {
      console.error("Error adding event: ", error);
      openDialog("Error", "Error adding event, please resolve all errors");
    } finally {
      setLoading(false); // Set loading to false when submission is completed
    }
  };

  return (
    <>
      <button className="back-button" onClick={() => navigate("/event")}>
        Back
      </button>
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
              <Form.Label>Title Image</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageChange}
                required
              />
              {imageError && <div className="text-danger">{imageError}</div>}
              {formErrors.images && <div className="text-danger"></div>}
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
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '38px'
              }}
            >
              {loading ? (
                <ThreeDots
                  color="#fff"
                  height={20}
                  width={20}
                  style={{
                    alignCenter: true
                  }}
                />
              ) : (
                "Add Event"
              )}
            </Button>
          </Form>
        </Card>
      </Container>
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventForm;
