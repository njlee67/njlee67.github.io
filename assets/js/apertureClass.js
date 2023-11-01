export class Aperture {
    // apertureColor is the color of the aperture sides
    static apertureColor = "hsl(0, 0%, 0%";
    // apertureEdgeColor is the color of the aperture slits in between the sides of the aperture
    static apertureEdgeColor = "hsl(0, 100%, 50%)";

    static apertureHexagonApothem = Math.round(window.innerHeight/3);

    static mainCanvas = document.getElementById("main-canvas");
    static ctx = Aperture.mainCanvas.getContext("2d");

    // Variables describing aperture geometry in tesselation view
    static shrinkPercent = 90;
    static openPercent = 60;
    static edgePercent = 4;
    static shrinkSpeed = 0.075;
    static openSpeed = 10;
    static edgeSpeed = 0.2;

    static shrinkAnimationComplete = false;
    static openHoleAnimationComplete = false;
    static edgeOpenAnimationComplete = false;
    
    static expansionAnimationComplete = false;
    static closeHoleAnimationComplete = false;
    static edgeCloseAnimationComplete = false;
    
    constructor(apertureCenter, relativeProjectInfoFolder = undefined) {

        // The center of the aperture object
        this.apertureCenter = apertureCenter;

        // Setting the default hexagon apothem to global default value for tesselation pattern of apothems
        this.hexagonApothem = Aperture.apertureHexagonApothem;
        // Constant variables for aperture geometric features/dimensions final form for each animation
        this.fullyShrunkenHexagonSize = this.percentageToPixelsOfApothem(Aperture.shrinkPercent);

        // The opened distance is the distance from the center of the aperture to the vertices of the aperture opening
        this.fullyOpenedDistance = this.percentageToPixelsOfApothem(Aperture.openPercent);

        // Edge thickness is the difference in the Opened Distances of the foregound and background apertures to give an edge looking effect because they have the color and edgeColor respectively
        this.fullEdgeThickness = this.percentageToPixelsOfApothem(Aperture.edgePercent);

        // Dynamic variables fo animations that are the current state of the corresponding variable and are altered/incremented/decremented to update the animations
        // The current size of the aperture which controls the spacing between apertures
        this.currentShrunkenSize = Aperture.apertureHexagonApothem;

        // The current distance from the center of the aperture to the six vertices of the opening
        this.currentOpenedDistance = 0;

        // The current edge thickness between each aperture side
        this.currentEdgeThickness = 0;

        // this.color is the color of the aperture and 
        this.color = Aperture.apertureColor;
        
        // this.edgeColor is the color of the aperture slits or edges between each of the six aperture parts
        this.edgeColor = Aperture.apertureEdgeColor;

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
            this.drawProjectTitleText();
            this.drawProjectTypeText();
            if(Aperture.shrinkAnimationComplete == true) {
                this.drawThumbnail();
                this.drawEdgeAperatureQuadrilaterals();
                this.drawHexagonBorderWindow();
                this.drawAperatureQuadrilaterals();
            }
            else {
                this.drawHexagon();
            }
        }
        // If the aperture object doesn't have a projectThumbnail then draw it as just a hexagon and if it's an njL initials hexagon draw it on top
        else {
            this.drawHexagon();
            
            if(this.is_njLAperture) {
                this.draw_njL_portfolioText();
            }
        }
    }

    draw_njL_portfolioText() {
        let initials = 'njL';

        // Set initials color in the context to edge color
        Aperture.ctx.fillStyle = this.edgeColor;
        // Setting the font size and font style
        let fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(70));
        Aperture.ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
        // measuring width of initials to center the text later
        let initialsWidth = Aperture.ctx.measureText(initials).width;

        // Draw njL initials
        Aperture.ctx.fillText(initials, this.apertureCenter.x - (initialsWidth/2), this.apertureCenter.y + Math.round(this.percentageToPixelsOfApothem(5)) )
        
        // Setting the font size of portfolio text
        fontSizeFractionOfApothem = Math.round(this.percentageToPixelsOfApothem(20));
        Aperture.ctx.font = fontSizeFractionOfApothem.toString() + "px Arial";
        // Measure the width of portfolio text to center it like njL text with new font size 
        let portfolioWidth = Aperture.ctx.measureText('portfolio').width;

        // Draw portfolio text
        Aperture.ctx.fillText('portfolio', this.apertureCenter.x - (portfolioWidth/2), this.apertureCenter.y + (Math.round(this.percentageToPixelsOfApothem(45))) )
    }

    drawProjectTitleText() {
        // Set the size of the project title text
        let projectInfoTextSize = this.fullEdgeThickness*2.5;
        Aperture.ctx.fillStyle = Aperture.apertureColor;
        Aperture.ctx.font = '900 ' + projectInfoTextSize.toString() + "px Arial";
        
        let projectTitleText = this.projectInfoObject.projectName;
        let projectTitleWidth = Aperture.ctx.measureText(projectTitleText).width;
        let projectTitleHeight = Aperture.ctx.measureText(projectTitleText).actualBoundingBoxAscent + Aperture.ctx.measureText(projectTitleText).actualBoundingBoxDescent;
        
        Aperture.ctx.fillText(projectTitleText, this.apertureCenter.x -  projectTitleWidth/2, this.apertureCenter.y + projectTitleHeight/2 - (Math.sqrt(3)/2)*((this.hexagonApothem)));
        
    }
    
    drawProjectTypeText() {
        // Set the size of the project type text
        let projectInfoTextSize = this.fullEdgeThickness*2.5;
        Aperture.ctx.fillStyle = Aperture.apertureColor;
        Aperture.ctx.font = '900 ' + projectInfoTextSize.toString() + "px Arial";
        
        let projectTopicWidth = Aperture.ctx.measureText(this.projectInfoObject.projectTopic).width;
        let projectTopicHeight = Aperture.ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxAscent + Aperture.ctx.measureText(this.projectInfoObject.projectTopic).actualBoundingBoxDescent;
        
        Aperture.ctx.fillText(this.projectInfoObject.projectTopic, this.apertureCenter.x - projectTopicWidth/2, this.apertureCenter.y + projectTopicHeight/2 +  (Math.sqrt(3)/2)*((this.hexagonApothem)));
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
        Aperture.ctx.fillStyle = this.color;
        
        // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
        Aperture.ctx.beginPath();
        Aperture.ctx.moveTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin(Math.PI/6), this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos(Math.PI/6));
    
        for(let vertex = 0;vertex < 6;vertex++) {
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin(vertex*Math.PI/3 + Math.PI/6), this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos(vertex*Math.PI/3 + Math.PI/6));
        }
    
        Aperture.ctx.closePath();
        Aperture.ctx.fill();
    }

    drawHexagonBorderWindow() {
        
        for(let vertex = 0;vertex < 6;vertex++) {
            Aperture.ctx.fillStyle = this.color;
            Aperture.ctx.beginPath();
            
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the apertureHexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            Aperture.ctx.moveTo(this.apertureCenter.x + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.x,
                         this.apertureCenter.y + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.y);
        
            Aperture.ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenHexagonSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.fullyShrunkenHexagonSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVectorPrev.y);
            
            Aperture.ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenHexagonSize*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.fullyShrunkenHexagonSize*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
        
            Aperture.ctx.lineTo(this.apertureCenter.x + this.fullyShrunkenHexagonSize*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.fullyShrunkenHexagonSize*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + (this.fullyShrunkenHexagonSize - 2*this.fullEdgeThickness)*parallelToSideUnitVector.y);
                        
            Aperture.ctx.closePath();
            Aperture.ctx.fill();
        }

    
    }

    drawAperatureQuadrilaterals() {
        // Aperture.ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            Aperture.ctx.fillStyle = this.color;
            Aperture.ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the apertureHexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = apertureHexagonApothem it is completely open but we use it as a border, so it never equals the apertureHexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the apertureHexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // perpindicularToSideUnitVectorPrev is the unit vector with a magnitude of 1
            let perpindicularToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            Aperture.ctx.moveTo(this.apertureCenter.x + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.x, this.apertureCenter.y + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.y);
    
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.x - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.y - this.AnimationStages.OpenEdge.currentStageVariable*perpindicularToSideUnitVectorPrev.y);
            
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
    
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y);
    
            Aperture.ctx.closePath();
            Aperture.ctx.fill();
        }
    }

    drawEdgeAperatureQuadrilaterals() {
        // Aperture.ctx.drawImage(img, centerPositon.x - shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, centerPositon.y - img.height*(shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width), 2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem, img.height*(2*shrinkHexSize*percentOfhexagonApothemIrisSize*apertureHexagonApothem/img.width));
        // Loop and draw the 6 quadrilaterals
        for(let vertex = 0;vertex < 6;vertex++) {
            Aperture.ctx.fillStyle = this.edgeColor; 
            Aperture.ctx.beginPath();
    
            // openedPercentage is the percentage that the irisMecanism is open because the distance the 6 quadrilaterals travel from the center is equal to the apertureHexagonApothem
            // so when the irisMechanismDistance is 0 the irisMechanism animation is completely closed and when it  = apertureHexagonApothem it is completely open but we use it as a border, so it never equals the apertureHexagonApothem
    
            // The parallelToSideUnitVector is the vector from the current vertex to the next vertex 60deg away CCW. This vector has a magnitude of the apertureHexagonApothem letiable
            let parallelToSideUnitVector = {x: Math.sin(vertex*Math.PI/3 + Math.PI/6) - Math.sin((vertex+1)*Math.PI/3 + Math.PI/6), y: Math.cos(vertex*Math.PI/3 + Math.PI/6) -  Math.cos((vertex+1)*Math.PI/3 + Math.PI/6)};
            
            // The parallelToSideUnitVectorPrev is the vector from the current vertex of the hexagon outline to the previous vertex
            let parallelToSideUnitVectorPrev = {x: Math.sin((vertex-1)*Math.PI/3 + Math.PI/6) - Math.sin((vertex)*Math.PI/3 + Math.PI/6), y: Math.cos((vertex-1)*Math.PI/3 + Math.PI/6) - Math.cos((vertex)*Math.PI/3 + Math.PI/6)};
            
            // Draw the lines that make up each quadrilateral
            Aperture.ctx.moveTo(this.apertureCenter.x + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.y);
    
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVectorPrev.y);
            
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex)*Math.PI/3 + Math.PI/6), 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex)*Math.PI/3 + Math.PI/6));
    
            Aperture.ctx.lineTo(this.apertureCenter.x + this.AnimationStages.Shrink.currentStageVariable*Math.sin((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.x - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.x, 
                        this.apertureCenter.y + this.AnimationStages.Shrink.currentStageVariable*Math.cos((vertex+1)*Math.PI/3 + Math.PI/6) + this.AnimationStages.OpenHole.currentStageVariable*parallelToSideUnitVector.y - this.AnimationStages.OpenEdge.currentStageVariable*parallelToSideUnitVector.y);
    
            Aperture.ctx.closePath();
            Aperture.ctx.fill();
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

            Aperture.ctx.drawImage(this.projectThumbnail,0, 0, croppedWidth, croppedHeight, this.apertureCenter.x - this.fullyOpenedDistance, this.apertureCenter.y - (Math.sqrt(3)/2)*(this.fullyOpenedDistance), 2*(this.fullyOpenedDistance), Math.sqrt(3)*(this.fullyOpenedDistance))
        }
    }

}