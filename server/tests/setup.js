const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Start memory database server before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set mock environment variables
  process.env.MONGO_URI = mongoUri;
  process.env.JWT_SECRET = 'testsecretkey12345!';
  process.env.NODE_ENV = 'test';

  // Connect mongoose to memory db
  await mongoose.connect(mongoUri);
});

// Clear all database collections between test suites to prevent leaking state
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
