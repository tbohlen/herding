// sprite states
var RELAXED = 0;
var THREATENED = 1;
var PANICKED = 2;

/*
 * Constructor: Sprite
 */
function Sprite(color, startPos, key) {
    this.color = color;
    this.pos = startPos;
    this.vel = [0, 0];
    this.accel = [0, 0];
    this.key = key;
    this.type = "Sprite";
}

Sprite.prototype.RADIUS = 4;

/*
 * Method: Sprite.draw
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
    drawCircle(this.pos[0], this.pos[1], this.RADIUS, this.color, game.context);
};

/*
 * Method: Sprite.evalDeriv
 * Runs logic to find the derivative of the particle state. This derivative is
 * then saved as an element of the object
 *
 * Parameters:
 * level
 *
 * Member Of: Sprite
 */
Sprite.prototype.evalDeriv = function(level) {

};

/*
 * Method: applyDeriv
 * Applies the saved derivative to the sprite's state, thereby updating the
 * state
 *
 * Member Of: Sprite
 */
Sprite.prototype.applyDeriv = function() {
    this.pos = addVectors(this.pos, this.vel);
    this.vel = addVectors(this.vel, this.accel);
};

/*
 * Method: Sprite.getForce
 * Finds the force put on this Sprite by the Other. Force can be positive or
 * negative, positive indicating a force away and negative being a force
 * towards.
 *
 * XXX: Using otherType in this way is a little ugly. It is not easily
 * extensible. Would be good to update this in future.
 *
 * Parameters:
 * otherType - a string specifying the type of the other object.
 *
 * Returns an array containing the force and a boolean that, when true,
 * indicates that the other object absolutely cannot move further in the given
 * direction.
 *
 * Member Of: Sprite
 */
Sprite.prototype.getForce = function(otherType) {
    return [0, false];
};

/*
 * Method: checkBoundaries
 * Checks to see if the current velocity will take the sprite out of bounds,
 * and, if so, changes the velocity so that it will not do so.
 *
 * TODO: change this to use a potential rather than a flat wall.
 *
 * Member Of: Sprite
 */
Sprite.prototype.checkBoundaries = function() {
    var nextPos = addVectors(this.pos, this.vel);
    if (nextPos[0] > window.game.width - this.RADIUS || nextPos[0] < this.RADIUS) {
        this.vel[0] = 0;
    }
    if (nextPos[1] > window.game.height - this.RADIUS || nextPos[1] < this.RADIUS) {
        this.vel[1] = 0;
    }
};

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Player Object /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*
 * Constructor: SheepSprite
 * A herding sprite that prefers to stay in groups.
 */
function SheepSprite(color, startPos, key) {
    Sprite.call(this, color, startPos, key)
    this.type = "SheepSprite";
    this.state = RELAXED;
    this.threat = null;
}

inherits(SheepSprite, Sprite);

SheepSprite.prototype.RADIUS = 4;

SheepSprite.prototype.VIEW_DIST = 100;
SheepSprite.prototype.SAME_DIST = 80;
SheepSprite.prototype.NEIGHBOR_DIST = 50; // distance at which another animal can be considered a neighbor
SheepSprite.prototype.THREAT_FORGET_DIST = 150;
SheepSprite.prototype.THREAT_AGREE_DIST = 150;

SheepSprite.prototype.MAX_VEL = 2 // max velocity when relaxed
SheepSprite.prototype.MAX_THREAT_VEL = 2; // max velocity when threatened
SheepSprite.prototype.MAX_ACCEL = 0.05; // maximum acceleration when relaxed
SheepSprite.prototype.MAX_THREAT_ACCEL = 0.1; // maximum acceleration when threatened

SheepSprite.prototype.THREATENED_SAME_FORCE = 0.03; // distance at which attraction beings if threatened
SheepSprite.prototype.THREAT_FORCE = 3; // scale for threat force
SheepSprite.prototype.RUN_WITH_CONST = 0.1;

