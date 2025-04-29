import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // black

const loader = new GLTFLoader();
let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
//renderer.shadows = true;
renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.toneMapping = THREE.ReinhardToneMapping;
//renderer.toneMappingExposure = 1.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
document.body.appendChild(renderer.domElement);


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

loader.load('models/AetherOneGo.glb', function (gltf) {
    console.log(gltf);

    console.log("Loaded gltf:", gltf);
    if (!gltf.scene) {
        console.error("No scene found in glTF file.");
        return;
    }

    // Add everything from the glTF scene
    scene.add(gltf.scene);

    // Replace camera if one exists in glTF
    if (gltf.cameras && gltf.cameras[0]) {
        camera = gltf.cameras[0];
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }


    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            console.log(node);
            if (node.material && node.material.isMeshBasicMaterial) {
                // Replace it with a shadow-supporting material
                node.material = new THREE.MeshStandardMaterial({ color: node.material.color });
            }
            node.castShadow = true; // Enable shadow casting
            node.receiveShadow = true; // Enable shadow receiving
        }
    });

    gltf.scene.traverse((node) => {
        if (node.isLight) {
            console.log(node);
            node.intensity = node.intensity / 1000; // Adjust intensity if needed
            node.castShadow = true; // Enable shadow casting for lights

            // FIX SHADOW ARTIFACTS
            if (node.shadow) {
                node.shadow.bias = -0.0001; // Helps with acne
                node.shadow.normalBias = 0.01; // Helps with peter-panning
                // Optional: improve shadow resolution
                node.shadow.mapSize.width = 2048;
                node.shadow.mapSize.height = 2048;
            }

            //const helper = new THREE.CameraHelper(node.shadow.camera);
            //scene.add(helper);

            scene.add(node); // Lights are usually already in gltf.scene, but just in case
        }
    });


    // Optional: fallback light if no lights present
    const hasLights = gltf.scene.children.some(obj => obj.isLight);
    if (!hasLights) {
        console.log("Adding fallback light");
        const fallbackLight = new THREE.DirectionalLight(0xffffff, 1);
        fallbackLight.position.set(5, 10, 7.5);
        scene.add(fallbackLight);
    } else {
        console.log("Using lights from glTF");
    }


}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
    console.error('An error happened', error);
});
