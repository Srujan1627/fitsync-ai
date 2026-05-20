import { Request, Response, NextFunction } from 'express';
import Workout from '../models/Workout';

// Dynamic AI recommendations engine
export const getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    
    // Fetch last few workouts to personalize context
    const recentWorkouts = userId 
      ? await Workout.find({ user: userId }).sort({ date: -1 }).limit(5)
      : [];

    const hasRecentHIIT = recentWorkouts.some(w => w.type.toLowerCase().includes('hiit'));
    const hasRecentStrength = recentWorkouts.some(w => w.type.toLowerCase().includes('strength') || w.type.toLowerCase().includes('weight'));
    const totalDuration = recentWorkouts.reduce((acc, curr) => acc + curr.duration, 0);

    const recommendations = [
      {
        id: '1',
        title: hasRecentHIIT ? 'Deep Muscle Recovery' : 'HIIT Cardio Burst',
        duration: hasRecentHIIT ? '25 min' : '20 min',
        calories: hasRecentHIIT ? '120 kcal' : '300 kcal',
        difficulty: hasRecentHIIT ? 'Beginner' : 'Intermediate',
        reason: hasRecentHIIT 
          ? 'Recommended to release lactic acid and prevent DOMS after your high-intensity HIIT session.' 
          : 'Great for high-efficiency fat burning and metabolic rate conditioning.',
      },
      {
        id: '2',
        title: hasRecentStrength ? 'Active Mobility Flow' : 'Upper Body Strength',
        duration: hasRecentStrength ? '30 min' : '45 min',
        calories: hasRecentStrength ? '140 kcal' : '350 kcal',
        difficulty: hasRecentStrength ? 'Intermediate' : 'Advanced',
        reason: hasRecentStrength 
          ? 'Focuses on stretching tendons, expanding shoulder mobility, and soothing joint tightness.' 
          : 'Highly recommended to build upper muscle density and burn calories at rest.',
      },
      {
        id: '3',
        title: totalDuration > 100 ? 'Deep Meditation & Stretch' : 'Core & Stability',
        duration: totalDuration > 100 ? '15 min' : '20 min',
        calories: totalDuration > 100 ? '50 kcal' : '150 kcal',
        difficulty: 'Beginner',
        reason: totalDuration > 100 
          ? 'Your body has logged over 100 mins of training. This will downregulate your nervous system.' 
          : 'Strengthens your pelvic girdle, transversus abdominis, and lower back stability.',
      }
    ];

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};
