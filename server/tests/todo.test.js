const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Todo = require('../src/models/Todo');
const generateToken = require('../src/utils/generateToken');

describe('Todo API', () => {
  let admin, user1, user2;
  let adminToken, user1Token, user2Token;
  let todoByUser1, todoAssignedToUser2;

  beforeEach(async () => {
    // Create users
    admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(admin._id);

    user1 = await User.create({
      name: 'User One',
      email: 'user1@test.com',
      password: 'password123',
      role: 'user',
    });
    user1Token = generateToken(user1._id);

    user2 = await User.create({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'password123',
      role: 'user',
    });
    user2Token = generateToken(user2._id);

    // Create a todo created by user1
    todoByUser1 = await Todo.create({
      title: 'Todo by User 1',
      description: 'First todo',
      status: 'pending',
      priority: 'high',
      creator: user1._id,
    });

    // Create a todo created by user1 but assigned to user2
    todoAssignedToUser2 = await Todo.create({
      title: 'Todo assigned to User 2',
      description: 'Assigned todo',
      status: 'in_progress',
      priority: 'medium',
      creator: user1._id,
      assignedTo: user2._id,
    });
  });

  describe('POST /api/todos', () => {
    it('should create a todo successfully', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'New Todo',
          description: 'A new description',
          priority: 'low',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Todo');
      expect(res.body.data.creator).toBe(user1._id.toString());
    });

    it('should fail if title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          description: 'A new description',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/todos', () => {
    it('should return only related todos (created or assigned) for a regular user', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1); // Should only see todoAssignedToUser2, not todoByUser1
      expect(res.body.data[0]._id.toString()).toBe(todoAssignedToUser2._id.toString());
    });

    it('should return all todos for an Admin', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2); // Sees both
    });

    it('should support filtering by status and priority', async () => {
      const res = await request(app)
        .get('/api/todos?status=in_progress')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('in_progress');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should allow the creator to view the todo', async () => {
      const res = await request(app)
        .get(`/api/todos/${todoByUser1._id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe(todoByUser1.title);
    });

    it('should allow the assignee to view the todo', async () => {
      const res = await request(app)
        .get(`/api/todos/${todoAssignedToUser2._id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(200);
    });

    it('should deny unauthorized user from viewing the todo', async () => {
      const res = await request(app)
        .get(`/api/todos/${todoByUser1._id}`)
        .set('Authorization', `Bearer ${user2Token}`); // User 2 is not related to todoByUser1

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should allow the creator to update details', async () => {
      const res = await request(app)
        .put(`/api/todos/${todoByUser1._id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });

    it('should deny unauthorized user from updating the todo', async () => {
      const res = await request(app)
        .put(`/api/todos/${todoByUser1._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should allow creator to delete todo', async () => {
      const res = await request(app)
        .delete(`/api/todos/${todoByUser1._id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should deny non-creator from deleting todo (even if assigned)', async () => {
      const res = await request(app)
        .delete(`/api/todos/${todoAssignedToUser2._id}`)
        .set('Authorization', `Bearer ${user2Token}`); // Assigned to User 2, but created by User 1

      expect(res.statusCode).toBe(403);
    });

    it('should allow Admin to delete any todo', async () => {
      const res = await request(app)
        .delete(`/api/todos/${todoByUser1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
