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
var startPose = {x: 0, y: 0};
var irisDistance = 0;
var seisColores = [];
for(let colo = 0;colo < 6;colo++){
    seisColores.push(getRandomColor());
}
function updateDisplay() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    drawBackground();

    // Start with lightgreen hexagons tessalated on entrie canvas so you can't see the edges
    
    //Animate the hexagons shrinking in front of dark grey background
    
    // Animate Iris mechanism on each hexagon with main image of each project
    if(doneWithShrink == false
    && (radius + dynamicOverlapHexPadding) > (0.9*radius) ) {

        dynamicOverlapHexPadding--;
    }
    else if(doneWithShrink == false
    && (radius + dynamicOverlapHexPadding) <= (0.9*radius) ) {

        doneWithShrink = true;
    }

    if(doneWithShrink == true
    && irisDistance < 0.7*(radius - overlapHexPadding)){
        irisDistance ++;
    }
    else {
        irisDistance = irisDistance;
    }
    // else if(doneWithShrink == true
    // && (radius + dynamicOverlapHexPadding) < (radius + overlapHexPadding)) {

    //     dynamicOverlapHexPadding += 0.25;
    // }
    // else if(doneWithShrink == true
    // && (radius + dynamicOverlapHexPadding) >= (radius + overlapHexPadding)){
    //     doneWithShrink = false;
    // }
    
    drawHexagonTessalation(radius, '#77dd00', dynamicOverlapHexPadding, startPose);


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
            let hexIndexPosition = {x: startPosition.x + (1.5*radii) * hexIndex, y: startPosition.y + 2*hexTesselationVerticalOffset*(hexVertIndex)};
            if(hexIndex % 2 > 0) {
                hexIndexPosition.y -= hexTesselationVerticalOffset;
            }
            if(doneWithShrink) {
                drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, irisDistance)
            }
            else {
                drawHexagon(radii + overlapHexPadding, hexIndexPosition, color, angleOffset);
            }
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

function drawIrisTriangles(radius, centerPositon, color,irisMechanismDistanceFromCenter, angleOffset = Math.PI/6) {
    
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = seisColores[vertex];
        ctx.beginPath();
        let percentageOpen = irisMechanismDistanceFromCenter/radius;
        let perpindicularToSideVector = {x: radius*Math.sin(vertex*Math.PI/3 + angleOffset) - radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: radius*Math.cos(vertex*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        let perpindicularToSideVectorPrev = {x: radius*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - radius*Math.sin((vertex)*Math.PI/3 + angleOffset), y: radius*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex)*Math.PI/3 + angleOffset)}
   
        ctx.moveTo(centerPositon.x + percentageOpen*perpindicularToSideVector.x, centerPositon.y + percentageOpen*perpindicularToSideVector.y);

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*perpindicularToSideVectorPrev.x, centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*perpindicularToSideVectorPrev.y);
        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset) + (0)*perpindicularToSideVectorPrev.x, centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset) + (0)*perpindicularToSideVectorPrev.y);

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*perpindicularToSideVector.x, centerPositon.y + radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*perpindicularToSideVector.y);

        ctx.closePath();
        ctx.fill();
    }

}

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}