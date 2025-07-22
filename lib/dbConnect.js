import mongoose from 'mongoose';
export const dbConnect = async () => {
  const dbURI = process.env.MONGODB_URI || '';
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(dbURI, {});
      console.log('Database connected successfully');
    } else {
      console.log('Database already connected');
    }

    return mongoose.connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to the database');
  }
};
