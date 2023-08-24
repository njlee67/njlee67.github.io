// canvas and render context vars
var mainCanvas;
var ctx;

// canvas manipulation
// This method should only be called once!
function setupCanvas() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    // mainCanvas.addEventListener('mousedown', UI.onPointerDown);
    // mainCanvas.addEventListener('mousemove', UI.onPointerMove);
    // mainCanvas.addEventListener('touchStart', (e) => handleTouch(e, UI.onPointerDown));
    // mainCanvas.addEventListener('mouseup', UI.onPointerUp);
    // mainCanvas.addEventListener('touchend', (e) => handleTouch(e, UI.onPointerUp));
    // mainCanvas.addEventListener('mousemove', UI.onPointerMove);
    // mainCanvas.addEventListener('touchmove', (e) => handleTouch(e, UI.onPointerMove));
    // mainCanvas.addEventListener('wheel', (e) => UI.onMouseWheel(e));
    updateDisplay();
}

window.addEventListener('load', setupCanvas);

function drawBackground() {
    let bg_color = "#444444";
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = bg_color;
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}

var radius = Math.round(window.innerHeight/3);
var overlapHexPadding = Math.round(radius/20);
var dynamicOverlapHexPadding = overlapHexPadding;
var doneWithShrink = false;
var doneWithExpansion = true;

function updateDisplay() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    drawBackground();

    // Start with lightgreen hexagons tessalated on entrie canvas so you can't see the edges
    
    //Animate the hexagons shrinking in front of dark grey background
    
    // Animate Iris mechanism on each hexagon with main image of each project
    if(doneWithShrink == false
    && (radius + dynamicOverlapHexPadding) > (0.85*radius) ) {

        dynamicOverlapHexPadding -= 0.25;
    }
    else if(doneWithShrink == false
    && (radius + dynamicOverlapHexPadding) <= (0.85*radius) ) {

        doneWithShrink = true;
    }
    else if(doneWithShrink == true
    && (radius + dynamicOverlapHexPadding) < (radius + overlapHexPadding)) {

        dynamicOverlapHexPadding += 1;
    }
    else if(doneWithShrink == true
    && (radius + dynamicOverlapHexPadding) >= (radius + overlapHexPadding)){
        doneWithShrink = false;
    }
    
    drawHexagonTessalation(radius, '#00FF00', dynamicOverlapHexPadding);


    //canvas
    requestAnimationFrame(updateDisplay);
}

function drawHexagonTessalation(radii, color, overlapHexPadding, startPosition = {x: 0, y: 0}, angleOffset = Math.PI/6) {
    var hexTesselationVerticalOffset = Math.sqrt(Math.pow(radii, 2) - Math.pow(radii/2, 2));
    var hexTesselationHorizontalOffset = 1.5*radii;

    // 1.5 * radius per iteration, so divide window.innerWidth by (1.5*radius) to find need number to fill width
    let numColumns = Math.ceil(window.innerWidth/(0.75*radii)) + 1;
    // 2 * hexTesselationVerticalOffset per vertical iteration so divide window.innerHeight by (2*hexTesselationVerticalOffset) to find number of needed rows
    let numRows = Math.ceil(window.innerHeight/(2*hexTesselationVerticalOffset))+ 2;

    for(var hexVertIndex = 0;hexVertIndex < numRows;hexVertIndex++) {
        for(var hexIndex = 0;hexIndex < numColumns;hexIndex++) {
            let hexIndexPosition = {x: (1.5*radii) * hexIndex, y: 2*hexTesselationVerticalOffset*(hexVertIndex)};
            if(hexIndex % 2 > 0) {
                hexIndexPosition.y -= hexTesselationVerticalOffset;
            }
            drawHexagon(radii + overlapHexPadding, hexIndexPosition, color, angleOffset);
        }
    }
}

function drawHexagon(radius, centerPositon, color, angleOffset = Math.PI/6) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerPositon.x, centerPositon.y);

    for(let vertex = 0;vertex < 7;vertex++) {
        ctx.lineTo(centerPositon.x + radius*Math.sin(vertex*Math.PI/3 + angleOffset), centerPositon.y + radius*Math.cos(vertex*Math.PI/3 + angleOffset));
    }

    ctx.closePath();
    ctx.fill();
}