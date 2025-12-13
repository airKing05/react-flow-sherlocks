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

const elk = new ELK();

/* ---------------------------------------------------------
      NEW DATA (REPLACES allNodes + allEdges)
--------------------------------------------------------- */
const defaultData = {
  nodes: [
    { id: "0", label: "0", parent: null, isAlwaysVisible: true, hasChildren: false },
    { id: "1", label: "a", parent: "0", isAlwaysVisible: true, hasChildren: true },
    { id: "30", label: "30", parent: "1", isAlwaysVisible: true, hasChildren: false },
    { id: "31", label: "31", parent: "1", isAlwaysVisible: true, hasChildren: true },
    { id: "311", label: "311", parent: "31", isAlwaysVisible: true, hasChildren: false },
    { id: "312", label: "312", parent: "31", isAlwaysVisible: true, hasChildren: false }
  ],
  edges: [
    { id: "0-1", source: "0", target: "1", fixed: true },
    { id: "1-30", source: "1", target: "30", fixed: true },
    { id: "1-31", source: "1", target: "31", fixed: true },
    { id: "31-311", source: "31", target: "311", fixed: true },
    { id: "31-312", source: "31", target: "312", fixed: true },
    { id: "30-312", source: "30", target: "312", fixed: true }
  ]
};

const childrens = {
  "1": {
    nodes: [
      { id: "2", label: "b", parent: "1", hasChildren: true },
      { id: "5", label: "e", parent: "1", hasChildren: true },
      { id: "8", label: "h", parent: "1", hasChildren: true },
      { id: "11", label: "l", parent: "1", hasChildren: false }
    ],
    edges: [
      { id: "1-2", source: "1", target: "2" },
      { id: "1-5", source: "1", target: "5" },
      { id: "1-8", source: "1", target: "8" },
      { id: "1-11", source: "1", target: "11" }
    ]
  },
  "2": {
    nodes: [
      { id: "3", label: "c", parent: "2", hasChildren: true }
    ],
    edges: [
      { id: "2-3", source: "2", target: "3" }
    ]
  },
  "3": {
    nodes: [
      { id: "4", label: "d", parent: "3", hasChildren: false }
    ],
    edges: [
      { id: "3-4", source: "3", target: "4" }
    ]
  },
  "4": { nodes: [], edges: [] },
  "5": {
    nodes: [{ id: "6", label: "f", parent: "5", hasChildren: true }],
    edges: [{ id: "5-6", source: "5", target: "6" }]
  },
  "6": {
    nodes: [{ id: "7", label: "g", parent: "6", hasChildren: false }],
    edges: [{ id: "6-7", source: "6", target: "7" }]
  },
  "7": { nodes: [], edges: [] },
  "8": {
    nodes: [
      { id: "9", label: "i", parent: "8", hasChildren: true },
      { id: "12", label: "k", parent: "8", hasChildren: false }
    ],
    edges: [
      { id: "8-9", source: "8", target: "9" },
      { id: "8-12", source: "8", target: "12" }
    ]
  },
  "9": {
    nodes: [{ id: "10", label: "j", parent: "9", hasChildren: false }],
    edges: [{ id: "9-10", source: "9", target: "10" }]
  },
  "10": { nodes: [], edges: [] },
  "11": { nodes: [], edges: [] },
  "30": { nodes: [], edges: [] },
  "31": {
    nodes: [
      { id: "313", label: "313", parent: "31", hasChildren: false },
      { id: "314", label: "314", parent: "31", hasChildren: false }
    ],
    edges: [
      { id: "31-313", source: "31", target: "313" },
      { id: "31-314", source: "31", target: "314" }
    ]
  },
  "313": { nodes: [], edges: [] },
  "314": { nodes: [], edges: [] },
  "311": { nodes: [], edges: [] },
  "312": { nodes: [], edges: [] }
};

/* ---------------------------------------------------------
      HELPERS FOR NEW DATA STRUCTURE
--------------------------------------------------------- */

// Fetch children of node
function getChildren(nodeId) {
  return childrens[nodeId]?.nodes || [];
}

// Fetch children edges
function getChildrenEdges(nodeId) {
  return childrens[nodeId]?.edges || [];
}

// Flatten all nodes (for CodeTour)
function getAllNodes() {
  const out = [...defaultData.nodes];
  Object.values(childrens).forEach(c => out.push(...c.nodes));
  return out;
}

