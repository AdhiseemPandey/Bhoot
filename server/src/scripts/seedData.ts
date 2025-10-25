import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import QuestionBank from '../models/QuestionBank';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    // Clear existing data
    await User.deleteMany({});
    await QuestionBank.deleteMany({});

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
    });

    // Create sample question bank
    await QuestionBank.create({
      title: 'General Knowledge',
      description: 'Test your general knowledge with these questions',
      owner: user._id,
      questions: [
        {
          questionText: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          timeLimit: 20,
          points: 1000
        },
        {
          questionText: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1,
          timeLimit: 20,
          points: 1000
        },
        {
          questionText: 'What is the largest mammal in the world?',
          options: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
          correctAnswer: 1,
          timeLimit: 20,
          points: 1000
        }
      ],
      isPublic: true,
      tags: ['general', 'knowledge', 'trivia']
    });

    console.log('✅ Seed data created successfully');
    console.log('📧 Test user: test@example.com');
    console.log('🔑 Test password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();