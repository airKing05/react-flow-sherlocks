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

/* ----------------------------------------------------------------------
   FLAT NODES
---------------------------------------------------------------------- */
const allNodes = [
  { id: "1",   label: "a",  parent: null, isAlwaysVisible: true, hasChildren: true },

  { id: "2",   label: "b",  parent: "1", hasChildren: true },
  { id: "3",   label: "c",  parent: "2", hasChildren: true },
  { id: "4",   label: "d",  parent: "3", hasChildren: false },

  { id: "5",   label: "e",  parent: "1", hasChildren: true },
  { id: "6",   label: "f",  parent: "5", hasChildren: true },
  { id: "7",   label: "g",  parent: "6", hasChildren: false },

  { id: "8",   label: "h",  parent: "1", hasChildren: true },
  { id: "9",   label: "i",  parent: "8", hasChildren: true },
  { id: "10",  label: "j",  parent: "9", hasChildren: false },
  { id: "12",  label: "k",  parent: "8", hasChildren: false },

  { id: "11",  label: "l",  parent: "1", hasChildren: false },

  { id: "30",  label: "30", parent: "1", isAlwaysVisible: true, hasChildren: false },
  { id: "31",  label: "31", parent: "1", isAlwaysVisible: true, hasChildren: true },

  { id: "311", label: "311", parent: "31", isAlwaysVisible: true, hasChildren: false },
  { id: "312", label: "312", parent: "31", isAlwaysVisible: true, hasChildren: false },

  { id: "313", label: "313", parent: "31", hasChildren: false },
  { id: "314", label: "314", parent: "31", hasChildren: false },
];


/* ----------------------------------------------------------------------
   FLAT EDGES
---------------------------------------------------------------------- */
const allEdges = [
  { id: "1-30", source: "1", target: "30", fixed: true },
  { id: "1-31", source: "1", target: "31", fixed: true },

  { id: "31-311", source: "31", target: "311", fixed: true },
  { id: "31-312", source: "31", target: "312", fixed: true },

  { id: "1-2", source: "1", target: "2" },
  { id: "1-5", source: "1", target: "5" },
  { id: "1-8", source: "1", target: "8" },
  { id: "1-11", source: "1", target: "11" },

  { id: "30-312", source: "30", target: "312", fixed: true },

  { id: "2-3", source: "2", target: "3" },
  { id: "3-4", source: "3", target: "4" },

  { id: "5-6", source: "5", target: "6" },
  { id: "6-7", source: "6", target: "7" },

  { id: "8-9", source: "8", target: "9" },
  { id: "9-10", source: "9", target: "10" },
  { id: "8-12", source: "8", target: "12" },

  { id: "31-313", source: "31", target: "313" },
  { id: "31-314", source: "31", target: "314" },
];


// isExpanded node 
function computeIsExpanded(nodeId, currentNodes) {
  const children = allNodes.filter(n => n.parent === nodeId);
  const visibleChildren = currentNodes.filter(n => n.parent === nodeId);

  return visibleChildren.length === children.length && children.length > 0;
}

/* ----------------------------------------------------------------------
   ELK LAYOUT
---------------------------------------------------------------------- */
async function getElkLayout(nodes, edges, toggleExpand) {
  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.direction": "DOWN",
      "elk.algorithm": "layered",
      "elk.spacing.nodeNode": "20",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX"
    },
    children: nodes.map(node => ({
      id: node.id,
      width: 200,
      height: 60
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],  // ELK needs these
      targets: [edge.target],
      source: edge.source,      // ReactFlow needs these
      target: edge.target
    }))
  };

  const layout = await elk.layout(elkGraph);

  // ------------------------------------
  // EDGE STYLING
  // ------------------------------------
  const styledEdges = edges.map(edge => {
    const targetNode = nodes.find(n => n.id === edge.target);

    const isVisibleTarget = targetNode?.initialVisible;

    const color = isVisibleTarget
      ? "blue"                 // visible edge color
      : "#46AE6F";   // hidden/expanded edge color
            // solid expanded edges

    const strokeDasharray = isVisibleTarget
      ? "6 4"
      : "0";

    return {
      ...edge,
      label: `${edge.source} → ${edge.target}`,
      labelStyle: {
        fill: color,
        fontWeight: "bold",
          opacity: targetNode?.initialVisible ? 1 : 0.5
      },
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
      }
    };
  });

  // ------------------------------------
  // NODE STYLING (BASE STYLE ONLY)
  // ------------------------------------
  console.log("nodes-----", nodes)
  return {
    nodes: nodes.map(node => {
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
          parent: node.parent,
          isAlwaysVisible: node.isAlwaysVisible,
          initialVisible: node.initialVisible,
          toggleExpand: () => toggleExpand(node.id), 
          isGlowing: node.data?.isGlowing ?? false,  
          isExpanded: computeIsExpanded(node.id, nodes),
          hasChildren: node?.hasChildren, 
        }
      };
    }),

    edges: styledEdges
  };
}


