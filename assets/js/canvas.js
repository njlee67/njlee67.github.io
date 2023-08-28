// Declare Canvas and Context Objects
var mainCanvas;
var ctx;

// Global Variables
let backgroundColor = "#00ff00";

// Animation Geometries that are incremented in updateCanvasAnimations() function to animate shapes
// hexagonApothem is the distance from the center to a vertex of fully tesselated hexagons at the load screen 
var hexagonApothem = Math.round(window.innerHeight/3);

// overlapHexPadding is a fraction of the hexagonApothem to remove the thin line that shows the background during the iris mechanism animation
// var overlapHexPadding = Math.round(hexagonApothem/20);

// dynamicOverlapHexPadding is a variable that is decremented each frame to shrink the black hexagons at page loading
// var dynamicOverlapHexPadding = overlapHexPadding;

// apertureDistance is the distance from the center of a hexagon in the direction from the center of the hexagon to a vertex
// iris animation is based on the iris mechanism similar to a camera shutter
var apertureEdgeThickness = 15;
var apertureopenedPercentage = 0;
var apertureDistance = 0;

class aperture {
    
    constructor(apertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, edgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, foregroundColor, backgroundColor) {
        this.apertureCenter = apertureCenter;

        this.hexagonalApothem = hexagonalApothem;

        // Constant Variables
        this.fullyShrunkenSize = this.toPixelsOfApothem(fullyShrunkenPercentage);
        this.fullyOpenedDistance = this.toPixelsOfApothem(fullyOpenedPercentage);
        this.edgeThickness = this.toPixelsOfApothem(edgeThicknessPercentage);

        // Dynamic Variables
        this.currentShrunkenSize = hexagonalApothem;
        this.currentOpenedDistance = this.toPixelsOfApothem(0);

        // Animation Speed Variables
        this.shrinkPixelsPerFrame = this.toPixelsOfApothem(shrinkPercentagePerFrame);
        this.openPixelsPerFrame = this.toPixelsOfApothem(this.openPixelsPerFrame);

        // Colors
        this.foregroundColor = foregroundColor;
        this.backgroundColor = backgroundColor;

        // Animation stage variables
        this.doneShrinking = false;
        this.doneOpeningOrClosing = false;
    }

    toPixelsOfApothem(percentageOfApothem) {
        return Math.round((percentageOfApothem/100.0)*this.hexagonalApothem);
    }

    checkDoneShrinking(setShrunkenSizeTo) {
        console.log("setshrunksizeto: " + setShrunkenSizeTo
                    + " fullyShrunkenPixels: " + this.fullyShrunkenSize);
        let setShrunkenCommandIsWithinBounds = setShrunkenSizeTo >= this.fullyShrunkenSize && setShrunkenSizeTo <= this.hexagonalApothem;
        
        if(!setShrunkenCommandIsWithinBounds) {
            this.doneShrinking = true;
        }
    }

    checkDoneOpeningOrClosing(setOpenPercentageTo) {
        let setOpenCommandIsWithinBounds = this.toPixelsOfApothem(setOpenPercentageTo) >= 0 
            && this.toPixelsOfApothem(setOpenPercentageTo) <= this.fullyOpenedDistance;
        
        if(!setOpenCommandIsWithinBounds) {
            this.doneOpeningOrClosing = true;
        }
    }

    shrinkAnimationStep() {
        this.checkDoneShrinking(this.currentShrunkenSize - this.shrinkPixelsPerFrame);        
        console.log("shrinkAnimationStep");
        if(!this.doneShrinking) {
            console.log("!donewithShrinking");
            this.currentShrunkenSize -= this.shrinkPixelsPerFrame;
            this.drawHexagon();
        }

        return this.doneShrinking;
    }

    openAnimationStep() {
        this.checkDoneOpeningOrClosing(this.currentOpenedDistance + this.openPixelsPerFrame);        
        
        if(!this.doneOpeningOrClosing) {
            this.currentOpenedDistance += this.openPixelsPerFrame;
            //this.drawAperature();
        }

        return this.doneOpeningOrClosing;
    }

