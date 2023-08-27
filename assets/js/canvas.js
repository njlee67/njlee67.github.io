// Declare Canvas and Context Objects
var mainCanvas;
var ctx;

// Global Variables
let backgroundColor = "#00ff00";

// Animation Geometries that are incremented in updateCanvasAnimations() function to animate shapes

// radius is the distance from the center to a vertex of fully tesselated hexagons at the load screen 
var radius = Math.round(window.innerHeight/3);

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
projectThumbnailImagesPaths = [
    // LMBBv2
    '/images/fulls/LMBB v2.jpg',
    'images/fulls/design-and-manufacturing-2-Yo-Yos.jpg',
    'images/fulls/dont-stress-hoodie.jpg',
    'images/fulls/LMBB v1.0.jpg',
    'images/fulls/No-Cap-Hoodie.jpg',
    'images/fulls/QUAD.PNG',
    'images/fulls/youre-a-real-1-hoodie.jpg',
    'images/fulls/LMBB v2.jpg',
    'images/fulls/ALEEgators.jpg',
    'images/fulls/SatchPack-v1.jpg'
    // SatchPack
    // Gazebo Walking Simulation
    // Quadruped Robot QUAD
    // STEM FriendLEE Tees
    // 2.008 Yoyos
    // Shoe Design
    // Cosmic Clash
];

projectThumbnailImagesObjects = [];

// Loading Images
for(let imageIndex = 0;imageIndex < projectThumbnailImagesPaths.length;imageIndex++) {
    var img = new Image();
    img.onload = function(){ 
        imageLoaded = true;   
    };

    img.src = projectThumbnailImagesPaths[imageIndex];
    projectThumbnailImagesObjects.push(img);
}
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
    var offsetRenameThis = (window.innerWidth/radius) - Math.floor(window.innerWidth/radius);
    // Scroll AnimationL as a project hexagon exits on the left it closes the iris mechanism and on the other side where entering the main window 
    if(doneWithShrink && doneWithIris && startPose.x >= -radius*1.5*(Math.ceil(window.innerWidth/(radius*1.5)) - 1)) {
        startPose.x -=2;
    }
    else {
        // reset after scrolled window.innerWidth length to scroll in a loop
        startPose.x = 0;
    }

    // drawHexagonTessalation draws the repeating pattern of hexagons and irisMechanisms dynamically
    // TODO: add light mode feature that makes background black and foreground hexagons green in an animated color gradual color transition/inversion
    drawHexagonTessalation(radius, '#000000', dynamicOverlapHexPadding, startPose);
    
    // Canvas Animation
    requestAnimationFrame(updateCanvasAnimations);
}

// draws a single hexagon on the canvas with the centerPosition being the center of the regular hexagonand angleOffset being the rotation from where the first hexagon vertex is placed
function drawHexagon(radius, centerPositon, color, angleOffset = Math.PI/6) {
    ctx.fillStyle = color;
    
    // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
    ctx.beginPath();
    ctx.moveTo(centerPositon.x + radius*Math.sin(angleOffset), centerPositon.y + radius*Math.cos(angleOffset));

    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.lineTo(centerPositon.x + radius*Math.sin(vertex*Math.PI/3 + angleOffset), centerPositon.y + radius*Math.cos(vertex*Math.PI/3 + angleOffset));
    }

    ctx.closePath();
    ctx.fill();
}

// drawIrisTriangles draws the 6 irregular quadrilaterals that make up a single iris mechanism
// irisMechnismDistanceFromCenter is the variable that controls how open or closed the irisMechanism Animation is
function drawIrisTriangles(radius, centerPositon, color,irisMechanismDistanceFromCenter, clearanceSpacing = 7, angleOffset = Math.PI/6) {
    // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfRadiusIrisSize*radius, centerPositon.y - img.height*(shrinkHexSize*percentOfRadiusIrisSize*radius/img.width), 2*shrinkHexSize*percentOfRadiusIrisSize*radius, img.height*(2*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width));
    // Loop and draw the 6 quadrilaterals
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = color;
        ctx.beginPath();

        // percentageOpen is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the radius
        // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = radius it is completely open but we use it as a border, so it never equals the radius
        let percentageOpen = irisMechanismDistanceFromCenter/radius;

        // The parallelToSideVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the radius variable
        let parallelToSideVector = {x: radius*Math.sin(vertex*Math.PI/3 + angleOffset) - radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: radius*Math.cos(vertex*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        
        // The parallelToSideVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
        let parallelToSideVectorPrev = {x: radius*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - radius*Math.sin((vertex)*Math.PI/3 + angleOffset), y: radius*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex)*Math.PI/3 + angleOffset)}
        
        // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
        let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + angleOffset) - Math.sin((vertex)*Math.PI/3 + angleOffset), y: Math.cos((vertex-1)*Math.PI/3 + angleOffset) - Math.cos((vertex)*Math.PI/3 + angleOffset)}
        
        // Draw the lines that make up each quadrilateral
        ctx.moveTo(centerPositon.x + percentageOpen*parallelToSideVector.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + percentageOpen*parallelToSideVector.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*parallelToSideVectorPrev.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*parallelToSideVectorPrev.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);
        
        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset), centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset));

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*parallelToSideVector.x, centerPositon.y + radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*parallelToSideVector.y);

        ctx.closePath();
        ctx.fill();
    }

}

