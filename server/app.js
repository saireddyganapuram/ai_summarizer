const express = require('express');
const app = express();
const aiRoutes = require('./routes/aiRoutes');
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Use AI routes
app.use('/ai', aiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
