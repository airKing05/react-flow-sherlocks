import React, { useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Background,
  MarkerType,
  SmoothStepEdge,
  useReactFlow
} from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css';

import ELK from "elkjs/lib/elk.bundled.js";
import CustomNode from './CustomNode';
import PortalPopup from '../Portal/PortalPopup';
import CodeTour from '../Portal/CodeTour';
import NodeNav from '../../ui/NodeNav';
import DemoContent from '../Portal/DemoContent';

import {
  fetchDefaultGraph,
  fetchChildrenGraph,
  fetchAllChildrenGraphs
} from "../../apis/graphApi.js";


const elk = new ELK();


/* ---------------------------------------------------------
      HELPERS FOR NEW DATA STRUCTURE
--------------------------------------------------------- */

// Fetch children of node
async function getChildren(nodeId) {
  const data = await fetchChildrenGraph(nodeId);
  return data.nodes || [];
}

// Fetch children edges
async function getChildrenEdges(nodeId) {
  const data = await fetchChildrenGraph(nodeId);
  return data.edges || [];
}

// Flatten all nodes
async function getAllNodes() {
  const defaultGraph = await fetchDefaultGraph();
  const childrenGraphs = await fetchAllChildrenGraphs();

  const out = [...defaultGraph.nodes];
  Object.values(childrenGraphs).forEach(c => out.push(...c.nodes));
  return out;
}

// Flatten all edges
async function getAllEdges() {
  const defaultGraph = await fetchDefaultGraph();
  const childrenGraphs = await fetchAllChildrenGraphs();

  const out = [...defaultGraph.edges];
  Object.values(childrenGraphs).forEach(c => out.push(...c.edges));
  return out;
}



function computeExpandedFromVisited(path, index, allNodes) {
  const visitedIds = new Set(path.slice(0, index + 1));

  // Only nodes that:
  // 1. are visited
  // 2. have children
  return new Set(
    Array.from(visitedIds).filter(id => {
      const n = allNodes.find(x => x.id === id);
      return n?.hasChildren;
    })
  );
}



/* ----------------------------------------
   STYLE EDGES — BASED ON LEVEL
---------------------------------------- */

// check the node level
function computeNodeLevels(nodes) {
  const levelMap = {};

  function dfs(nodeId, level) {
    levelMap[nodeId] = level;

    nodes
      .filter(n => n.parent === nodeId)
      .forEach(child => dfs(child.id, level + 1));
  }

  // start from roots
  nodes
    .filter(n => n.parent === null)
    .forEach(root => dfs(root.id, 0));

  return levelMap;
}



/* ---------------------------------------------------------
      isExpanded helper
--------------------------------------------------------- */

function computeIsExpanded(nodeId, nodes) {
  // All currently visible children (not always visible)
  const visible = nodes.filter(
    n => n.data?.parent === nodeId && !n.data?.isAlwaysVisible
  );

  // If ANY visible children exist → expanded
  return visible.length > 0;
}

