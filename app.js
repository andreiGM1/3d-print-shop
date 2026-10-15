/**
 * LayerByLayer 3D Studio — Three.js STL WebGL Viewer & Geometric Slicer
 * Features:
 * 1. Three.js WebGL 3D Scene with 250x250mm Virtual Build Plate & OrbitControls
 * 2. Mathematical Net Volume & Surface Triangle Parser (Signed Tetrahedron Algorithm)
 * 3. Real-Time Weight (Grams), Print Time, and Cost Calculation
 * 4. Procedural Demo Models (Gear, Spiral Vase, Bracket, Calibration Cube)
 * 5. Drag & Drop / File Upload for User .STL Files
 * 6. Filament Color Customization & Wireframe Mesh Inspector
 */

let scene, camera, renderer, controls;
let currentMesh = null;
let buildGridHelper = null;
let currentMaterialColor = 0xf97316; // Brand orange
let isWireframeActive = false;
let currentStlStats = {
  name: 'Roata-Dintata-Industriala.stl',
  volumeCm3: 42.8,
  dimensions: { x: 60.0, y: 60.0, z: 25.0 },
  triangles: 8640
};

document.addEventListener('DOMContentLoaded', () => {
  initThreeJsViewer();
  setupViewerControls();
  initManualCalculator();
});

/* ==========================================================================
   1. Three.js WebGL Scene Initialization
   ========================================================================== */
function initThreeJsViewer() {
  const container = document.getElementById('threeViewportContainer');
  if (!container) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);

  // Camera
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 480;
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
  camera.position.set(160, 140, 180);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // OrbitControls
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip under the plate
    controls.minDistance = 30;
    controls.maxDistance = 600;
  }

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
  mainLight.position.set(120, 200, 100);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
  rimLight.position.set(-120, -50, -100);
  scene.add(rimLight);

  // 250 x 250 mm Virtual Print Bed
  createBuildPlate();

  // Load default demo model (Gear)
  loadDemoModel('gear');

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Window Resize handling
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  const container = document.getElementById('threeViewportContainer');
  if (!container || !renderer || !camera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function createBuildPlate() {
  // Grid 250mm x 250mm with 10mm increments
  buildGridHelper = new THREE.GridHelper(250, 25, 0xf97316, 0x334155);
  buildGridHelper.position.y = 0;
  scene.add(buildGridHelper);

  // Bed Floor Plate
  const plateGeo = new THREE.BoxGeometry(260, 2, 260);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.8,
    metalness: 0.2
  });
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  plateMesh.position.y = -1;
  plateMesh.receiveShadow = true;
  scene.add(plateMesh);
}

/* ==========================================================================
   2. Mathematical Volume & Geometry Calculation
   ========================================================================== */
/**
 * Calculates watertight mesh volume in mm³ using signed tetrahedron volume.
 */
function calculateMeshVolume(geometry) {
  let position = geometry.attributes.position;
  let index = geometry.index;
  let facesCount = index ? index.count / 3 : position.count / 3;
  let volume = 0;

  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  function getPoint(idx, target) {
    target.fromBufferAttribute(position, idx);
  }

  for (let i = 0; i < facesCount; i++) {
    const i1 = index ? index.getX(i * 3) : i * 3;
    const i2 = index ? index.getX(i * 3 + 1) : i * 3 + 1;
    const i3 = index ? index.getX(i * 3 + 2) : i * 3 + 2;

    getPoint(i1, p1);
    getPoint(i2, p2);
    getPoint(i3, p3);

    // Signed volume of tetrahedron formed with origin (0,0,0)
    const v321 = p3.x * p2.y * p1.z;
    const v231 = p2.x * p3.y * p1.z;
    const v312 = p3.x * p1.y * p2.z;
    const v132 = p1.x * p3.y * p2.z;
    const v213 = p2.x * p1.y * p3.z;
    const v123 = p1.x * p2.y * p3.z;

    volume += (1.0 / 6.0) * (-v321 + v231 + v312 - v132 - v213 + v123);
  }

  return Math.abs(volume); // in mm³
}

function updateGeometryStats(geometry, fileName) {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const volMm3 = calculateMeshVolume(geometry);
  const volCm3 = Math.max(0.5, parseFloat((volMm3 / 1000).toFixed(1)));
  const trianglesCount = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;

  currentStlStats = {
    name: fileName,
    volumeCm3: volCm3,
    dimensions: {
      x: parseFloat(size.x.toFixed(1)),
      y: parseFloat(size.y.toFixed(1)),
      z: parseFloat(size.z.toFixed(1))
    },
    triangles: Math.round(trianglesCount)
  };

  renderGeometryMetricsUI();
}

