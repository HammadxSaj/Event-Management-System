import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DisplayIdeas from './DisplayIdeas';
import NavBar from '../../Home/NavBar';
import { db, auth } from '../../../Firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import AddIdeasButton from '../../admin/AddIdeasButton';
import { useNavigate } from 'react-router-dom';

const IdeasList = () => {
  const [ideas, setIdeas] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingEnded, setVotingEnded] = useState(false);
  const [votingEndDate, setVotingEndDate] = useState(null);
  const [winnerIdea, setWinnerIdea] = useState(null);
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const [votingStartDate, setVotingStartDate] = useState(null); // Added state for voting start date
  const [votingStarted, setVotingStarted] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasSnapshot = await getDocs(collection(db, 'ideas'));
        const ideaPromises = ideasSnapshot.docs.map(async (docRef) => {
          const idea = {
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
              idea.images.push(imageUrl[0]);
            }
          });

          return idea;
        });

        const fetchedIdeas = await Promise.all(ideaPromises);
        setIdeas(fetchedIdeas);
      } catch (error) {
        console.error('Error fetching ideas:', error);
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
            await fetchWinnerIdea(); // Ensure winner idea is fetched if voting has ended
          }
        }
      } catch (error) {
        console.error('Error fetching voting end date:', error);
      }
    };

    const fetchVotingStartDate = async () => {
      try {
        const votingStartDateDoc = await getDoc(doc(db, 'settings', 'votingStartDate'));
        if (votingStartDateDoc.exists()) {
          const fetchedDate = votingStartDateDoc.data().date.toDate();
          setVotingStartDate(fetchedDate);

          const now = new Date();
          setVotingStarted(now >= fetchedDate);
        }
      } catch (error) {
        console.error('Error fetching voting start date:', error);
      }
    };

    const fetchWinnerIdea = async () => {
      try {
        const winnerIdeaDoc = await getDoc(doc(db, 'settings', 'winnerIdea'));
        if (winnerIdeaDoc.exists()) {
          const winnerIdeaId = winnerIdeaDoc.data().ideaId;
          const winnerIdeaDocRef = doc(db, 'ideas', winnerIdeaId);
          const winnerIdeaDocSnapshot = await getDoc(winnerIdeaDocRef);

          if (winnerIdeaDocSnapshot.exists()) {
            const winnerIdea = {
              id: winnerIdeaDocSnapshot.id,
              title: winnerIdeaDocSnapshot.data().title,
              date: winnerIdeaDocSnapshot.data().dateTime,
              description: winnerIdeaDocSnapshot.data().description,
              images: [], // Initialize images array
              upvote: winnerIdeaDocSnapshot.data().upvote,
              downvote: winnerIdeaDocSnapshot.data().downvote,
            };

            const imagesCollection = collection(winnerIdeaDocRef, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            imagesSnapshot.forEach((imageDoc) => {
              const imageUrl = imageDoc.data().imageUrls;
              if (imageUrl) {
                winnerIdea.images.push(imageUrl[0]);
              }
            });

            setWinnerIdea(winnerIdea);
            setWinnerDetermined(true);
            console.log('Winner idea fetched from Firebase:', winnerIdea);
          } else {
            console.log('Winner idea document does not exist.');
          }
        } else {
          console.log('Winner idea ID does not exist in settings.');
        }
      } catch (error) {
        console.error('Error fetching winner idea from Firebase:', error);
      }
    };

    fetchIdeas();
    fetchVotingEndDate();
    fetchVotingStartDate();
  }, []);

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
          console.log("Time is over");
          setVotingEnded(true);
          determineWinner();
        } else if (!votingStarted && now >= votingStartDate) {
          setVotingStarted(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate, votingStartDate, winnerDetermined]);

  const handleDateUpdate = async (date) => {
    setVotingEndDate(date);
    setVotingEnded(false);

    try {
      await setDoc(doc(db, 'settings', 'votingEndDate'), { date });
    } catch (error) {
      console.error('Error updating voting end date:', error);
    }
  };

  const handleStartDateUpdate = async (date) => {
    setVotingStartDate(date);
    setVotingStarted(false);

    try {
      await setDoc(doc(db, 'settings', 'votingStartDate'), { date });
    } catch (error) {
      console.error('Error updating voting start date:', error);
    }
  };

  const determineWinner = async () => {
    try {
      let winningIdea = null;
      let maxVotes = -1;
      let minDownvotes = Infinity;

      ideas.forEach((idea) => {
        const upvotes = idea.upvote.length;
        const downvotes = idea.downvote.length;

        if (upvotes > maxVotes || (upvotes === maxVotes && downvotes < minDownvotes)) {
          maxVotes = upvotes;
          minDownvotes = downvotes;
          winningIdea = idea;
        }
      });

      if (winningIdea) {
        setWinnerIdea(winningIdea);
        await storeWinnerIdea(winningIdea.id);
        setWinnerDetermined(true);
        console.log('Winner idea:', winningIdea);
      }
    } catch (error) {
      console.error('Error determining winner idea:', error);
    }
  };

  const storeWinnerIdea = async (ideaId) => {
    try {
      await setDoc(doc(db, 'settings', 'winnerIdea'), { ideaId });
      console.log('Winner idea stored in Firebase:', ideaId);
    } catch (error) {
      console.error('Error storing winner idea in Firebase:', error);
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

  fetchUserRole();

  return (
    <>
      <NavBar onBack={handleBack} />
      {userRole === 'admin' && (
        <div style={{ float: 'right' }}>
          <DatePicker
            selected={votingEndDate}
            onChange={handleDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField label="Voting End Date" />}
          />
          <DatePicker
            selected={votingStartDate}
            onChange={handleStartDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField label="Voting Start Date" />}
          />
          <AddIdeasButton />
        </div>
      )}
      <div className="ideas-list-container">
        <div className="header-section">
          <Typography variant="h1" className="header-title">
            Explore the best ideas to choose from!
          </Typography>
          {votingStarted && (
            <div>
              <Typography variant="h2">Countdown Timer</Typography>
              <Typography>{timeRemaining}</Typography>
            </div>
          )}
          {!votingStarted && votingStartDate && (
            <Typography variant="h2">{`Voting Starts on ${votingStartDate.getDate()} ${votingStartDate.toLocaleString('default', { month: 'long' })} ${votingStartDate.getFullYear()} at ${votingStartDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}!`}</Typography>
          )}
        </div>
        {votingEnded && winnerIdea && (
          <div className="winner-idea-section">
            <Typography variant="h2">The Winner Idea!</Typography>
            <DisplayIdeas idea={winnerIdea} votingEnded={votingEnded} winningIdeaprop={true} votingStarted={votingStarted} />
          </div>
        )}
        <Typography variant="h2">The Ideas</Typography>
        <Grid container spacing={4} justifyContent="center">
          {ideas.map((idea) => (
            <Grid item key={idea.id}>
              <DisplayIdeas idea={idea} votingEnded={votingEnded} winningIdeaprop={false} votingStarted={votingStarted} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default IdeasList;
