const Questions = require('../models/Questions')
const bcrypt = require('bcrypt')

/**
 * @swagger
 * /api/qna/new-question:
 *   post:
 *     summary: 질문을 등록합니다.
 *     description: 새로운 질문을 등록합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Example title"
 *               nickname:
 *                 type: string
 *                 example: userNickname
 *               IP:
 *                 type: string
 *                 example: 192.168.1.1
 *               question:
 *                 type: string
 *                 example: "How to use Swagger?"
 *               password:
 *                 type: integer
 *                 example: 1234
 *     responses:
 *       201:
 *         description: 질문이 성공적으로 등록되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: 질문 등록 실패
 */
exports.createQuestion = async (req, res) => {
    try {
        const data = req.body;
        data.password = await bcrypt.hash(String(data.password), 10);

        const newQuestion = await Questions.create(data);

        res.status(201).json(newQuestion); // 성공적으로 생성된 질문 반환
    } catch (error) {
        console.log("createQuestion error in server Controller: " + error);
        res.status(400).json({ error: error.message }); // 오류 발생 시 400 에러 반환
    }
};

/**
 * @swagger
 * /api/qna:
 *   get:
 *     summary: 모든 질문을 조회합니다.
 *     description: 삭제되지 않은 질문만 조회됩니다.
 *     responses:
 *       200:
 *         description: 질문 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
exports.getQuestions = async (req, res) => {
    const { page = 1, size = 10 } = req.query; // 기본 페이지: 1, 기본 크기: 10
    const offset = (page - 1) * size; // 데이터 시작 지점
    const limit = parseInt(size); // 페이지당 항목 수

    try {
        const { count, rows } = await Questions.findAndCountAll({
            where: { isDeleted: 0 }, // 삭제되지 않은 질문만
            offset,
            limit,
            attributes: { exclude: ['password'] }, // password 컬럼 제외
            order: [['created_at', 'DESC']], // 최신 질문 우선
        });

        res.status(200).json({
            total: count,   // 전체 질문 수
            page,           // 현재 페이지
            size,           // 페이지당 항목 수
            questions: rows // 질문 데이터
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to retrieve questions' });
    }
};

/**
 * @swagger
 * /api/qna/{id}:
 *   get:
 *     summary: 특정 질문의 상세 정보를 조회합니다.
 *     description: 질문 ID를 사용하여 특정 질문의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 질문의 ID
 *     responses:
 *       200:
 *         description: 질문 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: 질문을 찾을 수 없음
 */
exports.getQuestionById = async (req, res) => {
    const { id } = req.params; // URL에서 질문 ID 가져오기

    try {
        // ID로 질문 조회 (삭제되지 않은 질문만)
        const question = await Questions.findOne({ where: { id, isDeleted: 0 } });
        if (question) {
            res.status(200).json(question); // 질문 반환
        } else {
            res.status(404).json({ error: 'Question not found' }); // 질문이 없으면 404 에러 반환
        }
    } catch (error) {
        console.log('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to retrieve question' }); // 오류 발생 시 500 에러 반환
    }
};

exports.validatePassword = async (req, res) => {
    const { id, password } = req.body;

    try {
        const question = await Questions.findByPk(id);
        if (!question) {
            return res.status(404).json({ error: "질문을 찾을 수 없습니다." });
        }

        // 비밀번호 검증
        const isMatch = await bcrypt.compare(String(password), question.password);
        if (!isMatch) {
            return res.status(403).json({ error: "비밀번호가 올바르지 않습니다." });
        }

        res.status(200).json({ message: "비밀번호가 유효합니다." });
    } catch (error) {
        console.error("Error validating password:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
};

exports.updateQuestion = async (req, res) => {
    const { id } = req.params; // URL의 ID 추출
    const { title, question } = req.body; // 요청 본문에서 제목과 질문 내용 추출

    try {
        // 해당 ID의 삭제되지 않은 질문 조회
        const existingQuestion = await Questions.findOne({ where: { id, isDeleted: 0 } });

        if (!existingQuestion) {
            return res.status(404).json({ error: "Question not found" }); // 질문이 없으면 404 반환
        }

        // 제목과 질문 내용 업데이트
        existingQuestion.title = title || existingQuestion.title;
        existingQuestion.question = question || existingQuestion.question;
        existingQuestion.updated_at = new Date(); // 수정 시간 업데이트

        await existingQuestion.save(); // 변경 사항 저장

        res.status(200).json({
            message: "Question updated successfully",
            question: existingQuestion,
        });
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ error: "Failed to update question" });
    }
};

/**
 * @swagger
 * /api/qna/answer/{id}:
 *   put:
 *     summary: 답변을 작성합니다.
 *     description: 관리자가 특정 질문에 답변을 작성합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 질문의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_id:
 *                 type: string
 *                 example: "admin123"
 *               answer:
 *                 type: string
 *                 example: "This is the answer."
 *     responses:
 *       200:
 *         description: 답변이 성공적으로 작성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: 질문을 찾을 수 없음
 */
exports.updateAnswer = async (req, res) => {
    const { id } = req.params;
    const answer = req.body.answer;
    const admin_id = req.user.id;

    try {
        // 해당 ID의 삭제되지 않은 질문 조회
        const question = await Questions.findOne({ where: { id, isDeleted: 0 } });
        if (question) {
            question.answer = answer; 
            question.admin_id = admin_id; 
            question.updated_at = new Date(); 
            await question.save(); 
            res.status(200).json(question); 
        } else {
            res.status(404).json({ error: 'Question not found' }); // 질문이 없으면 404 에러 반환
        }
    } catch (error) {
        res.status(400).json({ error: 'Failed to update answer' }); // 오류 발생 시 400 에러 반환
    }
};

/**
 * @swagger
 * /api/qna/delete/{id}:
 *   delete:
 *     summary: 질문을 삭제합니다.
 *     description: 관리자가 질문을 논리 삭제(소프트 삭제)합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 질문의 ID
 *     responses:
 *       200:
 *         description: 질문이 성공적으로 삭제되었습니다.
 *       404:
 *         description: 질문을 찾을 수 없음
 */
exports.deleteQuestion = async (req, res) => {
    const { id } = req.params; // URL에서 질문 ID를 가져옴
    try {
        const question = await Questions.findOne({ where: { id } });
        if (question) {
            question.isDeleted = 1; // 논리 삭제 처리 (isDeleted 값을 1로 설정)
            await question.save(); // 변경사항 저장
            res.status(200).json({ message: 'Question deleted' }); // 삭제 성공 메시지 반환
        } else {
            res.status(404).json({ error: 'Question not found' }); // 질문이 없으면 404 에러 반환
        }
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete question' }); // 오류 발생 시 400 에러 반환
    }
};

exports.deleteAnswer = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await Questions.findOne({ where: { id } });
        if (question) {
            question.admin_id = null;
            question.answer = null;
            question.updated_at = new Date();

            await question.save();
            res.status(200).json({ message: 'Question deleted' });
        }
    } catch (e){
        res.status(404).json({ error: 'Failed to delete answer' });
    }
}