/* ----------------------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------------------- */
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


  const rf = useReactFlow();


  async function waitForReactFlowToStabilize() {
  // ReactFlow needs TWO frames after setNodes()
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(r));
}

  /* -------------------------------------------
    SAME LOGIC AS BEFORE — DO NOT CHANGE
  -------------------------------------------- */
const handleNodeClick = useCallback(
  async (_, node) => {

    const nodeId = node.id;

    // ⭐ Always use ReactFlow internal state
    const currentNodes = rf.getNodes();
    const currentEdges = rf.getEdges();

    // -----------------------------------------
    // FIND CHILDREN
    // -----------------------------------------
    const visibleChildren = currentNodes.filter(n => n.data.parent === nodeId);
    const allChildren = allNodes.filter(n => n.parent === nodeId);

    console.log("nodeId:", nodeId, currentNodes, visibleChildren, allChildren);

    // ============================================================
    // EXPAND
    // ============================================================
    if (visibleChildren.length !== allChildren.length) {

      // Missing children
      const missing = allChildren
        .filter(c => !currentNodes.find(n => n.id === c.id))
        .map(c => ({ ...c, initialVisible: false }));

      // New nodes = old + missing ones
      const newNodes = [...currentNodes, ...missing];

      // New edges = old + edges pointing to newly added nodes
      const newEdges = [
        ...currentEdges,
        ...allEdges.filter(edge =>
          missing.find(m => m.id === edge.target)
        )
      ];

      // Run ELK layout
      const { nodes: layouted, edges: styledEdges } =
        await getElkLayout(newNodes, newEdges, toggleExpand);

      setNodes(layouted);
      setEdges(styledEdges);

      // Center clicked node after layout
      // ⭐ WAIT for ReactFlow to render new nodes + measure them
      await waitForReactFlowToStabilize();

      // Now get the actual rendered node with correct x/y
      const updatedNode = rf.getNode(nodeId);

      if (updatedNode) {
        rf.setCenter(
          updatedNode.position.x + (updatedNode.width || 200) / 2,
          updatedNode.position.y + (updatedNode.height || 60) / 2,
          {
            zoom: 1.2,
            duration: 500
          }
        );
      }


      return;
    }

    // ============================================================
    // COLLAPSE
    // ============================================================
    const filteredNodes = currentNodes.filter(
      n => n.parent !== nodeId || n.data.isAlwaysVisible
    );

    const filteredEdges = currentEdges.filter(
      e => e.fixed || e.source !== nodeId
    );

    const { nodes: layouted2, edges: styledEdges2 } =
      await getElkLayout(filteredNodes, filteredEdges, toggleExpand);

    setNodes(layouted2);
    setEdges(styledEdges2);

    // Center node after collapse
    // ⭐ WAIT for ReactFlow to render new nodes + measure them
    await waitForReactFlowToStabilize();

    // Now get the actual rendered node with correct x/y
    const updatedNode = rf.getNode(nodeId);

    if (updatedNode) {
      rf.setCenter(
        updatedNode.position.x + (updatedNode.width || 200) / 2,
        updatedNode.position.y + (updatedNode.height || 60) / 2,
        {
          zoom: 1.2,
          duration: 500
        }
      );
    }



  },

  // dependencies
  [rf, allNodes, allEdges, getElkLayout]
);

  /* -------------------------------------------
    NEW FUNCTION → used by CustomNode +/-
  -------------------------------------------- */
 const toggleExpand = useCallback(
  (nodeId) => {
    // const node = nodes.find(n => n.id === nodeId);
    const node = rf.getNode(nodeId); 
    console.log("node---",nodeId, node, nodes)
    if (!node) return;
    handleNodeClick(null, node);
  },
  [rf, handleNodeClick]
);

  /* -------------------------------------------
    INITIAL VISIBLES
  -------------------------------------------- */
  useEffect(() => {
    const initialVisible = allNodes
      .filter(n => n.parent === null || n.isAlwaysVisible)
      .map(n => ({ ...n, initialVisible: true }));

    const initialEdges = allEdges.filter(
      e =>
        initialVisible.find(n => n.id === e.source) &&
        initialVisible.find(n => n.id === e.target)
    );

    (async () => {
      const { nodes: layouted, edges: styledEdges } = await getElkLayout(
        initialVisible,
        initialEdges,
        toggleExpand
      );

       console.log("styledEdges---+++", styledEdges)


      setNodes(layouted);
      setEdges(styledEdges);
    })();
  }, []);


  /* -------------------------------------------
    all the nodes will be visible 
  -------------------------------------------- */
