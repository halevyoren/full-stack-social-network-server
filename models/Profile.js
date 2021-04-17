const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  company: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  bio: {
    type: String
  },
  githubusername: {
    type: String
  },
  experience: [
    {
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      descroption: {
        type: String
      }
    }
  ],
  education: [
    {
      school: {
        type: String,
        default: false
      },
      degree: {
        type: String,
        default: false
      },
      fieldofstudy: {
        type: String,
        default: false
      },
      from: {
        type: Date,
        default: false
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      descroption: {
        type: String
      }
    }
  ],
  social: {
    youtube: {
      type: string
    },
    twitter: {
      type: string
    },
    facebook: {
      type: string
    },
    linkedin: {
      type: string
    },
    instegram: {
      type: string
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
