const express = require('express');
const {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');
const { protect } = require('../middleware/auth');
const { todoValidator, todoUpdateValidator } = require('../utils/validators');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Apply auth middleware to all todo routes
router.use(protect);

router.post('/', todoValidator, handleValidationErrors, createTodo);
router.get('/', getTodos);
router.get('/:id', getTodo);
router.put('/:id', todoUpdateValidator, handleValidationErrors, updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
