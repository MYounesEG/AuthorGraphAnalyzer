
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

function dijkstra(startNode, endNode, objData) {
  // Normalize input nodes
  const start = objData.name_to_orcid[startNode] || startNode;
  const end = objData.name_to_orcid[endNode] || endNode;

  // Initialize data structures
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize all distances
  Object.keys(objData.connections).forEach((author) => {
    distances[author] = Infinity;
    previous[author] = null;
    unvisited.add(author);
  });

  distances[start] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = Array.from(unvisited).reduce(
      (min, node) => (distances[node] < distances[min] ? node : min),
      Array.from(unvisited)[0]
    );

    if (current === end || distances[current] === Infinity) {
      break;
    }

    unvisited.delete(current);

    // Process neighbors
    Object.keys(objData.connections[current] || {}).forEach((neighbor) => {
      if (unvisited.has(neighbor)) {
        const weight = calculateWeight(current, neighbor, objData);
        const newDistance = distances[current] + weight;

        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = current;
        }
      }
    });
  }

  // Construct path
  const path = [];
  let current = end;

  if (previous[current] === null && current !== start) {
    return {
      path: [],
      distance: Infinity,
      error: "No path found between the authors.",
    };
  }

  while (current !== null) {
    path.unshift(objData.orcid_to_name[current] || current);
    current = previous[current];
  }

  return {
    path,
    distance: distances[end],
    error: null,
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

function findLongestPath(connections, startId) {
  const visited = new Set();
  let longestPath = [];

  function dfs(currentNode, path) {
    if (visited.has(currentNode)) return;
    visited.add(currentNode);
    path.push(currentNode);

    let isDeadEnd = true;

    // Bağlı düğümleri dolaş
    for (const neighbor in connections[currentNode] || {}) {
      if (!visited.has(neighbor)) {
        isDeadEnd = false;
        dfs(neighbor, [...path]);
      }
    }

    if (isDeadEnd && path.length > longestPath.length) {
      longestPath = path;
    }

    visited.delete(currentNode);
  }

  dfs(startId, []);
  return longestPath;
}

function executeOperation(operationNumber) {
  let result = "";

  try {
    switch (operationNumber) {
      case 1:
        const authorA = document.getElementById("authorA").value;
        const authorB = document.getElementById("authorB").value;

        if (!authorA || !authorB) {
          result = "Please enter both authors";
          break;
        }

        if (authorA === authorB) {
          result = "Please enter two different authors";
          break;
        }

        const pathResult = dijkstra(authorA, authorB, objData);
        result =
          pathResult.error ||
          `Shortest path found:\n${pathResult.path.join(" -> ")}\nDistance: ${
            pathResult.distance
          }`;
        break;

      case 2:
        const authorQueue = document.getElementById("authorQueue").value;
        if (!authorQueue) {
          result = "Please enter an author";
          break;
        }

        const queue = getCoauthorArticleCounts(authorQueue, objData);
        result = queue.items
          .map(
            (item, i) =>
              `${i + 1}. ${item.name} (${item.articleCount} articles)`
          )
          .join("<br>");
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
                    `;
        break;
      case 5:
        const IDinput = document.getElementById("authorCount").value;
        let name = objData.orcid_to_name[IDinput]
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
        result = `<h3>
            start Node: ${authorLongest}</h3><h3></h3><h3>
            longest Path: ${findLongestPath(
              objData.connections,
              authorLongest
            )}</h3><h3></h3><h3>
            path Length: ${
              findLongestPath(objData.connections, authorLongest).length
            }</h3>
        `;
        break;
    }
  } catch (error) {
    console.error("Operation error:", error);
    result = `Error executing operation: ${error.message}`;
    }
  

  // Display result
  resultDisplay.innerHTML = `
    <h1>Operation Result</h1>
    <div>${result}</div>
    <button onclick="resetModal()" class="mt-4">Back to Operations</button>
  `;
  resultDisplay.style.display = "block";
  inputSection.querySelectorAll(".operation-input").forEach((input) => {
    input.style.display = "none";
  });
}
