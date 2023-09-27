'use strict';

// Declare Canvas and Context Objects
let mainCanvas;
let ctx;

// Global variables
let canvasBackDropColor = "#00ff00";
let canvasForegroundColor = "#000000";
let apertureEdgeColor = '#ff0000';

// hexagonApothem is the distance from the center to a vertex of fully tesselated hexagon/aperture when the screen loads 
const hexagonApothem = Math.round(window.innerHeight/3);

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

    constructor(apertureCenter, hexagonalApothem, 
        fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, 
        shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, 
        foregroundColor, edgeColor) {

        // The center of the aperture object
        this.apertureCenter = apertureCenter;

        this.hexagonalApothem = hexagonalApothem;

        // Constant variables for aperture geometric features final form
        this.fullyShrunkenHexagonSize = this.percentageToPixelsOfApothem(fullyShrunkenPercentage);
        // The opened distance is the distance from the center of the aperture to the vertices of the aperture opening
        this.fullyOpenedDistance = this.percentageToPixelsOfApothem(fullyOpenedPercentage);
        // Edge thickness is the difference in the Opened Distances of the foregound and background apertures to give an edge looking effect because they have the foregroundColor and edgeColor respectively
        this.fullEdgeThickness = this.percentageToPixelsOfApothem(fullEdgeThicknessPercentage);

        // Dynamic variables fo animations that are the current state of the corresponding variable and are altered/incremented/decremented to update the animations
        this.currentShrunkenSize = hexagonalApothem;
        this.currentOpenedDistance = 0;
        this.currentEdgeThickness = 0;

        // Animation Speed variables control the speed of different animation stages
        this.shrinkPixelsPerFrame = -Math.abs(this.percentageToPixelsOfApothem(shrinkPercentagePerFrame));
        this.expandPixelsPerFrame = Math.abs(this.shrinkPixelsPerFrame);
        this.openPixelsPerFrame = Math.abs(this.percentageToPixelsOfApothem(openPercentagePerFrame));
        this.closePixelsPerFrame = Math.abs(this.openPixelsPerFrame);
        this.edgeOpenPixelsPerFrame = Math.abs(this.percentageToPixelsOfApothem(edgePercentagePerFrame));
        this.edgeClosePixelsPerFrame = -Math.abs(this.edgeOpenPixelsPerFrame);

        // forgroundColor is the color of the aperture and edgeColor is the color of the aperture
        this.foregroundColor = foregroundColor;
        this.edgeColor = edgeColor;

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
        // Pseudo Enum type object to denote the animation type when calling specificAnimationStageStep()
        this.AnimationStages = {
            Shrink: {
                currentStageVariable: this.currentShrunkenSize, 
                doneWithStageBoolean: this.doneShrinking,
                pixelsPerFrame: this.shrinkPixelsPerFrame},
            Expand: {
                currentStageVariable: this.currentShrunkenSize, 
                doneWithStageBoolean: this.doneExpanding,
                pixelsPerFrame: this.expandPixelsPerFrame},
            OpenHole: {
                currentStageVariable: this.currentOpenedDistance, 
                doneWithStageBoolean: this.doneOpeningApertureHole,
                pixelsPerFrame: this.openPixelsPerFrame},
            CloseHole: {
                currentStageVariable: this.currentOpenedDistance, 
                doneWithStageBoolean: this.doneClosingApertureHole,
                pixelsPerFrame: this.closePixelsPerFrame},
            OpenEdge: {
                currentStageVariable: this.currentOpenedDistance, 
                // currentStageVariables: {
                //     edgeThickness: this.currentEdgeThickness, 
                //     openedDistance: this.currentOpenedDistance
                // },
                doneWithStageBoolean: this.doneOpeningEdge,
                pixelsPerFrame: this.edgeOpenPixelsPerFrame},
            CloseEdge: {
                currentStageVariable: this.currentEdgeThickness, 
                doneWithStageBoolean: this.doneClosingEdge,
                pixelsPerFrame: this.edgeClosePixelsPerFrame}
        };
    }
    
    setForegroundColor(newForegroundColor) {
        this.foregroundColor = newForegroundColor;
    }
    
    setEdgeColor(newEdgeColor) {
        this.edgeColor = newEdgeColor;
    }

    // Scale geometric variables based on percentage on the primary dimension, the hexagonalApothem
    percentageToPixelsOfApothem(percentageOfApothem) {
        return ((percentageOfApothem/100.0)*this.hexagonalApothem);
    }

    updateAnimationStageBooleans() {
        this.AnimationStages.Shrink.doneWithStageBoolean = this.AnimationStages.Shrink.currentStageVariable <= this.fullyShrunkenHexagonSize;
        this.AnimationStages.Expand.doneWithStageBoolean = this.AnimationStages.Shrink.currentStageVariable >= this.hexagonalApothem;
        this.AnimationStages.OpenEdge.doneWithStageBoolean = this.AnimationStages.OpenEdge.currentStageVariable >= this.fullEdgeThickness;
        this.AnimationStages.CloseEdge.doneWithStageBoolean = this.AnimationStages.OpenEdge.currentStageVariable <= 0;
        this.AnimationStages.OpenHole.doneWithStageBoolean = this.AnimationStages.OpenHole.currentStageVariable >= this.fullyOpenedDistance;
        this.AnimationStages.CloseHole.doneWithStageBoolean = this.AnimationStages.OpenHole.currentStageVariable <= 0;
    }

    specificAnimationStageStep(AnimationStageEnum, alternatePixelsPerFrame = AnimationStageEnum.pixelsPerFrame) {
        this.updateAnimationStageBooleans();
        if(!AnimationStageEnum.doneWithStageBoolean) {
            AnimationStageEnum.currentStageVariable += alternatePixelsPerFrame;
            this.drawCurrent();
        }
    }
    
    drawCurrent() {
        if(this.projectThumbnail != null) {
            this.drawProjectInfo();
            this.drawThumbnail();
            this.drawBackgroundAperatureQuadrilaterals();
            this.drawHexagonBorderWindow();
            this.drawForegroundAperatureQuadrilaterals();
        } else {
            this.drawHexagon();
            if(this.isNJLClosedAperture) {
                ctx.fillStyle = this.edgeColor;
                let fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(70));
                ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
                let initials = 'njL';
                let initialsWidth = ctx.measureText(initials).width;
                let initialsHeight = fontSizeFractionOfApothem;
                ctx.fillText(initials, this.apertureCenter.x - (initialsWidth/2), this.apertureCenter.y + Math.round(this.percentageToPixelsOfApothem(5)) )
                fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(20));
                ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
                let portfolioWidth = ctx.measureText('portfolio').width;
                ctx.fillText('portfolio', this.apertureCenter.x - (portfolioWidth/2), this.apertureCenter.y + (Math.round(this.percentageToPixelsOfApothem(45))) )
                
            }
        }
    }
    // TODO: drawText()
    // drawText(textString, percentageOfApothem, color, x_relative, y_relative) {
    //     ctx.fillStyle = color;
    //     let fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(percentageOfApothem));
    //     ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
    //     let textWidth = ctx.measureText(textString).width;
    //     let textHeight = fontSizeFractionOfApothem;
    //     ctx.fillText(textString, this.apertureCenter.x + x_relative, this.apertureCenter.y + y_relative);
    //     fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(20));
    //     ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
    //     let portfolioWidth = ctx.measureText('portfolio').width;
    //     ctx.fillText('portfolio', this.apertureCenter.x - (portfolioWidth/2), this.apertureCenter.y + (Math.round(this.percentageToPixelsOfApothem(45))) )

    // }

    drawProjectInfo() {
        if(this.projectTextCurrentFadeValue.toString(16).length > 1) {
            ctx.fillStyle = this.foregroundColor; 
        }
        else {
            ctx.fillStyle = this.foregroundColor;
        }
        let projectInfoTextSize = this.fullEdgeThickness*2.5;
        ctx.font = '900 ' + projectInfoTextSize.toString() + "px Arial";
       
        let projectNameText = this.projectInfoObject.projectName;
        let projectNameWidth = ctx.measureText(projectNameText).width;
        let projectNameHeight = ctx.measureText(projectNameText).actualBoundingBoxAscent + ctx.measureText(projectNameText).actualBoundingBoxDescent;

        ctx.fillText(projectNameText, this.apertureCenter.x -  projectNameWidth/2, this.apertureCenter.y + projectNameHeight/2 - (Math.sqrt(3)/2)*((this.hexagonalApothem)));
        
        let projectThemeTextSize = this.fullEdgeThickness*2.5;
        let projectTopicWidth = ctx.measureText(this.projectInfoObject.projectTopic).width;
        let projectTopicHeight = ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxAscent + ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxDescent;

        ctx.fillText(this.projectInfoObject.projectTopic, this.apertureCenter.x - projectTopicWidth/2, this.apertureCenter.y + projectTopicHeight/2 +  (Math.sqrt(3)/2)*((this.hexagonalApothem)));
    }

    setAnimationVariable(setValue, AnimationStageEnum) {
        AnimationStageEnum.currentStageVariable = setValue;
        this.drawCurrent();
    }

    setApertureCenter(newApertureCenter) {
        this.apertureCenter = newApertureCenter;
    }

    drawHexagon() {
        ctx.fillStyle = this.foregroundColor;
        
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
            ctx.fillStyle = this.foregroundColor;
            ctx.beginPath();
            
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
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
        // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.foregroundColor;
            ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the hexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = hexagonApothem it is completely open but we use it as a border, so it never equals the hexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem letiable
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
        // ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*hexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.fillStyle = this.edgeColor; 
            ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the hexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = hexagonApothem it is completely open but we use it as a border, so it never equals the hexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the hexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
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

    // TODO: make the tesselation as long as needed to fit all thumbnail project 
    // images and travel that distance when scrolling left/right to se all and not have to have a shifting cache then reset transition
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
    constructor(projectInfoList, tesselationOriginPosition, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, edgeColor, maximumScrollPixelsPerFrame) {
        this.tesselationOriginPosition = tesselationOriginPosition;
        this.hexTesselationVerticalOffset = 2*Math.sqrt(Math.pow(hexagonalApothem, 2) - Math.pow(hexagonalApothem/2, 2));
        this.hexTesselationHorizontalOffset = 1.5*hexagonalApothem; 
        this.maximumScrollPixelsPerFrame = maximumScrollPixelsPerFrame;
        this.numberVerticalApertures = Math.ceil((window.innerHeight - this.tesselationOriginPosition.y)/this.hexTesselationVerticalOffset) + 1;
        this.foregroundColor = foregroundColor;
        this.edgeColor = edgeColor;
        this.numberHorizontalApertures = 0;
        this.aperturesList = [];

        this.projectInfoList = projectInfoList;

        let numberOfThumnailsWithoutAnAperture = this.projectInfoList.length;

        // Using projectInfoObject.length determine how many total aperture/hexagon aperture class objects are needed
        while(numberOfThumnailsWithoutAnAperture > 0) {
            let nextColumnInitialIndex = this.numberHorizontalApertures * this.numberVerticalApertures;
            // Loop through each column 
            for(let verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                let nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                if(this.numberHorizontalApertures%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }
                this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, edgeColor));
            
                let nextApertureIsTooHighForThumbnail = this.aperturesList[verticalIndex + nextColumnInitialIndex].apertureCenter.y < this.hexTesselationVerticalOffset/2;
                let nextApertureIsTooLowForThumbnail = this.aperturesList[verticalIndex + nextColumnInitialIndex].apertureCenter.y > window.innerHeight - this.hexTesselationVerticalOffset/2;

                if(!nextApertureIsTooHighForThumbnail && !nextApertureIsTooLowForThumbnail) {
                    this.aperturesList[verticalIndex + nextColumnInitialIndex].attachThumbnaiil(projectInfoList[projectInfoList.length - numberOfThumnailsWithoutAnAperture]);
                    numberOfThumnailsWithoutAnAperture--;
                }
            }
            this.numberHorizontalApertures++;
        }
        
        // Adding extra column if the number of columns in the tesselation is not even
        if(this.numberHorizontalApertures%2 != 0) {
            for(let verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                let nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                if(this.numberHorizontalApertures%2 != 0) {
                    nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                }
                this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, edgeColor));
                this.aperturesList[this.aperturesList.length-1].isNJLClosedAperture = true;
            }
            this.numberHorizontalApertures++;
        }
        else {
            for(let njLColumns = 0;njLColumns < 2;njLColumns++) {
                for(let verticalIndex = 0;verticalIndex < this.numberVerticalApertures;verticalIndex++) {
                    let nextApertureCenter = {x:this.tesselationOriginPosition.x + this.numberHorizontalApertures*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y + verticalIndex*this.hexTesselationVerticalOffset};
                    if(this.numberHorizontalApertures%2 != 0) {
                        nextApertureCenter.y += this.hexTesselationVerticalOffset/2;
                    }
                    this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, edgeColor));
                    this.aperturesList[this.aperturesList.length-1].isNJLClosedAperture = true;
                }
                this.numberHorizontalApertures++;
            }
        }
        
        // Adding one more row on top so that the tesselation gets extended to the gap for projectInfotext
        for(let horizontalIndex = 0;horizontalIndex < this.numberHorizontalApertures;horizontalIndex++) {
            let nextApertureCenter = {x:this.tesselationOriginPosition.x + (horizontalIndex+1)*this.hexTesselationHorizontalOffset,y: this.tesselationOriginPosition.y -0.5* this.hexTesselationVerticalOffset};
            if(horizontalIndex%2 != 0) {
                nextApertureCenter.y -= this.hexTesselationVerticalOffset/2;
            }
            this.aperturesList.push(new aperture(nextApertureCenter, hexagonalApothem, fullyShrunkenPercentage, fullyOpenedPercentage, fullEdgeThicknessPercentage, shrinkPercentagePerFrame, openPercentagePerFrame, edgePercentagePerFrame, foregroundColor, edgeColor));
            this.aperturesList[this.aperturesList.length-1].isNJLClosedAperture = true;
        }

        this.doneWithInitialOpeningApertures = false;
    }

    setTesselationEdgeColor(newColor) {
        for(let apertureIndex = 0;apertureIndex < this.aperturesList.length;apertureIndex++) {
            this.aperturesList[apertureIndex].setEdgeColor(newColor);
        }
    }
    // TODO: should really use the aperture class version of this duplicate
    percentageToPixelsOfApothem(percentageOfApothem) {
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
        for(let apertureIndex = 0;apertureIndex < this.aperturesList.length;apertureIndex++) {
            // if((this.aperturesList[apertureIndex].apertureCenter.x > this.aperturesList[apertureIndex].fullyOpenedDistance
            // && this.aperturesList[apertureIndex].apertureCenter.x < mainCanvas.width - this.aperturesList[apertureIndex].fullyOpenedDistance)
            // || this.aperturesList[apertureIndex].projectThumbnail == null) {
            // Shrink hexagons stage from fully black screen to black hexagons
            if(!this.aperturesList[apertureIndex].AnimationStages.Shrink.doneWithStageBoolean) {
                this.aperturesList[apertureIndex].specificAnimationStageStep(this.aperturesList[apertureIndex].AnimationStages.Shrink);
            }
            
            // Done with shrink hexagon stage
            // Starting open edge stage , aperture edges currently red open on apertures 
            if(this.aperturesList[apertureIndex].AnimationStages.Shrink.doneWithStageBoolean && !this.aperturesList[apertureIndex].AnimationStages.OpenEdge.doneWithStageBoolean) {
                this.aperturesList[apertureIndex].specificAnimationStageStep(this.aperturesList[apertureIndex].AnimationStages.OpenEdge);
                this.aperturesList[apertureIndex].specificAnimationStageStep(this.aperturesList[apertureIndex].AnimationStages.OpenHole,this.aperturesList[apertureIndex].AnimationStages.OpenEdge.pixelsPerFrame);
            }
            
            // Done with open edge stage
            // Starting open aperture stage , apertures on right and left sides of the screen 
            // should only open apertures up to the screen edge to reveal project thumbnails
            // No scrolling has started at this point
            if(this.aperturesList[apertureIndex].AnimationStages.OpenEdge.doneWithStageBoolean && !this.aperturesList[apertureIndex].AnimationStages.OpenHole.doneWithStageBoolean){
                // If the aperture in this iteration of the for loop through the list of apertures is not on the left edge or right edge while scrolling
                if((this.aperturesList[apertureIndex].apertureCenter.x > this.aperturesList[apertureIndex].fullyOpenedDistance
                && this.aperturesList[apertureIndex].apertureCenter.x < mainCanvas.width - this.aperturesList[apertureIndex].fullyOpenedDistance)) {
                    this.aperturesList[apertureIndex].specificAnimationStageStep(this.aperturesList[apertureIndex].AnimationStages.OpenHole);
                }
                // Otherwise if current aperture in this for loop is on the left edge and is close enough to the edge to start closing the aperture at the edge
                else {
                    if(this.aperturesList[apertureIndex].apertureCenter.x <= this.aperturesList[apertureIndex].fullyOpenedDistance){
                        if(this.aperturesList[apertureIndex].AnimationStages.OpenHole.currentStageVariable <= this.aperturesList[apertureIndex].apertureCenter.x) {
                            this.aperturesList[apertureIndex].specificAnimationStageStep(this.aperturesList[apertureIndex].AnimationStages.OpenHole);
                        }
                        else {
                            this.aperturesList[apertureIndex].AnimationStages.OpenHole.doneWithStageBoolean = true;
                            this.aperturesList[apertureIndex].drawCurrent();
                        }
                    }else if(this.aperturesList[apertureIndex].apertureCenter.x >= mainCanvas.width - this.aperturesList[apertureIndex].fullyOpenedDistance){
                        if(this.aperturesList[apertureIndex].AnimationStages.OpenHole.currentStageVariable <= mainCanvas.width - this.aperturesList[apertureIndex].apertureCenter.x) {
                            this.aperturesList[apertureIndex].specificAnimationStageStep(this.aperturesList[apertureIndex].AnimationStages.OpenHole);
                        }
                        else {
                            this.aperturesList[apertureIndex].AnimationStages.OpenHole.doneWithStageBoolean = true;

                            this.aperturesList[apertureIndex].drawCurrent();
                        }
                    }
                }
            }

            // Done opening apertures and now dynamic user input scrolling has started
            // Now when scrolling and an aperture reaches a threshold x value on the right/left sides of the screen 
            // the aperture sets its hole opened distance to the distance from the apertureCenter to the right/left edge of the screen, so it
            // looks like the screen edge is closing and opening them 
            if(this.aperturesList[apertureIndex].AnimationStages.OpenHole.doneWithStageBoolean) {
                this.aperturesList[apertureIndex].drawCurrent();

                // If aperture center is past the threshold on the left
                // AND it's greater than the aperture edge thickness on the left so that it doesn't close too far 
                // set it to the distance from apertureCenter.x to the left edge 
                if(this.aperturesList[apertureIndex].apertureCenter.x < this.aperturesList[apertureIndex].fullyOpenedDistance
                && this.aperturesList[apertureIndex].apertureCenter.x > this.aperturesList[apertureIndex].fullEdgeThickness) {
                    this.aperturesList[apertureIndex].setAnimationVariable(this.aperturesList[apertureIndex].apertureCenter.x, this.aperturesList[apertureIndex].AnimationStages.OpenHole);
                }

                // If aperture center is past the threshold on the right
                // AND it's greater than the aperture edge thickness on the right so that it doesn't close aperture hole too far making little points on hexagon vertices
                // set it to the distance from apertureCenter.x to the right edge 
                else if(this.aperturesList[apertureIndex].apertureCenter.x >=  mainCanvas.width - this.aperturesList[apertureIndex].fullyOpenedDistance
                && this.aperturesList[apertureIndex].apertureCenter.x <= mainCanvas.width - this.aperturesList[apertureIndex].fullEdgeThickness) {
                    this.aperturesList[apertureIndex].setAnimationVariable(mainCanvas.width - this.aperturesList[apertureIndex].apertureCenter.x, this.aperturesList[apertureIndex].AnimationStages.OpenHole);
                }
                this.scrollToLeftAnimationStep(scrollSpeedInPercentage);
            }

        }
        
    }

}
// TODO set parameter for apeture constructor to has a duration of open/close/shrink instead of a pixels per frame speed based on the FPS and percentges

