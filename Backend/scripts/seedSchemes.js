const mongoose = require('mongoose');
require('dotenv').config();
const GovernmentScheme = require('../models/GovernmentScheme');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected for seeding schemes'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Sample government schemes data
const schemesData = [
    {
        name: 'Startup India Seed Fund Scheme',
        description: 'Provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.',
        ministry: 'Ministry of Commerce and Industry',
        fundingAmount: 'Up to ₹20 Lakhs',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction'],
            industryTypes: ['Agriculture', 'EdTech', 'FinTech', 'Healthcare', 'IT/Software', 'Manufacturing', 'Retail', 'Clean Energy', 'Transportation', 'Others'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area', 'Special Economic Zone', 'Industrial Cluster'],
            existingSupport: false
        },
        applicationLink: 'https://seedfund.startupindia.gov.in/',
        targetAudience: 'DPIIT Recognized Startups'
    },
    {
        name: 'Credit Guarantee Scheme',
        description: 'Provides collateral-free loans to micro and small enterprises through financial institutions, covering both term loans and working capital.',
        ministry: 'Ministry of MSME',
        fundingAmount: 'Up to ₹2 Crore',
        eligibility: {
            startupStages: ['Early Traction', 'Scaling', 'Established'],
            industryTypes: ['Agriculture', 'Manufacturing', 'Retail', 'Clean Energy', 'Transportation', 'Others'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Industrial Cluster'],
            existingSupport: null
        },
        applicationLink: 'https://www.cgtmse.in/',
        targetAudience: 'New & Existing MSMEs'
    },
    {
        name: 'Stand-Up India',
        description: 'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and one woman borrower per bank branch.',
        ministry: 'Department of Financial Services',
        fundingAmount: '₹10 Lakh - ₹1 Crore',
        eligibility: {
            startupStages: ['Validation', 'Early Traction', 'Scaling'],
            industryTypes: ['Agriculture', 'Manufacturing', 'Retail', 'Clean Energy', 'Transportation', 'Others'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore'],
            employeeRanges: ['1-5', '6-20', '21-50'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: null
        },
        applicationLink: 'https://www.standupmitra.in/',
        targetAudience: 'SC/ST & Women Entrepreneurs'
    },
    {
        name: 'Atal Innovation Mission (AIM)',
        description: 'Promotes innovation and entrepreneurship through Atal Incubation Centers, Atal Tinkering Labs, and providing scale-up support to established incubators.',
        ministry: 'NITI Aayog',
        fundingAmount: 'Up to ₹10 Crore',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction'],
            industryTypes: ['EdTech', 'FinTech', 'Healthcare', 'IT/Software', 'Clean Energy'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Metro City', 'Tier 2 City', 'Special Economic Zone'],
            existingSupport: false
        },
        applicationLink: 'https://aim.gov.in/',
        targetAudience: 'Incubators & Startups'
    },
    {
        name: 'ASPIRE - Scheme for Promotion of Innovation in Rural Industry',
        description: 'Promotes innovation, entrepreneurship and agro-industry in rural areas by setting up Livelihood Business Incubators (LBIs) and Technology Business Incubators (TBIs).',
        ministry: 'Ministry of MSME',
        fundingAmount: 'Up to ₹1 Crore',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction'],
            industryTypes: ['Agriculture', 'Manufacturing', 'Clean Energy'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Tier 3 City', 'Rural Area'],
            existingSupport: null
        },
        applicationLink: 'https://msme.gov.in/schemes/technology-upgradation-and-quality-certification/aspire-scheme-promotion-innovation-rural',
        targetAudience: 'Rural Enterprises'
    },
    {
        name: "PMEGP - Prime Minister's Employment Generation Programme",
        description: 'Credit-linked subsidy program that helps in generating self-employment opportunities through establishment of micro-enterprises in non-farm sectors.',
        ministry: 'Ministry of MSME',
        fundingAmount: '15-35% of project cost (up to ₹50 Lakhs for manufacturing)',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction'],
            industryTypes: ['Agriculture', 'Manufacturing', 'Retail', 'Others'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: false
        },
        applicationLink: 'https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp',
        targetAudience: 'Individuals, SHGs, Trusts'
    },
    {
        name: 'National SC-ST Hub',
        description: 'Provides professional support to SC/ST entrepreneurs to fulfill the obligations under the Central Government procurement policy for Micro and Small Enterprises.',
        ministry: 'Ministry of MSME',
        fundingAmount: 'Various Schemes',
        eligibility: {
            startupStages: ['Validation', 'Early Traction', 'Scaling', 'Established'],
            industryTypes: ['Agriculture', 'Manufacturing', 'Retail', 'Others'],
            annualRevenue: ['Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore'],
            employeeRanges: ['1-5', '6-20', '21-50'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: null
        },
        applicationLink: 'https://scsthub.in/nssh-schemes/home/userRegistration',
        targetAudience: 'SC/ST Entrepreneurs'
    },
    {
        name: 'Fund of Funds for Startups (FFS)',
        description: 'A fund established by the Government to invest in SEBI-registered Alternative Investment Funds (AIFs) which, in turn, invest in startups.',
        ministry: 'Department for Promotion of Industry and Internal Trade',
        fundingAmount: '₹10,000 Crore Fund Size',
        eligibility: {
            startupStages: ['Early Traction', 'Scaling'],
            industryTypes: ['EdTech', 'FinTech', 'Healthcare', 'IT/Software', 'Clean Energy', 'Transportation'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100'],
            locations: ['Metro City', 'Tier 2 City'],
            existingSupport: null
        },
        applicationLink: 'https://www.sidbivcf.in/en/funds/ffs',
        targetAudience: 'DPIIT Recognized Startups'
    },
    // Additional schemes
    {
        name: 'Technology Incubation and Development of Entrepreneurs (TIDE)',
        description: 'Provides financial and technical support to technology business incubators at academic institutions for promoting entrepreneurship, focusing on emerging technologies.',
        ministry: 'Ministry of Electronics and Information Technology',
        fundingAmount: 'Up to ₹1.55 Crore per incubator',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction'],
            industryTypes: ['IT/Software', 'EdTech', 'FinTech', 'Healthcare'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Metro City', 'Tier 2 City', 'Special Economic Zone'],
            existingSupport: false
        },
        applicationLink: 'https://www.meity.gov.in/tide',
        targetAudience: 'Tech Startups & Academic Incubators'
    },
    {
        name: 'NewGen IEDC (Innovation and Entrepreneurship Development Centre)',
        description: 'Promotes student-driven innovation and converts innovative ideas into prototypes/products through grants and infrastructure support.',
        ministry: 'Department of Science and Technology',
        fundingAmount: 'Up to ₹2.5 Lakhs per project',
        eligibility: {
            startupStages: ['Ideation', 'Validation'],
            industryTypes: ['IT/Software', 'EdTech', 'Healthcare', 'Clean Energy', 'Manufacturing'],
            annualRevenue: ['Pre-revenue'],
            employeeRanges: ['1-5'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City'],
            existingSupport: false
        },
        applicationLink: 'https://www.nstedb.com/institutional/edc.htm',
        targetAudience: 'Student Entrepreneurs'
    },
    {
        name: 'Technology Development Board (TDB) Scheme',
        description: 'Provides financial assistance to Indian industrial concerns and other agencies for commercialization of indigenous technology and adaptation of imported technology.',
        ministry: 'Department of Science and Technology',
        fundingAmount: 'Up to 50% of project cost (Max ₹10 Crore)',
        eligibility: {
            startupStages: ['Validation', 'Early Traction', 'Scaling'],
            industryTypes: ['Healthcare', 'Clean Energy', 'Manufacturing', 'Transportation'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100'],
            locations: ['Metro City', 'Tier 2 City', 'Industrial Cluster'],
            existingSupport: null
        },
        applicationLink: 'https://tdb.gov.in/',
        targetAudience: 'Technology-intensive Startups'
    },
    {
        name: 'Biotechnology Industry Research Assistance Council (BIRAC) Schemes',
        description: 'Offers various schemes for biotech startups including BIG (Biotechnology Ignition Grant), SBIRI (Small Business Innovation Research Initiative), and more.',
        ministry: 'Department of Biotechnology',
        fundingAmount: 'Up to ₹50 Lakhs (BIG), Up to ₹1 Crore (SBIRI)',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction', 'Scaling'],
            industryTypes: ['Healthcare', 'Agriculture'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore'],
            employeeRanges: ['1-5', '6-20', '21-50'],
            locations: ['Metro City', 'Tier 2 City', 'Industrial Cluster'],
            existingSupport: null
        },
        applicationLink: 'https://birac.nic.in/',
        targetAudience: 'Biotech Startups'
    },
    {
        name: 'Multiplier Grants Scheme',
        description: 'Encourages collaborative R&D between industry and academics/R&D institutions for developing products and packages for Indian electronics industry.',
        ministry: 'Ministry of Electronics and Information Technology',
        fundingAmount: 'Up to 5 times the contribution by industry (Max ₹2 Crore)',
        eligibility: {
            startupStages: ['Validation', 'Early Traction', 'Scaling'],
            industryTypes: ['IT/Software', 'Manufacturing', 'Transportation'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100'],
            locations: ['Metro City', 'Industrial Cluster', 'Special Economic Zone'],
            existingSupport: null
        },
        applicationLink: 'https://www.meity.gov.in/content/multiplier-grants-scheme',
        targetAudience: 'Electronics Manufacturers'
    },
    {
        name: 'MSME Cluster Development Programme',
        description: 'Supports the sustainability and growth of MSMEs by addressing common issues such as quality improvement, technology upgradation, and marketing challenges.',
        ministry: 'Ministry of MSME',
        fundingAmount: '70-90% of project cost (Up to ₹15 Crore)',
        eligibility: {
            startupStages: ['Early Traction', 'Scaling', 'Established'],
            industryTypes: ['Manufacturing', 'Retail', 'Agriculture'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100', 'More than 100'],
            locations: ['Tier 2 City', 'Tier 3 City', 'Rural Area', 'Industrial Cluster'],
            existingSupport: null
        },
        applicationLink: 'https://msme.gov.in/node/1768',
        targetAudience: 'MSME Clusters'
    },
    {
        name: 'Pradhan Mantri Mudra Yojana (PMMY)',
        description: 'Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises under three categories - Shishu, Kishore, and Tarun.',
        ministry: 'Department of Financial Services',
        fundingAmount: 'Up to ₹10 Lakh (Shishu: up to ₹50,000, Kishore: ₹50,000 to ₹5 Lakh, Tarun: ₹5 Lakh to ₹10 Lakh)',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction'],
            industryTypes: ['Retail', 'Manufacturing', 'Agriculture', 'Others'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: false
        },
        applicationLink: 'https://www.mudra.org.in/',
        targetAudience: 'Micro Enterprises'
    },
    {
        name: 'Credit Linked Capital Subsidy Scheme for Technology Upgradation',
        description: 'Facilitates technology upgradation by providing upfront capital subsidy to MSMEs on institutional finance for induction of well-established and improved technologies.',
        ministry: 'Ministry of MSME',
        fundingAmount: '15% subsidy on investment (up to ₹15 Lakh)',
        eligibility: {
            startupStages: ['Early Traction', 'Scaling', 'Established'],
            industryTypes: ['Manufacturing'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100'],
            locations: ['Metro City', 'Tier 2 City', 'Industrial Cluster'],
            existingSupport: null
        },
        applicationLink: 'https://msme.gov.in/node/1762',
        targetAudience: 'Manufacturing MSMEs'
    },
    {
        name: 'Women Entrepreneurship Platform (WEP)',
        description: 'Provides mentorship, funding, compliance, and marketing support to aspiring and existing women entrepreneurs, along with incubation and acceleration support.',
        ministry: 'NITI Aayog',
        fundingAmount: 'Various support mechanisms',
        eligibility: {
            startupStages: ['Ideation', 'Validation', 'Early Traction', 'Scaling'],
            industryTypes: ['Agriculture', 'EdTech', 'FinTech', 'Healthcare', 'IT/Software', 'Manufacturing', 'Retail', 'Clean Energy', 'Transportation', 'Others'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore'],
            employeeRanges: ['1-5', '6-20', '21-50'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: null
        },
        applicationLink: 'https://wep.gov.in/',
        targetAudience: 'Women Entrepreneurs'
    },
    {
        name: 'Support for International Patent Protection in Electronics & IT (SIP-EIT)',
        description: 'Provides financial support to MSMEs and technology startups for international patent filing to encourage innovation and protect IP rights.',
        ministry: 'Ministry of Electronics and Information Technology',
        fundingAmount: 'Up to ₹15 Lakh per invention',
        eligibility: {
            startupStages: ['Validation', 'Early Traction', 'Scaling'],
            industryTypes: ['IT/Software', 'EdTech', 'FinTech', 'Healthcare'],
            annualRevenue: ['Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore'],
            employeeRanges: ['1-5', '6-20', '21-50'],
            locations: ['Metro City', 'Tier 2 City', 'Special Economic Zone'],
            existingSupport: null
        },
        applicationLink: 'https://www.meity.gov.in/schemes',
        targetAudience: 'Electronics & IT Startups'
    },
    {
        name: 'Design Clinic Scheme for MSMEs',
        description: 'Brings the design expertise to the MSME sector and helps MSMEs create innovative, high quality products that meet global standards.',
        ministry: 'Ministry of MSME',
        fundingAmount: '60-75% of project cost (up to ₹40 Lakh)',
        eligibility: {
            startupStages: ['Early Traction', 'Scaling', 'Established'],
            industryTypes: ['Manufacturing', 'Retail'],
            annualRevenue: ['₹10 Lakhs - ₹50 Lakhs', '₹50 Lakhs - ₹2 Crore', '₹2 Crore - ₹5 Crore'],
            employeeRanges: ['6-20', '21-50', '51-100'],
            locations: ['Metro City', 'Tier 2 City', 'Industrial Cluster'],
            existingSupport: null
        },
        applicationLink: 'https://designclinicsmsme.org/',
        targetAudience: 'Manufacturing MSMEs'
    },
    {
        name: 'Startup Agriculture-NEXT Scheme',
        description: 'Provides financial assistance to agri-startups for commercialization of innovations in agriculture, focusing on smart and precision farming technologies.',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        fundingAmount: 'Up to ₹25 Lakhs',
        eligibility: {
            startupStages: ['Validation', 'Early Traction'],
            industryTypes: ['Agriculture'],
            annualRevenue: ['Pre-revenue', 'Less than ₹10 Lakhs', '₹10 Lakhs - ₹50 Lakhs'],
            employeeRanges: ['1-5', '6-20'],
            locations: ['Metro City', 'Tier 2 City', 'Tier 3 City', 'Rural Area'],
            existingSupport: false
        },
        applicationLink: 'https://agriindia.gov.in',
        targetAudience: 'Agri-tech Startups'
    }
];

// Seed the schemes
const seedSchemes = async () => {
    try {
        // Clear existing data
        await GovernmentScheme.deleteMany({});
        console.log('Deleted existing government schemes');

        // Insert new data
        const seededSchemes = await GovernmentScheme.insertMany(schemesData);
        console.log(`Seeded ${seededSchemes.length} government schemes`);

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('MongoDB disconnected after seeding');
    } catch (error) {
        console.error('Error seeding government schemes:', error);
        mongoose.disconnect();
        process.exit(1);
    }
};

// Run the seed function
seedSchemes(); 