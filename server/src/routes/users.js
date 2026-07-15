const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { userCreateValidator, userUpdateValidator } = require('../utils/validators');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(protect);

// Admin / Super Admin routes
router.get('/', authorize('admin', 'super_admin'), getUsers);
router.post('/', authorize('super_admin'), userCreateValidator, handleValidationErrors, createUser);

// Self & Admin/Super Admin accessible routes
router.get('/:id', getUser);
router.put('/:id', userUpdateValidator, handleValidationErrors, updateUser);

// Super Admin only routes
router.delete('/:id', authorize('super_admin'), deleteUser);

module.exports = router;