let shrinkPercent = 90;
let openPercent = 60;
let edgePercent = 4;
let shrinkSpeed = 0.075;
let openSpeed = 0.5;
let edgeSpeed = 0.2;

let mainApertureTesselation = new apertureTesselation(projectInfoObjectList, {x: 0, y: window.innerHeight/18}, window.innerHeight/3, shrinkPercent, openPercent, edgePercent, shrinkSpeed, openSpeed, edgeSpeed, canvasForegroundColor, apertureEdgeColor, 0.2);

// If a colorWheel element is clicked
// using HSL color change the Hue based on the distance from the colorWheel to the top edge of the screen
// The hue should adjust from it's original hue and overflow into red based on innerHeight

// draw Rectangle button element to act as color wheel visual

// create function called changeHue() to point to for onclick event for the button

// in changeHue() callback/function:
    // get mouse.y
    // get currentHue of the colorWheel object and save it in previousHue variable
    // set currentHue = (mouse.y/innerHeight) - previousHue;
    // update the colors of the corresponding html elements
let initialPageOpenTime = new Date();
let delayInitialPauseTimeInSeconds = 1; 

let foreground_X = window.innerWidth*0.50;
let foreground_Y = window.innerHeight*0.9;
let foregroundHexSize = window.innerHeight/12;
let borderHexSize = window.innerHeight/10;
let borderColor = "#ffffff00";

let fColorWheel = 'hsl(0, 100%, 50%)';

class hexagonColorSelector {
    constructor(hexagonCenterPosition, hexagonalApothem, initialColor) {
        this.hexagonCenterPosition = hexagonCenterPosition;
        this.hexagonApothem = hexagonalApothem;
        this.color = initialColor;
        this.previousColor = initialColor;
        this.pointerDown = false;
    }

    drawColorSelector() {
        ctx.fillStyle = this.color;
        
        // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
        ctx.beginPath();
        ctx.moveTo(this.hexagonCenterPosition.x + this.hexagonApothem*Math.sin(Math.PI/6), this.hexagonCenterPosition.y + this.hexagonApothem*Math.cos(Math.PI/6));
    
        for(let vertex = 0;vertex < 6;vertex++) {
            ctx.lineTo(this.hexagonCenterPosition.x + this.hexagonApothem*Math.sin(vertex*Math.PI/3 + Math.PI/6), this.hexagonCenterPosition.y + this.hexagonApothem*Math.cos(vertex*Math.PI/3 + Math.PI/6));
        }
    
        ctx.closePath();
        ctx.fill();
    }

    setNewHSLAColor(newHSLAColor) {
        this.color = newHSLAColor;
    }
}

let backgroundColorButton = new hexagonColorSelector({x: foreground_X + 2*borderHexSize, y: foreground_Y}, foregroundHexSize, canvasBackDropColor);