// drawHexagonTessalation() draws the repeating pattern of hexagons on the canvas with the origin at the startPosition
function drawHexagonTessalation(tesselationRadii, color, overlapHexPadding, startPosition = {x: 0, y: 0}, angleOffset = Math.PI/6) {
    // hexTesselationVerticalOffset is the vertical component of the vector from the center of one hexagon to an adjacent hexagon in a tessalation
    var hexTesselationVerticalOffset = Math.sqrt(Math.pow(tesselationRadii, 2) - Math.pow(tesselationRadii/2, 2));

    // hexTesselationHorizontalOffset is the horizontal component of the vector from the center of one hexagon to an adjacent hexagon in a tessalation
    var hexTesselationHorizontalOffset = 1.5*tesselationRadii; 

    // 1.5 * radius per iteration, so divide window.innerWidth by (1.5*radius) to find number of coumns needed to fill the width
    let numberOfHexagonColumns = Math.ceil(window.innerWidth/(0.75*tesselationRadii)) +1;

    // 2 * hexTesselationVerticalOffset per vertical iteration so divide window.innerHeight by (2*hexTesselationVerticalOffset) to find number of needed rows
    let numberOfHexagonRows = Math.ceil(window.innerHeight/(2*hexTesselationVerticalOffset))+ 2;

    var thumbNailIndex = 0;
    // Nested for loop to iterate through drawing rows anf columns of each hexagon or iris mechanism depending on the stage of the animation sequence
    // Loop through each row
    for(var verticalIndex = 0;verticalIndex < numberOfHexagonRows;verticalIndex++) {
        // Loop through each column 
        for(var horizontalIndex = 0;horizontalIndex < numberOfHexagonColumns;horizontalIndex++) {
            // currentTessalationPosition uses the vertical and horizontal indices to determine the center of the hexagon or Iris in the tessalation
            let currentTessalationPosition = {x: startPosition.x + (1.5*tesselationRadii) * horizontalIndex, y: startPosition.y + 2*hexTesselationVerticalOffset*(verticalIndex)};
            
            // If the horizontalIndexIsOdd then the loop will conditionally draw two hexagons or iris mechanisms -hexTesselationVerticalOffset
            var horizontalIndexIsOdd = horizontalIndex % 2 > 0
            if(horizontalIndexIsOdd) {
                currentTessalationPosition.y -= hexTesselationVerticalOffset;
            }

            // Conditional animations based on the stage of the canvas animation sequence controlled with incremented/decremented variables in the main loop updateCanvasAnimation
            // After the hexagons shrink animate the initial opening of the iris mechnisms
            var removeThisBadVariableImageScaling = 1;
            var backdropIrisOffset = 15;
            var irisBackdropColor = "red";
            if(doneWithShrink && !doneWithIris) {
                // drawHexagonBorderWindow
		        // drawHexagonBorderWindow(radius + overlapHexPadding, currentTessalationPosition, irisBackdropColor, shrinkHexSize*percentOfRadiusIrisSize, -1);
                ctx.drawImage(projectThumbnailImagesObjects[(horizontalIndex*verticalIndex)%projectThumbnailImagesObjects.length], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width));
                drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, irisDistance - backdropIrisOffset, 0)
                let tooHighOrLowInY = currentTessalationPosition.y < (0.5*tesselationRadii) || currentTessalationPosition.y > window.innerHeight - (0.5*tesselationRadii);
                let tooRightOrLeft = currentTessalationPosition.x < (0.5*tesselationRadii) || (currentTessalationPosition.x > window.innerWidth - (0.5*tesselationRadii) );
                
                if(!tooHighOrLowInY && !tooRightOrLeft) {
                    drawIrisTriangles(tesselationRadii + 0*overlapHexPadding, currentTessalationPosition, color, irisDistance, backdropIrisOffset)
                }
                else {
                    drawHexagon(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, angleOffset);
                }
                
                
            }
            else if(doneWithIris) {
                let tooHighOrLowInY = currentTessalationPosition.y < (0.5*tesselationRadii) || currentTessalationPosition.y > window.innerHeight - (0.5*tesselationRadii);
                
                
                let tooRightOrLeft = currentTessalationPosition.x < irisDistance || (currentTessalationPosition.x > window.innerWidth - irisDistance && currentTessalationPosition.x < window.innerWidth );
                
                // Left edge of screen
                if(currentTessalationPosition.x < irisDistance && currentTessalationPosition.x > backdropIrisOffset && !tooHighOrLowInY) {
                    ctx.drawImage(projectThumbnailImagesObjects[(horizontalIndex*verticalIndex)%projectThumbnailImagesObjects.length], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width));
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, Math.abs(currentTessalationPosition.x%irisDistance) - backdropIrisOffset, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, Math.abs(currentTessalationPosition.x%irisDistance), backdropIrisOffset);
                    if(thumbNailIndex < (projectThumbnailImagesObjects.length - 1)) {
                        thumbNailIndex++;
                    }
                    else {
                        thumbNailIndex = 0;
                        console.log(thumbNailIndex);
                    }
                }
                // right edge of screen
                else if(currentTessalationPosition.x > window.innerWidth - irisDistance && currentTessalationPosition.x < window.innerWidth && !tooHighOrLowInY) {
                    ctx.drawImage(projectThumbnailImagesObjects[(horizontalIndex*verticalIndex)%projectThumbnailImagesObjects.length], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width));
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, ((window.innerWidth) - currentTessalationPosition.x) - backdropIrisOffset, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, ((window.innerWidth) - currentTessalationPosition.x), backdropIrisOffset);
                    if(thumbNailIndex < (projectThumbnailImagesObjects.length - 1)) {
                        thumbNailIndex++;
                    }
                    else {
                        thumbNailIndex = 0;
                        console.log(thumbNailIndex);
                    }
                }
                
                else if((currentTessalationPosition.x >= window.innerWidth || currentTessalationPosition.x <= backdropIrisOffset) && !tooHighOrLowInY) {
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, 0, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, backdropIrisOffset, backdropIrisOffset)
                    // drawHexagon(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, angleOffset);
                }
                // just hexagons at top screen
                else if(tooHighOrLowInY) {
                    // drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, 0, 0);
                    // drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color,-4)
                    drawHexagon(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, angleOffset);
                }
                // Fully opened irises mid screen
                else {
                    ctx.drawImage(projectThumbnailImagesObjects[(horizontalIndex*verticalIndex)%projectThumbnailImagesObjects.length], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfRadiusIrisSize*radius/img.width));
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, irisDistance - backdropIrisOffset, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, irisDistance, backdropIrisOffset);
                    if(thumbNailIndex < (projectThumbnailImagesObjects.length - 1)) {
                        thumbNailIndex++;
                    }
                    else {
                        console.log(thumbNailIndex);
                        thumbNailIndex = 0;
                    }

                }
                // console.log(projectThumbnailImagesObjects.length);
            }
            else {
                drawHexagon(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, angleOffset);
            }
        }
    }
}


