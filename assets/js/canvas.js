'use strict';
import { aperture } from './apertureClass.js';

// Global variables
// Declare Canvas and Context Objects
let mainCanvas;
let ctx;

// The canvasBackgroundColor is the color behind the aperture tesselation pattern in between apertures
let canvasBackgroundColor = "hsl(340, 100%, 50%)";
// apertureColor is the color of the apertures themselves as a static field
aperture.apertureColor = "hsl(0, 0%, 0%)";
// apertureEdgeColor is the color of the aperture slits in between the sides of the aperture
aperture.apertureEdgeColor = "hsl(200, 100%, 50%)";

// User Interface Global Variables
// scrollSpeedMultiplier sets the direction that the tesselation scrolls in
let scrollSpeedMultiplier = 7;
let scrollSpeedInPercentage = -0.5;
// states for mouse and touch events
let globalPointerDown = false;
let wasTouchEvent = false;

// apertureHexagonApothem is the distance from the center to a vertex of fully tesselated hexagon/aperture when the screen loads 
aperture.apertureHexagonApothem = Math.round(window.innerHeight/3);

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
// project JSON file to store all relevant project data for a project page
/* 
projectJSON = {
    Title: "LMBB",
    GeneralDescription: "Blah Blah",
    DevelopmentDescription: "Blah dev blah",
    ThumbnailImagePath: "Thumbnail/",
    SlideShowFiles: ["image0", "video1", "image2"],

}
*/

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

class apertureTesselation {
    // TODO: set projectInfoList to projectInfoRelativeFolderPath
    constructor(projectInfoList, tesselationOriginPosition, maximumScrollPixelsPerFrame) {
        // Setting Tesselation Position and spacing
        this.tesselationOriginPosition = tesselationOriginPosition;

        // These offsets determine the distance between hexagon apertures
        this.hexTesselationVerticalOffset = 2*Math.sqrt(Math.pow(aperture.apertureHexagonApothem, 2) - Math.pow(aperture.apertureHexagonApothem/2, 2));
        this.hexTesselationHorizontalOffset = 1.5*aperture.apertureHexagonApothem; 

        // This is the maximum speed of the horizontal scrolling
        this.maximumScrollPixelsPerFrame = maximumScrollPixelsPerFrame;

        // The number of rows of apertures is determined by the height of the screen
        this.numberOfRows = Math.ceil((window.innerHeight - this.tesselationOriginPosition.y)/this.hexTesselationVerticalOffset) + 1;
        this.numberOfColumns = 0;

        // Colors for each aperture and aperture edges
        this.color = aperture.apertureColor;
        this.edgeColor = aperture.apertureEdgeColor;

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
        if(aperture.shrinkAnimationComplete == true) {
            this.scrollAnimationStep(scrollSpeedInPercentage);
        }
    }

}

// main tesselation on the start page
let mainApertureTesselation = new apertureTesselation(projectInfoObjectList, {x: 0, y: window.innerHeight/18}, scrollSpeedMultiplier);

let colorSlidersHexagonApothem = window.innerHeight/12;
let CanvasHeightOfColorSliders = window.innerHeight*0.85;

class hexagonColorSlider {
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

// TODO: remove getHueFromHexblah cuz not necessary if I switch to all hsla()
  
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

let backgroundColorButton = new hexagonColorSlider({x: 1.5*colorSlidersHexagonApothem, y: CanvasHeightOfColorSliders}, colorSlidersHexagonApothem, canvasBackgroundColor);

let apertureEdgeColorButton = new hexagonColorSlider({x: window.innerWidth - 1.5*colorSlidersHexagonApothem, y: CanvasHeightOfColorSliders}, colorSlidersHexagonApothem, mainApertureTesselation.edgeColor);


let animationStartTime = undefined;
let globalAnimationId;
let dramaticPageOpenDuration = 2000;
let shrinkDuration = 2000;
let openHoleDuration = 2000;

function dramaticPageOpenPause(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const dramaticPageOpenProgress = (timeStamp - animationStartTime) / dramaticPageOpenDuration;

    if(dramaticPageOpenProgress < 1) {
        drawBackground(aperture.apertureColor);
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

function linearTime(timeStamp, durationOfAnimation) {
    return timeStamp/durationOfAnimation;
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
        aperture.shrinkAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(openAperturesAnimationStep);
    }
}

function openAperturesAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const animationProgress = linearTime((timeStamp - animationStartTime), openHoleDuration);
    
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
        aperture.openHoleAnimationComplete = true;
        aperture.edgeOpenAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(updateCanvasAnimations);
    }
}

function setupCanvas() {
    // Setup mainCanvas to html canvas element
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");
    
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    
    // Event listeners for User Interaction
    mainCanvas.addEventListener('mousemove', onPointerMove);
    mainCanvas.addEventListener('mousedown', onPointerDown);
    mainCanvas.addEventListener('mouseup', onPointerUp);
    mainCanvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
    mainCanvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));
    mainCanvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));

    // Enter the first animation stage with requestAnimationFrame()
    requestAnimationFrame(dramaticPageOpenPause);
}

// Ensures setupCanvas() is run only once
window.addEventListener('load', setupCanvas);

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

function handleTouch(e, singleTouchHandler) {
    e.preventDefault();
    if (e.touches.length <= 1) {
        singleTouchHandler(e);
        wasTouchEvent = true;
    }
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
            
            let newColor = "hsl(" + verticalColor.toString() + ", 100%, 50%)";
            
            backgroundColorButton.setNewHSLAColor(newColor);
            canvasBackgroundColor = newColor;
        }

        if(apertureEdgeColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,apertureEdgeColorButton.hexagonCenterPosition.y) /apertureEdgeColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHexAColor(apertureEdgeColorButton.previousColor);
            
            if(verticalColor > 360) {
                verticalColor -= 360;
            }

            let newColor = "hsl(" + verticalColor.toString() + ", 100%, 50%)";
            
            apertureEdgeColorButton.setNewHSLAColor(newColor);
            mainApertureTesselation.setTesselationEdgeColor(newColor);
        }
    }
}

// https://css-tricks.com/converting-color-spaces-in-javascript/

let pointerDown = false;

function onPointerDown(e) {
    let mouseLocationOnDown = getEventLocation(e);
    
    globalPointerDown = true;
    if(Math.hypot(backgroundColorButton.hexagonCenterPosition.x - mouseLocationOnDown.x, backgroundColorButton.hexagonCenterPosition.y - mouseLocationOnDown.y) < colorSlidersHexagonApothem) {
        backgroundColorButton.pointerDown = true;
        apertureEdgeColorButton.pointerDown = false;
    }
    
    if(Math.hypot(apertureEdgeColorButton.hexagonCenterPosition.x - mouseLocationOnDown.x, apertureEdgeColorButton.hexagonCenterPosition.y - mouseLocationOnDown.y) < colorSlidersHexagonApothem) {
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