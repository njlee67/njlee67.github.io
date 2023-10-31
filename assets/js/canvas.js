'use strict';

// Declare Canvas and Context Objects
let mainCanvas;
let ctx;

// Global variables
// The canvasBackgroundColor is the color behind the aperture tesselation in between apertures
let canvasBackgroundColor = "#00ff00";
// apertureColor is the color of the aperture sides
let apertureColor = "#000000";
// apertureEdgeColor is the color of the aperture slits in between the sides of the aperture
let apertureEdgeColor = '#ff0000';

// Variables describing aperture geometry in tesselation view
let shrinkPercent = 90;
let openPercent = 60;
let edgePercent = 4;
let shrinkSpeed = 0.075;
let openSpeed = 10;
let edgeSpeed = 0.2;
let scrollSpeedMultiplier = 7;

let shrinkAnimationComplete = false;
let expansionAnimationComplete = false;
let openHoleAnimationComplete = false;
let closeHoleAnimationComplete = false;
let edgeOpenAnimationComplete = false;
let edgeCloseAnimationComplete = false;

// apertureHexagonApothem is the distance from the center to a vertex of fully tesselated hexagon/aperture when the screen loads 
const apertureHexagonApothem = Math.round(window.innerHeight/3);

// TODO: Remove projectInfo classes and just merge into aperture class
// projectInfo class contains all the information and media related to a project thumbnail/description and is used to add new projects
class projectInfo {
    constructor(relativeImageFilePath, projectName, projectVersion, projectTopic) {
        this.relativeImageFilePath = relativeImageFilePath;
        this.projectName = projectName;
        this.projectVersion = projectVersion;
        this.projectTopic = projectTopic;
    }
}

// projectInfo variables for the projects I want to display on this portfolio page
let lmbbV2 = new projectInfo('/images/thumbnails/LMBB v2.jpg', 'LMBB v2', 'v2.0', 'BT Speaker');
let yoyos = new projectInfo('images/thumbnails/design-and-manufacturing-2-Yo-Yos.jpg', '2.008 YoYos', '', 'Class Project');
let noStress = new projectInfo('images/thumbnails/dont-stress-hoodie.jpg', "Don't Stress", 'v1.0', 'Custom Apparel');
let lmbbV1 = new projectInfo('images/thumbnails/LMBB v1.0.jpg', 'LMBB v1', 'v1.0', 'BT Speaker');
let noCap = new projectInfo('images/thumbnails/No-Cap-Hoodie.jpg', 'No Cap', 'v1.0', 'Custom Apparel');
let QUAD = new projectInfo('images/thumbnails/QUAD.PNG', 'QUAD', 'v1.0', 'Legged Robot');
let satchPackV1 = new projectInfo('images/thumbnails/SatchPack-v1.jpg', 'SatchPack', 'v1.0', 'Backpack/Desk');
let uAreal1 = new projectInfo('images/thumbnails/youre-a-real-1-hoodie.jpg', 'Ur a Real 1', 'v1.0', 'Custom Apparel');
let ALEEgators = new projectInfo('images/thumbnails/ALEEgators.jpg', 'ALEEgators', 'v1.0', 'Custom Footwear');

