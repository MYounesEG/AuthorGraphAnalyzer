function print(String) {
  console.log(String);
}

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

const operationsButton = document.getElementById("operations-button");
const modalOverlay = document.getElementById("modal-overlay");
const operationSelection = document.getElementById("operation-selection");
const inputSection = document.getElementById("input-section");
const resultDisplay = document.getElementById("result-display");

operationsButton.addEventListener("click", () => {
  modalOverlay.style.display = "flex";
  resetModal();
});

function closeModal() {
  modalOverlay.style.display = "none";
}

function resetModal() {
  operationSelection.style.display = "block";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
  resultDisplay.style.display = "none";
}

function showOperationInput(operationNumber) {
  operationSelection.style.display = "none";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
  document.getElementById(`input${operationNumber}`).style.display = "flex";
}

function calculateWeight(authors1, authors2) {
  console.log(`\nCalculating weight between ${authors1} and ${authors2}`);
  let weight = 0;

  const isDirectConnection =
    objData.coauthors[authors1]?.includes(authors2) &&
    objData.coauthors[authors2]?.includes(authors1);

  if (isDirectConnection) {
    weight++;
    console.log(`Direct connection found! Weight: ${weight}`);
  } else {
    console.log("No direct connection found");
  }

  return weight;
}

function dijkstra(firstNode, lastNode) {
  console.log(`\n=== Starting Dijkstra's Algorithm ===`);
  console.log(`Start node: ${firstNode}`);
  console.log(`End node: ${lastNode}`);

  const distances = {};
  const previous = {};
  const visited = new Set();
  const priorityQueue = [];
  let result = "";

  const authors = new Set(Object.keys(objData.coauthors));
  console.log(`Total number of authors: ${authors.size}`);

  for (const author of authors) {
    distances[author] = Infinity;
    previous[author] = null;
  }
  distances[firstNode] = 0;

  priorityQueue.push({ node: firstNode, distance: 0 });

  while (priorityQueue.length > 0) {
    console.log(`\n--- New Iteration ---`);
    console.log(`Priority Queue before sorting:`, priorityQueue);

    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { node: currentNode } = priorityQueue.shift();

    console.log(`Current node: ${currentNode}`);
    console.log(`Current distance: ${distances[currentNode]}`);

    if (currentNode === lastNode) {
      const path = constructPath(previous, lastNode);
      console.log(`\n✅ Target node reached! Path found:`, path);
      result += `Shortest path found: ${path.join(" -> ")}\n`;
      return { path, result };
    }

    if (visited.has(currentNode)) {
      console.log(`Node ${currentNode} already visited, skipping`);
      continue;
    }

    visited.add(currentNode);
    console.log(`Marked ${currentNode} as visited`);

    const neighbors = new Set();
    const currentNodeOrcid = objData.name_to_orcid[currentNode];
    console.log(`Current node ORCID: ${currentNodeOrcid}`);

    for (const [author, connections] of Object.entries(objData.connections)) {
      if (
        connections.includes(currentNode) ||
        connections.includes(currentNodeOrcid)
      ) {
        neighbors.add(author);
        console.log(`Added ${author} as neighbor (connection found)`);
      }

      if (author === currentNode) {
        connections.forEach((connection) => {
          const neighborName =
            Object.entries(objData.name_to_orcid).find(
              ([name, orcid]) => orcid === connection
            )?.[0] || connection;
          neighbors.add(neighborName);
          console.log(`Added ${neighborName} as neighbor (direct connection)`);
        });
      }
    }

    console.log(`Total neighbors found: ${neighbors.size}`);

    for (const neighborNode of neighbors) {
      if (!visited.has(neighborNode)) {
        console.log(`\nProcessing neighbor: ${neighborNode}`);

        const weight = calculateWeight(currentNode, neighborNode);
        const newDistance = distances[currentNode] + weight;

        console.log(
          `Current distance to ${neighborNode}: ${distances[neighborNode]}`
        );
        console.log(`New potential distance: ${newDistance}`);

        if (newDistance < distances[neighborNode]) {
          console.log(`Found better path to ${neighborNode}`);
          distances[neighborNode] = newDistance;
          previous[neighborNode] = currentNode;
          priorityQueue.push({
            node: neighborNode,
            distance: newDistance,
          });
          result += `Neighbor: ${neighborNode}, new distance: ${newDistance}\n`;
        } else {
          console.log(`Keeping existing path to ${neighborNode}`);
        }
      } else {
        console.log(`${neighborNode} already visited, skipping`);
      }
    }
  }

  console.log("\n❌ No path found");
  return { path: [], result: "No path found." };
}

