// Declare Canvas and Context Objects
var mainCanvas;
var ctx;

// Global Variables
// let backgroundColor = "#FEFF0B";
let backgroundColor = "#00cc00";
// let backgroundColor = "#777777";

// Animation Geometries that are incremented in updateCanvasAnimations() function to animate shapes
// hexagonApothem is the distance from the center to a vertex of fully tesselated hexagons at the load screen 
var hexagonApothem = Math.round(window.innerHeight/3);

// overlapHexPadding is a fraction of the hexagonApothem to remove the thin line that shows the background during the iris mechanism animation
// var overlapHexPadding = Math.round(hexagonApothem/20);

// dynamicOverlapHexPadding is a variable that is decremented each frame to shrink the black hexagons at page loading
// var dynamicOverlapHexPadding = overlapHexPadding;

// List of thumbnail images for each project bordered by hexagonal iris mechanism 
projectThumbnailImagesPaths = [
    '/images/fulls/LMBB v2.jpg',
    'images/fulls/design-and-manufacturing-2-Yo-Yos.jpg',
    'images/fulls/dont-stress-hoodie.jpg',
    'images/fulls/LMBB v1.0.jpg',
    'images/fulls/No-Cap-Hoodie.jpg',
    'images/fulls/QUAD.PNG',
    'images/fulls/SatchPack-v1.jpg',
    'images/fulls/youre-a-real-1-hoodie.jpg',
    'images/fulls/ALEEgators.jpg'
    // Gazebo Walking Simulation
];

// apertureDistance is the distance from the center of a hexagon in the direction from the center of the hexagon to a vertex
// iris animation is based on the iris mechanism similar to a camera shutter
var aperturefullEdgeThickness = 15;
var apertureopenedPercentage = 0;
var apertureDistance = 0;

class aperture {
    
    constructor(apertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor) {
        this.apertureCenter = apertureCenter;

        this.hexagonalApothem = hexagonalApothem;

        // Constant Variables
        this.fullyShrunkenSize = this.toPixelsOfApothem(fullyShrunkenPercentage);
        this.fullyOpenedDistance = this.toPixelsOfApothem(fullyOpenedPercentage);
        this.fullEdgeThickness = this.toPixelsOfApothem(fullEdgeThicknessPercentage);

        // Dynamic Variables
        this.currentShrunkenSize = hexagonalApothem;
        this.currentOpenedDistance = 0;
        this.currentEdgeThickness = 0;

        // Animation Speed Variables
        this.shrinkPixelsPerFrame = this.toPixelsOfApothem(shrinkPercentagePerFrame);
        this.openPixelsPerFrame = this.toPixelsOfApothem(openPercentagePerFrame);
        this.edgePixelsPerFrame = this.toPixelsOfApothem(edgePercentagePerFrame);

        // Colors
        this.foregroundColor = foregroundColor;
        this.backgroundColor = backgroundColor;

        // Animation stage variables
        this.doneShrinking = false;
        this.doneExpanding = false;
        this.doneOpeningEdge = false;
        this.doneClosingEdge = false;
        this.doneOpeningApertureHole = false;
        this.doneClosingApertureHole = false;
        this.projectThumbnail = null;
        this.projectThumbnailLoaded = false;
    }

    toPixelsOfApothem(percentageOfApothem) {
        return ((percentageOfApothem/100.0)*this.hexagonalApothem);
    }

    checkIfShrinkingOutsideLimits(setShrunkenSizeTo) {
        let setShrunkenCommandOutsideLimits = setShrunkenSizeTo < this.fullyShrunkenSize || setShrunkenSizeTo > this.hexagonalApothem;
        
        if(setShrunkenCommandOutsideLimits) {
            if(setShrunkenSizeTo < this.fullyShrunkenSize) {
                this.currentShrunkenSize = this.fullyShrunkenSize;
            }
            else if(setShrunkenSizeTo > this.hexagonalApothem) {
                this.currentShrunkenSize = this.hexagonalApothem;
            }
            return true;
        }
        else {
            return false;
        }
    }

    checkIfApertureHoleOutsideLimits(setOpenDistanceTo) {
        let setOpenCommandIsOutsideLimits = setOpenDistanceTo < 0 || setOpenDistanceTo > this.fullyOpenedDistance;
        
        if(setOpenCommandIsOutsideLimits) {
            if(setOpenDistanceTo < 0) {
                this.currentOpenedDistance = 0;
            }
            else if(setOpenDistanceTo > this.fullyOpenedDistance) {
                this.currentOpenedDistance = this.fullyOpenedDistance;
            }

            return true;
        }
        else {
            return false;
        }
    }
    
