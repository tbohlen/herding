var LOGIC_LOOP_TIME = 8;
var DRAW_LOOP_TIME = 1000/30;
var MOVE_BUFFER = 0.1;

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
 * Function: drawUpdate
 * Updates all variables necessary to draw.
 */
function drawUpdate(game) {
    game.drawFrame++;
}

/*
 * Function: logicUpdate
 * Updates all the necessary variables for the logic run.
 */
function logicUpdate(game) {
    game.logicFrame++;
}

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
    var i;
    // update all important variables
    drawUpdate(game);
    // clean the screen
    clearScreen(game, "rgb(220, 220, 220)");
    // have the level draw itself
    game.level.draw(game);
}

/*
 * Function: logicLoop
 * Executes the logic of the game, one logicElement at a time.
 */
function logicLoop(game) {
    var i;
    // update all important variables
    logicUpdate(game);

    game.level.logic();

    // run all logicElements
    //for (var key in game.logicElements) {
        //if (game.logicElements.hasOwnProperty(key)) {
            //game.logicElements[key].doLogic(game);
        //}
    //}
}

function loadGame(callback) {
    console.log("Loading...");
    window.game = new Game();
    game.resize();
    callback(window.game);
}


$(document).ready(function() {

    // load the game. This should be used to show a loading bar in future.
    loadGame(function(game) {
        console.log("Loaded.");

        // start the loops
        game.drawLoopID = window.setInterval(drawLoop, DRAW_LOOP_TIME, game);
        game.logicLoopID = window.setInterval(logicLoop, LOGIC_LOOP_TIME, game); // 200 times per second

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Event Handlers //////////////////////////////
        ///////////////////////////////////////////////////////////////////////////

        $(document).on('mousemove', function(ev) {
            // when the mouse is moved, update the position
            game.mouseX = ev.pageX - game.offsetX;
            game.mouseY = ev.pageY - game.offsetY;
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
