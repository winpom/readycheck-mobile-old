const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: async function(username) {
        const user = await this.constructor.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        return !user; 
      },
      message: 'Username must be unique.',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  status: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 140,
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  ownedReadyChecks: [{
    type: Schema.Types.ObjectId,
    ref: 'ReadyCheck',
  }],
  receivedReadyChecks: [{
    type: Schema.Types.ObjectId,
    ref: 'ReadyCheck',
  }]
});

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log('Hashed Password:', this.password); // Log hashed password for debugging
  }

  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  const isCorrect = await bcrypt.compare(password, this.password);
  console.log('Password comparison result:', isCorrect); // Log comparison result for debugging
  return isCorrect;
};

userSchema.virtual('Following').get(function () {
  return this.friends.length;
});

userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const User = model('User', userSchema);

module.exports = User;