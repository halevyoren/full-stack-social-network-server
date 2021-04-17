// in this file is the mongoDB connection

const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //getting the mongoURI from the default.json file

//connecting to mongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    });

    console.log('MongoDB Connected');
  } catch (error) {
    //logging the error
    console.error(error.message);

    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
