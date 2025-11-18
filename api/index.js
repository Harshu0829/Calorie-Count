// Vercel serverless function wrapper for Express app
// This file is located at /api/index.js to handle all /api/* routes
const app = require('../backend/server');

// Export the Express app as a serverless function
module.exports = app;

