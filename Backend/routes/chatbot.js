const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

module.exports = router; 