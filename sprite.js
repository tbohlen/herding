/*
 * Constructor: Sprite
 */
function Sprite(color, startPos, key) {
    this.color = color;
    this.pos = startPos;
    this.vel = [0, 0];
    this.key = key;
}

Sprite.prototype.radius = 4;

/*
 * Method: draw
 * Draws the sprite to screen
 *
 * Parameters:
 * game - the controlling object
 *
 * Member Of: Sprite
 */
Sprite.prototype.draw = function(game) {
    //console.log("Vel: " + this.vel[0].toString() + ", " + this.vel[1].toString());
    //console.log("Pos: " + this.pos[0].toString() + ", " + this.pos[1].toString());
    drawCircle(this.pos[0], this.pos[1], this.radius, this.color, game.context);
};

/*
 * Method: logic
 * Runs logic to modify this particles position.
 *
 * Parameters:
 * level
 *
 * Member Of: Sprite
 */
Sprite.prototype.logic = function(level) {

};

/*
 * Constructor: SheepSprite
 * A herding sprite that prefers to stay in groups.
 */
function SheepSprite(color, startPos, key) {
    Sprite.call(this, color, startPos, key)
}

inherits(SheepSprite, Sprite);

SheepSprite.prototype.MAX_SAME_DIST = 30;
SheepSprite.prototype.MAX_THREAT_DIST = 100;
SheepSprite.prototype.MAX_VEL = 4;
SheepSprite.prototype.IDEAL_SAME_DIST = 25;

/*
 * Method: logic
 * Runs sprite logic.
 *
 * Parameters:
 * level - the level the sheep exists in
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.logic = function(level) {
    // a sheep looks at its nearest neighbors (defined by some distance)
    // if a threat is nearby it tries to get to the center of the mass of sheep
    // if no threat is nearby it "grazes" and thereby tries to stay within a
    // certain distance of the other sheep
    
    // update position
    this.pos = addVectors(this.pos, scale(this.vel, LOGIC_LOOP_TIME/DRAW_LOOP_TIME));
    
    var neighbors = [];
    var center = [0, 0];
    var motion = [0, 0];

    for (var key in level.sheep) {
        if (level.sheep.hasOwnProperty(key) && key != this.key) {
            var other = level.sheep[key];
            var otherDist = distance(other.pos[0], other.pos[1], this.pos[0], this.pos[1]);

            if (otherDist < this.MAX_SAME_DIST) {
                neighbors.push(other);
                center[0] += other.pos[0];
                center[1] += other.pos[1];

                //console.log("other: " + other.pos[0].toString() + ", " + other.pos[1].toString());
                //console.log("this: " + this.pos[0].toString() + ", " + this.pos[1].toString());

                var vec = subVectors(other.pos, this.pos);
                //console.log("vec: " + vec[0].toString() + ", " + vec[1].toString());
                var norm = normalized(vec);
                //console.log("norm: " + norm[0].toString() + ", " + norm[1].toString());
                var addition = subVectors(vec, scale(norm, this.IDEAL_SAME_DIST));
                //console.log("addition: " + addition[0].toString() + ", " + addition[1].toString());
                motion[0] += addition[0];
                motion[1] += addition[1];
            }
        }
    }

    if (neighbors.length != 0) {
        center[0] = center[0]/neighbors.length;
        center[1] = center[1]/neighbors.length;
    }

    var threat = null;
    if (distance(level.player.pos[0], level.player.pos[1], this.pos[0], this.pos[1])
        < this.MAX_THREAT_DIST) {
        threat = level.player;
    }

    if (threat != null) {
         //threat is nearby so try to get to center of nearby sheep
        //console.log("center: " + center[0].toString() + ", " + center[1].toString());
        var diff = subVectors(center, this.pos);
        if (neighbors.length === 0 || len(diff) <= MOVE_BUFFER) {
            // do not move if there are no neighbors or if very close to ideal
            // position
            this.vel = [0, 0];
        }
        else {
            this.vel = scale(normalized(diff), this.MAX_VEL);
        }
    }
    else {
        // no threat, so try to stay within a certain distance of all sheep
        // do this by finding motion direction and moving that way
        if (len(motion) > MOVE_BUFFER) {
            // only move if distance moved is significant
            this.vel = scale(normalized(motion), this.MAX_VEL);
        }
    }
};





/*
 * Constructor: Player
 * Builds the player
 */
function Player(color, startPos, key) {
    Sprite.call(this, color, startPos, key);
    this.left = 0;
    this.up = 0;
    this.right = 0;
    this.down = 0;
}

inherits(Player, Sprite);

Player.prototype.radius = 8;
Player.prototype.MAX_VEL = 3;

/*
 * Method: logic
 * Moves the player
 *
 * Member Of: Player
 */
Player.prototype.logic = function(level) {
    var vel = [this.right - this.left, this.down - this.up];
    this.pos = addVectors(this.pos, scale(vel, this.MAX_VEL * LOGIC_LOOP_TIME/DRAW_LOOP_TIME));
};
