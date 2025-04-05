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
    let currentRomaji = ''; // ローマ字変換された現在の単語

    // 日本語からローマ字への変換マップ
    const romajiMap = {
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'を': 'wo', 'ん': 'n',
        'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
        'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
        'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
        'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
        'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
        
        // 基本的な拗音
        'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
        'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
        'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
        'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
        'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
        'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
        'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
        'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
        'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
        'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
        'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
        
        // 外来語用の特殊な拗音
        'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo',
        'うぃ': 'wi', 'うぇ': 'we', 'うぉ': 'wo',
        'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔ': 'vu', 'ゔぇ': 've', 'ゔぉ': 'vo',
        'しぇ': 'she', 'じぇ': 'je', 'ちぇ': 'che', 'てぃ': 'ti', 'でぃ': 'di',
        'でゅ': 'dyu', 'とぅ': 'tu', 'どぅ': 'du',
        
        // カタカナ特有の表記
        'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo',
        'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
        'ヴァ': 'va', 'ヴィ': 'vi', 'ヴ': 'vu', 'ヴェ': 've', 'ヴォ': 'vo',
        'シェ': 'she', 'ジェ': 'je', 'チェ': 'che', 'ティ': 'ti', 'ディ': 'di',
        'デュ': 'dyu', 'トゥ': 'tu', 'ドゥ': 'du',
        'ツァ': 'tsa', 'ツィ': 'tsi', 'ツェ': 'tse', 'ツォ': 'tso',
        
        // その他の記号
        'ー': '-',
        '　': ' ', // 全角スペース
        ' ': ' '   // 半角スペース
    };

    // カタカナをひらがなに変換する関数
    function katakanaToHiragana(text) {
        return text.replace(/[\u30A1-\u30F6]/g, function(match) {
            const code = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(code);
        });
    }

    // 日本語をローマ字に変換する関数
    function convertToRomaji(text) {
        // カタカナをひらがなに変換
        const hiragana = katakanaToHiragana(text);
        let result = '';
        let i = 0;
        
        while (i < hiragana.length) {
            // 促音（小さいっ）の処理
            if (hiragana[i] === 'っ' && i < hiragana.length - 1) {
                const nextChar = hiragana[i + 1];
                const nextRomaji = romajiMap[nextChar] || nextChar;
                if (nextRomaji.length > 0) {
                    result += nextRomaji[0]; // 最初の子音を追加
                }
                i++;
                continue;
            }
            
            // 拗音（きゃ、しゃなど）の処理
            if (i < hiragana.length - 1) {
                const compound = hiragana.substr(i, 2);
                if (romajiMap[compound]) {
                    result += romajiMap[compound];
                    i += 2;
                    continue;
                }
            }
            
            // 通常の文字の処理
            if (romajiMap[hiragana[i]]) {
                result += romajiMap[hiragana[i]];
            } else {
                // マップにない文字はそのまま追加（アルファベットなど）
                result += hiragana[i];
            }
            
            i++;
        }
        
        return result;
    }

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
        currentRomaji = convertToRomaji(currentWord); // ローマ字に変換
        
        console.log(`単語: ${currentWord}, ローマ字: ${currentRomaji}`); // デバッグ用
        
        // 日本語とローマ字の両方を表示
        wordDisplay.innerHTML = `<div>${currentWord}</div><div class="romaji-hint">(${currentRomaji})</div>`;
        typedWordDisplay.innerHTML = '';
        wordInput.value = '';
        wordInput.classList.remove('incorrect');
    }

    // 入力チェック
    function checkMatch() {
        const typedText = wordInput.value.toLowerCase(); // 小文字に統一
        const targetText = currentRomaji.toLowerCase(); // ローマ字の単語（小文字に統一）
        
        console.log(`入力: ${typedText}, 目標: ${targetText}`); // デバッグ用
        
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
            return;
        }
        
        // 途中まで正しいかチェック
        if (targetText.startsWith(typedText)) {
            wordInput.classList.remove('incorrect');
            
            // 入力された文字数に応じて日本語の文字をハイライト
            highlightJapaneseText(typedText);
        } else {
            // 間違っている場合
            wordInput.classList.add('incorrect');
            typedWordDisplay.innerHTML = ''; // ハイライトをクリア
        }
    }
    
    // 日本語テキストのハイライト処理
    function highlightJapaneseText(typedRomaji) {
        let displayHTML = '';
        let currentRomajiPosition = 0;
        
        // 各日本語文字に対応するローマ字の範囲を計算し、ハイライト
        for (let i = 0; i < currentWord.length; i++) {
            let char = currentWord[i];
            let nextChar = i < currentWord.length - 1 ? currentWord[i + 1] : '';
            let romajiForChar = '';
            
            // 拗音の処理
            if (nextChar && romajiMap[char + nextChar]) {
                romajiForChar = romajiMap[char + nextChar];
                i++; // 次の文字も処理済みとする
                char = char + nextChar;
            } else {
                romajiForChar = romajiMap[char] || char;
            }
            
            const nextRomajiPosition = currentRomajiPosition + romajiForChar.length;
            
            // 文字の状態を判定
            let charClass = '';
            if (typedRomaji.length >= nextRomajiPosition) {
                // 完全に入力済み
                charClass = 'correct';
            } else if (typedRomaji.length > currentRomajiPosition) {
                // 部分的に入力済み
                charClass = 'partial';
            }
            
            displayHTML += `<span class="${charClass}">${char}</span>`;
            currentRomajiPosition = nextRomajiPosition;
        }
        
        typedWordDisplay.innerHTML = displayHTML;
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
