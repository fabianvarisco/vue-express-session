'use strict';

const PORT = process.env.PORT || 8080;

const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');

const helmet = require('helmet'); // secure your Express.js apps by setting various HTTP headers
const uuid = require('uuid');
const path = require('path');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(expressSanitizer());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
app.use(session({
  name: uuid.v4(),
  keys: ['key1', 'key2'],
  cookie: {
    // secure: true,
    // httpOnly: true,
    expires,
  },
}));

// log middleware
app.use((req, res, next) => {
  console.log('req.session.token', req.session.token);
  console.log('req.session.sign', req.session.sign);
  if (req.session.views) req.session.views++;
  console.log('req.session.views', req.session.views);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
});

function decode(data) {
  return (new Buffer.from(data, 'base64')).toString('ascii');
}

function encode(data) {
  return (new Buffer.from(data)).toString('base64');
}

function cleanSession(req) {
  req.session.token = null;
  req.session.sign = null;
  req.session.views = null;
}

app.post('/token', (req, res) => {
  cleanSession(req);
  const cuil = req.sanitize(req.body.cuil);
  const token = encode(cuil); // ToDo: usar auth.mock
  const sign = encode(cuil);
  res.send({ token, sign });
});

app.post('/session', (req, res) => {
  cleanSession(req);
  const token = req.sanitize(req.body.token);
  const sign = req.sanitize(req.body.sign);
  const cuil = decode(token); // ToDo: Validar token y sign
  const tokensso = { cuil: cuil };
  req.session.token = token;
  req.session.sign = sign;
  req.session.views = 0;
  res.send({ tokensso });
});

app.delete('/session', (req, res) => {
  cleanSession(req);
  res.send({});
});

app.get('/session', (req, res) => {
  // ToDo: Error si no existe
  const cuil = decode(req.session.token);
  const tokensso = { cuil: cuil };
  res.send({ tokensso, views: req.session.views });
});

function sessionOk(req, res) {
  try {
    if (!req.session.token) throw Error("Empty session");
    const cuil = decode(req.session.token);
    if (cuil < 20000000028 || cuil > 29999999999) throw Error("Invalid session");
    return true;

  } catch(err) {
    console.error(err.message);
    res.status(401).send('It lacks valid authentication credentials for the target resource - ' + err).end();
    return false;
  }
}

app.post('/stamp', (req, res) => {
  if (!sessionOk(req, res)) return;

  const textToStamp = req.sanitize(req.body.textToStamp);
  const hash = encode(textToStamp);
  res.send({ stamped: 'ok', hash });
});

// route for handling 404 requests(unavailable routes)
app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(PORT);

console.log('Running at Port', PORT);
