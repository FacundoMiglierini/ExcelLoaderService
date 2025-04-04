import request from 'supertest';
import express from 'express';
import { GetJobStatusController } from "../controllers/GetJobStatusController";
import { IGetJobStatusUseCase } from "../interfaces/IGetJobStatusUseCase";
import JobStatus from "../enums/Job";


const mockJob = {
    id: "valid-job-id",
    status: JobStatus.DONE,
    filename: "123",
    schema: '{"age": "Number", "name": "String", "nums?": "Array<Number>"}'
};


// Mock the IGetJobStatusUseCase
class MockGetJobStatusUseCase implements IGetJobStatusUseCase {
    async getJobStatus(jobId: string, page: number, limit: number) {
        if (jobId === "valid-job-id") {
            return mockJob;
        } else {
            throw { name: "NotFoundError", message: "Job not found" };
        }
    }
}

describe('GetJobStatusController', () => {
    const app = express();

    let getJobStatusController: GetJobStatusController;
    let consoleErrorSpy: jest.SpyInstance<void>;

    // Setup before each test
    beforeEach(() => {
        getJobStatusController = new GetJobStatusController(new MockGetJobStatusUseCase());

        // Spy on console.error to suppress errors during test execution
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.clearAllMocks();  // Clear previous mocks before each test

        // Register the controller's route handler
        //@ts-ignore
        app.get('/job/:id', (req, res) => getJobStatusController.onGetJobStatus(req, res));
    });

    // Restore original console.error after each test
    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return job status data when job exists', async () => {
        const response = await request(app).get('/job/valid-job-id');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockJob);
    });

    it('should return 404 when job does not exist', async () => {
        const response = await request(app).get('/job/invalid-job-id');
        
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Job not found" });
    });

    it('should return 400 for invalid pagination parameters', async () => {
        const response = await request(app).get('/job/valid-job-id?page=0&limit=-10');
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid pagination parameters" });
    });
});
