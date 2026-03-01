import NavbarBlack from "../components/NavbarBlack.jsx";
import FooterBlack from "../components/FooterBlack.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CategorySelector from "../components/button/CategorySelector.jsx";
import apiClient from "../api/axiosClient.js";
import { useCheckAuth } from "../api/auth";
import { TextInput, TextAreaWithCount } from "../components/ui/InputKit";

const NewNoticePage = () => {
    const { id } = useParams(); // URL에서 공지사항 ID 가져오기
    const [title, setTitle] = useState(null);
    const [url, setUrl] = useState(null);
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState(null);
    const [category, setCategory] = useState("학과");
    const [maxParticipants, setMaxParticipants] = useState(null);
    // 에디터 초기화 여부를 추적할 상태
    const [isEditorInitialized, setIsEditorInitialized] = useState(false);
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!title || !title.trim()) newErrors.title = "제목을 입력해주세요.";
        if (!content || !content.trim()) newErrors.content = "본문 내용을 입력해주세요.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkAuth = useCheckAuth(); // useCheckAuth 훅 호출

    useEffect(() => {
        checkAuth(); // 인증 확인
    }, []);

    useEffect(() => {
        const loadTinyMCE = async () => {
            if (!window.tinymce) {
                await new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/tinymce.min.js";
                    script.onload = resolve;
                    document.body.appendChild(script);
                });
            }

            window.tinymce.init({
                selector: "#content-editor",
                height: 500,
                menubar: false,
                plugins: [
                    "advlist autolink lists link image charmap preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste help wordcount",
                ],
                toolbar: "formatselect | bold forecolor backcolor image link| \
                      alignleft aligncenter alignright alignjustify lineheight | \
                      bullist numlist outdent indent",
                script_url: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/tinymce.min.js",
                content_style: `
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.5;
                    }
                    p {
                        margin: 0;
                        padding: 0;
                    }
                    a {
                        color: #007bff !important;
                        text-decoration: underline;
                    }
                    `,
                external_plugins: {
                    image: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/image/plugin.min.js",
                    advlist: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/advlist/plugin.min.js",
                    autolink: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1cjt69gxy1q0387/tinymce/6/plugins/autolink/plugin.min.js",

                    lists: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/lists/plugin.min.js",
                    link: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/link/plugin.min.js",
                    charmap: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/charmap/plugin.min.js",
                    preview: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/preview/plugin.min.js",
                    anchor: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/anchor/plugin.min.js",
                    searchreplace: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/searchreplace/plugin.min.js",
                    visualblocks: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/visualblocks/plugin.min.js",
                    code: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/code/plugin.min.js",
                    fullscreen: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/fullscreen/plugin.min.js",
                    insertdatetime: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/insertdatetime/plugin.min.js",
                    media: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/media/plugin.min.js",
                    table: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/table/plugin.min.js",
                    paste: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/paste/plugin.min.js",
                    help: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/help/plugin.min.js",
                    wordcount: "https://cdn.tiny.cloud/1/sy6aa0rd1w6jksim904zlqeuan53xj3lr1cjt69gxy1q0387/tinymce/6/plugins/wordcount/plugin.min.js",
                },
                setup: (editor) => {
                    editorRef.current = editor;
                    // 초기 로딩 시 에디터에 content 설정
                    editor.on("init", () => {
                        setIsEditorInitialized(true);
                        if (content) {
                            editor.setContent(content);
                        }
                    });
                    editor.on("change", () => {
                        const content = editor.getContent();
                        setContent(content);
                    });
                },
                file_picker_callback: (callback, value, meta) => {
                    if (meta.filetype === "image") {
                        const input = document.createElement("input");
                        input.setAttribute("type", "file");
                        input.setAttribute("accept", "image/*");

                        input.addEventListener("change", async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const formData = new FormData();
                                formData.append("file", file);

                                try {
                                    const response = await fetch(
                                        `${import.meta.env.VITE_API_URL}/notices/new-notice/upload`,
                                        {
                                            method: "POST",
                                            body: formData,
                                        }
                                    );

                                    if (response.ok) {
                                        const data = await response.json();
                                        callback(data.location, { title: file.name });
                                    } else {
                                        throw new Error("이미지 업로드 실패");
                                    }
                                } catch (error) {
                                    console.error("이미지 업로드 중 에러 발생:", error);
                                }
                            }
                        });

                        input.click();
                    }
                },
            });
        };

        loadTinyMCE();
    }, []);

    // 에디터가 초기화된 후 content 상태 변경이 있을 때 에디터에 반영하도록 합니다.
    useEffect(() => {
        if (isEditorInitialized) {
            const editor = window.tinymce.get("content-editor");
            if (editor) {
                const currentEditorContent = editor.getContent();
                // 에디터 내용과 state의 content가 다를 때만 업데이트
                if (currentEditorContent !== content) {
                    editor.setContent(content);
                }
            }
        }
    }, [isEditorInitialized, content]);


