import React from "react";
import "./NodeNav.css";

const NodeNav = ({
  isActive,
  current,
  total,
  onNext,
  onPrev,
  onClose,
  selectedNode,
}) => {
  if (!isActive) return null;

  const isPrevDisabled = current <= 1;
  const isNextDisabled = current >= total;


  // if (current === 1) return;
  // if (current === total) return;


  return (
    <div className="capsule">
      <div className="container">
        <button
          className="icon-btn"
          onClick={onPrev}
          disabled={isPrevDisabled}
        >
          &#10094;
        </button>

        <div className="middle">
          <div className="badge">
            {current}/{total}
          </div>
          <div className="title">{selectedNode?.data?.label}</div>
        </div>

        <button
          className="icon-btn"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          &#10095;
        </button>
      </div>

      <button className="icon-btn close" onClick={onClose}>
        &#10005;
      </button>
    </div>
  );
};

export default NodeNav;
