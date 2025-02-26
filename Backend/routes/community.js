const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Community = require('../models/Community');
const auth = require('../middleware/auth');

// Get current user
router.get('/users/me', auth, async (req, res) => {
    try {
        res.json({ _id: req.user.id });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all posts
router.get('/posts/all', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new post
router.post('/posts', auth, async (req, res) => {
    try {
        console.log('Creating new post with data:', {
            title: req.body.title,
            content: req.body.content,
            userId: req.user.id
        });

        if (!req.body.content || !req.body.title) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user.id
        });

        const newPost = await post.save();
        console.log('Post created successfully:', newPost);

        // Fetch the complete post with populated author
        const populatedPost = await Post.findById(newPost._id).populate('author', 'name');
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(400).json({ message: error.message });
    }
});

// Create a new community
router.post('/communities', auth, async (req, res) => {
    try {
        console.log('Creating new community with data:', {
            name: req.body.name,
            description: req.body.description,
            creatorId: req.user.id
        });

        if (!req.body.name || !req.body.description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        const community = new Community({
            name: req.body.name,
            description: req.body.description,
            members: [req.user.id],  // Add creator as first member
            moderators: [req.user.id]  // Make creator a moderator
        });

        const newCommunity = await community.save();
        console.log('Community created successfully:', newCommunity);

        res.status(201).json({
            ...newCommunity.toObject(),
            joined: true  // Creator is automatically a member
        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all communities
router.get('/communities/all', auth, async (req, res) => {
    try {
        const communities = await Community.find();
        // Add a 'joined' field to each community based on user membership
        const communitiesWithJoinStatus = communities.map(community => ({
            ...community.toObject(),
            joined: community.members.includes(req.user.id)
        }));
        res.json(communitiesWithJoinStatus);
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ message: error.message });
    }
});

// Join a community
router.post('/communities/:id/join', auth, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check if user is already a member
        if (community.members.includes(req.user.id)) {
            // Remove user from community (unjoin)
            community.members = community.members.filter(
                memberId => memberId.toString() !== req.user.id
            );
        } else {
            // Add user to community
            community.members.push(req.user.id);
        }

        await community.save();
        res.json({ message: 'Community membership updated successfully' });
    } catch (error) {
        console.error('Error updating community membership:', error);
        res.status(500).json({ message: error.message });
    }
});

// Like a post
router.post('/posts/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove from dislikes if present
        const dislikeIndex = post.dislikes.indexOf(req.user.id);
        if (dislikeIndex > -1) {
            post.dislikes.splice(dislikeIndex, 1);
        }

        // Toggle like
        const likeIndex = post.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json({ message: 'Post like updated successfully' });
    } catch (error) {
        console.error('Error updating post like:', error);
        res.status(500).json({ message: error.message });
    }
});

// Dislike a post
router.post('/posts/:id/dislike', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove from likes if present
        const likeIndex = post.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        }

        // Toggle dislike
        const dislikeIndex = post.dislikes.indexOf(req.user.id);
        if (dislikeIndex > -1) {
            // Remove dislike
            post.dislikes.splice(dislikeIndex, 1);
        } else {
            // Add dislike
            post.dislikes.push(req.user.id);
        }

        await post.save();
        res.json({ message: 'Post dislike updated successfully' });
    } catch (error) {
        console.error('Error updating post dislike:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add comment to a post
router.post('/posts/:id/comment', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            user: req.user.id,
            content: req.body.content
        });

        await post.save();
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 