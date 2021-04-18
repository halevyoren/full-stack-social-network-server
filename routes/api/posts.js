const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const router = express.Router();

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required.').notEmpty()]],
  async (req, res) => {
    // checking for validation errors in the body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }

    try {
      //get user object (without password) of the connected user
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      ///return the saved post
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