    checkIfEdgeThicknessOutsideLimits(setEdgeThicknessTo) {
        let setEdgeCommandIsOutsideLimits = setEdgeThicknessTo < 0 || setEdgeThicknessTo > this.fullEdgeThickness;
        
        if(setEdgeCommandIsOutsideLimits) {
            if(setEdgeThicknessTo < 0) {
                this.currentEdgeThickness = 0;
            }
            else if(setEdgeThicknessTo > this.fullEdgeThickness) {
                this.currentEdgeThickness = this.fullEdgeThickness;
            }

            return true;
        }
        else {
            return false;
        }
    }

    shrinkAnimationStep() {
        this.doneShrinking = this.checkIfShrinkingOutsideLimits(this.currentShrunkenSize - this.shrinkPixelsPerFrame);        
        
        if(!this.doneShrinking) {
            this.currentShrunkenSize -= this.shrinkPixelsPerFrame;
            this.drawCurrent();
        }
    }

    expandAnimationStep() {
        this.doneExpanding = this.checkIfShrinkingOutsideLimits(this.currentShrunkenSize + this.shrinkPixelsPerFrame);        
        
        if(!this.doneExpanding) {
            this.currentShrunkenSize += this.shrinkPixelsPerFrame;
            this.drawCurrent();
        }
    }

    edgeOpenAnimationStep() {
        this.doneOpeningEdge = this.checkIfEdgeThicknessOutsideLimits(this.currentEdgeThickness + this.edgePixelsPerFrame);        
        
        if(!this.doneOpeningEdge) {
            if(!this.checkIfApertureHoleOutsideLimits(this.currentOpenedDistance + this.edgePixelsPerFrame)) {
                this.currentOpenedDistance += this.edgePixelsPerFrame;
            }
            this.currentEdgeThickness += this.edgePixelsPerFrame;
            this.drawCurrent();
        }
    }
    
    // TODO: remove the pixelsperframe needed in the checkifoutsidelimits methods cuz it's confusing to remember the +/-
    edgeCloseAnimationStep() {
        this.doneClosingEdge = this.checkIfEdgeThicknessOutsideLimits(this.currentEdgeThickness);        
        
        if(!this.doneClosingEdge) {
            if(!this.checkIfApertureHoleOutsideLimits(this.currentOpenedDistance)) {
                this.currentOpenedDistance -= this.edgePixelsPerFrame;
            }
            this.currentEdgeThickness -= this.edgePixelsPerFrame;
            this.drawCurrent();
        }
    }

    openAnimationStep() {
        this.doneOpeningApertureHole = this.checkIfApertureHoleOutsideLimits(this.currentOpenedDistance + this.openPixelsPerFrame);        
        
        if(!this.doneOpeningApertureHole) {
            this.currentOpenedDistance += this.openPixelsPerFrame;
            this.drawCurrent();
        }
    }
    
    closeAnimationStep() {
        this.doneClosingApertureHole = this.checkIfApertureHoleOutsideLimits(this.currentOpenedDistance);   
        
        if(!this.doneClosingApertureHole) {
            this.currentOpenedDistance -= this.openPixelsPerFrame;
            this.drawCurrent();
        }
    }
    
    setOpenedPercentage(setOpenPercentageTo) {

        let setOpenCommandWithinBounds = this.toPixelsOfApothem(setOpenPercentageTo) >= 0 
            && this.toPixelsOfApothem(setOpenPercentageTo) <= this.fullyOpenedDistance;
        
        if(setOpenCommandWithinBounds) {
            this.currentOpenedDistance = setOpenPercentageTo;
        }
        else {
            this.doneOpeningApertureHole = true;
        }

        if(!this.doneOpeningApertureHoleOrClosing) {
            //this.drawAperature();
        }
    }

    drawCurrent() {
        if(this.projectThumbnail != null && this.currentOpenedDistance > 0) {
            this.drawThumbnail();
        }

        if(this.projectThumbnail != null && this.currentEdgeThickness > 0) {
            this.drawBackgroundAperatureQuadrilaterals();
        }
        if(this.projectThumbnail != null && this.currentOpenedDistance > 0) {
            this.drawForegroundAperatureQuadrilaterals();
        }
        else {
            this.drawHexagon();
        }
    }

    setApertureCenter(newApertureCenter) {
        this.apertureCenter = newApertureCenter;
    }

