'use strict';

// Global variables
// Declare Canvas and Context Objects
let mainCanvas;
let ctx;

// aperture class is named after a camera aperture
import { Aperture } from './ApertureClass.js';
// Tesselation class creates a repeating grid of apertures and allows control over how many apertures are displayed
import { Tesselation } from './tesselationClass.js';

// The canvasBackgroundColor is the color behind the aperture tesselation pattern in between apertures
let canvasBackgroundColor = "hsl(340, 100%, 50%)";
// apertureColor is the color of the apertures themselves as a static field
Aperture.apertureColor = "hsl(0, 0%, 0%)";
// apertureEdgeColor is the color of the aperture slits in between the sides of the aperture
Aperture.apertureEdgeColor = "hsl(200, 100%, 50%)";
// apertureHexagonApothem is the distance from the center to a vertex of fully tesselated hexagon/aperture when the screen loads 
Aperture.apertureHexagonApothem = Math.round(window.innerHeight/3);

// User Interface Global Variables
// scrollSpeedMultiplier sets the direction that the tesselation scrolls in
let scrollSpeedMultiplier = 8;

// states for mouse and touch events
let globalPointerDown = false;
let wasTouchEvent = false;

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
// better yet html file for each project
/* 
projectJSON = {
    Title: "LMBB",
    Description: "Blah Blah",
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

// main tesselation on the start page which instantiates Aperture class internally
let mainApertureTesselation = new Tesselation(projectInfoObjectList, {x: 0, y: window.innerHeight/18}, scrollSpeedMultiplier);

// Color sliders are the hexagon buttons on the right and left of the canvas which control the color of the
// Canvas background and the edges of the aperture tesselation
let colorSlidersHexagonApothem = window.innerHeight/12;
let canvasHeightOfColorSliders = window.innerHeight*0.85;

class hexagonColorSlider {
    constructor(hexagonCenterPosition, hexagonalApothem, initialHue) {
        this.hexagonCenterPosition = hexagonCenterPosition;
        this.hexagonApothem = hexagonalApothem;
        this.hue = initialHue;
        this.color = "hsl(" + initialHue + ", 100%, 50%)";
        this.previousColor = this.color;
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

function getHueFromHslString(hslString) {
    let hueValue = parseInt(hslString.split(",")[0].replace("hsl(", ""));
    return hueValue;
}

let backgroundColorButton = new hexagonColorSlider({x: 1.5*colorSlidersHexagonApothem, y: canvasHeightOfColorSliders}, colorSlidersHexagonApothem, getHueFromHslString(canvasBackgroundColor));

let apertureEdgeColorButton = new hexagonColorSlider({x: window.innerWidth - 1.5*colorSlidersHexagonApothem, y: canvasHeightOfColorSliders}, colorSlidersHexagonApothem, getHueFromHslString(Aperture.apertureEdgeColor));


let animationStartTime = undefined;
let globalAnimationId;
let dramaticPageOpenDuration = 2000;
let shrinkDuration = 2000;
let openHoleDuration = 1000;

// Functions to control animation progress
function powerTiming(timing, exponent) {
    return Math.pow(timing, exponent);
}

function linearTime(timeStamp, durationOfAnimation) {
    return timeStamp/durationOfAnimation;
}

function dramaticPageOpenPause(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const dramaticPageOpenProgress = (timeStamp - animationStartTime) / dramaticPageOpenDuration;

    if(dramaticPageOpenProgress < 1) {
        drawBackground(Aperture.apertureColor);
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
        Aperture.shrinkAnimationComplete = true;

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
        Aperture.openHoleAnimationComplete = true;
        Aperture.edgeOpenAnimationComplete = true;

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
            mainApertureTesselation.scrollSpeedInPercentage = ((mouseLocationOnMove.x-((2/3)*mainCanvas.width))/((1/3)*mainCanvas.width))
        }
        else if(mouseLocationOnMove.x < (1/3)*mainCanvas.width) {
            mainApertureTesselation.scrollSpeedInPercentage = -(1-(mouseLocationOnMove.x/((1/3)*mainCanvas.width)))
        }
        else {
            mainApertureTesselation.scrollSpeedInPercentage = 0;
        }
    
        if(backgroundColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,backgroundColorButton.hexagonCenterPosition.y) /backgroundColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHslString(backgroundColorButton.previousColor);
            
            if(verticalColor > 360) {
                verticalColor -= 360;
            }
            
            let newColor = "hsl(" + verticalColor.toString() + ", 100%, 50%)";
            
            backgroundColorButton.setNewHSLAColor(newColor);
            canvasBackgroundColor = newColor;
        }

        if(apertureEdgeColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,apertureEdgeColorButton.hexagonCenterPosition.y) /apertureEdgeColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHslString(apertureEdgeColorButton.previousColor);
            
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
                mainApertureTesselation.scrollSpeedInPercentage = ((mouseLocationOnDown.x-((2/3)*mainCanvas.width))/((1/3)*mainCanvas.width))
            }
            else if(mouseLocationOnDown.x < (1/3)*mainCanvas.width) {
                mainApertureTesselation.scrollSpeedInPercentage = -(1-(mouseLocationOnDown.x/((1/3)*mainCanvas.width)))
            }
            else {
                mainApertureTesselation.scrollSpeedInPercentage = 0;
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