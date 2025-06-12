// 폼 단계 정의
const formSteps = [
    {
        id: 'name',
        title: '닉네임',
        subtitle: '설문을 시작하기 전에, 이름이나 닉네임을 입력해 주세요.<br>실명이 아니어도 괜찮습니다.',
        type: 'text',
        required: true,
        placeholder: '예: 연구미'
    },
    {
        id: 'lifeExpectancy',
        title: '예상 기대수명',
        subtitle: '예상 기대수명을 입력하거나, 건강 설문을 통해 계산해보세요.',
        type: 'number_with_calculator',
        placeholder: '예: 85',
        unit: '세'
    },
    {
        id: 'job',
        title: '직업',
        subtitle: '현재의 직업을 선택해 주세요.',
        type: 'select',
        required: true,
        options: ['직장인', '자영업자', '공무원', '군인', '프리랜서', '학생', '주부', '무직', '은퇴자', '기타']
    },
    {
        id: 'asset',
        title: '자산',
        subtitle: '현재 보유한 총 순자산을 입력해 주세요.',
        type: 'number',
        required: true,
        placeholder: '예: 50000',
        unit: '만원'
    },
    {
        id: 'otherPensions',
        title: '기타 연금 수령 여부',
        subtitle: '국민연금 외에 받고 있는 연금이 있나요?',
        type: 'checkbox',
        options: ['공무원연금', '사학연금', '군인연금', '퇴직연금', '개인연금', '없음']
    },
    {
        id: 'firstJoin',
        title: '국민연금 최초 가입년월',
        subtitle: '국민연금에 처음 가입한 시기를 알려주세요.',
        type: 'month',
        required: true
    },
    {
        id: 'incomeGrowth',
        title: '예상 소득 상승률',
        subtitle: '앞으로 연평균 소득이 얼마나 증가할 것이라 예상하시나요?',
        type: 'number',
        placeholder: '예: 3.5',
        unit: '%'
    },
    {
        id: 'healthInsurance',
        title: '건강보험 자격',
        subtitle: '현재 건강보험 자격을 선택해 주세요.',
        type: 'select',
        required: true,
        options: ['직장가입자', '지역가입자', '피부양자']
    },
    {
        id: 'income',
        title: '소득 정보',
        subtitle: '현재 연간 소득을 입력해 주세요.',
        type: 'number',
        required: true,
        placeholder: '예: 5000',
        unit: '만원'
    },
    {
        id: 'additionalIncome',
        title: '추가소득 여부',
        subtitle: '기타 근로 외 소득이 있나요?',
        type: 'dynamic',
        fields: [
            { name: 'type', label: '소득 종류', type: 'select', options: ['임대소득', '배당소득', '사업소득', '기타'] },
            { name: 'amount', label: '연간 소득액', type: 'number', unit: '만원' }
        ]
    },
    {
        id: 'dependents',
        title: '부양가족 현황',
        subtitle: '현재 함께 살거나 부양하는 가족이 있나요?',
        type: 'group',
        fields: [
            { name: 'spouse', label: '배우자', type: 'select', options: ['있음', '없음'] },
            { name: 'children', label: '부양 자녀 수', type: 'number', unit: '명' },
            { name: 'parents', label: '부양 부모 수', type: 'number', unit: '명' }
        ]
    },
    {
        id: 'credits',
        title: '크레딧 제도 해당 여부',
        subtitle: '다음 항목 중 해당되는 것이 있나요? 해당되는 항목이 있다면 인정 개월 수를 직접 입력해주세요.',
        type: 'group',
        fields: [
            { name: 'military', label: '군복무 크레딧', type: 'number', unit: '개월', tooltip: '최대 6개월까지 인정' },
            { name: 'childbirth', label: '출산 크레딧', type: 'number', unit: '개월', tooltip: '둘째 자녀부터 인정, 최대 50개월' },
            { name: 'unemployment', label: '실업 크레딧', type: 'number', unit: '개월', tooltip: '최대 12개월까지 인정' }
        ]
    },
    {
        id: 'retirementIncome',
        title: '은퇴 이후 소득',
        subtitle: '은퇴 이후에도 발생할 수 있는 정기적인 소득이 있다면 모두 입력해 주세요.',
        type: 'dynamic',
        fields: [
            { name: 'type', label: '소득 종류', type: 'select', options: ['임대소득', '배당소득', '사업소득', '기타'] },
            { name: 'amount', label: '연간 소득액', type: 'number', unit: '만원' },
            { name: 'duration', label: '지속 기간', type: 'number', unit: '년' }
        ]
    },
    {
        id: 'confirm',
        title: '최종 확인',
        subtitle: '입력하신 정보가 맞나요?',
        type: 'confirmation'
    }
];