/* ---------------------------------------------------------
      ELK LAYOUT - unchanged
--------------------------------------------------------- */
async function getElkLayout(nodes, edges, toggleExpand) {
  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.direction": "DOWN",
      "elk.algorithm": "layered",
      "elk.spacing.nodeNode": "20",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.alignNodes": "CENTER",
      "elk.layered.considerModelOrder": "true"
    },
    children: nodes.map(node => ({
      id: node.id,
      width: 200,
      height: 60
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      source: edge.source,
      target: edge.target
    }))
  };

  const rootNodes = nodes.filter(n => n.parent === null);
  elkGraph.children.forEach(child => {
    if (rootNodes.some(r => r.id === child.id)) {
      child.layoutOptions = {
        "elk.layered.layerConstraint": "SAME_LAYER",
        "elk.layered.priority": "100"
      };
    }
  });

  const layout = await elk.layout(elkGraph);

  /* ----------------------------------------
     STYLE EDGES
  ---------------------------------------- */
  /* ----------------------------------------
   STYLE EDGES — BASED ON LEVEL
---------------------------------------- */
/* ----------------------------------------
   STYLE EDGES — DEFAULT vs HIDDEN RULE
---------------------------------------- */
  const nodeLevels = computeNodeLevels(nodes);

  const styledEdges = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    const sourceLevel = nodeLevels[edge.source] ?? 0;

    const sourceAlways = sourceNode?.isAlwaysVisible === true;
    const targetAlways = targetNode?.isAlwaysVisible === true;

    // ✅ Rule 1: level-based color ONLY for default nodes
    const isDefaultConnection = sourceAlways && targetAlways;

    const color = isDefaultConnection
      ? sourceLevel === 0
        ? "#3B82F6"     // root → level 1
        : "#46AE6F"     // deeper default levels
      : "#46AE6F";     // hidden children use green (can change if needed)

    // ✅ Rule 2: hidden children = solid line
    const strokeDasharray = isDefaultConnection
      ? "6 4"          // keep dashed for default edges
      : "0";           // SOLID for hiddable children

    return {
      ...edge,
      style: {
        stroke: color,
        strokeWidth: 3,
        strokeDasharray
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color
      },
      label: edge.label ?? `${edge.source} → ${edge.target}`,
      labelStyle: {
        fill: color,
        fontWeight: "bold",
        fontSize: 12
      }
    };
  });



  /* ----------------------------------------
     FIRST PASS — layout, style, NO isExpanded
  ---------------------------------------- */
  const layoutedNodes = nodes.map(node => {
    const pos = layout.children.find(n => n.id === node.id);

    const bgColor = node.initialVisible
      ? "linear-gradient(to left, #283593, #3949AB)"
      : "linear-gradient(to right bottom, #F59E0B, #D97706)";

    return {
      ...node,
      type: "custom",
      position: { x: pos.x, y: pos.y },

      style: {
        color: "white",
        background: bgColor,
        border: node.initialVisible
          ? "2px solid #5C6BC0"
          : "2px solid #FBBF24",
        borderRadius: 8
      },

      data: {
        ...node.data,
        label: node.label,
        parent: node.parent,          // <-- preserve parent
        isAlwaysVisible: node.isAlwaysVisible,
        initialVisible: node.initialVisible,
        toggleExpand: () => toggleExpand(node.id),
        isGlowing: node.data?.isGlowing ?? false,
        hasChildren: node.hasChildren
        // 🚫 no isExpanded yet
      }
    };
  });

  /* ----------------------------------------
     SECOND PASS — NOW compute isExpanded  
     (using layoutedNodes = current graph)
  ---------------------------------------- */
  layoutedNodes.forEach(n => {
    n.data.isExpanded = computeIsExpanded(n.id, layoutedNodes);
  });

  return {
    nodes: layoutedNodes,
    edges: styledEdges
  };
}


/* ---------------------------------------------------------
      MAIN COMPONENT
--------------------------------------------------------- */
const edgeTypes = { smoothstep: SmoothStepEdge };
const nodeTypes = { custom: CustomNode };

