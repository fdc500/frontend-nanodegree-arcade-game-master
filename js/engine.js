/* Programmer: Felipe De Castro Veras
 *
 * engine.js
 *
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * Some modifications were made to the original engine.js, to provide better control over the
 * drawn of the canvas, when the player is caught by a bug, or when the player wins by reaching
 * the top row (water) or when the player picks a gem. Also a center-screen message was added to the
 * game, for the above mentioned situations.
 *
 * In addition a timer and score information (games won and lost, and points) were added to the
 * game, in engine.js, that is automatically updated in the DOM.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
"use strict";
// Declaring global variables for the score (game won and lost) and the points.
var scoreWon = 0,
    scoreLost = 0,
    points = 0;
var Engine = (function (global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d');
    var lastTime = Date.now();
    var mc = doc.getElementById("maincanvas"); // to control where the canvas is placed in the DOM

    canvas.width = 707;
    canvas.height = 670;
    mc.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var idFrame; // declaring a var to control be able to stop the canvas animation
        var now = Date.now();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        var dt = now - lastTime;

        // Display timer and score in the browser
        document.getElementById("time").innerHTML = "Time: " + timer(dt);
        document.getElementById("score").innerHTML =
            "Score: " + scoreWon + " W /" + " " + scoreLost + " L - " + "Points: " + points;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        // Verify if the player collided with a bug or if the player has reached the top row
        // or if the player has collected a gem. All conditions are stored in boolean variables.
        var collided = player.checkCollisions();
        var won = player.checkWin();
        var collect = gem.checkGem();

        // If a gem is collected by the player, the boolean variable must be reset to the false
        // value, the current instance of the gem object must be taken from the visible area
        // of the canvas and the corresponding points must be awarded to the player.
        if (collect) {
            collect = false;
            displayMessage("Gem Collected: " + gem.points + " points");
            points = points + gem.points;
            gem.x = -101;
        }

        /* Use the browser's requestAnimationFrame function to call this function again
         * as soon as the browser is able to draw another frame. Also it cancel the
         * requestAnimationFrame when a collision or a Win (player reaching top row)
         * is detected and shows a Game Over! or You Won! message that last 3 seconds
         * (3000 milliseconds), before reseting the game.
         * If the player wins the game, it will call the Rock Update method, to change
         * the placement of the rocks, and randomly generate a gem roughly 50% of the time,
         * for the next game.
         */
        if (collided) {
            collided = false;
            scoreLost++; // Adds one to the Game Lost counter
            points = points - 100; // Subtracts points to the overall score
            displayMessage("Game Over!");
            showCenterMessage("Game Over!");
            cancelAnimationFrame(idFrame);
            setTimeout(function () {
                reset();
            }, 3000);
        } else if (won) {
            won = false;
            scoreWon++; // Adds one to the Game won counter
            points = points + 100; // Adds points to the overall score
            displayMessage("YOU WON!");
            showCenterMessage("YOU WON!");
            cancelAnimationFrame(idFrame);
            var rand = getRandNum(0, 2); //parseInt(getRandNum(0,2));
            var rnd = (rand === 0) ? true : false; // Gives a 50% chance of finding a gem in the next game
            gem.rend = rnd;
            gem.update();
            allRocks.forEach(function (rock) {
                rock.update();
            });
            setTimeout(function () {
                reset();
            }, 3000);
        } else {
            idFrame = win.requestAnimationFrame(main);
        }
    }

    /* This function does some initial setup that occurs each time a new game is started.
     * particularly setting the lastTime variable that is required for the
     * game loop and calling main() to restart the game.
     */
    function init() {
        lastTime = Date.now();
        main();
    }

    /* This function is called by main() when the player loses a game and/or when the player
     * wins a game. It resets the starting point of the player, updates the gem, updates the
     * starting point and speed of the enemies (bugs), and calls init() to start a new game.
     */
    function reset() {
        player.x = 3 * 101;
        player.y = (6 * 81);
        for (var i = 0; i < allEnemies.length; i++) {
            allEnemies[i].x = enemyStart[getRandNum(0, 3)];
            allEnemies[i].speed = getRandNum(2, 4);
        }
        displayMessage("GO!"); // Good encouragement never hurts
        init();
    }

    /* This function creates and shows a message in the center of the canvas.
     * It takes in a string parameter for creating the message that will be display.
     */
    function showCenterMessage(text) {
        ctx.font = "46pt Impact";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data.
     */
    function update(dt) {
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods focus purely on updating
     * the data/properties related to  the object. The drawing of objects in the canvas
     * occurs in the render methods, with the exception of the center messages.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. This function is called every
     * game tick (or loop of the game engine).
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 4 of stone
                'images/stone-block.png', // Row 2 of 4 of stone
                'images/stone-block.png', // Row 3 of 4 of stone
                'images/stone-block.png', // Row 4 of 4 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 7, // Increased number of rows
            numCols = 7, // Increased number of columns
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        // Call the clearRect method to clear the top of the board after the player reach
        // the water row (this is to avoid an unnecessary decapitation of the player's avatar).
        //ctx.clearRect(0, 0, (101*8), 51);
        renderEntities();
    }

    /* This function is called by the render function each game
     * tick. It's purpose is to then call the render functions defined
     * on your enemy, player, rock and gem entities within app.js
     */
    function renderEntities() {
        if (gem.rend) {
            gem.render();
        }
        allRocks.forEach(function (rock) {
            rock.render();
        });
        allEnemies.forEach(function (enemy) {
            enemy.render();
        });
        player.render();
    }

    /* Clock function. Returns a string with correct time in hh:mm:ss format.
     * It takes as parameter a date written as an integer (in milliseconds).
     */
    function timer(dt) {
        var hour = 0,
            min = 0,
            sec = 0;
        sec = parseInt(dt / 1000); // To get an integer with just seconds
        if (sec >= 60) {
            min = parseInt(sec / 60); // To get an integer with just minutes
            sec = sec % 60; // To get the remaining seconds
            if (min >= 60) {
                hour = parseInt(min / 60); // To get an integer with just hours
                min = min % 60; // To get the remaining minutes
            }
        }
        return ((hour.toString().length == 1) ? ("0" + hour) : hour) + ":" +
            ((min.toString().length == 1) ? ("0" + min) : min) + ":" +
            ((sec.toString().length == 1) ? ("0" + sec) : sec);
    }

    /* Loading helper. This function pre-loads all of the images the game will need to
     * draw itself on the canvas. Then set init() as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Rock.png',
        'images/gem-blue-s.png',
        'images/gem-green-s.png',
        'images/gem-orange-s.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that it can be accessed from
     * within the app.js file.
     */
    global.ctx = ctx;
})(this);