function constructPath(previous, lastNode) {
  console.log("\nConstructing final path...");
  const path = [];
  let currentNode = lastNode;

  while (currentNode !== null) {
    console.log(`Adding node to path: ${currentNode}`);
    path.unshift(currentNode);
    currentNode = previous[currentNode];
  }

  console.log("Final path:", path);
  return path;
}

function getCoauthorArticleCountsById(id) {
  if (!objData.connections[id]) {
    print(`ID ${id} not found.`);
    return [];
  }

  const coauthors = objData.connections[id];
  const coauthorArticleCounts = {};

  coauthors.forEach((coauthorId) => {
    const coauthorName =
      Object.entries(objData.name_to_orcid).find(
        ([name, orcid]) => orcid === coauthorId
      )?.[0] || coauthorId;

    let articleCount = 0;
    if (objData.coauthors[coauthorName]) {
      articleCount = objData.coauthors[coauthorName].length;
    } else {
      const possibleNames = [
        coauthorName,
        coauthorName.toLowerCase(),
        coauthorName.toUpperCase(),
        coauthorName
          .split(" ")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join(" "),
      ];

      for (const nameFmt of possibleNames) {
        if (objData.coauthors[nameFmt]) {
          articleCount = objData.coauthors[nameFmt].length;
          break;
        }
      }
    }

    coauthorArticleCounts[coauthorName] = articleCount;
  });

  const result = Object.entries(coauthorArticleCounts)
    .map(([name, count]) => ({
      name,
      articleCount: count || 0,
    }))
    .filter((entry) => entry.name && entry.name.trim() !== "")
    .sort((a, b) => b.articleCount - a.articleCount);

  class Queue {
    constructor() {
      this.items = [];
    }

    enqueue(item) {
      this.items.push(item);
    }

    dequeue() {
      return this.items.shift();
    }

    isEmpty() {
      return this.items.length === 0;
    }

    peek() {
      return this.items[0];
    }

    size() {
      return this.items.length;
    }
  }

  const queue = new Queue();

  result.forEach((entry) => queue.enqueue(entry));

  if (queue) return queue;
  return `No collaboration data found for Author ${id}`;
}

