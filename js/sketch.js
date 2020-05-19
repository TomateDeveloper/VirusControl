/*
    Virus Control Game - Created by Ian Castaño - Diego Hernández - Daniel Rey
    Table of contents:

    1. Base variables
    2. Assets
    3. P5.js Functions
    4. Classes
    5. Levels and screens
    6. Gameplay functions
 */

/*
    Base variables
 */

/**
 * This array will store all the registered hover buttons once
 * @see HoverButton
 * @type {Array}
 */
let registeredButtons = [];
/**
 * This array will store all the registered virus just once
 * @type {Array}
 */
let registeredVirus = [];
/**
 * This will be the variable that stores the actual level. If null shall play main menu
 */
let level = null;
/**
 * Check if lose screen is active
 */
let playAgain = false;
/**
 * This is the score of every level
 * @type {number}
 */
let score = 0;
/**
 * This is the timer of every level
 * @type {number}
 */
let timer = 120;
let spawnRate = 0;
/**
 * Will loop countdown only if active
 * @type {boolean}
 */
let activeTimer = false;
let drawCircle = true;

/*
    Assets
 */
let logo;
let hands;
let canvas;
let levels = [];
let viritusSprite = [];
let malvavirusSprite = [];
let coronaChanSprite = [];

let playScreenBG;
let playAgainBG;
let uiFont;
let timerUI;
let scoreUI;
let stage1;
let stage2;
let stage3;
let laserEffect;

let mainSound;
let level1Sound;
let level2Sound;
let level3Sound;

/*
    P5.JS Functions
 */
function preload() {
    hands = loadImage('img/manitas.png');
    logo = loadImage('img/logo.png');
    scoreUI = loadImage('img/ui/1.png');
    timerUI = loadImage('img/ui/2.png');
    uiFont = loadFont('font/nickson_one.ttf');
    mainSound = loadSound('sounds/main.mp3');
    laserEffect = loadSound('sounds/shot.mp3');
    level1Sound = loadSound('sounds/level_3.mp3');
    level2Sound = loadSound('sounds/level_3.mp3');
    level3Sound = loadSound('sounds/level_3.mp3');
    viritusSprite[0] = loadImage('sprites/viritus/viritus_1.png');
    viritusSprite[1] = loadImage('sprites/viritus/viritus_2.png');
    malvavirusSprite[0] = loadImage('sprites/malvavirus/1.png');
    malvavirusSprite[1] = loadImage('sprites/malvavirus/2.png');
    coronaChanSprite[0] = loadImage('sprites/coronachan/1.png');
    coronaChanSprite[1] = loadImage('sprites/coronachan/2.png');
    playScreenBG = loadImage('img/playscreen.png');
    playAgainBG = loadImage('img/playAgain.png');
    stage1 = loadImage('img/background/ws1.png');
    stage2 = loadImage('img/background/ws1.png');
    stage3 = loadImage('img/background/ws1.png');
}

function setup() {
    canvas = createCanvas(600, 400);
    levels[0] = new Level("cityOne", [0, 20], stage1, 5, 60, 2, level1Sound);
    levels[1] = new Level("cityTwo", [0, 55], stage2, 180, 30, 5, level2Sound);
    levels[2] = new Level("cityThree", [30, 80], stage3, 180, 60, 4, level3Sound);
}

function draw() {
    if (playAgain) {
        playAgainScreen();
    } else if (level == null) {
        playScreen();
    } else {
        textFont(uiFont);
        level.generateBackground();
        showScore();
        showTimer();
        level.draw();
        cursor('none');
        image(hands, (mouseX - 30), (mouseY - 30), 60, 60);
    }

    if (activeTimer) {
        if (frameCount % 60 === 0 && timer > 0) timer --;
        if (timer < 1) timerOut();
    }

    if (spawnRate > 0) {
        if (frameCount % 60 === 0) {
            spawnRate --;
        }
    } else if (level != null) {
        level.generateRate();
    }

    if (frameCount % 30 === 0) registeredVirus.forEach((virus) => {
        virus.changeFrame();
    });

}

function mousePressed() {
    registeredButtons.forEach((button) => {
        if (mouseX > button.x && mouseX < (button.x + button.w) && mouseY > button.y && mouseY < (button.y + button.h)) {
            button.click();
        }
    });

    registeredVirus.forEach((virus) => {
        const leftTop = (virus.x - (virus.radius / 2));
        const rightTop = leftTop + virus.radius;
        const leftBottom = (virus.y - (virus.radius / 2));
        const rightBottom = leftBottom + virus.radius;

       if (mouseX > leftTop && mouseX < rightTop && mouseY > leftBottom && mouseY < rightBottom) {
           virus.click();
           laserEffect.play();
       }
    });

}

/*
    Classes
 */
class HoverButton {

    constructor(id, x, y, w, h, color, hovered, text) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.hovered = hovered;
        this.text =  text;
        this.registerListener(id);
        this.create();
    }

    create() {
        this.colorize(mouseX > this.x && mouseX < (this.x + this.w) && mouseY > this.y && mouseY < (this.y + this.h));
    }

    registerListener(id) {
        if (!registeredButtons.some((button) => button.id === id)) {
            registeredButtons.push(this);
        }
    }

    colorize(hovered) {
        noStroke();
        if (hovered) {
            fill(this.hovered);
            rect(this.x, this.y, this.w, this.h);
            fill(this.color);
            text(this.text, this.x + (this.w / 2) - 20, this.y + (this.h / 2) + 4);
        } else {
            fill(this.color);
            rect(this.x, this.y, this.w, this.h);
            fill(this.hovered);
            text(this.text, this.x + (this.w / 2) - 20, this.y + (this.h / 2) + 4);
        }
    }

    click() {}
}

