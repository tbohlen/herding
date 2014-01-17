/*
 * Constructor: Level
 * Builds a level of the game. The level deals with displaying everything to
 * screen
 */
function Level() {
    this.drawSprits = {};
    this.logicSprits = {};
    this.sheep = {};
    this.sheepGroups = {};
    this.makeSprites();
    this.makeBarriers();
    this.makeGoal();
}

/*
 * Method: makeGoal
 * Creates the goal on the level
 *
 * Member Of: Level
 */
Level.prototype.makeGoal = function() {
    this.goal = new Goal([game.width - 100, 0], [game.width, game.height], [100, 255, 100])
};

/*
 * Method: makeBarriers
 * Makes the barriers on the level
 *
 * Member Of: Level
 */
Level.prototype.makeBarriers = function() {
    // find all barriers
    this.outerBarriers = new Barriers();
    this.outerBarriers.add([[0, 0], [0, game.height]]);
    this.outerBarriers.add([[game.width, 0], [game.width, game.height]]);
    this.outerBarriers.add([[0, 0], [game.width, 0]]);
    this.outerBarriers.add([[0, game.height], [game.width, game.height]]);

    this.barriers = new Barriers();
    this.barriers.add([[0, 200], [game.width, 200]]);
    this.barriers.add([[0, 400], [game.width, 400]]);
};

/*
 * Method: makeSprites
 * Creates the sprites in the level
 *
 * Member Of: Level
 */
Level.prototype.makeSprites = function() {
    for (var i = 0; i < 30; i++) {
        var key = i.toString();
        var newSheep = new SheepSprite([0, 0, 0], [500 + 10 * Math.floor(i/5), 280 + (10 * (i%5))], key);
        this.sheep[key] = newSheep;
    }
    this.player = new Player([255, 0, 0], [20, 300]);
};

/*
 * Method: resize
 * Called as a notification when the game is resized
 *
 * Member Of: Level
 */
Level.prototype.resize = function() {
    this.makeGoal();
    this.makeBarriers();
};

/*
 * Method: checkCollisions
 * Checks for collisions between sprites and corrects
 *
 * Member Of: Level
 */
Level.prototype.checkCollisions = function() {
    var all = [];
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            all.push(this.sheep[key]);
        }
    }
    all.push(this.player);

    // for each pair
    for (var i = 0; i < all.length; i++) {
        var first = all[i];
        for (var j = i+1; j < all.length; j++) {
            var second = all[j];
            var dist = distance(first.pos, second.pos);
            // make sure that the next step will take them closer together
            var dotProd = dot(subVectors(first.vel, second.vel), subVectors(second.pos, first.pos));

            if (dist < first.RADIUS + second.RADIUS && dotProd > 0) {
                var dir = normalized(subVectors(second.pos, first.pos));

                // make sure they do not overlap
                var distCorrection = (dist-(first.RADIUS+second.RADIUS))/2;
                first.pos = addVectors(first.pos, scale(dir, distCorrection-POSITION_BUFFER));
                second.pos = addVectors(second.pos, scale(dir, -distCorrection+POSITION_BUFFER));

                // the two particles are colliding. Find the components of the
                // velocities perpendicular to the surface of collision
                var vel1 = dot(dir, first.vel);
                var vel2 = dot(dir, second.vel);
                var velDiff = scale(dir, vel1 - vel2);
                var vel1After = (ELASTICITY*(vel2-vel1) + vel2 + vel1)/2;
                var vel2After = (ELASTICITY*(vel1-vel2) + vel2 + vel1)/2;
                
                // modify the velocities
                first.vel = addVectors(first.vel, scale(dir, vel1After - vel1 + VELOCITY_BUFFER));
                second.vel = addVectors(second.vel, scale(dir, vel2After - vel2 + VELOCITY_BUFFER));
            }
        }
    }
};

/*
 * Method: draw
 * Draws the level to screen
 *
 * Member Of: Level
 */
Level.prototype.draw = function(game) {
    this.goal.draw(game);
    this.outerBarriers.draw(game);
    this.barriers.draw(game);
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].draw(game);
        }
    }

    this.player.draw(game)
};

