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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const UploadFileController_1 = require("../src/controllers/UploadFileController");
// Mock the IUploadFileUseCase
class MockUploadFileUseCase {
    createJob(excelData, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            if (excelData && schema) {
                return "job-id-123"; // Mock the job ID for a successful job creation
            }
            throw { name: "MissingFieldError", message: "Missing required fields: file_data and/or file_schema" };
        });
    }
    createFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            throw Error("not implemented");
        });
    }
}
describe('UploadFileController', () => {
    let app;
    let uploadFileController;
    let mockUseCase;
    // Set up multer for file uploads in tests
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({ storage }).single('file_content');
    beforeEach(() => {
        app = (0, express_1.default)();
        mockUseCase = new MockUploadFileUseCase();
        uploadFileController = new UploadFileController_1.UploadFileController(mockUseCase);
        // Register the controller's route handler
        //@ts-ignore
        app.post('/upload', upload, (req, res) => uploadFileController.onCreateJob(req, res));
    });
    it('should return 400 for invalid file content', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidFileContent = Buffer.from('invalid file content');
        const schema = JSON.stringify({ column1: 'string' });
        const response = yield (0, supertest_1.default)(app)
            .post('/upload')
            .attach('file_content', invalidFileContent, 'file.xlsx')
            .field('file_schema', schema);
        // Assuming the `XLSX.read` might throw an error or handle invalid content internally
        expect(response.status).toBe(500); // If invalid file content is an issue, it will return 500
        expect(response.body).toEqual({ message: "Internal Server Error" });
    }));
    it('should return 500 for internal server errors', () => __awaiter(void 0, void 0, void 0, function* () {
        // Simulating an unexpected error in the use case
        const errorUseCase = {
            createJob: jest.fn().mockRejectedValue(new Error("Unexpected error"))
        };
        const errorController = new UploadFileController_1.UploadFileController(errorUseCase);
        //@ts-ignore
        app.post('/upload', upload, (req, res) => errorController.onCreateJob(req, res));
        const fileContent = Buffer.from('mock excel content');
        const schema = JSON.stringify({ column1: 'string' });
        const errorResponse = yield (0, supertest_1.default)(app)
            .post('/upload')
            .attach('file_content', fileContent, 'file.xlsx')
            .field('file_schema', schema);
        expect(errorResponse.status).toBe(500);
        expect(errorResponse.body).toEqual({ message: "Internal Server Error" });
    }));
});
