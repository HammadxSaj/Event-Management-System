import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
const port = 3001;

// Initialize the Resend client
const resend = new Resend('re_45WTopdn_PaEDMnkUSnR7kJr7WTBncCf3');

app.use(bodyParser.json());
app.use(cors());

app.post('/emails', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    console.log('Sending email to:', to);
    console.log('Email subject:', subject);
    console.log('Email text:', text);

    // Send email using the Resend API
    const result = await resend.emails.send({
      to,
      subject,
      text,
    });

    console.log('Email sent successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in /emails route:', error);
    console.error('Full error response:', error.response ? await error.response.json() : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
