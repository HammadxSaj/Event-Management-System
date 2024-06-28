import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../Firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
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
  IconButton,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "./EventDetails.css";

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
    dateTime: false,
  });
  const [updatedEvent, setUpdatedEvent] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventRef);
        
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();

          // Fetch event images
          const imagesCollection = collection(eventRef, "images");
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
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsCollection = collection(
          db,
          "events",
          eventId,
          "comments"
        );
        const commentsSnapshot = await getDocs(commentsCollection);
        const fetchedComments = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchEvent();
    fetchUserRole();
    fetchComments();
  }, [eventId]);

  const handleEditToggle = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };

  const handleDateTimeChange = (newDateTime) => {
    setUpdatedEvent({
      ...updatedEvent,
      dateTime: newDateTime.format("MMMM D, YYYY h:mm A"),
    });
  };

  const handleSave = async (field) => {
    try {
      const eventRef = doc(db, "events", eventId);
      if (field === "location") {
        await updateDoc(eventRef, {
          location: updatedEvent.location,
          embedCode: updatedEvent.embedCode,
        });
        setEvent({
          ...event,
          location: updatedEvent.location,
          embedCode: updatedEvent.embedCode,
        });
      } else {
        await updateDoc(eventRef, { [field]: updatedEvent[field] });
        setEvent({ ...event, [field]: updatedEvent[field] });
      }
      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error("Error updating event: ", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const user = auth.currentUser;
      if (user && newComment.trim()) {
        const commentsCollection = collection(
          db,
          "events",
          eventId,
          "comments"
        );
        const commentData = {
          text: newComment,
          author: user.uid,
          timestamp: new Date(),
        };
        const commentDoc = await addDoc(commentsCollection, commentData);

        // Format the timestamp correctly for immediate display
        const formattedComment = {
          ...commentData,
          timestamp: {
            seconds: Math.floor(commentData.timestamp.getTime() / 1000),
            nanoseconds: commentData.timestamp.getMilliseconds() * 1000000,
          },
          id: commentDoc.id,
        };

        // Add the new comment with the generated ID to the comments state
        setComments([...comments, formattedComment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "events", eventId, "comments", commentId));
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleSaveEditComment = async () => {
    try {
      const commentRef = doc(db, "events", eventId, "comments", editCommentId);
      await updateDoc(commentRef, { text: editCommentText });
      setComments(
        comments.map((comment) =>
          comment.id === editCommentId
            ? { ...comment, text: editCommentText }
            : comment
        )
      );
      setEditCommentId(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleCancelEditComment = () => {
    setEditCommentId(null);
    setEditCommentText("");
  };

  if (!event) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxWidth="md" className="container">
      <button className="back-button" onClick={() => navigate("/event")}>
        Back
      </button>
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" component="div" gutterBottom>
              {editMode.title ? (
                <TextField
                  name="title"
                  value={updatedEvent.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: "1rem" }}
                />
              ) : (
                event.title
              )}
            </Typography>
            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("title")}>
                  {editMode.title ? "Cancel" : "Edit"}
                </Button>
                {editMode.title && (
                  <Button onClick={() => handleSave("title")}>Save</Button>
                )}
              </>
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {editMode.dateTime ? (
                <DateTimePicker
                  value={dayjs(updatedEvent.dateTime)}
                  onChange={handleDateTimeChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              ) : (
                dayjs(event.dateTime).format("MMMM D, YYYY h:mm A")
              )}
            </Typography>
            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("dateTime")}>
                  {editMode.dateTime ? "Cancel" : "Edit"}
                </Button>
                {editMode.dateTime && (
                  <Button onClick={() => handleSave("dateTime")}>Save</Button>
                )}
              </>
            )}
          </Box>
          <Divider style={{ margin: "1rem 0" }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" component="div" gutterBottom>
              Event Description
            </Typography>
            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("description")}>
                  {editMode.description ? "Cancel" : "Edit"}
                </Button>
                {editMode.description && (
                  <Button onClick={() => handleSave("description")}>
                    Save
                  </Button>
                )}
              </>
            )}
          </Box>
          {editMode.description ? (
            <TextField
              name="description"
              value={updatedEvent.description}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              style={{ marginBottom: "1rem" }}
            />
          ) : (
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
          )}
          <Divider style={{ margin: "1rem 0" }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" component="div" gutterBottom>
              Event Details
            </Typography>
            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("details")}>
                  {editMode.details ? "Cancel" : "Edit"}
                </Button>
                {editMode.details && (
                  <Button onClick={() => handleSave("details")}>Save</Button>
                )}
              </>
            )}
          </Box>
          {editMode.details ? (
            <TextField
              name="details"
              value={updatedEvent.details}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              multiline
              rows={5}
              style={{ marginBottom: "1rem" }}
            />
          ) : (
            <Typography variant="body1" paragraph>
              {event.details}
            </Typography>
          )}
          <Divider style={{ margin: "1rem 0" }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" component="div" gutterBottom>
              Location
            </Typography>
            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("location")}>
                  {editMode.location ? "Cancel" : "Edit"}
                </Button>
                {editMode.location && (
                  <Button onClick={() => handleSave("location")}>Save</Button>
                )}
              </>
            )}
          </Box>
          {editMode.location ? (
            <>
              <div>
                <TextField
                  name="embedCode"
                  value={updatedEvent.embedCode}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Embed Code"
                  style={{ marginBottom: "1rem" }}
                />
              </div>
              <div>
                <TextField
                  name="location"
                  value={updatedEvent.location}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  style={{ marginBottom: "1rem" }}
                />
              </div>
            </>
          ) : (
            <Paper elevation={3} className="location-container">
              {event.embedCode && (
                <div
                  dangerouslySetInnerHTML={{ __html: event.embedCode }}
                  className="location-iframe"
                />
              )}
              <Typography variant="body1" style={{ marginTop: "0.5rem" }}>
                {event.location}
              </Typography>
            </Paper>
          )}
          <Divider style={{ margin: "1rem 0" }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" component="div" gutterBottom>
              Comments
            </Typography>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            style={{ marginTop: "1rem" }}
          >
            {comments.map((comment) => (
              <Paper
                key={comment.id}
                style={{ padding: "1rem", marginBottom: "1rem" }}
              >
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {comment.author} -{" "}
                  {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
                </Typography>
                {editCommentId === comment.id ? (
                  <TextField
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    multiline
                    fullWidth
                    rows={2}
                  />
                ) : (
                  <Typography variant="body1" gutterBottom>
                    {comment.text}
                  </Typography>
                )}
                {auth.currentUser &&
                  (auth.currentUser.uid === comment.author ||
                    userRole === "admin") && (
                    <Box display="flex" justifyContent="flex-end">
                      {editCommentId === comment.id ? (
                        <>
                          <Button
                            onClick={handleSaveEditComment}
                            color="primary"
                          >
                            Save
                          </Button>
                          <Button onClick={handleCancelEditComment}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            onClick={() =>
                              handleEditComment(comment.id, comment.text)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  )}
              </Paper>
            ))}
            {auth.currentUser && (
              <Box display="flex" flexDirection="column">
                <TextField
                  label="Add a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: "1rem" }}
                />
                <Button
                  onClick={handleAddComment}
                  variant="contained"
                  color="primary"
                >
                  Post Comment
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EventDetails;
