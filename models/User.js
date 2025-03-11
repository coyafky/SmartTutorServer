const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  customId: {
    type: String,
    required: true,
    unique: true,
    match: /^(TUTOR|PARENT|ADMIN)_\d{14}$/,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['parent', 'teacher', 'admin'],
    required: true,
    index: true,
  },
  avatar: {
    type: String,
    default: process.env.DEFAULT_AVATAR_URL,
    validate: {
      validator: (v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
      message: '无效的URL格式',
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: Date,
  verifiedAt: Date,
});

module.exports = mongoose.model('User', UserSchema);
