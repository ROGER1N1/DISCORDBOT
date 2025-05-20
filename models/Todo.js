const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  task: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
});

module.exports = mongoose.model('Todo', todoSchema);
