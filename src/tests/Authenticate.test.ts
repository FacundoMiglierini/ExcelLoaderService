import request from 'supertest';
import express from 'express';
import { Authenticate } from '../middleware/auth';
import { ValidateSignature } from '../utils/authUtils';

jest.mock('../utils/authUtils', () => ({
  ValidateSignature: jest.fn(),
}));

describe('Authenticate Middleware', () => {
  const app = express();

  let consoleErrorSpy: jest.SpyInstance<void>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should call next() when signature is valid', async () => {
    (ValidateSignature as jest.Mock).mockResolvedValue(true);

    //@ts-ignore
    app.use(Authenticate);

    await request(app)
      .get('/')
      .expect(404); 

    expect(ValidateSignature).toHaveBeenCalledTimes(1);
  });

  it('should return 401 when signature is invalid', async () => {
    (ValidateSignature as jest.Mock).mockResolvedValue(false);

    //@ts-ignore
    app.use(Authenticate);

    const res = await request(app)
      .get('/')
      .expect(401);

    expect(res.body).toEqual({ message: 'Not authorized' });
    expect(ValidateSignature).toHaveBeenCalledTimes(1);
  });

  it('should return 401 with error message when ValidateSignature throws an error', async () => {
    const errorMessage = 'Validation error';
    (ValidateSignature as jest.Mock).mockRejectedValue(new Error(errorMessage));

    //@ts-ignore
    app.use(Authenticate);

    const res = await request(app)
      .get('/')
      .expect(401);

    expect(res.body).toEqual({ message: errorMessage });
    expect(ValidateSignature).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when ValidateSignature throws an unknown error', async () => {
    (ValidateSignature as jest.Mock).mockRejectedValue('Unknown error');

    //@ts-ignore
    app.use(Authenticate);

    const res = await request(app)
      .get('/')
      .expect(500);

    expect(res.body).toEqual({ message: 'Internal Server Error' });
    expect(ValidateSignature).toHaveBeenCalledTimes(1);
  });
});
