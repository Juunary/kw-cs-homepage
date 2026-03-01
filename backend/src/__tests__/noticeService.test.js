jest.mock('../models/Notices', () => ({
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
}));
jest.mock('../models/Category', () => ({
    findOne: jest.fn(),
}));

const NoticeModel = require('../models/Notices');
const CategoryModel = require('../models/Category');
const noticeService = require('../services/noticeService');

describe('noticeService', () => {
    beforeEach(() => jest.clearAllMocks());

    // ──────────────────────────────────────────────
    // getNoticeById
    // ──────────────────────────────────────────────
    describe('getNoticeById', () => {
        test('공지사항을 찾아 반환한다', async () => {
            const mockNotice = { id: 1, title: '공지', isDeleted: 0 };
            NoticeModel.findByPk.mockResolvedValue(mockNotice);

            const result = await noticeService.getNoticeById(1);

            expect(result).toEqual(mockNotice);
        });

        test('isDeleted=1 이면 null 반환', async () => {
            NoticeModel.findByPk.mockResolvedValue({ id: 1, title: '삭제됨', isDeleted: 1 });

            const result = await noticeService.getNoticeById(1);

            expect(result).toBeNull();
        });

        test('존재하지 않으면 null 반환', async () => {
            NoticeModel.findByPk.mockResolvedValue(null);

            const result = await noticeService.getNoticeById(999);

            expect(result).toBeNull();
        });
    });

    // ──────────────────────────────────────────────
    // incrementCount
    // ──────────────────────────────────────────────
    describe('incrementCount', () => {
        test('참여자 수를 1 증가시킨다', async () => {
            const mockNotice = { current_participants: 3, save: jest.fn() };
            NoticeModel.findByPk.mockResolvedValue(mockNotice);

            const result = await noticeService.incrementCount(1);

            expect(mockNotice.current_participants).toBe(4);
            expect(mockNotice.save).toHaveBeenCalled();
            expect(result.current_participants).toBe(4);
        });

        test('current_participants가 null이면 1로 설정된다', async () => {
            const mockNotice = { current_participants: null, save: jest.fn() };
            NoticeModel.findByPk.mockResolvedValue(mockNotice);

            const result = await noticeService.incrementCount(1);

            expect(result.current_participants).toBe(1);
        });

        test('공지사항이 없으면 에러를 던진다', async () => {
            NoticeModel.findByPk.mockResolvedValue(null);

            await expect(noticeService.incrementCount(999))
                .rejects.toThrow('Failed to update participants');
        });
    });

    // ──────────────────────────────────────────────
    // getNotices (카테고리 필터링)
    // ──────────────────────────────────────────────
    describe('getNotices', () => {
        test('카테고리 없이 전체 목록을 반환한다', async () => {
            NoticeModel.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: [
                    { toJSON: () => ({ id: 1, title: '공지1', category_id: 1 }) },
                    { toJSON: () => ({ id: 2, title: '공지2', category_id: 2 }) },
                ],
            });

            const result = await noticeService.getNotices(null, 1, 10);

            expect(result.total).toBe(2);
            expect(result.notices).toHaveLength(2);
            expect(CategoryModel.findOne).not.toHaveBeenCalled();
        });

        test('카테고리 이름으로 필터링한다', async () => {
            CategoryModel.findOne.mockResolvedValue({ id: 1, category_name: '학과' });
            NoticeModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ toJSON: () => ({ id: 1, title: '학과공지', category_id: 1 }) }],
            });

            const result = await noticeService.getNotices('학과', 1, 10);

            expect(CategoryModel.findOne).toHaveBeenCalledWith({ where: { category_name: '학과' } });
            expect(result.total).toBe(1);
            expect(result.notices[0].category).toBe('학과');
        });

        test('존재하지 않는 카테고리면 에러를 던진다', async () => {
            CategoryModel.findOne.mockResolvedValue(null);

            await expect(noticeService.getNotices('없는카테고리', 1, 10))
                .rejects.toThrow('Failed to fetch notices');
        });
    });
});