const handleExpandAll = async () => {
  // 1) Make all nodes visible, with correct child coloring
  const expandedNodes = allNodes.map(n => ({
    ...n,
    initialVisible: n.parent === null || n.isAlwaysVisible ? true : false
  }));

  // 2) All raw edges
  const expandedEdges = [...allEdges];

  // 3) Run layout (returns styledEdges but we DO NOT USE them)
  const { nodes: layoutedNodes, edges: styledEdges } =
    await getElkLayout(expandedNodes, expandedEdges, toggleExpand);

  // 4) Update ReactFlow in the SAME WAY as manual expand
  setNodes(layoutedNodes);
  setEdges(styledEdges);  // ← IMPORTANT FIX

  // ⭐ Fit view AFTER render
  setTimeout(() => {
    rf.fitView({ padding: 0.3, duration: 600 });
  }, 50);
};

 /* -------------------------------------------
    children will be hided
  -------------------------------------------- */
const handleCollapseAll = async () => {
  // 1) Only keep root nodes and always-visible nodes
  const collapsedNodes = allNodes
    .filter(n => n.parent === null || n.isAlwaysVisible)
    .map(n => ({
      ...n,
      initialVisible: true   // visible nodes keep visible color
    }));

  // 2) Only keep edges connecting visible nodes
  const collapsedEdges = allEdges.filter(e =>
    collapsedNodes.find(n => n.id === e.source) &&
    collapsedNodes.find(n => n.id === e.target)
  );

  // 3) Re-run layout
  const { nodes: layoutedNodes, edges: styledEdges } =
    await getElkLayout(collapsedNodes, collapsedEdges, toggleExpand);

  // 4) Update state
  setNodes(layoutedNodes);
  setEdges(styledEdges);

  // ⭐ Fit view AFTER render
   setTimeout(() => {
    rf.fitView({ padding: 0.3, duration: 600 });
  }, 50);
};

 /* -------------------------------------------
    Box shadow/ glow to selected node by edge click
  -------------------------------------------- */
const focusNode = useCallback(
  (nodeId) => {
    const node = rf.getNode(nodeId);
    if (!node) return;

    setSelectedNode(node);
    rf.setCenter(
      node.position.x + (node.width || 200) / 2,
      node.position.y + (node.height || 60) / 2,
      {
        zoom: 1.8,
        duration: 800,
        easing: 'easeInOutCubic'
      }
    );
  },
  [rf]
);

const handleEdgeClick = useCallback((event, edge) => {
  event.preventDefault();
  event.stopPropagation();

  const nodeId = edge.target;

  // Turn glow ON for target node
  setNodes(ns =>
    ns.map(n =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, isGlowing: true } }
        : n
    )
  );

  // Turn glow OFF after 1 second
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
}, [focusNode]);

 /* -------------------------------------------
   Code tour
  -------------------------------------------- */