// list of projectInfoObjects used to create apertureTessalation
let projectInfoObjectList = [
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

// aperture object is named after a camera aperture and represents a single object that has the project info and opens to display the thumbnail image among other animations
class aperture {
    // The contruction parameters: fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, 
    // shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, 
    // color, edgeColor
    // Are not unique to each aperture they'll just be global variables

    constructor(apertureCenter, relativeProjectInfoFolder = undefined) {

        // The center of the aperture object
        this.apertureCenter = apertureCenter;

        // Setting the default hexagon apothem to global default value for tesselation pattern of apothems
        this.hexagonApothem = apertureHexagonApothem;

        // Constant variables for aperture geometric features/dimensions final form for each animation
        this.fullyShrunkenHexagonSize = this.percentageToPixelsOfApothem(shrinkPercent);

        // The opened distance is the distance from the center of the aperture to the vertices of the aperture opening
        this.fullyOpenedDistance = this.percentageToPixelsOfApothem(openPercent);

        // Edge thickness is the difference in the Opened Distances of the foregound and background apertures to give an edge looking effect because they have the color and edgeColor respectively
        this.fullEdgeThickness = this.percentageToPixelsOfApothem(edgePercent);

        // Dynamic variables fo animations that are the current state of the corresponding variable and are altered/incremented/decremented to update the animations
        // The current size of the aperture which controls the spacing between apertures
        this.currentShrunkenSize = apertureHexagonApothem;

        // The current distance from the center of the aperture to the six vertices of the opening
        this.currentOpenedDistance = 0;

        // The current edge thickness between each aperture side
        this.currentEdgeThickness = 0;

        // this.color is the color of the aperture and 
        this.color = apertureColor;
        
        // this.edgeColor is the color of the aperture slits or edges between each of the six aperture parts
        this.edgeColor = apertureEdgeColor;

        // Animation stage variables
        this.doneShrinking = false;
        this.doneExpanding = false;
        this.doneOpeningEdge = false;
        this.doneClosingEdge = false;
        this.doneOpeningApertureHole = false;
        this.doneClosingApertureHole = false;
        this.projectThumbnail = null;
        this.projectThumbnailLoaded = false;
        this.is_njLAperture = false;
        this.projectInfoObject = null;

        // Pseudo Enum type object to denote the animation type when calling specificAnimationStageStep()
        this.AnimationStages = {
            Shrink: {
                currentStageVariable: this.currentShrunkenSize, 
                initialValue: this.hexagonApothem,
                finalValue: this.fullyShrunkenHexagonSize},
            Expand: {
                currentStageVariable: this.currentShrunkenSize, 
                initialValue: this.fullyShrunkenHexagonSize,
                finalValue: this.hexagonApothem},
            OpenHole: {
                currentStageVariable: this.currentOpenedDistance, 
                initialValue: 0,
                finalValue: this.fullyOpenedDistance},
            CloseHole: {
                currentStageVariable: this.currentOpenedDistance, 
                initialValue: this.fullyOpenedDistance,
                finalValue: 0},
            OpenEdge: {
                currentStageVariable: this.currentOpenedDistance, 
                initialValue: 0,
                finalValue: this.fullEdgeThickness},
            CloseEdge: {
                currentStageVariable: this.currentEdgeThickness, 
                initialValue: this.fullEdgeThickness,
                finalValue: 0},
        };
    }

    // Sets the color of the 6 aperture parts
    setColor(newcolor) {
        this.color = newcolor;
    }
    
    // Sets the color of the edges/slits between the six aperture parts
    setEdgeColor(newEdgeColor) {
        this.edgeColor = newEdgeColor;
    }

    // Scale geometric variables based on percentage on the primary dimension, the hexagonalApothem
    percentageToPixelsOfApothem(percentageOfApothem) {
        return ((percentageOfApothem/100.0)*this.hexagonApothem);
    }

    // drawCurrent draws the current state of the aperture
    drawCurrent() {
        // If this aperture object has a projectThumbnail draw it as an aperture
        if(this.projectThumbnail != null) {
            this.drawProjectTitle();
            this.drawProjectType();

            if(shrinkAnimationComplete == true) {
                this.drawThumbnail();
                this.drawBackgroundAperatureQuadrilaterals();
                this.drawHexagonBorderWindow();
                this.drawForegroundAperatureQuadrilaterals();
            }
            else {
                this.drawHexagon();
            }
        }
        // If the aperture object doesn't have a projectThumbnail then draw it as just a hexagon and if it's an njL initials hexagon draw it on top
        else {
            this.drawHexagon();
            
            if(this.is_njLAperture) {
                this.draw_njL_portfolio();
            }
        }
    }

    draw_njL_portfolio() {
        let initials = 'njL';

        // Set initials color in the context to edge color
        ctx.fillStyle = this.edgeColor;
        // Setting the font size and font style
        let fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(70));
        ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
        // measuring width of initials to center the text later
        let initialsWidth = ctx.measureText(initials).width;

        // Draw njL initials
        ctx.fillText(initials, this.apertureCenter.x - (initialsWidth/2), this.apertureCenter.y + Math.round(this.percentageToPixelsOfApothem(5)) )
        
        // Setting the font size of portfolio text
        fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(20));
        ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
        // Measure the width of portfolio text to center it like njL text with new font size 
        let portfolioWidth = ctx.measureText('portfolio').width;

        // Draw portfolio text
        ctx.fillText('portfolio', this.apertureCenter.x - (portfolioWidth/2), this.apertureCenter.y + (Math.round(this.percentageToPixelsOfApothem(45))) )
    }

    drawProjectTitle() {
        // Set the size of the project title text
        let projectInfoTextSize = this.fullEdgeThickness*2.5;
        ctx.fillStyle = apertureColor;
        ctx.font = '900 ' + projectInfoTextSize.toString() + "px Arial";
        
        let projectTitleText = this.projectInfoObject.projectName;
        let projectTitleWidth = ctx.measureText(projectTitleText).width;
        let projectTitleHeight = ctx.measureText(projectTitleText).actualBoundingBoxAscent + ctx.measureText(projectTitleText).actualBoundingBoxDescent;
        
        ctx.fillText(projectTitleText, this.apertureCenter.x -  projectTitleWidth/2, this.apertureCenter.y + projectTitleHeight/2 - (Math.sqrt(3)/2)*((this.hexagonApothem)));
        
    }
    
    drawProjectType() {
        // Set the size of the project type text
        let projectInfoTextSize = this.fullEdgeThickness*2.5;
        ctx.fillStyle = apertureColor;
        ctx.font = '900 ' + projectInfoTextSize.toString() + "px Arial";
        
        let projectTopicWidth = ctx.measureText(this.projectInfoObject.projectTopic).width;
        let projectTopicHeight = ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxAscent + ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxDescent;
        
        ctx.fillText(this.projectInfoObject.projectTopic, this.apertureCenter.x - projectTopicWidth/2, this.apertureCenter.y + projectTopicHeight/2 +  (Math.sqrt(3)/2)*((this.hexagonApothem)));
    }

    setAnimationVariable(setValue, AnimationStageEnum) {
        AnimationStageEnum.currentStageVariable = setValue;
        this.drawCurrent();
    }

    setAnimationProgress(progressValue, AnimationStageEnum) {
        let command = (AnimationStageEnum.finalValue - AnimationStageEnum.initialValue)*progressValue + AnimationStageEnum.initialValue;

        AnimationStageEnum.currentStageVariable = command;
        this.drawCurrent();
    }

    setApertureCenter(newApertureCenter) {
        this.apertureCenter = newApertureCenter;
    }

    drawHexagon() {
        // Hexagon or a closed aperture is set to this.color 
        ctx.fillStyle = this.color;
        
        // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
        ctx.beginPath();
        ctx.moveTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin(Math.PI/6), this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos(Math.PI/6));
    
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin(vertex*Math.PI/3 + Math.PI/6), this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos(vertex*Math.PI/3 + Math.PI/6));
        }
    
        ctx.closePath();
        ctx.fill();
    }

    drawHexagonBorderWindow() {
        
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the apertureHexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            ctx.moveTo(this.apertureCenter.x + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.x,
                         this.apertureCenter.y + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.y);
        
            ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenHexagonSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.fullyShrunkenHexagonSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVectorPrev.y);
            
            ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenHexagonSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.fullyShrunkenHexagonSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
        
            ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenHexagonSize*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.fullyShrunkenHexagonSize*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.y);
                        
            ctx.closePath();
            ctx.fill();
        }

    
    }

    drawForegroundAperatureQuadrilaterals() {
        // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the apertureHexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = apertureHexagonApothem it is completely open but we use it as a border, so it never equals the apertureHexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the apertureHexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            ctx.moveTo(this.apertureCenter.x + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.x, this.apertureCenter.y + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.y);
    
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.x - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.y - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.y);
            
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
    
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y);
    
            ctx.closePath();
            ctx.fill();
        }
    }

    drawBackgroundAperatureQuadrilaterals() {
        // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.edgeColor; 
            ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the apertureHexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = apertureHexagonApothem it is completely open but we use it as a border, so it never equals the apertureHexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the apertureHexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            ctx.moveTo(this.apertureCenter.x + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.y);
    
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.y);
            
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
    
            ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.y);
    
            ctx.closePath();
            ctx.fill();
        }
    }

    attachThumbnaiil(projectInfoObject) {
        this.projectThumbnail = new Image();
        this.projectThumbnail.onload = function(){ 
        };
        this.projectThumbnail.src = projectInfoObject.relativeImageFilePath;
        this.projectInfoObject = projectInfoObject;
    }
    
    drawThumbnail() {
        if(this.projectThumbnail != null) {
            let croppedWidth = this.projectThumbnail.width;
            let croppedHeight = (Math.sqrt(3)/2) * croppedWidth;

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
    // TODO: set projectInfoList to projectInfoRelativeFolderPath
    constructor(projectInfoList, tesselationOriginPosition, maximumScrollPixelsPerFrame) {
        // Setting Tesselation Position and spacing
        this.tesselationOriginPosition = tesselationOriginPosition;

        // These offsets determine the distance between hexagon apertures
        this.hexTesselationVerticalOffset = 2*Math.sqrt(Math.pow(apertureHexagonApothem, 2) - Math.pow(apertureHexagonApothem/2, 2));
        this.hexTesselationHorizontalOffset = 1.5*apertureHexagonApothem; 

        // This is the maximum speed of the horizontal scrolling
        this.maximumScrollPixelsPerFrame = maximumScrollPixelsPerFrame;

        // The number of rows of apertures is determined by the height of the screen
        this.numberOfRows = Math.ceil((window.innerHeight - this.tesselationOriginPosition.y)/this.hexTesselationVerticalOffset) + 1;
        this.numberOfColumns = 0;

        // Colors for each aperture and aperture edges
        this.color = apertureColor;
        this.edgeColor = apertureEdgeColor;

        // aperturesArray is the list of apertures positioned to form the tesselation geometry
        this.aperturesArray = [];

        // numProjectsToAssignToAPerture is the count of how many projects in the project list still need
        // to be set to an aperture to have it's project info displayed
        let numProjectsToAssignToAperture = projectInfoList.length;

        // Adding aperture objects to this.apertureList attribute in tesselation class based on the remaining number of projects to assign
        // Requires a while loop for this solutiona and not a for loop because project apertures are only assign if the row is not clipped/cut by the screen top/bottom
        while(numProjectsToAssignToAperture > 0) {
            // nextApertureIndex is the total number of apertures that have been added to the tesselation by multiplying the 
            // number of rows x number of columns that have been added to this.apertureList
            let nextApertureIndex = this.numberOfColumns * this.numberOfRows;

            // Loop through each row 
            for(let tesselationRow = 0;tesselationRow < this.numberOfRows;tesselationRow++) {
                // nextApertureCenter is the next position of the aperture that will be added to apertureArray
                let nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberOfColumns*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + tesselationRow*this.hexTesselationVerticalOffset};
                
                // Checking if the numberOfColumns is even or not to determine if this.hexTesselationVerticalOffset/2 
                // needs to be added to center location to form the tesselation alternating pattern
                if(this.numberOfColumns%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }

                // pushing the new aperture that has been correctly positioned to aperturesArray
                this.aperturesArray.push(new aperture(nextApertureCenter));
            
                // These variables check to see if the newly added aperture can be set to a Project aperture with Project Thumbnail/Title/Type
                let nextApertureIsTooHighForThumbnail = this.aperturesArray[tesselationRow + nextApertureIndex].apertureCenter.y < this.hexTesselationVerticalOffset/2;
                let nextApertureIsTooLowForThumbnail = this.aperturesArray[tesselationRow + nextApertureIndex].apertureCenter.y > window.innerHeight - this.hexTesselationVerticalOffset/2;

                // attachThumbnail() to the newly created 
                if(!nextApertureIsTooHighForThumbnail && !nextApertureIsTooLowForThumbnail) {
                    this.aperturesArray[tesselationRow + nextApertureIndex].attachThumbnaiil(projectInfoList[projectInfoList.length - numProjectsToAssignToAperture]);
                    
                    // Decrement number of projects by one since 1 project was assigned
                    numProjectsToAssignToAperture--;
                }
            }

            // We've added a full column in the previous for loop so the number of columns is incremented
            this.numberOfColumns++;
        }
        

        // the number of extra columns to add
        let numberOfExtraColumns = 1;
        
        if(this.numberOfColumns%2 == 0) {
            // this.numberOfColumns is incremented by one because we added a column
            numberOfExtraColumns = 2;
        }

        // Adding extra column if the number of columns in the tesselation is not even and two columns if it is even to keep it even
        for(let njLColumns = 0;njLColumns < numberOfExtraColumns;njLColumns++) {
            for(let tesselationRow = 0;tesselationRow < this.numberOfRows;tesselationRow++) {
                let nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberOfColumns*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + tesselationRow*this.hexTesselationVerticalOffset};
                if(this.numberOfColumns%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }
                this.aperturesArray.push(new aperture(nextApertureCenter));
                this.aperturesArray[this.aperturesArray.length-1].is_njLAperture = true;
            }
            this.numberOfColumns++;
        }
        
        // Adding one more row on top so that the tesselation gets extended to the gap for projectInfotext
        for(let tesselationColumn = 0;tesselationColumn < this.numberOfColumns;tesselationColumn++) {
            let nextApertureCenter = {x:this.tesselationOriginPosition.x + (tesselationColumn+1)*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y -0.5* this.hexTesselationVerticalOffset};
            if(tesselationColumn%2 != 0) {
                nextApertureCenter.y -= this.hexTesselationVerticalOffset/2;
            }
            this.aperturesArray.push(new aperture(nextApertureCenter));
            this.aperturesArray[this.aperturesArray.length-1].is_njLAperture = true;
        }

    }

    // used to change the edge color of each aperture in the tesselation
    setTesselationEdgeColor(newEdgeColor) {
        for(let apertureIndex = 0;apertureIndex < this.aperturesArray.length;apertureIndex++) {
            this.aperturesArray[apertureIndex].setEdgeColor(newEdgeColor);
        }
    }
    
    scrollAnimationStep(scrollSpeedInPercentage) {
        // This method scrolls the tesselation horizontally and when apertures overflow their apertureCenters get reset to the 
        // other end of the tesselation pattern
        for(let apertureIndex = 0;apertureIndex < this.aperturesArray.length;apertureIndex++) {
            if(this.aperturesArray[0].apertureCenter.x > -(this.hexTesselationHorizontalOffset * this.numberOfColumns)) {
                this.aperturesArray[apertureIndex].apertureCenter.x += Math.abs(this.maximumScrollPixelsPerFrame)*scrollSpeedInPercentage;
            }

            if(this.aperturesArray[apertureIndex].apertureCenter.x < -(this.hexTesselationHorizontalOffset)) {
                this.aperturesArray[apertureIndex].apertureCenter.x += (this.numberOfColumns)*this.hexTesselationHorizontalOffset;
            }
            
            if(this.aperturesArray[apertureIndex].apertureCenter.x > mainCanvas.width + (this.hexTesselationHorizontalOffset)) {
                this.aperturesArray[apertureIndex].apertureCenter.x -= (this.numberOfColumns)*this.hexTesselationHorizontalOffset;
            }
        }
    }

    drawCurrentTesselation() {
        // Draw all of the apertures
        for(let apertureIndex = 0;apertureIndex < this.aperturesArray.length;apertureIndex++) {
            this.aperturesArray[apertureIndex].drawCurrent();
        }

        // if the shrink Animation is done then scroll to the left automatically if 
        if(shrinkAnimationComplete == true) {
            this.scrollAnimationStep(scrollSpeedInPercentage);
        }
    }

}

