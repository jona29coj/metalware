// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();  // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;  // Use the port defined in .env or default to 5000

app.use(cors());  // Allow requests from your React frontend (localhost:3000)
app.use(express.json());  // Parse incoming requests with JSON payloads

// Example route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
