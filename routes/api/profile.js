const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const router = express.Router();

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // finding profile with the current user's id and getting the user's name and avatar
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required.').notEmpty(),
      check('skills', 'Skills are required').notEmpty()
    ]
  ],
  async (req, res) => {
    // checking for errors in the body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //extract the fields of the profile
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    // initialize and build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //if there is a profile than update it, otherwise create it
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    // getting an array with all the profiles and to each is added the name and avtar of the user
    const allProfiles = await Profile.find().populate('user', [
      'name',
      'avatar'
    ]);
    res.json(allProfiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const userProfile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!userProfile) {
      return res.status(400).json({ msg: 'Profile not found.' });
    }

    res.json(userProfile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == 'ObjectId') {
      // in case user_id is not a valid user id (for example its to long)
      return res.status(400).json({ msg: 'Profile not found.' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove user posts

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User Deleted!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile exxperience
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required.').notEmpty(),
      check('from', 'From date is required.').notEmpty(),
      check('company', 'Company is required.').notEmpty()
    ]
  ],
  async (req, res) => {
    // checking for validation errors in the body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //extract the fields of the experience from body
    const {
      description,
      location,
      company,
      current,
      title,
      from,
      to
    } = req.body;

    const newExp = {
      description,
      location,
      company,
      current,
      title,
      from,
      to
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // push the experience to the begining
      profile.experience.unshift(newExp);

      // update the profile
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error.');
    }
  }
);

module.exports = router;
