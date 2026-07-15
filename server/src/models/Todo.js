const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add database indexes for query and search optimization
TodoSchema.index({ creator: 1, createdAt: -1 });
TodoSchema.index({ assignedTo: 1 });
TodoSchema.index({ status: 1 });
TodoSchema.index({ priority: 1 });
TodoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Todo', TodoSchema);
