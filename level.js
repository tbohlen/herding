/*
 * Constructor: Level
 * Builds a level of the game. The level deals with displaying everything to
 * screen
 */
function Level() {
    this.drawSprits = {};
    this.logicSprits = {};
    this.sheep = {};
    for (var i = 0; i < 100; i++) {
        var newSheep = new SheepSprite([0, 0, 0], [200 + 10 * Math.floor(i/5), 200 + (10 * (i%5))], i);
        this.sheep[i] = newSheep;
    }
    this.player = new Player([255, 0, 0], [20, 20]);
}

/*
 * Method: draw
 * Draws the level to screen
 *
 * Member Of: Level
 */
Level.prototype.draw = function(game) {
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].draw(game);
        }
    }

    this.player.draw(game)
};

/*
 * Method: logic
 * Runs the logic for the leve
 *
 * Parameters:
 * game
 *
 * Member Of: Level
 */
Level.prototype.logic = function(game) {
    // calculate the derivative for each element
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].evalDeriv(this);
        }
    }
    this.player.evalDeriv(this);
};

/*
 * Method: move
 * Moves everything on screen
 *
 * Parameters:
 * game
 *
 * Member Of: Level
 */
Level.prototype.move = function(game) {
    // apply the derivative for each element
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].applyDeriv();
        }
    }
    this.player.applyDeriv();
};
