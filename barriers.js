/*
 * Constructor: Barriers
 * Barriers stores all barriers in the game and prevents sprites from crossing
 * them.
 */
function Barriers() {
   this.barriers = []; 
}

Barriers.prototype.WIDTH = 4;

/*
 * Method: add
 * Adds a barrier. Barriers are an array of two points, each specifying an end
 * point of a wall
 *
 * Parameters:
 * b - the new barrier
 *
 * Member Of: Barriers
 */
Barriers.prototype.add = function(b) {
    this.barriers.push(b);
};

/*
 * Method: test
 * Tests one sprite against the barriers
 *
 * Parameters:
 * sprite - the one to test for collisions
 *
 * Member Of: Barriers
 */
Barriers.prototype.test = function(sprite) {
    var nextPos = addVectors(sprite.pos, sprite.vel);
    for (var i = 0; i < this.barriers.length; i++) {
        // for each barrier, test for collisions
        var b = this.barriers[i];
        var bOrg = b[0];
        var bDir = subVectors(b[1], b[0]);
        var ort = orthogonal(normalized(bDir));
        
        var pb = subVectors(sprite.pos, bOrg);
        var vb = [scale(sprite.vel, -1), bDir];
        if (numeric.det(vb) == 0) {
            break; // paths are parallel. Don't need to do anything
        }
        var vbInv = numeric.inv(vb);
        var ts = numeric.dot(pb, vbInv);

        // now we have two t values that should be the intersection point
        // ts[0] is the path along the sprite path
        // ts[1] is the path along the wall
        //
        // Both should be positive. The distance along the velocity vector
        // should be less than the velocity length and the distance along the
        // wall should be less than the length of the wall. 
        
        // the distance along the velocity vector to the intersect depends on
        // the radius
        var tOffset = Math.abs((sprite.RADIUS + 0.5 * this.WIDTH) / (dot(sprite.vel, ort)));
        if (ts[0] > 0 && ts[1] > 0 && ts[0] < 1 + tOffset && ts[1] < 1) {
            // we have a collision
            // find the direction of approach, set the new position, and curb
            // the velocity
            var ort = orthogonal(bDir);
            var ortDot = dot(ort, sprite.vel);
            // XXX: just setting the next position. Is there a nicer way to do
            // this?
            sprite.pos = addVectors(sprite.pos, scale(sprite.vel, ts[0]-tOffset-POSITION_BUFFER));

            // the "bad" direction of motion is ort scaled by -ortDot
            var badComponent = scale(ort, (-ortDot+VELOCITY_BUFFER));
            sprite.vel = addVectors(sprite.vel, badComponent);
        }
    }
};

/*
 * Method: draw
 * Draws the barriers to the screen
 *
 * Member Of: Barriers
 */
Barriers.prototype.draw = function(game) {
    for (var i = 0; i < this.barriers.length; i++) {
        var b = this.barriers[i];
        drawLine(b[0], b[1], [0, 0, 0], 3);
    }
};