function renderGeometryMetricsUI() {
  document.getElementById('stlFileNameTitle').textContent = currentStlStats.name;
  document.getElementById('stlDimensionsVal').textContent = 
    `${currentStlStats.dimensions.x} × ${currentStlStats.dimensions.y} × ${currentStlStats.dimensions.z} mm`;
  document.getElementById('stlVolumeVal').textContent = `${currentStlStats.volumeCm3} cm³`;
  document.getElementById('stlTrianglesVal').textContent = `${currentStlStats.triangles.toLocaleString('ro-RO')} Triunghiuri`;

  calculateStlWeightAndPricing();
}

function calculateStlWeightAndPricing() {
  const matSelect = document.getElementById('stlMaterialSelect');
  const infillSelect = document.getElementById('stlInfillSelect');
  if (!matSelect || !infillSelect) return;

  const density = parseFloat(matSelect.options[matSelect.selectedIndex].getAttribute('data-density')) || 1.24;
  const ratePerGram = parseFloat(matSelect.options[matSelect.selectedIndex].getAttribute('data-rate')) || 1.0;
  const infill = parseFloat(infillSelect.value) || 0.3;

  // Weight formula: Volume(cm³) * Density(g/cm³) * InfillMultiplier
  // A minimum shell factor of 0.35 is always present even at low infill
  const effectiveInfill = 0.3 + (infill * 0.7);
  const calculatedGrams = Math.max(5, parseFloat((currentStlStats.volumeCm3 * density * effectiveInfill).toFixed(1)));

  // Machine preparation setup + filament cost
  const totalCost = Math.round((calculatedGrams * ratePerGram) + 20);

  // Print time estimation (~22g per hour)
  const totalMinutes = Math.round((calculatedGrams / 22) * 60) + 25;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  document.getElementById('stlWeightResult').textContent = `${calculatedGrams} g`;
  document.getElementById('stlTimeResult').textContent = `~${hours}h ${mins}m`;
  document.getElementById('stlCostResult').textContent = `${totalCost} RON`;
}

/* ==========================================================================
   3. Procedural Demo Models Generator
   ========================================================================== */
function loadDemoModel(type) {
  if (currentMesh) {
    scene.remove(currentMesh);
    if (currentMesh.geometry) currentMesh.geometry.dispose();
  }

  let geometry;
  let name = '';

  if (type === 'gear') {
    name = 'Roata-Dintata-JIS-60mm.stl';
    geometry = createGearGeometry();
  } else if (type === 'vase') {
    name = 'Vaza-Voronoi-Spirala-120mm.stl';
    geometry = createTwistedVaseGeometry();
  } else if (type === 'bracket') {
    name = 'Suport-L-Mecanic-Industrie.stl';
    geometry = createBracketGeometry();
  } else {
    name = 'Cub-Calibrare-XYZ-20mm.stl';
    geometry = createCalibrationCubeGeometry();
  }

  geometry.center();
  geometry.computeBoundingBox();
  const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

  const material = new THREE.MeshStandardMaterial({
    color: currentMaterialColor,
    roughness: 0.35,
    metalness: 0.25,
    wireframe: isWireframeActive
  });

  currentMesh = new THREE.Mesh(geometry, material);
  currentMesh.position.y = height / 2; // Sit exactly on the build plate
  currentMesh.castShadow = true;
  currentMesh.receiveShadow = true;
  scene.add(currentMesh);

  updateGeometryStats(geometry, name);
  resetCameraToMesh();
}

