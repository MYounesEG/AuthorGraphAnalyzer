const print = (message) => console.log(message);

// DOM Elements
const operationsButton = document.getElementById("operations-button");
const modalOverlay = document.getElementById("modal-overlay");
const operationSelection = document.getElementById("operation-selection");
const inputSection = document.getElementById("input-section");
const resultDisplay = document.getElementById("result-display");

// Modal Control Functions
operationsButton.addEventListener("click", () => {
  modalOverlay.style.display = "flex";

  document.onkeydown = null;

  resetModal();
});

function closeModal() {
  modalOverlay.style.display = "none";
}

function resetModal() {
  document.onkeydown = null;

  operationSelection.style.display = "block";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
  resultDisplay.style.display = "none";
}


function showOperationInput(operationNumber) {
  resultDisplay.style.display = "none";
  operationSelection.style.display = "none";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });

  if (
    operationNumber === 3 &&
    (typeof pathResult === "undefined" || !pathResult.pathQueue)
  ) {
    resultDisplay.innerHTML = `
          <h1>Warning</h1>
          <p>Please first find a path between two authors using Operation 1 before viewing the network graph.</p>
          <div class="operation-button" onclick="showOperationInput(1)">
              Shortest Path Between Authors
          </div>
      `;
    resultDisplay.style.display = "block";
  } else {
    if (operationNumber === 3) {
      // Create tree visualization
      const treeData = createBSTFromQueue(pathResult.pathQueue);
      const treeHtml = generateTreeVisualization(treeData);

      resultDisplay.innerHTML = `
              <div class="tree-visualization">
                  ${treeHtml}
              </div>
          `;
      resultDisplay.style.display = "block";
    }
    steps = 1;

    document.onkeydown = null;

    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") executeOperation(operationNumber);
    });

    document.getElementById(`input${operationNumber}`).style.display = "flex";
  }
}

function createBSTFromQueue(queue) {
  const items = [...queue.items]; // Create copy of queue items
  if (items.length === 0) return null;

  // Create root node
  const root = { value: items[0], left: null, right: null };
  
  // Insert remaining items using BST logic
  for (let i = 1; i < items.length; i++) {
    insertNode(root, items[i]);
  }

  return root;
}

// Helper function to insert a node in BST
function insertNode(root, value) {
  if (!root) return { value, left: null, right: null };

  // Compare using node.value.value
  if (value.value <= root.value.value) {
    if (root.left === null) {
      root.left = { value, left: null, right: null };
    } else {
      insertNode(root.left, value);
    }
  } else {
    if (root.right === null) {
      root.right = { value, left: null, right: null };
    } else {
      insertNode(root.right, value);
    }
  }

  return root;
}

// Generate SVG visualization
function generateTreeVisualization(root) {
  const width = 550;
  const height = 500;
  const nodeRadius = 30;
  const levelHeight = 80;

  let svg = `<svg width="${width}" height="${height}">`;

  // Calculate tree depth to adjust horizontal spacing
  function getTreeDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
  }

  const treeDepth = getTreeDepth(root);
  const initialSpacing = width / Math.pow(2, 1); // Adjust initial spacing based on tree depth

  function calculateNodePosition(
    node,
    level = 0,
    x = width / 2,
    spacing = initialSpacing
  ) {
    if (!node) return;

    // Store positions
    node.x = x ;
    node.y = level * levelHeight + 45;

    // Calculate child positions with adjusted spacing
    if (node.left) {
      calculateNodePosition(node.left, level + 1, x - spacing / 2, spacing / 2);
      svg += `<line class="link" x1="${node.x}" y1="${node.y}" x2="${node.left.x}" y2="${node.left.y}"/>`;
    }

    if (node.right) {
      calculateNodePosition(node.right, level + 1, x + spacing / 2, spacing / 2);
      svg += `<line class="link" x1="${node.x}" y1="${node.y}" x2="${node.right.x}" y2="${node.right.y}"/>`;
    }

    // Draw node
    svg += `
      <g class="node" transform="translate(${node.x},${node.y})">
          <circle r="${nodeRadius}"/>
          <text dy=".3em" text-anchor="middle">${node.value.value}</text>
          <text dy="3.5em" text-anchor="middle">${
            objData.orcid_to_name[node.value.id]
              ? objData.orcid_to_name[node.value.id]
              : node.value.id
          }</text>
      </g>
    `;
  }

  if (root) calculateNodePosition(root);

  svg += "</svg>";
  return svg;
}


