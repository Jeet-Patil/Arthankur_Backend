const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Funding = require('../models/Funding');
require('dotenv').config();

// Initialize Gemini with API Key
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD0yOAfvMzZ4D1DeCNM0AzlmWmfn1l7CiM";
const genAI = new GoogleGenerativeAI(API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// System prompt for the chatbot
const systemPrompt = `You are a helpful assistant for Arthankur, a platform that connects startups with investors.
Your role is to help users with questions about the platform.
Here's some information about Arthankur:
- Startups can create funding requests and loan applications
- Investors can browse and express interest in funding requests
- There's a community section where users can connect and share ideas
- Users can schedule and conduct meetings through the platform
- Startups have access to financial tools for cash flow forecasting and working capital analysis
- Startups can manage their tax compliance through the platform
- Users can upload and view documents related to funding requests
- Keep responses concise and helpful
`;

// Enhanced prompt for personalized recommendations based on user data
const getPersonalizedPrompt = (userData) => `
You are providing personalized recommendations to a startup founder based on their profile data:

Startup Profile Data:
- Company: ${userData.company || 'Not specified'}
- Industry: ${userData.industry || userData.industryType || 'Not specified'}
- Stage: ${userData.startupStage || 'Not specified'}
- Revenue: ${userData.annualRevenue || 'Not specified'}
- Team Size: ${userData.numberOfEmployees || 'Not specified'} employees
- Location: ${userData.registeredLocation || userData.location || 'Not specified'}
- Government Support: ${userData.existingGovernmentSupport || 'Not specified'}

Your task is to analyze this data and provide specific recommendations for:
1. Funding strategies appropriate for their stage and industry
2. Financial tools they should prioritize using
3. Resources or features on Arthankur that would benefit them most
4. Potential growth opportunities based on their industry
5. Compliance requirements they should be aware of

Keep your recommendations specific to their profile, actionable, and concise.
Focus on their most immediate needs based on their stage and industry.
Format your response clearly with bullet points and sections.
`;

// Status check endpoint
router.get('/status', (req, res) => {
  try {
    if (geminiModel) {
      res.json({ status: 'available', mode: 'gemini' });
    } else {
      res.json({ 
        status: 'unavailable', 
        mode: 'local',
        reason: 'initialization_failed'
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    res.json({ 
      status: 'unavailable', 
      mode: 'local',
      reason: 'error'
    });
  }
});

// Message endpoint
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize chat with context
    const chat = geminiModel.startChat({
      history: [
        { role: 'user', parts: [{ text: 'You are an assistant for Arthankur platform.' }] },
        { role: 'model', parts: [{ text: 'I understand. I am now an assistant for Arthankur, a platform that connects startups with investors. How can I help you?' }] },
      ],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    // Send message with system prompt as context
    const result = await chat.sendMessage(systemPrompt + "\n\nUser question: " + message);
    const response = result.response.text();
    
    res.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to process message', 
      details: error.message 
    });
  }
});

// Personalized recommendations endpoint (requires authentication)
router.post('/recommendations', auth, async (req, res) => {
  try {
    // Get the user data from auth middleware
    const user = req.user;
    
    // Check if the user is a startup
    if (user.userType !== 'startup') {
      return res.status(400).json({ 
        error: 'Personalized recommendations are only available for startup profiles' 
      });
    }

    // Get additional data if needed
    const { message } = req.body;
    const userQuestion = message || "What recommendations do you have for my startup?";

    // Initialize chat with personalized context
    const chat = geminiModel.startChat({
      history: [
        { role: 'user', parts: [{ text: 'You are providing personalized recommendations for an Arthankur startup user.' }] },
        { role: 'model', parts: [{ text: 'I understand. I will analyze their profile data and provide tailored recommendations for their startup.' }] },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.4, // Lower temperature for more focused recommendations
      },
    });

    // Send message with personalized prompt based on user data
    const personalPrompt = getPersonalizedPrompt(user) + "\n\nUser question: " + userQuestion;
    const result = await chat.sendMessage(personalPrompt);
    const response = result.response.text();
    
    res.json({ 
      success: true,
      response,
      profileData: {
        company: user.company,
        industry: user.industry || user.industryType,
        stage: user.startupStage,
        employees: user.numberOfEmployees,
        revenue: user.annualRevenue
      }
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate personalized recommendations', 
      details: error.message 
    });
  }
});

module.exports = router;