    closeAnimationStep() {
        this.currentOpenedDistance += this.openPixelsPerFrame;

        this.doneOpening = Math.abs(this.fullyOpenedDistance - this.currentOpenedDistance) <= 0;

        if(!this.doneOpeningOrClosing) {
            //this.drawAperature();
        }

        return this.doneOpeningOrClosing;
    }
    
    setOpenedPercentage(setOpenPercentageTo) {

        let setOpenCommandWithinBounds = this.toPixelsOfApothem(setOpenPercentageTo) >= 0 
            && this.toPixelsOfApothem(setOpenPercentageTo) <= this.fullyOpenedDistance;
        
        if(setOpenCommandWithinBounds) {
            this.currentOpenedDistance = setOpenPercentageTo;
        }
        else {
            this.doneOpening = true;
        }

        if(!this.doneOpeningOrClosing) {
            //this.drawAperature();
        }
    }

    drawHexagon() {
        console.log("drawinghexagon");
        ctx.fillStyle = this.foregroundColor;
        
        // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
        ctx.beginPath();
        ctx.moveTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin(Math.PI/6), this.apertureCenter.y + this.currentShrunkenSize*Math.cos(Math.PI/6));
    
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin(vertex*Math.PI/3 + Math.PI/6), this.apertureCenter.y + this.currentShrunkenSize*Math.cos(vertex*Math.PI/3 + Math.PI/6));
        }
    
        ctx.closePath();
        ctx.fill();
    }
}
// TODO set parameter for apeture constructor to has a duration of open/close/shrink instead of a pixels per frame speed based on the FPS and percentges
var firstApeture = new aperture({x: window.innerWidth/2, y: window.innerHeight/2}, 
                                hexagonApothem,
                                50.0,
                                70,
                                5.0,
                                1.0,
                                1.0,
                                "black",
                                "red"
                                );

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
// percentageOfhexagonApothemIrisSize is what percentage of the hexagonApothem variable the apertureDistance should reduce to in animation
var percentOfhexagonApothemIrisSize = 0.7;

// shrinkHexSize is the percentage of the original hexagonApothem that the hexagons shirnk to in the beginning animation
var shrinkHexSize = 0.9;
var currentThumbnailScrollingCache = [];

var imageCacheCurrentInut = 0;
var numRadiiFitInWindowWidth = (Math.ceil(window.innerWidth/(hexagonApothem*1.5)) - 1);

// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    // Reset the background
    drawBackground();

    if(!firstApeture.doneShrinking) {
        firstApeture.shrinkAnimationStep();
    }
    
    if(firstApeture.doneShrinking) {
        firstApeture.drawHexagon();
    }

    // Conditionals for Animation Sequence

    // At webpage loading the screen is seemingly filled completely black

    // Shrink Tesselated Hexagons Animations: Decrement dynamicOverlapingHexPadding each frame for shrinking hexagon animation 
    // if(doneWithShrink == false && (hexagonApothem + dynamicOverlapHexPadding) > (shrinkHexSize*hexagonApothem) ) {
    //     dynamicOverlapHexPadding-= 0.25;
    // }
    // // Set doneWithShrink to true when shrinking is done...obviously lol
    // else if(doneWithShrink == false && (hexagonApothem + dynamicOverlapHexPadding) <= (shrinkHexSize*hexagonApothem) ) {
    //     doneWithShrink = true;
    // }

    // // Iris Mechanism Animation: Increment apertureDistance to initially 'open' iris mechanism animation
    // if(doneWithShrink == true && apertureDistance < shrinkHexSize*percentOfhexagonApothemIrisSize*(hexagonApothem - overlapHexPadding)){
    //     apertureDistance++;
    // }
    // else if(apertureDistance >= shrinkHexSize*percentOfhexagonApothemIrisSize*(hexagonApothem - overlapHexPadding)) {
    //     doneWithIris = true;
    // }
    // var offsetRenameThis = (window.innerWidth/hexagonApothem) - Math.floor(window.innerWidth/hexagonApothem);
    // // Scroll AnimationL as a project hexagon exits on the left it closes the iris mechanism and on the other side where entering the main window 

    // if(doneWithShrink && doneWithIris && startPose.x >= -hexagonApothem*1.5*numRadiiFitInWindowWidth) {
    //     for(var cachIndex = 0;cachIndex < numRadiiFitInWindowWidth;cachIndex++) {
    //         currentThumbnailScrollingCache.push(projectThumbnailImagesObjects[imageCacheCurrentInut + cachIndex]);
    //     }
        
    //     imageCacheCurrentInut+= numRadiiFitInWindowWidth;
    //     if(imageCacheCurrentInut > projectThumbnailImagesObjects.length -1) {
    //         imageCacheCurrentInut = imageCacheCurrentInut%projectThumbnailImagesObjects.length;
    //         currentThumbnailScrollingCache = [];
    //     }
    //     startPose.x -=1;
    // }
    // else {
    //     // reset after scrolled window.innerWidth length to scroll in a loop
    //     startPose.x = 0;
    // }

    // // drawHexagonTessalation draws the repeating pattern of hexagons and irisMechanisms dynamically
    // // TODO: add light mode feature that makes background black and foreground hexagons green in an animated color gradual color transition/inversion
    // drawHexagonTessalation(hexagonApothem, '#000000', dynamicOverlapHexPadding, startPose);
    
    // Canvas Animation
    requestAnimationFrame(updateCanvasAnimations);
}

