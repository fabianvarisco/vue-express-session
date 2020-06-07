'use strict';

const cuitUtil = require('../../utils/cuit');

const ROUTE_ROOT = '/bfatsa';

function decode(data) {
  return Buffer.from(data, 'base64').toString('ascii');
};

const aclRoutes = [
  { method: 'POST', route: ROUTE_ROOT + '/stamp' },
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
module.exports = (server, options) => {

  // access control
  server.use((req, res, next) => {
    if (!aclRoutes.some((x) => (x.method === req.method && x.route === req.originalUrl))) {
      console.log('free route detected');
      next();
      return;
    }
    console.log('controled route detected');
    try {
      const token = req.signedCookies.token;
      if (!token || token.length < 5) throw Error('Empty session');

      const cuil = decode(token);
      console.log('session cuil:', cuil);
      const result = cuitUtil.validateAsCuil(cuil);
      if (result.error) {
        throw Error(`Invalid session - [${result.error.message}]`);
      }

      const user = req.signedCookies.user;
      if (!user || user.cuil !== cuil) {
        throw Error(`Invalid session - from cookie.token [${cuil}] - from cookie.user [${user.cuil}]`);
      }

      const bodyUserCuit = req.sanitize(req.body.user.cuit);
      if (bodyUserCuit && bodyUserCuit !== cuil) {
        throw Error(`Invalid session - from body [${bodyUserCuit}] - from cookie [${cuil}]`);
      }
      next();

    } catch (err) {
      console.error('ERROR', err.message);
      res.status(401).send(err.message).end();
    }
  });

  server.get(ROUTE_ROOT, (req, res) => {
    const user = req.signedCookies.user;
    const data = {
      title: 'AFIP TSA',
      user,
      hash: '',
      authService: options.AUTH_SERVICE || '',
    };
    req.vueOptions.head.scripts.push({
      src: 'https://unpkg.com/axios/dist/axios.min.js',
    });
    req.vueOptions.head.scripts.push({
      src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js',
    });
    req.vueOptions.head.title = options.HEAD_TITLE || 'head.title';
    res.renderVue('main/main.vue', data, req.vueOptions);
  });

  server.post(ROUTE_ROOT + '/session', (req, res) => {
    clearSession(res);
    var token = req.sanitize(req.body.token);
    const sign = req.sanitize(req.body.sign);
    var cuil = '';
    var name = '';
    if (token && token.length > 5) {
      cuil = decode(token);
      if (cuitUtil.validateAsCuil(cuil).error) {
        token = '';
        cuil = '';
      } else {
        // TODO: get username name from PUC service
        name = `name of ${cuil}`;
      }
    }

    // TODO: validate token / sign

    res.cookie('token', token, { signed: true });
    res.cookie('sign', sign, { signed: true });
    res.cookie('user', {cuil, name}, { signed: true });
    res.cookie('views', 0);
    res.redirect(ROUTE_ROOT);
  });

  server.delete(ROUTE_ROOT + '/session', (req, res) => {
    clearSession(res);
    res.end();
  });

  server.get(ROUTE_ROOT + '/session', (req, res) => {
    const tokensso = req.signedCookies.token;
    res.json({ tokensso, views: req.cookies.views });
  });

  server.post(ROUTE_ROOT + '/stamp', (req, res) => {
    const hash = req.sanitize(req.body.hash);
    const userCuit = req.sanitize(req.body.user.cuit);
    console.log(`user [${userCuit}] hashToStamp [${hash}]`);

    // TODO: invoke stamp service
    res.json({ stamped: 'ok', hash });
  });
};
