# YGSS Survey System

YGSS 설문조사 시스템은 사용자 친화적인 웹 기반 설문조사 플랫폼입니다. 실시간 데이터 분석과 직관적인 UI/UX를 제공하여 설문조사 프로세스를 효율적으로 관리할 수 있습니다.

## 주요 기능

- 🎯 사용자 친화적인 설문조사 인터페이스
- 📊 실시간 결과 분석 및 시각화
- 📱 반응형 디자인 (모바일/태블릿/데스크톱)
- 🔒 보안 데이터 처리
- 📈 상세한 통계 및 리포트
- 💾 결과 데이터 내보내기

## 기술 스택

### 프론트엔드
- HTML5
- CSS3 (Flexbox, Grid, Animation)
- JavaScript (ES6+)
- Chart.js (데이터 시각화)

### 백엔드
- Node.js
- Express.js
- MongoDB (데이터베이스)

## 설치 방법

1. 저장소를 클론합니다:
```bash
git clone [repository-url]
```

2. 프로젝트 디렉토리로 이동합니다:
```bash
cd ygss
```

3. 의존성을 설치합니다:
```bash
npm install
```

4. 환경 변수 설정:
```bash
cp .env.example .env
# .env 파일을 열어 필요한 환경 변수를 설정합니다
```

5. 애플리케이션을 실행합니다:
```bash
npm start
```

## 개발 환경 설정

### 필수 요구사항
- Node.js 16.x 이상
- npm 8.x 이상
- MongoDB 4.x 이상

### 개발 서버 실행
```bash
npm run dev
```

### 테스트 실행
```bash
npm test
```

## Git 커밋 규칙

커밋 메시지는 다음 형식을 따릅니다:
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- refactor: 코드 리팩토링
- test: 테스트 코드 추가/수정
- chore: 빌드 프로세스 또는 보조 도구 변경

### Scope
- frontend: 프론트엔드 관련 변경
- backend: 백엔드 관련 변경
- database: 데이터베이스 관련 변경
- config: 설정 파일 변경

### Subject
- 50자 이내로 작성
- 현재형으로 작성
- 첫 글자는 대문자로 시작
- 마침표로 끝내지 않음

### 예시
```
feat(frontend): 설문조사 결과 차트 컴포넌트 추가

- Chart.js를 활용한 막대 그래프 구현
- 반응형 디자인 적용
- 데이터 필터링 기능 추가

Resolves: #123
```

## 프로젝트 구조
```
ygss/
├── frontend/          # 프론트엔드 소스 코드
├── images/           # 이미지 리소스
├── js/              # 자바스크립트 파일
│   ├── survey.js    # 설문조사 관련 기능
│   ├── result.js    # 결과 표시 및 분석
│   └── onboarding.js # 온보딩 프로세스
├── html/            # HTML 템플릿
│   ├── survey.html  # 설문조사 페이지
│   └── result.html  # 결과 페이지
├── css/             # 스타일시트 파일
│   ├── survey.css   # 설문조사 페이지 스타일
│   ├── result.css   # 결과 페이지 스타일
│   └── onboarding.css # 온보딩 스타일
├── node_modules/    # npm 패키지
├── index.js         # 메인 서버 파일
├── index.html       # 메인 HTML 파일
├── package.json     # 프로젝트 설정 및 의존성
├── package-lock.json # 의존성 잠금 파일
└── .gitignore       # Git 무시 파일 목록
```

### 주요 파일 설명

#### 프론트엔드
- `survey.js` (40KB): 설문조사 기능의 핵심 로직을 담당
- `result.js` (24KB): 설문 결과 분석 및 시각화 처리
- `onboarding.js` (3.5KB): 사용자 온보딩 프로세스 관리

#### HTML 템플릿
- `survey.html` (25KB): 설문조사 메인 페이지
- `result.html` (6.7KB): 결과 표시 페이지

#### 스타일시트
- `survey.css` (25KB): 설문조사 페이지의 스타일 정의
- `result.css` (8.2KB): 결과 페이지의 스타일 정의
- `onboarding.css` (7.0KB): 온보딩 프로세스의 스타일 정의

#### 서버
- `index.js`: Express.js 기반의 메인 서버 파일
- `package.json`: 프로젝트 의존성 및 스크립트 정의

## 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License

## 연락처

프로젝트 관리자: [이메일 주소] 