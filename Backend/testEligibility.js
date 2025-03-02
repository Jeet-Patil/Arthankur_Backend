const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const GovernmentScheme = require('./models/GovernmentScheme');
require('dotenv').config();

// Function to check eligibility (same as in the routes file)
function checkEligibility(user, scheme) {
    if (user.userType !== 'startup') {
        return false;
    }

    const { eligibility } = scheme;
    let isEligible = true;

    // Check startup stage
    if (eligibility.startupStages.length > 0) {
        if (!eligibility.startupStages.includes(user.startupStage)) {
            isEligible = false;
        }
    }

    // Check industry type
    if (eligibility.industryTypes.length > 0) {
        if (!eligibility.industryTypes.includes(user.industryType)) {
            isEligible = false;
        }
    }

    // Check annual revenue
    if (eligibility.annualRevenue.length > 0) {
        if (!eligibility.annualRevenue.includes(user.annualRevenue)) {
            isEligible = false;
        }
    }

    // Check employee range
    if (eligibility.employeeRanges.length > 0) {
        const employeeCount = user.numberOfEmployees;
        let employeeRangeMatch = false;
        
        for (const range of eligibility.employeeRanges) {
            const [min, max] = range.split('-').map(Number);
            if (employeeCount >= min && (max === 0 || employeeCount <= max)) {
                employeeRangeMatch = true;
                break;
            }
        }
        
        if (!employeeRangeMatch) {
            isEligible = false;
        }
    }

    // Check location
    if (eligibility.locations.length > 0) {
        if (!eligibility.locations.includes(user.registeredLocation)) {
            isEligible = false;
        }
    }

    // Check existing support
    if (eligibility.existingSupport !== null) {
        const userHasSupport = user.existingGovernmentSupport === 'Yes';
        if (eligibility.existingSupport !== userHasSupport) {
            isEligible = false;
        }
    }

    return isEligible;
}

// Test with a sample user
const testUser = {
    userType: 'startup',
    startupStage: 'Early Stage',
    industryType: 'IT/Tech',
    annualRevenue: '0-10 Lakhs',
    numberOfEmployees: 5,
    registeredLocation: 'Metro City',
    existingGovernmentSupport: 'No'
};

const runTest = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        console.log('Testing eligibility with sample user:', testUser);
        
        // Get all schemes
        const schemes = await GovernmentScheme.find();
        console.log(`Found ${schemes.length} schemes in the database`);
        
        // Check eligibility for each scheme
        const eligibilityResults = schemes.map(scheme => {
            const eligible = checkEligibility(testUser, scheme);
            return {
                schemeName: scheme.name,
                eligible,
                reason: eligible ? 'Meets all criteria' : 'Does not meet all criteria'
            };
        });
        
        console.log('\nEligibility Results:');
        console.table(eligibilityResults);
        
        // Close connection
        mongoose.connection.close();
        console.log('MongoDB connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error testing eligibility:', error);
        process.exit(1);
    }
};

// Execute test function
runTest(); 