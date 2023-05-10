const express = require('express'),
  cors = require('cors'),
  { createPool } = require('mysql'),
  bodyParser = require('body-parser'),
  { check, validationResult } = require('express-validator');

const app = express();

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'contacts',
  connectionLimit: 10,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(
  '/contact',
  [
    check('name', 'name is required').isLength({ min: 1 }),
    check('email', 'email does not appear to be valid').isEmail(),
  ],
  (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let newContact = req.body;
    if (newContact) {
      pool.query(
        'select * from info where full_name = ?',
        [newContact.name],
        (err, result) => {
          if (!result.length) {
            pool.query(
              'insert into info (id, full_name, company, email) values (?, ?, ?, ?)',
              [
                Date.now(),
                newContact.name,
                newContact.company,
                newContact.email,
              ],
              (err, result, fields) => {
                if (err) {
                  res.status(502).send('There was an error:' + err);
                }
                if (result) {
                  res.status(200).send('Succesful:' + result);
                }
              }
            );
          } else if (result.length > 0) {
            res.status(200).send('Contact already entered.');
          }
        }
      );
    }
  }
);

app.listen(8000);