function findLongestPath(startAuthorId) {
  let longestPath = [];
  let maxLength = 0;
  const visited = new Set();
  const maxDepth = 10;
  const pathVisited = new Set();
  const deadEnds = new Set();

  print("1 - Starting findLongestPath function");

  function calculateWeight(author1, author2) {
    print(`Calculating weight between ${author1} and ${author2}`);
    let weight = 0;
    if (
      objData.connections[author1]?.includes(author2) ||
      objData.connections[author2]?.includes(author1)
    ) {
      weight = 1;
    }

    if (
      objData.coauthors[author1]?.includes(author2) ||
      objData.coauthors[author2]?.includes(author1)
    ) {
      weight += 0.5;
    }

    print(`Weight calculated: ${weight}`);
    return weight;
  }

  function getNeighbors(author) {
    print(`2 - Getting neighbors for author: ${author}`);
    const neighbors = new Set();

    // Only process if the author isn't a known dead end
    if (deadEnds.has(author)) {
      print(`Author ${author} is a known dead end, skipping`);
      return [];
    }

    if (objData.connections[author]) {
      print(`Found ${objData.connections[author].length} connections`);
      objData.connections[author].forEach((coauthor) => {
        const coauthorName =
          Object.entries(objData.name_to_orcid).find(
            ([name, orcid]) => orcid === coauthor
          )?.[0] || coauthor;
        neighbors.add(coauthorName);
      });
    }

    if (objData.coauthors[author]) {
      print(`Found ${objData.coauthors[author].length} coauthors`);
      objData.coauthors[author].forEach((coauthor) => {
        neighbors.add(coauthor);
      });
    }

    const result = Array.from(neighbors).filter((neighbor) => {
      // Filter out neighbors that are dead ends or have no weight connection
      return !deadEnds.has(neighbor) && calculateWeight(author, neighbor) > 0;
    });

    print(`Total valid neighbors found: ${result.length}`);
    return result;
  }

  function explorePath(currentAuthor, currentPath, currentLength, depth = 0) {
    print(`3 - Exploring path for ${currentAuthor} at depth ${depth}`);
    print(`Current path: ${currentPath.join(" -> ")}`);
    print(`Current length: ${currentLength}`);

    if (depth >= maxDepth) {
      print(`Maximum depth ${maxDepth} reached, returning`);
      return;
    }

    if (pathVisited.has(currentAuthor)) {
      print(`Cycle detected at ${currentAuthor}, returning`);
      return;
    }

    // Add to visited sets
    visited.add(currentAuthor);
    pathVisited.add(currentAuthor);
    currentPath.push(currentAuthor);

    print(
      `Added ${currentAuthor} to path. Path is now: ${currentPath.join(" -> ")}`
    );

    // Update longest path if current path is longer
    if (currentLength > maxLength) {
      print(`New longest path found! Length: ${currentLength}`);
      maxLength = currentLength;
      longestPath = [...currentPath];
      print(`New longest path: ${longestPath.join(" -> ")}`);
    }

    // Get and filter neighbors
    const neighbors = getNeighbors(currentAuthor).filter(
      (neighbor) => !pathVisited.has(neighbor)
    );

    print(`4 - Found ${neighbors.length} valid neighbors to explore`);

    // If no valid neighbors, mark as dead end
    if (neighbors.length === 0) {
      print(`Marking ${currentAuthor} as dead end`);
      deadEnds.add(currentAuthor);
    }

    // Explore each valid neighbor
    for (const neighbor of neighbors) {
      print(`5 - Exploring neighbor: ${neighbor}`);
      const weight = calculateWeight(currentAuthor, neighbor);
      if (weight > 0) {
        // Only explore if there's a real connection
        explorePath(neighbor, currentPath, currentLength + weight, depth + 1);
      }
    }

    // Backtrack: remove from path tracking
    print(`6 - Backtracking: removing ${currentAuthor} from path`);
    currentPath.pop();
    pathVisited.delete(currentAuthor);
    print(`Path after backtrack: ${currentPath.join(" -> ")}`);
  }

  try {
    print("7 - Starting path exploration");
    const initialPath = [];
    explorePath(startAuthorId, initialPath, 0);
    print("8 - Path exploration completed");
    print(`Final longest path found: ${longestPath.join(" -> ")}`);
    print(`Final length: ${maxLength}`);
    return formatResult(longestPath, maxLength);
  } catch (error) {
    print("ERROR in findLongestPath:", error);
    console.error("Error in findLongestPath:", error);
    throw error;
  }
}

function formatResult(path, length) {
  print("9 - Formatting result");
  const formattedPath = path
    .map((author) => {
      const orcidInfo = objData.orcid[author];
      const authorName =
        orcidInfo && orcidInfo[0]?.author_name
          ? orcidInfo[0].author_name
          : author;

      if (author.orcid) {
        return `${author.author_name} (${author.orcid})`;
      }

      return `${authorName} (${author})`;
    })
    .join(" -> ");
  print("10 - Result formatted");
  return `Path length: ${length}\nPath: ${formattedPath}`;
}

