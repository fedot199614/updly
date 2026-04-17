import mongoose from 'mongoose';
import { dbConfig } from '@/backend/db/config/db.config';

const initialize = async () => {
  const db = await mongoose.connect(dbConfig.DATABASE_URL);

  return { db };
};

export default initialize;
