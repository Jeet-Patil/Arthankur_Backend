const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');

// Process payment
router.post('/process', auth, async (req, res) => {
    try {
        const { amount, token, purpose, userId } = req.body;

        // Validate input
        if (!amount || !token || !purpose) {
            return res.status(400).json({ message: 'Missing required payment information' });
        }

        // Create the charge
        const charge = await stripe.charges.create({
            amount: amount * 100, // Convert to cents/paise
            currency: 'inr',
            source: token.id,
            description: `Payment for ${purpose} by user ${userId}`,
            receipt_email: token.email,
        });

        // Save payment record to database
        // This would typically involve creating a Payment model and saving the details
        // For now, we'll just return success

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            paymentId: charge.id
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
});

// Get payment history for a user
router.get('/history', auth, async (req, res) => {
    try {
        // This would typically involve querying the database for payment records
        // For now, we'll just return a placeholder response
        
        res.status(200).json({
            success: true,
            payments: []
        });
        
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch payment history'
        });
    }
});

module.exports = router;