/*
 * Method: logic
 * Runs the logic for the level.
 *
 * Parameters:
 * game
 *
 * Member Of: Level
 */
Level.prototype.logic = function(game) {
    // make all sheep null group
    this.sheepGroups = {};
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].group = null;
            this.sheep[key].getNeighbors(this);
        }
    }
    // find sheep groupings
    this.findSheepGroups(Object.keys(this.sheep), 0);
    // calculate group centers
    this.findGroupCenters();
    // calculate the derivative for each element
    for (var key in this.sheep) {
        if (this.sheep.hasOwnProperty(key)) {
            this.sheep[key].evalDeriv(this);
            this.outerBarriers.test(this.sheep[key]);
            this.barriers.test(this.sheep[key]);
        }
    }
    this.player.evalDeriv(this);
    this.barriers.test(this.player);

    this.checkCollisions();
};

/*
 * Method: findGroupCenters
 * Finds the center of each sheep herd.
 *
 * Member Of: Level
 */
Level.prototype.findGroupCenters = function() {
    for (var key in this.sheepGroups) {
        if (this.sheepGroups.hasOwnProperty(key)) {
            var group = this.sheepGroups[key];
            var num = group.length;
            var sum = [0, 0];
            for (var i = 0; i < num; i++) {
                sum = addVectors(sum, group[i].pos);
            }
            this.sheepGroups[key] = [group, scale(sum, 1/num)];
        }
    }
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

    // end condition
    if (this.goal.test(this)) {
        var coords = getTextXY("Well Herded!", game.context);
        game.context.fillText("Well Herded!", coords[0], coords[1]);
    }
};

/*
 * Method: findSheepGroups
 * Defines groups of sheep on the screen based on their proximity.
 *
 * Member Of: Level
 */
Level.prototype.findSheepGroups = function(ungrouped, nextGroupNum) {
    // we know indexes are consecutive integers
    var keyIndex = 0;
    var key = ungrouped[keyIndex];
    var assigned = [];
    
    while (!this.sheep.hasOwnProperty(key) || this.sheep[key] == null) {
        // remove the key because it is not a sheep
        assigned.push(key);
        // check the next key
        keyIndex++;
    }
    
    var s = this.sheep[key];

    // find the group distribution of its neighbors
    var groups = countValues(s.neighbors, "group");

    // label this sheep as a result
    if (Object.keys(groups).length == 0) {
        // if none of its neighbors have groups, make a new group
        this.sheepGroups[nextGroupNum] = [];
        assigned = assigned.concat(this.giveSheepGroup(s, nextGroupNum));
        nextGroupNum++;
    }
    else {
        // if some of its neighbors have groups choose the most neighbors
        // this should NEVER HAPPEN
        console.log("Checking Max!");
        var max = findMax(groups);
        assigned = assigned.concat(this.giveSheepGroup(s, max[0]));
    }
    
    // recurse
    var remaining = arrayDiff(ungrouped, assigned);
    if (remaining.length > 0) {
        this.findSheepGroups(remaining, nextGroupNum);
    }
    else {
        return;
    }
};

/*
 * Method: giveSheepGroup
 * Given a sheep and a group, assigns that sheep to a group and assigns all its
 * unassigned neighbors to that group as well. This recurses
 *
 * Parameters:
 * s - the sheep being assigned to a new group
 * group - the group to assign it to
 *
 * Returns a list of the sheep assigned groups as a result of this procedure
 *
 * Member Of: Level
 */
Level.prototype.giveSheepGroup = function(s, group) {
    // add this sheep to the group
    s.group = group;

    // save the fact that this sheep now has a group
    var results = [s.key];
    results.push(s.key);

    this.sheepGroups[group].push(s);

    // iterate over its neighbors
    for (var i = 0; i < s.neighbors.length; i++) {
        var other = s.neighbors[i];
        if (other.group == null) {
            var otherResults = this.giveSheepGroup(other, group);
            results = results.concat(otherResults);
        }
    }
    return results;
};
