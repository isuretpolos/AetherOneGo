import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// === Setup Scene, Camera, Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Interaction State ===
const knobs = [];
let selectedKnob = null;
let isDragging = false;
let lastMouseX = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === Interaction Events ===
window.addEventListener('mousemove', (event) => {
    if (isDragging && selectedKnob) {
        const deltaX = event.clientX - lastMouseX;
        selectedKnob.rotation.y += deltaX * 0.01;
        lastMouseX = event.clientX;
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(knobs, true);
    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.name.startsWith('Knob')) {
            obj = obj.parent;
        }
        selectedKnob = obj;
    } else {
        selectedKnob = null;
    }
});

window.addEventListener('mousedown', (event) => {
    if (selectedKnob) {
        isDragging = true;
        lastMouseX = event.clientX;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('wheel', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(knobs, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.name.startsWith('Knob')) {
            obj = obj.parent;
        }
        if (obj) {
            obj.rotation.y += event.deltaY * 0.001;
        }
    }
});


// === Load GLTF Scene ===
const loader = new GLTFLoader();
loader.load(
    'models/AetherOneGo.glb',
    (gltf) => {
        if (!gltf.scene) {
            console.error("No scene found in glTF file.");
            return;
        }

        scene.add(gltf.scene);
        console.log("Loaded gltf:", gltf);

        // Replace camera if present
        if (gltf.cameras && gltf.cameras[0]) {
            camera = gltf.cameras[0];
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        // Meshes and knobs
        gltf.scene.traverse((node) => {

            if (node.name.startsWith('Knob')) {
                knobs.push(node);
            }


            if (node.isMesh) {

                // Replace material if needed for shadows
                if (node.material && node.material.isMeshBasicMaterial) {
                    node.material = new THREE.MeshStandardMaterial({ color: node.material.color });
                }

                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // Lights
        gltf.scene.traverse((node) => {
            if (node.isLight) {
                node.intensity /= 1000;
                node.castShadow = true;

                if (node.shadow) {
                    node.shadow.bias = -0.0001;
                    node.shadow.normalBias = 0.01;
                    node.shadow.mapSize.width = 2048;
                    node.shadow.mapSize.height = 2048;
                }

                scene.add(node); // Just in case not auto-added
            }
        });

        // Fallback light if none present
        const hasLights = gltf.scene.children.some(obj => obj.isLight);
        if (!hasLights) {
            console.log("Adding fallback light");
            const fallbackLight = new THREE.DirectionalLight(0xffffff, 1);
            fallbackLight.position.set(5, 10, 7.5);
            scene.add(fallbackLight);
        } else {
            console.log("Using lights from glTF");
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened', error);
    }
);

// === Animation Loop ===
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
