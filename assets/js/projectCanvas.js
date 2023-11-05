// import { projects } from '../projectpages' assert { type: 'json' }
import { Aperture } from "./ApertureClass.js";

// Aperture.mainCanvas = document.getElementById("main-canvas");
// Aperture.ctx = Aperture.mainCanvas.getContext("2D");

let currentProject;
let projectCanvas;
let ctx;

Aperture.apertureHexagonApothem = Math.round(Math.min(window.innerWidth, window.innerHeight)/2);

let slideShowAperture = new Aperture({x: window.innerWidth/2, y:window.innerHeight/2});

export function setCurrentProject(project) {
    currentProject = project;
    window.location.href = (window.location.href + "projects/lmbbv2.html");
    
}

if(window.location.href.includes("lmbbv2")) {
    window.addEventListener('load', setupProjectCanvas);
}

// Draws background rectangle on the canvas
function drawBackground(color = "hsl(80, 100%, 50%)") {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, projectCanvas.width, projectCanvas.height);
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
    // Update the tesselation based on user interaction with scrolling after page open sequence of animations
    // mainApertureTesselation.drawCurrentTesselation();
    
    // backgroundColorButton.drawColorSelector();
    // apertureEdgeColorButton.drawColorSelector();

    // Canvas Animation
    requestAnimationFrame(updateProjectCanvasAnimations);
}

// Ensures setupCanvas() is run only once
// window.addEventListener('load', setupProjectCanvas);