'use strict';

const PORT = process.env.PORT || 8080;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
const cookiesOptions = {
    // secure: true,
    httpOnly: true,
    sameSite: true,
    expires,
};

app.use(cookieParser(uuid.v4(), cookiesOptions));

// log middleware
app.use((req, res, next) => {
  const views = req.cookies.views;
  if (views) {
    res.cookie('views', parseInt(views, 10)+1);
  }
  console.log('req.cookies', req.cookies);

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

function clearSession(res) {
  res.clearCookie('token');
  res.clearCookie('sign');
  res.clearCookie('views');
}

app.post('/token', (req, res) => {
  clearSession(res);
  const cuil = req.sanitize(req.body.cuil);
  const token = encode(cuil); // ToDo: usar auth.mock
  const sign = encode(cuil);
  res.send({ token, sign });
});

app.post('/session', (req, res) => {
  clearSession(res);
  const token = req.sanitize(req.body.token);
  const sign = req.sanitize(req.body.sign);
  const cuil = decode(token); // ToDo: Validar token y sign
  const tokensso = { cuil: cuil };
  res.cookie('token', token);
  res.cookie('sign', sign);
  res.cookie('views', 0);
  res.send({ tokensso });
});

app.delete('/session', (req, res) => {
  clearSession(res);
  res.end();
});

app.get('/session', (req, res) => {
  // ToDo: Error si no existe
  const cuil = decode(req.cookies.token);
  const tokensso = { cuil: cuil };
  res.send({ tokensso, views: req.cookies.views });
});

function sessionOk(req, res) {
  try {
    if (!req.cookies.token) throw Error("Empty session");
    const cuil = decode(req.cookies.token);
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
