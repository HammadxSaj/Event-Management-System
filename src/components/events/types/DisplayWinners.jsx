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
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSleigh } from 'react-icons/fa';
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from '@mui/icons-material/Delete';
import './DisplayWinner.css';
import ideaImage from '../../../assets/event1.jpg'; // Replace with appropriate idea image
import { useAuth } from '../../auth/AuthContext';
import { ThreeDots } from 'react-loader-spinner';

const DisplayWinner = ({
  idea,


}) => {
  


  return (
    <Card className={userRole === 'admin' ? 'idea-card' : 'idea-user-card'}>
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

export default DisplayWinner;