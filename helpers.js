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
 */
function drawCircle(x, y, radius, color) {
    game.context.fillStyle = getColorString(color);
    game.context.beginPath();
    game.context.arc(x, y, radius, 0, Math.PI*2, true); 
    game.context.closePath();
    game.context.fill();
}

/*
 * Function: drawLine
 * Draws a line to the screen from p1 to p2 with the given color and width.
 */
function drawLine(p1, p2, color, width) {
    game.context.strokeStyle = getColorString(color);
    game.context.lineWidth = width;
    game.context.beginPath();
    game.context.moveTo(p1[0], p1[1]);
    game.context.lineTo(p2[0], p2[1]);
    game.context.stroke();
}

/*
 * Function: getColorString
 * Returns a string that can be passed to the game context.
 */
function getColorString(color) {
    return "rgb(" + Math.floor(color[0]).toString() + ", " + Math.floor(color[1]).toString() + ", " + Math.floor(color[2]).toString() + ")";
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


/*
 * Function: findMaxEntry
 * Finds the entry with the largest value and returns the key value pair
 */
function findMaxEntry(dict) {
    var max = [null, -Number.MAX_VALUE];
    for (var key in dict) {
        if (this.sheep.hasOwnProperty(key)) {
            if (dict[key] > max) {
                max = [key, dict[key]];
            }
        }
    }
    return max;
}

/*
 * Function: countValues
 * Counts the values in the array. For [2, 2, 3, 4, 4] returns {2:2, 3:1, 4:3}.
 * Element, if not null, indicates the element of each array entry to check.
 *
 * eg arr[1][element]
 */
function countValues(arr, element) {
    var counts = {};
    if (element !== null) {
        for (var n in arr) {
            if (n[element] != null) {
                if (n[element] in Object.keys(counts)) {
                    counts[n[element]]++;
                }
                else {
                    counts[n[element]] = 1;
                }
            }
        }
    }
    else {
        for (var n in arr) {
            if (n != null) {
                if (n in Object.keys(counts)) {
                    counts[n]++;
                }
                else {
                    counts[n] = 1;
                }
            }
        }
    }

    return counts
}

/*
 * Function: removeElements
 * Removes the elements of arr2 from arr1. This is not, strictly speaking, an
 * array difference, but its close.
 */
function arrayDiff(arr1, arr2) {
    for (var i = 0; i < arr2.length; i++) {
        var index = arr1.indexOf(arr2[i]);
        if (index > -1) {
            arr1.splice(index, 1);
        }
    }
    return arr1;
}







/**
 *Converts an RGB color value to HSL. Conversion formula
 *adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 *Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}