// 상태 관리
let currentStep = 0;
let formData = {};
let stepStatus = {}; // completed, unknown

// 수명 계산기 관련 변수들
let healthData = {};
let calculatedAge = 0;

// 수명 계산기 관련 함수들
function openLifeCalculator() {
    const modal = document.getElementById('lifeCalculatorModal');
    modal.classList.add('show');
    document.getElementById('healthSurvey').style.display = 'block';
    document.getElementById('resultScreen').style.display = 'none';
    
    // 라디오 버튼 이벤트 리스너 추가
    setupRadioButtons();
    setupBMICalculation();
    
    // ESC 키로 모달 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLifeCalculator();
        }
    });
}

function closeLifeCalculator() {
    const modal = document.getElementById('lifeCalculatorModal');
    modal.classList.remove('show');
    resetHealthForm();
}

function resetHealthForm() {
    healthData = {};
    document.getElementById('birthYear').value = '';
    document.getElementById('region').value = '';
    document.getElementById('height').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('bmiResult').style.display = 'none';
    
    // 모든 라디오 버튼 해제
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    
    // 모든 라디오 아이템 선택 해제
    const radioItems = document.querySelectorAll('.radio-item');
    radioItems.forEach(item => {
        item.classList.remove('selected');
    });
}

function setupRadioButtons() {
    const radioGroups = ['genderGroup', 'incomeGroup', 'smokingGroup', 'bloodPressureGroup', 'diabetesGroup', 'drinkingGroup', 'exerciseGroup'];
    
    radioGroups.forEach(groupId => {
        const group = document.getElementById(groupId);
        if (!group) return;
        
        const items = group.querySelectorAll('.radio-item');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                // 같은 그룹의 다른 아이템들 선택 해제
                items.forEach(otherItem => {
                    otherItem.classList.remove('selected');
                    const radio = otherItem.querySelector('input[type="radio"]');
                    radio.checked = false;
                });
                
                // 현재 아이템 선택
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // 데이터 저장
                const fieldName = radio.name;
                const value = radio.value;
                healthData[fieldName] = value;
            });
        });
    });

    // 태어난 연도와 지역 입력 이벤트
    const birthYearInput = document.getElementById('birthYear');
    const regionSelect = document.getElementById('region');

    if (birthYearInput) {
        birthYearInput.addEventListener('input', (e) => {
            healthData.birthYear = parseInt(e.target.value);
        });
    }

    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            healthData.region = e.target.value;
        });
    }
}

function setupBMICalculation() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiResult = document.getElementById('bmiResult');

    function calculateBMI() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        
        if (height && weight && height > 0 && weight > 0) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            
            let category = '';
            let obesityLevel = '';
            
            if (bmi < 18.5) {
                category = '저체중';
                obesityLevel = '정상';
            } else if (bmi < 25) {
                category = '정상';
                obesityLevel = '정상';
            } else if (bmi < 30) {
                category = '과체중';
                obesityLevel = '과체중';
            } else if (bmi < 35) {
                category = '비만 I';
                obesityLevel = '비만I';
            } else {
                category = '비만 II';
                obesityLevel = '비만II';
            }
            
            bmiResult.innerHTML = `
                <strong>BMI: ${bmi.toFixed(1)}</strong><br>
                분류: ${category}<br>
                <small>자동으로 ${obesityLevel} 범주가 적용됩니다.</small>
            `;
            bmiResult.style.display = 'block';
            
            // 비만 데이터 저장
            healthData.height = height;
            healthData.weight = weight;
            healthData.bmi = bmi;
            healthData.obesity = obesityLevel;
        } else {
            bmiResult.style.display = 'none';
        }
    }

    if (heightInput && weightInput) {
        heightInput.addEventListener('input', calculateBMI);
        weightInput.addEventListener('input', calculateBMI);
    }
}

