const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    default: new Date,
  },
  updated_on: Date,
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
    required: false,
  },
  open: {
    type: Boolean,
    default: false,
  },
  status_text: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Issues', IssueSchema);