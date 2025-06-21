// --- Elemen UI ---
const loadingScreen = document.getElementById('loading-screen');
const loadingTitle = document.getElementById('loadingTitle');
const progressBar = document.getElementById('progress-bar');
const viewerTitle = document.getElementById('viewerTitle');

// --- Inisialisasi Scene, Kamera, Renderer ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Aktifkan bayangan
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- Pencahayaan ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// --- Kontrol Navigasi (First-Person) ---
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

// --- Logika Pergerakan ---
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = function (event) {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyD': moveRight = true; break;
    }
};

const onKeyUp = function (event) {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- Mengunci Pointer Saat Klik ---
loadingScreen.addEventListener('click', function () {
    controls.lock();
});

controls.addEventListener('lock', function () {
    loadingScreen.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    loadingScreen.style.display = 'flex';
});

// --- Memuat Model 3D ---
const loader = new GLTFLoader();

const modelFileName = 'anisa.glb';
const modelTitle = 'Desain Anisa';

loadingTitle.textContent = `Memuat ${modelTitle}...`;
viewerTitle.textContent = modelTitle;

loader.load(
    `models/${modelFileName}`,
    function (gltf) {
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
        camera.position.set(0, 1.7, 5);
        progressBar.style.display = 'none';
    },
    function (xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            progressBar.value = percentComplete;
        }
    },
    function (error) {
        console.error('Terjadi kesalahan saat memuat model:', error);
        loadingScreen.innerHTML = '<h3>Gagal memuat model.</h3><p>Pastikan nama file dan path model sudah benar.</p>';
        progressBar.style.display = 'none';
    }
);

// --- Loop Animasi ---
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked === true) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }

    renderer.render(scene, camera);
    prevTime = time;
}

animate();

// --- Penyesuaian Ukuran Renderer Saat Jendela Berubah ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});