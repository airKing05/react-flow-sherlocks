import React, { useState } from "react";
import "./DemoContent.css";

const DemoContent = ({ content }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const chips = [
    { label: "Dashboard", icon: "&#10148;" },
    { label: "Settings", icon: "&#10148;" },
    { label: "Analytics", icon: "&#10148;" },
    { label: "Profile", icon: "&#10148;" },
    { label: "Reports", icon: "&#10148;" }
  ];

  const explanationText = `
Type: Function
File: css-prune.js
Purpose: Locates the nearest ancestor AST node that represents either a standard HTML element (RegularElement) or a Svelte component (SvelteElement).
Traversal: Iterates backward through node.metadata.path, which is an array of ancestor AST nodes from the root down to the current node.
Condition: Checks the type property of each ancestor.
Return Value: Returns the first matching element ancestor found, or null if no such parent exists in the path.
Efficiency: Uses a while (i--) loop for efficient backward iteration.
  `;

  const isEmpty = (!content || content.trim() === "") && !showExplanation;

  return (
    <div className="demo-wrapper">

      {/* ---------- SHOW EXPLANATION WHEN CLICKED ---------- */}
      {showExplanation && (
        <div className="section">
          <h3 className="section-title">Explanation</h3>
          <pre className="explanation-pre">{explanationText}</pre>
        </div>
      )}

      {/* ---------- EMPTY STATE UI ---------- */}
      {!showExplanation && isEmpty && (
        <div className="empty-state-box">
          <h3 className="empty-title">Type: Function</h3>
          <p className="empty-file">File: css-prune.js</p>
          <p className="empty-description">No explanation generated yet.</p>
          <p className="empty-action-text">
            Click <strong>"Generate Explanation"</strong> to create one.
          </p>
        </div>
      )}

      {/* ---------- NORMAL CONTENT ---------- */}
      {!showExplanation && !isEmpty && (
        <>
          {/* ---------------- SECTION: DETAILS ---------------- */}
          <div className="section">
            <h3 className="section-title">Details</h3>

            <div className="message detail">
              ℹ️ <span>This is a detailed informational message with additional context.</span>
            </div>

            <p className="demo-text">
              Here you can place deeper descriptions, instructions or additional info for the user.
            </p>
          </div>

          {/* ---------------- SECTION: CHIPS ---------------- */}
          <div className="section">
            <h3 className="section-title">Chips</h3>

            <div className="chip-row">
              {chips.map((c, idx) => (
                <span key={idx} className="chip">
                  <span dangerouslySetInnerHTML={{ __html: c.icon }} />
                  &nbsp;{c.label}
                </span>
              ))}
            </div>
          </div>

          {/* ---------------- SECTION: ALERTS ---------------- */}
          <div className="section">
            <h3 className="section-title">Messages</h3>

            <div className="alert-box warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <div className="alert-title">Warning</div>
                <p className="alert-text">
                  Something might require your immediate attention.
                </p>
                <div className="alert-chips">
                  <span className="alert-chip">&#10148; Review</span>
                  <span className="alert-chip">&#10148; Check Logs</span>
                </div>
              </div>
            </div>

            <div className="alert-box error">
              <div className="alert-icon">❌</div>
              <div className="alert-content">
                <div className="alert-title">Error</div>
                <p className="alert-text">A critical process has failed. Try again.</p>
                <div className="alert-chips">
                  <span className="alert-chip">&#10148; Retry</span>
                  <span className="alert-chip">&#10148; Contact Support</span>
                </div>
              </div>
            </div>

            <div className="alert-box success">
              <div className="alert-icon">✅</div>
              <div className="alert-content">
                <div className="alert-title">Success</div>
                <p className="alert-text">Operation completed successfully!</p>
                <div className="alert-chips">
                  <span className="alert-chip">&#10148; View</span>
                  <span className="alert-chip">&#10148; Continue</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- FOOTER BUTTONS ---------- */}
      <div className="footer-action-bar">
        {!showExplanation && (
          <button className="footer-btn" onClick={() => setShowExplanation(true)}>
            Generate Explanation
          </button>
        )}

        <a
          href="window.location.href = '/new-page.html'"
          target="_blank"
          className={`footer-btn ${showExplanation ? "see-full" : ""}`}
          // onClick={() => window.location.href = '/new-page.html'}
        >
          See Code
        </a>
      </div>
    </div>
  );
};

export default DemoContent;
