/* Programmer: Felipe De Castro Veras
 *
 * app.js
 * 
 * This file provides the the Player and the Enemy classes, as well as the Rock and Gem classes. 
 * The constructor class, has the x and y coordinates properties, the URL for the image of the sprite,
 * and the speed (in the case of the Enemy). The Gem has an additional points and rend properties.
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
// The gems in the game give extra points to the player when collected 
var Gem = function() {
    this.x = 0;
    this.y = 0;
    this.sprite = '';
    this.points = 0;
    this.rend = false;
};

// This function updates the placement of the gem instance, its value (in points) and image.
Gem.prototype.update = function() {
    // Calculates a random place for the gem to appear
    this.x = 101 * getRandNum(1, 7);
    this.y = 78 * getRandNum(2, 4);
    var imagesArray = [
        'images/gem-blue-s.png', //Small size gem
        'images/gem-green-s.png', //Small size gem
        'images/gem-orange-s.png' //Small size gem
    ];
    var pointsArray = [150, 250, 350]; //It gives different points to each type of gem.
    if (this.rend) {
        var x = getRandNum(0, 3); // To select a random gem color
        this.points = pointsArray[x];
        this.sprite = imagesArray[x];
    }
};

// This function renders the gem instance on the canvas depending on the rend property (boolean). 
Gem.prototype.render = function() {
    if (this.rend) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

// Rocks make the game more difficult, since the player can't walk
// through them, they must be circumvented
var Rock = function() {
    this.x = 0;
    this.y = 0;
    this.sprite = 'images/Rock.png';
};

Rock.prototype.update = function() {
    // Calculate a random place for the rocks. 
    for (var rock in allRocks) {
        var n = (rock*1);
        allRocks[rock].x = 101 * getRandNum(1, 7);
        allRocks[rock].y = 74 * getRandNum(2, 4);
    }
};

Rock.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Enemies our player must avoid
var Enemy = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.sprite = 'images/enemy-bug.png';
};

// Updates the enemy's position, required method for game
// Parameter: dt, is a time var that controls the speed of the enemies
Enemy.prototype.update = function(dt) {
    // The var dt combined with the speed, controls the movement of each enemy
    if (dt % this.speed == 0) { // This will control how fast the enemy moves
        if (this.x < 707) {
            this.x = this.x + 10;
            //this.x = this.x + 101;
        } else {
            // If the enemy reaches the end (right side) it will start at the
            // left side with a different speed. 
            this.x = enemyStart[getRandNum(0, 3)];  
            this.speed = getRandNum(1, 3);
        }
    }
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The player class.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.x = 3*101;
    this.y = (6*83)-41;

};

// The player movement is control by the handleInput method
Player.prototype.update = function() {  
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The handleInput will verify which key was pressed and it will move the character accordingly.
// Also the handleInput will control that the player don't step onto a rock by calling the 
// check4Rock function. 
Player.prototype.handleInput = function(k) {
    //console.log(!check4Rock(allRocks));
    switch(k) {
        case 'up':
            if (this.y - 83 >= -83 && !check4Rock(allRocks, this.x, this.y-83)) {
                this.y = this.y - 83;
            } 
            break;
        case 'down':
            if (this.y + 83 <= 500 && !check4Rock(allRocks, this.x, this.y+83)) {
                this.y = this.y + 83;
            }
            break;
        case 'left':
            if (this.x - 101 >= 0 && !check4Rock(allRocks, this.x-101, this.y)) {
                this.x = this.x - 101;
            }
            break;
        case 'right':
            if (this.x + 101 <= 606 && !check4Rock(allRocks, this.x+101, this.y)) {
                this.x = this.x + 101;
            }
            break;
    }
};

// These lines will instantiate the Player, Enemies, Rocks and Gem (only one gem is actually needed).
// All enemy objects are contain in an array called allEnemies, all rocks in allRocks.
// The player object is in a variable called player ans the gem object is in gem.
var player = new Player();
var allEnemies = [];
var enemyStart = [0, -101, -202, -303]; // to make sure that the enemies don't start all at the same time.
var numberOfEnemies = 5; // This variable controls how many enemies the game will have
for (var i = 0; i < numberOfEnemies; i++) { // only 5 enemies are created
    allEnemies.push(new Enemy);
}

// This for-loop assigns the property of each enemy. 
// The starting point and speed are random. 
for (var enemy in allEnemies) {
    var row = (parseInt(enemy)+1 < 5)? (parseInt(enemy)+1) : getRandNum(1, 5); // to make sure that each row has at least one bug
    allEnemies[enemy].y = row * 83;
    allEnemies[enemy].x = enemyStart[getRandNum(0, 4)];
    allEnemies[enemy].speed = getRandNum(1, 3);
}

// Creates the rock objects and place them in an array of rocks.
var allRocks = [];
var numberOfRocks = 3; // This variable controls how many rocks the game will have
for (var i = 0; i < numberOfRocks; i++) {
    allRocks.push(new Rock);
}
allRocks.forEach(function(rock) {
    rock.update();
});

// A single gem object is needed
var gem = new Gem();

// This function checks if the player is trying to step onto a rock with next movement
// It takes as a parameter the rocks array and the x and y coordinates of the player next move
function check4Rock(rocksArray, px, py) {
    for (var rock in rocksArray) {
        var sx = px - 20,
            sy = (py+31) - 20,
            ix = px + 20,
            iy = (py+31) + 20;        
        if (((rocksArray[rock].x >= sx) && (rocksArray[rock].y >= sy)) && 
                ((rocksArray[rock].x <= ix) && (rocksArray[rock].y <= iy))) {
            return true;
        }
    }
    return false;
};

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
    var id = "img"+(i+1);
    var html = '<img class="img" id="' + id + '" src="" width="101" height="171">';
    $('.imgDiv').append(html);
    var elemClass = "#"+id;
    $(elemClass).attr('src', charImages[i]);
}

/* These lines  of code will load the images from the DOM and draw them in the canvas when 
 * the browser is ready (with out modifying the original size of the image).
 * A second canvas is used, instead of the <img> tags, because we don't want to display the whole image.
 */
$( window ).load(function() {
    for (var i = 0; i < charImages.length; i++) {
        var id = "img"+(i+1);
        var image = document.getElementById(id); 
        context.drawImage(image, 11, 54, 80, 98, 10, (98*i), 80, 98);
    }
});

// This function will get the x and y coordinates of the mouse in the second canvas for selecting the avatar
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
};

// This event listener is called when the user clicks on an image in the canvas 
c.addEventListener('mousedown', function(evt) {
    var mousePos = getMousePos(c, evt);
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    checkImgClicked(mousePos.x, mousePos.y);
    console.log(message); // The x and y position are log in the console
}, false);

// Changes the URL in the player's property sprite according to the image that was clicked 
function checkImgClicked(x,y) {
    for (var i = 0; i < charImages.length; i++) {
        if (((x >= 10) && (y >= (100*i))) && ((x <= 90) && (y <= 105+(105*i)))) {
            player.sprite = charImages[i];
        }        
    }
};

// Utility function. Returns a random number (for the starting point) between min (inclusive) and max (exclusive)
function getRandNum(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

// This function controls the messages shown to the user at the bottom of the game canvas
function displayMessage(message) {
    document.getElementById("status").innerHTML = message;
}; 

// This listens for key presses (using kibo JS Library) and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
var k = new Kibo();
document.addEventListener('keyup', function(e) {
    player.handleInput(k.lastKey());    
});


 

