const cloudinary = require('cloudinary').v2;
const config = require('config');

cloudinary.config({
  cloud_name: config.get('CloudinaryName'),
  api_key: config.get('CloudinaryKey'),
  api_secret: config.get('CloudinarySecret')
});

module.exports = { cloudinary };
