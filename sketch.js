var tokenList = tokenLists[Math.floor(Math.random()*tokenLists.length)];

let currentTokenIndex = 0;
let depth = 8;
let score = 0;
let totalScore = 0;
let userGuess = '';
let gameState = 'guessing'; // 'guessing', 'feedback', 'gameOver'
let fontcolor = 'green';
let backgroundColor = 'black';
let audioFiles = [];

let audioContext;
let audioBuffers = [];

function preload() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Preload audio files
    for (let i = 0; i <= 10; i++) {
        loadAudio(`audio/feedback${i}.mp3`, i);
    }
}

function loadAudio(url, index) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            audioBuffers[index] = audioBuffer;
        })
        .catch(error => console.error('Error loading audio:', error));
}

function playAudio(index) {
    if (audioBuffers[index]) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[index];
        source.connect(audioContext.destination);
        source.start();
    } else {
        console.error('Audio not loaded yet');
    }
}

let isMobile;
let canvas;
let buttons = [];

function setup() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('display', 'block'); // Removes scrollbars
    textAlign(LEFT, TOP);
    textSize(16);
    textFont('Courier New');
    preload();
    
    createMobileButtons();
    windowResized(); // Call this to set initial sizes
}

function createMobileButtons() {
    buttons = [];
    const buttonSize = min(width, height) * 0.1;
    const spacing = buttonSize * 0.2;
    const startY = height * 0.7;

    for (let i = 1; i <= 8; i++) {
        let x = (i - 1) % 4 * (buttonSize + spacing) + spacing;
        let y = startY + Math.floor((i - 1) / 4) * (buttonSize + spacing);
        
        let button = createButton(i.toString());
        button.style('font-size', `${buttonSize * 0.5}px`);
        button.mousePressed(() => handleButtonPress(i.toString()));
        buttons.push({button, x, y, w: buttonSize, h: buttonSize});
    }

    let enterButton = createButton('Enter');
    enterButton.style('font-size', `${buttonSize * 0.3}px`);
    enterButton.mousePressed(() => handleButtonPress('Enter'));
    buttons.push({button: enterButton, x: spacing, y: startY + 2 * (buttonSize + spacing), w: 2 * buttonSize + spacing, h: buttonSize});

    let backspaceButton = createButton('←');
    backspaceButton.style('font-size', `${buttonSize * 0.5}px`);
    backspaceButton.mousePressed(() => handleButtonPress('Backspace'));
    buttons.push({button: backspaceButton, x: 2 * (buttonSize + spacing) + spacing, y: startY + 2 * (buttonSize + spacing), w: 2 * buttonSize + spacing, h: buttonSize});
}


