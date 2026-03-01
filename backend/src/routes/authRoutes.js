const express = require("express");
const rateLimit = require("express-rate-limit");
const { validateLogin } = require("../validators/authValidator");
const { handleValidationErrors } = require("../middlewares/validationMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 5, // 15분 동안 최대 5회
    message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."
});

router.post(
    "/login",
    loginLimiter,
    ...validateLogin,
    handleValidationErrors,
    authController.login
);

module.exports = router;