function dijkstra(startNode, endNode) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize distances
  Object.keys(objData.connections).forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  });
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current = Array.from(unvisited).reduce((min, node) =>
      distances[node] < distances[min] ? node : min
    );

    if (current === endNode) break;
    unvisited.delete(current);

    // Get all connections for current node
    const neighbors = objData.connections[current];
    if (!neighbors) continue;

    Object.entries(neighbors).forEach(([neighbor, weight]) => {
      if (!unvisited.has(neighbor)) return;

      // Weight is inverse of collaboration count (more collaborations = shorter path)
      const edgeWeight = 1 / weight;
      const distance = distances[current] + edgeWeight;

      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = current;
      }
    });
  }

  // Reconstruct path
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  const pathQueue = new Queue();
  let distance = 0;

  for (let i = 0; i < path.length; i++) {
    pathQueue.enqueue({
      id: path[i],
      value: i
        ? objData.connections[path[i]][path[i - 1]]
        : (objData.connections[path[i]][path[i + 1]] +
            objData.connections[path[i + 1]][path[i + 2]]) /
          2,
    });
    if (i) distance += objData.connections[path[i]][path[i - 1]];
  }

  return {
    pathQueue,
    path,
    distance: distance,
  };
}

function getCoauthorArticleCounts(authorId, objData) {
  const connections = objData.connections[authorId];
  if (!connections) {
    return new Queue();
  }

  const counts = Object.entries(connections)
    .map(([coauthorId, count]) => ({
      name: objData.orcid_to_name[coauthorId] || coauthorId,
      articleCount: count,
    }))
    .sort((a, b) => b.articleCount - a.articleCount);

  const queue = new Queue();
  counts.forEach((entry) => queue.enqueue(entry));
  return queue;
}

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

function tableNextStep() {
  steps += 1;
  executeOperation(4);
}
function fullTable() {
  steps = Infinity;
  executeOperation(4);
}

let steps, authorPaths;

function createDataTable(authorPaths = authorPaths) {
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
  let i = 0;
  for (const [connectionID, articleCount] of Object.entries(
    objData.connections[authorID]
  )) {
    if (i >= steps) break;
    dataTable += `
            <tr>
              <td>${authorName}  -  ${
      objData.orcid_to_name[connectionID]
        ? objData.orcid_to_name[connectionID]
        : connectionID
    }</td>
              <td>${articleCount}</td>
            </tr>`;
    i += 1;
  }
  for (const [connectionID, subConnections] of Object.entries(
    objData.connections[authorID]
  )) {
    if (i >= steps) break;
    for (const [subConnectionID, subArticleCount] of Object.entries(
      objData.connections[connectionID]
    )) {
      if (i >= steps) break;
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
      i += 1;
    }
  }

  dataTable += `
        </tbody>
        </table>
        <p></p>

        ${
          steps <= i && steps != Infinity
            ? `
        <div style="display: flex; flex-direction: row-reverse; justify-content: space-between;">
        <button onclick="tableNextStep()" class="mt-4">
          <i class="fas fa-step-forward"></i> Next Step
        </button>
        <button onclick="fullTable()" class="mt-4">
          <i class="fas fa-table"></i> Full Table
        </button>
        `
            : ``
        }
        `;

  return dataTable;
}

let maxLength = 30;

function findLongestPath(connections, startId) {
  let state = false;
  const visited = new Set();

  let longestPath = [];

  function dfs(currentNode, path) {
    if (state) return path;

    if (path.length >= maxLength) {
      state = true;
      return path;
    }

    if (visited.has(currentNode)) {
      return;
    }

    visited.add(currentNode);

    path.push(currentNode);

    let isDeadEnd = true;
    for (const neighbor in connections[currentNode] || {}) {
      if (!visited.has(neighbor)) {
        isDeadEnd = false;
        dfs(neighbor, [...path]);
      }
    }

    if (isDeadEnd) {
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }

    visited.delete(currentNode);
  }

  dfs(startId, []);

  return longestPath;
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") tableNextStep();
});