function draw() {
    background(backgroundColor);

    // Display total score in top right
    fill(fontcolor);
    textAlign(RIGHT, TOP);
    textSize(24);
    text(`Total Score: ${totalScore}`, width - 20, 20);
    textAlign(LEFT, TOP);
    textSize(16);

    if (gameState === 'guessing' || gameState === 'feedback') {
        const currentToken = tokenList[currentTokenIndex];
        const nextToken = tokenList[currentTokenIndex + 1];

        // Display all previous tokens and their components
        displayPreviousTokens();

        // Display current token and its components
        fill(fontcolor);
        text(`Current token: ${currentToken.token}`, 20, height * 0.5);
        text(`Components: ${currentToken.components.slice(0, depth).join(', ')}`, 20, height * 0.55);

        // Display user's guess
        text(`Your guess: ${userGuess}`, 20, height * 0.65);

        if (gameState === 'feedback') {
            // Display feedback
            const correctComponents = nextToken.components.slice(0, depth);
            text(`Correct: ${correctComponents.join(', ')}`, 20, height * 0.7);
            text(`Round Score: ${score}`, 20, height * 0.75);
            text("Tap to continue", 20, height * 0.8);
        }
    } else if (gameState === 'gameOver') {
        // Display game over screen
        fill(fontcolor);
        textSize(32);
        text("Game Over!", width / 2 - 80, height / 2 - 50);
        textSize(24);
        text(`Final Score: ${totalScore}`, width / 2 - 60, height / 2 + 50);
        textSize(16);
        text("Tap to restart", width / 2 - 80, height - 50);
    }
    if (isMobile) {
        drawButtons();
    }
}
function drawButtons() {
    buttons.forEach(({button, x, y, w, h}) => {
        button.position(x, y);
        button.size(w, h);
    });
}
function touchStarted() {
    if (!playingbackground) {
        var audio = new Audio("audio/background.mp3");
        audio.loop = true;
        audio.play();
        playingbackground = true;
    }
    // Prevent default behavior on mobile
    return false;
}
function mousePressed() {
    if (gameState === 'feedback' || gameState === 'gameOver') {
        handleButtonPress('Enter');
    }
    // Prevent default behavior on mobile
    return false;
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (isMobile) {
        createMobileButtons();
    } else {
        buttons.forEach(({button}) => button.remove());
        buttons = [];
    }
}
function displayPreviousTokens() {
    const lineHeight = height * 0.04;
    let y = 20;
    const maxTokens = Math.floor((height * 0.4) / lineHeight);
    const startIndex = Math.max(0, currentTokenIndex - maxTokens + 1);

    for (let i = startIndex; i <= currentTokenIndex; i++) {
        const token = tokenList[i];
        fill(fontcolor);
        text(`${token.components.slice(0, depth).join(', ')} : ${token.token}`, 20, y);
        y += lineHeight;

        if (y > height * 0.45) {  // Prevent overflow
            text("...", 20, y);
            break;
        }
    }
}

function handleButtonPress(key) {
    if (gameState === 'guessing') {
        if (key >= '1' && key <= '8') {
            if (userGuess.length < depth) {
                userGuess += key;
            }
        } else if (key === 'Backspace') {
            userGuess = userGuess.slice(0, -1);
        } else if (key === 'Enter' && userGuess.length === depth) {
            checkGuess();
        }
    } else if (gameState === 'feedback') {
        nextToken();
    } else if (gameState === 'gameOver') {
        restartGame();
    }
}

function mousePressed() {
    if (gameState === 'feedback' || gameState === 'gameOver') {
        handleButtonPress('Enter');
    }
}

var playingbackground = false;
function touchStarted() {
    if (!playingbackground) {
        var audio = new Audio("audio/background.mp3");
        audio.loop = true;
        audio.play();
        playingbackground = true;
    }
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Remove old buttons and create new ones
    removeElements();
    createMobileButtons();
}

function checkGuess() {
    const nextToken = tokenList[currentTokenIndex + 1];
    const correctComponents = nextToken.components.slice(0, depth);
    const userGuessArray = userGuess.split('').map(Number);

    score = 0;
    let totalError = 0;

    for (let i = 0; i < depth; i++) {
        if (userGuessArray[i] === correctComponents[i]) {
            score++;
        }
        totalError += Math.abs(userGuessArray[i] - correctComponents[i]);
    }

    const mae = totalError / depth;
    totalScore += score;

    // Determine which audio file to play
    let audioIndex;
    if (mae === 0) {
        audioIndex = 0; // Perfect guess
    } else {
        // Map MAE to audio files 1-10
        // Assuming maximum possible MAE is 5 (difference between 1 and 6)
        audioIndex = Math.min(Math.ceil(mae * 2), 10);
    }

    playAudio(audioIndex);

    gameState = 'feedback';
}

function nextToken() {
    currentTokenIndex++;
    userGuess = '';
    if (currentTokenIndex >= tokenList.length - 1) {
        gameState = 'gameOver';
    } else {
        gameState = 'guessing';
    }
}

function restartGame() {
    currentTokenIndex = 0;
    score = 0;
    totalScore = 0;
    userGuess = '';
    gameState = 'guessing';
    var tokenList = tokenLists[Math.floor(Math.random()*tokenLists.length)];

}
