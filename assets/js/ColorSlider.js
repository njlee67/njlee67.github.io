export class ColorSlider {

    static mainCanvas = document.getElementById("main-canvas");
    static ctx = ColorSlider.mainCanvas.getContext("2d");

    constructor(hexagonCenterPosition, hexagonalApothem, initialHue) {
        this.hexagonCenterPosition = hexagonCenterPosition;
        this.hexagonApothem = hexagonalApothem;
        this.hue = initialHue;
        this.color = "hsl(" + initialHue + ", 100%, 50%)";
        this.previousColor = this.color;
        this.pointerDown = false;
    }

    drawColorSelector() {
        ColorSlider.ctx.fillStyle = this.color;
        
        // Draw hexagon filled shape using lineTo() and closePath() functions going from each vertex and back again in a loop
        ColorSlider.ctx.beginPath();
        ColorSlider.ctx.moveTo(this.hexagonCenterPosition.x + this.hexagonApothem*Math.sin(Math.PI/6), this.hexagonCenterPosition.y + this.hexagonApothem*Math.cos(Math.PI/6));
    
        for(let vertex = 0;vertex < 6;vertex++) {
            ColorSlider.ctx.lineTo(this.hexagonCenterPosition.x + this.hexagonApothem*Math.sin(vertex*Math.PI/3 + Math.PI/6), this.hexagonCenterPosition.y + this.hexagonApothem*Math.cos(vertex*Math.PI/3 + Math.PI/6));
        }
    
        ColorSlider.ctx.closePath();
        ColorSlider.ctx.fill();
    }

    setNewHSLAColor(newHSLAColor) {
        this.color = newHSLAColor;
    }
}