let mainApertureTesselation = new apertureTesselation(projectInfoObjectList, {x: 0, y: window.innerHeight/18}, scrollSpeedMultiplier);

let initialPageOpenTime = new Date();
let delayInitialPauseTimeInSeconds = 1; 

let foreground_X = window.innerWidth*0.50;
let foreground_Y = window.innerHeight*0.85;
let foregroundHexSize = window.innerHeight/12;
let borderHexSize = window.innerHeight/10;
let borderColor = "#ffffff00";

let fColorWheel = 'hsl(0, 100%, 50%)';

class hexagonColorSelector {
    constructor(hexagonCenterPosition, hexagonalApothem, initialColor) {
        this.hexagonCenterPosition = hexagonCenterPosition;
        this.apertureHexagonApothem = hexagonalApothem;
        this.color = initialColor;
        this.previousColor = initialColor;
        this.pointerDown = false;
    }

    drawColorSelector() {
        ctx.fillStyle = this.color;
        
        // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
        ctx.beginPath();
        ctx.moveTo(this.hexagonCenterPosition.x + this.apertureHexagonApothem*Math.sin(Math.PI/6), this.hexagonCenterPosition.y + this.apertureHexagonApothem*Math.cos(Math.PI/6));
    
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.lineTo(this.hexagonCenterPosition.x + this.apertureHexagonApothem*Math.sin(vertex*Math.PI/3 + Math.PI/6), this.hexagonCenterPosition.y + this.apertureHexagonApothem*Math.cos(vertex*Math.PI/3 + Math.PI/6));
        }
    
