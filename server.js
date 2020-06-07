'use strict';

require('dotenv').config();
const PORT = process.env.PORT || 8080;
const PROTOCOL = process.env.PROTOCOL || 'https';
const ENVIRONMENT = process.env.ENVIRONMENT || 'prod';
const ENTRY_POINT = process.env.ENTRY_POINT || `${PROTOCOL}://localhost:${PORT}/bfatsa/session`;
const AUTH_SERVICE = process.env.AUTH_SERVICE || `${PROTOCOL}://localhost:${PORT}/login`;
const HEAD_TITLE = process.env.HEAD_TITLE || 'vue app';

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

// https://www.npmjs.com/package/express-vue#options
const vueOptions = {
  rootPath: path.join(__dirname, 'routes'),
  head: {
    title: 'AFIP',
    metas: [
      { name: 'charset', content: 'utf-8' },
      { name: 'application-name', content: 'AFIP BFA TSA2' },
      { name: 'description', content: 'AFIP TimeStamping service using Blockchian Federal Argentina', id: 'desc' },
      // Generic rel for things like icons and stuff
      { rel: 'shortcut icon', href: '/statics/favicons/favicon.d9205a9c.ico', sizes: '32x32' },
    ],
  // styles: [{ style: 'assets/css/style.css' }],
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

// https://expressjs.com/es/starter/static-files.html
server.use('/statics', express.static(path.join(__dirname + '/statics')));

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

if (ENVIRONMENT === 'dev') {
  require('./routes/login/login.controler')(server, {ENTRY_POINT});
}

require('./routes/main/main.controler')(server, {ENVIRONMENT, AUTH_SERVICE, HEAD_TITLE});

// route for handling 404 requests(unavailable routes)
server.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

// TODO: crear un http op un https server
//
// var http = require('http')
//  , https = require('https')
//  , express = require('express')
//  , app = express();
//
// http.createServer(app).listen(80);
// https.createServer({ ... }, app).listen(443);

module.exports = server.listen(PORT, () => {
  console.log('Worker', process.pid, 'listening on port', PORT);
});
