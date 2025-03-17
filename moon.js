import * as THREE from 'three';
import SunCalc from 'suncalc';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010101);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Create star field
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        vertexColors: true
    });

    // Create star positions (random distribution in a sphere)
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    const radius = 50; // Large radius to place stars far away
    const cameraZ = 5; // Camera position on z-axis
    const moonRadius = 1; // Moon radius

    // Create a much wider cone of exclusion from camera to moon
    // Using a larger angle to ensure no stars appear in front of the moon
    const coneAngle = Math.atan2(moonRadius * 4, cameraZ); // Much wider cone

    let validStarsCount = 0;
    let attempts = 0;
    const maxAttempts = starsCount * 20; // Increase max attempts

    while (validStarsCount < starsCount && attempts < maxAttempts) {
        attempts++;

        // Random position in a sphere
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        // Vector from camera to star
        const dx = x;
        const dy = y;
        const dz = z - cameraZ; // Adjust for camera position

        // Vector from camera to moon center
        const moonX = 0;
        const moonY = 0;
        const moonZ = 0 - cameraZ; // Moon is at origin, camera at (0,0,cameraZ)

        // Calculate distance from camera to star
        const distToStar = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Calculate distance from camera to moon
        const distToMoon = Math.sqrt(moonX*moonX + moonY*moonY + moonZ*moonZ);

        // Calculate the dot product
        const dotProduct = (dx * moonX + dy * moonY + dz * moonZ) / (distToStar * distToMoon);

        // Clamp dotProduct to avoid floating point errors
        const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));

        // Calculate angle between vectors
        const angle = Math.acos(clampedDotProduct);

        // Calculate distance from star to moon-camera line
        // This is the perpendicular distance from the star to the line from camera to moon
        const perpendicularDist = distToStar * Math.sin(angle);

        // If star is outside the cone of exclusion or behind the moon, add it
        // Using a larger exclusion zone and checking perpendicular distance
        if ((angle > coneAngle && perpendicularDist > moonRadius * 3) || z < -moonRadius * 2) {
            positions[validStarsCount * 3] = x;
            positions[validStarsCount * 3 + 1] = y;
            positions[validStarsCount * 3 + 2] = z;

            // Random star colors (mostly white with hints of blue/yellow)
            const colorChoice = Math.random();
            if (colorChoice > 0.95) {
                // Blue-ish star
                colors[validStarsCount * 3] = 0.8 + Math.random() * 0.2;
                colors[validStarsCount * 3 + 1] = 0.8 + Math.random() * 0.2;
                colors[validStarsCount * 3 + 2] = 1.0;
            } else if (colorChoice > 0.9) {
                // Yellow-ish star
                colors[validStarsCount * 3] = 1.0;
                colors[validStarsCount * 3 + 1] = 1.0;
                colors[validStarsCount * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else {
                // White star with slight variation
                const shade = 0.8 + Math.random() * 0.2;
                colors[validStarsCount * 3] = shade;
                colors[validStarsCount * 3 + 1] = shade;
                colors[validStarsCount * 3 + 2] = shade;
            }

            validStarsCount++;
        }
    }

    console.log(`Generated ${validStarsCount} stars after ${attempts} attempts`);

    // If we couldn't generate enough stars, trim the arrays
    if (validStarsCount < starsCount) {
        const trimmedPositions = new Float32Array(validStarsCount * 3);
        const trimmedColors = new Float32Array(validStarsCount * 3);

        for (let i = 0; i < validStarsCount * 3; i++) {
            trimmedPositions[i] = positions[i];
            trimmedColors[i] = colors[i];
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(trimmedPositions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(trimmedColors, 3));
    } else {
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    return stars;
}

// Add stars to the scene
const stars = createStars();
scene.add(stars);

// Load moon texture
const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg');

// Setup the moon
const moonGeometry = new THREE.SphereGeometry(1, 64, 64);
const moonMaterial = new THREE.MeshPhongMaterial({
    map: moonTexture,
    bumpMap: moonTexture,
    bumpScale: 0.02,
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Add a directional light for the sun
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sunLight);

// Function to update moon phase
function updateMoonPhase(date = new Date()) {
    const illumination = SunCalc.getMoonIllumination(date);

    // In our scene:
    // - Camera is positioned at +z axis (viewing from Earth)
    // - Moon is at origin
    // - Sun (directional light) needs to be positioned to create correct phase

    // Position the sun based on the moon's phase
    // For phase 0 (new moon): sun is behind moon (from Earth's perspective)
    // For phase 0.5 (full moon): sun is behind Earth/camera
    const distance = 10;

    // Calculate sun position
    // Convert phase to angle (0->0°, 0.5->180°, 1->360°)
    // The phase value alone determines where in its orbit the moon is relative to the sun
    const phaseAngle = illumination.phase * Math.PI * 2;

    // Position the light correctly for the phase angle
    // For waxing moon (increasing illumination), light comes from right side
    // For waning moon (decreasing illumination), light comes from left side
    sunLight.position.x = Math.sin(phaseAngle) * distance;
    sunLight.position.z = -Math.cos(phaseAngle) * distance;
    sunLight.position.y = 0; // Keep on ecliptic plane

    // Point the light at the moon
    sunLight.target = moon;

    // Set light intensity (constant)
    sunLight.intensity = 1.0;

    // Set ambient light to a low value to slightly reveal the dark side
    ambientLight.intensity = 0.03;

    // Update moon info display
    updateMoonInfo(date, illumination);
}

// Function to update moon information display
function updateMoonInfo(date, illumination) {
    const moonInfo = document.getElementById('moonInfo');
    const phase = getMoonPhaseName(illumination.phase);
    const fraction = Math.round(illumination.fraction * 100);

    moonInfo.innerHTML = `
        <div class="info-card">
            <h2>Moon Phase: ${phase}</h2>
            <p>Illumination: ${fraction}%</p>
            <p>Date: ${date.toLocaleDateString()}</p>
            <p>Time: ${date.toLocaleTimeString()}</p>
        </div>
    `;
}

// Function to get moon phase name
function getMoonPhaseName(phase) {
    if (phase <= 0.0625 || phase > 0.9375) return 'New Moon';
    if (phase <= 0.1875) return 'Waxing Crescent';
    if (phase <= 0.3125) return 'First Quarter';
    if (phase <= 0.4375) return 'Waxing Gibbous';
    if (phase <= 0.5625) return 'Full Moon';
    if (phase <= 0.6875) return 'Waning Gibbous';
    if (phase <= 0.8125) return 'Last Quarter';
    return 'Waning Crescent';
}

// Set up date/time controls
const dateTimeControl = document.getElementById('dateTimeControl');
const resetButton = document.getElementById('resetButton');
const playButton = document.getElementById('playButton');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// Add animation state variables
let isPlaying = false;
let timeSpeed = 1; // Days per second

// Initialize datetime input with current time
const now = new Date();
dateTimeControl.value = now.toISOString().slice(0, 16);

// Event listener for datetime input
dateTimeControl.addEventListener('input', () => {
    const selectedDate = new Date(dateTimeControl.value);
    updateMoonPhase(selectedDate);
});

// Event listener for reset button
resetButton.addEventListener('click', () => {
    const currentDate = new Date();
    dateTimeControl.value = currentDate.toISOString().slice(0, 16);
    updateMoonPhase(currentDate);
});

// Event listener for play button
playButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
});

// Event listener for speed slider
speedSlider.addEventListener('input', () => {
    timeSpeed = parseFloat(speedSlider.value);
    speedValue.textContent = `${timeSpeed.toFixed(1)} day/sec`;
});

const clock = new THREE.Clock();

function animate() {
    const deltaTime = clock.getDelta();

    // Make stars twinkle
    if (stars.geometry.attributes.color) {
        const colors = stars.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
            // Only twinkle some stars each frame for a more natural effect
            if (Math.random() > 0.99) {
                const twinkleAmount = 0.8 + Math.random() * 0.4; // Random brightness
                colors[i] *= twinkleAmount;     // R
                colors[i+1] *= twinkleAmount;   // G
                colors[i+2] *= twinkleAmount;   // B
            }
        }
        stars.geometry.attributes.color.needsUpdate = true;
    }

    // Rotate stars very slowly for a subtle effect
    stars.rotation.y += deltaTime * 0.01;
    stars.rotation.x += deltaTime * 0.005;

    // Update time when playing
    if (isPlaying) {
        try {
            // Get current date from the input
            const dateStr = dateTimeControl.value;
            const currentDate = new Date(dateStr);

            // If we have an invalid date, reset to current time
            if (isNaN(currentDate.getTime())) {
                const resetDate = new Date();
                dateTimeControl.value = resetDate.toISOString().slice(0, 16);
                updateMoonPhase(resetDate);
                return;
            }

            // Calculate new time in milliseconds
            const newTimeMs = currentDate.getTime() + (deltaTime * timeSpeed * 24 * 60 * 60 * 1000);
            const newDate = new Date(newTimeMs);

            // Format the date for the input control - avoiding potential DST issues
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            const hours = String(newDate.getHours()).padStart(2, '0');
            const minutes = String(newDate.getMinutes()).padStart(2, '0');

            // Update the input with a properly formatted string that avoids DST quirks
            dateTimeControl.value = `${year}-${month}-${day}T${hours}:${minutes}`;

            // Update moon phase with the new date
            updateMoonPhase(newDate);

            // Add a little rotation for visual effect, faster when time speed is higher
            moon.rotation.y += deltaTime * Math.min(timeSpeed * 0.1, 0.5);
        } catch (error) {
            console.error("Error updating time:", error);
            isPlaying = false;
            playButton.textContent = 'Play';
        }
    } else {
        // Still rotate slowly when paused for visual effect
        moon.rotation.y += deltaTime * 0.05;
    }

    renderer.render(scene, camera);
}

// Initial update
updateMoonPhase();

renderer.setAnimationLoop(animate);

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
