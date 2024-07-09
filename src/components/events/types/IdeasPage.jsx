import React, { useState, useEffect } from "react";
import { Grid } from '@mui/material';
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../../Firebase";
import { collection, getDocs, getDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddIdeasButton from "../../admin/AddIdeasButton";
import NavBar from "../../Home/NavBar";
import DisplayIdeas from "./DisplayIdeas";
import CountdownTimer from "../CountdownTimer";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

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
      // Re-fetch the ideas before determining the winner
      const ideasCollection = collection(db, "events", eventId, "ideas");
      const ideasSnapshot = await getDocs(ideasCollection);
      const fetchedIdeas = [];

      for (const docRef of ideasSnapshot.docs) {
        const ideaData = docRef.data();
        const ideaId = docRef.id;

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

      let winningIdea = null;
      let maxVotes = -1;
      let minDownvotes = Infinity;

      fetchedIdeas.forEach((idea) => {
        const upvotes = idea.upvote.length;
        console.log("Title:", idea.title);
        console.log("Upvotes:", upvotes);
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

    const fetchVotingDates = async () => {
      try {
        const votingDetailsDoc = await getDoc(doc(db, "events", eventId, "details", "votingDetails"));
        if (votingDetailsDoc.exists()) {
          const data = votingDetailsDoc.data();
          const fetchedEndDate = data.votingEndDate.toDate();
          const fetchedStartDate = data.votingStartDate.toDate();
          const now = new Date();

          setVotingEndDate(fetchedEndDate);
          setVotingStartDate(fetchedStartDate);

          setVotingEnded(now >= fetchedEndDate);
          setVotingStarted(now >= fetchedStartDate);

          if (now >= fetchedEndDate) {
            await fetchWinnerIdea();
          } else {
            // Clear winner idea state if voting is still ongoing
            setWinnerIdea(null);
            setWinnerDetermined(false);
          }
        } else {
          console.log('Document does not exist for voting dates.');
        }
      } catch (error) {
        console.error('Error fetching voting dates:', error);
      }
    };

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
      fetchVotingDates();
      determineWinner();
    };

    const authListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setUserRole(null);
      }
    });

    return () => authListener();
  }, [eventId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (votingEndDate && votingStartDate) {
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
  }, [votingEndDate, votingStartDate, votingStarted]);

  const handleDateUpdate = async (date) => {
    console.log('Voting end date changed');
    setVotingEndDate(date);
    setVotingEnded(false); // Reset votingEnded state
    console.log("Winner Updated");
    determineWinner();
    console.log(winnerIdea);

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
            placeholderText="Select Voting End Date"
          />
          <DatePicker
            selected={votingStartDate}
            onChange={handleStartDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select Voting Start Date"
          />
          <AddIdeasButton eventId={eventId} />
        </div>
      )}

      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>Ideas</h1>

          {timeRemaining && (
          <Grid item xs={12}>
            <CountdownTimer timeRemaining={timeRemaining} />
          </Grid>
        )}
          {winnerDetermined && votingEnded &&(
            <div>
              <h2>Winning Idea:</h2>
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
              
            </div>
          )}
        </Grid>
      
        {ideas.map((idea) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idea.id}>
            <DisplayIdeas
              idea={idea}
              votingEnded={votingEnded}
              winningIdea={winnerIdea}
              votingStarted={votingStarted}
              eventId={eventId}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default IdeasPage;
