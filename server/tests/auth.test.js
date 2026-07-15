const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication API', () => {
  const registerPayload = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('name', registerPayload.name);
      expect(res.body.data).toHaveProperty('email', registerPayload.email);
      expect(res.body.data).toHaveProperty('role', 'user');

      // Verify user was created in the database
      const dbUser = await User.findOne({ email: registerPayload.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(registerPayload.name);
    });

    it('should fail registration if email is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should fail registration if email already exists', async () => {
      // Pre-create a user
      await User.create(registerPayload);

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(registerPayload);
    });

    it('should log in successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.email).toBe(registerPayload.email);
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should fetch the profile when a valid JWT token is provided', async () => {
      // Create user
      const user = await User.create(registerPayload);

      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });
      
      const token = loginRes.body.token;

      // Get profile
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.email).toBe(registerPayload.email);
    });

    it('should reject requests without a token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
