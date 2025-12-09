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
  { id: "vpc-1", label: "Production VPC", parent: null, isAlwaysVisible: true, hasChildren: true },

  { id: "subnet-1", label: "Public Subnet 1A", parent: "vpc-1", hasChildren: true },
  { id: "subnet-2", label: "Private Subnet 1A", parent: "vpc-1", hasChildren: true },
  { id: "subnet-3", label: "Public Subnet 1B", parent: "vpc-1", hasChildren: true },
  { id: "subnet-4", label: "Private Subnet 1B", parent: "vpc-1", hasChildren: true },
  { id: "subnet-5", label: "Database Subnet 1A", parent: "vpc-1", hasChildren: true },
  { id: "subnet-6", label: "Database Subnet 1B", parent: "vpc-1", hasChildren: true },

  { id: "igw-1", label: "Internet Gateway", parent: "vpc-1", hasChildren: false },

  { id: "lb-1", label: "Application Load Balancer", parent: "subnet-1", hasChildren: true },
  { id: "lb-2", label: "Internal Load Balancer", parent: "subnet-2", hasChildren: true },

  { id: "ec2-1", label: "Web Server 1", parent: "subnet-2", hasChildren: true },
  { id: "ec2-2", label: "Web Server 2", parent: "subnet-2", hasChildren: true },
  { id: "ec2-3", label: "Web Server 3", parent: "subnet-4", hasChildren: true },
  { id: "ec2-4", label: "App Server 1", parent: "subnet-2", hasChildren: false },
  { id: "ec2-5", label: "App Server 2", parent: "subnet-4", hasChildren: false },
  { id: "ec2-6", label: "Worker Server 1", parent: "subnet-2", hasChildren: false },
  { id: "ec2-7", label: "Worker Server 2", parent: "subnet-4", hasChildren: false },
  { id: "ec2-8", label: "Bastion Host", parent: "subnet-1", hasChildren: false },

  { id: "nat-1", label: "NAT Gateway 1A", parent: "subnet-1", hasChildren: false },
  { id: "nat-2", label: "NAT Gateway 1B", parent: "subnet-3", hasChildren: false },

  { id: "rds-1", label: "Primary Database", parent: "subnet-5", hasChildren: true },
  { id: "rds-2", label: "Read Replica", parent: "subnet-6", hasChildren: false },

  { id: "cache-1", label: "Redis Cache", parent: "subnet-5", hasChildren: false },

  { id: "s3-1", label: "Assets Bucket", parent: "ec2-1", hasChildren: true },
  { id: "s3-2", label: "Backups Bucket", parent: "rds-1", hasChildren: false },
  { id: "s3-3", label: "Logs Bucket", parent: "lb-1", hasChildren: false },

  { id: "sqs-1", label: "Job Queue", parent: "ec2-6", hasChildren: false },
  { id: "sns-1", label: "Alerts Topic", parent: "ec2-6", hasChildren: false },

  { id: "lambda-1", label: "Image Processor", parent: "s3-1", hasChildren: true },

  { id: "cloudfront-1", label: "CDN Distribution", parent: null, hasChildren: true }


  
];



