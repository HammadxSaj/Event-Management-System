import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../../Firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddIdeasButton from "../../admin/AddIdeasButton";
import NavBar from "../../Home/NavBar";
import DisplayIdeas from "./DisplayIdeas";
import CountdownTimer from "../CountdownTimer";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import './IdeasPage.css'
import { ThreeDots} from 'react-loader-spinner';

const IdeasPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [votingEnded, setVotingEnded] = useState(false);
  const [votingEndDate, setVotingEndDate] = useState(null);
  const [winnerIdea, setWinnerIdea] = useState(null);
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const [votingStartDate, setVotingStartDate] = useState(null);
  const [votingStarted, setVotingStarted] = useState(false);
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [hostingDate, setHostingDate] = useState(null);
  const [loading, setLoading] = useState(true)


  const checkRSVPStatus = async (userId, ideaId) => {
    try {
      const rsvpDoc = await getDoc(doc(db, "users", userId, "rsvps", ideaId));
      return rsvpDoc.exists();
    } catch (error) {
      console.error("Error checking RSVP status:", error);
      return false;
    }
  };

  const removeIdea = (ideaId) => {
    setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
  };


  // not workingg
  const fetchWinnerIdeaHostingDate = async (ideaId) => {
    try {
      const winnerIdeaDoc = await getDoc(
  
        doc(db, "events", eventId, "ideas", ideaId)
      );
      if (winnerIdeaDoc.exists()) {
        return winnerIdeaDoc.data().hostingDate.toDate();
      }
    } catch (error) {
      console.error("Error fetching winner idea hosting date:", error);
    }
    return null;
  };

  // const shouldDisableRSVP = () => {
  //   if (!hostingDate) return false;
  //   const oneDayBeforeHostingDate = new Date(hostingDate);
  //   oneDayBeforeHostingDate.setDate(oneDayBeforeHostingDate.getDate() - 1);
  //   return new Date() >= oneDayBeforeHostingDate;
  // };

  const handleRSVP = async (userId, ideaId) => {
    try {
      await setDoc(doc(db, "users", userId, "rsvps", ideaId), {
        rsvp: true,
      });
    } catch (error) {
      console.error("Error submitting RSVP:", error);
    }
  };

  const fetchUserEmails = async () => {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      return usersSnapshot.docs.map((doc) => doc.data().email);
    } catch (error) {
      console.error("Error fetching user emails:", error);
      return [];
    }
  };

  const fetchEventName = async (eventId) => {
    try {
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (eventDoc.exists()) {
        return eventDoc.data().title; // Adjust this based on your actual response structure
      } else {
        console.error("Event document does not exist.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching event name:", error);
      return null;
    }
  };

  const sendNotificationEmail = async () => {
    try {
      // Fetch all user emails
      const userEmails = await fetchUserEmails();
      console.log(userEmails)
      // Fetch event name
      const eventName = await fetchEventName(eventId);

      // Send email notifications
      await axios.post("http://localhost:3000/send-email", {
        to: userEmails,
        subject: "Voting Ending Soon",
        html: `<strong>One hour left before the voting ends!</strong>
             <p>Don't forget to cast your vote for the event: ${eventName}.</p>`,
      });

      console.log("Notification email sent successfully");
    } catch (error) {
      console.error("Error sending notification email: ", error);
    }
  };


  const sendWinnerNotificationEmail = async (ideaName, eventName) => {
    try {
      // Fetch all user emails
      const userEmails = await fetchUserEmails();

      await axios.post("http://localhost:3000/send-email", {
        to: userEmails,
        subject: "Winning Idea Announcement",
        html: `<strong>The idea "${ideaName}" for the event "${eventName}" has won based on public consensus.</strong>
           <p>Please RSVP to confirm your participation.</p>`,
      });

      console.log("Winner notification email sent successfully");
    } catch (error) {
      console.error("Error sending winner notification email: ", error);
    }
  };
  
  

  const determineWinner = async () => {
    try {
      // Re-fetch the ideas before determining the winner
      const ideasCollection = collection(db, "events", eventId, "ideas");
      const ideasSnapshot = await getDocs(ideasCollection);
      const fetchedIdeas = [];

      for (const docRef of ideasSnapshot.docs) {
        const ideaData = docRef.data();
        const ideaId = docRef.id;

        const imagesCollection = collection(docRef.ref, "images");
        const imagesSnapshot = await getDocs(imagesCollection);
        const imageUrls = imagesSnapshot.docs.map(
          (imageDoc) => imageDoc.data().imageUrls[0]
        );

        const ideaWithImages = {
          id: ideaId,
          ...ideaData,
          images: imageUrls,
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

        if (
          upvotes > maxVotes ||
          (upvotes === maxVotes && downvotes < minDownvotes)
        ) {
          maxVotes = upvotes;
          minDownvotes = downvotes;
          winningIdea = idea;
        }
      });

      if (winningIdea) {
        console.log("winner calculation complete");
        console.log(winningIdea.title);
        setWinnerIdea(winningIdea);
        setWinnerDetermined(true);
        await storeWinnerIdea(winningIdea.id);
      

        // Fetch event name
        const eventName = await fetchEventName(eventId);

        // Send winner notification email
        await sendWinnerNotificationEmail(winningIdea.title, eventName);
      }
    } catch (error) {
      console.error("Error determining winner idea:", error);
    }
  };
  const storeWinnerIdea = async (ideaId) => {
    try {
      const winnerIdeaDocRef = doc(db, "events", eventId, "ideas", ideaId);
      const winnerIdeaDocSnapshot = await getDoc(winnerIdeaDocRef);
  
      if (winnerIdeaDocSnapshot.exists()) {
        const winnerIdea = {
          id: winnerIdeaDocSnapshot.id,
          ...winnerIdeaDocSnapshot.data(),
          images: [],
        };
  
        const imagesCollection = collection(winnerIdeaDocRef, "images");
        const imagesSnapshot = await getDocs(imagesCollection);
        imagesSnapshot.forEach((imageDoc) => {
          const imageUrl = imageDoc.data().imageUrls;
          if (imageUrl) {
            winnerIdea.images.push(imageUrl[0]);
          }
        });
  
        // Store the winner idea in the "details" subcollection
        await setDoc(doc(db, "events", eventId, "details", "winnerIdea"), {
          ideaId: winnerIdea.id,
          title: winnerIdea.title,
          dateTime: winnerIdea.dateTime,
          description: winnerIdea.description,
          images: winnerIdea.images,
        });
  
        console.log("Winner idea stored successfully");
      }
    } catch (error) {
      console.error("Error storing winner idea:", error);
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

          const imagesCollection = collection(docRef.ref, "images");
          const imagesSnapshot = await getDocs(imagesCollection);
          const imageUrls = imagesSnapshot.docs.map(
            (imageDoc) => imageDoc.data().imageUrls[0]
          );

          const ideaWithImages = {
            id: ideaId,
            ...ideaData,
            images: imageUrls,
          };

          fetchedIdeas.push(ideaWithImages);
        }

        setIdeas(fetchedIdeas);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      }
      finally {
        setLoading(false);
      }
    };

    const fetchUserRole = async (user) => {
      try {
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

    const fetchVotingDates = async () => {
      try {
        const votingDetailsDoc = await getDoc(
          doc(db, "events", eventId, "details", "votingDetails")
        );
        if (votingDetailsDoc.exists()) {
          const data = votingDetailsDoc.data();
          const fetchedEndDate = data.votingEndDate.toDate();
          const fetchedStartDate = data.votingStartDate.toDate();
          const now = new Date();

          setVotingEndDate(fetchedEndDate);
          setVotingStartDate(fetchedStartDate);

          setVotingEnded(now >= fetchedEndDate);
          setVotingStarted(now >= fetchedStartDate);

          if (now < fetchedEndDate) {
            // Schedule email notification for one hour before voting end
            const oneHourBeforeEnd = new Date(fetchedEndDate);
            oneHourBeforeEnd.setHours(oneHourBeforeEnd.getHours() - 1);
            if (now < oneHourBeforeEnd) {
              const timeUntilNotification =
                oneHourBeforeEnd.getTime() - now.getTime();
              setTimeout(sendNotificationEmail, timeUntilNotification);
            }
          }

          if (now >= fetchedEndDate && winnerDetermined) {
            await fetchWinnerIdea();
          } else {
            // Clear winner idea state if voting is still ongoing
            setWinnerIdea(null);
            setWinnerDetermined(false);
          }
        } else {
          console.log("Document does not exist for voting dates.");
        }
      } catch (error) {
        console.error("Error fetching voting dates:", error);
      }
    };

    const fetchWinnerIdea = async () => {
      if (votingEnded) {
        console.log("voting has ended");
        try {
          const winnerIdeaDoc = await getDoc(
            doc(db, "events", eventId, "details", "winnerIdea")
          );
          if (winnerIdeaDoc.exists()) {
            const winnerIdeaId = winnerIdeaDoc.data().ideaId;
            const winnerIdeaDocRef = doc(
              db,
              "events",
              eventId,
              "ideas",
              winnerIdeaId
            );
            const winnerIdeaDocSnapshot = await getDoc(winnerIdeaDocRef);

            if (winnerIdeaDocSnapshot.exists()) {
              const winnerIdea = {
                id: winnerIdeaDocSnapshot.id,
                ...winnerIdeaDocSnapshot.data(),
                images: [],
              };

              const imagesCollection = collection(winnerIdeaDocRef, "images");
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
          console.error("Error fetching winner idea:", error);
        }
      }
    };

    const fetchData = async (user) => {
      await fetchIdeas();
      await fetchUserRole(user);
      await fetchVotingDates();

      if (user) {
        const rsvpStatus = await checkRSVPStatus(user.uid, winnerIdea?.id);
        setHasRSVPed(rsvpStatus);
      }

      // if (winnerIdea) {
      //   const hostingDate = await fetchWinnerIdeaHostingDate(winnerIdea.id);
      //   setHostingDate(hostingDate);
      // }
    };

    const authListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setUserRole(null);
      }
    });

    return () => authListener();
  }, [eventId, winnerIdea]);

  useEffect(() => {
  
    const interval = setInterval(() => {
      if (votingEndDate && votingStartDate) {
        const now = new Date();
        const distance = votingEndDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);

        if (distance < 0) {
          clearInterval(interval);
          setTimeRemaining(`0d 0h 0m 0s`);
          if (votingEnded && !winnerDetermined)
          {
            console.log("problem 1")
            setVotingEnded(true);
            console.log("CALCULATING WINNER HERE");

            determineWinner();
          

          }
         
        } else if (!votingStarted && now >= votingStartDate) {
          setVotingStarted(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate, votingStartDate, votingStarted]);

  const handleDateUpdate = async (date) => {
    console.log("Voting end date changed");
    setVotingEndDate(date);
    setVotingEnded(false); // Reset votingEnded state
    console.log("CALCULATING WINNER HERE");
    console.log("Winner Updated");
    determineWinner();
    console.log(winnerIdea);

    try {
      await setDoc(doc(db, "events", eventId, "details", "votingDetails"), {
        votingEndDate: Timestamp.fromDate(date),
        votingStartDate: Timestamp.fromDate(votingStartDate),
      });
    } catch (error) {
      console.error("Error updating voting end date:", error);
    }
  };

  const handleStartDateUpdate = async (date) => {
    setVotingStartDate(date);
    setVotingStarted(false); // Reset votingStarted state

    try {
      await setDoc(doc(db, "events", eventId, "details", "votingDetails"), {
        votingEndDate: Timestamp.fromDate(votingEndDate),
        votingStartDate: Timestamp.fromDate(date),
      });
      if (new Date() >= date) {
        setVotingStarted(true);
      }
    } catch (error) {
      console.error("Error updating voting start date:", error);
    }
  };

  return (
    <>
      <NavBar />


      {userRole === "admin" && (
        <div style={{ float: "right" }}>
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
        <h1 className="header-title">Choose the event that will spark our community's celebration!</h1>
        <h3 className='header-slogan'>Your vote, calls for our next epic event</h3>
     
          
      

          {timeRemaining && (
            <Grid item xs={12}>
              <CountdownTimer timeRemaining={timeRemaining} />
              {/* <h1>{`${winnerDetermined}`}</h1> */}

            </Grid>
          )}
          {winnerDetermined && votingEnded && (
            <div>
              <h2>Winning Idea:</h2>
              <div className="winner-event-section">
                <h2>The Winner Idea!</h2>
                <DisplayIdeas
                  idea={winnerIdea}
                  votingEnded={votingEnded}
                  winningEventprop={true}
                  votingStarted={votingStarted}
                  eventId={eventId}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    handleRSVP(auth.currentUser.uid, winnerIdea.id);
                    setHasRSVPed(true);
                    navigate(`/event/${eventId}/ideas/${winnerIdea.id}/rsvp`);
                  }}
                  style={{ marginTop: 10, marginRight: 10 }}
                  disabled={
                    hasRSVPed
                    // || shouldDisableRSVP()
                  }
                >
                  RSVP
                </Button>
                {userRole === "admin" && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      navigate(
                        `/event/${eventId}/ideas/${winnerIdea.id}/analytics`
                      )
                    }
                    style={{ marginTop: 10 }}
                  >
                    View Analytics
                  </Button>
                )}
              </div>
            </div>
          )}

        </Grid> 


        <div className="hold-container">
        {loading ? (
          <div className="loader-container">
            <ThreeDots 
              height="80" 
              width="80" 
              radius="9"
              color="#1CA8DD" 
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          ideas.map((idea) => (
            <Grid item xs={12} sm={6} md={4} key={idea.id} className="display-idea">
              <DisplayIdeas
                idea={idea}
                votingEnded={votingEnded}
                votingStarted={votingStarted}
                eventId={eventId}
                removeIdea={removeIdea} // Pass the removeIdea function as a prop
              />
            </Grid>
          ))
        )}
      </div>

      </Grid>
    </>
  );
};

export default IdeasPage;