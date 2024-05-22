const Post = require('../models/postModel');
const jwt = require('jsonwebtoken');

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ success: false, msg: "No token provided!" });
    }

    let token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, msg: "Unauthorized access!" });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, msg: "Failed to authenticate token." });
        }
        req.userId = decoded.id;
        next();
    });
};

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user_id', 'username profilePicture')
            .populate('comments.user_id', 'username profilePicture')
            .populate('likes.user_id', 'username profilePicture');
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Get post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user_id', 'username profilePicture')
            .populate('comments.user_id', 'username profilePicture')
            .populate('likes.user_id', 'username profilePicture');
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Create a post
exports.createPost = async (req, res) => {
    try {
        const { text, image } = req.body;
        const newPost = new Post({
            user_id: req.userId,
            text,
            image
        });
        const savedPost = await newPost.save();
        res.status(201).json({ success: true, data: savedPost });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        res.status(200).json({ success: true, data: updatedPost });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Delete a post (Including Comments and Likes)
exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        res.status(200).json({ success: true, msg: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        post.comments.push({ user_id: req.userId, content });
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        const commentIndex = post.comments.findIndex(comment => comment._id.toString() === req.params.commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ success: false, msg: 'Comment not found' });
        }
        post.comments.splice(commentIndex, 1);
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Add a like to a post
exports.addLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        post.likes.push({ user_id: req.userId });
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Remove a like from a post
exports.removeLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        post.likes = post.likes.filter(like => like.user_id.toString() !== req.userId);
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

