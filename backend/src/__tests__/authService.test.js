// authService는 Admin 모델, bcrypt, jwt에 의존한다.
// 실제 DB 연결 없이 테스트하기 위해 모두 모킹한다.
jest.mock('../models/Admin', () => ({ findOne: jest.fn() }));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authService = require('../services/authService');

describe('authService.login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
    });

    test('존재하지 않는 계정이면 에러를 던진다', async () => {
        Admin.findOne.mockResolvedValue(null);

        await expect(authService.login('nobody', 'pw'))
            .rejects.toThrow('사용자를 찾을 수 없습니다.');
    });

    test('비밀번호가 틀리면 에러를 던진다', async () => {
        Admin.findOne.mockResolvedValue({ id: 'admin', password: 'hashed', department: 'CS' });
        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.login('admin', 'wrong'))
            .rejects.toThrow('비밀번호가 일치하지 않습니다.');
    });

    test('로그인 성공 시 JWT 토큰을 반환한다', async () => {
        Admin.findOne.mockResolvedValue({ id: 'admin', password: 'hashed', department: 'CS' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mocked_token');

        const token = await authService.login('admin', 'correct');

        expect(token).toBe('mocked_token');
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 'admin', department: 'CS' },
            'test_secret',
            { expiresIn: '5h' }
        );
    });
});
