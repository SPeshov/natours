const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email photo, password, passwordConfirm

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name.'],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Please provide valid email.'],
    unique: true,
    lowercase: true,
  },
  photo: String,
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [8, 'Password needs to be at least 8 characters.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password error'],
    validate: {
      //This will only work on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same.',
    },
  },
});

userSchema.pre('save', async function (next) {
  // only run if password was modified
  if (!this.isModified('password')) {
    return next();
  }

  //hash with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //because we need it only for validation
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