        ctx.closePath();
        ctx.fill();
    }

    setNewHSLAColor(newHSLAColor) {
        this.color = newHSLAColor;
    }
}

let backgroundColorButton = new hexagonColorSelector({x: 1.5*borderHexSize, y: foreground_Y}, foregroundHexSize, canvasBackgroundColor);

let apertureEdgeColorButton = new hexagonColorSelector({x: window.innerWidth - 1.5*borderHexSize, y: foreground_Y}, foregroundHexSize, mainApertureTesselation.edgeColor);


let animationStartTime = undefined;
let globalAnimationId;
let dramaticPageOpenDuration = 2000;
let shrinkDuration = 2000;
let openHoleDuration = 2000;

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

function dramaticPageOpenPause(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const dramaticPageOpenProgress = (timeStamp - animationStartTime) / dramaticPageOpenDuration;

    if(dramaticPageOpenProgress < 1) {
        drawBackground("#000000");
        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(dramaticPageOpenPause)
    }
    else {
        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(shrinkAnimationStep);
    }

}

function powerTiming(timing, exponent) {
    return Math.pow(timing, exponent);
}
function shrinkAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const animationProgress = powerTiming( (timeStamp - animationStartTime) / shrinkDuration, 4);
    
    if(animationProgress < 1) {
        drawBackground();

        for(let apertureIndex = 0;apertureIndex < mainApertureTesselation.aperturesArray.length;apertureIndex++) {
            mainApertureTesselation.aperturesArray[apertureIndex].setAnimationProgress(animationProgress, mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.Shrink)
        }

        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(shrinkAnimationStep);
    }
    else {
        shrinkAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(openAperturesAnimationStep);
    }
}

function openAperturesAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const animationProgress = 7*powerTiming( (timeStamp - animationStartTime) / openHoleDuration - 0.5, 3) - 0.75*powerTiming( (timeStamp - animationStartTime) / openHoleDuration, 2) + 0.875;
    
    if(animationProgress < 1) {
        drawBackground();
        // let commandValue = mainApertureTesselation.aperturesArray[4].fullyShrunkenHexagonSize - ((mainApertureTesselation.aperturesArray[4].hexagonalApothem - mainApertureTesselation.aperturesArray[4].fullyShrunkenHexagonSize) * (animationProgress - 1.0));
        for(let apertureIndex = 0;apertureIndex < mainApertureTesselation.aperturesArray.length;apertureIndex++) {
            mainApertureTesselation.aperturesArray[apertureIndex].setAnimationProgress(animationProgress, mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenEdge);
            mainApertureTesselation.aperturesArray[apertureIndex].setAnimationProgress(animationProgress, mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenHole);
        }
        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(openAperturesAnimationStep);
    }
    else {
        openHoleAnimationComplete = true;
        edgeOpenAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(updateCanvasAnimations);
    }
}

function setupCanvas() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");
    
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    mainCanvas.addEventListener('mousemove', onPointerMove);
    mainCanvas.addEventListener('mousedown', onPointerDown);
    mainCanvas.addEventListener('mouseup', onPointerUp);
    mainCanvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
    mainCanvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));
    mainCanvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));

    initialPageOpenTime = new Date();

    requestAnimationFrame(dramaticPageOpenPause);
}