function executeOperation(operationNumber) {
  let result = "";

  switch (operationNumber) {
    case 1:
      const authorA = document.getElementById("authorA").value;
      const authorB = document.getElementById("authorB").value;

      nameA = objData.orcid_to_name[authorA];
      nameB = objData.orcid_to_name[authorB];
      if (nameA != nameB) {
        const pathResult = dijkstra(nameA, nameB);

        if (pathResult.path.length > 0) {
          result = `Shortest path: ${pathResult.path.join(
            " -> "
          )} between Author ${
            objData.orcid[authorA][0].author_name
          } (${authorA}) and Author ${
            objData.orcid[authorB][0].author_name
          } (${authorB})`;
        } else {
          result = `No path found between Author ${
            objData.orcid[authorA][0]?.author_name || "Unknown"
          } (${authorA}) and Author ${
            objData.orcid[authorB][0]?.author_name || "Unknown"
          } (${authorB})`;
        }
      } else
        result = `The IDs is for the same author, Please enter IDs for different authors`;
      break;

    case 2:
      const authorQueue = document.getElementById("authorQueue").value;

      queue = getCoauthorArticleCountsById(authorQueue);

      for (let i = 0; i < queue.size(); i++)
        result += i + 1 + "." + queue.items[i].name + "<p><p>";

      const Troot = authorQueue;
      const Tparents = objData.connections[Troot];

      // Initialize children as an empty array
      let Tchildren = [];
      let TparentChildMap = new Map();

      // Ensure that objData.connections[root] returns the correct data structure
      Object.keys(Tparents).forEach(function (parent) {
        const TparentChildren = objData.connections[parent];

        // Check if parentChildren is an object (list of dicts)
        if (typeof TparentChildren === "object" && TparentChildren !== null) {
          // Extract author names (keys of the object) for the parentChildren
          const extractedChildren = Object.keys(TparentChildren); // Extract keys (author names/IDs)
          Tchildren.push(extractedChildren);
          TparentChildMap.set(parent, extractedChildren);
        } else {
          // Handle other cases if necessary
          console.warn(
            `Unexpected structure for parentChildren of ${parent}:`,
            TparentChildren
          );
          TparentChildMap.set(parent, [TparentChildren]); // If it's a single object or other structure, wrap it
        }
      });

      // Create tree HTML structure
      result = `
<div class="tree-container">
<style>
  .tree-container {
    padding: 40px;
    font-family: Arial, sans-serif;
    background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .tree-level {
    display: flex;
    justify-content: center;
    margin: 30px 0;
    gap: 40px;
    position: relative;
  }
  .tree-node {
    padding: 12px 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
    border: 2px solid #60a5fa;
    text-align: center;
    min-width: 150px;
    position: relative;
    z-index: 2;
  }
  .tree-node:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 8px rgba(59, 130, 246, 0.4);
    transition: all 0.3s ease;
  }
  .parent-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .children-group {
    display: flex;
    gap: 15px;
    position: relative;
    padding: 15px;
    background: rgba(241, 245, 249, 0.7);
    border-radius: 8px;
    border: 1px dashed #93c5fd;
  }
  .connection-line {
    position: absolute;
    background-color: #93c5fd;
    z-index: 1;
  }
  .root-to-parent {
    width: 2px;
    top: 0;
    height: 30px;
    left: 50%;
    transform: translateX(-50%);
  }
  .parent-to-children {
    width: 2px;
    top: 100%;
    height: 30px;
    left: 50%;
    transform: translateX(-50%);
  }
  .level-title {
    font-size: 14px;
    color: #64748b;
    text-align: center;
    margin-bottom: 10px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
</style>

<!-- Root Level -->
<div class="level-title">Root Author</div>
<div class="tree-level">
  <div class="tree-node">${objData.orcid_to_name[Troot] || Troot}</div>
</div>

<!-- Parents Level -->
<div class="level-title">Direct Collaborators</div>
<div class="tree-level">
  ${Array.from(TparentChildMap.entries())
    .map(
      ([parent, parentChildren]) => `
    <div class="parent-group">
      <div class="connection-line root-to-parent"></div>
      <div class="tree-node">${objData.orcid_to_name[parent] || parent}</div>
      <div class="children-group">
        <div class="connection-line parent-to-children"></div>
        ${parentChildren
          .map(
            (child) => `
          <div class="tree-node" style="font-size: 0.9em;">
            ${objData.orcid_to_name[child] || child}
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("")}
</div>
</div>`;
      break;

    case 3:
      const authorBST = document.getElementById("authorBST").value;
      result = `Creating Binary Search Tree and removing Author ${authorBST}`;
      break;
    case 4:
      const authorPaths = document.getElementById("authorPaths").value;

      const root = authorPaths;
      let authorName, authorID;
      if (objData.orcid_to_name[authorPaths]) {
        authorName = objData.orcid_to_name[authorPaths];
        authorID = authorPaths;
      } else {
        authorName = authorPaths;
        authorID = authorPaths;
      }

      dataTable = `
            <h2>Author Article Count</h2>
            <table id="authorTable">
            <thead>
            <tr>
                <th>Author Name</th>
                <th>Count of Articles</th>
            </tr>
            </thead>
            <tbody>`;
      for (const [connectionID, articleCount] of Object.entries(
        objData.connections[authorID]
      )) {
        dataTable += `
              <tr>
                <td>${authorName}  -  ${
          objData.orcid_to_name[connectionID]
            ? objData.orcid_to_name[connectionID]
            : connectionID
        }</td>
                <td>${articleCount}</td>
              </tr>`;
      }
      for (const [connectionID, subConnections] of Object.entries(
        objData.connections[authorID]
      )) {
        for (const [subConnectionID, subArticleCount] of Object.entries(
          objData.connections[connectionID]
        )) {
          dataTable += `
              <tr>
              <td>${
                objData.orcid_to_name[connectionID]
                  ? objData.orcid_to_name[connectionID]
                  : connectionID
              } - ${
            objData.orcid_to_name[subConnectionID]
              ? objData.orcid_to_name[subConnectionID]
              : subConnectionID
          }</td>
              <td>${subArticleCount}</td>
              </tr>`;
        }
      }

      dataTable += `
          </tbody>
          </table>`;

      result = `
                <h3 style="color: #1e40af; font-size: 1.5em; margin-bottom: 20px; text-align: center;">
                Collaboration Network for ${
                  objData.orcid_to_name[authorPaths] || authorPaths
                }
                </h3>
                ${dataTable}
                <p style="text-align: center; color: #64748b; margin-top: 20px;">
                Visualizing collaboration network and calculating shortest paths
                </p>
                `;
      break;
    case 5:
      const authorCount = document.getElementById("authorCount").value;
      let name = objData.orcid_to_name[authorCount];
      let ID = objData.name_to_orcid[name];
      result = `The counting of collaborators for Author is : ${objData.connections[ID].length}`;
      break;
    case 6:
      let maxCount = 0;
      let resultKey = "";
      Object.keys(objData.connections).forEach((key) => {
        const count = objData.connections[key].length; // Get the value (number of collaborators)
        if (count > maxCount) {
          // Compare the value, not key.length
          maxCount = count;
          resultKey = key;
        }
      });

      result = `The counting of collaborators for (${objData.orcid_to_name[resultKey]}) is : ${maxCount}`;
      break;

    case 7:
      const authorLongest = document.getElementById("authorLongest").value;

      try {
        const pathResult = findLongestPath(authorLongest);
        result = `Finding longest path for Author ${authorLongest}:\n${pathResult}`;
      } catch (error) {
        console.error("Error in case 7:", error);
        result = `Error finding longest path for Author ${authorLongest}: ${error.message}`;
      }
      break;
  }
  // Display result
  resultDisplay.innerHTML = `
      <h3>Operation Result</h3>
      <p>${result}</p>
      <button onclick="resetModal()">Back to Operations</button>
    `;
  resultDisplay.style.display = "block";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
}
