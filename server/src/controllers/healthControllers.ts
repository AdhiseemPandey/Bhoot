import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redis from '../config/redis';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection
    const redisStatus = await pingRedis();
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      redis: redisStatus,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
};

const pingRedis = async (): Promise<string> => {
  try {
    await redis.ping();
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
};