function getEventLocation(e)
{
    if (e.touches && e.touches.length === 1) {
        // console.log('touch location: ('+  e.touches[0].clientX + ', ' + e.touches[0].clientY + ')')
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

let scrollSpeedInPercentage = -0.5;

let globalPointerDown = false;

let wasTouchEvent = false;

let doneFadingColorSelectorsIn = false;
let colorSelectorOpacity = 0;

function handleTouch(e, singleTouchHandler) {
    e.preventDefault();
    if (e.touches.length <= 1) {
        singleTouchHandler(e);
        wasTouchEvent = true;
    }
    // else if (e.type == "touchmove" && e.touches.length == 2) {
    //     isDragging = false;
    //     handlerPinch(e);
    // }
}

function onPointerMove(e) {
    let mouseLocationOnMove = getEventLocation(e);
    // console.log('touchmovin');
    if(mouseLocationOnMove != undefined && mouseLocationOnMove != null) {
        if(mouseLocationOnMove.x > (2/3)*mainCanvas.width) {
            scrollSpeedInPercentage = ((mouseLocationOnMove.x-((2/3)*mainCanvas.width))/((1/3)*mainCanvas.width))
        }
        else if(mouseLocationOnMove.x < (1/3)*mainCanvas.width) {
            scrollSpeedInPercentage = -(1-(mouseLocationOnMove.x/((1/3)*mainCanvas.width)))
        }
        else {
            scrollSpeedInPercentage = 0;
        }
    
        if(backgroundColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,backgroundColorButton.hexagonCenterPosition.y) /backgroundColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHexAColor(backgroundColorButton.previousColor);
            
            if(verticalColor > 360) {
                verticalColor -= 360;
            }
            
            let newColor = HSLToHex(verticalColor, 100, 50);
            
            backgroundColorButton.setNewHSLAColor(newColor);
            canvasBackgroundColor = newColor;
        }

        if(apertureEdgeColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,apertureEdgeColorButton.hexagonCenterPosition.y) /apertureEdgeColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHexAColor(apertureEdgeColorButton.previousColor);
            
            if(verticalColor > 360) {
                verticalColor -= 360;
            }

            let newColor = HSLToHex(verticalColor, 100, 50);
            
            apertureEdgeColorButton.setNewHSLAColor(newColor);
            mainApertureTesselation.setTesselationEdgeColor(newColor);
        }
    }
}

