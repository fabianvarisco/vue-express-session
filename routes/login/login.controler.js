'use strict';

const URL = require('url').URL;
const cuitUtil = require('../../utils/cuit');

function encode(data) {
  return Buffer.from(data).toString('base64');
}

function checkURL(s) {
  try {
    const url = new URL(s);
    console.log(`url [${url}] checked OK`);
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

module.exports = (server, options) => {
  server.get('/login', (req, res) => {
    const data = {
      title: 'Mock Login',
      service: options ? (options.ENTRY_POINT || '') : '',
      cuil: 20000000028,
      password: 123456,
    };
    req.vueOptions.head.title = data.title;
    req.vueOptions.head.scripts.push({
      src: 'https://unpkg.com/axios/dist/axios.min.js',
    });
    res.renderVue('login/login.vue', data, req.vueOptions);
  });

  server.post('/login', (req, res) => {
    const cuil = req.sanitize(req.body.cuil);
    const result = cuitUtil.validateAsCuil(cuil);
    if (result.error) {
      res.status(400).send(result.error.message).end();
      return;
    }
    const password = req.sanitize(req.body.password);
    if (!password || password.length < 5) {
      res.status(400).send('Empty or short password').end();
      return;
    }
    const destination = req.sanitize(req.body.service);
    // TODO: map service -> destination
    if (!checkURL(destination)) {
      res.status(400).send(`Invalid destination [${destination}]`).end();
      return;
    }
    const token = encode(cuil); // TODO: usar auth.mock
    const sign = encode(cuil);
    res.json({ token, sign, destination });
  });

};
