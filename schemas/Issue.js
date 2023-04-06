const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  project_name: {
    type: String,
    required: true,
  },
  issues: {
    type: [{
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
        required: true,
        default: new Date(),
      },
      updated_on: {
        type: Date,
        default: Date.now,
      },
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
        default: true,
      },
      status_text: {
        type: String,
        required: false,
      },
    }],
    required: true,
    default: [],
  }
});

module.exports = mongoose.model('issues', IssueSchema);