jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const verifyAuth = require('../middlewares/authMiddleware');

describe('authMiddleware (verifyAuth)', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        process.env.JWT_SECRET = 'test_secret';
        jest.clearAllMocks();
    });

    test('Authorization 헤더가 없으면 401 반환', () => {
        verifyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: '토큰이 제공되지 않았습니다.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('유효하지 않은 토큰이면 403 반환', () => {
        req.headers.authorization = 'Bearer invalid_token';
        jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

        verifyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: '유효하지 않은 토큰입니다.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('유효한 토큰이면 req.user를 설정하고 next()를 호출한다', () => {
        req.headers.authorization = 'Bearer valid_token';
        jwt.verify.mockReturnValue({ id: 'admin', department: 'CS' });

        verifyAuth(req, res, next);

        expect(req.user).toEqual({ id: 'admin', department: 'CS' });
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
