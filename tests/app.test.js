"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/userController.test.ts
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../src/index");
describe('Get File Use Case', () => {
    it('GET /file/id without auth should return a not found error.', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).get('/file/12345');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ "message": "File not found" });
    }));
});
