
const canvas = document.getElementById("networkGraph");
const ctx = canvas.getContext("2d");
const infoBox = document.getElementById("info-box");
const fullScreenBtn = document.getElementById("full-screen-btn");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const resetBtn = document.getElementById("reset-btn");
const pauseMoveBtn = document.getElementById("pause-move-btn");

const CONFIG = {
  NODES: 30,
  EDGE_THICKNESS_RANGE: [0.5, 3],
  ZOOM_SENSITIVITY: 0.2,
  MAX_ZOOM: 10000,
  MIN_ZOOM: 0.00001,
};

let defultCameraSettings = {
  x: 1103269.7699274558,
  y: 515086.24360419495,
  zoom: 0.02102740350847559,
  initialX: 0,
  initialY: 0,
};

let camera = Object.assign({}, defultCameraSettings); // clone the defult settigs

const nodes = [];
const edges = [];
let isMoving = true; // Nodes start moving by default

// Define the count of the nodes
const nodeCount = CONFIG.NODES;

// Generate nodes
function generateNodes() {
  const virtualWidth = window.innerWidth * 1600;
  const virtualHeight = window.innerHeight * 1600;

  // Color palettes for more interesting color generation
  const colorPalettes = [
    // Vibrant palette
    [
      { r: 255, g: 99, b: 72 }, // Coral Red
      { r: 64, g: 194, b: 230 }, // Sky Blue
      { r: 255, g: 166, b: 43 }, // Bright Orange
      { r: 95, g: 39, b: 205 }, // Deep Purple
      { r: 50, g: 200, b: 120 }, // Emerald Green
    ],
    // Pastel palette
    [
      { r: 255, g: 179, b: 186 }, // Soft Pink
      { r: 255, g: 223, b: 186 }, // Peach
      { r: 255, g: 255, b: 186 }, // Pale Yellow
      { r: 186, g: 255, b: 201 }, // Mint Green
      { r: 186, g: 225, b: 255 }, // Soft Blue
    ],
    // Earth tones
    [
      { r: 138, g: 97, b: 57 }, // Brown
      { r: 75, g: 83, b: 32 }, // Olive Green
      { r: 202, g: 164, b: 114 }, // Tan
      { r: 100, g: 149, b: 237 }, // Cornflower Blue
      { r: 188, g: 143, b: 143 }, // Rosy Brown
    ],
  ];
  function loadNodesFrom(list, count) {
    for (let i = 0; i < count; i++) {
      let key = list[i];
      let ID, name;
      // loadNodesFrom(objData.connections[name]);
      if (key.match(/\d/)) {
        ID = key;
        name = objData.orcid_to_name[ID];
      } else {
        name = key;
        ID = objData.name_to_orcid[name];
      }

      // Randomly select a palette
      const palette =
        colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      const selectedColor = palette[Math.floor(Math.random() * palette.length)];

      const nodeSize = Math.min(
        Object.values(objData.coauthors)[i].length / 2 + 30,
        120
      );

      nodes.push({
        id: i,
        x: Math.random() * virtualWidth,
        y: Math.random() * virtualHeight,
        vx: (Math.random() - 0.5) * 16 * 8,
        vy: (Math.random() - 0.5) * 16 * 8,
        size: nodeSize,
        label: `${name}`,
        color: `rgba(${selectedColor.r}, ${selectedColor.g}, ${
          selectedColor.b
        }, ${Math.random() * 0.5 + 0.5})`,
        info: `${name}

  Orcid: ${ID ? ID.replace(/-/g, " - ") : "(Coauthor)"}
  Number of articles: ${
    ID ? objData.orcid[ID].length : objData.coauthors[name].length
  }
  Articles Ranking: ${
    ID
      ? Object.keys(objData.orcid).indexOf(ID)
      : "(Coauthor don't write article)"
  }
  Collaborations Ranking: ${i + 1}
  Properties:
      - Size: ${nodeSize.toFixed(2)}
      - Position: (${(Math.random() * virtualWidth).toFixed(2)}, ${(
          Math.random() * virtualHeight
        ).toFixed(2)})`,
      });
    }
  }
  loadNodesFrom(Object.keys(objData.coauthors), nodeCount);
}

// Generate edges
function generateEdges() {
  nodes.forEach((node, i) => {
    const connections = Math.floor(Math.random() * 4) + 3;
    const connectedIndices = new Set();

    while (connectedIndices.size < connections) {
      const targetIndex = Math.floor(Math.random() * CONFIG.NODES);
      if (targetIndex !== i && !connectedIndices.has(targetIndex)) {
        connectedIndices.add(targetIndex);
        edges.push({
          source: i,
          target: targetIndex,
          thickness:
            Math.random() *
              (CONFIG.EDGE_THICKNESS_RANGE[1] -
                CONFIG.EDGE_THICKNESS_RANGE[0]) +
            CONFIG.EDGE_THICKNESS_RANGE[0],
          weight: Math.random(),
        });
      }
    }
  });
}

