const { MongoMemoryServer } = require('mongodb-memory-server');

const startMockServer = async () => {
  console.log('Starting In-Memory MongoDB Server for development...');
  
  // Create an in-memory database server instance
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  console.log(`In-Memory MongoDB Server running at: ${mongoUri}`);
  
  // Set the environment variable so mongoose connects here
  process.env.MONGO_URI = mongoUri;
  
  // Import and run the main entry point
  require('./server');
};

startMockServer().catch((err) => {
  console.error('Failed to boot mock database server:', err);
  process.exit(1);
});
