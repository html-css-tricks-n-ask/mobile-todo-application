const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Super Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Self, Admin, Super Admin)
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Role-based auth: users can only view themselves. Admins and Super Admins can view anyone.
    if (req.user.role === 'user' && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user profile',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user (with specific role)
// @route   POST /api/users
// @access  Private (Super Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Self, Super Admin)
const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Authorization checks:
    // Only Super Admin can change another user's profile/role.
    // Standard users can only change their own profile.
    if (req.user.role !== 'super_admin' && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    const { name, email, password, role } = req.body;

    // Standard user trying to change their own role -> ignore or throw error
    if (role && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admins can update roles',
      });
    }

    // Apply updates
    if (name) user.name = name;
    if (email) {
      // Check if email already exists
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email;
    }
    if (password) user.password = password;
    if (role && req.user.role === 'super_admin') user.role = role;

    await user.save();

    // Get fresh user representation (excluding password)
    const updatedUser = await User.findById(user._id);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // A super admin cannot delete themselves
    if (req.user.id === user.id) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin cannot self-delete. Please contact other administrators',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
