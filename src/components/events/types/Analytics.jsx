import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../Firebase";
import { collection, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Card, Container, Typography, Modal, Box } from "@mui/material";
import Chart from 'chart.js/auto'; // Make sure to import chart.js/auto for the latest version
import "./Analytics.css";

const Analytics = () => {
  const { eventId, ideaId } = useParams();
  const [responses, setResponses] = useState({});
  const [questions, setQuestions] = useState([]);
  const [emailDetails, setEmailDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const navigate = useNavigate();
  const chartRefs = useRef([]);

  useEffect(() => {
    const fetchResponses = async () => {
      const rsvpRef = collection(db, "events", eventId, "ideas", ideaId, "rsvp");
      const snapshot = await getDocs(rsvpRef);

      const responseCounts = {};
      const questionSet = new Set();
      const emailDetailsTemp = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Doc data:", data);

        // Handle the mandatory question
        const mandatoryQuestion = "Will you be available to be part of this event?";
        const mandatoryAnswer = data.isAvailable ? "yes" : "no";
        const email = data.userEmail;

        if (!responseCounts[mandatoryQuestion]) {
          responseCounts[mandatoryQuestion] = { yes: 0, no: 0 };
        }
        responseCounts[mandatoryQuestion][mandatoryAnswer]++;

        if (!emailDetailsTemp[mandatoryQuestion]) {
          emailDetailsTemp[mandatoryQuestion] = { yes: [], no: [] };
        }
        emailDetailsTemp[mandatoryQuestion][mandatoryAnswer].push(email);

        if (data.responses) {
          Object.keys(data.responses).forEach((question) => {
            questionSet.add(question);
            const answer = data.responses[question];
            console.log(`Question: ${question}, Answer: ${answer}, Email: ${email}`);

            if (!responseCounts[question]) {
              responseCounts[question] = { yes: 0, no: 0 };
            }
            responseCounts[question][answer]++;

            if (!emailDetailsTemp[question]) {
              emailDetailsTemp[question] = { yes: [], no: [] };
            }
            emailDetailsTemp[question][answer].push(email);
          });
        }
      });

      console.log("Response counts:", responseCounts);
      console.log("Email details:", emailDetailsTemp);

      setResponses(responseCounts);
      setQuestions([...questionSet]);
      setEmailDetails(emailDetailsTemp);
    };

    fetchResponses();
  }, [eventId, ideaId]);

  const handleChartClick = (event, question, index) => {
    const chart = chartRefs.current[index];
    if (chart) {
      const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, true);
      if (elements.length > 0) {
        const { index: elementIndex } = elements[0];
        const answer = elementIndex === 0 ? "yes" : "no";
        console.log(`Selected question: ${question}, Answer: ${answer}`);
        setSelectedAnswer(answer);
        setSelectedEmails(emailDetails[question][answer] || []);
        setOpen(true);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAnswer("");
    setSelectedEmails([]);
  };

  return (
    <>
      <button
        className="back-button"
        onClick={() => navigate(`/event/${eventId}/ideas`)}
      >
        Back
      </button>
      <Container className="d-flex flex-column align-items-center">
        <Typography variant="h4" gutterBottom>
          RSVP Analytics
        </Typography>
        <Card className="p-4 m-3 shadow-lg w-100">
          <Typography variant="h6">Will you be available to be part of this event?</Typography>
          <div className="chart-container">
            <Pie
              data={{
                labels: ["Yes", "No"],
                datasets: [
                  {
                    data: [
                      responses["Will you be available to be part of this event?"]?.yes || 0,
                      responses["Will you be available to be part of this event?"]?.no || 0,
                    ],
                    backgroundColor: ["#36A2EB", "#FF6384"],
                  },
                ],
              }}
              ref={(el) => (chartRefs.current[questions.length] = el)}
              onClick={(event) => handleChartClick(event, "Will you be available to be part of this event?", questions.length)}
            />
          </div>
        </Card>
        {questions.map((question, index) => {
          const data = {
            labels: ["Yes", "No"],
            datasets: [
              {
                data: [
                  responses[question]?.yes || 0,
                  responses[question]?.no || 0,
                ],
                backgroundColor: ["#36A2EB", "#FF6384"],
              },
            ],
          };
          return (
            <Card className="p-4 m-3 shadow-lg w-100" key={index}>
              <Typography variant="h6">{question}</Typography>
              <div className="chart-container">
                <Pie
                  data={data}
                  ref={(el) => (chartRefs.current[index] = el)}
                  onClick={(event) => handleChartClick(event, question, index)}
                />
              </div>
            </Card>
          );
        })}
      </Container>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box className="modal-box">
          <Typography id="modal-title" variant="h6" component="h2">
            Users who responded {selectedAnswer === "yes" ? "Yes" : "No"}
          </Typography>
          {selectedEmails.length > 0 ? (
            <ul id="modal-description">
              {selectedEmails.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          ) : (
            <Typography id="modal-description" sx={{ mt: 2 }}>
              No emails to display.
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Analytics;
