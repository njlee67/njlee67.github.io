
// animationStartTime is the time that an animation starts to get the animationProgress [0.00, 1.00]
// To control each AnimationStage with setAnimationProgress() method in aperture class

// The durationOfAnimations of each animation stage
let dramaticPageOpenDurationOfAnimation = 1500;
let shrinkDurationOfAnimation = 1000;
let openEdgesDurationOfAnimation = 1000;
let openHoleDurationOfAnimation = 1000;

export class DurationAnimation {
    constructor(setProgressFunction, durationOfAnimation, timingFunction, drawBeforeFunction, drawAfterFunction){
        this.setProgressFunction = setProgressFunction;
        this.drawBeforeFunction = drawBeforeFunction;
        this.drawAfterFunction = drawAfterFunction;
        this.durationOfAnimation = durationOfAnimation
        this.timingFunction = timingFunction;
    }

    startAnimation(nextAnimationFunction = undefined) {
        let startTime;
        let durationOfAnimation = this.durationOfAnimation;
        let drawBeforeFunction = this.drawBeforeFunction;
        let drawAfterFunction = this.drawAfterFunction;
        let setProgressFunction = this.setProgressFunction;
        let timingFunction = this.timingFunction;
        let animationId;

        let durationAnimationFunction = function (timeStamp) {
            
            if(startTime === undefined) {
                startTime = timeStamp;
            }
        
            const animationProgress = timingFunction((timeStamp - startTime), durationOfAnimation);
            
            if(animationProgress < 1) {
                drawBeforeFunction();
        
                setProgressFunction(animationProgress);
        
                drawAfterFunction();
        
                animationId = requestAnimationFrame(durationAnimationFunction);
            }
            else {
        
                cancelAnimationFrame(animationId);

                if(!(nextAnimationFunction === undefined)) {
                    requestAnimationFrame(nextAnimationFunction);
                }
            }
        }
        requestAnimationFrame(durationAnimationFunction);
    }
    
}