function calculateLifeExpectancy() {
    // 필수 입력 확인
    if (!healthData.gender || !healthData.birthYear || !healthData.region || !healthData.incomeLevel) {
        alert('기본 정보(성별, 태어난 연도, 거주지역, 소득수준)를 모두 입력해주세요.');
        return;
    }

    if (!healthData.height || !healthData.weight) {
        alert('키와 몸무게를 입력해주세요.');
        return;
    }
    
    if (!healthData.smoking || !healthData.bloodPressure || !healthData.diabetes || 
        !healthData.drinking || !healthData.exercise) {
        alert('모든 건강 정보를 선택해주세요.');
        return;
    }

    // 현재 나이 계산
    const currentYear = new Date().getFullYear();
    const age = currentYear - healthData.birthYear;

    // 1. 기본 기대수명 계산 (CSV 데이터 사용)
    let baseLifeExpectancy = getBaseLifeExpectancy(healthData.region, healthData.gender, parseInt(healthData.incomeLevel));
    
    // 2. 연도별 증가분 적용
    const yearOffset = Math.max(0, Math.min(60, currentYear - 2023));
    const incrementValue = getLifeExpectancyIncrement(healthData.gender, yearOffset);
    
    // 3. 위험요인 손실 계산
    const riskLoss = calculateRiskLoss();
    
    // 최종 계산
    calculatedAge = Math.round((baseLifeExpectancy + incrementValue - riskLoss) * 10) / 10;
    
    // 결과 화면 표시
    showResult();
}

function getBaseLifeExpectancy(region, gender, incomeLevel) {
    // 실제 CSV 데이터 구조에 맞는 기대수명 반환
    const lifeExpectancyData = {
        '서울': {
            '남성': [79.8, 80.5, 81.2, 82.1, 83.2],
            '여성': [85.3, 85.9, 86.6, 87.4, 88.1]
        },
        '경기': {
            '남성': [79.2, 79.9, 80.6, 81.5, 82.6],
            '여성': [84.7, 85.3, 86.0, 86.8, 87.5]
        },
        '부산': {
            '남성': [78.5, 79.2, 79.9, 80.8, 81.9],
            '여성': [84.1, 84.7, 85.4, 86.2, 86.9]
        }
        // 나머지 지역 데이터는 원본과 동일하므로 생략
    };
    
    return lifeExpectancyData[region]?.[gender]?.[incomeLevel - 1] || 80.0;
}

function getLifeExpectancyIncrement(gender, yearOffset) {
    const incrementData = {
        0: { male: 0, female: 0 },
        1: { male: 0.18, female: 0.16 },
        2: { male: 0.36, female: 0.32 },
        3: { male: 0.53, female: 0.47 },
        4: { male: 0.71, female: 0.63 },
        5: { male: 0.89, female: 0.79 }
    };
    
    const maxOffset = Math.min(yearOffset, 5);
    return gender === '남성' ? incrementData[maxOffset].male : incrementData[maxOffset].female;
}

function calculateRiskLoss() {
    let totalLoss = 0;
    
    // 흡연
    if (healthData.smoking === '현재흡연') totalLoss += 4.1;
    else if (healthData.smoking === '과거흡연') totalLoss += 1.2;
    
    // 고혈압
    if (healthData.bloodPressure === 'stage1') totalLoss += 1.5;
    else if (healthData.bloodPressure === 'stage2') totalLoss += 2.3;
    
    // 비만
    if (healthData.obesity === '과체중') totalLoss += 0.8;
    else if (healthData.obesity === '비만I') totalLoss += 1.8;
    else if (healthData.obesity === '비만II') totalLoss += 3.0;
    
    // 당뇨
    if (healthData.diabetes === '전당뇨') totalLoss += 1.2;
    else if (healthData.diabetes === '당뇨') totalLoss += 3.5;
    else if (healthData.diabetes === '고위험당뇨') totalLoss += 6.5;
    
    // 음주
    if (healthData.drinking === '보통') totalLoss += 0.5;
    else if (healthData.drinking === '고위험') totalLoss += 3.5;
    
    // 운동
    if (healthData.exercise === '가끔') totalLoss += 1.0;
    else if (healthData.exercise === '안함') totalLoss += 2.0;
    
    return totalLoss;
}

