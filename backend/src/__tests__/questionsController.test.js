jest.mock('../models/Questions', () => ({
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
}));
jest.mock('bcrypt');

const bcrypt = require('bcrypt');
const Questions = require('../models/Questions');
const questionsController = require('../controllers/QuestionsController');

describe('QuestionsController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            headers: { 'x-forwarded-for': '1.2.3.4' },
            connection: { remoteAddress: '127.0.0.1' },
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    // ──────────────────────────────────────────────
    // createQuestion
    // ──────────────────────────────────────────────
    describe('createQuestion', () => {
        test('비밀번호를 bcrypt로 해싱하여 저장한다', async () => {
            req.body = { title: '테스트 질문', question: '내용입니다', nickname: 'user', password: '1234' };
            bcrypt.hash.mockResolvedValue('$2b$10$hashed_value');
            Questions.create.mockResolvedValue({ id: 1, ...req.body, password: '$2b$10$hashed_value' });

            await questionsController.createQuestion(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
            expect(Questions.create).toHaveBeenCalledWith(
                expect.objectContaining({ password: '$2b$10$hashed_value' })
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('저장 실패 시 400을 반환한다', async () => {
            req.body = { title: '테스트', question: '내용', nickname: 'user', password: '1234' };
            bcrypt.hash.mockResolvedValue('$2b$10$hashed_value');
            Questions.create.mockRejectedValue(new Error('DB error'));

            await questionsController.createQuestion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ──────────────────────────────────────────────
    // validatePassword
    // ──────────────────────────────────────────────
    describe('validatePassword', () => {
        test('비밀번호 일치 시 200 반환', async () => {
            req.body = { id: 1, password: '1234' };
            Questions.findByPk.mockResolvedValue({ password: '$2b$10$hashed_value' });
            bcrypt.compare.mockResolvedValue(true);

            await questionsController.validatePassword(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith('1234', '$2b$10$hashed_value');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: '비밀번호가 유효합니다.' });
        });

        test('비밀번호 불일치 시 403 반환', async () => {
            req.body = { id: 1, password: '9999' };
            Questions.findByPk.mockResolvedValue({ password: '$2b$10$hashed_value' });
            bcrypt.compare.mockResolvedValue(false);

            await questionsController.validatePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: '비밀번호가 올바르지 않습니다.' });
        });

        test('질문이 존재하지 않으면 404 반환', async () => {
            req.body = { id: 999, password: '1234' };
            Questions.findByPk.mockResolvedValue(null);

            await questionsController.validatePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ──────────────────────────────────────────────
    // getQuestions
    // ──────────────────────────────────────────────
    describe('getQuestions', () => {
        test('질문 목록과 페이징 정보를 반환한다', async () => {
            req.query = { page: '1', size: '10' };
            Questions.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ id: 1, title: '질문', nickname: 'user' }],
            });

            await questionsController.getQuestions(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                total: 1,
                questions: expect.any(Array),
            }));
        });
    });
});
