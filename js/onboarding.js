let currentPage = 0;
const totalPages = 5;
let isScrolling = false;

// 로딩 화면 숨기기
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hide');
    }, 1500);
});

function updatePageDisplay() {
    const pages = document.querySelectorAll('.page');
    const dots = document.querySelectorAll('.dot');
    const upArrow = document.getElementById('upArrow');
    const downArrow = document.getElementById('downArrow');
    const homeButton = document.getElementById('homeButton');

    pages.forEach((page, index) => {
        page.classList.remove('active', 'prev');
        if (index === currentPage) {
            page.classList.add('active');
        } else if (index < currentPage) {
            page.classList.add('prev');
        }
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });

    // 네비게이션 버튼 표시/숨김
    upArrow.style.display = currentPage > 0 ? 'flex' : 'none';
    downArrow.style.display = currentPage < totalPages - 1 ? 'flex' : 'none';
    homeButton.style.display = currentPage > 0 ? 'flex' : 'none';
}

function goToPage(pageIndex) {
    if (isScrolling || pageIndex < 0 || pageIndex >= totalPages) return;
    
    isScrolling = true;
    currentPage = pageIndex;
    updatePageDisplay();
    
    setTimeout(() => {
        isScrolling = false;
    }, 800);
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        goToPage(currentPage + 1);
    }
}

function previousPage() {
    if (currentPage > 0) {
        goToPage(currentPage - 1);
    }
}

function startCalculator() {
    // 로딩 애니메이션
    const button = document.querySelector('.start-button');
    button.style.transform = 'scale(0.95)';
    button.innerHTML = '시작하는 중...';
    
    setTimeout(() => {
        // 여기서 계산기 페이지로 이동
        window.location.href = 'survey.html';
    }, 1000);
}

// 키보드 및 마우스 휠 이벤트
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextPage();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        previousPage();
    } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(0);
    }
});

document.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 10) return;
    
    if (e.deltaY > 0) {
        nextPage();
    } else {
        previousPage();
    }
}, { passive: false });

// 터치 이벤트
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            nextPage();
        } else {
            previousPage();
        }
    }
});

// 초기 화면 설정
updatePageDisplay();

// 애니메이션 효과를 위한 IntersectionObserver
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.querySelectorAll('.title, .subtitle, .description').forEach(el => {
    observer.observe(el);
});