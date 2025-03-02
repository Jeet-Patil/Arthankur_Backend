const mongoose = require('mongoose');
const connectDB = require('./config/db');
require('dotenv').config();

const testConnection = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        console.log('MongoDB connection successful!');
        
        // Get list of all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });
        
        // Close connection
        mongoose.connection.close();
        console.log('\nMongoDB connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error testing connection:', error);
        process.exit(1);
    }
};

// Execute test function
testConnection(); 