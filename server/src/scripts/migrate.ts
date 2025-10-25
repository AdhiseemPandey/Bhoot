import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Add any database migrations here
    console.log('✅ Database migration completed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateDatabase();