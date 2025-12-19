// This file simulates backend APIs
// Later you can replace these with real fetch/axios calls

import { defaultGraphData, childrenGraphData, nodeDetails } from "../data/graphData";
import { fetchAllChildren, fetchChildrenBasedOnParentId, fetchRootNodes, getDefaultGraphsData, getNodeDetails } from "./apis";

// simulate network delay
const delay = (ms = 200) =>
  new Promise(resolve => setTimeout(resolve, ms));

/* ---------------- RootNodes of Graphs GRAPH API ---------------- */

export async function getRootsOfGraph() {
  const data = await fetchRootNodes();
  // await delay();
  return data;
}

/* ---------------- DEFAULT GRAPH API ---------------- */

export async function fetchDefaultGraph() {
  const data = await getDefaultGraphsData();
  // await delay();
  return data;
}

/* ---------------- CHILDREN GRAPH API ---------------- */

export async function fetchChildrenGraph(nodeId) {
  const data = await fetchChildrenBasedOnParentId(nodeId);
  // await delay();
  // return childrenGraphData[nodeId] || { nodes: [], edges: [] };
  return data;
}

/* ---------------- OPTIONAL HELPERS ---------------- */

export async function fetchAllChildrenGraphs() {
  const data = await fetchAllChildren();
  // await delay();
  // return childrenGraphData;
  return data;
}


/* ---------------- NODE CLICK DETAILS API ---------------- */

export async function fetchNodeDetails(nodeId) {
  const data = await getNodeDetails(nodeId);
  // await delay();
  return data;
}