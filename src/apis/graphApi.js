// This file simulates backend APIs
// Later you can replace these with real fetch/axios calls

import { defaultGraphData, childrenGraphData } from "../data/graphData";
import { fetchChildrenBasedOnParentId, getDefaultGraphsData } from "./apis";

// simulate network delay
const delay = (ms = 200) =>
  new Promise(resolve => setTimeout(resolve, ms));

/* ---------------- DEFAULT GRAPH API ---------------- */

export async function fetchDefaultGraph() {
  const data = await getDefaultGraphsData();
  // await delay();
  return data;
}

/* ---------------- CHILDREN GRAPH API ---------------- */

export async function fetchChildrenGraph(nodeId) {
  // const data = await fetchChildrenBasedOnParentId();
  // await delay();
  return childrenGraphData[nodeId] || { nodes: [], edges: [] };
  // return data;
}

/* ---------------- OPTIONAL HELPERS ---------------- */

export async function fetchAllChildrenGraphs() {
  await delay();
  return childrenGraphData;
}
