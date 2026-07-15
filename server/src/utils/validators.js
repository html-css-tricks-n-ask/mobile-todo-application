const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 or more characters'),
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const userCreateValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 or more characters'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'user'])
    .withMessage('Invalid role. Must be one of super_admin, admin, or user'),
];

const userUpdateValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be 6 or more characters'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'user'])
    .withMessage('Invalid role. Must be one of super_admin, admin, or user'),
];

const todoValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be one of pending, in_progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of low, medium, or high'),
  body('assignedTo')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid assignedTo user ID format');
      }
      return true;
    }),
];

const todoUpdateValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be one of pending, in_progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of low, medium, or high'),
  body('assignedTo')
    .optional()
    .custom((value) => {
      if (value && value !== '' && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid assignedTo user ID format');
      }
      return true;
    }),
];

module.exports = {
  registerValidator,
  loginValidator,
  userCreateValidator,
  userUpdateValidator,
  todoValidator,
  todoUpdateValidator,
};
