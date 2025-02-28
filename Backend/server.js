const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const fundingRoutes = require('./routes/funding');
const loanRoutes = require('./routes/loans');
const communityRoutes = require('./routes/community');
const cashFlowRoutes = require('./routes/cashFlowRoutes');
const workingCapitalRoutes = require('./routes/workingCapitalRoutes');
const meetingRoutes = require('./routes/meetings');
const notificationsRoutes = require('./routes/notifications');
const virtualPitchRoutes = require('./routes/virtualPitch');
const taxComplianceRoutes = require('./routes/taxComplianceRoutes');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api', communityRoutes);
app.use('/api/financial', cashFlowRoutes);
app.use('/api/financial', workingCapitalRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/virtual-pitch', virtualPitchRoutes);
app.use('/api/tax', taxComplianceRoutes);

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadDirs = ['uploads/profiles', 'uploads/funding', 'uploads/gst', 'uploads/loans'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 