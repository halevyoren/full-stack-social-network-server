const express = require('express');
const request = require('request');
const config = require('config');
const { check, validationResult, body } = require('express-validator');

const multer = require('multer');
const { cloudinary } = require('../../utils/cloudinary');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

const router = express.Router();

const upload = multer();

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
    upload.single('file'),
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
      linkedin,
      image
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

      if (image) {
        let avatar;
        const CloudinaryResponse = await cloudinary.uploader.upload(image);
        avatar = CloudinaryResponse.url;
        const user = await User.findOneAndUpdate(
          { _id: req.user.id },
          { avatar: avatar }
        );
      }

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
    // remove user posts
    await Post.deleteMany({ user: req.user.id });

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
// @desc    Add profile experience
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
    if (to && new Date(from) > new Date(to)) {
      return res.status(400).json({ msg: 'From or to Date is incorrect' });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // push the experience to the begining
      profile.experience.unshift(newExp);

      // update the profile
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/profile/experience/:exp_id
// @desc    Update experience from profile
// @access  Private
router.put('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of experience to update
    const updateIndex = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);

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

    //Create a new experience
    const newExp = {
      description,
      location,
      company,
      current,
      title,
      from,
      to
    };

    profile.experience[updateIndex] = newExp;

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required.').notEmpty(),
      check('degree', 'Degree is required.').notEmpty(),
      check('fieldofstudy', 'Field Of Study is required.').notEmpty(),
      check('from', 'From date is required.').notEmpty()
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
      fieldofstudy,
      description,
      current,
      degree,
      school,
      from,
      to
    } = req.body;

    const newEdu = {
      fieldofstudy,
      description,
      current,
      degree,
      school,
      from,
      to
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // push the education to the begining
      profile.education.unshift(newEdu);

      // update the profile
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/profile/education/:edu_id
// @desc    Update education from profile
// @access  Private
router.put('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of education to update
    const updateIndex = profile.education
      .map((exp) => exp.id)
      .indexOf(req.params.edu_id);

    //extract the fields of the education from body
    const {
      fieldofstudy,
      description,
      current,
      degree,
      school,
      from,
      to
    } = req.body;

    //Create a new education
    const newEdu = {
      fieldofstudy,
      description,
      current,
      degree,
      school,
      from,
      to
    };

    profile.education[updateIndex] = newEdu;

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((exp) => exp.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public
router.get('/github/:username', (req, res) => {
  try {
    //getting the repos (5) of the user in acesnding order from github
    const options = {
      uri: `https://api/profile/github/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
