var express = require('express');
var router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/v1/todos', (req, res, next) => {
  const results = [];
  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM items ORDER BY id ASC;");
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.post('/api/v1/todos', (req, res, next) => {
  const results = [];
  const data = {text: req.body.text, complete: req.body.complete};
  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('INSERT INTO items(text, complete) values($1, $2)',
    [data.text, data.complete]);

    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    query.on('row', (row) => {
      results.push(row);
  });

  query.on('end', () => {
    done();
    return res.json(results)
  });
  });
});

router.put('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  const id = req.params.todo_id
  const data = {text: req.body.text, complete: req.body.complete}

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    };

    client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
    [data.text, data.complete, id]);

    const query = client.query('SELECT * FROM items ORDER BY id ASC;');
    query.on('row', (row) => {
      results.push(row)
    });

   query.on('end', () => {
     done();
     return res.json(results);
   });
  });
});

module.exports = router;
