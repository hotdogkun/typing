document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const wordDisplay = document.getElementById('target-word');
    const typedWordDisplay = document.getElementById('typed-word');
    const wordInput = document.getElementById('word-input');
    const timer = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const accuracyDisplay = document.getElementById('accuracy');
    const wpmDisplay = document.getElementById('wpm');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty-select');

    // ゲーム変数
    let score = 0;
    let timeLeft = 60;
    let isPlaying = false;
    let intervalId;
    let totalTypedChars = 0;
    let correctTypedChars = 0;
    let startTime;
    let currentWord = '';

    // 難易度ごとの単語リスト
    const wordLists = {
        easy: [
            'こんにちは', 'ありがとう', 'おはよう', 'さようなら', 'いぬ', 'ねこ', 'やま', 'うみ',
            'あお', 'あか', 'みどり', 'きいろ', 'くろ', 'しろ', 'むらさき', 'みず', 'ほん',
            'えんぴつ', 'いす', 'つくえ', 'でんわ', 'くるま', 'でんしゃ', 'ひこうき'
        ],
        medium: [
            'プログラミング', 'コンピューター', 'インターネット', 'アプリケーション', 'データベース',
            'ウェブサイト', 'スマートフォン', 'タブレット', 'キーボード', 'マウス', 'モニター',
            'ソフトウェア', 'ハードウェア', 'ネットワーク', 'セキュリティ', 'クラウド', 'サーバー',
            'プロジェクト', 'デザイン', 'グラフィック', 'アニメーション', 'プレゼンテーション'
        ],
        hard: [
            '人工知能', '機械学習', 'ディープラーニング', 'ブロックチェーン', '仮想現実', '拡張現実',
            'モノのインターネット', 'サイバーセキュリティ', 'データサイエンス', 'クラウドコンピューティング',
            '量子コンピュータ', 'マイクロサービス', 'コンテナ化', 'デジタルトランスフォーメーション',
            'ビッグデータ', '自然言語処理', '画像認識', '音声認識', 'ロボティクス', '自動運転'
        ]
    };

    // 初期化
    function init() {
        resetGame();
        startButton.addEventListener('click', startGame);
        resetButton.addEventListener('click', resetGame);
        wordInput.addEventListener('input', checkMatch);
        difficultySelect.addEventListener('change', resetGame);
        
        // ゲーム開始のためのクリックイベント
        wordDisplay.addEventListener('click', () => {
            if (!isPlaying) {
                startGame();
            }
        });
    }

    // ゲーム開始
    function startGame() {
        if (isPlaying) return;
        
        isPlaying = true;
        timeLeft = 60;
        score = 0;
        totalTypedChars = 0;
        correctTypedChars = 0;
        startTime = new Date().getTime();
        
        updateScore();
        updateAccuracy();
        updateWPM();
        
        wordInput.disabled = false;
        wordInput.focus();
        startButton.disabled = true;
        
        getNewWord();
        
        // タイマー開始
        intervalId = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // ゲーム終了
    function endGame() {
        clearInterval(intervalId);
        isPlaying = false;
        wordInput.disabled = true;
        startButton.disabled = false;
        wordDisplay.textContent = 'ゲーム終了！もう一度プレイするにはスタートボタンを押してください';
        typedWordDisplay.innerHTML = '';
    }

    // ゲームリセット
    function resetGame() {
        clearInterval(intervalId);
        isPlaying = false;
        timeLeft = 60;
        score = 0;
        totalTypedChars = 0;
        correctTypedChars = 0;
        
        timer.textContent = timeLeft;
        updateScore();
        updateAccuracy();
        updateWPM();
        
        wordInput.disabled = true;
        wordInput.value = '';
        startButton.disabled = false;
        wordDisplay.textContent = 'ここをクリックしてスタート';
        typedWordDisplay.innerHTML = '';
    }

    // 新しい単語の取得
    function getNewWord() {
        const difficulty = difficultySelect.value;
        const words = wordLists[difficulty];
        currentWord = words[Math.floor(Math.random() * words.length)];
        wordDisplay.textContent = currentWord;
        typedWordDisplay.innerHTML = '';
        wordInput.value = '';
        wordInput.classList.remove('incorrect');
    }

    // 入力チェック
    function checkMatch() {
        const typedText = wordInput.value;
        const targetText = currentWord;
        
        // 入力された文字と目標の文字を比較して表示
        let displayHTML = '';
        for (let i = 0; i < typedText.length; i++) {
            const charClass = (i < targetText.length && typedText[i] === targetText[i]) ? 'correct' : 'incorrect';
            displayHTML += `<span class="${charClass}">${targetText[i] || ''}</span>`;
        }
        typedWordDisplay.innerHTML = displayHTML;
        
        // 単語が完全に一致した場合
        if (typedText === targetText) {
            // スコア更新
            score++;
            updateScore();
            
            // 正確さの計算用
            totalTypedChars += targetText.length;
            correctTypedChars += targetText.length;
            
            // WPMの更新
            updateWPM();
            updateAccuracy();
            
            // 次の単語へ
            getNewWord();
        } else if (targetText.startsWith(typedText)) {
            // 途中まで正しい場合
            wordInput.classList.remove('incorrect');
        } else {
            // 間違っている場合
            wordInput.classList.add('incorrect');
        }
    }

    // スコア更新
    function updateScore() {
        scoreDisplay.textContent = `スコア: ${score}`;
    }

    // 正確さ更新
    function updateAccuracy() {
        let accuracy = 0;
        if (totalTypedChars > 0) {
            accuracy = Math.round((correctTypedChars / totalTypedChars) * 100);
        }
        accuracyDisplay.textContent = `正確さ: ${accuracy}%`;
    }

    // WPM（1分あたりの単語数）更新
    function updateWPM() {
        let wpm = 0;
        if (isPlaying) {
            const elapsedTime = (new Date().getTime() - startTime) / 1000 / 60; // 分単位
            if (elapsedTime > 0) {
                // 日本語の場合、1単語を5文字として計算
                wpm = Math.round((correctTypedChars / 5) / elapsedTime);
            }
        }
        wpmDisplay.textContent = `WPM: ${wpm}`;
    }

    // 初期化実行
    init();
});