    drawHexagon() {
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

    drawForegroundAperatureQuadrilaterals() {
        // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.foregroundColor;
            ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the hexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = hexagonApothem it is completely open but we use it as a border, so it never equals the hexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem variable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            ctx.moveTo(this.apertureCenter.x + this.currentOpenedDistance*parallelToSideUnitVector.x - this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.x, this.apertureCenter.y + this.currentOpenedDistance*parallelToSideUnitVector.y - this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.y);
    
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVectorPrev.x - this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.currentShrunkenSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVectorPrev.y - this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.y);
            
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.currentShrunkenSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
    
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.currentShrunkenSize*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVector.y);
    
            ctx.closePath();
            ctx.fill();
        }
    }

    drawBackgroundAperatureQuadrilaterals() {
        // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.backgroundColor;
            ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the hexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = hexagonApothem it is completely open but we use it as a border, so it never equals the hexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem variable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            ctx.moveTo(this.apertureCenter.x + this.currentOpenedDistance*parallelToSideUnitVector.x - this.currentEdgeThickness*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.currentOpenedDistance*parallelToSideUnitVector.y - this.currentEdgeThickness*parallelToSideUnitVector.y);
    
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.currentShrunkenSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVectorPrev.y);
            
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.currentShrunkenSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
    
            ctx.lineTo(this.apertureCenter.x + this.currentShrunkenSize*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVector.x - this.currentEdgeThickness*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.currentShrunkenSize*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + this.currentOpenedDistance*parallelToSideUnitVector.y - this.currentEdgeThickness*parallelToSideUnitVector.y);
    
            ctx.closePath();
            ctx.fill();
        }
    }

    // TODO: make the tesselation as long as needed to fit all thumbnail project 
    // images and travel that distance when scrolling left/right to se all and not have to have a shifting cache then reset transition
    attachThumbnaiil(relativeFilePath) {
        this.projectThumbnail = new Image();
        this.projectThumbnail.onload = function(){ 
        };
        this.projectThumbnail.src = relativeFilePath;
        
    }
    
    drawThumbnail() {
        if(this.projectThumbnail != null) {
            var croppedWidth = this.projectThumbnail.width;
            var croppedHeight = (Math.sqrt(3)/2) * croppedWidth;

            if(this.projectThumbnail.width > this.projectThumbnail.height) {
                croppedHeight = (Math.sqrt(3)/2) * croppedWidth;

                if(this.projectThumbnail.height < croppedHeight) {
                    croppedHeight = this.projectThumbnail.height;
                    croppedWidth = (2/Math.sqrt(3)) * croppedHeight;
                }
            }
            else {
                croppedWidth = (2/Math.sqrt(3)) * croppedHeight;
            }

            ctx.drawImage(this.projectThumbnail,0, 0, croppedWidth, croppedHeight, this.apertureCenter.x - this.fullyOpenedDistance, this.apertureCenter.y - (Math.sqrt(3)/2)*(this.fullyOpenedDistance), 2*(this.fullyOpenedDistance), Math.sqrt(3)*(this.fullyOpenedDistance))
        }
    }

}

