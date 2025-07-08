


const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'https://email-sender-app-pink.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const stripHtmlTags = (html) => {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

const sendEmail = async (to, htmlMessage, subject) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: subject || 'Notification',
    html: htmlMessage,
    text: stripHtmlTags(htmlMessage)
  });
};

app.post('/api/send-emails', async (req, res) => {
  try {
    const data = req.body;

    for (let row of data) {
      if (row.Email && row.Message) {
        await sendEmail(row.Email, row.Message, row.Subject);
      }
    }

    res.send({ status: 'success' });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send({ status: 'error', message: err.message });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`)
);
