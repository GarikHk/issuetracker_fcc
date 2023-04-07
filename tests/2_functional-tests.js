const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require('../schemas/issue.js');


chai.use(chaiHttp);

suite('Functional Tests', function () {
  let testIssue;
  let dummy_1;
  let dummy_2;

  beforeEach(async () => {
    // Create a test issue in the database before each test
    testIssue = await Issue.create({
      project_name: 'test',
      issues: [{
        issue_title: 'Test Issue 1',
        issue_text: 'Test issue text',
        created_by: 'me',
        assigned_to: 'Test assignee',
        status_text: 'Test status '
      },
      {
        issue_title: 'Test Issue 2',
        issue_text: 'Test issue text',
        created_by: 'you',
        assigned_to: 'Test assignee',
        status_text: 'Test status '
      }],
    });
    dummy_1 = testIssue.issues[0]._id;
    dummy_2 = testIssue.issues[1]._id;
  });

  afterEach(async () => {
    // Delete the test issue from the database after each test
    await Issue.findByIdAndDelete(testIssue._id);
  });

  // #1
  test('1) Create an issue with every field: POST request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        "issue_title": "title",
        "issue_text": "text",
        "created_by": "me",
        "assigned_to": "you",
        "status_text": "qa",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.issue_title, "title");
        assert.strictEqual(res.body.issue_text, "text");
        assert.strictEqual(res.body.created_by, "me");
        assert.strictEqual(res.body.assigned_to, "you");
        assert.strictEqual(res.body.status_text, "qa");
        done();
      });
  });

  //#2
  test('2) Create an issue with only required fields: POST request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        "issue_title": "title",
        "issue_text": "text",
        "created_by": "me",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.issue_title, "title");
        assert.strictEqual(res.body.issue_text, "text");
        assert.strictEqual(res.body.created_by, "me");
        done();
      });
  });

  // #3
  test('3) Create an issue with missing required fields: POST request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        "assigned_to": "you",
        "status_text": "qa",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // #4
  test('4) View issues on a project: GET request to /api/issues/{project}', done => {
    chai
      .request(server)
      .get('/api/issues/test')
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  // #5
  test('5) View issues on a project with one filter: GET request to /api/issues/{project}', done => {
    chai
      .request(server)
      .get('/api/issues/test?open=true')
      .end((err, res) => {
        assert.isArray(res.body);
        res.body.forEach(element => {
          assert.strictEqual(element.open, true);
        });
        done();
      });
  });

  // #6
  test('6) View issues on a project with multiple filters: GET request to /api/issues/{project}', done => {
    chai
      .request(server)
      .get('/api/issues/test?open=true&created_by=me')
      .end((err, res) => {
        assert.isArray(res.body);
        res.body.forEach(element => {
          assert.strictEqual(element.open, true);
          assert.strictEqual(element.created_by, 'me');
        });
        done();
      });
  });

  // #7
  test('7) Update one field on an issue: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        "_id": dummy_1.toString(),
        "issue_title": "Updated Test Issue 1",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.result, 'successfully updated');
        assert.strictEqual(res.body._id, dummy_1.toString());
        done();
      });
  });

  // #8
  test('8) Update multiple fields on an issue: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        "_id": dummy_2.toString(),
        "issue_title": "Updated Test Issue 2",
        "created_by": "me",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.result, 'successfully updated');
        assert.strictEqual(res.body._id, dummy_2.toString());
        done();
      });
  });

  // #9
  test('9) Update an issue with missing _id: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        "issue_title": "Updated Test Issue 2",
        "created_by": "me",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.error, 'missing _id');
        done();
      });
  });

  // #10
  test('10) Update an issue with no fields to update: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        "_id": dummy_2.toString(),
      })
      .end((err, res) => {
        assert.strictEqual(res.body.error, "no update field(s) sent");
        assert.strictEqual(res.body._id, dummy_2.toString());
        done();
      });
  });

  // #11
  test('11) Update an issue with an invalid _id: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        "_id": "000000000000000000000000",
        "issue_title": "Updated Test Issue 2",
        "created_by": "me",
      })
      .end((err, res) => {
        assert.strictEqual(res.body.error, "could not update");
        assert.strictEqual(res.body._id, "000000000000000000000000");
        done();
      });
  });

  // #12
  test('12) Delete an issue: DELETE request to /api/issues/{project}', done => {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({
        "_id": dummy_2.toString(),
      })
      .end((err, res) => {
        assert.strictEqual(res.body.result, 'successfully deleted');
        assert.strictEqual(res.body._id, dummy_2.toString());
        done();
      });
  });

  // #13
  test('13) Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', done => {
    chai
    .request(server)
    .delete('/api/issues/test')
    .send({
      "_id": "000000000000000000000000",
    })
    .end((err, res) => {
      assert.strictEqual(res.body.error, "could not delete");
      assert.strictEqual(res.body._id, "000000000000000000000000");
      done();
    });
  });

  // #14
  test('14) Delete an issue with missing _id: DELETE request to /api/issues/{project}', done => {
    chai
    .request(server)
    .put('/api/issues/test')
    .end((err, res) => {
      assert.strictEqual(res.body.error, 'missing _id');
      done();
    });
  })
});
