/*
 * Constructor: Level2
 * The second level of the game.
 */
function Level2() {
    Level.call(this);
}

inherits(Level2, Level);


Level2.prototype.done = function() {
    //var coords = getTextXY("Well Herded!", game.context);
    //game.context.fillText("Well Herded!", coords[0], coords[1]);
    game.nextLevel(new Level3());
}

Level2.prototype.makeGoal = function() {
    this.goal = new Goal([game.width - 100, 0], [game.width, game.height], [100, 255, 100])
}

Level2.prototype.makeBarriers = function() {
    // find all barriers
    this.outerBarriers = new Barriers();
    this.outerBarriers.add([[0, 0], [0, game.height]]);
    this.outerBarriers.add([[game.width, 0], [game.width, game.height]]);
    this.outerBarriers.add([[0, 0], [game.width, 0]]);
    this.outerBarriers.add([[0, game.height], [game.width, game.height]]);

    this.barriers = new Barriers();
};

Level2.prototype.makeSprites = function() {
    for (var i = 0; i < 50; i++) {
        var key = i.toString();
        var newSheep = new SheepSprite([0, 0, 0], [500 + 10 * Math.floor(i/5), 280 + (10 * (i%5))], key);
        this.sheep[key] = newSheep;
    }
    this.player = new Player([255, 0, 0], [20, 300]);
};





/*
 * Constructor: Level3
 * The second level of the game.
 */
function Level3() {
    Level.call(this);
}

inherits(Level3, Level);

Level3.prototype.makeGoal = function() {
    this.goal = new Goal([game.width - 100, 0], [game.width, game.height], [100, 255, 100])
}

Level3.prototype.makeBarriers = function() {
    // find all barriers
    this.outerBarriers = new Barriers();
    this.outerBarriers.add([[0, 0], [0, game.height]]);
    this.outerBarriers.add([[game.width, 0], [game.width, game.height]]);
    this.outerBarriers.add([[0, 0], [game.width, 0]]);
    this.outerBarriers.add([[0, game.height], [game.width, game.height]]);

    this.barriers = new Barriers();
};

Level3.prototype.makeSprites = function() {
    for (var i = 0; i < 150; i++) {
        var key = i.toString();
        var newSheep = new SheepSprite([0, 0, 0], [500 + 10 * Math.floor(i/5), 280 + (10 * (i%5))], key);
        this.sheep[key] = newSheep;
    }
    this.player = new Player([255, 0, 0], [20, 300]);
};
