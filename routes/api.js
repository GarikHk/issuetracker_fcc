'use strict';
const Issue = require('../schemas/issue.js');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to the Database!"))
  .catch(err => {
    console.log(`Could not establish Connection with err: ${err}`);
  });

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;

      const query = await Issue.findOne({ project_name: project })

      res.json(query.issues);
    })

    .post(async (req, res) => {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      const newIssue = {
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text,
      }

      try {
        const found = await Issue.findOne({ project_name: project });
        const i = found.issues.length;

        if (found) {
          found.issues.push(newIssue);
          const updated = await found.save();
          
          res.json(updated.issues[i]);
        } else {
          const newProject = new IssueSchema({
            project_name: project,
            issues: [newIssue]
          });
          const saved = await newProject.save();
          
          res.json(saved.issues[i]);
        }
      } catch (err) {
        console.log(err);
      }

    })

    .put(function (req, res) {
      let project = req.params.project;

    })

    .delete(function (req, res) {
      let project = req.params.project;

    });

};
