const mongoose = require('mongoose');
const connectDB = require('./config/db');
const GovernmentScheme = require('./models/GovernmentScheme');
require('dotenv').config();

// Sample government schemes data
const governmentSchemesData = [
    {
        name: 'Startup India Seed Fund',
        description: 'Provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization through financial institutions.',
        ministry: 'Ministry of Commerce and Industry',
        fundingAmount: 'Up to ₹20 Lakhs',
        eligibility: {
            startupStages: ['Idea', 'Prototype', 'Early Stage'],
            industryTypes: ['IT/Tech', 'Healthcare', 'Agriculture', 'Education'],
            annualRevenue: ['Pre-revenue', '0-10 Lakhs'],
            employeeRanges: ['1-10', '11-50'],
            locations: ['Metro City', 'Tier 1 City', 'Tier 2 City'],
            existingSupport: false
        },
        applicationLink: 'https://www.startupindia.gov.in/content/sih/en/government-schemes/seed-fund-scheme.html',
        targetAudience: 'Early stage startups and MSMEs'
    },
    {
        name: 'Stand-Up India',
        description: 'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and one woman borrower per bank branch for setting up a greenfield enterprise.',
        ministry: 'Department of Financial Services',
        fundingAmount: '₹10 Lakhs - ₹1 Crore',
        eligibility: {
            startupStages: ['Early Stage', 'Growth'],
            industryTypes: ['Manufacturing', 'Services', 'Retail', 'Agriculture'],
            annualRevenue: ['0-10 Lakhs', '10-50 Lakhs'],
            employeeRanges: ['1-10', '11-50'],
            locations: ['Metro City', 'Tier 1 City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: null
        },
        applicationLink: 'https://www.standupmitra.in/',
        targetAudience: 'SC/ST and Women entrepreneurs'
    },
    {
        name: 'Atal Innovation Mission (AIM)',
        description: 'Promotes a culture of innovation and entrepreneurship across India through various programs including Atal Incubation Centers, Atal Tinkering Labs, and more.',
        ministry: 'NITI Aayog',
        fundingAmount: 'Up to ₹10 Crores for incubation centers',
        eligibility: {
            startupStages: ['Idea', 'Prototype', 'Early Stage', 'Growth'],
            industryTypes: ['IT/Tech', 'Healthcare', 'Education', 'Agriculture', 'Energy'],
            annualRevenue: ['Pre-revenue', '0-10 Lakhs', '10-50 Lakhs'],
            employeeRanges: ['1-10', '11-50', '51-200'],
            locations: ['Metro City', 'Tier 1 City', 'Tier 2 City'],
            existingSupport: null
        },
        applicationLink: 'https://aim.gov.in/',
        targetAudience: 'Innovators, entrepreneurs, and startups'
    },
    {
        name: 'Credit Guarantee Scheme for Startups (CGSS)',
        description: 'Provides credit guarantees to loans extended by member lending institutions (MLIs) to eligible borrowers in the startup ecosystem.',
        ministry: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
        fundingAmount: 'Up to ₹10 Crores',
        eligibility: {
            startupStages: ['Early Stage', 'Growth', 'Mature'],
            industryTypes: ['IT/Tech', 'Manufacturing', 'Healthcare', 'Services', 'Energy'],
            annualRevenue: ['10-50 Lakhs', '50 Lakhs-1 Crore', '1-5 Crore'],
            employeeRanges: ['11-50', '51-200'],
            locations: ['Metro City', 'Tier 1 City'],
            existingSupport: false
        },
        applicationLink: 'https://dpiit.gov.in/schemes/credit-guarantee-scheme-startup-cgss',
        targetAudience: 'DPIIT-recognized startups'
    },
    {
        name: 'Pradhan Mantri Mudra Yojana (PMMY)',
        description: 'Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises through three categories: Shishu, Kishore, and Tarun.',
        ministry: 'Department of Financial Services',
        fundingAmount: 'Up to ₹10 Lakhs',
        eligibility: {
            startupStages: ['Idea', 'Early Stage'],
            industryTypes: ['Retail', 'Services', 'Manufacturing', 'Agriculture'],
            annualRevenue: ['Pre-revenue', '0-10 Lakhs'],
            employeeRanges: ['1-10'],
            locations: ['Metro City', 'Tier 1 City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: false
        },
        applicationLink: 'https://www.mudra.org.in/',
        targetAudience: 'Micro enterprises and small businesses'
    }
];

// Function to seed data
const seedData = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Delete existing data
        await GovernmentScheme.deleteMany({});
        console.log('Existing government schemes deleted');
        
        // Insert new data
        await GovernmentScheme.insertMany(governmentSchemesData);
        console.log('Sample government schemes data inserted successfully');
        
        // Close connection
        mongoose.connection.close();
        console.log('MongoDB connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

// Execute seed function
seedData(); 