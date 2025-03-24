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
const auth_1 = require("../src/middleware/auth");
const authUtils_1 = require("../src/utils/authUtils");
jest.mock('../src/utils/authUtils', () => ({
    ValidateSignature: jest.fn(),
}));
describe('Authenticate Middleware', () => {
    const app = (0, express_1.default)();
    let consoleErrorSpy;
    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.clearAllMocks();
    });
    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });
    it('should call next() when signature is valid', () => __awaiter(void 0, void 0, void 0, function* () {
        authUtils_1.ValidateSignature.mockResolvedValue(true);
        //@ts-ignore
        app.use(auth_1.Authenticate);
        yield (0, supertest_1.default)(app)
            .get('/')
            .expect(404);
        expect(authUtils_1.ValidateSignature).toHaveBeenCalledTimes(1);
    }));
    it('should return 401 when signature is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        authUtils_1.ValidateSignature.mockResolvedValue(false);
        //@ts-ignore
        app.use(auth_1.Authenticate);
        const res = yield (0, supertest_1.default)(app)
            .get('/')
            .expect(401);
        expect(res.body).toEqual({ message: 'Not authorized' });
        expect(authUtils_1.ValidateSignature).toHaveBeenCalledTimes(1);
    }));
    it('should return 401 with error message when ValidateSignature throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
        const errorMessage = 'Validation error';
        authUtils_1.ValidateSignature.mockRejectedValue(new Error(errorMessage));
        //@ts-ignore
        app.use(auth_1.Authenticate);
        const res = yield (0, supertest_1.default)(app)
            .get('/')
            .expect(401);
        expect(res.body).toEqual({ message: errorMessage });
        expect(authUtils_1.ValidateSignature).toHaveBeenCalledTimes(1);
    }));
    it('should return 500 when ValidateSignature throws an unknown error', () => __awaiter(void 0, void 0, void 0, function* () {
        authUtils_1.ValidateSignature.mockRejectedValue('Unknown error');
        //@ts-ignore
        app.use(auth_1.Authenticate);
        const res = yield (0, supertest_1.default)(app)
            .get('/')
            .expect(500);
        expect(res.body).toEqual({ message: 'Internal Server Error' });
        expect(authUtils_1.ValidateSignature).toHaveBeenCalledTimes(1);
    }));
});