/* ----------------------------------------------------------------------
   FLAT EDGES
---------------------------------------------------------------------- */
const allEdges = [
  { id: "vpc-1-subnet-1", source: "vpc-1", target: "subnet-1", fixed: true },
  { id: "vpc-1-subnet-2", source: "vpc-1", target: "subnet-2", fixed: true },
  { id: "vpc-1-subnet-3", source: "vpc-1", target: "subnet-3", fixed: true },
  { id: "vpc-1-subnet-4", source: "vpc-1", target: "subnet-4", fixed: true },
  { id: "vpc-1-subnet-5", source: "vpc-1", target: "subnet-5", fixed: true },
  { id: "vpc-1-subnet-6", source: "vpc-1", target: "subnet-6", fixed: true },
  { id: "vpc-1-igw-1", source: "vpc-1", target: "igw-1" },

  { id: "subnet-1-lb-1", source: "subnet-1", target: "lb-1" },
  { id: "subnet-1-ec2-8", source: "subnet-1", target: "ec2-8" },
  { id: "subnet-1-nat-1", source: "subnet-1", target: "nat-1" },

  { id: "subnet-2-ec2-1", source: "subnet-2", target: "ec2-1" },
  { id: "subnet-2-ec2-2", source: "subnet-2", target: "ec2-2" },
  { id: "subnet-2-ec2-4", source: "subnet-2", target: "ec2-4" },
  { id: "subnet-2-ec2-6", source: "subnet-2", target: "ec2-6" },
  { id: "subnet-2-lb-2", source: "subnet-2", target: "lb-2" },

  { id: "subnet-3-lb-1", source: "subnet-3", target: "lb-1" },
  { id: "subnet-3-nat-2", source: "subnet-3", target: "nat-2" },

  { id: "subnet-4-ec2-3", source: "subnet-4", target: "ec2-3" },
  { id: "subnet-4-ec2-5", source: "subnet-4", target: "ec2-5" },
  { id: "subnet-4-ec2-7", source: "subnet-4", target: "ec2-7" },
  { id: "subnet-4-lb-2", source: "subnet-4", target: "lb-2" },

  { id: "subnet-5-rds-1", source: "subnet-5", target: "rds-1" },
  { id: "subnet-5-cache-1", source: "subnet-5", target: "cache-1" },

  { id: "subnet-6-rds-2", source: "subnet-6", target: "rds-2" },
  { id: "subnet-6-cache-1", source: "subnet-6", target: "cache-1" },

  { id: "lb-1-ec2-1", source: "lb-1", target: "ec2-1" },
  { id: "lb-1-ec2-2", source: "lb-1", target: "ec2-2" },
  { id: "lb-1-ec2-3", source: "lb-1", target: "ec2-3" },
  { id: "lb-1-s3-3", source: "lb-1", target: "s3-3" },

  { id: "lb-2-ec2-4", source: "lb-2", target: "ec2-4" },
  { id: "lb-2-ec2-5", source: "lb-2", target: "ec2-5" },
  { id: "lb-2-s3-3", source: "lb-2", target: "s3-3" },

  { id: "ec2-1-cache-1", source: "ec2-1", target: "cache-1" },
  { id: "ec2-1-s3-1", source: "ec2-1", target: "s3-1" },

  { id: "ec2-2-cache-1", source: "ec2-2", target: "cache-1" },
  { id: "ec2-2-s3-1", source: "ec2-2", target: "s3-1" },

  { id: "ec2-3-cache-1", source: "ec2-3", target: "cache-1" },
  { id: "ec2-3-s3-1", source: "ec2-3", target: "s3-1" },

  { id: "ec2-4-rds-1", source: "ec2-4", target: "rds-1" },
  { id: "ec2-4-cache-1", source: "ec2-4", target: "cache-1" },
  { id: "ec2-4-sqs-1", source: "ec2-4", target: "sqs-1" },

  { id: "ec2-5-rds-2", source: "ec2-5", target: "rds-2" },
  { id: "ec2-5-cache-1", source: "ec2-5", target: "cache-1" },
  { id: "ec2-5-sqs-1", source: "ec2-5", target: "sqs-1" },

  { id: "ec2-6-rds-1", source: "ec2-6", target: "rds-1" },
  { id: "ec2-6-s3-1", source: "ec2-6", target: "s3-1" },
  { id: "ec2-6-sqs-1", source: "ec2-6", target: "sqs-1" },
  { id: "ec2-6-sns-1", source: "ec2-6", target: "sns-1" },

  { id: "ec2-7-rds-1", source: "ec2-7", target: "rds-1" },
  { id: "ec2-7-s3-1", source: "ec2-7", target: "s3-1" },
  { id: "ec2-7-sqs-1", source: "ec2-7", target: "sqs-1" },
  { id: "ec2-7-sns-1", source: "ec2-7", target: "sns-1" },

  { id: "rds-1-rds-2", source: "rds-1", target: "rds-2" },
  { id: "rds-1-s3-2", source: "rds-1", target: "s3-2" },

  { id: "s3-1-lambda-1", source: "s3-1", target: "lambda-1" },
  { id: "lambda-1-s3-1", source: "lambda-1", target: "s3-1" },
  { id: "lambda-1-sns-1", source: "lambda-1", target: "sns-1" },

  { id: "cloudfront-1-s3-1", source: "cloudfront-1", target: "s3-1" },
  { id: "cloudfront-1-lb-1", source: "cloudfront-1", target: "lb-1" }
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
