var tokenList = tokenLists[Math.floor(Math.random()*tokenLists.length)];

let currentTokenIndex = 0;
let depth = 4;
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

function setup() {
    createCanvas(800, 600);
    textAlign(LEFT, TOP);
    textSize(16);
    textFont('Courier New');
    preload();
    
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
        text(`Current token: ${currentToken.token}`, 20, 300);
        text(`Components: ${currentToken.components.slice(0, depth).join(', ')}`, 20, 330);

        // Display user's guess
        text(`Your guess: ${userGuess}`, 20, 380);

        // Display instructions
        text("Type numbers 1-8 and press Enter to submit", 20, height - 50);

        if (gameState === 'feedback') {
            // Display feedback
            const correctComponents = nextToken.components.slice(0, depth);
            text(`Correct components: ${correctComponents.join(', ')}`, 20, 420);
            text(`Round Score: ${score}`, 20, 450);
            text("Press any key to continue", 20, 480);
        }
    } else if (gameState === 'gameOver') {
        // Display game over screen
        fill(fontcolor);
        textSize(32);
        text("Game Over!", width / 2 - 80, height / 2 - 50);
        textSize(24);
        text(`Final Score: ${totalScore}`, width / 2 - 60, height / 2 + 50, '/', depth * tokenList.length);
        textSize(16);
        text("Press any key to restart", width / 2 - 80, height - 50);
    }
}

function displayPreviousTokens() {
    const lineHeight = 25;
    let y = 20;
    if (currentTokenIndex<8) {
        for (let i = 0; i <= currentTokenIndex; i++) {
            const token = tokenList[i];
            fill(fontcolor);
            text(`${token.components.slice(0, depth).join(', ')} : ${token.token}`, 20, y);
            y += lineHeight;

            if (y > 280) {  // Prevent overflow
                text("...", 20, y);
                break;
            }
        }
    }
    else {
        for (let i = currentTokenIndex-8; i <= currentTokenIndex; i++) {
            const token = tokenList[i];
            fill(fontcolor);
            text(`${token.components.slice(0, depth).join(', ')} : ${token.token}`, 20, y);
            y += lineHeight;

            if (y > 280) {  // Prevent overflow
                text("...", 20, y);
                break;
            }
        }
    }
}

// var playingbackground = false;
function keyPressed() {
    // if (playingbackground!=true) {
    //     var audio = new Audio("audio/background.mp3");
        // audio.loop = true; //loop
        // audio.play(); //play
        // playingbackground = true;
    // }
    if (gameState === 'guessing') {
        if (key >= '1' && key <= '6') {
            userGuess += key;
        } else if (keyCode === BACKSPACE) {
            userGuess = userGuess.slice(0, -1);
        } else if (keyCode === ENTER && userGuess.length === depth) {
            checkGuess();
        }
    } else if (gameState === 'feedback') {
        nextToken();
    } else if (gameState === 'gameOver') {
        restartGame();
    }
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
