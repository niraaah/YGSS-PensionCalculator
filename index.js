const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 정적 파일 서빙 설정
app.use(express.static(__dirname));
app.use('/html', express.static(path.join(__dirname, 'html')));

// 라우트 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/survey', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'survey.html'));
});

app.get('/survey.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'survey.html'));
});

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'result.html'));
});

app.get('/result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'result.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 