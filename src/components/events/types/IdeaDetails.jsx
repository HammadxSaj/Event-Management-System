import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../../Firebase";
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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "./IdeaDetails.css";
import { useAuth } from "../../auth/AuthContext";
import NavBar from "../../Home/NavBar";

const IdeaDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { ideaId } = useParams();
  console.log(ideaId);
  const [idea, setIdea] = useState(null); // State for storing idea details
  const [userProfile, setUserProfile] = useState(null);
  const { authUser, loading } = useAuth();
  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
    details: false,
    location: false,
    termsAndConditions: false,
    dateTime: false,
  });
  const [updatedIdea, setUpdatedIdea] = useState(null); // State for updated idea data
  const [userRole, setUserRole] = useState(null); // State for user role (admin or user)
  const [comments, setComments] = useState([]); // State for storing comments
  const [newComment, setNewComment] = useState(""); // State for new comment text
  const [editCommentId, setEditCommentId] = useState(null); // State for editing comment ID
  const [editCommentText, setEditCommentText] = useState(""); // State for editing comment text
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Additional state for real-time validation
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [detailsCount, setDetailsCount] = useState(0);
  const [embedCodeError, setEmbedCodeError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: false,
    location: false,
    dateTime: false,
    description: false,
    details: false,
    embedCode: false,
  });

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

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const ideaRef = doc(db, "events", eventId, "ideas", ideaId);
        const ideaDoc = await getDoc(ideaRef);
        console.log(ideaRef);

        if (ideaDoc.exists()) {
          const ideaData = ideaDoc.data();

          // Fetch idea images (if applicable)
          const imagesCollection = collection(
            db,
            "events",
            eventId,
            "ideas",
            ideaId,
            "images"
          );
          const imagesSnapshot = await getDocs(imagesCollection);
          const images = [];
          imagesSnapshot.forEach((imageDoc) => {
            const imageUrl = imageDoc.data().imageUrls;
            if (imageUrl) {
              images.push(imageUrl[0]);
            }
          });

          setIdea({ id: ideaDoc.id, ...ideaData, images });
          setUpdatedIdea({ id: ideaDoc.id, ...ideaData, images });
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching idea:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsCollection = collection(
          db,
          "events",
          eventId,
          "ideas",
          ideaId,
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

    fetchIdea();
    fetchComments();
  }, [eventId, ideaId]);

  const handleEditToggle = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    const dayWithSuffix =
      day +
      (day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th");

    return `${dayWithSuffix} ${month} ${year}`;
  };

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
    setUpdatedIdea({ ...updatedIdea, [name]: value });
  };

  const handleDateTimeChange = (newDateTime) => {
    const currentDate = dayjs();
    const isValidDateTime = newDateTime.isAfter(currentDate);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      dateTime: !isValidDateTime,
    }));
    setUpdatedIdea({
      ...updatedIdea,
      dateTime: newDateTime.format("MMMM D, YYYY h:mm A"),
    });
  };

  const handleSave = async (field) => {
    if (Object.values(formErrors).some((error) => error)) {
      alert("Please resolve all errors before saving.");
      return;
    }

    try {
      const ideaRef = doc(db, "events", eventId, "ideas", ideaId);
      if (field === "location") {
        await updateDoc(ideaRef, {
          location: updatedIdea.location,
          embedCode: updatedIdea.embedCode,
        });
        setIdea({
          ...idea,
          location: updatedIdea.location,
          embedCode: updatedIdea.embedCode,
        });
      } else {
        await updateDoc(ideaRef, { [field]: updatedIdea[field] });
        setIdea({ ...idea, [field]: updatedIdea[field] });
      }
      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error("Error updating idea: ", error);
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
          "ideas",
          ideaId,
          "comments"
        );
        const commentData = {
          text: newComment,
          author: user.email,
          timestamp: new Date(),
          profile: user.photoURL,
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
        console.log("The photo URL is:", commentData.profile);
        setComments([...comments, formattedComment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteDoc(
        doc(db, "events", eventId, "ideas", ideaId, "comments", commentToDelete)
      );
      setComments(comments.filter((comment) => comment.id !== commentToDelete));
      closeDialog();
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
      const commentRef = doc(
        db,
        "events",
        eventId,
        "ideas",
        ideaId,
        "comments",
        editCommentId
      );
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

  if (!idea) {
    return <p>Loading...</p>;
  }

  const openDialog = (commentId) => {
    setCommentToDelete(commentId);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setCommentToDelete(null);
    setOpenDeleteDialog(false);
  };

  fetchUserRole();

  return (
    <>
      {/* <button
        className="back-button"
        onClick={() => navigate(`/event/${eventId}/ideas`)}
      >
        Back
      </button> */}

      <Card>
        <NavBar />
        <div className="description-card-content">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" component="div" gutterBottom>
              {editMode.title ? (
                <TextField
                  name="title"
                  value={updatedIdea.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: "1rem" }}
                />
              ) : (
                <h1 className="details-title">{idea.title}</h1>
              )}
            </Typography>
            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("title")}>
                  {editMode.title ? (
                    "Cancel"
                  ) : (
                    <EditIcon sx={{ color: "grey" }} />
                  )}
                </Button>
                {editMode.title && (
                  <Button onClick={() => handleSave("title")}>Save</Button>
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
            <Typography variant="h5" component="div" gutterBottom></Typography>

            {userRole === "admin" && (
              <>
                <Button onClick={() => handleEditToggle("description")}>
                  {editMode.description ? (
                    "Cancel"
                  ) : (
                    <EditIcon sx={{ color: "grey" }} />
                  )}
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
            <Box display="flex" flexDirection="column">
              <TextField
                name="description"
                value={updatedIdea.description}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                style={{
                  marginBottom: "1rem",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
                error={formErrors.description}
                helperText={`Character Count: ${descriptionCount}/250`}
              />
              {formErrors.description && (
                <Typography color="error">
                  Description exceeds 250 characters.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography
              variant="body1"
              style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >
              {idea.description}
            </Typography>
          )}

          <Divider style={{ margin: "1rem 0" }} />
        </div>

        {idea.images.length > 0 && (
          <div className="detail-image-wrapper">
            <CardMedia
              className="detail-image"
              component="img"
              height="300"
              image={idea.images[0]}
              alt={idea.title}
            />

            <div className="overlay-content">
              <div className="ribbon"></div>

              <h1 className="text-overlay">{idea.title}</h1>
            </div>
          </div>
        )}

        <div className="detail-card">
          <CardContent className="detail-card-content">
            <h2>Date & Time</h2>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {editMode.dateTime ? (
                  <DateTimePicker
                    label="Date & Time"
                    value={dayjs(updatedIdea.dateTime, "MMMM D, YYYY h:mm A")}
                    onChange={handleDateTimeChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={formErrors.dateTime}
                        helperText={
                          formErrors.dateTime &&
                          "Date and time must be in the future."
                        }
                      />
                    )}
                  />
                ) : (
                  dayjs(idea.dateTime).format("MMMM D, YYYY h:mm A")
                )}
              </Typography>

              {userRole === "admin" && (
                <>
                  <Button onClick={() => handleEditToggle("dateTime")}>
                    {editMode.dateTime ? (
                      "Cancel"
                    ) : (
                      <EditIcon sx={{ color: "grey" }} />
                    )}
                  </Button>
                  {editMode.dateTime && (
                    <Button
                      onClick={() => handleSave("dateTime")}
                      disabled={formErrors.dateTime}
                    >
                      Save
                    </Button>
                  )}
                </>
              )}
            </Box>

            <hr className="divider" />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" component="div" gutterBottom>
                <h2>Idea Details</h2>
              </Typography>
              {userRole === "admin" && (
                <>
                  <Button onClick={() => handleEditToggle("details")}>
                    {editMode.details ? (
                      "Cancel"
                    ) : (
                      <EditIcon sx={{ color: "grey" }} />
                    )}
                  </Button>
                  {editMode.details && (
                    <Button onClick={() => handleSave("details")}>Save</Button>
                  )}
                </>
              )}
            </Box>
            {editMode.details ? (
              <Box display="flex" flexDirection="column">
                <TextField
                  name="details"
                  value={updatedIdea.details}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={6}
                  style={{
                    marginBottom: "1rem",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                  error={formErrors.details}
                  helperText={`Character Count: ${detailsCount}/1000`}
                />
                {formErrors.details && (
                  <Typography color="error">
                    Details exceed 1000 characters.
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography
                variant="body1"
                style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
              >
                {idea.details}
              </Typography>
            )}
            <Divider style={{ margin: "1rem 0" }} />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" component="div" gutterBottom>
                <h2>Location</h2>
              </Typography>

              {userRole === "admin" && (
                <>
                  <Button onClick={() => handleEditToggle("location")}>
                    {editMode.location ? (
                      "Cancel"
                    ) : (
                      <EditIcon sx={{ color: "grey" }} />
                    )}
                  </Button>
                  {editMode.location && (
                    <Button
                      onClick={() => handleSave("location")}
                      disabled={formErrors.embedCode}
                    >
                      Save
                    </Button>
                  )}
                </>
              )}
            </Box>
            {editMode.location ? (
              <Box display="flex" flexDirection="column">
                <TextField
                  name="location"
                  value={updatedIdea.location}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: "1rem" }}
                />
                <TextField
                  name="embedCode"
                  value={updatedIdea.embedCode}
                  onChange={(e) => {
                    const embedCode = e.target.value;
                    const isValidEmbedCode = embedCode.startsWith("<iframe");
                    setEmbedCodeError(!isValidEmbedCode);
                    setFormErrors((prevErrors) => ({
                      ...prevErrors,
                      embedCode: !isValidEmbedCode,
                    }));
                    setUpdatedIdea({ ...updatedIdea, embedCode });
                  }}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: "1rem" }}
                  error={embedCodeError}
                  helperText={embedCodeError}
                />
                {embedCodeError && (
                  <Typography color="error">Invalid embed code.</Typography>
                )}
              </Box>
            ) : (
              <>
                <Paper elevation={3} className="location-container">
                  {idea.embedCode && (
                    <div
                      dangerouslySetInnerHTML={{ __html: idea.embedCode }}
                      className="location-iframe"
                    />
                  )}
                  <Typography
                    variant="body1"
                    style={{ marginTop: "0.5rem" }}
                  ></Typography>
                </Paper>
                <h2>{idea.location}</h2>
              </>
            )}

            <hr className="divider" />
            <Divider style={{ margin: "1rem 0" }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" component="div" gutterBottom>
                <h2>Comments</h2>
              </Typography>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              style={{ marginTop: "1rem" }}
            >
              {comments.map((comment) => (
                <Paper
                  className="comment-container"
                  key={comment.id}
                  style={{ padding: "1rem", marginBottom: "1rem" }}
                >
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    <img
                      src={comment.profile}
                      referrerPolicy="no-referrer"
                      alt="Profile"
                      className="profile-comment"
                    />
                    {comment.author} -{" "}
                    {new Date(
                      comment.timestamp.seconds * 1000
                    ).toLocaleString()}
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
                    (auth.currentUser.email === comment.author ||
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
                            {auth.currentUser.email === comment.author && (
                              <IconButton
                                onClick={() =>
                                  handleEditComment(comment.id, comment.text)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                            <IconButton onClick={() => openDialog(comment.id)}>
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
                    className="post-comment"
                  >
                    Post Comment
                  </Button>
                </Box>
              )}
              <Dialog
                open={openDeleteDialog}
                onClose={closeDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Confirm Delete"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this comment? This action
                    cannot be undone.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteComment} color="error" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </CardContent>
        </div>
      </Card>
    </>
  );
};

export default IdeaDetails;
