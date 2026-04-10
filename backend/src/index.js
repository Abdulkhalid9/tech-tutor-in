/**
 * TechTutorIn - Backend Server Entry Point
 * A full-stack tutoring platform where students post questions and tutors solve them
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const qaRoutes = require('./routes/qa');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();




// Import database connection
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/qa', qaRoutes);

// Serve uploaded files (for local development)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TechTutorIn API is running' });
});

// Define routes here (will be added in subsequent steps)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/materials', require('./routes/studyMaterials'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  // console.error('Error:', err.stack);
  // res.status(500).json({
  //   message: 'Internal Server Error',
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error('Error:', err.stack);
  }

  res.status(statusCode).json({
    status: err.status || (String(statusCode).startsWith('4') ? 'fail' : 'error'),
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   TechTutorIn Backend                     ║
║═══════════════════════════════════════════════════════════║
║  Server running on port: ${PORT}                          ║
║  Environment: ${process.env.NODE_ENV || 'development'}                           ║
║  API Endpoint: http://localhost:${PORT}/api               ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
