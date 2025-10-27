// quiz.js 파일 내용 시작

// HTML 파일의 <script type="module"> 블록에서 window.db와 window.RESULTS_COLLECTION을 설정했으므로 여기서 사용합니다.
const db = window.db;
const RESULTS_COLLECTION = window.RESULTS_COLLECTION;

// --- 0. 전역 상수/함수 ---
const LOCAL_STORAGE_KEY = 'zero_waste_quiz_results';

const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
? crypto.randomUUID.bind(crypto) 
: () => Math.random().toString(36).substring(2, 9); 

// ... (기존의 quizData, pledges 상수는 그대로 유지) ...
const quizData = { /* ... */ };
const pledges = { /* ... */ };


/**
 * 퀴즈 결과를 로컬 스토리지에 저장 (선택 사항)
 */
function saveResultLocally(result) {
    // 로컬 저장소 로직 (기존과 동일)
    let results = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    results.push(result);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
}

/**
 * 퀴즈 결과를 Firestore에 저장 (⭐ V9 모듈 방식으로 수정)
 */
async function saveResult(result) {
    // HTML 파일에서 import 했으므로 addDoc 함수는 전역에서 사용 가능해야 합니다.
    // 하지만 모듈 환경에서는 명시적 import가 필요하므로, 여기서는 window.db를 통해 접근합니다.
    try {
        // v9 모듈 방식: await addDoc(collection(db, collectionName), data)
        const docRef = await window.firebase.firestore.addDoc(window.firebase.firestore.collection(db, RESULTS_COLLECTION), result);
        console.log("퀴즈 결과가 성공적으로 Firestore에 저장되었습니다. 문서 ID: ", docRef.id);
        alert("퀴즈 결과가 서버에 저장되었습니다!"); // 저장 성공 시 알림
    } catch (error) {
        console.error("Firestore에 결과 저장 중 오류 발생:", error);
        alert("퀴즈 결과 저장에 실패했습니다. (서버 오류)");
    }
}


// --- 2. 이벤트 리스너 연결 및 핵심 로직 (window.onload 안의 모든 내용) ---

document.addEventListener('DOMContentLoaded', () => {
    // 2-1. 모든 상태 변수 및 DOM 요소 변수
    let screens = {};
    // ... (모든 변수 정의 유지) ...
    let currentAgeGroup = '';
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedSetIndex = 0;
    let localParticipantId_internal = 'guest-' + uuid();
    let answerLog = []; 
    let correctLog = []; 

    // DOM 요소 선택 및 변수 할당 (기존과 동일)
    // ... (DOM 할당 코드 유지) ...

    // 2-2. 핵심 함수 정의 (내부 변수들을 안전하게 참조)
    // ... (showScreen, loadQuestion, checkAnswer, nextQuestion, startGame 함수 유지) ...
    
    // showResults 함수만 saveResult(resultData) 호출을 위해 수정
    function showResults() {
        // ... (점수 계산 및 화면 표시 로직 유지) ...
        
        const resultData = {
            id: localParticipantId_internal,
            ageGroup: currentAgeGroup,
            score: score,
            totalQuestions: currentQuizSet.length,
            quizSetIndex: selectedSetIndex,
            timestamp: new Date().toISOString(),
            answerLog: answerLog, 
            correctLog: correctLog 
        };
        saveResultLocally(resultData); // 로컬 저장소
        
        // ⭐ Firestore 저장 함수 호출
        saveResult(resultData);

        showScreen('results');
    }

    // ... (startGame, showScreen, loadQuestion, checkAnswer, nextQuestion 함수 유지) ...
    
    // 2-3. 이벤트 리스너 연결 (기존과 동일)
    ageSelectButtons.forEach(button => {
        button.addEventListener('click', startGame);
    });

    // ... (모든 이벤트 리스너 연결 유지) ...

    // 초기 화면 설정
    showScreen('ageSelection');
});

// quiz.js 파일 내용 끝