function drawHexagonBorderWindow(radius, centerPositon, color,percentageOpen, clearanceSpacing = backdropIrisOffset, angleOffset = Math.PI/6) {
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        // let percentageOpen = 0.6;
        let parallelToSideVector = {x: radius*Math.sin(vertex*Math.PI/3 + angleOffset) - radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: radius*Math.cos(vertex*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        let parallelToSideVectorPrev = {x: radius*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - radius*Math.sin((vertex)*Math.PI/3 + angleOffset), y: radius*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  radius*Math.cos((vertex)*Math.PI/3 + angleOffset)}
        let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + angleOffset) - Math.sin((vertex)*Math.PI/3 + angleOffset), y: Math.cos((vertex-1)*Math.PI/3 + angleOffset) - Math.cos((vertex)*Math.PI/3 + angleOffset)}
        ctx.moveTo(centerPositon.x + percentageOpen*parallelToSideVector.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + percentageOpen*parallelToSideVector.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*parallelToSideVectorPrev.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset) + (percentageOpen)*parallelToSideVectorPrev.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);
        
        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex)*Math.PI/3 + angleOffset), centerPositon.y + radius*Math.cos((vertex)*Math.PI/3 + angleOffset));

        ctx.lineTo(centerPositon.x + radius*Math.sin((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*parallelToSideVector.x, centerPositon.y + radius*Math.cos((vertex+1)*Math.PI/3 + angleOffset) + percentageOpen*parallelToSideVector.y);

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