// Flatten all edges (for expand-all)
function getAllEdges() {
  const out = [...defaultData.edges];
  Object.values(childrens).forEach(c => out.push(...c.edges));
  return out;
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
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const [isCodeTourePopupOpen, setCodeTourePopupOpen] = useState(false);

  const [isTourActive, setIsTourActive] = useState(false);
  const [tourPath, setTourPath] = useState([]);
  const [tourIndex, setTourIndex] = useState(0);

  const [selectedNode, setSelectedNode] = useState(null);
  const [openRight, setOpenRight] = useState(false);
  const [visited, setVisited] = useState(new Set());

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

      const allChildren = getChildren(nodeId);
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
          ...getChildrenEdges(nodeId)
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
    const initialVisible = defaultData.nodes.map(n => ({
      ...n,
      initialVisible: true
    }));

    const initialEdges = defaultData.edges;

    (async () => {
      const { nodes: layouted, edges: styledEdges } =
        await getElkLayout(initialVisible, initialEdges, toggleExpand);

      setNodes(layouted);
      setEdges(styledEdges);
    })();
  }, []);

  /* ---------------------------------------------------------
      Expand All — UPDATED
  --------------------------------------------------------- */
  const handleExpandAll = async () => {
    const expandedNodes = getAllNodes().map(n => ({
      ...n,
      initialVisible: n.parent === null || n.isAlwaysVisible ? true : false
    }));

    const expandedEdges = getAllEdges();

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
    const collapsedNodes = defaultData.nodes.map(n => ({
      ...n,
      initialVisible: true
    }));

    const collapsedEdges = defaultData.edges;

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

      setSelectedNode(node);

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
  function buildTourPath(allNodes) {
    // group nodes by parent
    const childrenMap = {};
    const nodeMap = {};

    allNodes.forEach(n => {
      nodeMap[n.id] = n;
      if (!childrenMap[n.parent]) childrenMap[n.parent] = [];
      childrenMap[n.parent].push(n.id);
    });

    // stable ordering
    Object.values(childrenMap).forEach(list => list.sort());

    const path = [];

    function dfs(nodeId) {
      path.push(nodeId);

      const children = childrenMap[nodeId] || [];

      // 🔥 PRIORITY SORT
      // 1️⃣ hidden children first
      // 2️⃣ nodes with children before leaf nodes
      // 3️⃣ alwaysVisible children last
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

    // roots (parent === null)
    const roots = childrenMap[null] || [];
    roots.forEach(r => dfs(r));

    return path;
  }


  async function goToNodeInTour(nodeId) {
    // 🔒 Derive everything from tourPath + nodeId (NO visited state)
    const currentIndex = tourPath.indexOf(nodeId);
    const visitedSet = new Set(tourPath.slice(0, currentIndex + 1));

    // Ensure required nodes are expanded
    await toggleExpand(nodeId);
    await new Promise(res => setTimeout(res, 30));

    // ---------- NODES ----------
    setNodes(ns =>
      ns.map(n => {
        const isCurrent = n.id === nodeId;
        const isVisited = visitedSet.has(n.id);

        return {
          ...n,
          data: {
            ...n.data,
            isGlowing: isCurrent
          },
          style: {
            ...n.style,
            opacity: isCurrent ? 1 : isVisited ? 1 : 0.2,
            border: isCurrent
              ? (n.isAlwaysVisible
                  ? "3px solid #5C6BC0"
                  : "3px solid #FBBF24")
              : n.style.border
          }
        };
      })
    );

    // ---------- EDGES ----------
    setEdges(prevEdges =>
      prevEdges.map(e => {
        const sourceVisited = visitedSet.has(e.source);
        const targetVisited = visitedSet.has(e.target);

        const isVisible = sourceVisited && targetVisited;

        return {
          ...e,
          style: {
            ...e.style,
            opacity: isVisible ? 1 : 0.2
          },
          labelStyle: {
            ...e.labelStyle,
            opacity: isVisible ? 1 : 0.2
          },
          labelBgStyle: {
            // Make background match the edge visibility
            fill: isVisible ? "#fff" : "#fff", // you can also use a dimmed color like "#f0f0f0"
            opacity: isVisible ? 1 : 0.2
          },
          markerEnd: e.markerEnd
            ? { ...e.markerEnd, color: isVisible ? "#46AE6F" : "#999" }
            : undefined
        };
      })
    );


    // Remove glow after animation
    setTimeout(() => {
      setNodes(ns =>
        ns.map(n =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, isGlowing: false } }
            : n
        )
      );
    }, 1000);

    // Center view
    const node = rf.getNode(nodeId);
    if (node) {
      rf.setCenter(
        node.position.x + 100,
        node.position.y + 30,
        { zoom: 1.4, duration: 600 }
      );
      setSelectedNode(node);
    }
  }

  const startTour = async () => {
    const all = getAllNodes();
    const root = all.find(n => n.parent === null)?.id;
    const path = buildTourPath(all, root);

    setTourPath(path);
    setTourIndex(0);
    setIsTourActive(true);

    setVisited(new Set([path[0]]));

    setNodes(ns => ns.map(n => ({ ...n, style: { ...n.style, opacity: 0.2 } })));
    setEdges(es => es.map(e => ({ ...e, style: { ...e.style, opacity: 0.2 } })));

    await goToNodeInTour(path[0]);
  };

  function computeVisited(path, index) {
    return new Set(path.slice(0, index + 1));
  }

  const nextTourStep = () => {
    setTourIndex(i => {
      if (i + 1 >= tourPath.length) return i;

      const newIndex = i + 1;
      const nodeId = tourPath[newIndex];

      setVisited(computeVisited(tourPath, newIndex));
      setTimeout(() => goToNodeInTour(nodeId), 0);

      return newIndex;
    });

    setOpenRight(true);
  };

  const prevTourStep = () => {
    setTourIndex(i => {
      if (i - 1 < 0) return i;

      const newIndex = i - 1;
      const nodeId = tourPath[newIndex];

      setVisited(computeVisited(tourPath, newIndex));
      setTimeout(() => goToNodeInTour(nodeId), 0);

      return newIndex;
    });

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

  // restore default visible structure
  const normalNodes = defaultData.nodes.map(n => ({
    ...n,
    initialVisible: true
  }));

  const normalEdges = defaultData.edges;

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
          onStartTour={() => {
            startTour();
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
        <DemoContent content="" />
      </PortalPopup>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <ExpandAndCollapse />
  </ReactFlowProvider>
);