// 수정 모드라면 기존 공지사항 데이터를 불러옵니다.
    useEffect(() => {
        if (id) {
            const fetchNoticeData = async () => {
                try {
                    const response = await apiClient.get(
                        `${import.meta.env.VITE_API_URL}/notices/${id}`
                    );
                    if (response.status === 200) {
                        const notice = response.data;
                        setTitle(notice.title);
                        setUrl(notice.url);
                        setExcerpt(notice.excerpt);
                        setCategory(notice.category);
                        setContent(notice.content);
                        // 만약 에디터가 이미 초기화된 상태라면 바로 내용 반영
                        if(notice.max_participants){
                            setMaxParticipants(notice.max_participants);
                        }
                        if (isEditorInitialized) {
                            const editor = window.tinymce.get("content-editor");
                            if (editor) {
                                editor.setContent(notice.content);
                            }
                        }
                    }
                } catch (error) {
                    console.error("공지사항 데이터를 불러오는데 실패했습니다.", error);
                    alert("공지사항 데이터를 불러오지 못했습니다.");
                }
            };

            fetchNoticeData();
        }
    }, [id, isEditorInitialized]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;
        if (!validate()) return;

        setSubmitting(true);

        const requestData = {
            title,
            url,
            content,
            excerpt,
            max_participants: maxParticipants || null,
            category,
        };

        if(url == null || url == ""){
            delete requestData.url;
            delete requestData.max_participants;
        }

        try {
            let response;
            if (id) {
                // 수정 모드: PUT 요청
                response = await apiClient.put(`${import.meta.env.VITE_API_URL}/notices/new-notice/${id}/update`, requestData);
            } else {
                // 생성 모드: POST 요청
                response = await apiClient.post(`${import.meta.env.VITE_API_URL}/notices/new-notice`, requestData);
            }


            if (response.status === 200 || response.status === 201) {
                alert(`공지사항이 ${id ? "수정" : "등록"}되었습니다!`);
                navigate("/notices");
            } else {
                console.log("프론트엔드에서 에러 발생:", response.data);
            }
        } catch (error) {
            // 서버에서 validation error가 발생하면 error.response.data에 관련 정보가 담겨 있음
            if (error.response && error.response.data) {
                const { errors } = error.response.data;
                alert(errors[0]);
            } else {
                console.error("Network Error:", error);
                alert("서버와의 통신에 실패했습니다. " + error);
            }
        } finally {
            setSubmitting(false); // 요청 완료 후 제출 상태 해제
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarBlack />
            <div className="flex flex-col flex-grow px-48 py-12 border-t">
                <form className="flex flex-col flex-grow" onSubmit={handleSubmit}>
                    {/* 제목 입력 */}
                     <TextInput
                       id="title"
                       label="제목"
                       required
                       placeholder="제목을 입력하세요."
                       className="mb-6 text-2xl"
                       value={title ?? ""}
                       onChange={(e) => setTitle(e.target.value)}
                       error={errors.title}
                     />
                    {/* URL 입력 */}
                     <TextInput
                       id="url"
                       type="url"
                       label="구글 폼 URL (선택)"
                       placeholder="https://..."
                       className="mb-6"
                       value={url ?? ""}
                       onChange={(e) => setUrl(e.target.value)}
                       hint="미입력 시 자동으로 제외됩니다."
                     />
                    {/*/!* 최대 인원 *!/*/}
                    {/*<input*/}
                    {/*    type="number"*/}
                    {/*    placeholder="최대 참가자 수를 입력하세요."*/}
                    {/*    className="w-1/4 px-4 py-2 mb-6 border rounded-lg focus:outline-none"*/}
                    {/*    value={maxParticipants}*/}
                    {/*    onChange={(e) => setMaxParticipants(e.target.value)}*/}
                    {/*/>*/}
                    {/* 카테고리 선택 */}
                    <CategorySelector category={category} setCategory={setCategory} />
                    {/* TinyMCE 에디터 */}
                    <textarea id="content-editor" className="hidden"></textarea>
                    {errors.content && (
                        <p className="mt-1 text-xs font-medium text-red-600">{errors.content}</p>
                    )}
                    {/* 요약 */}
                    <textarea
                        placeholder="공지 요약을 작성하세요."
                        className="w-full px-4 py-2 mb-6 border rounded-lg resize-none mt-6"
                        rows="4"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                    />
                    {/* 버튼 */}
                    <div className="flex justify-end">
                        <button type="button"
                                onClick={() => navigate("/notices")}
                                className="mr-4 px-6 py-2 bg-gray-300 rounded-lg">
                            취소
                        </button>
                        <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg">
                            등록
                        </button>
                    </div>
                </form>
            </div>
            <FooterBlack />
        </div>
    );
};

export default NewNoticePage;