'use strict';

const cuitUtil = require('../utils/cuit');

function decode(data) {
  return Buffer.from(data, 'base64').toString('ascii');
};

function encode(data) {
  return Buffer.from(data).toString('base64');
};

const freeRoutes = [
  { method: 'GET', route: '/login' },
  { method: 'POST', route: '/login' },
  { method: 'GET', route: '/' },
  { method: 'GET', route: '/session' },
  { method: 'POST', route: '/session' },
  { method: 'DELETE', route: '/session' },
];

function clearSession(res) {
  console.log('clearSession');
  res.clearCookie('token');
  res.clearCookie('sign');
  res.clearCookie('views');
};

/**
 * Main Route Controller
 * @param {object} server
 */
module.exports = (server) => {

  // access control
  server.use((req, res, next) => {
    if (freeRoutes.some((x) => (x.method === req.method && x.route === req.originalUrl))) {
      console.log('free route detected');
      next();
      return;
    }
    console.log('controled route detected');
    try {
      const token = req.signedCookies.token;
      if (!token) throw Error('Empty session');
      const cuil = decode(token);
      console.log('session cuil:', cuil);
      const result = cuitUtil.validateAsCuil(cuil);
      if (result.error) throw Error(`Invalid session - [${result.error.message}]`);
      next();

    } catch (err) {
      console.error(err.message);
      res.status(401).send('It lacks valid authentication credentials for the target resource - ' + err).end();
    }
  });

  server.get('/', (req, res) => {
    const data = {
      title: req.path,
    };
    req.vueOptions.head.scripts.push({
      src: 'https://cdn.jsdelivr.net/npm/axios@0.12.0/dist/axios.min.js',
    });
    req.vueOptions.head.scripts.push({
      src: 'https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js',
    });
    req.vueOptions.head.title = 'server side render app !!!';
    res.renderVue('main/main.vue', data, req.vueOptions);
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
    res.json({ tokensso });
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
    res.josn({ tokensso, views: req.cookies.views });
  });

  server.post('/stamp', (req, res) => {
    const textToStamp = req.sanitize(req.body.textToStamp);
    const hash = encode(textToStamp);
    res.json({ stamped: 'ok', hash });
  });
};
