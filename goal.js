/*
 * Constructor: Goal
 * The goal is the location where all sheep muct be to win the level.
 */
function Goal(p1, p2, color) {
    this.move(p1, p2);
    this.success = false;
    this.color = color;
    this.color.push(0.6);
}

/*
 * Method: test
 * Tests to see if all sheep are in the goal.
 *
 * Parameters:
 * level - the level to test
 *
 * Member Of: Goal
 */
Goal.prototype.test = function(level) {
    var total = 0;
    var inside = 0;
    for (var key in level.sheep) {
        if (level.sheep.hasOwnProperty(key)) {
            var s = level.sheep[key];
            total++;
            if  (s.pos[0] > this.p1[0] && s.pos[0] < this.p2[0] && s.pos[1] > this.p1[1] && s.pos[1] < this.p2[1]) {
                inside++;
            }
        }
    }
    if (total == inside) {
        this.success = true;
        return true;
    }

    return false;
};

/*
 * Method: move
 * Moves the goal to have opposite corners at p1 an p2.
 *
 * Parameters:
 * p1 - one corner as a 2-array
 * p2 - the opposite corner as a 2-array
 *
 * Member Of: Goal
 */
Goal.prototype.move = function(p1, p2) {
    var myP1 = [0, 0];
    var myP2 = [0, 0];
    if (p1[0] < p2[0]) {
        myP1[0] = p1[0];
        myP2[0] = p2[0];
    }
    else {
        myP1[0] = p2[0];
        myP2[0] = p1[0];
    }

    if (p1[1] < p2[1]) {
        myP1[1] = p1[1];
        myP2[1] = p2[1];
    }
    else  {
        myP1[1] = p2[1];
        myP2[1] = p1[1];
    }

    this.p1 = myP1;
    this.p2 = myP2;
};

/*
 * Method: draw
 * Draws the goal
 *
 * Parameters:
 * game
 *
 * Member Of: Goal
 */
Goal.prototype.draw = function(game) {
    var c = this.color;
    if (this.success) {
        c[3] = 1;
    }
    game.context.fillStyle = getAlphaColorString(this.color);
    game.context.fillRect(this.p1[0], this.p1[1], this.p2[0]-this.p1[0], this.p2[1]-this.p1[1]);
};