function createGearGeometry() {
  const shape = new THREE.Shape();
  const teeth = 14;
  const outerRadius = 30;
  const innerRadius = 24;

  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.35) / teeth) * Math.PI * 2;
    const a3 = ((i + 0.65) / teeth) * Math.PI * 2;
    const a4 = ((i + 1) / teeth) * Math.PI * 2;

    if (i === 0) shape.moveTo(Math.cos(a1) * innerRadius, Math.sin(a1) * innerRadius);
    else shape.lineTo(Math.cos(a1) * innerRadius, Math.sin(a1) * innerRadius);

    shape.lineTo(Math.cos(a2) * outerRadius, Math.sin(a2) * outerRadius);
    shape.lineTo(Math.cos(a3) * outerRadius, Math.sin(a3) * outerRadius);
    shape.lineTo(Math.cos(a4) * innerRadius, Math.sin(a4) * innerRadius);
  }

  // Central axle hole
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, 8, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings = { depth: 22, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 1.5, bevelThickness: 1.5 };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function createTwistedVaseGeometry() {
  const geom = new THREE.CylinderGeometry(20, 26, 75, 32, 20);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const angle = (y / 75) * 1.5;
    const newX = x * Math.cos(angle) - z * Math.sin(angle);
    const newZ = x * Math.sin(angle) + z * Math.cos(angle);
    pos.setX(i, newX);
    pos.setZ(i, newZ);
  }
  geom.computeVertexNormals();
  return geom;
}

function createBracketGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(50, 0);
  shape.lineTo(50, 12);
  shape.lineTo(12, 12);
  shape.lineTo(12, 50);
  shape.lineTo(0, 50);
  shape.closePath();

  const hole1 = new THREE.Path();
  hole1.absarc(6, 30, 3.5, 0, Math.PI * 2, true);
  shape.holes.push(hole1);

  const hole2 = new THREE.Path();
  hole2.absarc(30, 6, 3.5, 0, Math.PI * 2, true);
  shape.holes.push(hole2);

  const extrudeSettings = { depth: 30, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 1, bevelThickness: 1 };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function createCalibrationCubeGeometry() {
  return new THREE.BoxGeometry(20, 20, 20, 6, 6, 6);
}

function resetCameraToMesh() {
  if (!currentMesh || !camera) return;
  camera.position.set(130, 120, 150);
  if (controls) {
    controls.target.set(0, currentMesh.position.y, 0);
    controls.update();
  }
}

/* ==========================================================================
   4. User STL Upload & Parsing
   ========================================================================== */