function buildTourPath(allNodes, rootId) {
  const map = {};
  allNodes.forEach(n => {
    if (!map[n.parent]) map[n.parent] = [];
    map[n.parent].push(n.id);
  });

  const path = [];

  // DFS-like traversal but special rule: alwaysVisible nodes included early
  function walk(id) {
    path.push(id);

    const children = map[id] || [];
    children.forEach(child => walk(child));
  }

  walk(rootId);

  // AFTER root subtree, append top-level alwaysVisible nodes:
  const topAlways = allNodes
    .filter(n => n.parent === null && n.isAlwaysVisible && n.id !== rootId);

  topAlways.forEach(n => walk(n.id));

  return path;
}

async function goToNodeInTour(nodeId) {
  // expand/collapse first
  await toggleExpand(nodeId);

  // wait for ELK layout to finish
  await new Promise(res => setTimeout(res, 30));

  // 🟦 mark this node as visited
  // setVisited(v => new Set([...v, nodeId]));

  // -----------------------------
  // UPDATE NODES
  // -----------------------------
  setNodes(ns =>
    ns.map(n => {
      const isCurrent = n.id === nodeId;
      const isVisited = visited.has(n.id) || isCurrent;

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
            ? "3px solid gold"
            : n.style.border
        }
      };
    })
  );

  // -----------------------------
  // UPDATE EDGES
  // -----------------------------
  setEdges(es =>
    es.map(e => {
      const isCurrentEdge =
        e.source === nodeId || e.target === nodeId;

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

  // glow off for current node after 1 second
  setTimeout(() => {
    setNodes(ns =>
      ns.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isGlowing: false } }
          : n
      )
    );
  }, 1000);

  // center current node
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
  const root = allNodes.find(n => n.parent === null)?.id;
  const path = buildTourPath(allNodes, root);

  setTourPath(path);
  setTourIndex(0);
  setIsTourActive(true);

  // mark first node as visited right now (IMPORTANT!)
  setVisited(new Set([path[0]]));

  // dim everything
  setNodes(ns => ns.map(n => ({ ...n, style: { ...n.style, opacity: 0.2 } })));
  setEdges(es => es.map(e => ({ ...e, style: { ...e.style, opacity: 0.2 } })));

  // go to first node
  await goToNodeInTour(path[0]);
};

const nextTourStep = () => {
  setTourIndex(i => {
    if (i + 1 >= tourPath.length) return i;

    const newIndex = i + 1;
    const nodeId = tourPath[newIndex];

    setVisited(v => new Set([...v, nodeId]));

    // wait for visited to update
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
      arr.pop();     // remove last visited node
      return new Set(arr);
    });

    setTimeout(() => goToNodeInTour(nodeId), 0);

    return newIndex;
  });

  setOpenRight(true);
};



  return (
    <div className="wrapper">
    <div
     className='top-nav-buttons nav-buttons'
    >
      <button 
        onClick={() => setCodeTourePopupOpen(true)}
      >Code tour</button>
      &nbsp;
      &nbsp;

      <button 
        onClick={handleExpandAll}
      >Expand All</button>
      &nbsp;
      &nbsp;

      <button 
        onClick={handleCollapseAll}
      >Collapse All</button>
    </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick} 
        elementsSelectable={false}
        fitView
      >
        <Background color="#e0e0e0" gap={20} size={1} />
      </ReactFlow>

      <div
        className='bottom-nav-buttons nav-buttons'
      >
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

    <PortalPopup
      isOpen={isCodeTourePopupOpen}
      onClose={() => setCodeTourePopupOpen(false)}
      width="80%"
      side="center"
      title="Code Tour Overview"
    >
      <CodeTour
        onStartTour={
          () => {
            startTour();
            setCodeTourePopupOpen(false);
          }
        }
      />  
    </PortalPopup>

    {
      console.log("this is ",openRight)
    }

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
