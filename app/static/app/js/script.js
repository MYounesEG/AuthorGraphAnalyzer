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
  steps = 1;

  document.onkeydown = null;


  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") executeOperation(operationNumber);
  });

  operationSelection.style.display = "none";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
  document.getElementById(`input${operationNumber}`).style.display = "flex";
}

// Core Functions
function calculateWeight(author1, author2, objData) {
  print(`Calculating weight between ${author1} and ${author2}`);

  let weight = 0;

  // Check direct connections
  if (
    objData.connections[author1]?.[author2] ||
    objData.connections[author2]?.[author1]
  ) {
    weight = 1;
  }

  // Check coauthorship
  const author1Coauthors = objData.coauthors[author1] || [];
  const author2Coauthors = objData.coauthors[author2] || [];

  if (
    author1Coauthors.some((paper) => paper.coauthors.includes(author2)) ||
    author2Coauthors.some((paper) => paper.coauthors.includes(author1))
  ) {
    weight += 0.5;
  }

  return weight;
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
  path.forEach((entry) => pathQueue.enqueue(entry));

  return {
    pathQueue,
    path,
    distance: distances[endNode],
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

function generateCollaborationTree(authorId) {
  const authorName = objData.orcid_to_name[authorId] || authorId;
  const connections = objData.connections[authorId] || {};

  let treeHtml = `
    <div class="tree-container">
      <div class="level-title">Root Author</div>
      <div class="tree-level">
        <div class="tree-node">${authorName}</div>
      </div>
      <div class="level-title">Direct Collaborators</div>
      <div class="tree-level">
  `;

  // Add direct collaborators
  Object.entries(connections).forEach(([collaboratorId, weight]) => {
    const collaboratorName =
      objData.orcid_to_name[collaboratorId] || collaboratorId;
    const subConnections = objData.connections[collaboratorId] || {};

    treeHtml += `
      <div class="parent-group">
        <div class="connection-line root-to-parent"></div>
        <div class="tree-node">${collaboratorName}</div>
        <div class="children-group">
          <div class="connection-line parent-to-children"></div>
    `;

    // Add secondary connections
    Object.keys(subConnections)
      .slice(0, 5)
      .forEach((subId) => {
        const subName = objData.orcid_to_name[subId] || subId;
        treeHtml += `<div class="tree-node" style="font-size: 0.9em;">${subName}</div>`;
      });

    treeHtml += `
        </div>
      </div>
    `;
  });

  treeHtml += `
      </div>
    </div>
  `;

  return treeHtml;
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
      result = generateCollaborationTree(authorTree);
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
