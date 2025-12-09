import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./PortalPopup.css";

const PortalPopup = ({
  isOpen,
  onClose,
  width = "400px",
  maxHeight = "90vh",
  side = "center", // "right" | "center"
  title = "Sherlocks.ai",
  children,
  isOuterClickClose = false
}) => {
  

  // Disable body scroll when popup open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={`${!isOuterClickClose && 'portal-overlay'}`} onClick={!isOuterClickClose && onClose}>
      <div
        className={`portal-container ${side}`}
        style={{ width, height: 'fit-content', maxHeight}}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="portal-header">
          <span>{title}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="portal-content">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default PortalPopup;
