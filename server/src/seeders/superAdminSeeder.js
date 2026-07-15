const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    // Check if any Super Admin exists
    const superAdminExists = await User.findOne({ role: 'super_admin' });

    if (!superAdminExists) {
      console.log('No Super Admin found. Seeding Super Admin...');

      const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
      const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@worksphere.com';
      const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminSecurePassword123!';

      await User.create({
        name,
        email,
        password,
        role: 'super_admin',
      });

      console.log(`Super Admin seeded successfully:
- Email: ${email}
- Password: ${password.substring(0, 3)}... [Hidden]`);
    } else {
      console.log('Super Admin already exists. Seeding skipped.');
    }
  } catch (error) {
    console.error(`Super Admin Seeding Failed: ${error.message}`);
  }
};

module.exports = seedSuperAdmin;