// https://css-tricks.com/converting-color-spaces-in-javascript/

function HSLToHex(h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
  
    // Prepend 0s, if necessary
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
  }
  
function getHueFromHexAColor(H) {
    // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return h;
}

let pointerDown = false;

function onPointerDown(e) {
    let mouseLocationOnDown = getEventLocation(e);
    
    globalPointerDown = true;
    if(Math.hypot(backgroundColorButton.hexagonCenterPosition.x - mouseLocationOnDown.x, backgroundColorButton.hexagonCenterPosition.y - mouseLocationOnDown.y) < foregroundHexSize) {
        backgroundColorButton.pointerDown = true;
        apertureEdgeColorButton.pointerDown = false;
    }
    
    if(Math.hypot(apertureEdgeColorButton.hexagonCenterPosition.x - mouseLocationOnDown.x, apertureEdgeColorButton.hexagonCenterPosition.y - mouseLocationOnDown.y) < foregroundHexSize) {
        apertureEdgeColorButton.pointerDown = true;
        backgroundColorButton.pointerDown = false;
    }

    if(mouseLocationOnDown != undefined && mouseLocationOnDown != null) {
        if(wasTouchEvent) {
            if(mouseLocationOnDown.x > (2/3)*mainCanvas.width) {
                scrollSpeedInPercentage = ((mouseLocationOnDown.x-((2/3)*mainCanvas.width))/((1/3)*mainCanvas.width))
            }
            else if(mouseLocationOnDown.x < (1/3)*mainCanvas.width) {
                scrollSpeedInPercentage = -(1-(mouseLocationOnDown.x/((1/3)*mainCanvas.width)))
            }
            else {
                scrollSpeedInPercentage = 0;
            }
        }
    }
}

function onPointerUp(e) {
    globalPointerDown = false;
    backgroundColorButton.pointerDown = false;
    backgroundColorButton.previousColor = backgroundColorButton.color;

    if(backgroundColorButton.color.length < 9) {
        backgroundColorButton.color = backgroundColorButton.color;
    }
    
    apertureEdgeColorButton.pointerDown = false;
    apertureEdgeColorButton.previousColor = apertureEdgeColorButton.color;

    if(apertureEdgeColorButton.color.length < 9) {
        apertureEdgeColorButton.color = apertureEdgeColorButton.color;
    }
}
// Ensures setupCanvas() is run only once
window.addEventListener('load', setupCanvas);

// Draws background rectangle on the canvas
function drawBackground(color = canvasBackgroundColor) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}

// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    drawBackground();
    mainApertureTesselation.drawCurrentTesselation();
    
    backgroundColorButton.drawColorSelector();
    apertureEdgeColorButton.drawColorSelector();

    // Canvas Animation
    requestAnimationFrame(updateCanvasAnimations);
}

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}