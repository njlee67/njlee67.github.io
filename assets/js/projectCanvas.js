// import { projects } from '../projectpages' assert { type: 'json' }
import { Aperture } from "./ApertureClass.js";

import { Tesselation } from "./tesselationClass.js";

import { ColorSlider } from "./ColorSlider.js";
// Aperture.projectCanvas = document.getElementById("main-canvas");
// Aperture.ctx = Aperture.projectCanvas.getContext("2D");

let projectCanvasBackground = getRandomHue();
let currentProject;
let projectCanvas;
let ctx;

let globalPointerDown = false;

let scaleUp = 1.25;

Aperture.apertureHexagonApothem =  Math.round(scaleUp*Math.min(window.innerWidth, window.innerHeight)/(2 * Math.sin(Math.PI/3)));
Aperture.shrinkPercent = 92;
Aperture.apertureEdgeColor = getRandomHue();

// bigUpperRight.AnimationStages.Shrink.currentStageVariable = window.innerWidth/2;

let projectApertures = [];

function onPointerMove(e) {
    let mouseLocationOnMove = getEventLocation(e);
    // console.log('touchmovin');
    if(mouseLocationOnMove != undefined && mouseLocationOnMove != null) {
    
        if(backgroundColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,backgroundColorButton.hexagonCenterPosition.y) /backgroundColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHslString(backgroundColorButton.previousColor);
            
            if(verticalColor > 360) {
                verticalColor -= 360;
            }
            
            let newColor = "hsl(" + verticalColor.toString() + ", 50%, 50%)";
            
            backgroundColorButton.setNewHSLAColor(newColor);
            projectCanvasBackground = newColor;
        }

        if(apertureEdgeColorButton.pointerDown) {
            let mouseBoundedVertical = Math.max(Math.min(mouseLocationOnMove.y,apertureEdgeColorButton.hexagonCenterPosition.y) /apertureEdgeColorButton.hexagonCenterPosition.y, 0);
            
            let verticalColor = 360*(1 - mouseBoundedVertical) + getHueFromHslString(apertureEdgeColorButton.previousColor);
            
            if(verticalColor > 360) {
                verticalColor -= 360;
            }

            let newColor = "hsl(" + verticalColor.toString() + ", 50%, 50%)";
            
            apertureEdgeColorButton.setNewHSLAColor(newColor);
            projectApertures[0].setEdgeColor(newColor);
        }
    }
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
}

function onPointerUp(e) {
    globalPointerDown = false;
    backgroundColorButton.pointerDown = false;
    backgroundColorButton.previousColor = backgroundColorButton.color;

    // if(backgroundColorButton.color.length < 9) {
    //     backgroundColorButton.color = backgroundColorButton.color;
    // }
    
    apertureEdgeColorButton.pointerDown = false;
    apertureEdgeColorButton.previousColor = apertureEdgeColorButton.color;

    // if(apertureEdgeColorButton.color.length < 9) {
    //     apertureEdgeColorButton.color = apertureEdgeColorButton.color;
    // }
}

for(let apertureIndex = 0;apertureIndex < 4;apertureIndex++) {
    projectApertures.push(new Aperture({x: window.innerWidth/2, y: scaleUp*window.innerHeight/2 + scaleUp*apertureIndex * window.innerHeight}))
    projectApertures.push(new Aperture({x: window.innerWidth/2 + 1.5*Aperture.apertureHexagonApothem, y: scaleUp*apertureIndex * window.innerHeight}))
    projectApertures.push(new Aperture({x: window.innerWidth/2 - 1.5*Aperture.apertureHexagonApothem, y: scaleUp*apertureIndex * window.innerHeight}))
}

// Color sliders are the hexagon buttons on the right and left of the canvas which control the color of the
// Canvas background and the edges of the aperture tesselation
let colorSlidersHexagonApothem = window.innerHeight/12;
let canvasHeightOfColorSliders = window.innerHeight*0.85;

function getHueFromHslString(hslString) {
    let hueValue = parseInt(hslString.split(",")[0].replace("hsl(", ""));
    return hueValue;
}

let backgroundColorButton = new ColorSlider({x: 1.5*colorSlidersHexagonApothem, y: canvasHeightOfColorSliders}, colorSlidersHexagonApothem, getHueFromHslString(projectCanvasBackground));

