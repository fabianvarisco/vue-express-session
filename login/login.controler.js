'use strict';

const cuitUtil = require('../utils/cuit');

function encode(data) {
  return Buffer.from(data).toString('base64');
}

module.exports = (server) => {
  server.get('/login', (req, res) => {
    const data = {
      title: 'Mock Login',
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
      res.status(400).send(result.error.message);
      return;
    }
    const password = req.sanitize(req.body.password);
    if (!password) {
      res.status(400).send('Empty password');
      return;
    }
    const token = encode(cuil); // TODO: usar auth.mock
    const sign = encode(cuil);
    res.json({ token, sign });
  });

};
