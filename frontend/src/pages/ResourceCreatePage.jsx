import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarBlack from "../components/NavbarBlack.jsx";
import FooterBlack from "../components/FooterBlack.jsx";
import apiClient from "../api/axiosClient.js";
import { useCheckAuth } from "../api/auth.js";
import { TextInput, TextAreaWithCount } from "../components/ui/InputKit";

export default function ResourceCreatePage() {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "학업", // 기본값
        provider: "",
        subject: "",
        file_url: "",
    });

    const { id } = useParams();
    const navigate = useNavigate();
    const checkAuth = useCheckAuth();

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "제목을 입력해주세요.";
        if (!formData.content.trim()) newErrors.content = "내용을 입력해주세요.";
        if (!formData.provider.trim()) newErrors.provider = "제공자를 입력해주세요.";
        if (!formData.subject.trim()) newErrors.subject = "관련 과목을 입력해주세요.";
        if (!formData.file_url.trim()) newErrors.file_url = "자료 주소를 입력해주세요.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        checkAuth(); // 인증 확인

        if (id) {
            const fetchResource = async () => {
                try {
                    const response = await apiClient.get(
                        `${import.meta.env.VITE_API_URL}/resources/${id}`
                    );
                    setFormData(response.data);
                } catch (error) {
                    console.error("자료 불러오기 중 오류 발생:", error);
                    alert("자료를 불러오는 중 오류가 발생했습니다.");
                }
            };
            fetchResource();
        }
    }, [id]); // checkAuth 제거

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;
        if (!validate()) return;

        setSubmitting(true);

        try {
            if (id) {
                console.log(formData);
                // 수정 모드: PUT 요청으로 기존 자료 수정
                await apiClient.put(

                    `${import.meta.env.VITE_API_URL}/resources/new-resource/${id}`,
                    formData
                );
                alert("자료가 성공적으로 수정되었습니다.");
            } else {
                // 새 글 작성: POST 요청으로 자료 등록
                await apiClient.post(
                    `${import.meta.env.VITE_API_URL}/resources/new-resource`,
                    formData
                );
                alert("자료가 성공적으로 등록되었습니다.");
            }
            navigate("/resources");
        } catch (error) {
            console.error("자료 등록/수정 중 오류 발생:", error);
            alert("자료 등록/수정에 실패했습니다.");
        } finally {
            setSubmitting(false); // 요청 완료 후 제출 상태 해제
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarBlack />

            <div className="min-h-screen flex flex-col flex-grow px-80 py-12">
                <h1 className="text-3xl font-bold mb-10">
                    {id ? "자료 수정" : "자료 등록"}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 입력 */}
                     <TextInput
                       id="title"
                       label="제목"
                       required
                       name="title"
                       value={formData.title}
                       onChange={handleChange}
                       placeholder="제목을 입력하세요"
                       error={errors.title}
                     />

                    {/* 내용 입력 */}
                     <TextAreaWithCount
                       id="content"
                       label="내용"
                       required
                       name="content"
                       value={formData.content}
                       onChange={handleChange}
                       placeholder="내용을 입력하세요"
                       rows={7}
                       maxLength={1000}
                       error={errors.content}
                     />

                    {/* 카테고리 선택 */}
                    <div>
                        <label htmlFor="category" className="text-sm block mb-2">
                            카테고리
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        >
                            <option value="학업">학업</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    {/* 제공자 입력 */}
                     <TextInput
                       id="provider"
                       label="제공자"
                       required
                       name="provider"
                       value={formData.provider}
                       onChange={handleChange}
                       placeholder="제공자를 입력하세요"
                       error={errors.provider}
                     />

                    {/* 과목 입력 */}
                     <TextInput
                       id="subject"
                       label="관련 과목"
                       required
                       name="subject"
                       value={formData.subject}
                       onChange={handleChange}
                       placeholder="관련 과목명을 입력하세요(ex. 대학물리학, 기타)"
                       error={errors.subject}
                     />

                    {/* 클라우드 주소 입력 */}
                     <TextInput
                       id="file_url"
                       label="자료 주소"
                       required
                       type="url"
                       name="file_url"
                       value={formData.file_url}
                       onChange={handleChange}
                       placeholder="http://example.com/resource.pdf"
                       error={errors.file_url}
                     />

                    {/* 제출 버튼 */}
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                            {id ? "수정하기" : "등록하기"}
                        </button>
                    </div>
                </form>
            </div>

            <FooterBlack />
        </div>
    );
}