function inherits(child, parent) {
    function f() {
        this.constructor = child;
    }
    f.prototype = parent.prototype;
    child.prototype = new f;
}

/*
 * Function: getTextXY
 * Returns the x and y coords at which the text should be rendered in order to
 * center it in the context.
 */
function getTextXY(text, context) {
    var textDims = context.measureText(text);
    return [$(context.canvas).width()*0.5 - textDims.width * 0.5, $(context.canvas).height()*0.5];

}

function measureTextHeight(ctx, left, top, width, height) {

    // Draw the text in the specified area
    ctx.save();
    ctx.translate(left, top + Math.round(height * 0.8));
    ctx.mozDrawText('gM'); // This seems like tall text... Doesn't it?
    ctx.restore();

    // Get the pixel data from the canvas
    var data = ctx.getImageData(left, top, width, height).data,
    first = false, 
    last = false,
    r = height,
    c = 0;

    // Find the last line with a non-white pixel
    while(!last && r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                last = r;
                break;
            }
        }
    }

    // Find the first line with a non-white pixel
    while(r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                first = r;
                break;
            }
        }
    }

    // If we've got it then return the height
    if(first != r) {
        return last - first;
    }

    // We screwed something up...  What do you expect from free code?
    return 0;
}

/*
 * Function: boundedRand
 * Returns a random value uniformly distributed between min and max.
 */
function boundedRand(min, max) {
    return min + Math.random() * (max - min);
}

//TODO: put this all into a custom vector object

/*
 * Function: distance
 * Returns the distance between two vectors.
 */

function distance(vec1, vec2) {
    var sum = 0;
    for (var i = 0; i < vec1.length; i++) {
        sum += Math.pow(vec2[i] - vec1[i], 2);
    }
    return Math.sqrt(sum);
}

/*
 * Function: len
 * Returns the length of the given vector
 *
 */
function len(vec) {
    var total = 0;
    for (var i = 0; i < vec.length; i++) {
        total = total + Math.pow(vec[i], 2);
    }
    return Math.sqrt(total);
}

/*
 * Function: subVectors
 * Adds two vectors and returns the result
 */
function subVectors(vec1, vec2) {
    var result = [];
    var i;
    for (i = 0; i < vec1.length;i++) {
        result[i] = vec1[i] - vec2[i];
    }
    return result;
}

/*
 * Function: addVectors
 * Adds two vectors and returns the result
 */
function addVectors(vec1, vec2) {
    var result = [];
    var i;
    for (i = 0; i < vec1.length;i++) {
        result[i] = vec1[i] + vec2[i];
    }
    return result;
}

/*
 * Function: scale
 * Scales a vector by a scalar.
 */
function scale(vec, scalar) {
    var result = [];
    var i;
    for (i = 0; i < vec.length; i++) {
        result[i] = vec[i] * scalar;
    }
    return result;
}

function normalized(vec) {
    var zero = []
    for (var i = 0; i < vec.length; i++) {
        zero.push(0);
    }
    length = distance(vec, zero);
    if (length === 0) {
        return vec
    }
    else {
        return scale(vec, 1/length);
    }
}

/*
 * Function: makeScale
 * Makes the vector the given length
 */
function makeLen(vec, scalar) {
    return scale(normalized(vec), scalar);
}

/*
 * Function: bound
 * Bounds the length of the vector between low and high
 */
function bound(low, high, vec) {
    var vecLen = len(vec);
    if (vecLen < low) {
        return makeLen(vec, low);
    }
    else if (vecLen > high) {
        return makeLen(vec, high);
    }
    return vec;
}

/*
 * Function: dot
 * Returns the dot product of vec1 and vec2
 */
function dot(vec1, vec2) {
    var sum = 0;
    for (var i = 0; i < vec1.length; i++) {
        sum += vec1[i] * vec2[i];
    }
    return sum;
}

/*
 * Function: orthogonal
 * Returns the unit vector orthogonal to the given vector. Only works in 2D
 */
function orthogonal(vec) {
    return normalized([vec[1], -1 * vec[0]]);
}

/*
 * Function: drawCircle
 * Draws a circular path and closes it. The caller must have specified the fill
 * and stroke and called fill and stroke.
 * 
 * Parameters:
 * x - the x coord of the center
 * y - the y coord of the center
 * radius - the radius of the circle
 * ctx - context to draw on
 */
function drawCircle(x, y, radius, color, ctx) {
    game.context.fillStyle = "rgb(" + Math.floor(color[0]).toString() + ", " + Math.floor(color[1]).toString() + ", " + Math.floor(color[2]).toString() + ")";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, true); 
    ctx.closePath();
    game.context.fill();
}

/*
 * Constructor: Emitter
 * Simple event emitter
 */
function Emitter() {
    this.listeners = {};
}

/*
 * Method: attach
 * Attaches a listener to a given event.
 *
 * Parameters:
 * event- the name of the event
 * listener - the listening function. Takes a single parameter
 *
 * Member Of: Emitter
 */
Emitter.prototype.on = function(event, listener) {
    if (!(event in this.listeners)) {
        this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
};

/*
 * Method: emit
 * Emits an event to all listeners
 *
 * Parameters:
 * event - the name of the event
 *
 * Member Of: Emitter
 */
Emitter.prototype.emit = function(event) {
    var key
        , i
        , j
        , eventListeners
        , argsArray = [];
    for (j = 1; j < arguments.length; j++) {
        argsArray.push(arguments[j]);
    }
    if (event in this.listeners) {
        eventListeners = this.listeners[event];
        for (i = 0; i < eventListeners.length; i++) {
            eventListeners[i].apply(this, argsArray);
        }
    }
};

