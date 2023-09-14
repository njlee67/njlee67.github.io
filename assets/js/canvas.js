// Declare Canvas and Context Objects
var mainCanvas;
var ctx;

// Global Variables
// let backgroundColor = "#FEFF0B";
let backgroundColor = "#00ff00";
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
    '/images/thumbnails/LMBB v2.jpg',
    'images/thumbnails/design-and-manufacturing-2-Yo-Yos.jpg',
    'images/thumbnails/dont-stress-hoodie.jpg',
    'images/thumbnails/LMBB v1.0.jpg',
    'images/thumbnails/No-Cap-Hoodie.jpg',
    'images/thumbnails/QUAD.PNG',
    'images/thumbnails/SatchPack-v1.jpg',
    'images/thumbnails/youre-a-real-1-hoodie.jpg',
    'images/thumbnails/ALEEgators.jpg'
    // Gazebo Walking Simulation
];


class projectInfo {
    constructor(relativeFilePath, projectName, projectVersion, projectTopic) {
        this.relativeFilePath = relativeFilePath;
        this.projectName = projectName;
        this.projectVersion = projectVersion;
        this.projectTopic = projectTopic;
    }
    
}
var lmbbV2 = new projectInfo(projectThumbnailImagesPaths[0], 'LMBB v2', 'v2.0', 'BT Speaker');
var yoyos = new projectInfo(projectThumbnailImagesPaths[1], '2.008 YoYos', '', 'Class Project');
var noStress = new projectInfo(projectThumbnailImagesPaths[2], "Don't Stress", 'v1.0', 'Custom Apparel');
var lmbbV1 = new projectInfo(projectThumbnailImagesPaths[3], 'LMBB v1', 'v1.0', 'BT Speaker');
var noCap = new projectInfo(projectThumbnailImagesPaths[4], 'No Cap', 'v1.0', 'Custom Apparel');
var QUAD = new projectInfo(projectThumbnailImagesPaths[5], 'QUAD', 'v1.0', 'Legged Robot');
var satchPackV1 = new projectInfo(projectThumbnailImagesPaths[6], 'SatchPack', 'v1.0', 'Backpack/Desk');
var uAreal1 = new projectInfo(projectThumbnailImagesPaths[7], 'Ur a Real 1', 'v1.0', 'Custom Apparel');
var ALEEgators = new projectInfo(projectThumbnailImagesPaths[8], 'ALEEgators', 'v1.0', 'Custom Footwear');

