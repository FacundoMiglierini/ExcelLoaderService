import request from "supertest";
import { GetFileController } from "../src/controllers/GetFileController";
import { IGetFileUseCase } from "../src/interfaces/IGetFileUseCase";
import express from "express";

const mockContent = [{
                        "name": "Esteban",
                        "age": 30,
                        "nums": [1, 3, 8, 9, 12, 32, 34, 78, 97, 100]
                    }]


// Mock the IGetFileUseCase
class MockGetFileUseCase implements IGetFileUseCase {
  async getFile(id: string) {
    if (id === "valid-id") {
      return { fileId: id, content: mockContent};
    }
    throw { name: "NotFoundError", message: "File not found" };
  }
}

describe('GetFileController', () => {
  let app: express.Express;
  let getFileController: GetFileController;

  beforeEach(() => {
    app = express();
    getFileController = new GetFileController(new MockGetFileUseCase());

    //@ts-ignore
    app.get('/file/:id', (req, res) => getFileController.onGetFile(req, res));
  });

  it('should return file data when file exists', async () => {
    const response = await request(app).get('/file/valid-id');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ fileId: "valid-id", content: mockContent });
  });

  it('should return 404 when file does not exist', async () => {
    const response = await request(app).get('/file/invalid-id');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "File not found" });
  });
});
