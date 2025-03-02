const express = require('express');
const router = express.Router();
const GovernmentScheme = require('../models/GovernmentScheme');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add a new government scheme (admin only)
router.post('/', async (req, res) => {
    try {
        const {
            name,
            description,
            ministry,
            fundingAmount,
            eligibility,
            applicationLink,
            targetAudience
        } = req.body;

        const scheme = new GovernmentScheme({
            name,
            description,
            ministry,
            fundingAmount,
            eligibility,
            applicationLink,
            targetAudience
        });

        await scheme.save();
        res.status(201).json({ success: true, scheme });
    } catch (error) {
        console.error('Error creating scheme:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all government schemes
router.get('/', async (req, res) => {
    try {
        const schemes = await GovernmentScheme.find().sort({ createdAt: -1 });
        res.json(schemes);
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific government scheme by ID
router.get('/:id', async (req, res) => {
    try {
        const scheme = await GovernmentScheme.findById(req.params.id);
        if (!scheme) {
            return res.status(404).json({ error: 'Scheme not found' });
        }
        res.json(scheme);
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check user eligibility for all schemes
router.get('/eligibility/:userId', auth, async (req, res) => {
    try {
        // Get user information
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all schemes
        const schemes = await GovernmentScheme.find();
        
        // Check eligibility for each scheme
        const eligibilityResults = schemes.map(scheme => {
            const eligible = checkEligibility(user, scheme);
            return {
                schemeId: scheme._id,
                schemeName: scheme.name,
                description: scheme.description,
                ministry: scheme.ministry,
                fundingAmount: scheme.fundingAmount,
                eligible,
                applicationLink: scheme.applicationLink,
                targetAudience: scheme.targetAudience
            };
        });

        res.json(eligibilityResults);
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to check eligibility
function checkEligibility(user, scheme) {
    console.log(`Checking eligibility for user ${user._id} and scheme ${scheme.name}`);
    console.log('User data:', {
        userType: user.userType,
        startupStage: user.startupStage,
        industry: user.industry,
        industryType: user.industryType, // Check both fields
        annualRevenue: user.annualRevenue,
        numberOfEmployees: user.numberOfEmployees,
        location: user.location,
        registeredLocation: user.registeredLocation, // Check both fields
        existingGovernmentSupport: user.existingGovernmentSupport
    });
    console.log('Scheme eligibility criteria:', scheme.eligibility);

    if (user.userType !== 'startup') {
        console.log('User is not a startup, not eligible');
        return false;
    }

    const { eligibility } = scheme;
    let matchCount = 0;
    const requiredMatches = 3; // Only need 3 out of 6 criteria to match
    
    // Check startup stage
    if (eligibility.startupStages.length > 0) {
        if (eligibility.startupStages.includes(user.startupStage)) {
            console.log(`✓ Startup stage match: ${user.startupStage}`);
            matchCount++;
        } else {
            console.log(`✗ Startup stage mismatch: User has ${user.startupStage}, criteria needs one of [${eligibility.startupStages.join(', ')}]`);
        }
    } else {
        // If no criteria defined, count as a match
        console.log('✓ No startup stage criteria, automatic match');
        matchCount++;
    }

    // Check industry type - trying both possible field names
    if (eligibility.industryTypes.length > 0) {
        const userIndustry = user.industry || user.industryType; // Try both field names
        if (eligibility.industryTypes.includes(userIndustry)) {
            console.log(`✓ Industry match: ${userIndustry}`);
            matchCount++;
        } else {
            console.log(`✗ Industry mismatch: User has ${userIndustry}, criteria needs one of [${eligibility.industryTypes.join(', ')}]`);
        }
    } else {
        console.log('✓ No industry criteria, automatic match');
        matchCount++;
    }

    // Check annual revenue
    if (eligibility.annualRevenue.length > 0) {
        if (eligibility.annualRevenue.includes(user.annualRevenue)) {
            console.log(`✓ Revenue match: ${user.annualRevenue}`);
            matchCount++;
        } else {
            console.log(`✗ Revenue mismatch: User has ${user.annualRevenue}, criteria needs one of [${eligibility.annualRevenue.join(', ')}]`);
        }
    } else {
        console.log('✓ No revenue criteria, automatic match');
        matchCount++;
    }

    // Check employee range
    if (eligibility.employeeRanges.length > 0) {
        // Map user's employee count to a range format
        let userEmployeeRange = '';
        const employeeCount = parseInt(user.numberOfEmployees);
        
        if (employeeCount <= 5) userEmployeeRange = '1-5';
        else if (employeeCount <= 20) userEmployeeRange = '6-20';
        else if (employeeCount <= 50) userEmployeeRange = '21-50';
        else if (employeeCount <= 100) userEmployeeRange = '51-100';
        else userEmployeeRange = 'More than 100';
        
        if (eligibility.employeeRanges.includes(userEmployeeRange)) {
            console.log(`✓ Employee count match: ${userEmployeeRange}`);
            matchCount++;
        } else {
            console.log(`✗ Employee count mismatch: User has ${userEmployeeRange}, criteria needs one of [${eligibility.employeeRanges.join(', ')}]`);
        }
    } else {
        console.log('✓ No employee range criteria, automatic match');
        matchCount++;
    }

    // Check location - trying both possible field names
    if (eligibility.locations.length > 0) {
        const userLocation = user.location || user.registeredLocation; // Try both field names
        if (eligibility.locations.includes(userLocation)) {
            console.log(`✓ Location match: ${userLocation}`);
            matchCount++;
        } else {
            console.log(`✗ Location mismatch: User has ${userLocation}, criteria needs one of [${eligibility.locations.join(', ')}]`);
        }
    } else {
        console.log('✓ No location criteria, automatic match');
        matchCount++;
    }

    // Check existing support
    if (eligibility.existingSupport !== null) {
        const userHasSupport = user.existingGovernmentSupport === 'Yes';
        if (eligibility.existingSupport === userHasSupport) {
            console.log(`✓ Existing support match: ${userHasSupport}`);
            matchCount++;
        } else {
            console.log(`✗ Existing support mismatch: User has ${userHasSupport}, criteria needs ${eligibility.existingSupport}`);
        }
    } else {
        console.log('✓ No existing support criteria, automatic match');
        matchCount++;
    }

    console.log(`Total matches: ${matchCount}/${requiredMatches} required`);
    const isEligible = matchCount >= requiredMatches;
    console.log(`Final eligibility: ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    
    return isEligible;
}

module.exports = router; 