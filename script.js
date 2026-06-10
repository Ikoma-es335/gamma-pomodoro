let timeLeft = 25 * 60;
let timerId = null;
let isWorkMode = true;

const display = document.getElementById('display');
const toggleBtn = document.getElementById('toggle-btn');

const startIcon = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>START';
const stopIcon  = '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>STOP';

// 🎵 音楽ファイルの読み込みと無限ループ設定
const focusAudio = new Audio('focus.mp3');
const restAudio  = new Audio('rest.mp3');
focusAudio.loop = true;
restAudio.loop  = true;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function changeTime(amount) {
    stopTimer();
    if (timeLeft + amount > 0) {
        timeLeft += amount;
        updateDisplay();
    }
}

function toggleTimer() {
    if (timerId === null) {
        startTimer();
    } else {
        stopTimer();
    }
}

// 🎵 タイマーと音の開始
function startTimer() {
    if (timerId !== null) return;

    toggleBtn.innerHTML = stopIcon;
    toggleBtn.classList.add('running');

    focusAudio.pause();
    restAudio.pause();

    if (isWorkMode) {
        focusAudio.currentTime = 0;
        focusAudio.play().catch(e => console.log('音楽再生エラー:', e));
    } else {
        restAudio.currentTime = 0;
        restAudio.play().catch(e => console.log('音楽再生エラー:', e));
    }

    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            stopTimer();
            switchMode();
        }
    }, 1000);
}

// 🎵 タイマーと音の一時停止
function stopTimer() {
    if (timerId === null) return;

    clearInterval(timerId);
    timerId = null;

    toggleBtn.innerHTML = startIcon;
    toggleBtn.classList.remove('running');

    focusAudio.pause();
    restAudio.pause();
}

// 🎵 モードの切り替え
function switchMode() {
    if (isWorkMode) {
        isWorkMode = false;
        timeLeft = 5 * 60;
        document.body.classList.add('rest-mode');
        restAudio.load();
        restAudio.play().catch(e => console.log('音楽再生エラー:', e));
    } else {
        isWorkMode = true;
        timeLeft = 25 * 60;
        document.body.classList.remove('rest-mode');
        focusAudio.load();
        focusAudio.play().catch(e => console.log('音楽再生エラー:', e));
    }
    updateDisplay();
    startTimer();
}
// 🎵 完全リセット
function resetTimer() {
    stopTimer();
    isWorkMode = true;
    timeLeft = 25 * 60;
    document.body.classList.remove('rest-mode');

    focusAudio.pause();
    focusAudio.currentTime = 0;
    restAudio.pause();
    restAudio.currentTime = 0;

    updateDisplay();
}

// 🔔 Service Worker の登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}

updateDisplay();