let pathResult;
function executeOperation(operationNumber) {
  let result = "",
    name,
    ID;

  switch (operationNumber) {
    case 1:
      let nameA, nameB, orcidA, orcidB;
      let authorA = document.getElementById("authorA").value;
      let authorB = document.getElementById("authorB").value;

      if (!authorA || !authorB) {
        result = "Please enter both authors";
        break;
      }

      if (authorA === authorB) {
        result = "Please enter two different authors";
        break;
      }
      if (objData.orcid[authorA]) {
        orcidA = authorA;
        nameA = objData.orcid_to_name[authorA];
        authorA = objData.name_to_orcid[nameA];
      } else nameA = authorA;

      if (objData.orcid[authorB]) {
        orcidB = authorB;
        nameB = objData.orcid_to_name[authorB];
        authorB = objData.name_to_orcid[nameB];
      } else nameB = authorB;

      pathResult = dijkstra(authorA, authorB);
      result =
        pathResult.error ||
        `Shortest path found between <span style="color:#01FEE5;font-size=large;">${nameA}</span> and <span style="color:#01FEE5;font-size=large;">${nameB}</span> :<p>${pathResult.path.join(
          " -> "
        )}</p><p>\nDistance: ${pathResult.path.length}</p>
        <p></p>
        <div style="display: flex; flex-direction: row-reverse; justify-content: space-between;">
        <button onclick="showPathGraph()" class="mt-4">Show the path in Network Graph</button>

        `;
      break;

    case 2:
      const queueOrder = document.getElementById("authorQueue").value;
      if (!queueOrder) {
        result = "Please enter an author";
        break;
      }

      const authorQueue = getCoauthorArticleCounts(queueOrder, objData);
      result = `${authorQueue.items
        .map(
          (item, i) => `${i + 1}. ${item.name} (${item.articleCount} articles)`
        )
        .join("<br>")}<p></p>`;
      break;

    case 3:
      const authorTree = document.getElementById("authorBST").value;
      if (!authorTree) {
        result = "Please enter an author";
        break;
      }
      /////////////////////  result = generateCollaborationTree(authorTree);
      break;
    case 4:
      authorPaths = document.getElementById("authorPaths").value;

      const dataTable = createDataTable(authorPaths);

      result = `
                    <h3 style="color: #1e40af; font-size: 1.5em; margin-bottom: 20px; text-align: center;">
                    Collaboration Network for ${
                      objData.orcid_to_name[authorPaths] || authorPaths
                    }
                    </h3>
                    ${dataTable}
                    `;
      break;
    case 5:
      const IDinput = document.getElementById("authorCount").value;
      name = objData.orcid_to_name[IDinput]
        ? objData.orcid_to_name[IDinput]
        : IDinput;

      result = `The counting of collaborators for ${name} is : ${
        Object.keys(objData.connections[IDinput]).length
      }`;
      break;
    case 6:
      result = `The counting of collaborators for (${
        objData.orcid_to_name[Object.keys(objData.connections)[0]]
      }) is : ${Object.keys(Object.values(objData.connections)[0]).length}`;
      break;
    case 7:
      const authorLongest = document.getElementById("authorLongest").value;

      if (objData.orcid[authorLongest]) {
        name = objData.orcid_to_name[authorLongest];
        ID = objData.name_to_orcid[name];
      } else {
        ID = name = authorLongest;
      }
      print(ID);
      let longestPath = findLongestPath(objData.connections, ID);
      result = `<h3>
            start Node: ${ID}</h3><h3></h3><h3>
            longest Path: ${longestPath}</h3><h3></h3><h3>
            path Length: ${longestPath.length}</h3>
        `;

      break;
  }

  // Display result
  resultDisplay.innerHTML = `
    <h1>Operation Result</h1>

      ${result}
      <button onclick="resetModal()" class="mt-4">
      <i class="fas fa-arrow-left"></i>
      Back to Operations</button>
    </div>
  `;
  resultDisplay.style.display = "block";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
}