class apertureTesselation {
    constructor(thumbnailRelativeImagePathList, tesselationOriginPosition, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor) {
        this.tesselationOriginPosition = tesselationOriginPosition;
        this.hexTesselationVerticalOffset = 2*Math.sqrt(Math.pow(hexagonalApothem, 2) - Math.pow(hexagonalApothem/2, 2));
        this.hexTesselationHorizontalOffset = 1.5*hexagonalApothem; 

        this.numberVerticalApertures = Math.ceil((window.innerHeight - this.tesselationOriginPosition.y)/this.hexTesselationVerticalOffset) + 1;

        this.numberHorizontalApertures = 0;
        this.aperturesList = [];

        this.thumbnailRelativeImagePathList = thumbnailRelativeImagePathList;


        var numberOfThumnailsWithoutAnAperture = this.thumbnailRelativeImagePathList.length;

        while(numberOfThumnailsWithoutAnAperture > 0) {
            var nextColumnInitialIndex = this.numberHorizontalApertures * this.numberVerticalApertures;
            // Loop through each column 
            for(var verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                var nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                if(this.numberHorizontalApertures%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }
                this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor));
            
                let nextApertureIsTooHighForThumbnail = this.aperturesList[verticalIndex + nextColumnInitialIndex].apertureCenter.y < this.hexTesselationVerticalOffset/2;
                let nextApertureIsTooLowForThumbnail = this.aperturesList[verticalIndex + nextColumnInitialIndex].apertureCenter.y > window.innerHeight - this.hexTesselationVerticalOffset/2;

                if(!nextApertureIsTooHighForThumbnail && !nextApertureIsTooLowForThumbnail) {
                    this.aperturesList[verticalIndex + nextColumnInitialIndex].attachThumbnaiil(thumbnailRelativeImagePathList[thumbnailRelativeImagePathList.length - numberOfThumnailsWithoutAnAperture]);
                    numberOfThumnailsWithoutAnAperture--;
                }
            }
            this.numberHorizontalApertures++;
        }
        
        if(this.numberVerticalApertures%2 != 0) {
            for(var verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                var nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                if(this.numberHorizontalApertures%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }
                this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor));
            }
            this.numberHorizontalApertures++;
        }
    }

    toPixelsOfApothem(percentageOfApothem) {
        return ((percentageOfApothem/100.0)*this.hexagonalApothem);
    }
    
    scrollToLeftAnimationStep() {
        for(let apertureIndex = 0;apertureIndex < this.aperturesList.length;apertureIndex++) {
            if(this.aperturesList[0].apertureCenter.x > -(this.hexTesselationHorizontalOffset * this.numberHorizontalApertures)) {
                this.aperturesList[apertureIndex].apertureCenter.x -= 0.1;
            }

            if(this.aperturesList[apertureIndex].apertureCenter.x < -(this.hexTesselationHorizontalOffset)) {
                this.aperturesList[apertureIndex].apertureCenter.x += (this.numberHorizontalApertures)*this.hexTesselationHorizontalOffset;
            }
        }
    }

    drawTesselation() {
        for(var apertureIndex = 0;apertureIndex < this.aperturesList.length;apertureIndex++) {
            if(!this.aperturesList[apertureIndex].doneShrinking) {
                this.aperturesList[apertureIndex].shrinkAnimationStep();
            }
            
            if(this.aperturesList[apertureIndex].doneShrinking && !this.aperturesList[apertureIndex].doneOpeningEdge) {
                this.aperturesList[apertureIndex].edgeOpenAnimationStep();
            }
            
            if(this.aperturesList[apertureIndex].doneOpeningEdge && !this.aperturesList[apertureIndex].doneOpeningApertureHole){
                this.aperturesList[apertureIndex].openAnimationStep();
            }
            
            if(this.aperturesList[apertureIndex].doneOpeningApertureHole) {
                this.aperturesList[apertureIndex].drawCurrent();
                this.scrollToLeftAnimationStep();
            }
        }

    }

}
// TODO set parameter for apeture constructor to has a duration of open/close/shrink instead of a pixels per frame speed based on the FPS and percentges

let firstHexApothem = window.innerHeight/2.6;
let shrinkPercent = 90;
let openPercent = 60;
let edgePercent = 6;
let shrinkSpeed = 0.1;
let openSpeed = 1;
let edgeSpeed = 0.2;
let backColor = "#00ff00";
let frontColor = "black";

var mainApertureTesselation = new apertureTesselation(projectThumbnailImagesPaths, {x: 0, y: 0}, firstHexApothem, shrinkPercent, openPercent, edgePercent, shrinkSpeed, openSpeed, edgeSpeed, frontColor, backColor);

var firstApeture = new aperture( {x: window.innerWidth/2, y: window.innerHeight/2}, firstHexApothem, shrinkPercent, openPercent, edgePercent, shrinkSpeed, openSpeed, edgeSpeed, frontColor, backColor);

function setupCanvas() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");

    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    firstApeture.attachThumbnaiil(projectThumbnailImagesPaths[0]);

    // updateCanvasAnimations handles the sequence of the canvas animations
    updateCanvasAnimations();
}

// Ensures setupCanvas() is run only once
window.addEventListener('load', setupCanvas);

// Draws background rectangle on the canvas
function drawBackground() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}


// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    // Reset the background
    drawBackground();

    mainApertureTesselation.drawTesselation();
    // // TODO: add light mode feature that makes background black and foreground hexagons green in an animated color gradual color transition/inversion
    
    // Canvas Animation
    requestAnimationFrame(updateCanvasAnimations);
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
                }
            }
            else if(doneWithIris) {
                let tooHighOrLowInY = currentTessalationPosition.y < (0.5*tesselationRadii) || currentTessalationPosition.y > window.innerHeight - (0.5*tesselationRadii);
                
                
                let tooRightOrLeft = currentTessalationPosition.x < apertureDistance || (currentTessalationPosition.x > window.innerWidth - apertureDistance && currentTessalationPosition.x < window.innerWidth );
                
                // Left edge of screen
                if(currentTessalationPosition.x < apertureDistance && currentTessalationPosition.x > backdropApertureOffset && !tooHighOrLowInY) {
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

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}