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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "../EventDetails.css";

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

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const ideaRef = doc(db, "events", eventId, "ideas", ideaId);
                const ideaDoc = await getDoc(ideaRef);

                if (ideaDoc.exists()) {
                    const ideaData = ideaDoc.data();
                    const imagesCollection = collection(db, "events", eventId, "ideas", ideaId, "images");
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

        const fetchFeedback = async () => {
            try {
                const feedbackCollection = collection(db, "events", eventId, "ideas", ideaId, "feedback");
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
        fetchUserRole();
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
                const feedbackCollection = collection(db, "events", eventId, "ideas", ideaId, "feedback");
                const feedbackData = {
                    text: newFeedback,
                    author: user.uid,
                    timestamp: new Date(),
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

    const handleDeleteFeedback = async (feedbackId) => {
        try {
            await deleteDoc(doc(db, "events", eventId, "ideas", ideaId, "feedback", feedbackId));
            setFeedback(feedback.filter((fb) => fb.id !== feedbackId));
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
            const feedbackRef = doc(db, "events", eventId, "ideas", ideaId, "feedback", editFeedbackId);
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


    return (
        <Container maxWidth="md" className="container">
            <button className="back-button" onClick={() => navigate(`/event`)}>
                Back
            </button>
            <Card>
                {idea.images.length > 0 && (
                    <CardMedia
                        component="img"
                        height="300"
                        image={idea.images[0]}
                        alt={idea.title}
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
                                    value={updatedIdea.title}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    style={{ marginBottom: "1rem" }}
                                />
                            ) : (
                                idea.title
                            )}
                        </Typography>
                        {/* {userRole === "admin" && (
                            <>
                                <Button onClick={() => handleEditToggle("title")}>
                                    {editMode.title ? "Cancel" : "Edit"}
                                </Button>
                                {editMode.title && (
                                    <Button onClick={() => handleSave("title")}>Save</Button>
                                )}
                            </>
                        )} */}
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            {editMode.dateTime ? (
                                <DateTimePicker
                                    value={dayjs(updatedIdea.dateTime)}
                                    onChange={handleDateTimeChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            ) : (
                                dayjs(idea.dateTime).format("MMMM D, YYYY h:mm A")
                            )}
                        </Typography>
                        {/* {userRole === "admin" && (
                            <>
                                <Button onClick={() => handleEditToggle("dateTime")}>
                                    {editMode.dateTime ? "Cancel" : "Edit"}
                                </Button>
                                {editMode.dateTime && (
                                    <Button onClick={() => handleSave("dateTime")}>Save</Button>
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
                        <Typography variant="h5" component="div" gutterBottom>
                            Idea Description
                        </Typography>
                        {/* {userRole === "admin" && (
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
                        )} */}
                    </Box>
                    {editMode.description ? (
                        <TextField
                            name="description"
                            value={updatedIdea.description}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            style={{ marginBottom: "1rem" }}
                        />
                    ) : (
                        <Typography variant="body1" paragraph>
                            {idea.description}
                        </Typography>
                    )}
                    <Divider style={{ margin: "1rem 0" }} />

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h5" component="div" gutterBottom>
                            Idea Details
                        </Typography>
                        {/* {userRole === "admin" && (
                            <>
                                <Button onClick={() => handleEditToggle("details")}>
                                    {editMode.details ? "Cancel" : "Edit"}
                                </Button>
                                {editMode.details && (
                                    <Button onClick={() => handleSave("details")}>Save</Button>
                                )}
                            </>
                        )} */}
                    </Box>
                    {editMode.details ? (
                        <TextField
                            name="details"
                            value={updatedIdea.details}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={5}
                            style={{ marginBottom: "1rem" }}
                        />
                    ) : (
                        <Typography variant="body1" paragraph>
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
                            Location
                        </Typography>
                        {/* {userRole === "admin" && (
                            <>
                                <Button onClick={() => handleEditToggle("location")}>
                                    {editMode.location ? "Cancel" : "Edit"}
                                </Button>
                                {editMode.location && (
                                    <Button onClick={() => handleSave("location")}>Save</Button>
                                )}
                            </>
                        )} */}
                    </Box>
                    {editMode.location ? (
                        <>
                            <div>
                                <TextField
                                    name="embedCode"
                                    value={updatedIdea.embedCode}
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
                                    value={updatedIdea.location}
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
                            {idea.embedCode && (
                                <div
                                    dangerouslySetInnerHTML={{ __html: idea.embedCode }}
                                    className="location-iframe"
                                />
                            )}
                            <Typography variant="body1" style={{ marginTop: "0.5rem" }}>
                                {idea.location}
                            </Typography>
                        </Paper>
                    )}
                    <Divider style={{ margin: "1rem 0" }} />
                    <Box>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h5" component="div" gutterBottom>
                                Feedback
                            </Typography>
                        </Box>

                        <Box
                            display="flex"
                            flexDirection="column"
                            style={{ marginTop: "1rem" }}
                        >
                            {feedback.map((fb) => (
                                <Paper
                                    key={fb.id}
                                    style={{ padding: "1rem", marginBottom: "1rem" }}
                                >
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {fb.author} -{" "}
                                        {new Date(fb.timestamp.seconds * 1000).toLocaleString()}
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
                                    {auth.currentUser &&
                                        (auth.currentUser.uid === fb.author ||
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
                                                        <IconButton
                                                            onClick={() =>
                                                                handleEditFeedback(fb.id, fb.text)
                                                            }
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteFeedback(fb.id)}
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
                                        label="Add feedback"
                                        value={newFeedback}
                                        onChange={(e) => setNewFeedback(e.target.value)}
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: "1rem" }}
                                    />
                                    <Button
                                        onClick={handleAddFeedback}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Post Feedback
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default WinningIdea;
