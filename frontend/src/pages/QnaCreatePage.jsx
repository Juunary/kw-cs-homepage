import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarBlack from "../components/NavbarBlack.jsx";
import FooterBlack from "../components/FooterBlack.jsx";
import { TextInput, PasswordInput, TextAreaWithCount } from "../components/ui/InputKit";

const QnaCreatePage = () => {
    const [title, setTitle] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [question, setQuestion] = useState("");

    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = "제목을 입력해주세요.";
        if (!nickname.trim()) newErrors.nickname = "작성자를 입력해주세요.";
        if (!/^\d{4}$/.test(password)) newErrors.password = "비밀번호는 4자리 숫자여야 합니다.";
        if (!question.trim()) newErrors.question = "질문 내용을 입력해주세요.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;
        if (!validate()) return;

        setSubmitting(true);

        try {
            // 서버로 POST 요청 보내기
            await axios.post(`${import.meta.env.VITE_API_URL}/qna/new-question`, {
                title,
                nickname,
                password,
                question,
            });
            alert("질문이 등록되었습니다.");
            // 성공 시 /qna로 이동
            navigate("/qna");
        } catch (error) {
            if (error.response && error.response.status === 429) {
                alert("너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.");
                navigate("/");
            } else {
                console.error("Error submitting question:", error);
                alert("질문 등록에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setSubmitting(false); // 요청 완료 후 제출 상태 해제
        }
    };

    const handleCancel = () => {
        // /qna로 이동
        navigate("/qna");
    };

    return (
        <div>
            <NavbarBlack />
            <div className="container mx-auto mt-10 px-4 border-t">

                <h1 className="text-3xl font-bold mb-6 mt-6 max-w-3xl mx-auto">1:1 질문하기</h1>
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-300 rounded-3xl p-6 max-w-3xl mx-auto"
                >
                    <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
                        <span>모든 질문은 공개입니다 :)</span>
                        <span>모든 항목 필수</span>
                    </div>
                    <div className="border-t border-black border-[1px] mb-6"></div>

                    <div className="mb-4">

                         <TextInput
                           label="제목"
                           required
                           placeholder="제목을 입력하세요"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           error={errors.title}
                         />
                    </div>
                    <div className="mb-4">
                         <TextInput
                           label="작성자"
                           required
                           placeholder="예: 다니엘"
                           value={nickname}
                           onChange={(e) => setNickname(e.target.value)}
                           className="max-w-xs"
                           error={errors.nickname}
                         />
                    </div>
                    <div className="mb-4">
                         <PasswordInput
                           label="비밀번호 (수정용)"
                           required
                           placeholder="예: 1234"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           error={errors.password}
                         />
                    </div>
                    <div className="mb-6">
                         <TextAreaWithCount
                           label="질문 내용"
                           required
                           placeholder="질문 내용을 작성해 주세요"
                           maxLength={300}
                           value={question}
                           onChange={(e) => setQuestion(e.target.value)}
                           error={errors.question}
                         />
                    </div>
                    <div className="flex justify-center space-x-4 mt-20">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-9 py-2 border border-gray-700 text-gray-700 rounded-full hover:bg-gray-100 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-9 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        >
                            등록
                        </button>
                    </div>
                </form>
            </div>
            <FooterBlack/>
        </div>
    );
};

export default QnaCreatePage;