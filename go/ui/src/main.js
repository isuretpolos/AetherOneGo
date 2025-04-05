import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();

let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

loader.load('models/test.glb', function (gltf) {
    console.log(gltf);

    // Replace camera if one exists in glTF
    if (gltf.cameras && gltf.cameras[0]) {
        camera = gltf.cameras[0];
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    // Add everything from the glTF scene
    scene.add(gltf.scene);

    // Add lights from glTF (if any) manually
    gltf.scene.traverse((node) => {
        if (node.isLight) {
            console.log(node);
            node.intensity = node.intensity / 1000; // Adjust intensity if needed
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
});
