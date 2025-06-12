// localStorage에서 데이터 불러오기
let surveyFormData = {};
try {
    surveyFormData = JSON.parse(localStorage.getItem('surveyFormData')) || {};
    console.log('로드된 설문 데이터:', surveyFormData);
} catch (e) { 
    console.error('데이터 로드 중 오류:', e);
    surveyFormData = {}; 
}

// surveyFormData 기반으로 pensionData 동적 생성
const pensionData = {
    name: surveyFormData.name || '홍길동',
    currentAge: surveyFormData.birthYear ? (new Date().getFullYear() - parseInt(surveyFormData.birthYear)) : 35,
    lifeExpectancy: surveyFormData.lifeExpectancy ? parseFloat(surveyFormData.lifeExpectancy) : 83,
    optimalAge: calculateOptimalAge(surveyFormData),
    monthlyAmount: calculateMonthlyAmount(surveyFormData),
    totalAmount: calculateTotalAmount(surveyFormData),
    monthlyByAge: calculateMonthlyByAge(surveyFormData),
    totalByAge: calculateTotalByAge(surveyFormData),
    lifeSimulation: calculateLifeSimulation(surveyFormData)
};

// 최적 수급 연령 계산
function calculateOptimalAge(data) {
    const lifeExpectancy = data.lifeExpectancy ? parseFloat(data.lifeExpectancy) : 83;
    const currentAge = data.birthYear ? (new Date().getFullYear() - parseInt(data.birthYear)) : 35;
    
    // 현재 나이가 60세 이상인 경우
    if (currentAge >= 60) {
        return Math.min(currentAge, 70);
    }
    
    // 수명에 따른 최적 연령 계산 (포물선의 꼭지점 계산)
    const baseAmount = calculateMonthlyAmount(data);
    let maxTotal = 0;
    let optimalAge = 65;
    
    // 60세부터 70세까지 각 연령별 총 수령액 계산
    for (let age = 60; age <= 70; age++) {
        // 연령별 증가율 계산 (더 정교한 증가율)
        let increaseRate = 0;
        if (age <= 65) {
            increaseRate = (age - 60) * 0.07; // 60-65세 구간 증가율 상향
        } else {
            increaseRate = 0.35 + (age - 65) * 0.05; // 65세 이후 증가율 조정
        }
        
        const monthlyAmount = baseAmount * (1 + increaseRate);
        const months = (lifeExpectancy - age) * 12;
        
        // 인플레이션 고려 (연 2% 가정)
        const inflationAdjustedAmount = monthlyAmount * Math.pow(1.02, age - 60);
        const totalAmount = inflationAdjustedAmount * months;
        
        if (totalAmount > maxTotal) {
            maxTotal = totalAmount;
            optimalAge = age;
        }
    }
    
    return optimalAge;
}

// 월 수령액 계산
function calculateMonthlyAmount(data) {
    // 기본 금액 (소득 수준에 따라 조정)
    let baseAmount = 100;
    
    // 소득 수준 반영 (더 세분화된 구간 적용)
    if (data.income) {
        const income = parseInt(data.income);
        if (income >= 15000) baseAmount = 180;
        else if (income >= 12000) baseAmount = 160;
        else if (income >= 10000) baseAmount = 150;
        else if (income >= 8000) baseAmount = 140;
        else if (income >= 7000) baseAmount = 130;
        else if (income >= 6000) baseAmount = 125;
        else if (income >= 5000) baseAmount = 120;
        else if (income >= 4000) baseAmount = 115;
        else if (income >= 3000) baseAmount = 110;
        else if (income >= 2000) baseAmount = 105;
    }
    
    // 가입 기간 반영 (더 정교한 계산)
    if (data.firstJoin) {
        const joinDate = new Date(data.firstJoin);
        const currentDate = new Date();
        const yearsOfContribution = (currentDate.getFullYear() - joinDate.getFullYear());
        const monthsOfContribution = (currentDate.getMonth() - joinDate.getMonth());
        const totalMonths = yearsOfContribution * 12 + monthsOfContribution;
        baseAmount += (totalMonths / 12) * 0.6; // 월 단위로 더 정확한 계산
    }
    
    // 추가 연금 반영 (가중치 조정)
    if (data.otherPensions && Array.isArray(data.otherPensions)) {
        if (data.otherPensions.includes('공무원연금')) baseAmount += 25;
        if (data.otherPensions.includes('사학연금')) baseAmount += 20;
        if (data.otherPensions.includes('군인연금')) baseAmount += 20;
        if (data.otherPensions.includes('퇴직연금')) baseAmount += 15;
        if (data.otherPensions.includes('개인연금')) baseAmount += 12;
    }
    
    // 크레딧 반영 (가중치 조정)
    if (data.credits) {
        const credits = data.credits;
        if (credits.military) baseAmount += parseInt(credits.military) * 0.15;
        if (credits.childbirth) baseAmount += parseInt(credits.childbirth) * 0.2;
        if (credits.unemployment) baseAmount += parseInt(credits.unemployment) * 0.15;
    }
    
    return Math.round(baseAmount);
}

