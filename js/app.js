/* Programmer: Felipe De Castro Veras
 *
 * app.js
 *
 * This file provides the the Player and the Enemy classes, as well as the Rock and Gem classes.
 * The the URL for the image of the sprite, and the x and y coordinates properties are inherited
 * from the Superclass.
 *
 * Also we added a Superclass called GameObject, which has three properties that Player, Enemies, Rocks
 * and Gems share, as well as a Render method.
 *
 * When the app.js is called for the first time, it instantiate the Player, Enemy, Rock and Gem classes.
 * After that, the engine.js will call the update and render methods during the game.
 *
 * The app.js also controls the movements of the player and the enemies in the canvas and it uses
 * second canvas to display the different avatars that are available to the user.
 *
 * For support it uses the Kibo JS library to control user inputs.
 *
 */
"use strict";
// A Superclass for shared properties and methods
var GameObject = function () {
    this.x = 0;
    this.y = 0;
    this.sprite = "";
};

// This method will be used by all Game Objects (Player, Enemies, Rocks and Gems)
GameObject.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The gems in the game give extra points to the player when collected
var Gem = function () {
    GameObject.call(this);
    this.points = 0;
    this.rend = false;
};

Gem.prototype = Object.create(GameObject.prototype);
Gem.prototype.constructor = Gem;

/* This function is called by main in engine.js. It checks if the player has collected a gem:
 * the player can collect a gem by "stepping" in the same space as the gem.
 * If a "gem collected" is detected, the function returns true, if not, it returns false.
 */
Gem.prototype.checkGem = function () {
    var sx = player.x - 20,
        sy = (player.y) - 20,
        ix = player.x + 20,
        iy = (player.y) + 20;

    if (((this.x >= sx) && (this.y >= sy)) &&
        ((this.x <= ix) && (this.y <= iy))) {
        return true;
    }
    return false;
};

// This function updates the placement of the gem instance, its value (in points) and image.
Gem.prototype.update = function () {
    // Calculates a random place for the gem to appear
    this.x = 101 * getRandNum(1, 7);
    this.y = 78 * getRandNum(2, 4);
    var imagesArray = [
        'images/gem-blue-s.png', //Small size gem
        'images/gem-green-s.png', //Small size gem
        'images/gem-orange-s.png' //Small size gem
    ];
    var pointsArray = [150, 250, 350]; //It gives different points to each type of gem.
    var x = getRandNum(0, 3); // To select a random gem color
    this.points = pointsArray[x];
    this.sprite = imagesArray[x];
};

// Rocks make the game more difficult, since the player can't walk
// through them, they must be circumvented
var Rock = function () {
    GameObject.call(this);
    this.sprite = 'images/Rock.png';
};

Rock.prototype = Object.create(GameObject.prototype);
Rock.prototype.constructor = Rock;

Rock.prototype.update = function () {
    this.x = 101 * getRandNum(1, 7);
    this.y = 74 * getRandNum(2, 4);
};

// This function checks if the player is trying to step onto a rock with next movement
// It takes as a parameter the rocks array and the x and y coordinates of the player next move
Rock.prototype.check4Rock = function (px, py) {
    for (var i = 0; i < allRocks.length; i++) {
        var sx = px - 20,
            sy = (py) - 20,
            ix = px + 20,
            iy = (py) + 20;
        if (((allRocks[i].x >= sx) && (allRocks[i].y >= sy)) &&
            ((allRocks[i].x <= ix) && (allRocks[i].y <= iy))) {
            return true;
        }
    }
    return false;
};

// Enemies our player must avoid
var Enemy = function (row, start) {
    GameObject.call(this);
    this.speed = getRandNum(1, 3);
    this.sprite = 'images/enemy-bug.png';
    row = 66 + (row * 81);
    this.y = row;
    this.x = start;
};

Enemy.prototype = Object.create(GameObject.prototype);
Enemy.prototype.constructor = Enemy;

// Updates the enemy's position, required method for game
// Parameter: dt, is a time var that controls the speed of the enemies
Enemy.prototype.update = function (dt) {
    // The var dt combined with the speed, controls the movement of each enemy
    if (dt % this.speed === 0) { // This will control how fast the enemy moves
        if (this.x < 707) {
            this.x = this.x + 10;
        } else {
            // If the enemy reaches the end (right side) it will start at the
            // left side with a different speed.
            this.x = enemyStart[getRandNum(0, 3)];
            this.speed = getRandNum(1, 3);
        }
    }
};

// The player class.
var Player = function () {
    GameObject.call(this);
    this.sprite = 'images/char-boy.png';
    this.x = 3 * 101;
    this.y = (6 * 81);
};

Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

// The player movement is control by the handleInput method
Player.prototype.update = function () {};

/* This function is called by main in engine.js. It checks for a collision:
 * when two entities (the player and a bug) occupy the same space.
 * If a collision is detected it returns true, if not, it returns false.
 */
