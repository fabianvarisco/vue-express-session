'use strict';

const request = require('supertest');

const app = require('../server');

describe('Get Endpoint', () => {
  it('should create send get', async() => {
    const res = await request(app).get('/test').send({});
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('OK');
  });
});
