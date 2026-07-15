const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const generateToken = require('../src/utils/generateToken');

describe('User Management API', () => {
  let superAdmin, admin, regularUser;
  let superAdminToken, adminToken, userToken;

  beforeEach(async () => {
    // Create seed users
    superAdmin = await User.create({
      name: 'Super Admin User',
      email: 'superadmin@test.com',
      password: 'password123',
      role: 'super_admin',
    });
    superAdminToken = generateToken(superAdmin._id);

    admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(admin._id);

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
    });
    userToken = generateToken(regularUser._id);
  });

  describe('GET /api/users', () => {
    it('should allow Super Admin to list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
    });

    it('should allow Admin to list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should block Regular User from listing users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    const newUserPayload = {
      name: 'New Admin',
      email: 'newadmin@test.com',
      password: 'password123',
      role: 'admin',
    };

    it('should allow Super Admin to create a user with a specific role', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(newUserPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });

    it('should block Admin from creating a user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUserPayload);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow users to update their own profile fields except role', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Regular User Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Regular User Name');
    });

    it('should block users from updating their own role', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only Super Admins can update roles');
    });

    it('should allow Super Admin to update anyone\'s role', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow Super Admin to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should block Admin from deleting a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