const ExpandAndCollapse = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isCodeTourePopupOpen, setCodeTourePopupOpen] = useState(false);

  const [isTourActive, setIsTourActive] = useState(false);
  const [tourPath, setTourPath] = useState([]);
  const [tourIndex, setTourIndex] = useState(0);

  const [selectedNode, setSelectedNode] = useState(null);
  const [openRight, setOpenRight] = useState(false);
  const [visited, setVisited] = useState(new Set());
  const [tourExpanded, setTourExpanded] = useState(new Set());
 
 
  const rf = useReactFlow();

  async function waitForReactFlowToStabilize() {
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));
  }

  /* ---------------------------------------------------------
      UPDATED CLICK HANDLER (NEW DATA LOGIC)
  --------------------------------------------------------- */
  const handleNodeClick = useCallback(
    async (_, node) => {
      const nodeId = node.id;

      const currentNodes = rf.getNodes();
      const currentEdges = rf.getEdges();

      const allChildren = await getChildren(nodeId);
      const childEdges = await getChildrenEdges(nodeId);

      const visibleChildren = currentNodes.filter(
        n => n.data.parent === nodeId && !n.data.isAlwaysVisible
      );

      console.log("nodeId=====", nodeId, allChildren, visibleChildren);

      // ------------------ EXPAND ------------------
      if (visibleChildren.length !== allChildren.length) {
        // Always add ALL children (remove broken skip logic)
        const newChildren = allChildren.map(child => ({
          ...child,
          initialVisible: false
        }));

        const newNodes = [
          ...currentNodes,
          ...newChildren.filter(
            c => !currentNodes.some(n => n.id === c.id)
          )
        ];

        const newEdges = [
          ...currentEdges,
          ...childEdges
        ];

        const { nodes: layouted, edges: styledEdges } =
          await getElkLayout(newNodes, newEdges, toggleExpand);

        setNodes(layouted);
        setEdges(styledEdges);
        return;
      }

      console.log("nodeId===== 2222222", nodeId, allChildren, visibleChildren);

      // ------------------ COLLAPSE ------------------
      const filteredNodes = currentNodes.filter(
        n => n.data.parent !== nodeId || n.data.isAlwaysVisible  // <-- FIXED
      );

      const filteredEdges = currentEdges.filter(
        e => e.fixed || e.source !== nodeId
      );

      const { nodes: layouted2, edges: styledEdges2 } =
        await getElkLayout(filteredNodes, filteredEdges, toggleExpand);

      setNodes(layouted2);
      setEdges(styledEdges2);
    },
    [rf]
  );


  /* ---------------------------------------------------------
      toggleExpand function
  --------------------------------------------------------- */
  const toggleExpand = useCallback(
    nodeId => {
      const n = rf.getNode(nodeId);
    
      if (n) handleNodeClick(null, n);
    },
    [rf, handleNodeClick]
  );

  /* ---------------------------------------------------------
      INITIAL LOAD — UPDATED
  --------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const defaultData = await fetchDefaultGraph();

      const initialVisible = defaultData.nodes.map(n => ({
        ...n,
        initialVisible: true
      }));

      const { nodes: layouted, edges: styledEdges } =
        await getElkLayout(initialVisible, defaultData.edges, toggleExpand);

      setNodes(layouted);
      setEdges(styledEdges);
    })();
  }, []);


  /* ---------------------------------------------------------
      This re-dims EVERYTHING whenever nodes change
  --------------------------------------------------------- */
  useEffect(() => {
  if (!isTourActive) return;

  setNodes(ns =>
    ns.map(n => {
      const isCurrent = n.id === tourPath[tourIndex];
      const isVisited = visited.has(n.id);

      return {
        ...n,
        data: {
          ...n.data,
          isGlowing: isCurrent
        },
        style: {
          ...n.style,
          opacity: isCurrent || isVisited ? 1 : 0.2,
          border: isCurrent
            ? n.initialVisible
              ? "3px solid #5C6BC0"
              : "3px solid #FBBF24"
            : n.style.border
        }
      };
    })
  );

 setEdges(es =>
  es.map(e => {
    const visible =
      visited.has(e.source) && visited.has(e.target);

    const opacity = visible ? 1 : 0.15;

    return {
      ...e,
      style: {
        ...e.style,
        opacity
      },
      labelStyle: {
        ...e.labelStyle,
        opacity
      },
      labelBgStyle: {
        ...e.labelBgStyle,
        opacity
      },
      markerEnd: e.markerEnd
        ? {
            ...e.markerEnd,
            color: visible ? "#46AE6F" : "#999"
          }
        : undefined
    };
  })
);

}, [nodes.length, tourIndex, visited, isTourActive]);


  /* ---------------------------------------------------------
      Expand All — UPDATED
  --------------------------------------------------------- */
  const handleExpandAll = async () => {
    const allNodes = await getAllNodes();

    const expandedNodes = allNodes.map(n => ({
      ...n,
      initialVisible: n.parent === null || n.isAlwaysVisible ? true : false
    }));

    const expandedEdges = await getAllEdges();

    const { nodes: layoutedNodes, edges: styledEdges } =
      await getElkLayout(expandedNodes, expandedEdges, toggleExpand);

    setNodes(layoutedNodes);
    setEdges(styledEdges);

    setTimeout(() => {
      rf.fitView({ padding: 0.3, duration: 600 });
    }, 50);
  };


  /* ---------------------------------------------------------
      Collapse All — UPDATED
  --------------------------------------------------------- */
  const handleCollapseAll = async () => {
    const defaultGraph = await fetchDefaultGraph();

    const collapsedNodes = defaultGraph.nodes.map(n => ({
      ...n,
      initialVisible: true
    }));

    const collapsedEdges = defaultGraph.edges;

    const { nodes: layoutedNodes, edges: styledEdges } =
      await getElkLayout(collapsedNodes, collapsedEdges, toggleExpand);

    setNodes(layoutedNodes);
    setEdges(styledEdges);

    setTimeout(() => {
      rf.fitView({ padding: 0.3, duration: 600 });
    }, 50);
  };


  /* ---------------------------------------------------------
      Edge click highlight
  --------------------------------------------------------- */
  const focusNode = useCallback(
    nodeId => {
      const node = rf.getNode(nodeId);
      if (!node) return;

    // TODO: check if require then enable it
      // setSelectedNode(node);

      rf.setCenter(
        node.position.x + (node.width || 200) / 2,
        node.position.y + (node.height || 60) / 2,
        { zoom: 1.8, duration: 800, easing: "easeInOutCubic" }
      );
    },
    [rf]
  );

  const handleEdgeClick = useCallback(
    (event, edge) => {
      event.preventDefault();
      event.stopPropagation();

      const nodeId = edge.target;

      setNodes(ns =>
        ns.map(n =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, isGlowing: true } }
            : n
        )
      );

      setTimeout(() => {
        setNodes(ns =>
          ns.map(n =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, isGlowing: false } }
              : n
          )
        );
      }, 1000);

      focusNode(nodeId);
    },
    [focusNode]
  );

  /* ---------------------------------------------------------
      Code Tour (uses updated data)
  --------------------------------------------------------- */