// 총 수령액 계산
function calculateTotalAmount(data) {
    const monthly = calculateMonthlyAmount(data);
    const lifeExpectancy = data.lifeExpectancy ? parseFloat(data.lifeExpectancy) : 83;
    const optimalAge = calculateOptimalAge(data);
    const months = (lifeExpectancy - optimalAge) * 12;
    
    // 은퇴 후 추가 소득 반영 (인플레이션 고려)
    let additionalIncome = 0;
    if (data.retirementIncome && Array.isArray(data.retirementIncome)) {
        data.retirementIncome.forEach(income => {
            if (income.amount && income.duration) {
                const annualAmount = parseInt(income.amount);
                const years = parseInt(income.duration);
                // 인플레이션 고려 (연 2% 가정)
                for (let i = 0; i < years; i++) {
                    additionalIncome += (annualAmount * Math.pow(1.02, i)) / 12;
                }
            }
        });
    }
    
    // 총액 계산 (인플레이션 고려)
    const totalAmount = monthly * months + additionalIncome;
    return Math.round(totalAmount / 100); // 백만원 단위로 변환
}

// 연령별 월 수령액 계산
function calculateMonthlyByAge(data) {
    const baseAmount = calculateMonthlyAmount(data);
    const result = [];
    
    for (let age = 60; age <= 70; age++) {
        // 연령별 증가율 계산 (더 정교한 증가율)
        let increaseRate = 0;
        if (age <= 65) {
            increaseRate = (age - 60) * 0.07; // 60-65세 구간 증가율 상향
        } else {
            increaseRate = 0.35 + (age - 65) * 0.05; // 65세 이후 증가율 조정
        }
        
        const amount = Math.round(baseAmount * (1 + increaseRate));
        result.push({ age, amount });
    }
    
    return result;
}

// 연령별 총 수령액 계산
function calculateTotalByAge(data) {
    const monthlyByAge = calculateMonthlyByAge(data);
    const lifeExpectancy = data.lifeExpectancy ? parseFloat(data.lifeExpectancy) : 83;
    
    return monthlyByAge.map(({ age, amount }) => {
        const months = (lifeExpectancy - age) * 12;
        // 인플레이션 고려 (연 2% 가정)
        const inflationAdjustedAmount = amount * Math.pow(1.02, age - 60);
        const total = Math.round((inflationAdjustedAmount * months) / 100); // 백만원 단위로 변환
        return { age, total };
    });
}

// 수명별 시뮬레이션 계산
function calculateLifeSimulation(data) {
    const baseAmount = calculateMonthlyAmount(data);
    const result = [];
    const lifeExpectancies = [75, 78, 80, 83, 85, 88, 90];
    
    lifeExpectancies.forEach(life => {
        const optimalAge = life >= 85 ? 68 : life >= 80 ? 67 : 66;
        const months = (life - optimalAge) * 12;
        const total = Math.round((baseAmount * months) / 100); // 백만원 단위로 변환
        result.push({ life, optimal: optimalAge, total });
    });
    
    return result;
}

// 로딩 화면 제어
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hide');
        startAnimations();
    }, 2000);
});

// 애니메이션 시작
function startAnimations() {
    // 카운터 애니메이션
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });

    // 차트 생성
    setTimeout(() => {
        createMonthlyChart();
        createTotalChart();
        createSimulationTable();
    }, 500);
}

// 월 수령액 차트 생성
function createMonthlyChart() {
    const container = document.getElementById('monthlyChart');
    container.innerHTML = '';

    pensionData.monthlyByAge.forEach((data, index) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        
        const maxAmount = Math.max(...pensionData.monthlyByAge.map(d => d.amount));
        const height = (data.amount / maxAmount) * 200;
        
        bar.style.height = height + 'px';
        
        if (data.age === pensionData.optimalAge) {
            bar.style.background = 'linear-gradient(180deg, #21c97a 0%, #16a085 100%)';
            bar.style.boxShadow = '0 8px 25px rgba(33, 201, 122, 0.3)';
        }

        const value = document.createElement('div');
        value.className = 'chart-bar-value';
        value.textContent = data.amount + '만원';
        bar.appendChild(value);

        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        label.textContent = data.age + '세';
        
        bar.appendChild(label);
        container.appendChild(bar);

        // 애니메이션
        setTimeout(() => {
            bar.style.height = height + 'px';
        }, index * 100);
    });
}