function setupViewerControls() {
  // Demo model buttons
  document.querySelectorAll('.btn-demo-stl').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-demo-stl').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadDemoModel(btn.getAttribute('data-model'));
    });
  });

  // Upload button
  const fileInput = document.getElementById('stlFileInput');
  const btnTrigger = document.getElementById('btnTriggerUpload');
  if (btnTrigger && fileInput) {
    btnTrigger.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleUserFileUpload);
  }

  // Filament color picker dots
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const hex = dot.getAttribute('data-color');
      currentMaterialColor = parseInt(hex.replace('#', '0x'));
      if (currentMesh && currentMesh.material) {
        currentMesh.material.color.setHex(currentMaterialColor);
      }
    });
  });

  // Wireframe toggle
  const btnWire = document.getElementById('btnToggleWireframe');
  if (btnWire) {
    btnWire.addEventListener('click', () => {
      isWireframeActive = !isWireframeActive;
      btnWire.textContent = `Wireframe: ${isWireframeActive ? 'ON' : 'OFF'}`;
      if (currentMesh && currentMesh.material) {
        currentMesh.material.wireframe = isWireframeActive;
      }
    });
  }

  // Bed grid toggle
  const btnGrid = document.getElementById('btnTogglePlateGrid');
  if (btnGrid) {
    btnGrid.addEventListener('click', () => {
      if (buildGridHelper) {
        buildGridHelper.visible = !buildGridHelper.visible;
        btnGrid.textContent = `Platan 250mm: ${buildGridHelper.visible ? 'ON' : 'OFF'}`;
      }
    });
  }

  // Reset view
  const btnReset = document.getElementById('btnResetView');
  if (btnReset) {
    btnReset.addEventListener('click', resetCameraToMesh);
  }

  // Material & Infill select recalculation
  document.getElementById('stlMaterialSelect').addEventListener('change', calculateStlWeightAndPricing);
  document.getElementById('stlInfillSelect').addEventListener('change', calculateStlWeightAndPricing);

  // Sync with order form button
  const btnSyncOrder = document.getElementById('btnSyncWithOrder');
  if (btnSyncOrder) {
    btnSyncOrder.addEventListener('click', () => {
      const matSelect = document.getElementById('stlMaterialSelect');
      const materialName = matSelect.options[matSelect.selectedIndex].text.split('(')[0].trim();
      const weight = document.getElementById('stlWeightResult').textContent;
      const cost = document.getElementById('stlCostResult').textContent;
      const notes = document.getElementById('custNotes');

      if (notes) {
        notes.value = `Am configurat modelul "${currentStlStats.name}" în vizualizatorul 3D:\n` +
          `• Dimensiuni: ${currentStlStats.dimensions.x}x${currentStlStats.dimensions.y}x${currentStlStats.dimensions.z} mm\n` +
          `• Material: ${materialName}\n` +
          `• Greutate estimată: ${weight}\n` +
          `• Cotație generată: ${cost}`;
      }

      document.getElementById('comanda').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function handleUserFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const contents = event.target.result;
    
    // Check if STLLoader is available
    if (typeof THREE.STLLoader !== 'undefined') {
      const loader = new THREE.STLLoader();
      try {
        const geometry = loader.parse(contents);
        loadCustomGeometry(geometry, file.name);
      } catch (err) {
        console.error('Error parsing STL:', err);
        alert('Nu am putut parsa fișierul STL. Asigură-te că este un format binar sau ASCII valid.');
      }
    } else {
      alert('Modulul STLLoader este în curs de inițializare.');
    }
  };

  reader.readAsArrayBuffer(file);
}

function loadCustomGeometry(geometry, fileName) {
  if (currentMesh) {
    scene.remove(currentMesh);
    if (currentMesh.geometry) currentMesh.geometry.dispose();
  }

  geometry.center();
  geometry.computeBoundingBox();
  const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

  const material = new THREE.MeshStandardMaterial({
    color: currentMaterialColor,
    roughness: 0.35,
    metalness: 0.25,
    wireframe: isWireframeActive
  });

  currentMesh = new THREE.Mesh(geometry, material);
  currentMesh.position.y = height / 2;
  currentMesh.castShadow = true;
  currentMesh.receiveShadow = true;
  scene.add(currentMesh);

  // De-activate demo buttons
  document.querySelectorAll('.btn-demo-stl').forEach(b => b.classList.remove('active'));

  updateGeometryStats(geometry, fileName);
  resetCameraToMesh();
}

/* ==========================================================================
   5. Manual Cost Calculator & WhatsApp Submission
   ========================================================================== */
function initManualCalculator() {
  const materialSelect = document.getElementById('materialSelect');
  const weightInput = document.getElementById('weightInput');
  const weightValLabel = document.getElementById('weightValLabel');
  const infillSelect = document.getElementById('infillSelect');
  const quantityInput = document.getElementById('quantityInput');

  const timeEstLabel = document.getElementById('timeEstLabel');
  const totalPriceLabel = document.getElementById('totalPriceLabel');
  const orderForm = document.getElementById('orderForm');

  function calculatePrint() {
    const selectedOption = materialSelect.options[materialSelect.selectedIndex];
    const pricePerGram = parseFloat(selectedOption.dataset.price);
    const grams = parseInt(weightInput.value, 10);
    const infillMultiplier = parseFloat(infillSelect.value);
    const qty = parseInt(quantityInput.value, 10) || 1;

    weightValLabel.textContent = `${grams}g`;

    const singleCost = Math.round((grams * pricePerGram * infillMultiplier) + 15);
    const totalCost = singleCost * qty;

    const totalHours = Math.max(1, Math.round((grams * infillMultiplier) / 22));
    timeEstLabel.textContent = `~${totalHours}h ${Math.round((grams % 22) * 2.5)}m per piesă`;
    totalPriceLabel.textContent = `${totalCost} RON`;
  }

  materialSelect.addEventListener('change', calculatePrint);
  weightInput.addEventListener('input', calculatePrint);
  infillSelect.addEventListener('change', calculatePrint);
  quantityInput.addEventListener('input', calculatePrint);

  calculatePrint();

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const notes = document.getElementById('custNotes').value.trim();
    const material = materialSelect.options[materialSelect.selectedIndex].text.split('(')[0].trim();
    const grams = weightInput.value;
    const total = totalPriceLabel.textContent;

    const message = `Salut, LayerByLayer! Doresc o cotație pentru printare 3D:\n` +
      `🧵 Material: ${material}\n` +
      `⚖️ Greutate estimată: ${grams}g\n` +
      `💰 Estimare simulator: ${total}\n` +
      `📝 Detalii: ${notes || 'Am fișierul pregătit'}\n` +
      `👤 Nume: ${name}\n` +
      `📱 Contact: ${phone}`;

    alert(`Solicitarea ta este gata! Se deschide WhatsApp pentru a trimite detaliile.`);
    window.open(`https://wa.me/40700000000?text=${encodeURIComponent(message)}`, '_blank');
  });
}
