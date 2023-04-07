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
      created_by: {
        type: String,
        required: true,
      },
      assigned_to: {
        type: String,
        required: false,
        default: '',
      },
      status_text: {
        type: String,
        required: false,
        default: '',
      },
      created_on: {
        type: Date,
        required: true,
        default: new Date(),
      },
      updated_on: {
        type: Date,
        default: new Date(),
      },
      open: {
        type: Boolean,
        default: true,
      },
    }],
    required: true,
    default: [],
  }
});

module.exports = mongoose.model('issues', IssueSchema);