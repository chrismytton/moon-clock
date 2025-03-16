import SunCalc from 'suncalc';

customElements.define('moon-clock', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        let style = document.createElement('style');
        let width = Math.min(this.shadowRoot.host.parentElement.clientWidth, 800);
        let height = width;

        style.textContent = `
            :host {
                width: ${width}px;
                height: ${height}px;
                display: block;
                margin: 0 auto;
            }

            canvas {
                display: block;
            }
        `;
        this.shadowRoot.appendChild(style);

        // Create a wrapper div for positioning
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext('2d');
        this.radius = canvas.height / 2;
        this.ctx.translate(this.radius, this.radius);
        this.radius = this.radius * 0.90;

        wrapper.appendChild(canvas);
        this.shadowRoot.appendChild(wrapper);

        // Initialize with current date
        this.currentDate = new Date();
        this.isCurrentTimeMode = true;
        this.drawClock();
        this.updateMoonInfo();

        // Set up the datetime control
        const dateTimeControl = document.getElementById('dateTimeControl');
        const resetButton = document.getElementById('resetButton');

        // Format the current date for the input
        const formatDateForInput = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        const now = new Date();
        dateTimeControl.value = formatDateForInput(now);

        // Add event listeners
        dateTimeControl.addEventListener('change', (e) => {
            this.currentDate = new Date(e.target.value);
            this.isCurrentTimeMode = false;
            this.drawClock();
            this.updateMoonInfo();
        });

        resetButton.addEventListener('click', () => {
            this.currentDate = new Date();
            this.isCurrentTimeMode = true;
            dateTimeControl.value = formatDateForInput(this.currentDate);
            this.drawClock();
            this.updateMoonInfo();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            let width = Math.min(this.shadowRoot.host.parentElement.clientWidth, 800);
            let height = width;

            canvas.width = width;
            canvas.height = height;
            this.ctx = canvas.getContext('2d');
            this.radius = canvas.height / 2;
            this.ctx.translate(this.radius, this.radius);
            this.radius = this.radius * 0.90;

            this.drawClock();
        });

        // Update every minute for real-time mode
        this.intervalId = setInterval(() => {
            // Only update automatically if we're in current time mode
            if (this.isCurrentTimeMode) {
                this.currentDate = new Date();
                dateTimeControl.value = formatDateForInput(this.currentDate);
                this.drawClock();
                this.updateMoonInfo();
            }
        }, 1000 * 60);
    }

    disconnectedCallback() {
        // Clean up interval when component is removed
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    drawClock() {
        this.drawFace();
        this.drawNumbers();
        this.drawTime();
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

    drawTime() {
        const moonIllumination = SunCalc.getMoonIllumination(this.currentDate);
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

    updateMoonInfo() {
        const moonInfo = document.getElementById('moonInfo');
        if (!moonInfo) return;

        // Get moon data
        const moonIllumination = SunCalc.getMoonIllumination(this.currentDate);

        // Calculate moon age (days since new moon)
        const lunarMonth = 29.53059; // days
        const moonAge = Math.round(moonIllumination.phase * lunarMonth * 10) / 10;

        // Update moon info cards
        moonInfo.innerHTML = `
            <div class="info-card">
                <h3>Phase</h3>
                <p>${this.getMoonPhaseName(moonIllumination.phase)}</p>
            </div>
            <div class="info-card">
                <h3>Illumination</h3>
                <p>${Math.round(moonIllumination.fraction * 100)}%</p>
            </div>
            <div class="info-card">
                <h3>Moon Age</h3>
                <p>${moonAge} days</p>
            </div>
        `;
    }

    getMoonPhaseName(phase) {
        if (phase < 0.03 || phase >= 0.97) return 'New Moon';
        else if (phase < 0.22) return 'Waxing Crescent';
        else if (phase < 0.28) return 'First Quarter';
        else if (phase < 0.47) return 'Waxing Gibbous';
        else if (phase < 0.53) return 'Full Moon';
        else if (phase < 0.72) return 'Waning Gibbous';
        else if (phase < 0.78) return 'Last Quarter';
        else return 'Waning Crescent';
    }
});
