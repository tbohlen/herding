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
    drawCircle(this.pos[0], this.pos[1], this.RADIUS, this.getColor(game.level), game.context);
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
 * Method: getColor
 * Returns the color of the sprite
 * Member Of: Sprite
 */
Sprite.prototype.getColor = function(level) {
    return this.color;
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
    var velMag = len(this.vel);
    if (nextPos[0] > window.game.width - this.RADIUS || nextPos[0] < this.RADIUS) {
        this.vel[0] = 0;
    }
    if (nextPos[1] > window.game.height - this.RADIUS || nextPos[1] < this.RADIUS) {
        this.vel[1] = 0;
    }
    makeLen(this.vel, velMag); // if you hit a boundary, keep moving fast
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
    this.group = null;
}

inherits(SheepSprite, Sprite);

SheepSprite.prototype.RADIUS = 6;

SheepSprite.prototype.VIEW_DIST = 100;
SheepSprite.prototype.SAME_VIEW_DIST = 80;
SheepSprite.prototype.NEIGHBOR_DIST = 60; // distance at which another animal can be considered a neighbor
SheepSprite.prototype.THREAT_FORGET_DIST = 200;
SheepSprite.prototype.THREAT_AGREE_DIST = 150;

SheepSprite.prototype.MAX_VEL = 1.5; // max velocity when relaxed
SheepSprite.prototype.MAX_THREAT_VEL = 1.5; // max velocity when threatened
SheepSprite.prototype.MAX_ACCEL = 0.05; // maximum acceleration when relaxed
SheepSprite.prototype.MAX_THREAT_ACCEL = 0.08; // maximum acceleration when threatened

SheepSprite.prototype.THREATENED_SAME_FORCE = 0.03; // distance at which attraction beings if threatened
SheepSprite.prototype.HERD_THREAT_FORCE = 1; // scale for threat force
SheepSprite.prototype.SOLO_THREAT_FORCE = 3; // scale for threat force
SheepSprite.prototype.RUN_WITH_CONST = 0.5;
SheepSprite.prototype.GROUP_THINK_PERCENT = 0.1;
SheepSprite.prototype.HERD_FORCE = 0.01;

SheepSprite.prototype.RELAXED_FORCE_DIST = 10; // distance at which attraction begins if unthreatened
SheepSprite.prototype.RELAXED_SAME_FORCE = 20; // scale for force to move away from neighbors
SheepSprite.prototype.SAME_ATTR_FORCE = 0.01;

SheepSprite.prototype.FORCE_SCALE = 0.02; // scales the force to create a velocity
SheepSprite.prototype.ABSOLUTE_BUFFER = 0.0001 // adds a boost away from any obstacles to avoid drift due to floating point rounding
SheepSprite.prototype.DAMPING = 0.1;

