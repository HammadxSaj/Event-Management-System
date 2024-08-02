import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
} from "@mui/material";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSleigh } from 'react-icons/fa';
import SvgBanner from "./SvgBanner";


import ideaImage from '../../../assets/event1.jpg'; // Replace with appropriate idea image
import "./DisplayWinners.css"
import { ThreeDots } from 'react-loader-spinner';

const DisplayWinner = ({
  idea,
  eventId


}) => {
    const navigate = useNavigate();


    const handleDetails = (e) => {
        e.stopPropagation();
        navigate(`/events/${eventId}/ideas/${idea.id}`);
      };
  



  return (
    <Card className="winner-event-card">

        <>
          <CardActionArea onClick={handleDetails}>
            <SvgBanner date={new Date(idea.dateTime).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <CardMedia
              component="img"
              className="winner-event-card-media"
              image={idea.images.length > 0 ? idea.images[0] : ideaImage}
              alt={idea.title}
              title={idea.title}
              
            />
             <h2 className="winner-title">{idea.title}</h2> 
            <CardContent className="winner-event-card-content">
              <Typography gutterBottom variant="h5" component="div">
                <h3 className="deets">{idea.description}</h3>
              </Typography>
              {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <FaCalendarAlt style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(idea.dateTime).toLocaleDateString()}
                </Typography>
              </div> */}
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
 
              
            </CardContent>
          </CardActionArea>


        </>
   
    </Card>
  );
};

export default DisplayWinner;