// get default data

export async function fetchRootNodes() {
  try {
    const response = await fetch(
      "http://localhost:4000/api/graph/root-nodes",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // If your bin is private, uncomment and add your API key:
          // "X-Master-Key": "YOUR_JSONBIN_API_KEY"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function getDefaultGraphsData() {
  try {
    const response = await fetch(
      "http://localhost:4000/api/graph/default",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // If your bin is private, uncomment and add your API key:
          // "X-Master-Key": "YOUR_JSONBIN_API_KEY"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}


export async function fetchChildrenBasedOnParentId(nodeId) {
  try {
    const response = await fetch(
      "http://localhost:4000/api/graph/children/"+nodeId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // If this bin is private, add your API key:
          // "X-Master-Key": "YOUR_JSONBIN_API_KEY"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Data:------", data);

    return data;
  } catch (error) {
    console.error("Error fetching JSONBin:", error);
    return null;
  }
}

export async function fetchAllChildren() {
  try {
    const response = await fetch(
      "http://localhost:4000/api/graph/children/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // If this bin is private, add your API key:
          // "X-Master-Key": "YOUR_JSONBIN_API_KEY"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Data:------", data);

    return data;
  } catch (error) {
    console.error("Error fetching JSONBin:", error);
    return null;
  }
}

export async function getNodeDetails(nodeId) {
  // TODO: get details based on selected-nodes
  try {
    const response = await fetch(
      "http://localhost:4000/api/node/details",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // If your bin is private, uncomment and add your API key:
          // "X-Master-Key": "YOUR_JSONBIN_API_KEY"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
