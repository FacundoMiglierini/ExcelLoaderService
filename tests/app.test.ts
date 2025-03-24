/*
import { app } from "../index";
import request from "supertest";

describe("GET /", () => {
  it('responds with "Welcome to unit testing guide for nodejs, typescript and express!', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      "Welcome to unit testing guide for nodejs, typescript and express!"
    );
  });
});

*/

// tests/userController.test.ts
import request from 'supertest';
import { app } from '../src/index'; 

describe('Get File Use Case', () => {
  it('GET /file/id without auth should return a not found error.', async () => {
    const response = await request(app).get('/file/12345');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({"message": "File not found"});
  });
});