// 총 수령액 라인 차트 생성
function createTotalChart() {
    const data = pensionData.totalByAge;
    const maxTotal = Math.max(...data.map(d => d.total));
    const minAge = Math.min(...data.map(d => d.age));
    const maxAge = Math.max(...data.map(d => d.age));

    // 좌표 계산
    const points = data.map((d, i) => {
        const x = 60 + (i * 70);
        const y = 250 - ((d.total / maxTotal) * 200);
        return `${x},${y}`;
    }).join(' ');

    // 라인 그리기
    const line = document.getElementById('dataLine');
    line.setAttribute('points', points);

    // 데이터 포인트 추가
    const pointsContainer = document.getElementById('dataPoints');
    pointsContainer.innerHTML = '';

    data.forEach((d, i) => {
        const x = 60 + (i * 70);
        const y = 250 - ((d.total / maxTotal) * 200);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', d.age === pensionData.optimalAge ? '8' : '5');
        circle.setAttribute('fill', d.age === pensionData.optimalAge ? '#21c97a' : '#4D33E5');
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');

        // 툴팁
        circle.addEventListener('mouseenter', (e) => {
            showTooltip(e, `${d.age}세: ${d.total}백만원`);
        });

        pointsContainer.appendChild(circle);
    });

    // X축 라벨
    const xLabels = document.getElementById('xLabels');
    xLabels.innerHTML = '';
    data.forEach((d, i) => {
        const x = 60 + (i * 70);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 280);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#666');
        text.setAttribute('font-size', '12');
        text.textContent = d.age + '세';
        xLabels.appendChild(text);
    });

    // Y축 라벨
    const yLabels = document.getElementById('yLabels');
    yLabels.innerHTML = '';
    for (let i = 0; i <= 5; i++) {
        const value = (maxTotal / 5) * i;
        const y = 250 - (i * 40);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 40);
        text.setAttribute('y', y + 5);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('fill', '#666');
        text.setAttribute('font-size', '12');
        text.textContent = Math.round(value) + '백만';
        yLabels.appendChild(text);
    }
}

// 시뮬레이션 테이블 생성
function createSimulationTable() {
    const tbody = document.getElementById('simulationTable');
    tbody.innerHTML = '';

    pensionData.lifeSimulation.forEach(data => {
        const row = document.createElement('tr');
        if (data.life === pensionData.lifeExpectancy) {
            row.className = 'best-option';
        }

        const recommendation = data.life >= 83 ? '🌟 강력 추천' : 
                            data.life >= 80 ? '👍 추천' : 
                            data.life >= 78 ? '⚖️ 신중 검토' : '⚠️ 주의 필요';

        row.innerHTML = `
            <td>${data.life}세</td>
            <td>${data.optimal}세</td>
            <td>${data.total.toLocaleString()}백만원</td>
            <td>${recommendation}</td>
        `;

        tbody.appendChild(row);

        // 애니메이션
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, pensionData.lifeSimulation.indexOf(data) * 100);
    });
}

// 툴팁 표시
function showTooltip(event, text) {
    // 기존 툴팁 제거
    const existingTooltip = document.querySelector('.chart-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        margin-top: -10px;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top + window.scrollY + 'px';

    // 3초 후 자동 제거
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 3000);
}

// 결과 다운로드
function downloadResult() {
    const button = document.querySelector('.download-btn');
    const originalText = button.innerHTML;
    
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
        다운로드 중...
    `;

    setTimeout(() => {
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            다운로드 완료!
        `;
        
        button.style.background = 'linear-gradient(135deg, #21c97a 0%, #16a085 100%)';
        
        // 실제 파일 다운로드 시뮬레이션
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(generateReportText());
        link.download = '연금계산결과_' + pensionData.name + '_' + new Date().toISOString().split('T')[0] + '.txt';
        link.click();

        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'linear-gradient(135deg, #4D33E5 0%, #6B4CE6 100%)';
        }, 3000);
    }, 2000);
}

