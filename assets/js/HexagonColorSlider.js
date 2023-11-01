export class HexagonColorSlider {
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