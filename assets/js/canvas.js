// Declare Canvas and Context Objects
var mainCanvas;
var ctx;

// Global Variables
let backgroundColor = "#00ff00";

// Animation Geometries that are incremented in updateCanvasAnimations() function to animate shapes

// radius is the distance from the center to a vertex of fully tesselated hexagons at the load screen 
var radius = Math.round(window.innerHeight/2.7);

// overlapHexPadding is a fraction of the radius to remove the thin line that shows the background during the iris mechanism animation
var overlapHexPadding = Math.round(radius/20);

// dynamicOverlapHexPadding is a variable that is decremented each frame to shrink the black hexagons at page loading
var dynamicOverlapHexPadding = overlapHexPadding;

// irisDistance is the distance from the center of a hexagon in the direction from the center of the hexagon to a vertex
// iris animation is based on the iris mechanism similar to a camera shutter
var irisDistance = 0;

// startPose is the upper lefthand corner where the hexagon tessselation animation starts and is also decremented for the scrolling animation
var startPose = {x: 0, y: 20};

// Animation sequence states to know when to move on to the next stage of animation sequence
var doneWithShrink = false;
var doneWithIris = false;
var imageLoaded = false;

var innerIrisMechnismBackgroundColors = ['#FF0000', 
                    '#FF0000',
                    '#FFFF00',
                    '#FF00FF',
                    '#0000FF',
                    '#ffaa00'
                ];

// This method should only be called once!
function setupCanvas() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");

    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    
    // updateCanvasAnimations handles the sequence of the canvas animations
    updateCanvasAnimations();
}

// Ensures setupCanvas() is run only once
window.addEventListener('load', setupCanvas);

// Draws background rectangle object on the canvas
function drawBackground() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}

// List of thumbnail images for each project bordered by hexagonal iris mechanism 
projectThumbnailImages = [];

// Loading Images
var img = new Image();
img.onload = function(){ 
    imageLoaded = true;   
};

img.src = "/images/fulls/LMBB v2.jpg";

// percentageOfRadiusIrisSize is what percentage of the radius variable the irisDistance should reduce to in animation
var percentOfRadiusIrisSize = 0.7;

// shrinkHexSize is the percentage of the original radius that the hexagons shirnk to in the beginning animation
var shrinkHexSize = 0.9;

// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    // Reset the background
    drawBackground();

    // Conditionals for Animation Sequence

    // At webpage loading the screen is seemingly filled completely black

    // Shrink Tesselated Hexagons Animations: Decrement dynamicOverlapingHexPadding each frame for shrinking hexagon animation 
    if(doneWithShrink == false && (radius + dynamicOverlapHexPadding) > (shrinkHexSize*radius) ) {
        dynamicOverlapHexPadding-= 0.25;
    }
    // Set doneWithShrink to true when shrinking is done...obviously lol
    else if(doneWithShrink == false && (radius + dynamicOverlapHexPadding) <= (shrinkHexSize*radius) ) {
        doneWithShrink = true;
    }

    // Iris Mechanism Animation: Increment irisDistance to initially 'open' iris mechanism animation
    if(doneWithShrink == true && irisDistance < shrinkHexSize*percentOfRadiusIrisSize*(radius - overlapHexPadding)){
        irisDistance++;
    }
    else if(irisDistance >= shrinkHexSize*percentOfRadiusIrisSize*(radius - overlapHexPadding)) {
        doneWithIris = true;
    }

    // Scroll AnimationL as a project hexagon exits on the left it closes the iris mechanism and on the other side where entering the main window 
    if(doneWithShrink && doneWithIris && startPose.x > -window.innerWidth + 0.5*radius) {
        startPose.x --;
    }
    else {
        // reset after scrolled window.innerWidth length to scroll in a loop
        startPose.x = 0;
    }

    // drawHexagonTessalation(radius, '#37E300', dynamicOverlapHexPadding, startPose);
    drawHexagonTessalation(radius, '#000000', dynamicOverlapHexPadding, startPose);
    // ctx.drawImage(img, window.innerWidth/2 - 0.7*radius, window.innerHeight/2 - img.height*(0.7*radius/img.width), 2*0.7*radius, img.height*(2*0.7*radius/img.width));
    
    //canvas
    requestAnimationFrame(updateCanvasAnimations);
}

