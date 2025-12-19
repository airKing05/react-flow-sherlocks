import React, { useEffect, useState } from "react";
import "./DemoContent.css";
import { fetchNodeDetails } from "../../apis/graphApi";

const DemoContent = ({content}) => {
  const [data, setData] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);


  const getNodeDetails = async() => {
     try {
      const data = await fetchNodeDetails("1");
        setData(data);
        setLoading(false);
     } catch (error) {
        setLoading(false);
     }
  }
  useEffect(() => {
   getNodeDetails()
  }, []);

  if (loading) {
    return <div className="demo-wrapper">Loading...</div>;
  }

  if (!data) {
    return <div className="demo-wrapper">Failed to load content</div>;
  }


  const isEmpty =
    (!content || content.trim() === "") && !showExplanation && !data;



  return(
    <div className="demo-wrapper">

      {/* ---------- SHOW EXPLANATION ---------- */}
      {showExplanation && data && (
        <div className="section">
          <h3 className="section-title">Explanation</h3>
          <pre className="explanation-pre">{data.explanation}</pre>
        </div>
      )}

      {/* ---------- EMPTY STATE ---------- */}
      {!showExplanation && isEmpty && (
        <div className="empty-state-box">
          <h3 className="empty-title">
            Type: {data?.meta?.type || "Function"}
          </h3>
          <p className="empty-file">
            File: {data?.meta?.file || "css-prune.js"}
          </p>
          <p className="empty-description">No explanation generated yet.</p>
          <p className="empty-action-text">
            Click <strong>"Generate Explanation"</strong> to create one.
          </p>
        </div>
      )}

      {/* ---------- FULL NORMAL CONTENT ---------- */}
      {!showExplanation && data && (
        <>
          {/* ---------- DETAILS ---------- */}
          <div className="section">
            <h3 className="section-title">Details</h3>

            <div className="message detail">
              ℹ️ <span>{data.details.infoMessage}</span>
            </div>

            <p className="demo-text">{data.details.description}</p>
          </div>

          {/* ---------- CHIPS ---------- */}
          <div className="section">
            <h3 className="section-title">Chips</h3>

            <div className="chip-row">
              {data.chips.map((c, idx) => (
                <span key={idx} className="chip">
                  <span dangerouslySetInnerHTML={{ __html: c.icon }} />
                  &nbsp;{c.label}
                </span>
              ))}
            </div>
          </div>

          {/* ---------- ALERTS ---------- */}
          <div className="section">
            <h3 className="section-title">Messages</h3>

            {data.alerts.map((alert, idx) => (
              <div key={idx} className={`alert-box ${alert.variant}`}>
                <div className="alert-icon">{alert.icon}</div>

                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <p className="alert-text">{alert.text}</p>

                  <div className="alert-chips">
                    {alert.actions.map((a, i) => (
                      <span key={i} className="alert-chip">
                        &#10148; {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- FOOTER ---------- */}
      <div className="footer-action-bar">
        {!showExplanation && (
          <button
            className="footer-btn"
            onClick={() => setShowExplanation(true)}
          >
            Generate Explanation
          </button>
        )}

        <button
          className={`footer-btn ${showExplanation ? "see-full" : ""}`}
          onClick={() => window.open("/new-page.html", "_blank")}
        >
          See Code
        </button>
      </div>
    </div>
  );
};

export default DemoContent;