function buildTourPath(allNodes, rootId) {
  const childrenMap = {};
  const nodeMap = {};

  allNodes.forEach(n => {
    nodeMap[n.id] = n;
    if (!childrenMap[n.parent]) childrenMap[n.parent] = [];
    childrenMap[n.parent].push(n.id);
  });

  Object.values(childrenMap).forEach(list => list.sort());

  const path = [];

  function dfs(nodeId) {
    path.push(nodeId);

    const children = childrenMap[nodeId] || [];

    const sorted = [...children].sort((a, b) => {
      const A = nodeMap[a];
      const B = nodeMap[b];

      // hidden before always-visible
      if (!!A.isAlwaysVisible !== !!B.isAlwaysVisible) {
        return A.isAlwaysVisible ? 1 : -1;
      }

      // nodes with children first
      if (!!A.hasChildren !== !!B.hasChildren) {
        return A.hasChildren ? -1 : 1;
      }

      return 0;
    });

    sorted.forEach(childId => dfs(childId));
  }

  // 🔥 START ONLY FROM SELECTED ROOT
  if (nodeMap[rootId]) {
    dfs(rootId);
  }

  return path;
}




async function goToNodeInTour(nodeId) {
  const currentIndex = tourPath.indexOf(nodeId);
  const visitedSet = new Set(tourPath.slice(0, currentIndex + 1));

  const currentNode = rf.getNode(nodeId);

  // Expand ONLY when focused
  if (
    currentNode?.data?.hasChildren &&
    !tourExpanded.has(nodeId)
  ) {
    setTourExpanded(prev => new Set(prev).add(nodeId));
    await toggleExpand(nodeId);
  }

  setVisited(visitedSet);
  setSelectedNode(currentNode);

  if (currentNode) {
    rf.setCenter(
      currentNode.position.x + 100,
      currentNode.position.y + 30,
      { zoom: 1.4, duration: 600 }
    );
  }
}


const startTour = async (rootId) => {
  const defaultGraph = await fetchDefaultGraph();

  const initialNodes = defaultGraph.nodes.map(n => ({
    ...n,
    initialVisible: true
  }));

  const { nodes: layoutedNodes, edges: styledEdges } =
    await getElkLayout(initialNodes, defaultGraph.edges, toggleExpand);

  setNodes(layoutedNodes);
  setEdges(styledEdges);

  // 🧭 Build tour ONLY for selected tree
  const allForPath = await getAllNodes();
  const path = buildTourPath(allForPath, rootId);

  setTourPath(path);
  setTourIndex(0);
  setIsTourActive(true);
  setVisited(new Set([path[0]]));
  setTourExpanded(new Set());

  await goToNodeInTour(path[0]);
};