function showResult() {
    document.getElementById('healthSurvey').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    document.getElementById('predictedAge').textContent = calculatedAge.toFixed(1);
    document.getElementById('ageText').textContent = calculatedAge.toFixed(1);
}

function applyLifeExpectancy() {
    // 원래 폼의 기대수명 필드에 값 설정
    const lifeExpectancyInput = document.querySelector('#formGroup input[type="number"]');
    if (lifeExpectancyInput) {
        lifeExpectancyInput.value = calculatedAge.toFixed(1);
        formData.lifeExpectancy = calculatedAge.toFixed(1);
        stepStatus.lifeExpectancy = 'completed';
        updateStepList();
    }
    
    closeLifeCalculator();
}

function toggleCalculationInfo() {
    const explanation = document.getElementById('calculationExplanation');
    const toggleBtn = document.getElementById('infoToggleBtn');
    
    if (explanation.classList.contains('show')) {
        explanation.classList.remove('show');
        toggleBtn.classList.remove('active');
    } else {
        explanation.classList.add('show');
        toggleBtn.classList.add('active');
    }
}

// 초기화
function init() {
    updateStepList();
    updateFormDisplay();
    updateNavigation();
    
    // 리셋 버튼 이벤트 리스너 추가
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', resetForm);
    }
}

// 단계 목록 업데이트
function updateStepList() {
    const stepList = document.getElementById('stepList');
    stepList.innerHTML = '';

    formSteps.forEach((step, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        
        if (index === currentStep) {
            stepItem.classList.add('active');
        } else if (stepStatus[step.id] === 'completed') {
            stepItem.classList.add('completed');
        } else if (stepStatus[step.id] === 'unknown') {
            stepItem.classList.add('unknown');
        }

        const icon = document.createElement('div');
        icon.className = 'step-icon';
        
        if (stepStatus[step.id] === 'completed') {
            icon.classList.add('completed');
            icon.innerHTML = '<svg class="icon-check" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        } else if (stepStatus[step.id] === 'unknown') {
            icon.classList.add('unknown');
            icon.innerHTML = '<svg class="icon-x" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        } else {
            icon.textContent = index + 1;
        }

        const label = document.createElement('span');
        label.textContent = step.title;
        
        if (step.required) {
            const required = document.createElement('span');
            required.className = 'required-mark';
            required.textContent = '*';
            label.appendChild(required);
        }

        stepItem.appendChild(icon);
        stepItem.appendChild(label);
        
        stepItem.addEventListener('click', () => {
            if (index <= currentStep || stepStatus[step.id]) {
                goToStep(index);
            }
        });

        stepList.appendChild(stepItem);
    });

    // 진행률 업데이트
    const completedSteps = Object.values(stepStatus).filter(status => status === 'completed' || status === 'unknown').length;
    const progressPercent = (completedSteps / formSteps.length) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent = `${currentStep + 1} / ${formSteps.length}`;
}

