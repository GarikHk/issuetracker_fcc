'use strict';
const Issue = require('../schemas/issue.js');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to the Database!"))
  .catch(err => {
    console.log(`Could not establish Connection with error: ${err}`);
  });

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      let query = req.query;
      if (query.open) query.open = !!query.open;
      if (query.created_on) query.created_on = new Date(query.created_on);
      if (query.updated_on) query.updated_on = new Date(query.updated_on);

      //const found = 
      await Issue.findOne({ project_name: project })
        .then(doc => {
          if (!doc) {
            return [];
          }
          const filteredIssues = doc.issues.filter(issue => {
            for (const prop in query) {
              if (query.hasOwnProperty(prop) && issue[prop] != query[prop]) {
                return false;
              }
            }
            return true;
          });
          return res.json(filteredIssues);
        })
        .catch(err => {
          return console.log(err)
        });
    })

    .post(async (req, res) => {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) return res.json({ error: 'required field(s) missing' });

      const newIssue = {
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text,
      }

      try {
        const found = await Issue.findOne({ project_name: project });

        if (found) {
          found.issues.push(newIssue);
          const i = found.issues.length - 1;
          const updated = await found.save();

          return res.json(updated.issues[i]);
        } else {
          const newProject = new Issue({
            project_name: project,
            issues: [newIssue]
          });
          const saved = await newProject.save();

          return res.json(saved.issues[0]);
        }
      } catch (err) {
        console.log(err);
      }

    })

    .put(async (req, res) => {
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if (!_id) return res.json({ error: 'missing _id' });
      const updateFields = {};

      if (issue_title) updateFields['issues.$.issue_title'] = issue_title;
      if (issue_text) updateFields['issues.$.issue_text'] = issue_text;
      if (created_by) updateFields['issues.$.created_by'] = created_by;
      if (assigned_to) updateFields['issues.$.assigned_to'] = assigned_to
      if (status_text) updateFields['issues.$.status_text'] = status_text;
      if (open) updateFields['issues.$.open'] = open;

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id })
      } else {
        updateFields['issues.$.updated_on'] = new Date();
      }

      const result = await Issue.updateOne(
        { 'issues._id': _id },
        { $set: updateFields }
      );

      if (result.modifiedCount > 0) {
        console.log('Issue updated successfully.');
        return res.json({ result: 'successfully updated', '_id': _id });

      } else {
        console.log('Issue not updated.');
        return res.json({ error: 'could not update', '_id': _id })
      }

    })

    .delete(async (req, res) => {
      let project = req.params.project;
      const id = req.body._id;

      if (!id) return res.json({ error: 'missing _id' });

      const result = await Issue.updateOne(
        { project_name: project },
        { $pull: { issues: { _id: id } } }
      );

      if (result.modifiedCount > 0) {
        console.log('Issue deleted.');
        return res.json({
          result: 'successfully deleted',
          _id: id
        });
      } else {
        console.log('Issue not found.');
        return res.json({
          error: 'could not delete',
          _id: id,
        });
      }

    });

};
