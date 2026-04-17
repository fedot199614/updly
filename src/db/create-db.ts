import mongoose from 'mongoose';

const initialize = async () => {
  const db = await mongoose.connect(process.env.DATABASE_URL as string);

  return { db };
};

export default initialize;
