import React, { useState, useEffect } from "react";
import { Grid, TextField } from '@mui/material';
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../../Firebase";
import { collection, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddIdeasButton from "../../admin/AddIdeasButton";
import NavBar from "../../Home/NavBar";
import DisplayIdeas from "./DisplayIdeas";
import CountdownTimer from "../CountdownTimer";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { Timestamp } from "firebase/firestore";

const IdeasPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingEnded, setVotingEnded] = useState(false);
  const [votingEndDate, setVotingEndDate] = useState(null);
  const [winnerIdea, setWinnerIdea] = useState(null);
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const [votingStartDate, setVotingStartDate] = useState(null);
  const [votingStarted, setVotingStarted] = useState(false);

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
      }
    } catch (error) {
      console.error('Error determining winner idea:', error);
    }
  };

  const storeWinnerIdea = async (ideaId) => {
    try {
      await setDoc(doc(db, "events", eventId, "details", "winnerIdea"), { ideaId });
    } catch (error) {
      console.error('Error storing winner idea in Firebase:', error);
    }
  };

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasCollection = collection(db, "events", eventId, "ideas");
        const ideasSnapshot = await getDocs(ideasCollection);
        const fetchedIdeas = [];

        for (const docRef of ideasSnapshot.docs) {
          const ideaData = docRef.data();
          const ideaId = docRef.id;

          // Fetch images for each idea
          const imagesCollection = collection(docRef.ref, 'images');
          const imagesSnapshot = await getDocs(imagesCollection);
          const imageUrls = imagesSnapshot.docs.map(imageDoc => imageDoc.data().imageUrls[0]);

          const ideaWithImages = {
            id: ideaId,
            ...ideaData,
            images: imageUrls
          };

          fetchedIdeas.push(ideaWithImages);
        }

        setIdeas(fetchedIdeas);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      }
    };

    const fetchUserRole = async (user) => {
      try {
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
        const votingEndDateDoc = await getDoc(doc(db, "events", eventId, "details", "votingDetails"));
        if (votingEndDateDoc.exists()) {
          const fetchedDate = votingEndDateDoc.data().votingEndDate.toDate();
          const now = new Date();
    
          console.log('Fetched voting end date:', fetchedDate);
          setVotingEndDate(fetchedDate);
    
          const hasVotingEnded = now >= fetchedDate;
          console.log('Voting ended:', hasVotingEnded);
          setVotingEnded(hasVotingEnded);
    
          if (hasVotingEnded) {
            await fetchWinnerIdea(); // Ensure winner event is fetched if voting has ended
          }
        } else {
          console.log('Document does not exist for voting end date.');
        }
      } catch (error) {
        console.error('Error fetching voting end date:', error);
        // Handle error state or retry logic if needed
      }
    };
    

    const fetchVotingStartDate = async () => {
      try {
        const votingStartDateDoc = await getDoc(doc(db, "events", eventId, "details", "votingDetails"));
        if (votingStartDateDoc.exists()) {
          const fetchedDate = votingStartDateDoc.data().votingStartDate.toDate();
          setVotingStartDate(fetchedDate);

          const now = new Date();
          setVotingStarted(now >= fetchedDate);
        }
      } catch (error) {
        console.error('Error fetching voting start date:', error);
      }
    };

    // Fetch winner only if voting has ended
    const fetchWinnerIdea = async () => {
      if (votingEnded) {
        try {
          const winnerIdeaDoc = await getDoc(doc(db, "events", eventId, "details", "winnerIdea"));
          if (winnerIdeaDoc.exists()) {
            const winnerIdeaId = winnerIdeaDoc.data().ideaId;
            const winnerIdeaDocRef = doc(db, 'events', eventId, 'ideas', winnerIdeaId);
            const winnerIdeaDocSnapshot = await getDoc(winnerIdeaDocRef);

            if (winnerIdeaDocSnapshot.exists()) {
              const winnerIdea = {
                id: winnerIdeaDocSnapshot.id,
                ...winnerIdeaDocSnapshot.data(),
                images: [],
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
            }
          }
        } catch (error) {
          console.error('Error fetching winner idea:', error);
        }
      }
    };

    const fetchData = async (user) => {
      fetchIdeas();
      fetchUserRole(user);
      fetchVotingEndDate();
      fetchVotingStartDate();
      determineWinner();
      fetchWinnerIdea();
    };

    const authListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setUserRole(null);
      }
    });

    return () => authListener();
  }, [eventId, votingEnded]);

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
          determineWinner();
        } else if (!votingStarted && now >= votingStartDate) {
          setVotingStarted(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate, votingStartDate, votingStarted, ideas]);

  const handleDateUpdate = async (date) => {
    setVotingEndDate(date);
    setVotingEnded(false); // Reset votingEnded state

    try {
      await setDoc(doc(db, "events", eventId, "details", "votingDetails"), {
        votingEndDate: Timestamp.fromDate(date),
        votingStartDate: Timestamp.fromDate(votingStartDate)
      });
    } catch (error) {
      console.error('Error updating voting end date:', error);
    }
  };

  const handleStartDateUpdate = async (date) => {
    setVotingStartDate(date);
    setVotingStarted(false); // Reset votingStarted state

    try {
      await setDoc(doc(db, "events", eventId, "details", "votingDetails"), {
        votingEndDate: Timestamp.fromDate(votingEndDate),
        votingStartDate: Timestamp.fromDate(date)
      });
      if (new Date() >= date) {
        setVotingStarted(true);
      }
    } catch (error) {
      console.error('Error updating voting start date:', error);
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
          <DatePicker
            selected={votingStartDate}
            onChange={handleStartDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField label="Voting Start Date" />}
          />
          <AddIdeasButton eventId={eventId} />
        </div>
      )}
      <div className="ideas-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best event ideas to choose from!</h1>
          {votingStarted && ( 
            <div>
            <h2>Countdown Timer</h2>
            <CountdownTimer timeRemaining={timeRemaining} votingEnded={votingEnded} votingStarted={votingStarted} />
            </div>

          )}
           
        
        
          {!votingStarted && votingStartDate && !votingEnded && (
            <h2>{`Voting Starts on ${votingStartDate.getDate()} ${votingStartDate.toLocaleString('default', { month: 'long' })} ${votingStartDate.getFullYear()} at ${votingStartDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}!`}</h2>
          )}
        </div>

        {votingEnded && winnerIdea && (
          <div className="winner-event-section">
            <h2>The Winner Idea!</h2>
            <DisplayIdeas idea={winnerIdea} votingEnded={votingEnded} winningEventprop={true} votingStarted={votingStarted} eventId={eventId} />
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/event/${eventId}/ideas/${winnerIdea.id}/rsvp`)}
                style={{ marginTop: 10, marginRight: 10 }}
            >
                RSVP
        </Button>
          </div>
        )}

        <Grid container spacing={2}>
          {ideas.map((idea) => (
            <Grid item key={idea.id} xs={12} sm={6} md={4} lg={3}>
              <DisplayIdeas idea={idea} votingEnded={votingEnded} winningEventprop={false} votingStarted={votingStarted} eventId={eventId} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default IdeasPage;