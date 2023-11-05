let globalAnimationId;

// animationStartTime is the time that an animation starts to get the animationProgress [0.00, 1.00]
// To control each AnimationStage with setAnimationProgress() method in aperture class
let animationStartTime = undefined;

// The durations of each animation stage
let dramaticPageOpenDuration = 1500;
let shrinkDuration = 1000;
let openEdgesDuration = 1000;
let openHoleDuration = 1000;

export class TimedAnimation {
    constructor(){
        
    }
}

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

    const animationProgress = powerTiming( (timeStamp - animationStartTime), 4, shrinkDuration);
    
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
        // let commandValue = mainApertureTesselation.aperturesArray[4].fullyShrunkenHexagonSize - ((mainApertureTesselation.aperturesArray[4].hexagonalApothem - mainApertureTesselation.aperturesArray[4].fullyShrunkenHexagonSize) * (animationProgress - 1.0));
        for(let apertureIndex = 0;apertureIndex < mainApertureTesselation.aperturesArray.length;apertureIndex++) {
            mainApertureTesselation.aperturesArray[apertureIndex].setAnimationProgress(animationProgress, mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenEdge);
            mainApertureTesselation.aperturesArray[apertureIndex].setAnimationVariable(mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenEdge.currentStageVariable, mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenHole);
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
        // for(let apertureIndex = 0;apertureIndex < mainApertureTesselation.aperturesArray.length;apertureIndex++) {
        //     mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenHole.initialValue = mainApertureTesselation.aperturesArray[apertureIndex].AnimationStages.OpenHole.currentStageVariable;
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
        for(let apertureIndex = 0;apertureIndex < mainApertureTesselation.aperturesArray.length;apertureIndex++) {
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