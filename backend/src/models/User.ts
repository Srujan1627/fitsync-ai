import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  height: {
    type: Number, // in cm
  },
  weight: {
    type: Number, // in kg
  },
  dailyGoals: {
    calories: { type: Number, default: 2000 },
    steps: { type: Number, default: 10000 },
    water: { type: Number, default: 2000 }, // in ml
  }
}, {
  timestamps: true,
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
