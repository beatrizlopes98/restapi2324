const Post = require('../models/postModel');
const Alumni = require('../models/alumniModel');
const Notification = require('../models/notificationModel');

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

exports.createPost = async (req, res) => {
    try {
        const { text, image } = req.body;
        const newPost = new Post({
            user_id: req.userId,
            text,
            image
        });
        const savedPost = await newPost.save();

        const alumni = await Alumni.findOneAndUpdate(
            { user_id: req.userId },
            { $push: { posts: savedPost._id } },
            { new: true }
        );


        alumni.pontos_xp += 20;
        await alumni.save();

        res.status(201).json({ success: true, data: savedPost });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


// Update a post
exports.updatePost = async (req, res) => {
    try {
        // Get the post by ID
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }

        // Check if the user is the owner of the post or an admin
        if (post.user_id.toString() !== req.userId && req.userType !== 'admin') {
            return res.status(403).json({ success: false, msg: 'You are not authorized to update this post' });
        }

        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedPost });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Delete a post (Including Comments and Likes)
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Find the deleted post
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }

        // Remove the post ID from all Alumni documents' posts field
        await Alumni.updateMany(
            { posts: postId },
            { $pull: { posts: postId } }
        );

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

        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        alumni.pontos_xp += 5;
        await alumni.save();

        // Notify post owner
        const postOwner = await Alumni.findOne({ user_id: post.user_id });
        const notification = new Notification({
            recipient: postOwner.user_id,
            sender: alumni.user_id,
            type: 'comment',
            postId: post._id
        });
        await notification.save();

        res.status(200).json({ success: true, data: post.comments });
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
        res.status(200).json({ success: true, msg: 'Comment deleted successfully' });
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

        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        const alreadyLiked = post.likes.some(like => like.user_id.toString() === req.userId);
        if (alreadyLiked) {
            return res.status(400).json({ success: false, msg: 'You have already liked this post' });
        }

        post.likes.push({ user_id: req.userId });
        alumni.likes.push({ like_id: post._id, like_type: 'Post' });

        alumni.pontos_xp += 2;
        await post.save();
        await alumni.save();

        // Notify post owner
        const postOwner = await Alumni.findOne({ user_id: post.user_id });
        const notification = new Notification({
            recipient: postOwner.user_id,
            sender: alumni.user_id,
            type: 'like',
            postId: post._id
        });
        await notification.save();

        res.status(200).json({ success: true, data: post.likes });
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

        // Check if the user has liked the post
        const likeIndex = post.likes.findIndex(like => like.user_id.toString() === req.userId);
        if (likeIndex === -1) {
            return res.status(400).json({ success: false, msg: 'You have not liked this post' });
        }

        // Remove the user's like from the post
        post.likes.splice(likeIndex, 1);

        // Find the alumni and remove the like from the liked_items array
        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }
        alumni.likes = alumni.likes.filter(
            item => !(item.like_id.toString() === post._id.toString() && item.like_type === 'Post')
        );

        await post.save();
        await alumni.save();

        res.status(200).json({ success: true, msg: "Like deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};
