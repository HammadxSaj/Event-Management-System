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
  const [votingEndDate, setVotingEndDate] = useState(null);
  const [winnerEvent, setWinnerEvent] = useState(null);
  const [winnerDetermined, setWinnerDetermined] = useState(false);

  // Fetch events, user role, voting end date, and winner event on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
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
          imagesSnapshot.forEach((imageDoc) => {
            const imageUrl = imageDoc.data().imageUrls;
            if (imageUrl) {
              event.images.push(imageUrl[0]);
            }
          });

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
          const fetchedDate = votingEndDateDoc.data().date.toDate();
          setVotingEndDate(fetchedDate);

          const now = new Date();
          setVotingEnded(now >= fetchedDate);

          if (now >= fetchedDate) {
            await fetchWinnerEvent(); // Ensure winner event is fetched if voting has ended
          }
        }
      } catch (error) {
        console.error('Error fetching voting end date:', error);
      }
    };

    const fetchWinnerEvent = async () => {
      try {
        const winnerEventDoc = await getDoc(doc(db, 'settings', 'winnerEvent'));
        if (winnerEventDoc.exists()) {
          const winnerEventId = winnerEventDoc.data().eventId;
          const winnerEventDocRef = doc(db, 'events', winnerEventId);
          const winnerEventDocSnapshot = await getDoc(winnerEventDocRef);

          if (winnerEventDocSnapshot.exists()) {
            const winnerEvent = {
              id: winnerEventDocSnapshot.id,
              title: winnerEventDocSnapshot.data().title,
              date: winnerEventDocSnapshot.data().dateTime,
              description: winnerEventDocSnapshot.data().description,
              images: [], // Initialize images array
              upvote: winnerEventDocSnapshot.data().upvote,
              downvote: winnerEventDocSnapshot.data().downvote,
            };

            const imagesCollection = collection(winnerEventDocRef, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            imagesSnapshot.forEach((imageDoc) => {
              const imageUrl = imageDoc.data().imageUrls;
              if (imageUrl) {
                winnerEvent.images.push(imageUrl[0]);
              }
            });

            setWinnerEvent(winnerEvent);
            setWinnerDetermined(true);
            console.log('Winner event fetched from Firebase:', winnerEvent);
          } else {
            console.log('Winner event document does not exist.');
          }
        } else {
          console.log('Winner event ID does not exist in settings.');
        }
      } catch (error) {
        console.error('Error fetching winner event from Firebase:', error);
      }
    };

    fetchEvents();
    fetchUserRole();
    fetchVotingEndDate();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (votingEndDate) {
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
          setVotingEnded(true);
          if (!winnerDetermined) {
            determineWinner();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate, winnerDetermined]);

  const handleDateUpdate = async (date) => {
    setVotingEndDate(date);
    setVotingEnded(false);

    try {
      await setDoc(doc(db, 'settings', 'votingEndDate'), { date });
    } catch (error) {
      console.error('Error updating voting end date:', error);
    }
  };

  const determineWinner = async () => {
    try {
      let winningEvent = null;
      let maxVotes = -1;

      events.forEach((event) => {
        const upvotes = event.upvote.length;
        if (upvotes > maxVotes) {
          maxVotes = upvotes;
          winningEvent = event;
        }
      });

      if (winningEvent) {
        setWinnerEvent(winningEvent);
        await storeWinnerEvent(winningEvent.id);
        setWinnerDetermined(true);
        console.log('Winner event:', winningEvent);
      }
    } catch (error) {
      console.error('Error determining winner event:', error);
    }
  };

  const storeWinnerEvent = async (eventId) => {
    try {
      await setDoc(doc(db, 'settings', 'winnerEvent'), { eventId });
      console.log('Winner event stored in Firebase:', eventId);
    } catch (error) {
      console.error('Error storing winner event in Firebase:', error);
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
          <h2>Countdown Timer</h2>
          <CountdownTimer timeRemaining={timeRemaining} votingEnded={votingEnded} />
        </div>
        {votingEnded && winnerEvent && (
          <>
          <h2>The Winner Event!</h2>
          <DisplayCards event={winnerEvent} votingEnded={votingEnded} />
          {/* <div className="winner-event-section">
            
            <h3>{`Title: ${winnerEvent.title}`}</h3>
            <p>{`Description: ${winnerEvent.description}`}</p>
            <p>{`Date: ${winnerEvent.date}`}</p>
            <div className="winner-event-images">
              {winnerEvent.images && winnerEvent.images.length > 0 ? (
                winnerEvent.images.map((image, index) => (
                  <img key={index} src={image} alt={`Event Image ${index + 1}`} className="winner-event-image" />
                ))
              ) : (
                <p>No images available for this event.</p>
              )}
            </div>
          </div> */}
          </>
        )}
        <h2>Total Events</h2>
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