var projectInfoObjectList = [
lmbbV1,
yoyos,
noStress,
lmbbV2,
noCap,
QUAD,
satchPackV1,
uAreal1,
ALEEgators
]
// apertureDistance is the distance from the center of a hexagon in the direction from the center of the hexagon to a vertex
// iris animation is based on the iris mechanism similar to a camera shutter

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
        this.isNJLClosedAperture = false;
        this.projectInfoObject = null;
        this.projectTextCurrentFadeValue = 0;
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

    checkIfProjectInfoIsFadedIn(setProjectInfoTextTransparency) {
        let setProjectInfoTextTransparencyOutsideLimits = setProjectInfoTextTransparency < 0 || setProjectInfoTextTransparency > 255;

        if(setProjectInfoTextTransparencyOutsideLimits) {
            if(setProjectInfoTextTransparencyOutsideLimits < 0) {
                this.projectTextCurrentFadeValue = 0;
            }
            else if(setProjectInfoTextTransparencyOutsideLimits > 255) {
                this.projectTextCurrentFadeValue = 255;
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

    // fadeProjectinfoTextAnimationStep() {
    //     var speedOfFade = 2;
    //     this.doneFadeInProjectInfoText = this.checkIfProjectInfoIsFadedIn(this.projectTextCurrentFadeValue + speedOfFade);

    //     if(!this.doneFadeInProjectInfoText) {
    //         this.projectTextCurrentFadeValue += speedOfFade;
    //         // this.projectTextCurrentFadeValue = Math.floor(this.projectTextCurrentFadeValue);
    //         this.drawCurrent();
    //     }
    // }
    
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
        if(this.projectThumbnail != null) {
            this.drawProjectInfo()
        }
        if(this.projectThumbnail != null && this.currentOpenedDistance > 0) {
            this.drawThumbnail();
        }

        if(this.projectThumbnail != null && this.currentEdgeThickness > 0) {
            this.drawBackgroundAperatureQuadrilaterals();
        }
        if(this.projectThumbnail != null && this.currentOpenedDistance > 0) {
            this.drawForegroundAperatureQuadrilaterals();
            this.drawHexagonBorderWindow();
        }
        else {
            this.drawHexagon();
            if(this.isNJLClosedAperture) {
                ctx.fillStyle = backgroundColor;
                var fontSizeFractionOfApothem = Math.round(this.toPixelsOfApothem(70));
                ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
                var initials = 'njL';
                var initialsWidth = ctx.measureText(initials).width;
                var initialsHeight = fontSizeFractionOfApothem;
                ctx.fillText(initials, this.apertureCenter.x - (initialsWidth/2), this.apertureCenter.y + Math.round(this.toPixelsOfApothem(5)) )
                fontSizeFractionOfApothem = Math.round(this.toPixelsOfApothem(20));
                ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
                var portfolioWidth = ctx.measureText('portfolio').width;
                ctx.fillText('portfolio', this.apertureCenter.x - (portfolioWidth/2), this.apertureCenter.y + (Math.round(this.toPixelsOfApothem(45))) )

            }
        }
    }

    drawProjectInfo() {
        if(this.projectTextCurrentFadeValue.toString(16).length > 1) {
            ctx.fillStyle = this.foregroundColor; 
        }
        else {
            ctx.fillStyle = this.foregroundColor;
        }
        var projectInfoTextSize = this.fullEdgeThickness*2.5;
        ctx.font = '900 ' + projectInfoTextSize.toString() + "px Arial";
       
        var projectNameText = this.projectInfoObject.projectName;
        var projectNameWidth = ctx.measureText(projectNameText).width;
        var projectNameHeight = ctx.measureText(projectNameText).actualBoundingBoxAscent + ctx.measureText(projectNameText).actualBoundingBoxDescent;
        // console.log(projectNameHeight)

        ctx.fillText(projectNameText, this.apertureCenter.x -  projectNameWidth/2, this.apertureCenter.y + projectNameHeight/2 - (Math.sqrt(3)/2)*((this.hexagonalApothem)));
        
        var projectThemeTextSize = this.fullEdgeThickness*2.5;
        var projectTopicWidth = ctx.measureText(this.projectInfoObject.projectTopic).width;
        var projectTopicHeight = ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxAscent + ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxDescent;

        ctx.fillText(this.projectInfoObject.projectTopic, this.apertureCenter.x - projectTopicWidth/2, this.apertureCenter.y + projectTopicHeight/2 +  (Math.sqrt(3)/2)*((this.hexagonalApothem)));
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

    drawHexagonBorderWindow() {
        
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.foregroundColor;
            ctx.beginPath();
            
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem variable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            ctx.moveTo(this.apertureCenter.x + (this.fullyShrunkenSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.x - 0*this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.x,
                         this.apertureCenter.y + (this.fullyShrunkenSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.y - 0*this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.y);
        
            ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenSize - 2*this.fullEdgeThickness)*parallelToSideUnitVectorPrev.x - 0*this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.fullyShrunkenSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenSize - 2*this.fullEdgeThickness)*parallelToSideUnitVectorPrev.y - 0*this.currentEdgeThickness*perpindicularToSideUnitVectorPrev.y);
            
            ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.fullyShrunkenSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
        
            ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenSize*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.fullyShrunkenSize*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.y);
                        
            ctx.closePath();
            ctx.fill();
        }

    
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
            ctx.fillStyle = 'lightblue';
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
    attachThumbnaiil(projectInfoObject) {
        this.projectThumbnail = new Image();
        this.projectThumbnail.onload = function(){ 
        };
        this.projectThumbnail.src = projectInfoObject.relativeFilePath;
        this.projectInfoObject = projectInfoObject;
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
    constructor(projectInfoList, tesselationOriginPosition, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor, maximumScrollPixelsPerFrame) {
        this.tesselationOriginPosition = tesselationOriginPosition;
        this.hexTesselationVerticalOffset = 2*Math.sqrt(Math.pow(hexagonalApothem, 2) - Math.pow(hexagonalApothem/2, 2));
        this.hexTesselationHorizontalOffset = 1.5*hexagonalApothem; 
        this.maximumScrollPixelsPerFrame = maximumScrollPixelsPerFrame;
        this.numberVerticalApertures = Math.ceil((window.innerHeight - this.tesselationOriginPosition.y)/this.hexTesselationVerticalOffset) + 1;

        this.numberHorizontalApertures = 0;
        this.aperturesList = [];

        this.projectInfoList = projectInfoList;


        var numberOfThumnailsWithoutAnAperture = this.projectInfoList.length;

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
                    this.aperturesList[verticalIndex + nextColumnInitialIndex].attachThumbnaiil(projectInfoList[projectInfoList.length - numberOfThumnailsWithoutAnAperture]);
                    numberOfThumnailsWithoutAnAperture--;
                }
            }
            this.numberHorizontalApertures++;
        }
        
        if(this.numberHorizontalApertures%2 != 0) {
            for(var verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                var nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                if(this.numberHorizontalApertures%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }
                this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor));
                this.aperturesList[this.aperturesList.length-1].isNJLClosedAperture = true;
            }
            this.numberHorizontalApertures++;
        }
        else {
            for(var njLColumns = 0;njLColumns < 2;njLColumns++) {
                for(var verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                    var nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                    if(this.numberHorizontalApertures%2 != 0) {
                        nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                    }
                    this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor));
                    this.aperturesList[this.aperturesList.length-1].isNJLClosedAperture = true;
                }
                this.numberHorizontalApertures++;
            }
        }
        
        // Adding one more row on top so that the tesselation gets extended to the gap for projectInfotext
        for(var horizontalIndex = 0;horizontalIndex < this.numberHorizontalApertures;horizontalIndex++) {
            var nextApertureCenter = {x:this.tesselationOriginPosition.x + (horizontalIndex+1)*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y -0.5* this.hexTesselationVerticalOffset};
            if(horizontalIndex%2 != 0) {
                nextApertureCenter.y -= this.hexTesselationVerticalOffset/2;
            }
            this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, backgroundColor));
            this.aperturesList[this.aperturesList.length-1].isNJLClosedAperture = true;
        }

    }

    toPixelsOfApothem(percentageOfApothem) {
        return ((percentageOfApothem/100.0)*this.hexagonalApothem);
    }
    
    scrollToLeftAnimationStep(scrollSpeedInPercentageGlobal) {
        for(let apertureIndex = 0;apertureIndex < this.aperturesList.length;apertureIndex++) {
            if(this.aperturesList[0].apertureCenter.x > -(this.hexTesselationHorizontalOffset * this.numberHorizontalApertures)) {
                this.aperturesList[apertureIndex].apertureCenter.x += Math.abs(this.maximumScrollPixelsPerFrame)*scrollSpeedInPercentageGlobal;
            }

            if(this.aperturesList[apertureIndex].apertureCenter.x < -(this.hexTesselationHorizontalOffset)) {
                this.aperturesList[apertureIndex].apertureCenter.x += (this.numberHorizontalApertures)*this.hexTesselationHorizontalOffset;
            }
            
            if(this.aperturesList[apertureIndex].apertureCenter.x > mainCanvas.width + (this.hexTesselationHorizontalOffset)) {
                this.aperturesList[apertureIndex].apertureCenter.x -= (this.numberHorizontalApertures)*this.hexTesselationHorizontalOffset;
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
            
            // if(this.aperturesList[apertureIndex].doneOpeningApertureHole && !this.aperturesList[apertureIndex].doneFadeInProjectInfoText) {
            //     this.aperturesList[apertureIndex].fadeProjectinfoTextAnimationStep();
            // }

            if(this.aperturesList[apertureIndex].doneOpeningApertureHole) {
                this.aperturesList[apertureIndex].drawCurrent();
                console.log("scrollspeedPercent: " + scrollSpeedInPercentage);
                this.scrollToLeftAnimationStep(scrollSpeedInPercentage);
            }

        }

    }

}
// TODO set parameter for apeture constructor to has a duration of open/close/shrink instead of a pixels per frame speed based on the FPS and percentges