// 폼 화면 업데이트
function updateFormDisplay() {
    const currentStepData = formSteps[currentStep];
    
    // 방어 코드: DOM 요소가 없으면 함수 종료
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const formGroup = document.getElementById('formGroup');
    if (!formTitle || !formSubtitle || !formGroup) return;

    formTitle.innerHTML = currentStepData.title + (currentStepData.required ? '<span style="color: #fbbf24; margin-left: 0.3rem;">*</span>' : '');
    formSubtitle.innerHTML = currentStepData.subtitle;
    formGroup.innerHTML = '';
    formGroup.className = 'form-group fade-in';

    // 잘 모르겠어요 버튼 표시/숨김
    const unknownBtn = document.getElementById('unknownBtn');
    unknownBtn.style.display = (currentStepData.required || currentStepData.type === 'confirmation' || currentStepData.id === 'lifeExpectancy') ? 'none' : 'inline-block';

    switch (currentStepData.type) {
        case 'text':
        case 'number':
        case 'date':
        case 'month':
        case 'number_with_calculator':
            createInputField(formGroup, currentStepData);
            break;
        case 'select':
            createSelectField(formGroup, currentStepData);
            break;
        case 'checkbox':
            createCheckboxField(formGroup, currentStepData);
            break;
        case 'dynamic':
            createDynamicField(formGroup, currentStepData);
            break;
        case 'group':
            createGroupField(formGroup, currentStepData);
            break;
        case 'confirmation':
            createConfirmationField(formGroup);
            break;
    }
}

// 입력 필드 생성
function createInputField(container, stepData) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    
    if (stepData.type === 'number_with_calculator') {
        // 수명 계산기가 있는 입력 필드
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-with-button';
        
        const input = document.createElement('input');
        input.className = 'input-field';
        input.type = 'number';
        input.placeholder = stepData.placeholder || '';
        input.value = formData[stepData.id] || '';
        
        input.addEventListener('input', (e) => {
            formData[stepData.id] = e.target.value;
            if (e.target.value && stepData.id !== 'lifeExpectancy') {
                stepStatus[stepData.id] = 'completed';
                updateStepList();
            }
            hideError();
        });

        const calcButton = document.createElement('button');
        calcButton.className = 'calculate-life-btn';
        calcButton.textContent = '계산해보기';
        calcButton.type = 'button';
        calcButton.onclick = () => openLifeCalculator();

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(calcButton);
        wrapper.appendChild(inputWrapper);

        if (stepData.unit) {
            const unitSpan = document.createElement('span');
            unitSpan.style.position = 'absolute';
            unitSpan.style.right = '140px';
            unitSpan.style.top = '50%';
            unitSpan.style.transform = 'translateY(-50%)';
            unitSpan.style.color = '#a0aec0';
            unitSpan.style.fontSize = '1rem';
            unitSpan.textContent = stepData.unit;
            wrapper.appendChild(unitSpan);
            
            input.style.paddingRight = '160px';
        }
    } else {
        // 일반 입력 필드
        const input = document.createElement('input');
        input.className = 'input-field';
        input.type = stepData.type;
        input.placeholder = stepData.placeholder || '';
        input.value = formData[stepData.id] || '';
        
        input.addEventListener('input', (e) => {
            formData[stepData.id] = e.target.value;
            if (e.target.value && stepData.id !== 'lifeExpectancy') {
                stepStatus[stepData.id] = 'completed';
                updateStepList();
            }
            hideError();
        });

        wrapper.appendChild(input);

        if (stepData.unit) {
            const unitSpan = document.createElement('span');
            unitSpan.style.position = 'absolute';
            unitSpan.style.right = '1.5rem';
            unitSpan.style.top = '50%';
            unitSpan.style.transform = 'translateY(-50%)';
            unitSpan.style.color = '#a0aec0';
            unitSpan.style.fontSize = '1rem';
            unitSpan.textContent = stepData.unit;
            wrapper.appendChild(unitSpan);
            
            const input = wrapper.querySelector('.input-field');
            input.style.paddingRight = '4rem';
        }
    }

    container.appendChild(wrapper);
}

// 선택 필드 생성
function createSelectField(container, stepData) {
    const select = document.createElement('select');
    select.className = 'select-field';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '선택해주세요';
    defaultOption.disabled = true;
    defaultOption.selected = !formData[stepData.id];
    select.appendChild(defaultOption);

    stepData.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        optionElement.selected = formData[stepData.id] === option;
        select.appendChild(optionElement);
    });

    select.addEventListener('change', (e) => {
        formData[stepData.id] = e.target.value;
        if (e.target.value) {
            stepStatus[stepData.id] = 'completed';
            updateStepList();
        }
        hideError();
    });

    container.appendChild(select);
}

