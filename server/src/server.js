require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedSuperAdmin = require('./seeders/superAdminSeeder');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Run Seeders
  await seedSuperAdmin();

  // 3. Start Server listener
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
