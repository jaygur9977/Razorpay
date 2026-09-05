import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`🗑️  Cleared: ${collection.collectionName}`);
    }

    console.log('\n✅ ALL DATA CLEARED SUCCESSFULLY!');
    console.log('Database is now fresh. Ready for new data.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearAllData();