import { Aperture } from "./ApertureClass.js";
export class Tesselation {
    // TODO: set projectInfoList to projectInfoRelativeFolderPath
    constructor(projectInfoList, tesselationOriginPosition, maximumScrollPixelsPerFrame) {
        // Setting Tesselation Position and spacing
        this.tesselationOriginPosition = tesselationOriginPosition;
        
        // These offsets determine the distance between hexagon apertures
        this.hexTesselationVerticalOffset = 2*Math.sqrt(Math.pow(Aperture.apertureHexagonApothem, 2) - Math.pow(Aperture.apertureHexagonApothem/2, 2));
        this.hexTesselationHorizontalOffset = 1.5*Aperture.apertureHexagonApothem; 
        
        // This is the maximum speed of the horizontal scrolling
        this.maximumScrollPixelsPerFrame = maximumScrollPixelsPerFrame;

        // The number of rows of apertures is determined by the height of the screen
        this.numberOfRows = Math.ceil((window.innerHeight - this.tesselationOriginPosition.y)/this.hexTesselationVerticalOffset) + 1;
        this.numberOfColumns = 0;
        
        // Colors for each aperture and aperture edges
        this.color = Aperture.apertureColor;
        this.edgeColor = Aperture.apertureEdgeColor;
        
        // Setting default scroll to half speed on page open
        this.scrollSpeedInPercentage = -0.5;

        // Saving projectInfoList of projects in Tesselation object
        this.projectInfoObjectList = projectInfoList;
        // aperturesArray is the list of apertures positioned to form the tesselation geometry
        this.aperturesArray = [];

        // projectApertureIndices are the indices of the apertureArray that actually have project info/thumbnail
        this.projectApertureIndices = [];

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
                this.aperturesArray.push(new Aperture(nextApertureCenter));
            
                // These variables check to see if the newly added aperture can be set to a Project aperture with Project Thumbnail/Title/Type
                let nextApertureIsTooHighForThumbnail = this.aperturesArray[tesselationRow + nextApertureIndex].apertureCenter.y < this.hexTesselationVerticalOffset/2;
                let nextApertureIsTooLowForThumbnail = this.aperturesArray[tesselationRow + nextApertureIndex].apertureCenter.y > window.innerHeight - this.hexTesselationVerticalOffset/2;

                // attachThumbnail() to the newly created 
                if(!nextApertureIsTooHighForThumbnail && !nextApertureIsTooLowForThumbnail) {
                    this.aperturesArray[tesselationRow + nextApertureIndex].attachThumbnaiil(projectInfoList[projectInfoList.length - numProjectsToAssignToAperture]);
                    
                    // Push the index of this aperture to the projectApertureIndices because it has a thumbnail
                    this.projectApertureIndices.push(this.aperturesArray.length - 1);
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
                this.aperturesArray.push(new Aperture(nextApertureCenter));
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
            this.aperturesArray.push(new Aperture(nextApertureCenter));
            this.aperturesArray[this.aperturesArray.length-1].is_njLAperture = true;
        }

        this.LengthOfApertureArray = this.aperturesArray.length;

    }

    // used to change the edge color of each aperture in the tesselation
    setTesselationEdgeColor(newEdgeColor) {
        for(let apertureIndex = 0;apertureIndex < this.LengthOfApertureArray;apertureIndex++) {
            this.aperturesArray[apertureIndex].setEdgeColor(newEdgeColor);
        }
    }
    
    scrollAnimationStep() {
        // This method scrolls the tesselation horizontally and when apertures overflow their apertureCenters get reset to the 
        // other end of the tesselation pattern
        for(let apertureIndex = 0;apertureIndex < this.LengthOfApertureArray;apertureIndex++) {
            if(this.aperturesArray[0].apertureCenter.x > -(this.hexTesselationHorizontalOffset * this.numberOfColumns)) {
                this.aperturesArray[apertureIndex].apertureCenter.x += Math.abs(this.maximumScrollPixelsPerFrame)*this.scrollSpeedInPercentage;
            }

            if(this.aperturesArray[apertureIndex].apertureCenter.x < -(this.hexTesselationHorizontalOffset)) {
                this.aperturesArray[apertureIndex].apertureCenter.x += (this.numberOfColumns)*this.hexTesselationHorizontalOffset;
            }
            
            if(this.aperturesArray[apertureIndex].apertureCenter.x > Aperture.mainCanvas.width + (this.hexTesselationHorizontalOffset)) {
                this.aperturesArray[apertureIndex].apertureCenter.x -= (this.numberOfColumns)*this.hexTesselationHorizontalOffset;
            }
        }
    }

    drawCurrentTesselation() {
        // Draw all of the apertures
        for(let apertureIndex = 0;apertureIndex < this.LengthOfApertureArray;apertureIndex++) {
            this.aperturesArray[apertureIndex].drawCurrent();
        }

        // if the shrink Animation is done then scroll to the left automatically if 
        if(Aperture.shrinkAnimationComplete == true) {
            this.scrollAnimationStep(this.scrollSpeedInPercentage);
        }
    }

}