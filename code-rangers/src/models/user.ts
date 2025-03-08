import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'student',
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

export default mongoose.models.User || mongoose.model('User', UserSchema);