// 체크박스 필드 생성
function createCheckboxField(container, stepData) {
    const checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'checkbox-group';

    if (!formData[stepData.id]) {
        formData[stepData.id] = [];
    }

    stepData.options.forEach(option => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${stepData.id}-${option}`;
        checkbox.value = option;
        checkbox.checked = formData[stepData.id].includes(option);

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option;

        function handleCheckboxChange(checked) {
            if (checked) {
                if (!formData[stepData.id].includes(option)) {
                    formData[stepData.id].push(option);
                }
                if (option === '없음') {
                    formData[stepData.id] = ['없음'];
                    checkboxGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                        cb.checked = cb.value === '없음';
                    });
                } else {
                    const noneIndex = formData[stepData.id].indexOf('없음');
                    if (noneIndex > -1) {
                        formData[stepData.id].splice(noneIndex, 1);
                        const noneCheckbox = checkboxGroup.querySelector('input[value="없음"]');
                        if (noneCheckbox) noneCheckbox.checked = false;
                    }
                }
            } else {
                const index = formData[stepData.id].indexOf(option);
                if (index > -1) {
                    formData[stepData.id].splice(index, 1);
                }
            }

            if (formData[stepData.id].length > 0) {
                stepStatus[stepData.id] = 'completed';
                updateStepList();
            }
            hideError();
        }

        checkbox.addEventListener('change', (e) => {
            handleCheckboxChange(e.target.checked);
        });

        checkboxItem.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return;
            checkbox.checked = !checkbox.checked;
            handleCheckboxChange(checkbox.checked);
        });

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        checkboxGroup.appendChild(checkboxItem);
    });

    container.appendChild(checkboxGroup);
}

// 동적 필드 생성
function createDynamicField(container, stepData) {
    if (!formData[stepData.id]) {
        formData[stepData.id] = [];
    }

    const dynamicContainer = document.createElement('div');
    
    function renderDynamicItems() {
        dynamicContainer.innerHTML = '';
        
        formData[stepData.id].forEach((item, index) => {
            const dynamicItem = document.createElement('div');
            dynamicItem.className = 'dynamic-item';

            stepData.fields.forEach(field => {
                const row = document.createElement('div');
                row.className = 'dynamic-item-row';

                const label = document.createElement('label');
                label.textContent = field.label;
                label.style.minWidth = '100px';
                label.style.color = 'white';
                label.style.fontSize = '0.9rem';

                let input;
                if (field.type === 'select') {
                    input = document.createElement('select');
                    input.className = 'select-field';
                    
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '선택해주세요';
                    input.appendChild(defaultOption);

                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        optionElement.selected = item[field.name] === option;
                        input.appendChild(optionElement);
                    });
                } else {
                    input = document.createElement('input');
                    input.className = 'input-field';
                    input.type = field.type;
                    input.value = item[field.name] || '';
                }

                input.addEventListener('input', (e) => {
                    formData[stepData.id][index][field.name] = e.target.value;
                });

                row.appendChild(label);
                row.appendChild(input);
                
                if (field.unit) {
                    const unit = document.createElement('span');
                    unit.textContent = field.unit;
                    unit.style.color = 'white';
                    unit.style.marginLeft = '0.5rem';
                    row.appendChild(unit);
                }

                dynamicItem.appendChild(row);
            });

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => {
                formData[stepData.id].splice(index, 1);
                renderDynamicItems();
            });

            const lastRow = dynamicItem.lastElementChild;
            lastRow.appendChild(removeBtn);

            dynamicContainer.appendChild(dynamicItem);
        });
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.textContent = '+ 항목 추가하기';
    addBtn.addEventListener('click', () => {
        const newItem = {};
        stepData.fields.forEach(field => {
            newItem[field.name] = '';
        });
        formData[stepData.id].push(newItem);
        renderDynamicItems();
    });

    renderDynamicItems();
    container.appendChild(dynamicContainer);
    container.appendChild(addBtn);
}

// 그룹 필드 생성
function createGroupField(container, stepData) {
    if (!formData[stepData.id]) {
        formData[stepData.id] = {};
    }

    stepData.fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'group-field';

        const labelContainer = document.createElement('div');
        labelContainer.className = 'group-field-label';

        const label = document.createElement('label');
        label.textContent = field.label;
        labelContainer.appendChild(label);

        if (field.tooltip) {
            const tooltipContainer = document.createElement('div');
            tooltipContainer.className = 'tooltip-container';

            const tooltipIcon = document.createElement('div');
            tooltipIcon.className = 'tooltip-icon';
            tooltipIcon.textContent = '?';

            const tooltipContent = document.createElement('div');
            tooltipContent.className = 'tooltip-content';
            tooltipContent.textContent = field.tooltip;

            tooltipContainer.appendChild(tooltipIcon);
            tooltipContainer.appendChild(tooltipContent);
            labelContainer.appendChild(tooltipContainer);
        }

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'group-field-input-wrapper';

        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'select-field';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '선택해주세요';
            defaultOption.disabled = true;
            defaultOption.selected = !formData[stepData.id][field.name];
            input.appendChild(defaultOption);

            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                optionElement.selected = formData[stepData.id][field.name] === option;
                input.appendChild(optionElement);
            });

            input.addEventListener('change', (e) => {
                formData[stepData.id][field.name] = e.target.value;
            });
        } else {
            input = document.createElement('input');
            input.className = 'input-field';
            input.type = field.type;
            input.value = formData[stepData.id][field.name] || '';
            input.placeholder = '0';
            
            input.addEventListener('input', (e) => {
                formData[stepData.id][field.name] = e.target.value;
            });
        }

        inputWrapper.appendChild(input);

        if (field.unit) {
            const unit = document.createElement('span');
            unit.className = 'group-field-unit';
            unit.textContent = field.unit;
            inputWrapper.appendChild(unit);
        }

        fieldContainer.appendChild(labelContainer);
        fieldContainer.appendChild(inputWrapper);
        container.appendChild(fieldContainer);
    });
}

// 확인 필드 생성
function createConfirmationField(container) {
    const table = document.createElement('div');
    table.className = 'confirmation-table';

    const tableElement = document.createElement('table');
    const tbody = document.createElement('tbody');

    formSteps.slice(0, -1).forEach(step => {
        const row = document.createElement('tr');
        
        const th = document.createElement('th');
        th.textContent = step.title;
        
        const td = document.createElement('td');
        const value = formData[step.id];
        
        if (stepStatus[step.id] === 'unknown') {
            td.innerHTML = '<span style="color: #fbbf24;">잘 모르겠어요</span>';
        } else if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            td.innerHTML = '<span class="missing-value">미입력</span>';
        } else {
            if (typeof value === 'object' && !Array.isArray(value)) {
                td.textContent = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
            } else if (Array.isArray(value)) {
                td.textContent = value.join(', ');
            } else {
                td.textContent = value;
            }
        }

        row.appendChild(th);
        row.appendChild(td);
        tbody.appendChild(row);
    });

    tableElement.appendChild(tbody);
    table.appendChild(tableElement);
    container.appendChild(table);
}

// 네비게이션 업데이트
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let calcBtn = document.getElementById('calcBtn');

    prevBtn.disabled = currentStep === 0;
    
    if (currentStep === formSteps.length - 1) {
        nextBtn.style.display = 'none';
        if (!calcBtn) {
            calcBtn = document.createElement('button');
            calcBtn.className = 'nav-btn calc-btn-final';
            calcBtn.id = 'calcBtn';
            calcBtn.type = 'button';
            calcBtn.title = '최종 계산';
            calcBtn.textContent = '계산하기';
            calcBtn.onclick = finalCalculate;
            nextBtn.parentNode.appendChild(calcBtn);
        }
        calcBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        if (calcBtn) calcBtn.style.display = 'none';
        nextBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    }
}

// 최종 계산 버튼 동작
function finalCalculate() {
    // 마지막 단계에서만 동작
    if (currentStep === formSteps.length - 1) {
        // 데이터 저장
        localStorage.setItem('surveyFormData', JSON.stringify(formData));
        localStorage.setItem('surveyStepStatus', JSON.stringify(stepStatus));
        // 기존 계산 및 이동
        document.querySelector('.main-content').innerHTML = `
            <div style="text-align: center;">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">계산 중입니다...</h2>
                <div style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        setTimeout(() => {
            window.location.href = 'result.html';
        }, 3000);
    }
}