/*
 * Method: getColor
 * see Sprite.getColor
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getColor = function(level) {
    var numGroups = Object.keys(level.sheepGroups).length;
    var h = this.group/numGroups;
    var s = 0.5;
    if (this.state == THREATENED) {
        s = 1;
    }
    var v = 1;
    return hsvToRgb(h, s, v);
};

/*
 * Method: getNeighbors
 * Finds all neighbors of this sheep and saves the list
 *
 * Parameters:
 * level
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getNeighbors = function(level) {
    //console.log("key is " + this.key)
    this.neighbors = [];
    for (var key in level.sheep) {
        if (level.sheep.hasOwnProperty(key) && key != this.key) {
            var other = level.sheep[key];
            var otherDist = distance(other.pos, this.pos);

            if (otherDist < this.NEIGHBOR_DIST) {
                this.neighbors.push(other);
            }
        }
    }
};

/*
 * Method: checkHerdState
 * Checks to see if a good number of sheep in the herd are threatened. If so,
 * makes this one threatened too.
 *
 * Parameters:
 * level
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.checkHerdState = function(level) {
    // iterate over this group. If others are threatened, be threatened, too
    var groupObj = level.sheepGroups[this.group][0];
    var othersThreatened = 0;
    var firstThreatened = null;
    for (var i = 0; i < groupObj.length; i++) {
        var other = groupObj[i]
        if (other.state == THREATENED) {
            if (firstThreatened == null) {
                firstThreatened = other;
            }
            othersThreatened++;
        }
    }

    // if more than a certain portion of the group is threatened, become
    // threatened
    if (othersThreatened/(groupObj.length) > this.GROUP_THINK_PERCENT) {
        this.state = THREATENED;
        this.threat = firstThreatened.threat;
        return true;
        // TODO: find nearest threat
    }
    return false;
};

/*
 * Method: getSameForces
 * Iterates over all nearby sheep in this group and returns the total force
 * applied to this sheep by its neighbors
 *
 * Parameters:
 * level
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getSameForces = function(level) {
    var groupObj = level.sheepGroups[this.group][0];
    var totalForce = [0, 0];
    var absolutes = [];
    for (var i = 0; i < groupObj.length; i++) {
        var other = groupObj[i];
        var otherDist = distance(other.pos, this.pos);

        if (otherDist < this.SAME_VIEW_DIST) {

            // calculate the force applied by the other
            var forceArr = this.getSheepForce(other);
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
    return [totalForce, absolutes];
};

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
    var groupObj = level.sheepGroups[this.group];

    if (distance(level.player.pos, this.pos) < this.VIEW_DIST) {
        // if the player is close, record it as a threat
        this.threat = level.player;
        this.state = THREATENED;
    }
    else if (this.checkHerdState(level)) {
        // if the herd is threatened, become threatened.
        // This statement makes sure that the next statement is not executed if
        // we just got threatened
    }

    if (this.state == THREATENED) {
        var threatCenterDist = distance(groupObj[1], this.threat.pos);
        var threatDist = distance(this.pos, this.threat.pos);

        if (threatCenterDist > this.THREAT_FORGET_DIST || (threatDist > this.THREAT_FORGET_DIST && threatDist < threatCenterDist)) {
            this.threat = null;
            this.state = RELAXED;
        }

    }

    if (this.state == THREATENED) {
        // if this sprite is still threatened, then calculate the effect of that
        // threat
        var forceArr = this.getThreatForce(this.threat, level);
        var force = forceArr[0];
        var absoluteDir = forceArr[1];
        var absolute = forceArr[2];
    
        // a sheep may never run toward a predator that is threatening them,
        // so add to the absolutes list
        absolutes.push(scale(absoluteDir, -1));

        // add the force
        totalForce = addVectors(totalForce, force);
    }

    // be effected by sheep nearby (by definition they must be in your herd)
    var sameResult = this.getSameForces(level);
    var absolutes = sameResult[1];
    totalForce = addVectors(totalForce, sameResult[0]);

    // add the herd force
    totalForce = addVectors(totalForce, this.getHerdForce(level));

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
 * Method: getHerdForce
 * Gets the force of the herd on the motion of this particle. Scales up with
 * distance
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getHerdForce = function(level) {
    var center = level.sheepGroups[this.group][1];
    var dir = subVectors(center, this.pos);
    var dist = distance(this.pos, center);
    return makeLen(dir, this.HERD_FORCE * dist);
};

/*
 * Method: getThreatForce
 * Returns the force applied on this by the threat.
 *
 * Parameters:
 * threat - the object threatening the sheep
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getThreatForce = function(threat, level) {
    // Pushed away  from group center
    var groupObj = level.sheepGroups[this.group][1];
    var dir = normalized(subVectors(this.pos, threat.pos));
    var dist = distance(this.pos, threat.pos);
    var groupDir = normalized(subVectors(groupObj, threat.pos));
    var groupDist = distance(groupObj, threat.pos);
    if (dist < 0.01) {
        dist = 0.01;
    }
    var force = scale(dir, this.SOLO_THREAT_FORCE * Math.pow(2, (1/dist) ));
    var groupForce = scale(groupDir, this.HERD_THREAT_FORCE * Math.pow(2, (1/groupDist) ));

    // if the two objects are about to overlap, prevent that by returning true
    // as the second return value
    if (dist < this.RADIUS + threat.RADIUS) {
        return [addVectors(force, groupForce), dir, true];
    }
    else {
        return [addVectors(force, groupForce), dir, false];
    }
};

/*
 * Method: SheepSprite.getSheepForce
 * See Sprite.getSheepForce
 *
 * Member Of: SheepSprite
 */
SheepSprite.prototype.getSheepForce = function(other) {
    // repelled if close, no force if far away
    var dist = distance(this.pos, other.pos);
    var dir = normalized(subVectors(this.pos, other.pos));
    var distRep = (2*this.RADIUS) + this.RELAXED_FORCE_DIST;
    var distEff = dist - (2*this.RADIUS);
    var scaleVal = (this.state == THREATENED) ? this.THREATENED_SAME_FORCE : this.RELAXED_SAME_FORCE;
    var force = [0, 0];
    if (dist < distRep) {
        if (distEff < 0.01) {
            distEff = 0.01;
        }
        force = scale(dir, scaleVal * Math.pow(2, 1/distEff));
    }
    else {
        force = [0, 0];
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

Player.prototype.RADIUS = 4;
Player.prototype.MAX_VEL = 6;
Player.prototype.VEL_SCALE = 0.05;
Player.prototype.ABSOLUTE_BUFFER = 0.0001 // adds a boost away from any obstacles to avoid drift due to floating point rounding

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

    this.checkColissions(level);
};

/*
 * Method: checkColissions
 * Checks for collisions with other objects and prevents them.
 *
 * Parameters:
 * level
 *
 * Member Of: Player
 */
Player.prototype.checkColissions = function(level) {
    for (var key in level.sheep) {
        var other = level.sheep[key];
        var otherDist = distance(other.pos, this.pos);
        if (otherDist < this.RADIUS + other.RADIUS) {
            var direction = normalized(subVectors(other.pos, this.pos));
            var magnitude = dot(direction, this.vel) + this.ABSOLUTE_BUFFER;
            if (magnitude > 0) {
                var badComponent = scale(direction, magnitude);
                this.vel = subVectors(this.vel, badComponent);
            }
        }
    }
};
