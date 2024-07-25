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
import { ThreeDots } from "react-loader-spinner";
import "../admin/IdeaForm.css";
import NavBar from "../Home/NavBar";

const IdeaForm = () => {
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
  const [rsvpQuestions, setRsvpQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false); // Set to false initially
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [formErrors, setFormErrors] = useState({
    title: false,
    location: false,
    dateTime: false,
    description: false,
    details: false,
    images: false,
    embedCode: false,
  });

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

  /* your entire previous code */

  const handleAddRsvpQuestion = () => {
    if (newQuestion.trim() !== "") {
      setRsvpQuestions([...rsvpQuestions, newQuestion]);
      setNewQuestion("");
    }
  };

  const handleDeleteRsvpQuestion = (index) => {
    setRsvpQuestions(rsvpQuestions.filter((_, i) => i !== index));
  };

  const handleEditRsvpQuestion = (index, updatedQuestion) => {
    const updatedQuestions = [...rsvpQuestions];
    updatedQuestions[index] = updatedQuestion;
    setRsvpQuestions(updatedQuestions);
  };

  /* your entire previous code */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (eventId) {
        if (Object.values(formErrors).some((error) => error)) {
          openDialog("Error", "Error adding Idea, please resolve all errors");
          return;
        }

        // Step 1: Add idea details to Firestore (excluding images)
        const docRef = await addDoc(
          collection(db, "events", eventId, "ideas"),
          {
            title: formData.title,
            location: formData.location,
            dateTime: formData.dateTime.toISOString(),
            description: formData.description,
            details: formData.details,
            embedCode: formData.embedCode,
            upvote: formData.upvote,
            downvote: formData.downvote,
            creator: formData.creator,
            rsvpQuestions: rsvpQuestions, // Add RSVP questions here
          }
        );

        // Step 2: Upload images to Firebase Storage and get their download URLs
        const imageUploadPromises = formData.images.map((image) => {
          const storageRef = ref(
            storage,
            `events/${eventId}/ideas/${docRef.id}/${image.name}`
          );
          return uploadBytes(storageRef, image).then((snapshot) =>
            getDownloadURL(snapshot.ref)
          );
        });

        const imageUrls = await Promise.all(imageUploadPromises);

        // Step 3: Update the Firestore document with the image URLs
        await addDoc(
          collection(db, "events", eventId, "ideas", docRef.id, "images"),
          {
            imageUrls: imageUrls,
          }
        );

        setIdeas([...ideas, formData]);
        setFormData({
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

        openDialog("Success", "The idea has been added successfully");

        navigate(`/event/${eventId}/ideas`);
      } else {
        console.error("eventId is undefined");
      }
    } catch (error) {
      console.error("Error adding Idea: ", error);
      openDialog("Error", "Error adding Idea, please resolve all errors");
    } finally {
      setLoading(false); // Set loading to false when submission is completed
    }
  };

  return (
    <>

    <NavBar eventId={eventId}/>
   
       

    <div className="header-section">
          <h1 className="header-title">🎉 Propose Your Next Inspiring Event!</h1>
          <h3 className='header-slogan'>Share your ideas and contribute to our dynamic office culture.</h3>
        </div>
        <div className="content-container">
        <img
          src="/src/assets/form.png" // Ensure the path is correct
          alt="Event"
          className="idea-image"
        />
      
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="p-4 shadow-lg form-card">
          <h2 className="text-idea">Idea Form</h2>
          <Form onSubmit={handleSubmit}>

            <Form.Group className="title">
            <Form.Label>Idea Title</Form.Label>
              <TextField
                fullWidth
                label="Idea Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Form.Group>
            <Form.Group className="title">
            <Form.Label>Location Name</Form.Label>
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
            <Form.Group className="title">
           
            
              <DateTimePicker
                renderInput={(props) => <TextField fullWidth {...props} />}
                label="Date and Time"
                value={formData.dateTime}
                onChange={handleDateTimeChange}
                required
              />
              {formErrors.dateTime && (
                <div className="text-danger">
                  Date and time must be in the future.
                </div>
              )}
            </Form.Group>
            <Form.Group className="title">
            <Form.Label>Idea Description</Form.Label>
              <TextField
                fullWidth
                label="Idea Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                helperText={`${descriptionCount}/250 characters`}
                inputProps={{ maxLength: 250 }}
              />
              {formErrors.description && (
                <div className="text-danger">
                  Description exceeds 250 characters.
                </div>
              )}
            </Form.Group>
            <Form.Group className="title">
            <Form.Label>Idea Details</Form.Label>
              <TextField
                fullWidth
                label="Idea Details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                multiline
                rows={5}
                variant="outlined"
                helperText={`${detailsCount}/1000 characters`}
                inputProps={{
                  maxLength: 1000,
                  className: "preserve-whitespace",
                }}
              />
              {formErrors.details && (
                <div className="text-danger">
                  Details exceed 1000 characters.
                </div>
              )}
            </Form.Group>

            <Form.Group className="title">
              <Form.Label>RSVP Questions</Form.Label>
              {rsvpQuestions.map((question, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <TextField
                    fullWidth
                    value={question}
                    onChange={(e) =>
                      handleEditRsvpQuestion(index, e.target.value)
                    }
                    variant="outlined"
                  />
                  <IconButton onClick={() => handleDeleteRsvpQuestion(index)}>
                    <CloseIcon />
                  </IconButton>
                </div>
              ))}
              <div className="d-flex align-items-center">
                <TextField
                  fullWidth
                  label="Add new question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  variant="outlined"
                />
                <Button
                  onClick={handleAddRsvpQuestion}
                  variant="contained"
                  color="primary"
                  className="ml-2"
                >
                  Add
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="title">
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
            <Form.Group className="title">
            <Form.Label>Google Maps Embed Code</Form.Label>
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
              {embedCodeError && (
                <div className="text-danger">Invalid Embed Code</div>
              )}
              {formErrors.embedCode && <div className="text-danger"></div>}
              <div
                className="map-preview mt-3"
                dangerouslySetInnerHTML={{ __html: mapPreview }}
              ></div>
            </Form.Group>
            <Button 
              variant="primary"
              type="submit"
              className="w-100"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "38px",
              }}
            >
              {loading ? (
                <ThreeDots
                  color="#fff"
                  height={20}
                  width={20}
                  style={{
                    alignCenter: true,
                  }}
                />
              ) : (
                "Add Idea"
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
      </div>
    </>
  );
};

export default IdeaForm;
