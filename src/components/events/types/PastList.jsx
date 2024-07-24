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
import PastIdeas from "./PastIdeas";
import './EventList.css'

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





  return (
    <>
      <NavBar />
      {userRole === 'admin' && (
        <div style={{ float: 'right' }}>
          
        </div>
      )}
      <div className="ideas-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best event ideas to choose from!</h1>
     
    
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

            <Grid container spacing={3}>
            {events
                .filter(event => {
                if (userRole === 'admin') return true;
                if (votingStarted && !votingEnded) return true;
                if (!votingStarted) return true;
                return votingEnded && event.id === winnerEvent?.id;
                })
                .map(event => (
                <Grid item key={event.id} xs={12} sm={6} md={4}>
                    <PastIdeas idea={ideas}/>
                </Grid>
                ))}
            </Grid>

      </div>
    </>
  );
};

export default IdeasPage;