let shrinkPercent = 90;
let openPercent = 60;
let edgePercent = 4;
let shrinkSpeed = 0.2;
let openSpeed = 1;
let edgeSpeed = 0.2;
// let backColor = "#00ff00";
let backColor = backgroundColor;
let frontColor = "black";

var mainApertureTesselation = new apertureTesselation(projectInfoObjectList, {x: 0, y: window.innerHeight/18}, window.innerHeight/3, shrinkPercent, openPercent, edgePercent, shrinkSpeed, openSpeed, edgeSpeed, frontColor, backColor, 0.2);

function setupCanvas() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");

    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    mainCanvas.addEventListener('mousemove', onPointerMove);

    // updateCanvasAnimations handles the sequence of the canvas animations
    updateCanvasAnimations();
}

function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1) {
        return { 
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        }
    }
    else if (e.clientX && e.clientY) {
        return {
            x: e.clientX,
            y: e.clientY
        }
    }
}

var scrollSpeedInPercentage = -0.5;

function onPointerMove(e) {
    var mouseLocationOnMove = getEventLocation(e);

    if(mouseLocationOnMove != undefined && mouseLocationOnMove != null) {
        if(mouseLocationOnMove.x > (2/3)*mainCanvas.width) {
            scrollSpeedInPercentage = ((mouseLocationOnMove.x-((2/3)*mainCanvas.width))/((1/3)*mainCanvas.width))
            console.log("scroll right at " + scrollSpeedInPercentage);
        }
        else if(mouseLocationOnMove.x < (1/3)*mainCanvas.width) {
            scrollSpeedInPercentage = -(1-(mouseLocationOnMove.x/((1/3)*mainCanvas.width)))
            console.log("scroll left at " + scrollSpeedInPercentage);
        }
        else {
            scrollSpeedInPercentage = 0;
            console.log("no scroll at " + scrollSpeedInPercentage);
        }
    }
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

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}