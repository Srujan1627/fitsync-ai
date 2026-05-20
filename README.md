# FitSync AI

A complete industry-level mobile fitness tracking application with a React Native Expo frontend, Node.js + Express backend, and MongoDB database.

## Features
- User authentication (Signup/Login) with JWT.
- Dashboard with daily calories, steps, duration, and water intake.
- Workout tracking (add and list workouts).
- Smart AI recommendations based on logic.
- Analytics and history view.
- Dark premium UI with glassmorphism design.

## Prerequisites
- Node.js installed
- MongoDB (Atlas Free Tier or Local instance running)
- Expo CLI or Expo Go app on your phone

## Getting Started

### 1. Backend Setup
1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example or use the existing one:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/fitsync
   JWT_SECRET=supersecretfitsyncaitoken2026
   ```
   *(Update `MONGO_URI` to your MongoDB Atlas connection string if you don't have MongoDB running locally).*
4. Run the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Open the app using the Expo Go app on your physical device by scanning the QR code, or press `a` to run on Android emulator, or `i` for iOS simulator.

## Note on Connecting Frontend to Backend
If you are running the backend locally and testing on a physical device, you need to update the `BASE_URL` in `frontend/src/services/api.ts` to use your computer's local network IP address (e.g., `http://192.168.1.5:5000/api`) instead of `localhost`.
