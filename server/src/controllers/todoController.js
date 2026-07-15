const Todo = require('../models/Todo');

// @desc    Create a Todo
// @route   POST /api/todos
// @access  Private (All Users)
const createTodo = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;

    const todo = await Todo.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      creator: req.user.id,
      assignedTo: assignedTo || undefined,
    });

    res.status(201).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Todos
// @route   GET /api/todos
// @access  Private
// @query   status, priority
const getTodos = async (req, res, next) => {
  try {
    const query = {};

    // Standard user role gets only their created or assigned todos
    if (req.user.role === 'user') {
      query.$and = [
        {
          $or: [
            { creator: req.user.id },
            { assignedTo: req.user.id },
          ],
        },
      ];
    }

    // Apply status and priority filtering if provided
    if (req.query.status) {
      if (query.$and) {
        query.$and.push({ status: req.query.status });
      } else {
        query.status = req.query.status;
      }
    }
    if (req.query.priority) {
      if (query.$and) {
        query.$and.push({ priority: req.query.priority });
      } else {
        query.priority = req.query.priority;
      }
    }

    // Apply text search if provided
    if (req.query.search) {
      const searchCond = {
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
        ],
      };
      if (query.$and) {
        query.$and.push(searchCond);
      } else {
        query.$and = [searchCond];
      }
    }

    // Pagination Parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Get total count matching query
    const total = await Todo.countDocuments(query);

    // Fetch paginated results sorted by newest first
    const todos = await Todo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'name email role')
      .populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      count: todos.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: todos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Todo
// @route   GET /api/todos/:id
// @access  Private
const getTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate('creator', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    // Standard users can only view if they are the creator or assignee
    if (
      req.user.role === 'user' &&
      todo.creator._id.toString() !== req.user.id &&
      todo.assignedTo?._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this Todo',
      });
    }

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res, next) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    // Standard users can only update if they are the creator or assignee
    if (
      req.user.role === 'user' &&
      todo.creator.toString() !== req.user.id &&
      todo.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this Todo',
      });
    }

    const { title, description, status, priority, assignedTo } = req.body;

    // Apply fields if present
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (status !== undefined) todo.status = status;
    if (priority !== undefined) todo.priority = priority;
    
    // Allow empty string to clear the assignedTo user
    if (assignedTo === '') {
      todo.assignedTo = undefined;
    } else if (assignedTo !== undefined) {
      todo.assignedTo = assignedTo;
    }

    await todo.save();

    const updatedTodo = await Todo.findById(todo._id)
      .populate('creator', 'name email role')
      .populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    // Standard users can only delete if they are the creator
    if (req.user.role === 'user' && todo.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this Todo. Only the creator can delete it.',
      });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
};
