const express = require('express');
const app = express();
const aiRoutes = require('./routes/aiRoutes');
const PORT = process.env.PORT || 5000;
const dotenv = require('dotenv');
dotenv.config();

// Middleware setup
const cors = require('cors');
app.use(cors());

// Increase JSON and URL-encoded payload limits to handle larger files
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    routes: {
      ai: '/api/ask',
      upload: '/api/upload',
      link: '/api/link'
    }
  });
});

// Mount AI routes with /api prefix
app.use('/api', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableRoutes: ['/api/ask', '/api/upload', '/api/link']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- POST /api/ask`);
  console.log(`- POST /api/upload`);
  console.log(`- POST /api/link`);
});