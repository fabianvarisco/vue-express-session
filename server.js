'use strict';

const PORT = process.env.PORT || 8080;

const COOKIE_SECRET = 'XWz-vw-16OXNuFsNUnTMCPbzRKk';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSanitizer = require('express-sanitizer');
const compress = require('compression');
// const methodOverride = require('method-override');
const expressVue = require('express-vue');

// secure your Express.js apps by setting various HTTP headers
const helmet = require('helmet');
const path = require('path');

const vueOptions = {
//  rootPath: path.join(__dirname, 'routes'),
  rootPath: __dirname,
  head: {
    styles: [{ style: 'assets/css/style.css' }],
  },
};

const server = express();
const expressVueMiddleware = expressVue.init(vueOptions);
server.use(expressVueMiddleware);

server.use(helmet());
server.disable('x-powered-by');
server.use(express.json());
server.use(expressSanitizer());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(compress());

// server.use(server.locals.rootPath, express.static(__dirname));


const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
const cookiesOptions = {
  // secure: true,
  httpOnly: true,
  sameSite: true,
  expires,
};

server.use(cookieParser(COOKIE_SECRET, cookiesOptions));

// TODO: methodOverride es nescesario ??
// server.use(methodOverride());

// log middleware
server.use((req, res, next) => {
  console.log('==========');
  console.log(req.protocol, req.method, req.hostname);
  console.log(req.originalUrl);
  const views = req.cookies.views;
  if (views) {
    res.cookie('views', parseInt(views, 10) + 1);
  }
  console.log('cookies', req.cookies);
  console.log('signedCookies', req.signedCookies);

  next();
});

server.get('/app0', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

server.get('/app1', (req, res) => {
  const data = {
    title: req.path,
  };
  req.vueOptions.head.title = 'server side render app1 !!!';
  res.renderVue('/app1.vue', data, req.vueOptions);
});

server.get('/app2', (req, res) => {
  const data = {
    title: req.path,
  };
  req.vueOptions.head.styles.push({
    src: 'https://cdn.jsdelivr.net/npm/axios@0.12.0/dist/axios.min.js',
  });
  req.vueOptions.head.scripts.push({
    src: 'https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js',
  });

  req.vueOptions.head.title = 'server side render app2 !!!';
  res.renderVue('/app2.vue', data, req.vueOptions);
});

server.get('/app3', (req, res) => {
  const data = {
    title: req.path,
  };
  req.vueOptions.head.scripts.push({
    src: 'https://cdn.jsdelivr.net/npm/axios@0.12.0/dist/axios.min.js',
  });
  req.vueOptions.head.scripts.push({
    src: 'https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js',
  });

  req.vueOptions.head.title = 'server side render app3 !!!';
  res.renderVue('/app3.vue', data, req.vueOptions);
});


function decode(data) {
  return Buffer.from(data, 'base64').toString('ascii');
}

function encode(data) {
  return Buffer.from(data).toString('base64');
}

function clearSession(res) {
  console.log('clearSession');
  res.clearCookie('token');
  res.clearCookie('sign');
  res.clearCookie('views');
}

server.post('/token', (req, res) => {
  clearSession(res);
  const cuil = req.sanitize(req.body.cuil);
  const token = encode(cuil); // ToDo: usar auth.mock
  const sign = encode(cuil);
  res.send({ token, sign });
});

server.post('/session', (req, res) => {
  clearSession(res);
  const token = req.sanitize(req.body.token);
  const sign = req.sanitize(req.body.sign);
  const cuil = decode(token); // ToDo: Validar token y sign
  const tokensso = { cuil: cuil };
  res.cookie('token', token, { signed: true });
  res.cookie('sign', sign, { signed: true });
  res.cookie('views', 0);
  res.send({ tokensso });
});

server.delete('/session', (req, res) => {
  clearSession(res);
  res.end();
});

server.get('/session', (req, res) => {
  const token = req.signedCookies.token;
  if (!token) {
    res.end();
    return;
  }
  const cuil = decode(req.signedCookies.token);
  const tokensso = { cuil: cuil };
  res.send({ tokensso, views: req.cookies.views });
});

function sessionOk(req, res) {
  try {
    const token = req.signedCookies.token;
    if (!token) throw Error('Empty session');
    const cuil = decode(token);
    console.log('session cuil:', cuil);
    if (cuil < 20000000028 || cuil > 29999999999) throw Error('Invalid session');
    return true;

  } catch (err) {
    console.error(err.message);
    res.status(401).send('It lacks valid authentication credentials for the target resource - ' + err).end();
    return false;
  }
}

server.post('/stamp', (req, res) => {
  if (!sessionOk(req, res)) return;

  const textToStamp = req.sanitize(req.body.textToStamp);
  const hash = encode(textToStamp);
  res.send({ stamped: 'ok', hash });
});

server.get('/test', (req, res) => {
  res.send({ status: 'OK' });
});

// route for handling 404 requests(unavailable routes)
server.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

module.exports = server.listen(PORT, () => {
  console.log('Worker', process.pid, 'listening on port', PORT);
});
