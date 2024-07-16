import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from '@mui/icons-material/Delete';
import './DisplayIdeas.css';
import ideaImage from '../../../assets/event1.jpg'; // Replace with appropriate idea image
import { updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../Firebase';
import { useAuth } from '../../auth/AuthContext';
import { ThreeDots } from 'react-loader-spinner';

const DisplayIdeas = ({
  idea,
  votingEnded,
  votingStarted,
  eventId,
  removeIdea,
}) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [upvotedUserProfiles, setUpvotedUserProfiles] = useState([]);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [rsvp, setRsvp] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [winnerDisplayed, setWinnerDisplayed] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    if (idea && authUser) {
      setUpvoteCount(idea.upvote ? idea.upvote.length : 0);
      setHasUpvoted(idea.upvote && idea.upvote.includes(authUser.uid));
      setHasDownvoted(idea.downvote && idea.downvote.includes(authUser.uid));
      fetchRsvp();
      fetchUserRole();
    }
  }, [idea, authUser]);

  useEffect(() => {
    if (votingEnded && !winnerDisplayed) {
      checkIfWinner();
    }
  }, [votingEnded, winnerDisplayed, idea]);

  const fetchUpvotedUserProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const ideaDoc = await getDoc(doc(db, "events", eventId, "ideas", idea.id));
      if (!ideaDoc.exists()) {
        console.error("Idea document not found");
        setUpvotedUserProfiles([]);
        setLoadingProfiles(false);
        return;
      }
      const ideaData = ideaDoc.data();
      const upvotes = ideaData.upvote || [];
      const userProfiles = await Promise.all(upvotes.map(async userId => {
        const userDoc = await getDoc(doc(db, "user_data", userId));
        return userDoc.exists() ? userDoc.data().photoURL : null;
      }));
      const filteredUserProfiles = userProfiles.filter(profile => profile !== null);
      setUpvotedUserProfiles(filteredUserProfiles);
    } catch (error) {
      console.error('Error fetching upvoted user profiles:', error);
      setUpvotedUserProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  }, [eventId, idea.id]);

  useEffect(() => {
    if (idea && idea.upvote) {
      fetchUpvotedUserProfiles();
    }
  }, [idea?.upvote, fetchUpvotedUserProfiles]);

  const fetchRsvp = async () => {
    try {
      const rsvpDoc = await getDoc(doc(db, "ideas", idea.id, "rsvps", authUser.uid));
      if (rsvpDoc.exists()) {
        setRsvp(rsvpDoc.data().response);
      }
    } catch (error) {
      console.error("Error fetching RSVP:", error);
    }
  };

  const checkIfWinner = useCallback(async () => {
    try {
      if (!eventId || !idea.id) {
        console.error("Missing eventId or idea.id");
        return;
      }
      const winnerIdeaDoc = await getDoc(doc(db, "events", eventId, "details", "winnerIdea"));
      if (winnerIdeaDoc.exists() && winnerIdeaDoc.data().ideaId === idea.id) {
        setIsWinner(true);
        setWinnerDisplayed(true);
      }
    } catch (error) {
      console.error("Error checking winner idea:", error);
    }
  }, [eventId, idea.id]);

  const fetchUserRole = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", authUser.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoadingRole(false);
    }
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${eventId}/ideas/${idea.id}`);
  };

  const handleUpvote = async () => {
    if (idea && idea.upvote !== undefined && authUser) {
      const newUpvotes = new Set(idea.upvote || []);
      const newDownvotes = new Set(idea.downvote || []);
      if (hasUpvoted) {
        newUpvotes.delete(authUser.uid);
        setHasUpvoted(false);
      } else {
        newUpvotes.add(authUser.uid);
        setHasUpvoted(true);
        setHasDownvoted(false);
      }
      setUpvoteCount(newUpvotes.size);
      try {
        await updateDoc(doc(db, "events", eventId, "ideas", idea.id), {
          upvote: Array.from(newUpvotes),
        });
        // Fetch user profiles only once after updating upvotes
        fetchUpvotedUserProfiles();
      } catch (error) {
        console.error("Error updating upvotes:", error);
      }
    }
  };

  const handleDeleteIdea = async () => {
    try {
      await deleteDoc(doc(db, "events", eventId, "ideas", idea.id));
      setOpenDeleteDialog(false);
      removeIdea(idea.id);
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  const openDialog = () => {
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <Card className="event-card">
      {loadingRole ? (
        <div className="loader-container">
          <ThreeDots
            height={80}
            width={80}
            radius={9}
            color="#1CA8DD"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </div>
      ) : (
        <>
          <CardActionArea onClick={handleDetails}>
            <CardMedia
              component="img"
              className="event-card-media"
              image={idea.images.length > 0 ? idea.images[0] : ideaImage}
              alt={idea.title}
              title={idea.title}
            />
            <CardContent className="event-card-content">
              <Typography gutterBottom variant="h5" component="div">
                {idea.title}
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <FaCalendarAlt style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(idea.dateTime).toLocaleDateString()}
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <FaClock style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                  Time: {new Date(idea.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaMapMarkerAlt style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                  Location: {idea.location}
                </Typography>
              </div>
              <div className="upvoted-profiles-container">
                {loadingProfiles ? (
                  <div className="loader-profile-container">
                    <ThreeDots
                      height={80}
                      width={80}
                      radius={9}
                      color="#1CA8DD"
                      ariaLabel="three-dots-loading"
                      visible={true}
                    />
                  </div>
                ) : upvotedUserProfiles.length > 0 ? (
                  <>
                    {upvotedUserProfiles.slice(0, 5).map((profile, index) => (
                      <div key={index} className="profile-container">
                        <img src={profile} referrerPolicy="no-referrer" alt="User Profile" className="voting-pic" />
                      </div>
                    ))}
                    {upvotedUserProfiles.length > 5 && (
                      <div className="profile-container more-profiles">
                        + {upvotedUserProfiles.length - 5} more
                      </div>
                    )}
                  </>
                ) : (
                  <p>No users have upvoted this idea yet.</p>
                )}
              </div>
            </CardContent>
          </CardActionArea>
          {userRole === 'admin' && (
            <CardActions className="event-card-actions">
              <Button
                size="small"
                color="error"
                onClick={openDialog}
                startIcon={<DeleteIcon />}
              >
                Delete Idea
              </Button>
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
                    Are you sure you want to delete this idea? This action cannot be undone.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteIdea} color="error" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </CardActions>
          )}
          <CardActions className="event-card-actions">
            <Button
              variant="contained"
              size="small"
              color="primary"
              fullWidth
              style={{
                backgroundColor: votingEnded || !votingStarted ? '#cccccc' : '#D96758',
                color: hasUpvoted ? '#000000' : '#ffffff'
              }}
              onClick={handleUpvote}
              startIcon={<ArrowUpwardIcon />}
              disabled={votingEnded || !votingStarted}
            >
              {hasUpvoted ? 'Undo Vote' : 'Vote'}
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default DisplayIdeas;