Player.prototype.checkCollisions = function () {
    for (var i = 0; i < allEnemies.length; i++) {
        // to give a more realistic look, the following variables creates a specific space occupy
        // by the player and it then compares that with the space occupy by the bugs.
        var sx = this.x - 35,
            sy = (this.y) - 20,
            ix = this.x + 35,
            iy = (this.y) + 20;

        if (((allEnemies[i].x >= sx) && (allEnemies[i].y >= sy)) &&
            ((allEnemies[i].x <= ix) && (allEnemies[i].y <= iy))) {
            return true;
        }
    }
    return false;
};

/* This function is called by main. It checks if the player has won the game:
 * the player win by reaching the top row without colliding with any bug.
 * If a "win" is detected, the function returns true, if not, it returns false.
 */
Player.prototype.checkWin = function () {
    if (this.y == -12) {
        return true;
    }
    return false;
};

// The handleInput will verify which key was pressed and it will move the character accordingly.
// Also the handleInput will control that the player don't step onto a rock by calling the
// check4Rock function.
Player.prototype.handleInput = function (k) {
    //console.log(!check4Rock(allRocks));
    switch (k) {
    case 'up':
        if (this.y - 83 >= -83 && !allRocks[0].check4Rock(this.x, this.y - 83)) {
            this.y = this.y - 83;
        }
        break;
    case 'down':
        if (this.y + 83 <= 500 && !allRocks[0].check4Rock(this.x, this.y + 83)) {
            this.y = this.y + 83;
        }
        break;
    case 'left':
        if (this.x - 101 >= 0 && !allRocks[0].check4Rock(this.x - 101, this.y)) {
            this.x = this.x - 101;
        }
        break;
    case 'right':
        if (this.x + 101 <= 606 && !allRocks[0].check4Rock(this.x + 101, this.y)) {
            this.x = this.x + 101;
        }
        break;
    }
};

// These lines will instantiate the Player, Enemies, Rocks and Gem (only one gem is actually needed).
// All enemy objects are contain in an array called allEnemies, all rocks in allRocks.
// The player object is in a variable called player ans the gem object is in gem.
var gem = new Gem();
var player = new Player();
var allEnemies = [];
var numberOfEnemies = 5; // This variable controls how many enemies the game will have
for (var i = 0; i < numberOfEnemies; i++) {
    var enemyStart = [0, -101, -202, -303]; // to make sure that the enemies don't start all at the same time.
    var row = (parseInt(i) < 4) ? parseInt(i) : getRandNum(1, 4); // to make sure that each row has at least one bug
    allEnemies.push(new Enemy(row, enemyStart[i]));
}

// Creates the rock objects and place them in an array of rocks.
var allRocks = [];
var numberOfRocks = 3; // This variable controls how many rocks the game will have
for (var i = 0; i < numberOfRocks; i++) {
    allRocks.push(new Rock());
    allRocks[i].update();
}

// This section will created a second canvas to place the avatars available for the player
// The user will be able to pick a different avatar by clicking on it.
var c = document.getElementById('canvas1');
var context = c.getContext("2d");

var charImages = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

// This for-loop will go through the character images array and will place them in the DOM.
for (var i = 0; i < charImages.length; i++) {
    var id = "img" + (i + 1);
    var html = '<img class="img" id="' + id + '" src="" width="101" height="171">';
    $('.imgDiv').append(html);
    var elemClass = "#" + id;
    $(elemClass).attr('src', charImages[i]);
}

/* These lines  of code will load the images from the DOM and draw them in the canvas when
 * the browser is ready (with out modifying the original size of the image).
 * A second canvas is used, instead of the <img> tags, because we don't want to display the whole image.
 */
$(window).load(function () {
    for (var i = 0; i < charImages.length; i++) {
        var id = "img" + (i + 1);
        var image = document.getElementById(id);
        context.drawImage(image, 11, 54, 80, 98, 10, (98 * i), 80, 98);
    }
});

// This function will get the x and y coordinates of the mouse in the second canvas for selecting the avatar
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// This event listener is called when the user clicks on an image in the canvas
c.addEventListener('mousedown', function (evt) {
    var mousePos = getMousePos(c, evt);
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    checkImgClicked(mousePos.x, mousePos.y);
    console.log(message); // The x and y position are log in the console
}, false);

// Changes the URL in the player's property sprite according to the image that was clicked
function checkImgClicked(x, y) {
    for (var i = 0; i < charImages.length; i++) {
        if (((x >= 10) && (y >= (100 * i))) && ((x <= 90) && (y <= 105 + (105 * i)))) {
            player.sprite = charImages[i];
        }
    }
}

// Utility function. Returns a random number (for the starting point) between min (inclusive) and max (exclusive)
function getRandNum(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

// This function controls the messages shown to the user at the bottom of the game canvas
function displayMessage(message) {
    document.getElementById("status").innerHTML = message;
}

// This listens for key presses (using kibo JS Library) and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
var k = new Kibo();
document.addEventListener('keyup', function (e) {
    player.handleInput(k.lastKey());
});