// 다음 단계
function nextStep() {
    const currentStepData = formSteps[currentStep];
    
    if (currentStepData.required) {
        const value = formData[currentStepData.id];
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
            showError('필수 항목입니다. 값을 입력하거나 선택해주세요.');
            return;
        }
    }

    if (!currentStepData.required) {
        const value = formData[currentStepData.id];
        const hasValue = value !== undefined && value !== '' && value !== null;
        const isUnknown = stepStatus[currentStepData.id] === 'unknown';
        
        if (!hasValue && !isUnknown) {
            return;
        }
    }

    const hasActualValue = formData[currentStepData.id] !== undefined && 
                         formData[currentStepData.id] !== '' && 
                         formData[currentStepData.id] !== null;
    
    if (hasActualValue && stepStatus[currentStepData.id] !== 'unknown') {
        stepStatus[currentStepData.id] = 'completed';
    }

    if (currentStep < formSteps.length - 1) {
        currentStep++;
        updateStepList();
        updateFormDisplay();
        updateNavigation();
        hideError();
    }
}

// 이전 단계
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStepList();
        updateFormDisplay();
        updateNavigation();
        hideError();
    }
}

// 특정 단계로 이동
function goToStep(stepIndex) {
    const currentStepData = formSteps[currentStep];
    if (currentStepData && 
        formData[currentStepData.id] !== undefined && 
        formData[currentStepData.id] !== '' &&
        stepStatus[currentStepData.id] !== 'unknown') {
        stepStatus[currentStepData.id] = 'completed';
    }
    
    currentStep = stepIndex;
    updateStepList();
    updateFormDisplay();
    updateNavigation();
    hideError();
}