// 보고서 텍스트 생성
function generateReportText() {
    return `
연금 계산 결과 보고서
===================

👤 기본 정보
- 이름: ${pensionData.name}
- 현재 나이: ${pensionData.currentAge}세
- 예상 수명: ${pensionData.lifeExpectancy}세

📊 계산 결과
- 최적 수급 시작 연령: ${pensionData.optimalAge}세
- 월 예상 연금액: ${pensionData.monthlyAmount.toLocaleString()}만원
- 총 예상 수령액: ${pensionData.totalAmount.toLocaleString()}만원
- 예상 수령 기간: ${pensionData.lifeExpectancy - pensionData.optimalAge}년 (${(pensionData.lifeExpectancy - pensionData.optimalAge) * 12}개월)

📈 연령별 월 수령액
${pensionData.monthlyByAge.map(d => `- ${d.age}세: ${d.amount}만원${d.age === pensionData.optimalAge ? ' ⭐ (최적)' : ''}`).join('\n')}

💰 연령별 총 수령액
${pensionData.totalByAge.map(d => `- ${d.age}세 개시: ${d.total}백만원${d.age === pensionData.optimalAge ? ' ⭐ (최적)' : ''}`).join('\n')}

🔮 수명별 최적 전략
${pensionData.lifeSimulation.map(d => `- 수명 ${d.life}세: ${d.optimal}세 개시 → ${d.total}백만원`).join('\n')}

💡 권장사항
1. 가장 유리한 수급 시기는 만 ${pensionData.optimalAge}세입니다.
2. 건강관리를 통해 수명이 연장되면 더 많은 연금을 받을 수 있습니다.
3. 개인의 재정 상황과 건강 상태를 종합적으로 고려하여 최종 결정하세요.

⚠️ 주의사항
- 본 계산은 예상치이며, 실제 수령액은 연금 제도 변경 등에 따라 달라질 수 있습니다.
- 정확한 연금 수령액은 국민연금공단에 문의하시기 바랍니다.

---
계산일: ${new Date().toLocaleDateString('ko-KR')}
생성: 연금술사 v1.0
            `.trim();
}

// 처음으로 이동
function goHome() {
    if (confirm('처음 화면으로 돌아가시겠습니까?')) {
        window.location.href = '../index.html';
    }
}

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        goHome();
    } else if (e.key === 'd' || e.key === 'D') {
        downloadResult();
    } else if (e.key === 'Escape') {
        goHome();
    }
});

// 스크롤 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 스크롤 감지 대상 등록
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.result-card, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }, 2500);
});

// 차트 호버 효과
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const chartBars = document.querySelectorAll('.chart-bar');
        chartBars.forEach(bar => {
            bar.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.zIndex = '10';
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.zIndex = '1';
            });
        });
    }, 3000);
});

// 부드러운 스크롤
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// 페이지 로드 시 맨 위로 스크롤
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// 성능 최적화: 이미지 레이지 로딩
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

// 모바일 터치 제스처
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0) {
            // 위로 스와이프 - 다음 섹션으로
            const nextSection = document.querySelector('.result-card:nth-child(3)');
            if (nextSection) smoothScrollTo(nextSection);
        } else {
            // 아래로 스와이프 - 맨 위로
            smoothScrollTo(document.querySelector('.header'));
        }
    }
}

// 사용자 경험 개선: 포커스 관리
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
});

// CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = `
    .using-keyboard *:focus {
        outline: 2px solid #4D33E5 !important;
        outline-offset: 2px !important;
    }
    
    .chart-tooltip {
        transition: opacity 0.2s ease;
    }
`;
document.head.appendChild(style);

// 접근성: ARIA 레이블 추가
setTimeout(() => {
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        const ageData = pensionData.monthlyByAge[index];
        if (ageData) {
            bar.setAttribute('role', 'img');
            bar.setAttribute('aria-label', `${ageData.age}세 수급시 월 ${ageData.amount}만원`);
            bar.setAttribute('tabindex', '0');
        }
    });
}, 3000);

// 에러 처리
window.addEventListener('error', (e) => {
    console.error('오류 발생:', e.error);
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ef4444;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 600;
    `;
    errorMessage.textContent = '일시적인 오류가 발생했습니다. 페이지를 새로고침해 주세요.';
    document.body.appendChild(errorMessage);

    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 5000);
});

// 전역 함수 등록
window.downloadResult = downloadResult;
window.goHome = goHome;

// 최종 초기화
console.log('🎉 연금 계산 결과 페이지가 로드되었습니다!');
console.log('📊 데이터:', pensionData);
console.log('💡 단축키: H(홈), D(다운로드), ESC(홈)');

window.addEventListener('DOMContentLoaded', () => {
    // 이름
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = pensionData.name;
    }
    if (document.getElementById('userName2')) {
        document.getElementById('userName2').textContent = pensionData.name;
    }
    // 월 수령액
    if (document.getElementById('monthlyAmount')) {
        document.getElementById('monthlyAmount').setAttribute('data-target', pensionData.monthlyAmount);
    }
    if (document.getElementById('monthlyAmount2')) {
        document.getElementById('monthlyAmount2').textContent = pensionData.monthlyAmount.toLocaleString();
    }
    // 최적 수급 연령
    if (document.getElementById('optimalAge')) {
        document.getElementById('optimalAge').textContent = pensionData.optimalAge;
    }
    // 예상 수명
    if (document.getElementById('lifeExpectancy')) {
        document.getElementById('lifeExpectancy').textContent = pensionData.lifeExpectancy;
    }
    // 총 수령액
    if (document.getElementById('totalAmount')) {
        document.getElementById('totalAmount').textContent = (pensionData.totalAmount * 10000).toLocaleString();
    }
});