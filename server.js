'use strict';

require('dotenv').config();
const PORT = process.env.PORT || 8080;
const PROTOCOL = process.env.PROTOCOL || 'https';
const ENVIRONMENT = process.env.ENVIRONMENT || 'prod';
const ENTRY_POINT = process.env.ENTRY_POINT || `${PROTOCOL}://localhost:${PORT}/session`;
const AUTH_SERVICE = process.env.AUTH_SERVICE || `${PROTOCOL}://localhost:${PORT}/login`;

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

// test
server.get('/test', (req, res) => { res.json({ status: 'OK' }); });

// client-side-render
server.get('/client-side-render', (req, res) => {
  res.sendFile(path.join(__dirname + '/client-side-render.html'));
});

if (ENVIRONMENT === 'dev') {
  require('./login/login.controler')(server, {ENTRY_POINT});
}

require('./main/main.controler')(server, {ENVIRONMENT, AUTH_SERVICE});

// route for handling 404 requests(unavailable routes)
server.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

module.exports = server.listen(PORT, () => {
  console.log('Worker', process.pid, 'listening on port', PORT);
});
