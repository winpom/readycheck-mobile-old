const mongoose = require('mongoose');

// Enable Mongoose debug mode for detailed connection information
mongoose.set('debug', true);

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/readyCheckDB';

// Ensure the connection string includes TLS/SSL if required
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

module.exports = mongoose.connection;
