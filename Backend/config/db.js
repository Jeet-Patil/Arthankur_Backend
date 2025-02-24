const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // MongoDB Atlas connection string
        const mongoURI = process.env.MONGODB_URI;
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 