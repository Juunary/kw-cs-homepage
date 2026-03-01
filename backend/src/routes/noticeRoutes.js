const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const validators = require('../validators/noticeValidator');
const validationMiddleware = require('../middlewares/validationMiddleware');
const verifyAuth = require('../middlewares/authMiddleware');
const upload = require("../middlewares/multerMiddleware"); // Multer 미들웨어 임포트

// 페이징 기능이 포함되고 카테고리 별로 필터링 된 공지사항 목록 API
router.get('/',
    validators.validateNoticesQuery,      // 유효성 검사 체인
    validationMiddleware.handleValidationErrors,    // 에러 처리 미들웨어
    noticeController.getNotices);

router.get('/:id',
    noticeController.getNoticeById,
    )

// 공지사항 저장 API
router.post('/new-notice',
    verifyAuth,
    validators.validateCreateNotice,
    validationMiddleware.handleValidationErrors,
    noticeController.createNotice);

// 이미지 처리 API
router.post("/new-notice/upload",
    verifyAuth,
    upload.single("file"),
    noticeController.uploadNoticeImage);

// 공지사항 수정 API
router.put('/new-notice/:id/update',
    verifyAuth,
    validators.validateCreateNotice,
    validationMiddleware.handleValidationErrors,
    noticeController.updateNotice);

// 공지사항 논리적 삭제 API
router.delete('/:id/delete',
    verifyAuth,
    noticeController.deleteNotice);

// increment Count API
router.patch("/:id/increment-participants", noticeController.incrementParticipants);

module.exports = router;