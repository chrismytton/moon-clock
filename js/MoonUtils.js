/**
 * Moon phase utility functions
 */

/**
 * Get the name of the moon phase based on its numeric phase value
 * @param {number} phase - Moon phase (0-1)
 * @returns {string} Moon phase name
 */
export function getMoonPhaseName(phase) {
    if (phase < 0.03 || phase >= 0.97) return 'New Moon';
    else if (phase < 0.22) return 'Waxing Crescent';
    else if (phase < 0.28) return 'First Quarter';
    else if (phase < 0.47) return 'Waxing Gibbous';
    else if (phase < 0.53) return 'Full Moon';
    else if (phase < 0.72) return 'Waning Gibbous';
    else if (phase < 0.78) return 'Last Quarter';
    else return 'Waning Crescent';
}

/**
 * Format a date for datetime-local input
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
