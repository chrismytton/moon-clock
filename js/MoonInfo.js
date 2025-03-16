/**
 * Moon information display functionality
 */
import SunCalc from 'suncalc';
import { getMoonPhaseName } from './MoonUtils.js';

/**
 * Calculate moon information based on date
 * @param {Date} date - Date to calculate moon information for
 * @returns {Object} Moon illumination data
 */
export function getMoonData(date) {
    // Get moon data
    const moonIllumination = SunCalc.getMoonIllumination(date);
    return moonIllumination;
}

/**
 * Update the moon information UI display
 * @param {Date} date - Date to display moon information for
 */
export function updateMoonInfo(date) {
    const moonInfo = document.getElementById('moonInfo');
    if (!moonInfo) return;

    // Get moon data
    const moonIllumination = getMoonData(date);

    // Calculate moon age (days since new moon)
    const lunarMonth = 29.53059; // days
    const moonAge = Math.round(moonIllumination.phase * lunarMonth * 10) / 10;

    // Update moon info cards
    moonInfo.innerHTML = `
        <div class="info-card">
            <h3>Phase</h3>
            <p>${getMoonPhaseName(moonIllumination.phase)}</p>
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
