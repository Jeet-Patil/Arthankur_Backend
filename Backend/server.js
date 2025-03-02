const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const fundingRoutes = require('./routes/funding');
const loanRoutes = require('./routes/loans');
const communityRoutes = require('./routes/community');
const cashFlowRoutes = require('./routes/cashFlowRoutes');
const workingCapitalRoutes = require('./routes/workingCapitalRoutes');
const meetingRoutes = require('./routes/meetings');
const notificationsRoutes = require('./routes/notifications');
const taxComplianceRoutes = require('./routes/taxCompliance');
const chatbotRoutes = require('./routes/chatbot');
const stripeRoutes = require('./routes/stripe');
const paymentRoutes = require('./routes/payments');
const governmentSchemesRoutes = require('./routes/governmentSchemes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
app.use('/api/tax-compliance', taxComplianceRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/government-schemes', governmentSchemesRoutes);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = 'uploads/funding';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create uploads directory for loans
const loansUploadDir = 'uploads/loans';
if (!fs.existsSync(loansUploadDir)) {
    fs.mkdirSync(loansUploadDir, { recursive: true });
}

// Create uploads directory for tax documents
const taxUploadDir = 'uploads/tax';
if (!fs.existsSync(taxUploadDir)) {
    fs.mkdirSync(taxUploadDir, { recursive: true });
}

// Create uploads directory for stripe documents
const stripeUploadDir = 'uploads/stripe';
if (!fs.existsSync(stripeUploadDir)) {
    fs.mkdirSync(stripeUploadDir, { recursive: true });
}



// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 