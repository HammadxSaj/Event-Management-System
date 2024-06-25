import React, { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';
import { db, auth } from '../../Firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import './EventsList.css';
import AddEventButton from '../admin/AddEventButton';
import CountdownTimer from './CountdownTimer';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingEnded, setVotingEnded] = useState(false);
  const [votingEndDate, setVotingEndDate] = useState(new Date('2024-06-25T11:13:00'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);

        const eventPromises = eventsSnapshot.docs.map(async (docRef) => {
          const event = {
            id: docRef.id,
            title: docRef.data().title,
            date: docRef.data().dateTime,
            description: docRef.data().description,
            images: [],
            upvote: docRef.data().upvote || [],
            downvote: docRef.data().downvote || [],
          };

          const imagesCollection = collection(docRef.ref, 'images');
          const imagesSnapshot = await getDocs(imagesCollection);
          event.images = imagesSnapshot.docs.map((imageDoc) => imageDoc.data().imageUrls[0]);

          return event;
        });

        const fetchedEvents = await Promise.all(eventPromises);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchVotingEndDate = async () => {
      try {
        const votingEndDateDoc = await getDoc(doc(db, 'settings', 'votingEndDate'));
        if (votingEndDateDoc.exists()) {
          setVotingEndDate(votingEndDateDoc.data().date.toDate());
        }
      } catch (error) {
        console.error('Error fetching voting end date:', error);
      }
    };

    fetchEvents();
    fetchUserRole();
    fetchVotingEndDate();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const distance = votingEndDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining(`0d 0h 0m 0s`);
        
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate]);

  const handleDateUpdate = async (date) => {
    setVotingEndDate(date);
    setVotingEnded(false);

    try {
      await setDoc(doc(db, 'settings', 'votingEndDate'), { date });
    } catch (error) {
      console.error('Error updating voting end date:', error);
    }
  };

  return (
    <>
      <NavBar />
      {userRole === 'admin' && (
        <div style={{ float: 'right' }}>
          <DatePicker
            selected={votingEndDate}
            onChange={handleDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField label="Voting End Date" />}
          />
          <AddEventButton />
        </div>
      )}
      <div className="events-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best event ideas to choose from!</h1>
          <h2> Countdown Timer</h2>
          <CountdownTimer timeRemaining={timeRemaining} votingEnded={votingEnded} />
        </div>
        <Grid container spacing={4} justifyContent="center">
          {events.map((event) => (
            <Grid item key={event.id}>
              <DisplayCards event={event} votingEnded={votingEnded} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default EventsList;

