/**
 * Main Moon Clock component
 */
import { ClockRenderer } from './ClockRenderer.js';
import { updateMoonInfo, getMoonData } from './MoonInfo.js';
import { formatDateForInput } from './MoonUtils.js';

export class MoonClock extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });

        // Set up properties
        this.currentDate = new Date();
        this.isCurrentTimeMode = true;

        // Initialize UI
        this.setupUI();
        this.setupControls();

        // Initial render
        this.drawClock();

        // Set up automatic updates if in current time mode
        this.setupAutoUpdate();

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupUI() {
        // Calculate dimensions
        let width = Math.min(this.shadowRoot.host.parentElement.clientWidth, 800);
        let height = width;

        // Add styles
        let style = document.createElement('style');
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

        // Create canvas
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext('2d');
        this.radius = canvas.height / 2;
        this.ctx.translate(this.radius, this.radius);
        this.radius = this.radius * 0.90;

        // Save references
        this.canvas = canvas;
        this.wrapper = wrapper;

        // Create renderer
        this.renderer = new ClockRenderer(this.ctx, this.radius);

        // Add to DOM
        wrapper.appendChild(canvas);
        this.shadowRoot.appendChild(wrapper);
    }

    setupControls() {
        // Get control elements
        const dateTimeControl = document.getElementById('dateTimeControl');
        const resetButton = document.getElementById('resetButton');

        if (!dateTimeControl || !resetButton) return;

        // Set initial value
        dateTimeControl.value = formatDateForInput(this.currentDate);

        // Add event listeners
        dateTimeControl.addEventListener('change', (e) => {
            this.currentDate = new Date(e.target.value);
            this.isCurrentTimeMode = false;
            this.drawClock();
        });

        resetButton.addEventListener('click', () => {
            this.currentDate = new Date();
            this.isCurrentTimeMode = true;
            dateTimeControl.value = formatDateForInput(this.currentDate);
            this.drawClock();
        });
    }

    setupAutoUpdate() {
        // Update every minute for real-time mode
        this.intervalId = setInterval(() => {
            // Only update automatically if we're in current time mode
            if (this.isCurrentTimeMode) {
                this.currentDate = new Date();

                const dateTimeControl = document.getElementById('dateTimeControl');
                if (dateTimeControl) {
                    dateTimeControl.value = formatDateForInput(this.currentDate);
                }

                this.drawClock();
            }
        }, 1000 * 60);
    }

    handleResize() {
        let width = Math.min(this.shadowRoot.host.parentElement.clientWidth, 800);
        let height = width;

        this.canvas.width = width;
        this.canvas.height = height;
        this.radius = this.canvas.height / 2;
        this.ctx.translate(this.radius, this.radius);
        this.radius = this.radius * 0.90;

        // Update renderer
        this.renderer = new ClockRenderer(this.ctx, this.radius);

        // Redraw
        this.drawClock();
    }

    drawClock() {
        // Get moon data and update info panel
        updateMoonInfo(this.currentDate);
        const moonIllumination = getMoonData(this.currentDate);

        // Render the clock
        this.renderer.drawClock(moonIllumination);
    }

    disconnectedCallback() {
        // Clean up interval when component is removed
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
    }
}
