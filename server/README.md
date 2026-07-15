# WorkSphere Backend Service

A secure, scalable REST API built using **Node.js, Express.js, and MongoDB** to power the WorkSphere platform. Features includes JWT authentication, custom role-based access controls (RBAC), super admin seeding, request validation, and clean error handling.

---

## Technical Stack
- **Runtime Environment:** Node.js (>= 18.0.0)
- **Framework:** Express.js
- **Database ORM:** Mongoose / MongoDB
- **Security & Cryptography:** bcryptjs (password hashing), jsonwebtoken (JWT token management)
- **Validation Library:** express-validator
- **Testing Suite:** Jest, Supertest, mongodb-memory-server (isolated database mock)

---

## Project Structure
```
/
├── src/
│   ├── app.js                 # Express Application setup & middleware mapping
│   ├── server.js              # Entry point, DB connection, & server startup
│   ├── config/
│   │   └── db.js              # Mongoose DB connection logic
│   ├── controllers/
│   │   ├── authController.js  # Auth (register, login, me) operations
│   │   ├── userController.js  # User administration operations (RBAC)
│   │   └── todoController.js  # Todo management operations
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & context injector
│   │   ├── role.js            # Role validator (RBAC helper)
│   │   ├── validate.js        # Form validation formatter
│   │   └── error.js           # Central error interceptor
│   ├── models/
│   │   ├── User.js            # User Schema & password hashing triggers
│   │   └── Todo.js            # Todo Schema & assignee links
│   ├── routes/
│   │   ├── auth.js            # Authentication routing
│   │   ├── users.js           # User CRUD routing
│   │   └── todos.js           # Todo CRUD routing
│   ├── seeders/
│   │   └── superAdminSeeder.js# Automatic super_admin startup seeder
│   └── utils/
│       ├── generateToken.js   # JWT signature creation helper
│       └── validators.js      # Endpoint schema rules
└── tests/
    ├── setup.js               # Jest mock database initializer
    ├── auth.test.js           # Auth endpoint test suite
    ├── user.test.js           # Users endpoint test suite
    └── todo.test.js           # Todos endpoint test suite
```

---

## Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** and **MongoDB** (local or Atlas cluster) installed.

### 2. Configure Environment Variables
Create a `.env` file in the root directory (one is already prepared for you):
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/worksphere
JWT_SECRET=supersecurejwtsecret12345!
NODE_ENV=development

# Super Admin Seeder Credentials
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=superadmin@worksphere.com
SUPER_ADMIN_PASSWORD=SuperAdminSecurePassword123!
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
On start, the database will connect, and the **Super Admin Seeder** will automatically run to seed the default credentials if a super admin account does not exist.

---

## Role-Based Access Controls (RBAC)

The system defines 3 roles:
1. `super_admin`: Full authority to manage users (CRUD), promote user roles, and manage all todos.
2. `admin`: Access to list and read users; full CRUD authority to manage all todos.
3. `user`: Access to edit own profile (excluding role); CRUD authority over todos they created or are assigned to.

---

## API Catalog & Reference

All endpoints except registration and login require authorization. Attach the token in your headers:
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication API (`/api/auth`)

#### Register a New User
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public (Role defaults to `user`)
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "janedoe@example.com",
    "password": "securepassword123"
  }
  ```

#### Login
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "janedoe@example.com",
    "password": "securepassword123"
  }
  ```

#### Get Current User Profile
* **Endpoint:** `GET /api/auth/me`
* **Access:** Authenticated (All roles)

---

### 2. User Administration API (`/api/users`)

#### List All Users
* **Endpoint:** `GET /api/users`
* **Access:** `super_admin`, `admin`

#### Create a User
* **Endpoint:** `POST /api/users`
* **Access:** `super_admin` (Used to create custom admins or super admins)
* **Request Body:**
  ```json
  {
    "name": "Manager Mark",
    "email": "manager@worksphere.com",
    "password": "managerpassword123",
    "role": "admin"
  }
  ```

#### Get User Profile by ID
* **Endpoint:** `GET /api/users/:id`
* **Access:** `super_admin`, `admin`, or Self

#### Update User Profile
* **Endpoint:** `PUT /api/users/:id`
* **Access:** `super_admin` or Self
* **Notes:** Only `super_admin` can update a user's `role`.
* **Request Body (Optional fields):**
  ```json
  {
    "name": "Jane Admin Doe",
    "role": "admin"
  }
  ```

#### Delete User
* **Endpoint:** `DELETE /api/users/:id`
* **Access:** `super_admin` (Super admins cannot delete themselves)

---

### 3. Todo API (`/api/todos`)

#### Create a Todo
* **Endpoint:** `POST /api/todos`
* **Access:** Authenticated (All roles)
* **Request Body:**
  ```json
  {
    "title": "Refactor Database Schema",
    "description": "Optimize indexes and add new relations",
    "priority": "high",
    "assignedTo": "647a5... [Optional User ObjectId]"
  }
  ```

#### List Todos
* **Endpoint:** `GET /api/todos`
* **Access:** Authenticated
* **Behavior:**
  - `user`: Fetches todos created by or assigned to them.
  - `admin` / `super_admin`: Fetches all todos in the system.
* **Filters (Query Params):**
  - `status`: `pending`, `in_progress`, `completed`
  - `priority`: `low`, `medium`, `high`
  - Example: `GET /api/todos?status=pending&priority=high`

#### Get Todo Details
* **Endpoint:** `GET /api/todos/:id`
* **Access:** Creator, Assignee, `admin`, `super_admin`

#### Update Todo
* **Endpoint:** `PUT /api/todos/:id`
* **Access:** Creator, Assignee, `admin`, `super_admin`
* **Request Body (Optional fields):**
  ```json
  {
    "status": "in_progress",
    "priority": "medium",
    "assignedTo": "" // Clear assignee by passing empty string
  }
  ```

#### Delete Todo
* **Endpoint:** `DELETE /api/todos/:id`
* **Access:** Creator, `admin`, `super_admin`

---

## Testing

Integration tests are executed using an isolated, in-memory MongoDB server. You do **not** need a local MongoDB instance running to execute tests.

### Run Integration Tests
```bash
npm test
```
This runs all authentication, user management, and todo CRUD suites and exits cleanly.