let apertureEdgeColorButton = new hexagonColorSelector({x: foreground_X - 2*borderHexSize, y: foreground_Y}, foregroundHexSize, mainApertureTesselation.edgeColor);

function setupCanvas() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");
    
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    mainCanvas.addEventListener('mousemove', onPointerMove);
    mainCanvas.addEventListener('mousedown', onPointerDown);
    mainCanvas.addEventListener('mouseup', onPointerUp);

    initialPageOpenTime = new Date();
    // let foregroundColorButton = document.getElementById("foregorundColorButt"); 
    // mainCanvas.appendChild(foregroundColorButton);
    
    // updateCanvasAnimations handles the sequence of the canvas animations
    updateCanvasAnimations();
}

function getEventLocation(e)
{
    if (e.touches && e.touches.length === 1) {
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


function onPointerMove(e) {
    let mouseLocationOnMove = getEventLocation(e);

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
    }

    
    if(backgroundColorButton.pointerDown) {
        let verticalColor = 360*(1 - (mouseLocationOnMove.y/window.innerHeight)) + getHueFromHexAColor(backgroundColorButton.previousColor);
        
        if(verticalColor > 360) {
            verticalColor -= 360;
        }

        let newColor = HSLToHex(verticalColor, 100, 50);
        
        backgroundColorButton.setNewHSLAColor(newColor);
        canvasBackDropColor = newColor;
    }
    
    if(apertureEdgeColorButton.pointerDown) {
        let verticalColor = 360*(1 - (mouseLocationOnMove.y/window.innerHeight)) + getHueFromHexAColor(apertureEdgeColorButton.previousColor);
        
        if(verticalColor > 360) {
            verticalColor -= 360;
        }

        let newColor = HSLToHex(verticalColor, 100, 50);
        
        apertureEdgeColorButton.setNewHSLAColor(newColor);
        mainApertureTesselation.setTesselationEdgeColor(newColor);
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

    if(Math.hypot(backgroundColorButton.hexagonCenterPosition.x - mouseLocationOnDown.x, backgroundColorButton.hexagonCenterPosition.y - mouseLocationOnDown.y) < foregroundHexSize) {
        backgroundColorButton.pointerDown = true;
    }

    if(Math.hypot(apertureEdgeColorButton.hexagonCenterPosition.x - mouseLocationOnDown.x, apertureEdgeColorButton.hexagonCenterPosition.y - mouseLocationOnDown.y) < foregroundHexSize) {
        apertureEdgeColorButton.pointerDown = true;
    }
}

function onPointerUp(e) {
    backgroundColorButton.pointerDown = false;
    backgroundColorButton.previousColor = backgroundColorButton.color;

    apertureEdgeColorButton.pointerDown = false;
    apertureEdgeColorButton.previousColor = apertureEdgeColorButton.color;
}
// Ensures setupCanvas() is run only once
window.addEventListener('load', setupCanvas);

// Draws background rectangle on the canvas
function drawBackground(color = canvasBackDropColor) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}

// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    let endInitialPauseTimer = new Date();
    // Reset the background
    if((endInitialPauseTimer.getTime()) - initialPageOpenTime.getTime() > 1500) {
        drawBackground();
        mainApertureTesselation.drawTesselation();
    }
    else {
        drawBackground("black");
    }

    backgroundColorButton.drawColorSelector();
    apertureEdgeColorButton.drawColorSelector();
    // // TODO: add light mode feature that makes background black and foreground hexagons green in an animated color gradual color transition/inversion

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