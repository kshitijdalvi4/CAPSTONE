import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  experience: { type: String, default: 'beginner' },
  solvedProblems: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

export default User;
