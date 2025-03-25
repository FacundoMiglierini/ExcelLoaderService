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
const GetJobStatusController_1 = require("../src/controllers/GetJobStatusController");
const Job_1 = __importDefault(require("../src/enums/Job"));
const mockJob = {
    id: "valid-job-id",
    status: Job_1.default.DONE,
    file_id: "123",
    errors: [
        { row: 1, col: 1 },
        { row: 2, col: 2 }
    ],
};
// Mock the IGetJobStatusUseCase
class MockGetJobStatusUseCase {
    getJobStatus(jobId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (jobId === "valid-job-id") {
                return mockJob;
            }
            else {
                throw { name: "NotFoundError", message: "Job not found" };
            }
        });
    }
}
describe('GetJobStatusController', () => {
    let app;
    let getJobStatusController;
    beforeEach(() => {
        app = (0, express_1.default)();
        getJobStatusController = new GetJobStatusController_1.GetJobStatusController(new MockGetJobStatusUseCase());
        // Register the controller's route handler
        //@ts-ignore
        app.get('/job/:id', (req, res) => getJobStatusController.onGetJobStatus(req, res));
    });
    it('should return job status data when job exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/job/valid-job-id');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockJob);
    }));
    it('should return 404 when job does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/job/invalid-job-id');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Job not found" });
    }));
    it('should return 400 for invalid pagination parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/job/valid-job-id?page=0&limit=-10');
        expect(response.status).toBe(400);
        expect(response.text).toBe("Invalid pagination parameters");
    }));
});