// draws a single hexagon on the canvas with the centerPosition being the center of the regular hexagonand angleOffset being the rotation from where the first hexagon vertex is placed
function drawHexagon(hexagonApothem, centerPositon, color, angleOffset = Math.PI/6) {
    ctx.fillStyle = color;
    
    // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
    ctx.beginPath();
    ctx.moveTo(centerPositon.x + hexagonApothem*Math.sin(angleOffset), centerPositon.y + hexagonApothem*Math.cos(angleOffset));

    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin(vertex*Math.PI/3 + angleOffset), centerPositon.y + hexagonApothem*Math.cos(vertex*Math.PI/3 + angleOffset));
    }

    ctx.closePath();
    ctx.fill();
}

// drawIrisTriangles draws the 6 irregular quadrilaterals that make up a single iris mechanism
// irisMechnismDistanceFromCenter is the variable that controls how open or closed the irisMechanism Animation is
function drawIrisTriangles(hexagonApothem, centerPositon, color,irisMechanismDistanceFromCenter, clearanceSpacing = 7, angleOffset = Math.PI/6) {
    // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
    // Loop and draw the 6 quadrilaterals
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = color;
        ctx.beginPath();

        // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the hexagonApothem
        // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = hexagonApothem it is completely open but we use it as a border, so it never equals the hexagonApothem
        let openedPercentage = irisMechanismDistanceFromCenter/hexagonApothem;

        // The parallelToSideVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem variable
        let parallelToSideVector = {x: hexagonApothem*Math.sin(vertex*Math.PI/3 + angleOffset) - hexagonApothem*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: hexagonApothem*Math.cos(vertex*Math.PI/3 + angleOffset) -  hexagonApothem*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        
        // The parallelToSideVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
        let parallelToSideVectorPrev = {x: hexagonApothem*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - hexagonApothem*Math.sin((vertex)*Math.PI/3 + angleOffset), y: hexagonApothem*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  hexagonApothem*Math.cos((vertex)*Math.PI/3 + angleOffset)}
        
        // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
        let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + angleOffset) - Math.sin((vertex)*Math.PI/3 + angleOffset), y: Math.cos((vertex-1)*Math.PI/3 + angleOffset) - Math.cos((vertex)*Math.PI/3 + angleOffset)}
        
        // Draw the lines that make up each quadrilateral
        ctx.moveTo(centerPositon.x + openedPercentage*parallelToSideVector.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + openedPercentage*parallelToSideVector.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);

        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin((vertex)*Math.PI/3 + angleOffset) + (openedPercentage)*parallelToSideVectorPrev.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + hexagonApothem*Math.cos((vertex)*Math.PI/3 + angleOffset) + (openedPercentage)*parallelToSideVectorPrev.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);
        
        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin((vertex)*Math.PI/3 + angleOffset), centerPositon.y + hexagonApothem*Math.cos((vertex)*Math.PI/3 + angleOffset));

        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin((vertex+1)*Math.PI/3 + angleOffset) + openedPercentage*parallelToSideVector.x, centerPositon.y + hexagonApothem*Math.cos((vertex+1)*Math.PI/3 + angleOffset) + openedPercentage*parallelToSideVector.y);

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

    // 1.5 * hexagonApothem per iteration, so divide window.innerWidth by (1.5*hexagonApothem) to find number of coumns needed to fill the width
    let numberOfHexagonColumns = Math.ceil(window.innerWidth/(0.75*tesselationRadii)) +1;

    // 2 * hexTesselationVerticalOffset per vertical iteration so divide window.innerHeight by (2*hexTesselationVerticalOffset) to find number of needed rows
    let numberOfHexagonRows = Math.ceil(window.innerHeight/(2*hexTesselationVerticalOffset))+ 2;

    // Nested for loop to iterate through drawing rows anf columns of each hexagon or iris mechanism depending on the stage of the animation sequence
    // Loop through each row
    var thumbNailIndex = imageCacheCurrentInut;
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
            var irisBackdropColor = "red";
            if(doneWithShrink && !doneWithIris) {
                // drawHexagonBorderWindow
		        // drawHexagonBorderWindow(hexagonApothem + overlapHexPadding, currentTessalationPosition, irisBackdropColor, shrinkHexSize*percentOfhexagonApothemIrisSize, -1);
                ctx.drawImage(projectThumbnailImagesObjects[(imageCacheCurrentInut + thumbNailIndex)%projectThumbnailImagesObjects.length], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
                drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, apertureDistance - backdropApertureOffset, 0)
                let tooHighOrLowInY = currentTessalationPosition.y < (0.5*tesselationRadii) || currentTessalationPosition.y > window.innerHeight - (0.5*tesselationRadii);
                let tooRightOrLeft = currentTessalationPosition.x < (0.5*tesselationRadii) || (currentTessalationPosition.x > window.innerWidth - (0.5*tesselationRadii) );
                
                if(!tooHighOrLowInY && !tooRightOrLeft) {
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, apertureDistance, backdropApertureOffset)
                }
                else {
                    drawHexagon(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, angleOffset);
                }
                
                if(thumbNailIndex < numRadiiFitInWindowWidth-1) {
                    thumbNailIndex++;
                }
                else {
                    thumbNailIndex = 0;
                    console.log(thumbNailIndex);
                }
            }
            else if(doneWithIris) {
                let tooHighOrLowInY = currentTessalationPosition.y < (0.5*tesselationRadii) || currentTessalationPosition.y > window.innerHeight - (0.5*tesselationRadii);
                
                
                let tooRightOrLeft = currentTessalationPosition.x < apertureDistance || (currentTessalationPosition.x > window.innerWidth - apertureDistance && currentTessalationPosition.x < window.innerWidth );
                
                // Left edge of screen
                if(currentTessalationPosition.x < apertureDistance && currentTessalationPosition.x > backdropApertureOffset && !tooHighOrLowInY) {
                    console.log("imageCacheCurrentInut: " + imageCacheCurrentInut + " thumbNailIndex: " + thumbNailIndex);
                    ctx.drawImage(projectThumbnailImagesObjects[imageCacheCurrentInut + thumbNailIndex], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, Math.abs(currentTessalationPosition.x%apertureDistance) - backdropApertureOffset, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, Math.abs(currentTessalationPosition.x%apertureDistance), backdropApertureOffset);
                    if(thumbNailIndex < numRadiiFitInWindowWidth - 1) {
                        thumbNailIndex++;
                    }
                    else {
                        thumbNailIndex = 0;
                        console.log(thumbNailIndex);
                    }
                }
                // right edge of screen
                else if(currentTessalationPosition.x > window.innerWidth - apertureDistance && currentTessalationPosition.x < window.innerWidth - backdropApertureOffset && !tooHighOrLowInY) {
                    console.log("imageCacheCurrentInut: " + imageCacheCurrentInut + " thumbNailIndex: " + thumbNailIndex);
                    ctx.drawImage(projectThumbnailImagesObjects[imageCacheCurrentInut + thumbNailIndex], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, ((window.innerWidth) - currentTessalationPosition.x) - backdropApertureOffset, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, ((window.innerWidth) - currentTessalationPosition.x), backdropApertureOffset);
                    if(thumbNailIndex < numRadiiFitInWindowWidth -1  ) {
                        thumbNailIndex++;
                    }
                    else {
                        thumbNailIndex = 0;
                    }
                }
                
                else if((currentTessalationPosition.x >= window.innerWidth - backdropApertureOffset || currentTessalationPosition.x <= backdropApertureOffset) && !tooHighOrLowInY) {
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, 0, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, backdropApertureOffset, backdropApertureOffset)
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
                    console.log("imageCacheCurrentInut: " + imageCacheCurrentInut + " thumbNailIndex: " + thumbNailIndex);
                    ctx.drawImage(projectThumbnailImagesObjects[imageCacheCurrentInut + thumbNailIndex], currentTessalationPosition.x - removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, currentTessalationPosition.y - img.height*(removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*removeThisBadVariableImageScaling*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, irisBackdropColor, apertureDistance - backdropApertureOffset, 0);
                    drawIrisTriangles(tesselationRadii + overlapHexPadding, currentTessalationPosition, color, apertureDistance, backdropApertureOffset);
                    if(thumbNailIndex < numRadiiFitInWindowWidth-1 ) {
                        thumbNailIndex++;
                    }
                    else {
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


function drawHexagonBorderWindow(hexagonApothem, centerPositon, color,openedPercentage, clearanceSpacing = backdropApertureOffset, angleOffset = Math.PI/6) {
    for(let vertex = 0;vertex < 6;vertex++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        // let openedPercentage = 0.6;
        let parallelToSideVector = {x: hexagonApothem*Math.sin(vertex*Math.PI/3 + angleOffset) - hexagonApothem*Math.sin((vertex+1)*Math.PI/3 + angleOffset), y: hexagonApothem*Math.cos(vertex*Math.PI/3 + angleOffset) -  hexagonApothem*Math.cos((vertex+1)*Math.PI/3 + angleOffset)}
        let parallelToSideVectorPrev = {x: hexagonApothem*Math.sin((vertex-1)*Math.PI/3 + angleOffset) - hexagonApothem*Math.sin((vertex)*Math.PI/3 + angleOffset), y: hexagonApothem*Math.cos((vertex-1)*Math.PI/3 + angleOffset) -  hexagonApothem*Math.cos((vertex)*Math.PI/3 + angleOffset)}
        let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + angleOffset) - Math.sin((vertex)*Math.PI/3 + angleOffset), y: Math.cos((vertex-1)*Math.PI/3 + angleOffset) - Math.cos((vertex)*Math.PI/3 + angleOffset)}
        ctx.moveTo(centerPositon.x + openedPercentage*parallelToSideVector.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + openedPercentage*parallelToSideVector.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);

        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin((vertex)*Math.PI/3 + angleOffset) + (openedPercentage)*parallelToSideVectorPrev.x - clearanceSpacing*perpindicularToSideUnitVectorPrev.x, centerPositon.y + hexagonApothem*Math.cos((vertex)*Math.PI/3 + angleOffset) + (openedPercentage)*parallelToSideVectorPrev.y - clearanceSpacing*perpindicularToSideUnitVectorPrev.y);
        
        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin((vertex)*Math.PI/3 + angleOffset), centerPositon.y + hexagonApothem*Math.cos((vertex)*Math.PI/3 + angleOffset));

        ctx.lineTo(centerPositon.x + hexagonApothem*Math.sin((vertex+1)*Math.PI/3 + angleOffset) + openedPercentage*parallelToSideVector.x, centerPositon.y + hexagonApothem*Math.cos((vertex+1)*Math.PI/3 + angleOffset) + openedPercentage*parallelToSideVector.y);

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