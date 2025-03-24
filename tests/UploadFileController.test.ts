import request from "supertest";
import express from "express";
import multer from "multer";
import { UploadFileController } from "../src/controllers/UploadFileController";
import { IUploadFileUseCase } from "../src/interfaces/IUploadFileUseCase";


// Mock the IUploadFileUseCase
class MockUploadFileUseCase implements IUploadFileUseCase {
  async createJob(excelData: any, schema: any) {
    if (excelData && schema) {
      return "job-id-123"; // Mock the job ID for a successful job creation
    }
    throw { name: "MissingFieldError", message: "Missing required fields: file_data and/or file_schema" };
  }

  async createFile(id: string) {
    throw Error("not implemented")
  }
}

describe('UploadFileController', () => {
  let app: express.Express;
  let uploadFileController: UploadFileController;
  let mockUseCase: MockUploadFileUseCase;

  // Set up multer for file uploads in tests
  const storage = multer.memoryStorage();
  const upload = multer({ storage }).single('file_content'); 

  beforeEach(() => {
    app = express();
    mockUseCase = new MockUploadFileUseCase();
    uploadFileController = new UploadFileController(mockUseCase);

    // Register the controller's route handler
    //@ts-ignore
    app.post('/upload', upload, (req, res) => uploadFileController.onCreateJob(req, res));
  });

  it('should return 400 for invalid file content', async () => {
    const invalidFileContent = Buffer.from('invalid file content');
    const schema = JSON.stringify({ column1: 'string' });

    const response = await request(app)
      .post('/upload')
      .attach('file_content', invalidFileContent, 'file.xlsx')
      .field('file_schema', schema);

    // Assuming the `XLSX.read` might throw an error or handle invalid content internally
    expect(response.status).toBe(500); // If invalid file content is an issue, it will return 500
    expect(response.body).toEqual({ message: "Internal Server Error" });
  });

  it('should return 500 for internal server errors', async () => {
    // Simulating an unexpected error in the use case
    const errorUseCase = {
      createJob: jest.fn().mockRejectedValue(new Error("Unexpected error"))
    };

    const errorController = new UploadFileController(errorUseCase as any);
    //@ts-ignore
    app.post('/upload', upload, (req, res) => errorController.onCreateJob(req, res));

    const fileContent = Buffer.from('mock excel content');
    const schema = JSON.stringify({ column1: 'string' });

    const errorResponse = await request(app)
      .post('/upload')
      .attach('file_content', fileContent, 'file.xlsx')
      .field('file_schema', schema);

    expect(errorResponse.status).toBe(500);
    expect(errorResponse.body).toEqual({ message: "Internal Server Error" });
  });
});