class Virus {

    constructor(id, speed, radius, x, y, health, score, sprites) {
        this.id = id;
        this.xSpeed = speed;
        this.ySpeed = speed;
        this.x = x;
        this.radius = radius;
        this.y = y;
        this.health = health;
        this.score = score;
        this.sprites = sprites;
        this.actualFrame = 0;
        this.registerListener(id);
    }

    draw() {

        this.drawSprite();
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.x > width - this.radius || this.x < this.radius) this.xSpeed = -this.xSpeed;
        if (this.y > height - this.radius || this.y < this.radius) this.ySpeed = -this.ySpeed;

    }

    registerListener(id) {
        if (!registeredVirus.some((button) => button.id === id)) {
            registeredVirus.push(this);
        }
    }

    click() {
        this.health--;
        if (this.health < 1) {
            if (level !== null) level.killVirus();
            registeredVirus = registeredVirus.filter((virus) => virus.id !== this.id);
            addScore(this.score);
        }
    }

    drawSprite() {
        image(this.sprites[this.actualFrame], (this.x - (this.radius / 2)), (this.y - (this.radius / 2)), this.radius, this.radius);
    }

    changeFrame() {
        this.actualFrame++;
        if (this.actualFrame > (this.sprites.length - 1)) this.actualFrame = 0;
    }

}

class Level {

    constructor(id, difficulty, background, time, virusCount, spawnRate, sound) {
        this.id = id;
        this.difficulty = difficulty;
        this.background = background;
        this.time = time;
        this.virusCount = virusCount;
        this.remainingVirus = virusCount;
        this.spawnRate = spawnRate;
        this.sound = sound;
    }

    initializeLevel() {
        activeTimer = true;
        timer = this.time;
        this.sound.play();
    }

    draw() {
        registeredVirus.forEach((virus) => {
            virus.draw();
        });
    }

    generateRate() {
        if (this.virusCount > 0) {
            spawnVirus();
            spawnRate = this.spawnRate;
            this.virusCount--;
        }
    }

    generateBackground() {
        image(this.background, 0, 0, width, height);
    }

    killVirus() {
        this.remainingVirus--;
        if (this.remainingVirus < 1) this.levelVictory();
    }

    levelVictory() {
        console.log("Ganaste el nivel");
    }

}

/*
    Levels and screens
 */

function playScreen() {
    if (!mainSound.isPlaying()) mainSound.play();
    image(playScreenBG, 0, 0, width, height);
    fill(255);
    logo.resize(200, 0);
    image(logo, 185, 80);

    const hoverStart = new HoverButton('startButton',185, 270, 200, 30, '#479A78', '#ffffff', '¡Jugar!');
    hoverStart.click = function () {
        level = levels[0];
        level.initializeLevel();
        clearButtons();
        stopSounds();
        clear();
    }
}

function playAgainScreen() {
    image(playAgainBG, 0, 0, width, height);
    fill(255);

    const hoverStart = new HoverButton('replayButton',185, 270, 200, 30, '#479A78', '#ffffff', '¡Volver a jugar!');
    hoverStart.click = function () {
        level = levels[0];
        level.initializeLevel();
        playAgain = false;
        clearButtons();
        stopSounds();
        clear();
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function showScore() {
    image(scoreUI, 30, 10, 150, 50);
    fill("#6b2600");
    textSize(30);
    text("Puntaje: " + score, 53, 43);
}

function showTimer() {
    let minutes = Math.floor(timer / 60);
    let seconds = Math.floor(timer % 60);
    if (seconds === 0) seconds = '00';

    fill("#6b2600");
    textSize(32);

    image(timerUI, 380, 10, 150, 50);
    text(minutes + ":" + seconds, 440, 42);
}

/*
    Gameplay functions
 */

function clearButtons() {
    registeredButtons = [];
}

function spawnVirus() {

    const virusX = getRandomArbitrary(40, (width - 40));
    const virusY = getRandomArbitrary(40, (height - 40));

    let probability = Math.floor(Math.random() * (+level.difficulty[1] - +level.difficulty[0])) + +level.difficulty[0];

    if (probability > 50) {
        new Virus(registeredVirus.length + 1, .5, 80, virusX, virusY, 6, 60,
            coronaChanSprite
        );
    } else if (probability < 50 && probability > 20) {
        new Virus(registeredVirus.length + 1, .5, 80, virusX, virusY, 3, 30,
            malvavirusSprite
        );
    } else {
        new Virus(registeredVirus.length + 1, .5, 80, virusX, virusY, 1, 10,
            viritusSprite
        );
    }
}

function stopSounds() {
    mainSound.stop();
    if (level.sound) level.sound.stop();
}

function addScore(n) {
    score +=  n;
}

function removeScore(n) {
    score -= n;
}

function resetScore() {
    score = 0;
}

function timerOut() {
    playAgain = true;
    level = null;
    registeredVirus = [];
    textFont('Helvetica');
    textSize(10);
    cursor('default');
}


