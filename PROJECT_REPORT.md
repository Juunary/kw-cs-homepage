# 광운대학교 컴퓨터정보공학부 홈페이지 프로젝트 보고서

> 작성일: 2026-03-01
> 대상 브랜치: `develop`
> 최근 커밋: `ea8cab7` — hotfix: react 긴급 패치 적용

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [아키텍처 구조](#3-아키텍처-구조)
4. [디렉터리 구조](#4-디렉터리-구조)
5. [데이터베이스 스키마](#5-데이터베이스-스키마)
6. [API 엔드포인트](#6-api-엔드포인트)
7. [프론트엔드 페이지 및 기능](#7-프론트엔드-페이지-및-기능)
8. [인증 및 권한 관리](#8-인증-및-권한-관리)
9. [디자인 시스템](#9-디자인-시스템)
10. [배포 및 CI/CD](#10-배포-및-cicd)
11. [보안 취약점 및 개선 사항](#11-보안-취약점-및-개선-사항)
12. [기술 부채 및 코드 품질](#12-기술-부채-및-코드-품질)
13. [팀 구성](#13-팀-구성)
14. [종합 평가](#14-종합-평가)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 광운대학교 컴퓨터정보공학부 홈페이지 |
| **레포지토리** | Kwangwoon-CS-DevTeam/kw-cs-homepage |
| **서비스 유형** | 학과 공식 홈페이지 (공지사항, 자료실, Q&A, 전공소개) |
| **배포 URL** | https://kwangwoon-cie.com |
| **배포 플랫폼** | Fly.io (Singapore 리전) |
| **아키텍처** | 모놀리식 풀스택 (REST API + SPA) |

### 주요 기능

- **공지사항 게시판** — 학과 및 총학 카테고리 분류, 페이지네이션, 참여자 수 관리
- **자료실** — 파일 업로드(AWS S3), 카테고리/키워드 검색 필터링
- **Q&A 게시판** — 비회원 질문 작성(비밀번호 인증), 관리자 답변 관리
- **전공 트랙 소개** — 지능컴퓨팅시스템, 지능정보 트랙 상세 페이지
- **관리자 인증** — JWT 기반 단일 관리자 계정 시스템

---

## 2. 기술 스택

### 백엔드

| 분류 | 기술 | 버전 |
|------|------|------|
| 런타임 | Node.js | 21+ |
| 프레임워크 | Express.js | ^4.21.2 |
| ORM | Sequelize | ^6.37.5 |
| 데이터베이스 | PostgreSQL | — |
| 인증 | JWT (jsonwebtoken) | ^9.0.2 |
| 암호화 | bcrypt | ^5.1.1 |
| 파일 스토리지 | AWS S3 (multer-s3) | ^2.10.0 |
| 유효성 검사 | express-validator | ^7.2.1 |
| 레이트 리미팅 | express-rate-limit | ^7.5.0 |
| API 문서 | Swagger/OpenAPI | ^6.2.8 |
| HTTP 클라이언트 | axios | ^1.7.9 |
| 로깅 | morgan | ^1.10.0 |
| CORS | cors | ^2.8.5 |
| 환경변수 | dotenv | ^16.4.7 |

### 프론트엔드

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | ^19.2.1 |
| 빌드 도구 | Vite | ^6.0.3 |
| 라우팅 | react-router-dom | ^7.1.1 |
| 스타일링 | Tailwind CSS | ^3.4.17 |
| UI 컴포넌트 | Flowbite (flowbite-react) | ^0.12.9 |
| 애니메이션 | Framer Motion | ^12.0.6 |
| 아이콘 | react-icons, @heroicons/react | ^5.4.0 / ^2.2.0 |
| 리치 텍스트 에디터 | TinyMCE React | ^5.1.1 |
| HTTP 클라이언트 | axios | ^1.7.9 |
| 토스트 알림 | sonner | ^2.0.7 |
| 로딩 스피너 | react-spinners | ^0.15.0 |
| 링크 자동변환 | react-linkify | ^1.0.0-alpha |
| 코드 품질 | ESLint + Prettier | ^9.17.0 / ^3.6.2 |

### 인프라

| 분류 | 기술 |
|------|------|
| 호스팅 | Fly.io (Singapore 리전) |
| 컨테이너 | Docker (Node 22.8.0-slim) |
| CI/CD | GitHub Actions |
| 파일 스토리지 | AWS S3 |
| SSL | Fly.io 자동 HTTPS 강제 적용 |

---

## 3. 아키텍처 구조

```
┌─────────────────────────────────────────────────────────┐
│                     클라이언트 (브라우저)                  │
│              React SPA (Vite 빌드, Fly.io 서빙)           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS REST API
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   백엔드 서버                              │
│              Express.js (Fly.io, Port 3000)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Auth    │ │ Notices  │ │Resources │ │    Q&A     │ │
│  │ Routes   │ │ Routes   │ │  Routes  │ │   Routes   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Middleware Layer                        │   │
│  │  JWT Auth │ Rate Limit │ Validation │ Multer/S3  │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────┬─────────────────┘
               │ Sequelize ORM          │ AWS SDK
               ▼                        ▼
┌──────────────────────┐    ┌───────────────────────────┐
│    PostgreSQL DB      │    │         AWS S3             │
│  (Fly.io 또는 외부)   │    │   (파일/이미지 스토리지)    │
└──────────────────────┘    └───────────────────────────┘
```

### 백엔드 패턴

백엔드는 **MVC 아키텍처**를 따르며, 서비스 레이어와 유효성 검사 레이어가 추가된 계층 구조를 가집니다.

```
요청 → Routes → Validators → Middleware → Controllers → Services → Models → DB
```

---

## 4. 디렉터리 구조

### 전체 구조

```
kw-cs-homepage/
├── backend/
│   ├── src/
│   │   ├── controllers/        # 비즈니스 로직 처리
│   │   ├── models/             # Sequelize 데이터 모델
│   │   ├── routes/             # API 라우트 정의
│   │   ├── services/           # 쿼리/비즈니스 서비스 레이어
│   │   ├── validators/         # 요청 유효성 검사 규칙
│   │   ├── middlewares/        # JWT, multer, 오류 처리
│   │   ├── app.js              # Express 앱 초기화
│   │   ├── db.js               # Sequelize 연결 설정
│   │   └── swagger.js          # OpenAPI 문서 설정
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── fly.toml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # 라우트별 페이지 컴포넌트
│   │   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── api/                # axios 클라이언트 및 API 함수
│   │   ├── messages/           # 네비게이션/푸터 정적 데이터
│   │   ├── App.jsx             # 라우터 설정
│   │   └── main.jsx            # 앱 엔트리 포인트
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── .env
│   └── package.json
├── package.json                # 루트 워크스페이스
├── fly.toml
└── README.md
```

### 백엔드 세부 구조

```
backend/src/
├── controllers/
│   ├── authController.js         관리자 로그인 처리
│   ├── noticeController.js       공지사항 CRUD
│   ├── QuestionsController.js    Q&A 질문/답변 관리
│   └── ResourcesController.js   자료실 파일 관리
├── models/
│   ├── Admin.js                  관리자 계정 모델
│   ├── Category.js               공지 카테고리 모델
│   ├── Notices.js                공지사항 모델
│   ├── Questions.js              Q&A 질문 모델
│   ├── Resources.js              자료실 모델
│   └── index.js                  관계 및 associations 정의
├── routes/
│   ├── authRoutes.js             POST /api/auth/login
│   ├── noticeRoutes.js           공지사항 API 엔드포인트
│   ├── QuestionsRoutes.js        Q&A API (레이트 리미팅 포함)
│   └── ResourcesRoutes.js        자료실 API 엔드포인트
├── services/
│   ├── authService.js            로그인 로직, JWT 생성
│   └── noticeService.js          공지 쿼리/필터링 로직
├── validators/
│   ├── authValidator.js          로그인 유효성 규칙
│   ├── noticeValidator.js        공지 쿼리/본문 유효성 규칙
│   ├── questionsValidator.js     Q&A 유효성 규칙
│   └── ResourceValidator.js      자료 유효성 규칙
└── middlewares/
    ├── authMiddleware.js          JWT Bearer 토큰 검증
    ├── multerMiddleware.js        AWS S3 파일 업로드 설정
    └── validationMiddleware.js    express-validator 오류 처리
```

### 프론트엔드 세부 구조

```
frontend/src/
├── pages/
│   ├── Home.jsx                  랜딩 페이지 (타이핑 애니메이션)
│   ├── Login.jsx                 관리자 로그인 폼
│   ├── NoticeBoard.jsx           공지 목록 (페이지네이션/필터링)
│   ├── NoticeDetailPage.jsx      공지 상세 보기
│   ├── NoticeCreatePage.jsx      공지 생성/수정 (관리자)
│   ├── ResourceRoom.jsx          자료실 목록 (검색/필터)
│   ├── ResourceCreatePage.jsx    자료 생성/수정 (관리자)
│   ├── QnaBoard.jsx              Q&A 목록
│   ├── QnaDetailPage.jsx         Q&A 상세 (답변 포함)
│   ├── QnaCreatePage.jsx         질문 작성/수정
│   ├── AnswerCreatePage.jsx      관리자 답변 작성/수정
│   ├── Specialization.jsx        전공 트랙 개요
│   ├── IntelligentComputingSystems.jsx  지능컴퓨팅시스템 상세
│   ├── IntelligentInfo.jsx       지능정보 트랙 상세
│   ├── StudentVerify.jsx         재학생 인증 페이지
│   ├── LoadingPage.jsx           로딩 스피너 컴포넌트
│   └── 404.jsx                   Not Found 페이지
├── components/
│   ├── NavbarBlack.jsx           콘텐츠 페이지용 네비게이션 바
│   ├── NavbarWhite.jsx           히어로/랜딩 페이지용 네비게이션 바
│   ├── FooterBlack.jsx           다크 페이지 푸터
│   ├── FooterWhite.jsx           라이트 페이지 푸터
│   ├── NoticeCard.jsx            공지 목록 아이템 카드
│   ├── NoticeHeader.jsx          페이지 헤더 컴포넌트
│   ├── QnaCard.jsx               Q&A 목록 아이템 카드
│   ├── ResourceCard.jsx          자료 목록 아이템 카드
│   ├── GlassModal.jsx            글래스모피즘 모달
│   ├── button/
│   │   └── CategorySelector.jsx  카테고리 필터 버튼
│   ├── icons/
│   │   └── Chevron.jsx           Chevron 아이콘
│   └── ui/
│       ├── InputKit.jsx          폼 인풋 컴포넌트
│       └── SearchInput.jsx       검색 인풋 컴포넌트
└── api/
    ├── axiosClient.js            JWT 인터셉터 포함 axios 인스턴스
    ├── auth.js                   인증 API 호출 함수
    └── cieClient.js              보조 CIE API 클라이언트
```

---

## 5. 데이터베이스 스키마

### Admin 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | STRING (PK) | 관리자 로그인 아이디 (4~20자) |
| `password` | STRING | bcrypt 해시 패스워드 |
| `department` | STRING (nullable) | 소속 학과명 |
| `created_at` | TIMESTAMP | 계정 생성일 |

> ⚠️ **이슈:** `password`, `department`, `created_at` 필드가 모델 내에서 중복 정의되어 있음

### Category 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | INTEGER (PK, auto) | 카테고리 ID |
| `category_name` | STRING(20) | 카테고리명 ("학과", "총학" 등) |

### Notices 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | INTEGER (PK, auto) | 공지 ID |
| `admin_id` | STRING (FK) | 작성 관리자 |
| `category_id` | INTEGER (FK) | 카테고리 |
| `title` | STRING | 공지 제목 |
| `content` | TEXT | 리치 HTML 본문 |
| `url` | STRING (nullable) | 외부 신청 링크 |
| `excerpt` | TEXT (nullable) | 요약/미리보기 텍스트 |
| `max_participants` | INTEGER (nullable) | 최대 참여자 수 |
| `current_participants` | INTEGER (nullable) | 현재 참여자 수 |
| `created_at` | TIMESTAMP | 작성일 |
| `updated_at` | TIMESTAMP (nullable) | 수정일 |
| `isDeleted` | INTEGER (default: 0) | 소프트 삭제 플래그 |

### Resources 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | INTEGER (PK, auto) | 자료 ID |
| `admin_id` | STRING (FK) | 작성 관리자 |
| `title` | STRING | 자료 제목 |
| `content` | STRING (nullable) | 설명 |
| `category` | STRING (nullable) | 자료 카테고리 필터 |
| `file_url` | STRING (nullable) | S3 파일 URL |
| `provider` | STRING (nullable) | 제공자/출처 |
| `subject` | STRING (nullable) | 관련 과목명 |
| `created_at` | TIMESTAMP | 업로드일 |
| `updated_at` | TIMESTAMP (nullable) | 수정일 |
| `isDeleted` | INTEGER (default: 0) | 소프트 삭제 플래그 |

### Questions 테이블 (Q&A)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | INTEGER (PK, auto) | 질문 ID |
| `admin_id` | STRING (FK, nullable) | 답변한 관리자 (미답변 시 null) |
| `title` | STRING | 질문 제목 |
| `question` | STRING | 질문 내용 |
| `answer` | TEXT (nullable) | 답변 내용 |
| `nickname` | STRING | 작성자 닉네임 |
| `IP` | STRING | 작성자 IP 주소 |
| `password` | INTEGER | 질문 비밀번호 (⚠️ 비해시) |
| `created_at` | TIMESTAMP | 질문 작성일 |
| `updated_at` | TIMESTAMP (nullable) | 답변 작성일 |
| `isDeleted` | INTEGER (default: 0) | 소프트 삭제 플래그 |

### 테이블 관계 (ERD 요약)

```
Admin ──< Notices (1:N, admin_id)
Admin ──< Resources (1:N, admin_id)
Admin ──< Questions (1:N, admin_id, nullable)
Category ──< Notices (1:N, category_id)
```

---

## 6. API 엔드포인트

### 인증 API `/api/auth`

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/login` | 관리자 로그인, JWT 반환 | 없음 |

**요청 Body:**
```json
{ "id": "admin_id", "password": "password123" }
```
**응답:**
```json
{ "message": "로그인 성공", "token": "<JWT, 5시간 유효>" }
```

---

### 공지사항 API `/api/notices`

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/` | 공지 목록 조회 (페이지네이션, 카테고리 필터) | 없음 |
| GET | `/:id` | 공지 상세 조회 | 없음 |
| POST | `/new-notice` | 공지 생성 | JWT 필요 |
| POST | `/new-notice/upload` | 이미지 S3 업로드 | 없음 |
| PUT | `/new-notice/:id/update` | 공지 수정 | JWT 필요 |
| DELETE | `/:id/delete` | 공지 소프트 삭제 | JWT 필요 |
| PATCH | `/:id/increment-participants` | 참여자 수 증가 | 없음 |

**목록 조회 Query Parameters:**
- `page` (integer): 페이지 번호
- `size` (integer): 페이지당 항목 수
- `category` (string, optional): "학과" 또는 "총학"

---

### 자료실 API `/api/resources`

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/` | 자료 목록 조회 (페이지네이션, 카테고리/키워드 필터) | 없음 |
| GET | `/:id` | 자료 상세 조회 | 없음 |
| GET | `/:id/download` | 파일 다운로드 (S3 리다이렉트) | 없음 |
| POST | `/new-resource` | 자료 생성 | JWT 필요 |
| PUT | `/new-resource/:id` | 자료 수정 | JWT 필요 |
| DELETE | `/:id/delete` | 자료 소프트 삭제 | JWT 필요 |

**목록 조회 Query Parameters:**
- `page` (integer): 페이지 번호
- `limit` (integer): 페이지당 항목 수
- `category` (string, optional): 카테고리 필터
- `keyword` (string, optional): 키워드 검색

---

### Q&A API `/api/qna`

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/` | 질문 목록 조회 (페이지네이션) | 없음 |
| GET | `/:id` | 질문 상세 + 답변 조회 | 없음 |
| POST | `/new-question` | 질문 작성 (레이트 리미팅: 15분/10회) | 없음 |
| PUT | `/update/:id` | 질문 수정 (비밀번호 인증) | 없음 |
| POST | `/validate-password` | 질문 비밀번호 검증 | 없음 |
| PUT | `/answer/:id` | 관리자 답변 작성 | JWT 필요 |
| PUT | `/answer/update/:id` | 관리자 답변 수정 | JWT 필요 |
| DELETE | `/answer/delete/:id` | 관리자 답변 삭제 | JWT 필요 |
| DELETE | `/delete/:id` | 질문 소프트 삭제 (비밀번호 인증) | 없음 |

---

## 7. 프론트엔드 페이지 및 기능

### 라우트 매핑

| 경로 | 컴포넌트 | 설명 | 관리자 전용 |
|------|----------|------|:-----------:|
| `/` | Home.jsx | 타이핑 애니메이션 랜딩 페이지 | |
| `/login` | Login.jsx | 관리자 로그인 폼 | |
| `/notices` | NoticeBoard.jsx | 공지 목록, 카테고리 필터, 페이지네이션 | |
| `/notices/:id` | NoticeDetailPage.jsx | 공지 상세 보기, 참여하기 기능 | |
| `/notices/new-notice` | NoticeCreatePage.jsx | 공지 생성 (TinyMCE 에디터) | ✓ |
| `/notices/new-notice/:id` | NoticeCreatePage.jsx | 공지 수정 | ✓ |
| `/resources` | ResourceRoom.jsx | 자료실 목록, 검색/카테고리 필터 | |
| `/resources/new-resource` | ResourceCreatePage.jsx | 자료 생성, S3 파일 업로드 | ✓ |
| `/resources/new-resource/:id` | ResourceCreatePage.jsx | 자료 수정 | ✓ |
| `/qna` | QnaBoard.jsx | Q&A 목록, 페이지네이션 | |
| `/qna/:id` | QnaDetailPage.jsx | 질문 상세 + 관리자 답변 | |
| `/qna/new-question` | QnaCreatePage.jsx | 질문 작성 (비회원) | |
| `/qna/new-question/:id` | QnaCreatePage.jsx | 질문 수정 (비밀번호 확인) | |
| `/qna/answer/:id` | AnswerCreatePage.jsx | 관리자 답변 작성/수정 | ✓ |
| `/specializations` | Specialization.jsx | 전공 트랙 개요 | |
| `/specializations/ics` | IntelligentComputingSystems.jsx | 지능컴퓨팅시스템 트랙 상세 | |
| `/specializations/ii` | IntelligentInfo.jsx | 지능정보 트랙 상세 | |
| `/verify-student` | StudentVerify.jsx | 재학생 인증 | |
| `*` | 404.jsx | Not Found 페이지 | |

### 핵심 프론트엔드 기능

- **JWT 인증 흐름:** localStorage에 토큰 저장, axios 인터셉터로 모든 요청에 자동 주입
- **페이지네이션:** 공지사항, 자료실, Q&A 전체 적용
- **검색/필터링:** 자료실은 카테고리 + 키워드 복합 필터 지원
- **리치 텍스트 편집:** TinyMCE 에디터 (공지사항/자료실 생성/수정)
- **파일 업로드:** AWS S3 통합 (이미지 및 첨부파일)
- **애니메이션:** Framer Motion을 활용한 페이지 전환 및 카드 애니메이션
- **반응형 디자인:** Tailwind CSS 모바일 퍼스트 방식
- **로딩 상태 처리:** API 호출 중 LoadingPage 컴포넌트 표시
- **토스트 알림:** sonner를 이용한 성공/실패 피드백
- **모달:** GlassModal 컴포넌트 (글래스모피즘 스타일)

---

## 8. 인증 및 권한 관리

### JWT 구현 방식

```
[클라이언트] POST /api/auth/login
     → [서버] 아이디/비밀번호 검증 (bcrypt compare)
     → JWT 생성 (페이로드: { id, department }, 만료: 5시간)
     → [클라이언트] localStorage.setItem('token', jwt)

[이후 요청]
     → Authorization: Bearer <token> 헤더 자동 첨부 (axios 인터셉터)
     → [서버] authMiddleware.js에서 토큰 검증
```

### 보호된 엔드포인트 (관리자 전용)

| 도메인 | 작업 |
|--------|------|
| 공지사항 | 생성, 수정, 삭제 |
| 자료실 | 생성, 수정, 삭제 |
| Q&A | 답변 작성, 수정, 삭제 |

### 비회원 접근 제어 (Q&A)

비회원 질문 작성 시 숫자형 비밀번호를 설정하며, 수정/삭제 시 비밀번호 검증을 수행합니다.

> ⚠️ 현재 비밀번호가 **평문 정수(INTEGER)**로 저장됩니다 (하단 보안 섹션 참고).

### CORS 허용 오리진

```
http://localhost:5173          (개발 프론트엔드)
https://kwangwoon-cie.com      (프로덕션)
https://www.kwangwoon-cie.com  (www 도메인)
http://192.168.1.46:5173       (로컬 네트워크 개발)
```

---

## 9. 디자인 시스템

### 커스텀 Tailwind 컬러 팔레트

| 이름 | HEX | 용도 |
|------|-----|------|
| 연보라 | `#748CDB` | 보조 강조색 |
| 팔레트핑크 | `#E2BFD9` | 포인트 컬러 |
| 남보라 | `#4942E4` | 주요 CTA |
| 보라 | `#4E31AA` | 딥 퍼플 |
| 연녹초 | `#A3FFD6` | 성공/완료 상태 |
| 연한파랑 | `#3572EF` | 정보 표시 |
| 연한하늘 | `#3ABEF9` | 보조 링크 |
| 소다 | `#A7E6FF` | 배경 강조 |
| 남색 | `#161D6F` | 진한 배경/텍스트 |
| 연남색 | `#124076` | 중간 배경 |
| 밝은파랑 | `#163B88` | 주요 버튼 배경 |
| 연초록 | `#98DED9` | 보조 강조 |

### 커스텀 애니메이션

| 이름 | 효과 | 사용처 |
|------|------|--------|
| `typing` | 타자기 효과 + 커서 깜박임 | Home 랜딩 |
| `blur-scale` | 블러 + 스케일 등장 | 카드 컴포넌트 |
| `slide-up` | 위로 슬라이드 전환 | 페이지 전환 |
| `fade-up` | 페이드 인 + 위 이동 | 섹션 등장 |
| `blink` | 커서/인디케이터 깜박임 | UI 인디케이터 |

### 컴포넌트 특징

- **두 가지 Navbar 변형:** 흰 배경(NavbarWhite)과 검은 배경(NavbarBlack)으로 페이지 테마에 맞게 전환
- **두 가지 Footer 변형:** FooterWhite / FooterBlack 동일 패턴
- **GlassModal:** 글래스모피즘 디자인의 모달 팝업
- **InputKit:** 통일된 인풋 폼 컴포넌트 (스타일 일관성 유지)
- **CategorySelector:** 필터 카테고리 버튼 컴포넌트

---

## 10. 배포 및 CI/CD

### GitHub Actions 파이프라인

```yaml
트리거: main 또는 develop 브랜치 push
단계:
  1. 코드 체크아웃
  2. Node.js 21 환경 설정
  3. Flyctl 설치
  4. 의존성 설치 및 빌드
  5. FLY_API_TOKEN으로 Fly.io 배포
```

### Docker 구성

```dockerfile
베이스 이미지: node:22.8.0-slim
빌드: node-gyp 네이티브 모듈 지원 멀티스테이지 빌드
엔트리포인트: npm run start
노출 포트: 3000
```

### Fly.io 설정

```toml
app: backend-quiet-grass-5014
primary_region: sin (싱가포르)
internal_port: 3000
force_https: true
memory: 1gb
cpus: 1
```

### 환경변수 (프론트엔드 `.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_CIE_API_URL=http://localhost:8080
```

> ⚠️ 프로덕션 배포 시 `.env` 값이 빌드 타임에 번들에 포함되므로, 환경별 `.env.production` 분리 필요

---

## 11. 보안 취약점 및 개선 사항

### 🔴 심각 (Critical)

#### 1. Q&A 비밀번호 평문 저장
- **위치:** `Questions` 모델 `password` 필드 (INTEGER 타입)
- **문제:** 비밀번호가 해시 없이 정수형 그대로 데이터베이스에 저장됨
- **위험:** DB 유출 시 모든 질문 비밀번호 즉시 노출
- **해결책:** STRING 타입으로 변경 후 bcrypt 해싱 적용

```javascript
// 현재 (취약)
password: { type: DataTypes.INTEGER }

// 권장
password: { type: DataTypes.STRING }
// 저장 시: await bcrypt.hash(password, 10)
// 검증 시: await bcrypt.compare(input, stored)
```

### 🟠 높음 (High)

#### 2. IP 주소 무단 수집 및 저장
- **위치:** `Questions` 모델 `IP` 필드
- **문제:** 사용자 동의 없이 클라이언트 IP를 영구 저장
- **위험:** 개인정보보호법(PIPA) 위반 가능성
- **해결책:** IP 수집 제거 또는 개인정보 처리방침 및 동의 고지 추가

#### 3. 이미지 업로드 엔드포인트 인증 없음
- **위치:** `POST /api/notices/new-notice/upload`
- **문제:** S3 이미지 업로드에 JWT 인증 미적용
- **위험:** 악의적 파일 대량 업로드로 S3 스토리지/비용 낭비 가능
- **해결책:** 업로드 엔드포인트에 `authMiddleware` 적용

### 🟡 보통 (Medium)

#### 4. Admin 모델 필드 중복 정의
- **위치:** `Admin.js`
- **문제:** `password`, `department`, `created_at` 컬럼이 모델 내 두 번 선언됨
- **위험:** Sequelize 동작 불일치 및 마이그레이션 오류 가능
- **해결책:** 중복 필드 제거

#### 5. 레이트 리미팅 범위 부족
- **문제:** 레이트 리미팅이 Q&A 질문 작성에만 적용됨
- **위험:** 로그인 엔드포인트 브루트포스 공격에 무방비
- **해결책:** 로그인 API에 엄격한 레이트 리미팅 추가 (예: 5회/15분)

#### 6. 카테고리 하드코딩
- **위치:** `noticeService.js`
- **문제:** 카테고리 ID-이름 매핑이 서비스 코드에 하드코딩
- **위험:** 카테고리 추가/변경 시 코드 수정 필요
- **해결책:** DB Category 테이블 조인으로 동적 처리

---

## 12. 기술 부채 및 코드 품질

### 코드 구조 이슈

#### 1. API 클라이언트 불일치
- `axiosClient.js`와 직접 `fetch` 호출이 혼재
- 일부 컴포넌트에서 `cieClient.js`와 `axiosClient.js` 중복 사용
- **권장:** `axiosClient.js` 단일화

#### 2. 오류 처리 미흡
- 많은 컨트롤러/서비스에서 에러 처리가 `try-catch`만으로 구성
- 프론트엔드에서 API 에러에 대한 사용자 피드백 일부 누락
- **권장:** 전역 에러 핸들러 미들웨어 강화

#### 3. 테스트 코드 전무
- 백엔드/프론트엔드 모두 테스트 파일 없음
- **권장:** 최소한 컨트롤러 유닛 테스트 및 API 통합 테스트 추가

#### 4. 프론트엔드 입력 유효성 검사 부재
- 대부분의 폼 검증을 백엔드에 의존
- 네트워크 요청 전 클라이언트 사이드 검증 미적용
- **권장:** react-hook-form 또는 zod 스키마 검증 도입

#### 5. 소프트 삭제 일관성
- `isDeleted` 플래그를 사용하지만 모든 쿼리에서 필터링이 일관되게 적용되는지 확인 필요
- **권장:** 모든 `findAll`, `findOne` 쿼리에 `where: { isDeleted: 0 }` 조건 명시적 포함 확인

### 의존성 관련

| 이슈 | 설명 |
|------|------|
| `aws-sdk` v2 사용 | AWS SDK v2는 2025년 9월 지원 종료 예정 → `@aws-sdk/client-s3` v3으로 마이그레이션 필요 |
| `react-linkify` 알파 버전 | `react-linkify@1.0.0-alpha` 사용 중 → 안정 버전으로 교체 권고 |
| `multer-s3` v2 | aws-sdk v2에 종속 → v3 마이그레이션과 함께 `multer-s3` v3으로 업그레이드 필요 |

---

## 13. 팀 구성

| 이름 | 역할 | 담당 도메인 |
|------|------|-------------|
| 조성찬 | 프론트엔드 리드 | UI 디자인, 전공 소개, 공지사항, 인증 |
| 강준우 | 백엔드 | 백엔드 개발 |
| 이용진 | 백엔드 | 자료실, Q&A 도메인 |
| 권관호 | 백엔드 | 백엔드 개발 |
| 오지빈 | 프론트엔드 | 프론트엔드 개발 |

---

## 14. 종합 평가

### 강점

| 항목 | 평가 |
|------|------|
| **아키텍처** | MVC 패턴 + 서비스 레이어 분리로 유지보수성 우수 |
| **API 설계** | RESTful 원칙 준수, Swagger 문서화 구비 |
| **인증** | JWT 기반 표준적인 인증 구현 |
| **파일 처리** | AWS S3 통합으로 확장 가능한 파일 스토리지 |
| **스팸 방지** | Q&A 레이트 리미팅 적용 |
| **디자인** | 커스텀 Tailwind 테마와 Framer Motion으로 완성도 높은 UI |
| **반응형** | 모바일 퍼스트 반응형 레이아웃 |
| **UX** | 로딩/에러/성공 상태 처리, 페이지네이션, 검색 필터 |

### 개선 우선순위

| 우선순위 | 항목 | 예상 공수 |
|----------|------|-----------|
| 🔴 즉시 | Q&A 비밀번호 bcrypt 해싱 적용 | 1~2시간 |
| 🔴 즉시 | 이미지 업로드 엔드포인트 인증 추가 | 30분 |
| 🟠 단기 | 로그인 레이트 리미팅 추가 | 30분 |
| 🟠 단기 | Admin 모델 중복 필드 제거 | 30분 |
| 🟠 단기 | IP 수집 정책 결정 및 처리 | 1~2시간 |
| 🟡 중기 | AWS SDK v3 마이그레이션 | 반나절 |
| 🟡 중기 | 테스트 코드 작성 (백엔드 유닛 테스트) | 1~2일 |
| 🟡 중기 | 프론트엔드 폼 유효성 검사 강화 | 1~2일 |
| 🟢 장기 | 카테고리 하드코딩 제거 (DB 기반) | 반나절 |
| 🟢 장기 | 전역 에러 핸들러 통일 | 1일 |

### 최종 요약

광운대학교 컴퓨터정보공학부 홈페이지는 **현대적인 풀스택 웹 기술**을 활용하여 학과 콘텐츠 관리 시스템을 구현한 프로젝트입니다. Express + PostgreSQL 백엔드와 React + Tailwind 프론트엔드의 조합은 학과 홈페이지 규모에 적합하며, Fly.io를 통한 배포 자동화도 잘 구성되어 있습니다.

주요 과제는 **Q&A 비밀번호 보안 취약점** 즉시 해결과 **AWS SDK v2의 지원 종료 전 마이그레이션**입니다. 이 두 가지를 우선적으로 처리하면 프로덕션 안전성이 크게 향상됩니다. 장기적으로는 테스트 코드 도입과 클라이언트 사이드 검증 강화를 통해 코드 품질을 높이는 방향이 권장됩니다.

---

*이 보고서는 `develop` 브랜치 기준으로 자동 생성되었습니다. (생성일: 2026-03-01)*
