const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;  // Using 3000 as a fallback

app.listen(PORT)
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please try another port.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  })
  .on('listening', () => {
    console.log(`Server is running on port ${PORT}`);
  }); 