let apertureEdgeColorButton = new ColorSlider({x: window.innerWidth - 1.5*colorSlidersHexagonApothem, y: canvasHeightOfColorSliders}, colorSlidersHexagonApothem, getHueFromHslString(Aperture.apertureEdgeColor));


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

projectApertures[0].attachThumbnaiil(new projectInfo('/images/thumbnails/LMBB v2.jpg', 'LMBB v2', 'v2.0', 'BT Speaker'));
let globalAnimationId;

// animationStartTime is the time that an animation starts to get the animationProgress [0.00, 1.00]
// To control each AnimationStage with setAnimationProgress() method in aperture class
let animationStartTime = undefined;

// The durations of each animation stage
let dramaticPageOpenDuration = 1000;
let shrinkDuration = 1000;
let openEdgesDuration = 1000;
let openHoleDuration = 1000;
let closeHoleDuration = 1000;
let closeEdgeDuration = 1000;
let expandDuration = 1000;

// Functions to control animation progress
function powerTiming(timing, exponent, durationOfAnimation) {
    return Math.pow(timing/durationOfAnimation, exponent);
}

function linearTime(timeStamp, durationOfAnimation) {
    return timeStamp/durationOfAnimation;
}

function dramaticPageOpenPause(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const dramaticPageOpenProgress = linearTime(timeStamp - animationStartTime, dramaticPageOpenDuration);

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

    const animationProgress = powerTiming( (timeStamp - animationStartTime), 3, shrinkDuration);
    
    if(animationProgress < 1) {
        drawBackground();

        for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
            projectApertures[apertureIndex].setAnimationProgress(animationProgress, projectApertures[apertureIndex].AnimationStages.Shrink)
        }

        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(shrinkAnimationStep);
    }
    else {
        Aperture.shrinkAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(openEdgesAnimationStep);
    }
}

function openEdgesAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }
    
    const animationProgress = linearTime((timeStamp - animationStartTime), openEdgesDuration);
    
    if(animationProgress < 1) {
        drawBackground();
        // let commandValue = projectApertures[4].fullyShrunkenHexagonSize - ((projectApertures[4].hexagonalApothem - projectApertures[4].fullyShrunkenHexagonSize) * (animationProgress - 1.0));
        for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
            projectApertures[apertureIndex].setAnimationProgress(animationProgress, projectApertures[apertureIndex].AnimationStages.OpenEdge);
            projectApertures[apertureIndex].setAnimationVariable(projectApertures[apertureIndex].AnimationStages.OpenEdge.currentStageVariable, projectApertures[apertureIndex].AnimationStages.OpenHole);
        }

        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(openEdgesAnimationStep);
    }
    else {
        Aperture.openHoleAnimationComplete = true;
        Aperture.edgeOpenAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;

        // OpenEdge and OpenHole are coupled, so you have to open hole animation at the same time as open edge 
        // for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
        //     projectApertures[apertureIndex].AnimationStages.OpenHole.initialValue = projectApertures[apertureIndex].AnimationStages.OpenHole.currentStageVariable;
        // }
        requestAnimationFrame(openAperturesAnimationStep);
    }
}

function openAperturesAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const animationProgress = powerTiming((timeStamp - animationStartTime), 8, openHoleDuration);
    
    if(animationProgress < 1) {
        drawBackground();
        for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
            projectApertures[apertureIndex].setAnimationProgress(animationProgress, projectApertures[apertureIndex].AnimationStages.OpenHole);
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
        requestAnimationFrame(updateProjectCanvasAnimations);
    }
}

function closeHoleAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const animationProgress = powerTiming( (timeStamp - animationStartTime), 7, closeHoleDuration);
    
    if(animationProgress <= 1) {
        drawBackground();

        for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
            projectApertures[apertureIndex].setReverseAnimationProgress(animationProgress, projectApertures[apertureIndex].AnimationStages.OpenHole)
        }

        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(closeHoleAnimationStep);
    }
    else {

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(closeEdgesAnimationStep);
    }
}

