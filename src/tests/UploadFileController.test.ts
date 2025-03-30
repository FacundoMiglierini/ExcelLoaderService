import request from "supertest";
import express from "express";
import { UploadFileController } from "../controllers/UploadFileController";
import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { upload } from "../middleware/multer";

// Mock the IUploadFileUseCase
class MockUploadFileUseCase implements IUploadFileUseCase {
    async uploadFile(filename: string, schema: string) {
        if (filename && schema) {
            return "job-id-123"; // Mock the job ID for a successful job creation
        }
        throw { name: "MissingFieldError", message: "Missing required fields: filename and/or schema" };
    }
}

describe('UploadFileController', () => {
    const app = express();
    let uploadFileController: UploadFileController;
    let mockUseCase: MockUploadFileUseCase;
    let consoleErrorSpy: jest.SpyInstance<void>;

    // Setup before each test
    beforeEach(() => {
        mockUseCase = new MockUploadFileUseCase();
        uploadFileController = new UploadFileController(mockUseCase);

        // Spy on console.error to suppress errors during test execution
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.clearAllMocks();  // Clear previous mocks before each test

        // Register the controller's route handler
        //@ts-ignore
        app.post('/files', upload.single('file_content'), (req, res) => uploadFileController.onUploadFile(req, res));
    });

    // Restore original console.error after each test
    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return 202 for successful file upload with valid schema', async () => {
        const fileContent = Buffer.from('mock excel content'); // Mock file content
        const schema = JSON.stringify({ column1: 'string' });

        const response = await request(app)
            .post('/files')
            .attach('file_content', fileContent, 'file.xlsx') // Attach a valid Excel file
            .field('file_schema', schema);

        expect(response.status).toBe(202);
        expect(response.body.message).toBe("File uploaded successfully");
        expect(response.body.job_id).toBe("job-id-123");
    });

    it('should return 400 for missing file.', async () => {
        const schema = JSON.stringify({ column1: 'string' });

        const response = await request(app)
            .post('/files')
            .field('file_schema', schema);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Please upload an Excel file" });
    });

    it('should return 400 for missing file schema.', async () => {
        const fileContent = Buffer.from('mock excel content'); // Mock file content

        const response = await request(app)
            .post('/files')
            .attach('file_content', fileContent, 'file.xlsx') // Attach the file with field name 'file_content'

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Please upload a file schema" });
    });

    it('should return 500 for internal server errors', async () => {
        const errorUseCase = {
            createJob: jest.fn().mockRejectedValue(new Error("Unexpected error"))
        };

        const errorController = new UploadFileController(errorUseCase as any);

        const appWithErrorController = express();
        //@ts-ignore
        appWithErrorController.post('/files', upload.single('file_content'), (req, res) => errorController.onUploadFile(req, res));

        const fileContent = Buffer.from('mock excel content'); // Mock file content
        const schema = JSON.stringify({ column1: 'string' });

        const errorResponse = await request(appWithErrorController)
            .post('/files')
            .attach('file_content', fileContent, 'file.xlsx')
            .field('file_schema', schema);

        expect(errorResponse.status).toBe(500);
        expect(errorResponse.body).toEqual({ message: "Internal Server Error" });
    });
});
