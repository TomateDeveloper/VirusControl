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
 * This is the screen that will be displayed while drawing is executing
 * @type {number}
 */
let screen = 0;
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
/**
 * Will loop countdown only if active
 * @type {boolean}
 */
let activeTimer = false;

/*
    Assets
 */
let logo;
let canvas;

/*
    P5.JS Functions
 */
function preload() {
    logo = loadImage('img/logo.png');
}

function setup() {
    canvas = createCanvas(600, 400);
}

function draw() {
    switch (screen) {
        case 1: {
            background(96, 157, 255);
            showScore();
            showTimer();
            break;
        }
        default: {
            playScreen();
            break;
        }
    }

    if (activeTimer) {
        if (frameCount % 60 === 0 && timer > 0) timer --;
        if (timer < 1) timerOut();
    }
}

function mousePressed() {

    registeredButtons.forEach((button) => {
        if (mouseX > button.x && mouseX < (button.x + button.w) && mouseY > button.y && mouseY < (button.y + button.h)) {
            button.click();
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
            text(this.text, this.x + (this.w / 2), this.y + (this.h / 2));
        } else {
            fill(this.color);
            rect(this.x, this.y, this.w, this.h);
            fill(this.hovered);
            text(this.text, this.x + (this.w / 2), this.y + (this.h / 2));
        }
    }

    click() {}
}

/*
    Levels and screens
 */

function playScreen() {
    background(96, 157, 255);
    fill(255);
    logo.resize(200, 0);
    image(logo, 200, 80);

    const hoverStart = new HoverButton('startButton',200, 270, 200, 30, '#ffffff', '#000000', '¡Jugar!');
    hoverStart.click = function () {
        screen = 1;
        clearButtons();
        clear();
    }
}

function showScore() {
    fill("#000000");
    textSize(30);
    text("Puntaje: " + score, 15, 40);
}

function showTimer() {
    let seconds = (timer % 60);
    if (seconds === 0) seconds = '00';

    fill("#000000");
    textSize(30);
    text((timer % 3600) / 60 + ":" + seconds, 450, 40);
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

/*
    Gameplay functions
 */

function clearButtons() {
    registeredButtons = [];
}
