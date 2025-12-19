import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import "./CustomNode.css"; // ← import CSS
import PortalPopup from "../Portal/PortalPopup";
import DemoContent from "../Portal/DemoContent";

export default function CustomNode(props) {
  const { id, data } = props;
  const { label } = data;

  const [openRight, setOpenRight] = useState(false);

  const glow = data.isGlowing;

  const glowColor = data.initialVisible
    ? "rgba(92, 107, 192, 0.7)"   
    : "rgba(251, 191, 36, 0.7)";  


  return (
    <>
      <div className="custom-node" 
        onClick={() => setOpenRight(true)}
        style={{
          boxShadow: glow ? `0 0 25px 10px ${glowColor}` : "none",
          transition: "box-shadow 0.3s ease"
        }}
      >
        <div className="custom-node-content">{label}</div>

        {/* Expand / collapse button */}
        {data?.hasChildren && (
          <div
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              data.toggleExpand();
            }}
          >
            {data?.isExpanded ? "−" : "+"}
          </div>
        )}

        {/* Handles */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="custom-handle"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="custom-handle"
        />
      </div>

     <PortalPopup
        isOpen={openRight}
        onClose={() => setOpenRight(false)}
        width="350px"
        side="right"
        title={label}
      >
         <DemoContent content="this is content" nodeId={id} />
      </PortalPopup>
    </>
  );
}