SheepSprite.prototype.RELAXED_FORCE_DIST = 15; // distance at which attraction begins if unthreatened
SheepSprite.prototype.RELAXED_FORCE_BUFF = 60; // size of area at which no force is felt if unthreatened
SheepSprite.prototype.SAME_FORCE = 1; // scale for force to move away from neighbors

SheepSprite.prototype.FORCE_SCALE = 0.02; // scales the force to create a velocity
SheepSprite.prototype.ABSOLUTE_BUFFER = 0.0001 // adds a boost away from any obstacles to avoid drift due to floating point rounding
SheepSprite.prototype.DAMPING = 0.1;

/*
 * Method: SheepSprite.evalDeriv
 * See Sprite.evalDeriv.
 *
 * Parameters:
 * level - the level the sheep exists in
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.evalDeriv = function(level) {
    // a sheep looks at its nearest neighbors (defined by some distance)
    // if a threat is nearby it tries to get to the center of the mass of sheep
    // if no threat is nearby it "grazes" and thereby tries to stay within a
    // certain distance of the other sheep
    
    var totalForce = [0, 0];
    var absolutes = [];

    // if the player is close, record it as a threat
    if (distance(level.player.pos, this.pos)
        < this.VIEW_DIST) {
        this.threat = level.player;
        this.state = THREATENED;
    }

    for (var key in level.sheep) {
        if (level.sheep.hasOwnProperty(key) && key != this.key) {
            var other = level.sheep[key];
            var otherDist = distance(other.pos, this.pos);

            if (otherDist < this.SAME_DIST) {
                // if the other sheep is very close and threatened, this one can
                // become threatened
                if (otherDist < this.NEIGHBOR_DIST && other.state == THREATENED) {

                    if (this.state != THREATENED && distance(other.threat.pos, this.pos) < this.THREAT_AGREE_DIST) {
                        this.state = THREATENED;
                        this.threat = other.threat;
                    }
                }

                // calculate the force applied by the other
                var forceArr = this.getForce(other);
                var force = forceArr[0];
                var absoluteDir = forceArr[1];
                var absolute = forceArr[2];
            
                if (absolute) {
                    // if the force is designated absolute then add this to the
                    // absolutes list
                    absolutes.push(scale(absoluteDir, -1));
                }

                // add the force
                totalForce = addVectors(totalForce, force);

            }
        }
    }

    if (this.state == THREATENED) {
        // if this sprite is threatened, then calculate the effect of that
        // threat
        
        // if the threat is far away, forget about it
        var dist = distance(this.pos, this.threat.pos);
        if (dist > this.THREAT_FORGET_DIST) {
            this.threat = null;
            this.state = RELAXED;
        }
        else {
            var forceArr = this.getForce(this.threat);
            var force = forceArr[0];
            var absoluteDir = forceArr[1];
            var absolute = forceArr[2];
        
            // a sheep may never run toward a predator that is threatening them,
            // so add to the absolutes list
            absolutes.push(scale(absoluteDir, -1));

            // add the force
            totalForce = addVectors(totalForce, force);
        }
    }

    // update the acceleration
    var maxAccel = (this.threat != null) ? this.MAX_THREAT_ACCEL : this.MAX_ACCEL;
    this.accel = scale(bound(0, maxAccel, scale(totalForce, this.FORCE_SCALE)), MOVE_LOOP_TIME/DRAW_LOOP_TIME);

    // remove any components of motion that are "absolute", ie, that cannot be
    // allowed
    for (var i = 0; i < absolutes.length; i++) {
        var direction = absolutes[i];
        var magnitude = dot(direction, this.vel) + this.ABSOLUTE_BUFFER;
        if (magnitude > 0) {
            var badComponent = scale(direction, magnitude);
            this.vel = subVectors(this.vel, badComponent);
        }
    }

    // check the velocity in case its hitting boundaries
    this.checkBoundaries();

    // bound the velocity
    var maxVel = (this.threat != null) ? this.MAX_THREAT_VEL : this.MAX_VEL;
    this.vel = bound(0, maxVel, this.vel);

    // damp the velocity
    if (len(this.accel) <= 0.05) {
        this.vel = scale(this.vel, (1-this.DAMPING));
    }
}

/*
 * Method: SheepSprite.getForce
 * See Sprite.getForce
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getForce = function(other) {
    var dist = distance(this.pos, other.pos);
    var force = [0, 0];
        var dir = normalized(subVectors(this.pos, other.pos));
    if (other.type === "SheepSprite") {
        if (this.state == THREATENED) {
            force = this.getThreatenedSheepForce(other, dir);
        }
        else if (this.state == RELAXED){
            force = this.getRelaxedSheepForce(other, dir);
        }
    }
    else if (other.type === "Player") {
        // assume threatened if this is called
        // Pushed away 
        var dir = normalized(subVectors(this.pos, other.pos));
        if (dist < 0.01) {
            dist = 0.01;
        }
        force = scale(dir, this.THREAT_FORCE * Math.pow(2, (1/dist) ));
    }

    // if the two objects are about to overlap, prevent that by returning true
    // as the second return value
    if (dist < this.RADIUS + other.RADIUS) {
        return [force, dir, true];
    }
    else {
        return [force, dir, false]
    }
};

/*
 * Method: getThreatenedSheepForce
 * Gets the force applied on this by another sheep if this sheep is threatened
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getThreatenedSheepForce = function(other, dir) {
    // if there is a threat, and the other sheep is relaxed, avoid it (repelled)
    // and if the other is threatened, run with it (force parallel to others
    // velocity
    var dist = distance(this.pos, other.pos);
    if (other.state == THREATENED) {
        return scale(other.vel, this.RUN_WITH_CONST);
    }
    else if (other.state == RELAXED) {
        // want the direction orthogonal to our velocity
        //var dir = orthogonal(this.vel);

        var effDist = dist - 2*this.RADIUS;
        if (effDist < 0.01) {
            effDist = 0.01;
        }
        var crossMag = dot(dir, this.vel);
        var mag = this.THREATENED_SAME_FORCE * crossMag * Math.pow( 2, 1/effDist);

        return scale(dir, mag);
    }
};

/*
 * Method: getRelaxedSheepForce
 * Gets the force applied to this by another sheep if this sheep is not
 * threatened
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getRelaxedSheepForce = function(other, dir) {
    // if no threat, repelled if close, 0 pressure if nearby, attracted
    // gently if far
    var dist = distance(this.pos, other.pos);
    var distAttr = (2*this.RADIUS) + this.RELAXED_FORCE_DIST + this.RELAXED_FORCE_BUFF;
    var distRep = (2*this.RADIUS) + this.RELAXED_FORCE_DIST;
    if (other.state == THREATENED) {
        return scale(other.vel, this.RUN_WITH_CONST);
    }
    else if (dist > distAttr) {
        return scale(dir, -1 * (dist - distAttr));
    }
    else if (dist < distRep) {
        if (dist < 0.01) {
            dist = 0.01;
        }
        return scale(dir, this.SAME_FORCE * Math.pow(2, 1/dist));
    }
    else {
        return [0, 0];
    }
};


///////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Player Object /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

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
    this.mousePos = startPos;
    this.type = "Player";
}

inherits(Player, Sprite);

Player.prototype.RADIUS = 8;
Player.prototype.MAX_VEL = 5;
Player.prototype.VEL_SCALE = 0.05;

/*
 * Method: evalDeriv
 * Moves the player
 *
 * Member Of: Player
 */
Player.prototype.evalDeriv = function(level) {
    var diff = subVectors(this.mousePos, this.pos);
    this.vel = scale(bound(0, this.MAX_VEL, scale(diff, this.VEL_SCALE)), MOVE_LOOP_TIME/DRAW_LOOP_TIME);
    this.accel = [0, 0];

    // check the velocity in case its hitting boundaries
    this.checkBoundaries();
};
