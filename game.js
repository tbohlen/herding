// animals think slowly. Only make decisions 10 times a second but apply them 30
// times a second
var DECISION_LOOP_TIME = 1000/30;
var MOVE_LOOP_TIME = 1000/30;
var DRAW_LOOP_TIME = 1000/30;
var MOVE_BUFFER = 0.1;
var BACKGROUND = [255, 255, 255];
VELOCITY_BUFFER = 0.0001 // adds a boost away from any obstacles to avoid drift due to floating point rounding

/*
 * Constructor: Game
 * The game container. Deals with initialization and resizing, as well as
 * changing screens.
 */
function Game() {
    this.canvas = $("#game");
    this.context = this.canvas[0].getContext("2d");
    this.width = this.canvas.width();
    this.height = this.canvas.height();

    this.background = getColorString(BACKGROUND);

    offset = this.canvas.offset();
    this.offsetX = offset.left;
    this.offsetY = offset.top;

    this.level = new Level();
}

/*
 * Function: resize
 * Resizes the game to match the canvas.
 */
Game.prototype.resize = function() {
    this.width = $(window).innerWidth()
    this.height = $(window).innerHeight()
    this.canvas.width(this.width);
    this.canvas.height(this.height);
    this.canvas.attr("height", this.height);
    this.canvas.attr("width", this.width);
    offset = this.canvas.offset();
    this.offsetX = offset.left;
    this.offsetY = offset.top;
};


// need a character

// need a level

// Run

/*
 * Function: clearScreen
 * Clears the drawing context entirely.
 *
 * Parameters:
 * color - the color to make the screen.
 */
var clearScreen = function(game, color) {
    game.context.clearRect(0, 0, game.width, game.height);
    if (color !== null && typeof(color) !== 'undefined') {
        game.context.fillStyle = color;
        game.context.fillRect(0, 0, game.width, game.height);
    }
};

/*
 * Function: drawLoop
 * Draws the game. And keeps the drawFrame up to date. The logic is handled
 * elsewhere.
 */
function drawLoop(game) {
    // clean the screen
    clearScreen(game, game.background);
    // have the level draw itself
    game.level.draw(game);
}

/*
 * Function: decisionLoop
 * Executes the logic of the game, one logicElement at a time.
 */
function decisionLoop(game) {
    game.level.logic();
}

/*
 * Function: moveLoop
 * Moves the sprites.
 */
function moveLoop(game) {
    game.level.move();
}

function loadGame(callback) {
    console.log("Loading...");
    window.game = new Game();
    window.game.resize();
    callback(window.game);
}


$(document).ready(function() {

    // load the game. This should be used to show a loading bar in future.
    loadGame(function(game) {
        console.log("Loaded.");

        // start the loops
        game.drawLoopID = window.setInterval(drawLoop, DRAW_LOOP_TIME, game);
        game.moveLoopID = window.setInterval(moveLoop, MOVE_LOOP_TIME, game); // 200 times per second
        game.decisionLoopID = window.setInterval(decisionLoop, DECISION_LOOP_TIME, game); // 200 times per second

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Event Handlers //////////////////////////////
        ///////////////////////////////////////////////////////////////////////////

        $(document).on('mousemove', function(ev) {
            // when the mouse is moved, update the position
            game.level.player.mousePos = [ev.pageX - game.offsetX, ev.pageY - game.offsetY];
        });

        $(document).on('keydown', function(ev) {
            // pressing 1 allows for level skipping
            switch (ev.keyCode) {
                case 37:
                    // left
                    game.level.player.left = 1;
                    break;
                case 38:
                    // up
                    game.level.player.up = 1;
                    break;
                case 39:
                    // right
                    game.level.player.right = 1;
                    break;
                case 40:
                    // down
                    game.level.player.down = 1;
                    break;
                case 32:
                    // space
                    window.clearInterval(game.drawLoopID);
                    window.clearInterval(game.decisionLoopID);
                    window.clearInterval(game.moveLoopID);
            }
        });

        $(document).on('keyup', function(ev) {
            // pressing 1 allows for level skipping
            switch (ev.keyCode) {
                case 37:
                    // left
                    game.level.player.left = 0;
                    break;
                case 38:
                    // up
                    game.level.player.up = 0;
                    break;
                case 39:
                    // right
                    game.level.player.right = 0;
                    break;
                case 40:
                    // down
                    game.level.player.down = 0;
                    break;
            }
        });

        $(window).on('resize', function(ev) {
            game.resize();
        });
    })
});
