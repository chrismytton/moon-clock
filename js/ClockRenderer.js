/**
 * Clock rendering methods
 */
export class ClockRenderer {
    constructor(ctx, radius) {
        this.ctx = ctx;
        this.radius = radius;
    }

    drawClock(moonPhase) {
        this.drawFace();
        this.drawNumbers();
        if (moonPhase) {
            this.drawTime(moonPhase);
        }
    }

    drawFace() {
        // Clear canvas
        this.ctx.clearRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

        // Draw outer circle with gradient
        let grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fill();

        // Draw outer ring
        grad = this.ctx.createRadialGradient(0, 0, this.radius * 0.95, 0, 0, this.radius * 1.05);
        grad.addColorStop(0, '#444');
        grad.addColorStop(0.5, '#cc97ff');  // Brighter purple
        grad.addColorStop(1, '#444');
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = this.radius * 0.07;
        this.ctx.stroke();

        // Draw stars in the background
        this.drawStars();

        // Draw center point
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius * 0.06, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#bb86fc';
        this.ctx.fill();
    }

    drawStars() {
        // Draw some random stars in the background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';  // Reduced opacity from 0.5 to 0.3
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.radius * 2 - this.radius;
            const y = Math.random() * this.radius * 2 - this.radius;
            const size = Math.random() * 1.5;

            // Only draw stars that are within the circle
            if (x*x + y*y < this.radius*this.radius) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }

    drawNumbers() {
        let ang;
        let num;

        // Draw tick marks for each hour
        for (num = 1; num <= 8; num++) {
            ang = num * Math.PI / 4;

            // Draw moon phase emoji
            this.ctx.font = this.radius * 0.15 + "px Arial";
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = '#e1e1e1';

            this.ctx.rotate(ang);
            this.ctx.translate(0, -this.radius * 0.85);
            this.ctx.rotate(-ang);

            if (num === 1) {
                this.ctx.fillText('🌒', 0, 0);
            } else if (num === 2) {
                this.ctx.fillText('🌓', 0, 0);
            } else if (num === 3) {
                this.ctx.fillText('🌔', 0, 0);
            } else if (num === 4) {
                this.ctx.fillText('🌕', 0, 0);
            } else if (num === 5) {
                this.ctx.fillText('🌖', 0, 0);
            } else if (num === 6) {
                this.ctx.fillText('🌗', 0, 0);
            } else if (num === 7) {
                this.ctx.fillText('🌘', 0, 0);
            } else if (num === 8) {
                this.ctx.fillText('🌑', 0, 0);
            }

            this.ctx.rotate(ang);
            this.ctx.translate(0, this.radius * 0.85);
            this.ctx.rotate(-ang);
        }
    }

    drawTime(moonIllumination) {
        const angle = moonIllumination.phase * 2 * Math.PI;

        // Display current phase percentage
        this.ctx.font = `${this.radius * 0.1}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`;
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#e1e1e1";
        const phasePercent = Math.round(moonIllumination.fraction * 100);
        this.ctx.fillText(`${phasePercent}% illuminated`, 0, this.radius * 0.3);

        // Draw the hand
        this.drawHand(angle, this.radius * 0.7, this.radius * 0.03, '#bb86fc');

        // Draw a small circle at the end of the hand
        this.ctx.save();
        this.ctx.rotate(angle);
        this.ctx.beginPath();
        this.ctx.arc(0, -this.radius * 0.7, this.radius * 0.05, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#bb86fc';
        this.ctx.fill();
        this.ctx.restore();
    }

    drawHand(pos, length, width, color = '#bb86fc') {
        this.ctx.beginPath();
        this.ctx.lineWidth = width;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(0, 0);
        this.ctx.rotate(pos);
        this.ctx.lineTo(0, -length);
        this.ctx.stroke();
        this.ctx.rotate(-pos);
    }
}
