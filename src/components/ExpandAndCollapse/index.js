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
    { id: "1", label: "a", parent: null, isAlwaysVisible: true, hasChildren: true },
    { id: "30", label: "30", parent: "1", isAlwaysVisible: true, hasChildren: false },
    { id: "31", label: "31", parent: "1", isAlwaysVisible: true, hasChildren: true },
    { id: "311", label: "311", parent: "31", isAlwaysVisible: true, hasChildren: false },
    { id: "312", label: "312", parent: "31", isAlwaysVisible: true, hasChildren: false }
  ],
  edges: [
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
  const styledEdges = edges.map(edge => {
    const targetNode = nodes.find(n => n.id === edge.target);
    const isVisibleTarget = targetNode?.initialVisible;
    const color = isVisibleTarget ? "blue" : "#46AE6F";

    return {
      ...edge,
      style: {
        stroke: color,
        strokeWidth: 3,
        strokeDasharray: isVisibleTarget ? "6 4" : "0"
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
        fontSize: 12,
        opacity: isVisibleTarget ? 1 : 0.5
      },
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
    await toggleExpand(nodeId);
    await new Promise(res => setTimeout(res, 30));

    setNodes(ns =>
      ns.map(n => {
        const isCurrent = n.id === nodeId;
        const isVisited = visited.has(n.id) || isCurrent;
        
        const border = isCurrent ? (n.isAlwaysVisible ? "3px solid #5C6BC0" : "3px solid #FBBF24") : n.style.border

        return {
          ...n,
          data: {
            ...n.data,
            isGlowing: isCurrent
          },
          style: {
            ...n.style,
            opacity: isCurrent ? 1 : isVisited ? 1 : 0.2,
            border: border
          }
        };
      })
    );

    setEdges(es =>
      es.map(e => {
        const isCurrentEdge = e.source === nodeId || e.target === nodeId;
        const isVisitedEdge =
          visited.has(e.source) && visited.has(e.target);

        return {
          ...e,
          style: {
            ...e.style,
            opacity: isCurrentEdge ? 1 : isVisitedEdge ? 1 : 0.2
          }
        };
      })
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

  const nextTourStep = () => {
    setTourIndex(i => {
      if (i + 1 >= tourPath.length) return i;
      const newIndex = i + 1;
      const nodeId = tourPath[newIndex];
      setVisited(v => new Set([...v, nodeId]));
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

      setVisited(v => {
        const arr = Array.from(v);
        arr.pop();
        return new Set(arr);
      });

      setTimeout(() => goToNodeInTour(nodeId), 0);
      return newIndex;
    });
    setOpenRight(true);
  };

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
          onClose={() => setIsTourActive(false)}
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