function closeEdgesAnimationStep(timeStamp) {
    if(animationStartTime === undefined) {
        animationStartTime = timeStamp;
    }

    const animationProgress = powerTiming( (timeStamp - animationStartTime), 7, closeEdgeDuration);
    
    if(animationProgress <= 1) {
        drawBackground();

        for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
            projectApertures[apertureIndex].setReverseAnimationProgress(animationProgress, projectApertures[apertureIndex].AnimationStages.OpenEdge);
            projectApertures[apertureIndex].setAnimationVariable(projectApertures[apertureIndex].AnimationStages.OpenEdge.currentStageVariable, projectApertures[apertureIndex].AnimationStages.OpenHole);
        }

        backgroundColorButton.drawColorSelector();
        apertureEdgeColorButton.drawColorSelector();

        globalAnimationId = requestAnimationFrame(closeEdgesAnimationStep);
    }
    else {
        Aperture.edgeCloseAnimationComplete = true;

        cancelAnimationFrame(globalAnimationId);
        animationStartTime = undefined;
        requestAnimationFrame(expandAnimationStep);
    }
}

export function setCurrentProject(project) {
    currentProject = project;
    window.location.href = (window.location.href + "projects/lmbbv2.html");
    
}

if(window.location.href.includes("lmbbv2")) {
    window.addEventListener('load', setupProjectCanvas);
}

// Draws background rectangle on the canvas
function drawBackground(color = projectCanvasBackground) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, projectCanvas.width, projectCanvas.height);
}

function getRandomHue() {
    let randomHue = 360*Math.random();
    return "hsl(" + randomHue + ", 50%, 50%)"
}

function setupProjectCanvas() {
    // Setup projectCanvas to html canvas element
    projectCanvas = document.getElementById("project-canvas");
    // console.log(projectCanvas)
    ctx = projectCanvas.getContext("2d");
    
    projectCanvas.width = window.innerWidth;
    projectCanvas.height = window.innerHeight;
    
    // Event listeners for User Interaction
    projectCanvas.addEventListener('mousemove', onPointerMove);
    projectCanvas.addEventListener('mousedown', onPointerDown);
    projectCanvas.addEventListener('mouseup', onPointerUp);
    // projectCanvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
    // projectCanvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));
    // projectCanvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));
    projectCanvas.addEventListener('wheel', onScrollMove);

    // Enter the first animation stage with requestAnimationFrame()
    requestAnimationFrame(dramaticPageOpenPause);
}

function onScrollMove(e) {
    let SCROLL_SENSITIVITY = -0.25;
    let scrollDelta = e.deltaY * SCROLL_SENSITIVITY;
  
    if(projectApertures[1].apertureCenter.y >= -2*window.innerHeight && projectApertures[1].apertureCenter.y <= 0) {
        for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
            projectApertures[apertureIndex].apertureCenter = {x: projectApertures[apertureIndex].apertureCenter.x, y: projectApertures[apertureIndex].apertureCenter.y + scrollDelta};
        }
    }
    else{
        if(projectApertures[1].apertureCenter.y <= -2*window.innerHeight && scrollDelta > 0) {
            for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
                projectApertures[apertureIndex].apertureCenter = {x: projectApertures[apertureIndex].apertureCenter.x, y: projectApertures[apertureIndex].apertureCenter.y + scrollDelta};
            }
            
        }
        else if(projectApertures[1].apertureCenter.y >= 0 && scrollDelta < 0) {
            for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
                projectApertures[apertureIndex].apertureCenter = {x: projectApertures[apertureIndex].apertureCenter.x, y: projectApertures[apertureIndex].apertureCenter.y + scrollDelta};
            }
        }
    }
  
   
    // if(allAperturesLessThanWindowHeight == true && allAperturesGreaterThan0 == false && scrollDelta < 0) {
    //     for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
    //         projectApertures[apertureIndex].apertureCenter = {x: projectApertures[apertureIndex].apertureCenter.x, y: projectApertures[apertureIndex].apertureCenter.y + scrollDelta};
    //     }
    // }
  
}

// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateProjectCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    projectCanvas.width = window.innerWidth;
    projectCanvas.height = window.innerHeight;

    drawBackground();
    
    for(let apertureIndex = 0;apertureIndex < projectApertures.length;apertureIndex++) {
        projectApertures[apertureIndex].drawCurrent();
    }
    // Update the tesselation based on user interaction with scrolling after page open sequence of animations
    // mainApertureTesselation.drawCurrentTesselation();
    
    backgroundColorButton.drawColorSelector();
    apertureEdgeColorButton.drawColorSelector();

    // Canvas Animation
    requestAnimationFrame(updateProjectCanvasAnimations);
}

// Ensures setupCanvas() is run only once
// window.addEventListener('load', setupProjectCanvas);