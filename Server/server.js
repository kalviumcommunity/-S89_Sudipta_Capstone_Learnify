// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./Routes/AuthRoutes'); // Ensure the path is correct


dotenv.config();

const app = express(); // Initialize the app
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Parse JSON bodies

app.use('/api/auth', authRoutes); // Use the auth routes


app.get("/", (req, res) => {
  try {
      res.status(200).send({ msg: "This is my backend" });
  } catch (error) {
      res.status(500).send({ message: "Error occurred" });
  }
});


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error(' Failed to connect to MongoDB', err);
});
