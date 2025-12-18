// get default data
export async function getDefaultGraphsData() {
  try {
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/6933c6ccd0ea881f40162fc9/latest",
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
    console.log("API Response:", data.record.data);

    return data.record.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}


export async function fetchChildrenBasedOnParentId() {
  try {
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/6933c66243b1c97be9db21a2/latest",
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
    console.log("API Data:------", data.record.data);

    return data.record.data['1'];
  } catch (error) {
    console.error("Error fetching JSONBin:", error);
    return null;
  }
}
