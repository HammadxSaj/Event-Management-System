import 'dotenv/config';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAxvi2Ir8A7t7TxSJTIa_GPGquPySpuXs",
    authDomain: "eventiti-ec4f0.firebaseapp.com",
    projectId: "eventiti-ec4f0",
    storageBucket: "eventiti-ec4f0.appspot.com",
    messagingSenderId: "524356556966",
    appId: "1:524356556966:web:27444a531f016d2eb43c67",
    measurementId: "G-HXJDLTVM65"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.REACT_APP_EMAIL,
    pass: process.env.REACT_APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const fetchUserEmails = async () => {
  console.log("Fetching Emails");
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
  console.log("Fetching Events");
  try {
    const eventDoc = await getDoc(doc(db, "events", eventId));
    if (eventDoc.exists()) {
      return eventDoc.data().title;
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
  console.log("sendNotificationEmail function is running.");
  try {
    const votingDetailsDoc = await getDoc(doc(db, "events", "FYibDj2tpaZjzEGnjne0", "details", "votingDetails"));
    
    if (votingDetailsDoc.exists()) {
      console.log("Voting details document found.");
      const data = votingDetailsDoc.data();
      const votingEndDate = data.votingEndDate.toDate();
      const now = new Date();

      console.log(`Voting end date: ${votingEndDate}`);
      console.log(`Current date: ${now}`);

      if (now >= votingEndDate) {
        // Fetch user emails
        const userEmails = await fetchUserEmails();
        
        // Fetch event name
        const eventName = await fetchEventName("FYibDj2tpaZjzEGnjne0");

        const emailData = {
          to: userEmails,
          subject: 'Voting Ended',
          html: `<p>The voting period has ended for the event: ${eventName}.</p>`,
        };
        console.log("Sending notification email...");
        await transporter.sendMail(emailData);
        console.log("Notification email sent successfully.");
      } else {
        console.log("Voting has not ended yet.");
      }
    } else {
      console.log("Document does not exist for voting dates.");
    }
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
};

console.log("Notification service started.");
// Schedule a job to run every minute and check voting end times
cron.schedule('* * * * *', () => {
  console.log('Running the job every minute to check voting end times.');
  sendNotificationEmail();
});
