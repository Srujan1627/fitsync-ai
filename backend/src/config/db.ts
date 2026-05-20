import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitsync');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n❌ MONGODB CONNECTION ERROR ❌');
    console.error('Could not connect to MongoDB. If you are trying to use the MongoDB Atlas free tier as requested:');
    console.error('1. Go to https://www.mongodb.com/cloud/atlas and create a free account.');
    console.error('2. Create a free cluster and get the connection string (URI).');
    console.error('3. Add the URI to your fitsync-ai/backend/.env file as MONGO_URI="your_connection_string".');
    console.error('4. Restart the backend server.');
    console.error('\nOriginal Error:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
};

export default connectDB;
