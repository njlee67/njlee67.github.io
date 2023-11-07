// import { projects } from '../projectpages' assert { type: 'json' }
import { Aperture } from "./ApertureClass.js";

// Aperture.mainCanvas = document.getElementById("main-canvas");
// Aperture.ctx = Aperture.mainCanvas.getContext("2D");

let projectCanvasBackground = getRandomHue();
let currentProject;
let projectCanvas;
let ctx;

Aperture.apertureHexagonApothem = Math.round(Math.min(window.innerWidth, window.innerHeight)/(2 * Math.sin(Math.PI/3)));

let slideShowAperture = new Aperture({x: Aperture.apertureHexagonApothem, y: window.innerHeight/2});

let bigUpperRight = new Aperture({x: 1.75*(window.innerWidth/2), y: window.innerHeight/2 - (window.innerWidth/2 * Math.sin(Math.PI/3))});
bigUpperRight.AnimationStages.Shrink.currentStageVariable = window.innerWidth/2;

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
    // Setup mainCanvas to html canvas element
    projectCanvas = document.getElementById("project-canvas");
    // console.log(projectCanvas)
    ctx = projectCanvas.getContext("2d");
    
    projectCanvas.width = window.innerWidth;
    projectCanvas.height = window.innerHeight;
    
    // Event listeners for User Interaction
    // mainCanvas.addEventListener('mousemove', onPointerMove);
    // mainCanvas.addEventListener('mousedown', onPointerDown);
    // mainCanvas.addEventListener('mouseup', onPointerUp);
    // mainCanvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
    // mainCanvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));
    // mainCanvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));

    // Enter the first animation stage with requestAnimationFrame()
    requestAnimationFrame(updateProjectCanvasAnimations);
}

// Main Animation Loop using requestAnimationFrame function for each conditional on stage booleans declared above animation
function updateProjectCanvasAnimations() {
    // Set the canvas width and height each time in case window size changes
    projectCanvas.width = window.innerWidth;
    projectCanvas.height = window.innerHeight;

    drawBackground();
    slideShowAperture.drawCurrent();
    bigUpperRight.drawCurrent();
    // Update the tesselation based on user interaction with scrolling after page open sequence of animations
    // mainApertureTesselation.drawCurrentTesselation();
    
    // backgroundColorButton.drawColorSelector();
    // apertureEdgeColorButton.drawColorSelector();

    // Canvas Animation
    requestAnimationFrame(updateProjectCanvasAnimations);
}

// Ensures setupCanvas() is run only once
// window.addEventListener('load', setupProjectCanvas);