var closeIrisDuringScrollDistance = radius;

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
            if(doneWithShrink && !doneWithIris) {
                // drawHexagon(0.55*(radius - overlapHexPadding), hexIndexPosition, '#000000', angleOffset);
                drawHexagonBorderWindow(radius + overlapHexPadding, hexIndexPosition, innerIrisMechnismBackgroundColors[(hexIndex*hexVertIndex)%innerIrisMechnismBackgroundColors.length], shrinkHexSize*percentOfRadiusIrisSize, -1);
                

                let tooHighOrLowInY = hexIndexPosition.y < (0.5*radii) || hexIndexPosition.y > window.innerHeight - (0.5*radii);
                let tooRightOrLeft = hexIndexPosition.x < (0.5*radii) || (hexIndexPosition.x > window.innerWidth - (0.5*radii) );

                if(!tooHighOrLowInY && !tooRightOrLeft) {
                    drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, irisDistance)
                }
                else {
                    drawHexagon(radii + overlapHexPadding, hexIndexPosition, color, angleOffset);
                }
                
                
            }
            else if(doneWithIris) {
                let tooHighOrLowInY = hexIndexPosition.y < (0.5*radii) || hexIndexPosition.y > window.innerHeight - (0.5*radii);
                // drawHexagonBorderWindow(radii + overlapHexPadding, hexIndexPosition, innerIrisMechnismBackgroundColors[(hexIndex*hexVertIndex)%innerIrisMechnismBackgroundColors.length], angleOffset);
                // drawHexagon(0.55*(radius - overlapHexPadding), hexIndexPosition, '#000000', angleOffset);
                drawHexagonBorderWindow(radii + overlapHexPadding, hexIndexPosition, innerIrisMechnismBackgroundColors[(hexIndex*hexVertIndex)%innerIrisMechnismBackgroundColors.length], shrinkHexSize*percentOfRadiusIrisSize, -1);

                let tooRightOrLeft = hexIndexPosition.x < irisDistance || (hexIndexPosition.x > window.innerWidth - irisDistance && hexIndexPosition.x < window.innerWidth );

                if(hexIndexPosition.x < irisDistance && !tooHighOrLowInY) {
                    drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, Math.abs(hexIndexPosition.x%irisDistance), -2)
                }
                else if(hexIndexPosition.x > window.innerWidth - irisDistance && hexIndexPosition.x < window.innerWidth && !tooHighOrLowInY) {
                    drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, ((window.innerWidth) - hexIndexPosition.x), 7)
                    
                }
                else if(hexIndexPosition.x >= window.innerWidth) {
                    drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, 0, -2)
                }
                else if(tooHighOrLowInY) {
                    drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, 0, -2)

                }
                else {
                    drawIrisTriangles(radii + overlapHexPadding, hexIndexPosition, color, irisDistance, 7)
                }

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

function drawIrisTriangles(radius, centerPositon, color,irisMechanismDistanceFromCenter, clearanceSpacing = 7, angleOffset = Math.PI/6) {
    // ctx.drawImage(img, centerPositon.x - 0.6*radius, centerPositon.y - img.height*(0.6*radius/img.width), 2*0.6*radius, img.height*(2*0.6*radius/img.width));
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        let percentageOpen = irisMechanismDistanceFromCenter/radius;
        let perpindicularToSideVector = {x: radius*Math.sin(vertex*Math.PI/3 + angleOffset) - radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: radius*Math.cos(vertex*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        let perpindicularToSideVectorPrev = {x: radius*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - radius*Math.sin((vertex)*Math.PI/3 + angleOffset), y: radius*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex)*Math.PI/3 + angleOffset)}
        let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + angleOffset) - Math.sin((vertex)*Math.PI/3 + angleOffset), y: Math.cos((vertex-1)*Math.PI/3 + angleOffset) - Math.cos((vertex)*Math.PI/3 + angleOffset)}
        ctx.moveTo(centerPositon.x + percentageOpen*perpindicularToSideVector.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + percentageOpen*perpindicularToSideVector.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*perpindicularToSideVectorPrev.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*perpindicularToSideVectorPrev.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);
        
        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset), centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset));

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*perpindicularToSideVector.x, centerPositon.y + radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*perpindicularToSideVector.y);

        ctx.closePath();
        ctx.fill();
    }

}

function drawHexagonBorderWindow(radius, centerPositon, color,percentageOpen, clearanceSpacing = 7, angleOffset = Math.PI/6) {
    ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfRadiusIrisSize*radius, centerPositon.y - img.height*(shrinkHexSize*percentOfRadiusIrisSize*radius/img.width), 2*shrinkHexSize*percentOfRadiusIrisSize*radius, img.height*(2*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width));
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        // let percentageOpen = 0.6;
        let perpindicularToSideVector = {x: radius*Math.sin(vertex*Math.PI/3 + angleOffset) - radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: radius*Math.cos(vertex*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        let perpindicularToSideVectorPrev = {x: radius*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - radius*Math.sin((vertex)*Math.PI/3 + angleOffset), y: radius*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex)*Math.PI/3 + angleOffset)}
        let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + angleOffset) - Math.sin((vertex)*Math.PI/3 + angleOffset), y: Math.cos((vertex-1)*Math.PI/3 + angleOffset) - Math.cos((vertex)*Math.PI/3 + angleOffset)}
        ctx.moveTo(centerPositon.x + percentageOpen*perpindicularToSideVector.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + percentageOpen*perpindicularToSideVector.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*perpindicularToSideVectorPrev.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*perpindicularToSideVectorPrev.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);
        
        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset), centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset));

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