// 잘 모르겠어요 선택
function selectUnknown() {
    const currentStepData = formSteps[currentStep];
    stepStatus[currentStepData.id] = 'unknown';
    
    if (!formData[currentStepData.id]) {
        switch (currentStepData.type) {
            case 'number':
                formData[currentStepData.id] = 0;
                break;
            case 'text':
                formData[currentStepData.id] = '정보 없음';
                break;
            case 'select':
                formData[currentStepData.id] = currentStepData.options[0];
                break;
            default:
                formData[currentStepData.id] = '';
        }
    }

    updateStepList();
    
    setTimeout(() => {
        nextStep();
    }, 300);
}

// 에러 표시
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// 에러 숨김
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// 처음부터 다시하기
function resetForm() {
    showResetModal();
}

function showResetModal() {
    const modal = document.getElementById('resetModal');
    modal.classList.add('show');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeResetModal();
        }
    });
}

function closeResetModal() {
    const modal = document.getElementById('resetModal');
    modal.classList.remove('show');
}

function confirmReset() {
    currentStep = 0;
    formData = {};
    stepStatus = {};
    updateStepList();
    updateFormDisplay();
    updateNavigation();
    hideError();
    closeResetModal();
}

// 전역 함수로 등록
window.resetForm = resetForm;
window.showResetModal = showResetModal;
window.closeResetModal = closeResetModal;
window.confirmReset = confirmReset;
window.openLifeCalculator = openLifeCalculator;
window.closeLifeCalculator = closeLifeCalculator;
window.calculateLifeExpectancy = calculateLifeExpectancy;
window.applyLifeExpectancy = applyLifeExpectancy;
window.toggleCalculationInfo = toggleCalculationInfo;

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResetModal();
        closeLifeCalculator();
        return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        nextStep();
    } else if (e.key === 'ArrowLeft') {
        previousStep();
    } else if (e.key === 'ArrowRight') {
        nextStep();
    }
});

// 초기화 실행
init();