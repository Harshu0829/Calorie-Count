// Database cleanup script
// WARNING: This will DELETE ALL food-related data!

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calorie_tracker';

async function cleanupDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // List of collections to clean
        const collectionsToClean = [
            'foods',
            'foodanalyses',
            'meals',
            'manualmeals',
            'food_logs'
        ];

        console.log('\n⚠️  WARNING: About to delete data from these collections:');
        collectionsToClean.forEach(col => console.log(`   - ${col}`));
        console.log('\n⏳ Starting cleanup in 3 seconds...\n');

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Drop each collection
        for (const collectionName of collectionsToClean) {
            try {
                const collections = await db.listCollections({ name: collectionName }).toArray();

                if (collections.length > 0) {
                    await db.collection(collectionName).deleteMany({});
                    const count = await db.collection(collectionName).countDocuments();
                    console.log(`✅ Cleaned ${collectionName} - ${count} documents remaining`);
                } else {
                    console.log(`ℹ️  ${collectionName} - collection doesn't exist`);
                }
            } catch (err) {
                console.error(`❌ Error cleaning ${collectionName}:`, err.message);
            }
        }

        console.log('\n✅ Database cleanup completed!\n');

    } catch (error) {
        console.error('❌ Database cleanup failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run cleanup
cleanupDatabase();
