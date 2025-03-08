import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [8, 'Username must be at least 8 characters long'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },

//   contact: {
//     phone: {
//       type: String,
//     },
//     address: {
//       street: {
//         type: String,
//       },
//       city: {
//         type: String,
//       },
//       state: {
//         type: String,
//       },
//       zip: {
//         type: String,
//       },
//     },
//   },
});

// Check if model exists before creating a new one
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;