let selectedNode = null; // Variable to store the currently selected node
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // Helper function to check if a node is connected to the selected node
  const isNodeConnected = (nodeId) => {
    if (!selectedNode) return false;
    return edges.some(
      (edge) =>
        (edge.source === selectedNode.id && edge.target === nodeId) ||
        (edge.target === selectedNode.id && edge.source === nodeId)
    );
  };

  // Draw edges
  edges.forEach((edge) => {
    const source = nodes[edge.source];
    const target = nodes[edge.target];

    const isConnectedToSelected =
      selectedNode &&
      (edge.source === selectedNode.id || edge.target === selectedNode.id);

    ctx.beginPath();
    ctx.lineWidth = edge.thickness / camera.zoom;
    ctx.strokeStyle = isConnectedToSelected
      ? "red"
      : "rgba(100, 100, 100, 0.5)";
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  });

  // Draw nodes with advanced styling
  nodes.forEach((node) => {
    const nodeRadius = node.size / camera.zoom;

    // Create radial gradient for nodes
    const gradient = ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      nodeRadius
    );

    let colorCoordinates;
    // Store original color if not already stored
    if (!node.originalColor) {
      node.originalColor = node.color;
    }

    if (node === selectedNode) {
      // Selected node styling
      gradient.addColorStop(1, "white");
      colorCoordinates = "rgb(132, 0, 0, ";
    } else if (isNodeConnected(node.id)) {
      // Connected node styling
      colorCoordinates = "rgba(0, 0, 0, ";
    } else {
      // Normal node styling - use the node's original color
      const baseColor = node.originalColor;
      const colorMatch = baseColor.match(/\d+/g);
      if (colorMatch) {
        const [r, g, b] = colorMatch;
        colorCoordinates = `rgba(${r}, ${g}, ${b}, `;
      } else {
        // Fallback color if parsing fails
        colorCoordinates = "rgba(100, 100, 100, ";
      }
    }

    // Create a more dynamic gradient
    gradient.addColorStop(0, colorCoordinates + "0.9)");
    gradient.addColorStop(0.5, colorCoordinates + "0.7)");
    gradient.addColorStop(1, colorCoordinates + "0.4)");

    // Outer glow effect
    ctx.shadowBlur = nodeRadius * 0.5;
    ctx.shadowColor = colorCoordinates + "0.5)";

    // Draw node circle with gradient
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Add a subtle inner highlight
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    ctx.lineWidth = nodeRadius * 0.1;
    ctx.stroke();

    // Draw node label with enhanced typography
    ctx.fillStyle = "white";
    ctx.font = `bold ${
      (nodeRadius / node.label.length) * 4
    }px 'Arial', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y);
  });

  ctx.restore();
  updateNodes();
  requestAnimationFrame(render);
}

// Update node positions
function updateNodes() {
  const virtualWidth = window.innerWidth * 1600;
  const virtualHeight = window.innerHeight * 1600;

  if (isMoving) {
    // Only update positions if isMoving is true
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > virtualWidth) node.vx *= -1;
      if (node.y < 0 || node.y > virtualHeight) node.vy *= -1;
    });
  }
}

// Event handlers
function setupEventHandlers() {
  let isDragging = false;
  let lastMouseX, lastMouseY;
  let justClicked = false;

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    justClicked = true;
    canvas.style.cursor = "grabbing";
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = (e.clientX - lastMouseX) / camera.zoom;
      const deltaY = (e.clientY - lastMouseY) / camera.zoom;
      camera.x -= deltaX;
      camera.y -= deltaY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      justClicked = false;
      infoBox.style.display = "none";
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    isDragging = false;
    canvas.style.cursor = "grab";

    // Only trigger node selection on a clean click (no dragging)
    if (justClicked) {
      const scaledMouseX =
        (e.clientX - canvas.width / 2) / camera.zoom + camera.x;
      const scaledMouseY =
        (e.clientY - canvas.height / 2) / camera.zoom + camera.y;

      const clickedNode = nodes.find((node) => {
        const dx = scaledMouseX - node.x;
        const dy = scaledMouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < node.size / camera.zoom;
      });
      if (clickedNode) {
        selectedNode = clickedNode; // Store the clicked node
        infoBox.style.left = `${e.clientX + 10}px`;
        infoBox.style.top = `${e.clientY + 10}px`;
        infoBox.style.display = "block";
        infoBox.innerText = clickedNode.info;
        clickedNode.color = "";
      } else {
        selectedNode = null; // Deselect if no node is clicked
        infoBox.style.display = "none";
      }
    }
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    if (Math.sign(e.deltaY) - 1)
      camera.zoom = Math.min(
        CONFIG.MAX_ZOOM,
        camera.zoom * (1 + CONFIG.ZOOM_SENSITIVITY)
      );
    else
      camera.zoom = Math.max(
        CONFIG.MIN_ZOOM,
        camera.zoom * (1 - CONFIG.ZOOM_SENSITIVITY)
      );
  });

  // Fullscreen toggle
  fullScreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullScreenBtn.innerHTML =
        '<i class="fas fa-compress icon"></i>Exit Fullscreen';
    } else {
      document.exitFullscreen();
      fullScreenBtn.innerHTML = '<i class="fas fa-expand icon"></i>Fullscreen';
    }
  });

  // Zoom buttons
  zoomInBtn.addEventListener("click", () => {
    camera.zoom = Math.min(
      CONFIG.MAX_ZOOM,
      camera.zoom * (1 + CONFIG.ZOOM_SENSITIVITY)
    );
  });

  zoomOutBtn.addEventListener("click", () => {
    camera.zoom = Math.max(
      CONFIG.MIN_ZOOM,
      camera.zoom * (1 - CONFIG.ZOOM_SENSITIVITY)
    );
  });

  // Reset view
  resetBtn.addEventListener("click", () => {
    camera = Object.assign({}, defultCameraSettings); // clone the defult settigs
  });

  // Pause/Resume movement button
  pauseMoveBtn.addEventListener("click", () => {
    isMoving = !isMoving; // Toggle movement state
    if (isMoving) {
      pauseMoveBtn.innerHTML =
        '<i class="fas fa-pause icon"></i>Pause Movement'; // Change to "Pause"
    } else {
      pauseMoveBtn.innerHTML =
        '<i class="fas fa-play icon"></i>Resume Movement'; // Change to "Resume"
    }
  });
}

// Initialize the canvas and start the animation
function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  generateNodes();
  generateEdges();
  setupEventHandlers();
  render();
}


init();