const nextTourStep = async () => {
  if (tourIndex + 1 >= tourPath.length) return;
  const newIndex = tourIndex + 1;
  const nodeId = tourPath[newIndex];

  setTourIndex(newIndex);
  setVisited(new Set(tourPath.slice(0, newIndex + 1)));

  await goToNodeInTour(nodeId);
  setOpenRight(true);
};


  const prevTourStep = async () => {
    if (tourIndex - 1 < 0) return;

    const newIndex = tourIndex - 1;
    const nodeId = tourPath[newIndex];

    // recompute visited
    const newVisited = new Set(tourPath.slice(0, newIndex + 1));
    setVisited(newVisited);
    setTourIndex(newIndex);

    // 🔥 COLLAPSE nodes that should no longer be expanded
    const allNodes = await getAllNodes();
    const shouldBeExpanded =
      computeExpandedFromVisited(tourPath, newIndex, allNodes);

    for (const expandedId of tourExpanded) {
      if (!shouldBeExpanded.has(expandedId)) {
        await toggleExpand(expandedId); // collapse
      }
    }

    setTourExpanded(shouldBeExpanded);

    await goToNodeInTour(nodeId);
    setOpenRight(true);
  };

  

  // reset the graph from tour

  const resetGraphToNormal = useCallback(async () => {
    // reset tour state
    setIsTourActive(false);
    setTourIndex(0);
    setTourPath([]);
    setVisited(new Set());
    setSelectedNode(null);
    setOpenRight(false);
    setTourExpanded(new Set());


    // 🔽 FETCH DEFAULT GRAPH FROM API
    const defaultGraph = await fetchDefaultGraph();

    const normalNodes = defaultGraph.nodes.map(n => ({
      ...n,
      initialVisible: true
    }));

    const normalEdges = defaultGraph.edges;

    const { nodes: layoutedNodes, edges: styledEdges } =
      await getElkLayout(normalNodes, normalEdges, toggleExpand);

    setNodes(layoutedNodes);
    setEdges(styledEdges);

    // refit view
    setTimeout(() => {
      rf.fitView({ padding: 0.3, duration: 500 });
    }, 50);
  }, [rf, toggleExpand]);




  /* ---------------------------------------------------------
      RENDER
  --------------------------------------------------------- */
  return (
    <div className="wrapper">

      {/* Top Buttons */}
      <div className="top-nav-buttons nav-buttons">
        <button onClick={() => setCodeTourePopupOpen(true)}>Code tour</button>
        &nbsp;&nbsp;
        <button onClick={handleExpandAll}>Expand All</button>
        &nbsp;&nbsp;
        <button onClick={handleCollapseAll}>Collapse All</button>
      </div>

      {/* ReactFlow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeClick={handleEdgeClick}
        elementsSelectable={false}
        fitView
      >
        <Background color="#e0e0e0" gap={20} size={1} />
      </ReactFlow>

      {/* Bottom Navigation */}
      <div className="bottom-nav-buttons nav-buttons">
        <NodeNav
          isActive={isTourActive}
          current={tourIndex + 1}
          total={tourPath.length}
          onNext={nextTourStep}
          onPrev={prevTourStep}
          onClose={resetGraphToNormal}
          selectedNode={selectedNode}
        />
      </div>

      {/* Tour Popup */}
      <PortalPopup
        isOpen={isCodeTourePopupOpen}
        onClose={() => setCodeTourePopupOpen(false)}
        width="80%"
        side="center"
        title="Code Tour Overview"
      >
        <CodeTour
          onStartTour={(rootId) => {
            startTour(rootId);
            setCodeTourePopupOpen(false);
          }}
        />
      </PortalPopup>

      {/* Right Side Node Popup */}
      <PortalPopup
        isOpen={openRight}
        onClose={() => setOpenRight(false)}
        title={selectedNode?.data?.label}
        width="350px"
        maxHeight="90vh"
        side="right"
        isOuterClickClose={true}
      >
     
        <DemoContent content="" nodeId={selectedNode?.id} />
      </PortalPopup>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <ExpandAndCollapse />
  </ReactFlowProvider>
);
