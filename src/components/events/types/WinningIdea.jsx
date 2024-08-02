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

const WinningIdea = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { ideaId } = useParams();
  const [idea, setIdea] = useState(null);
  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
    details: false,
    location: false,
    termsAndConditions: false,
    dateTime: false,
  });
  const [updatedIdea, setUpdatedIdea] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [editFeedbackId, setEditFeedbackId] = useState(null);
  const [editFeedbackText, setEditFeedbackText] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

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

        if (ideaDoc.exists()) {
          const ideaData = ideaDoc.data();
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

    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(
          db,
          "events",
          eventId,
          "ideas",
          ideaId,
          "feedback"
        );
        const feedbackSnapshot = await getDocs(feedbackCollection);
        const fetchedFeedback = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedback(fetchedFeedback);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchIdea();
    fetchFeedback();
  }, [eventId]);

  const handleEditToggle = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedIdea({ ...updatedIdea, [name]: value });
  };

  const handleDateTimeChange = (newDateTime) => {
    setUpdatedIdea({
      ...updatedIdea,
      dateTime: newDateTime.format("MMMM D, YYYY h:mm A"),
    });
  };

  const handleSave = async (field) => {
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

  const handleAddFeedback = async () => {
    try {
      const user = auth.currentUser;
      if (user && newFeedback.trim()) {
        const feedbackCollection = collection(
          db,
          "events",
          eventId,
          "ideas",
          ideaId,
          "feedback"
        );
        const feedbackData = {
          text: newFeedback,
          author: user.email,
          timestamp: new Date(),
          profile: user.photoURL,
        };
        const feedbackDoc = await addDoc(feedbackCollection, feedbackData);

        const formattedFeedback = {
          ...feedbackData,
          timestamp: {
            seconds: Math.floor(feedbackData.timestamp.getTime() / 1000),
            nanoseconds: feedbackData.timestamp.getMilliseconds() * 1000000,
          },
          id: feedbackDoc.id,
        };

        setFeedback([...feedback, formattedFeedback]);
        setNewFeedback("");
      }
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  const handleDeleteFeedback = async () => {
    try {
      await deleteDoc(
        doc(db, "events", eventId, "ideas", ideaId, "feedback", commentToDelete)
      );
      setFeedback(feedback.filter((fb) => fb.id !== commentToDelete));
      closeDialog();
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const handleEditFeedback = (feedbackId, currentText) => {
    setEditFeedbackId(feedbackId);
    setEditFeedbackText(currentText);
  };

  const handleSaveEditFeedback = async () => {
    try {
      const feedbackRef = doc(
        db,
        "events",
        eventId,
        "ideas",
        ideaId,
        "feedback",
        editFeedbackId
      );
      await updateDoc(feedbackRef, { text: editFeedbackText });
      setFeedback(
        feedback.map((fb) =>
          fb.id === editFeedbackId ? { ...fb, text: editFeedbackText } : fb
        )
      );
      setEditFeedbackId(null);
      setEditFeedbackText("");
    } catch (error) {
      console.error("Error editing feedback:", error);
    }
  };

  const handleCancelEditFeedback = () => {
    setEditFeedbackId(null);
    setEditFeedbackText("");
  };

  if (!idea) {
    return <p>Loading...</p>;
  }

  fetchUserRole();

  const openDialog = (feedbackId) => {
    setCommentToDelete(feedbackId);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setCommentToDelete(null);
    setOpenDeleteDialog(false);
  };

  return (

    <>

    <Card>
        <NavBar eventId={eventId} />
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
            {/* {userRole === "admin" && (
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
            )} */}
          </Box>
          <Divider style={{ margin: "1rem 0" }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" component="div" gutterBottom></Typography>

            {/* {userRole === "admin" && (
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
            )} */}
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

              {/* {userRole === "admin" && (
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
              )} */}
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
              {/* {userRole === "admin" && (
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
              )} */}
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
              alignContent={"center"}
            >
              <Typography variant="h5" component="div" gutterBottom>
                <h2>Location</h2>
              </Typography>

              {/* {userRole === "admin" && (
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
              )} */}
            </Box>
            {editMode.location ? (
              <Box display="flex" flexDirection="column">
                {/* <TextField
                  name="location"
                  value={updatedIdea.location}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: "3rem" }}
                /> */}
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
                <Paper elevation={3} className="location-container" style={{marginBottom: "2rem"}}>
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
                {/* <h2 classname="location-detail">{idea.location}</h2> */}
              </>
            )}
            <Divider style={{ margin: "1rem 0" }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" component="div" gutterBottom>
                <h2>Feedback</h2>
              </Typography>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              style={{ marginTop: "1rem" }}
            >
              {feedback.map((fb) => (
                <Paper
                  className="comment-container"
                  key={fb.id}
                  style={{
                    padding: "0.5rem 0.5rem 1rem 0.75rem",
                    marginBottom: "1rem",
                    paddingBottom: "0rem",
                    backgroundColor: "#E8F6FC",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    <Box display="flex" alignItems="center">
                      <img
                        src={fb.profile}
                        referrerPolicy="no-referrer"
                        alt="Profile"
                        className="profile-comment"
                      />
                      <Box flexGrow={1}>
                        {fb.author} -{" "}
                        {new Date(
                          fb.timestamp.seconds * 1000
                        ).toLocaleString()}
                      </Box>
                      {auth.currentUser &&
                        (auth.currentUser.email === fb.author ||
                          userRole === "admin") && (
                          <Box display="flex" justifyContent="flex-end">
                            {editFeedbackId === fb.id ? (
                              <>
                                <Button
                                  onClick={handleSaveEditFeedback}
                                  color="primary"
                                >
                                  Save
                                </Button>
                                <Button onClick={handleCancelEditFeedback}>
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                {auth.currentUser.email === fb.author && (
                                  <IconButton
                                    onClick={() =>
                                      handleEditFeedback(
                                        fb.id,
                                        fb.text
                                      )
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                )}
                                <IconButton
                                  onClick={() => openDialog(fb.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        )}
                    </Box>
                  </Typography>

                  {editFeedbackId === fb.id ? (
                    <TextField
                      value={editFeedbackText}
                      onChange={(e) => setEditFeedbackText(e.target.value)}
                      multiline
                      fullWidth
                      rows={2}
                    />
                  ) : (
                    <Typography variant="body1" gutterBottom>
                      {fb.text}
                    </Typography>
                  )}
                  {/* {auth.currentUser &&
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
                    )} */}
                </Paper>
              ))}
              {auth.currentUser && (
                <Box display="flex" flexDirection="column">
                  <TextField
                    label="Add feedback"
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    multiline
                    rows={1}
                    variant="outlined"
                    fullWidth
                    style={{
                      marginBottom: "1rem",
                      backgroundColor: "#E8F6FC",
                      width: "100%",
                    }}
                  />
                  <Button
                    onClick={handleAddFeedback}
                    variant="contained"
                    className="post-comment"
                  >
                    Post feedback
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
                    Are you sure you want to delete this feedback? This action
                    cannot be undone.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteFeedback} color="error" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
            </CardContent>
          </div>
      </Card>
      </>
            

    
          // <Divider style={{ margin: "1rem 0" }} /
          // <Box
          //   <Box
          //     display="flex"
          //     justifyContent="space-between"
          //     alignItems="center"
          //   >
          //     <Typography variant="h5" component="div" gutterBottom>
          //       Feedback
          //     </Typography>
          //   </Box>

          //   <Box
          //     display="flex"
          //     flexDirection="column"
          //     style={{ marginTop: "1rem" }}
          //   >
          //     {feedback.map((fb) => (
          //       <Paper
          //         key={fb.id}
          //         style={{ padding: "1rem", marginBottom: "1rem" }}
          //       >
          //         <Typography
          //           variant="body2"
          //           color="textSecondary"
          //           gutterBottom
          //         >
          //           {fb.author} -{" "}
          //           {new Date(fb.timestamp.seconds * 1000).toLocaleString()}
          //         </Typography>
          //         {editFeedbackId === fb.id ? (
          //           <TextField
          //             value={editFeedbackText}
          //             onChange={(e) => setEditFeedbackText(e.target.value)}
          //             multiline
          //             fullWidth
          //             rows={2}
          //           />
          //         ) : (
          //           <Typography variant="body1" gutterBottom>
          //             {fb.text}
          //           </Typography>
          //         )}
          //         {auth.currentUser &&
          //           (auth.currentUser.email === fb.author ||
          //             userRole === "admin") && (
          //             <Box display="flex" justifyContent="flex-end">
          //               {editFeedbackId === fb.id ? (
          //                 <>
          //                   <Button
          //                     onClick={handleSaveEditFeedback}
          //                     color="primary"
          //                   >
          //                     Save
          //                   </Button>
          //                   <Button onClick={handleCancelEditFeedback}>
          //                     Cancel
          //                   </Button>
          //                 </>
          //               ) : (
          //                 <>
          //                   <IconButton
          //                     onClick={() => handleEditFeedback(fb.id, fb.text)}
          //                   >
          //                     <EditIcon />
          //                   </IconButton>
          //                   <IconButton onClick={() => openDialog(fb.id)}>
          //                     <DeleteIcon />
          //                   </IconButton>
          //                 </>
          //               )}
          //             </Box>
          //           )}
          //       </Paper>
          //     ))}
          //     {auth.currentUser && (
          //       <Box display="flex" flexDirection="column">
          //         <TextField
          //           label="Add feedback"
          //           value={newFeedback}
          //           onChange={(e) => setNewFeedback(e.target.value)}
          //           multiline
          //           rows={4}
          //           variant="outlined"
          //           fullWidth
          //           style={{ marginBottom: "1rem" }}
          //         />
          //         <Button
          //           onClick={handleAddFeedback}
          //           variant="contained"
          //           color="primary"
          //         >
          //           Post Feedback
          //         </Button>
          //       </Box>
          //     )}
          //     <Dialog
          //       open={openDeleteDialog}
          //       onClose={closeDialog}
          //       aria-labelledby="alert-dialog-title"
          //       aria-describedby="alert-dialog-description"
          //     >
          //       <DialogTitle id="alert-dialog-title">
          //         {"Confirm Delete"}
          //       </DialogTitle>
          //       <DialogContent>
          //         <DialogContentText id="alert-dialog-description">
          //           Are you sure you want to delete this comment? This action
          //           cannot be undone.
          //         </DialogContentText>
          //       </DialogContent>
          //       <DialogActions>
          //         <Button onClick={closeDialog} color="primary">
          //           Cancel
          //         </Button>
          //         <Button onClick={handleDeleteFeedback} color="error" autoFocus>
          //           Delete
          //         </Button>
          //       </DialogActions>
          //     </Dialog>
          //   </Box>
          // </Box>
  );
};

export default WinningIdea;
