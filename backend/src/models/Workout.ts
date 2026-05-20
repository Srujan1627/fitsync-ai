import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  caloriesBurned: {
    type: Number,
    required: true,
  },
  steps: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  }

}, {
  timestamps: true,
});

// Optimize DB queries using compound index on user and date
workoutSchema.index({ user: 1, date: -1 });

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;

