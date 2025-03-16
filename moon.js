import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SunCalc from './vendor/suncalc.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Setup the controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

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

const clock = new THREE.Clock();

function animate() {
    const deltaTime = clock.getDelta();
    controls.update();
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
