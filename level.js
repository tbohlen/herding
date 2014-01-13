/*
 * Constructor: Level
 * Builds a level of the game. The level deals with displaying everything to
 * screen
 */
function Level() {
    this.drawSprits = {};
    this.logicSprits = {};
    this.nextDrawIndex = 0;
    this.nextLogicIndex = 0;
    this.sheep = {};
    for (var i = 0; i < 100; i++) {
        var newSheep = new SheepSprite([0, 0, 0], [200 + 10 * Math.floor(i/2), 200 + (10 * (i%2))], i);
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
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].logic(this);
        }
    }

    this.player.logic(this);

};

/*
 * Method: addSprite
 * Adds an object to the level, running its logic and draw methods (if required)
 * every frame.
 *
 * Parameters:
 * sprite
 * draw - true if this object needs to be drawn
 * logic - true if this object needs to be included in the logic loop
 *
 * Member Of: Level
 */
Level.prototype.addSprite = function(sprite, draw, logic) {
    if (draw) {
        this.drawElements[this.nextDrawIndex] = sprite;
        sprite.drawIndex = this.nextDrawIndex;
        this.nextDrawIndex++;
    }
    if (logic) {
        this.logicElements[this.nextLogicIndex] = sprite;
        sprite.logicIndex = this.nextLogicIndex;
        this.nextLogicIndex++;
    }
};
