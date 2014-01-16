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
    for (var i = 0; i < 100; i++) {
        var key = i.toString();
        var newSheep = new SheepSprite([0, 0, 0], [200 + 10 * Math.floor(i/5), 200 + (10 * (i%5))], key);
        this.sheep[key] = newSheep;
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
        //assigned = assigned.concat(["1", "2", "3"]);
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
    //console.log("Ungrouped: ");
    //console.log(ungrouped);
    //console.log("Assigned: ");
    //console.log(assigned);
    var remaining = arrayDiff(ungrouped, assigned);
    if (remaining.length > 0) {
        //console.log("Remaining: ");
        //console.log(remaining);
        this.findSheepGroups(remaining, nextGroupNum);
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
    //console.log("Results:");
    //console.log(results);
    return results;
};
