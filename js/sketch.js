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

/*
    Assets
 */
let logo;
let hands;
let canvas;
let levels = [];
let viritusSprite = [];

let playScreenBG;
let stage1;

/*
    P5.JS Functions
 */
function preload() {
    hands = loadImage('img/manitas.png');
    logo = loadImage('img/logo.png');
    viritusSprite[0] = loadImage('sprites/viritus/viritus_1.png');
    viritusSprite[1] = loadImage('sprites/viritus/viritus_2.png');

    playScreenBG = loadImage('img/playscreen.png');
    stage1 = loadImage('img/background/ws1.png');
}

function setup() {
    canvas = createCanvas(600, 400);
    levels[0] = new Level("cityOne", 10, stage1, 120, 20, 3);
    levels[1] = new Level("cityTwo", 30, "TODO", 180, 30, 5);
    levels[2] = new Level("cityThree", 50, "TODO", 180, 60, 4);
}

function draw() {
    if (playAgain) {

    } else if (level == null) {
        playScreen();
    } else {
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

    if (frameCount % 60 === 0) registeredVirus.forEach((virus) => {
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

       if (mouseX > leftTop && mouseX < rightTop && mouseY > leftBottom && mouseY < rightBottom) virus.click();
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

    constructor(id, difficulty, background, time, virusCount, spawnRate) {
        this.id = id;
        this.difficulty = difficulty;
        this.background = background;
        this.time = time;
        this.virusCount = virusCount;
        this.remainingVirus = virusCount;
        this.spawnRate = spawnRate;
    }

    initializeLevel() {
        activeTimer = true;
        timer = this.time;
    }

    draw() {
        registeredVirus.forEach((virus) => {
            virus.draw();
        });
    }

    generateRate() {
        if (this.virusCount > 0) {
            spawnVirus("viritus");
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
    image(playScreenBG, 0, 0, width, height);
    fill(255);
    logo.resize(200, 0);
    image(logo, 185, 80);

    const hoverStart = new HoverButton('startButton',185, 270, 200, 30, '#479A78', '#ffffff', '¡Jugar!');
    hoverStart.click = function () {
        level = levels[0];
        level.initializeLevel();
        clearButtons();
        clear();
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function showScore() {
    fill("#000000");
    textSize(30);
    text("Puntaje: " + score, 15, 40);
}

function showTimer() {
    let minutes = Math.floor(timer / 60);
    let seconds = Math.floor(timer % 60);
    if (seconds === 0) seconds = '00';

    fill("#000000");
    textSize(30);
    text(minutes + ":" + seconds, 450, 40);
}

/*
    Gameplay functions
 */

function clearButtons() {
    registeredButtons = [];
}

function spawnVirus(probability) {

    const virusX = getRandomArbitrary(40, (width - 40));
    const virusY = getRandomArbitrary(40, (height - 40));

    switch (probability) {
        case "malvavirus": {
            new Virus(registeredVirus.length + 1, .5, 80, virusX, virusY, 1, 10,
                viritusSprite
            );
            break;
        }
        case "corona_chan": {
            new Virus(registeredVirus.length + 1, .5, 80, virusX, virusY, 1, 10,
                viritusSprite
            );
            break;
        }
        default: {
            new Virus(registeredVirus.length + 1, .5, 80, virusX, virusY, 1, 10,
                viritusSprite
            );
            break;
        }
    }
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
    //TODO: Time out :))
}


