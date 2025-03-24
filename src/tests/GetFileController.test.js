"use strict";
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
const supertest_1 = __importDefault(require("supertest"));
const GetFileController_1 = require("../src/controllers/GetFileController");
const express_1 = __importDefault(require("express"));
const mockContent = [{
        "name": "Esteban",
        "age": 30,
        "nums": [1, 3, 8, 9, 12, 32, 34, 78, 97, 100]
    }];
// Mock the IGetFileUseCase
class MockGetFileUseCase {
    getFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id === "valid-id") {
                return { fileId: id, content: mockContent };
            }
            throw { name: "NotFoundError", message: "File not found" };
        });
    }
}
describe('GetFileController', () => {
    let app;
    let getFileController;
    beforeEach(() => {
        app = (0, express_1.default)();
        getFileController = new GetFileController_1.GetFileController(new MockGetFileUseCase());
        //@ts-ignore
        app.get('/file/:id', (req, res) => getFileController.onGetFile(req, res));
    });
    it('should return file data when file exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/file/valid-id');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ fileId: "valid-id", content: mockContent });
    }));
    it('should return 404 when file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/file/invalid-id');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "File not found" });
    }));
});
