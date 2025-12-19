import React, { useEffect, useState } from "react";
import "./CodeTour.css";
import { getRootsOfGraph } from "../../apis/graphApi";

const CodeTour = ({ onStartTour }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [rootNodes, setRootNodes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const getRootNodesDetails =  async () => {
    try {
      const data = await getRootsOfGraph();
        setRootNodes(data);
        setLoading(false);
    } catch (error) {
        console.error("Failed to fetch root nodes", error);
        setLoading(false);
    }
  }
  
  useEffect(() => {
    getRootNodesDetails();
  }, []);

  if (loading) {
    return <div className="section-container">Loading...</div>;
  }

  if (!rootNodes.length) {
    return <div className="section-container">No data available</div>;
  }

  const activeRoot = rootNodes[activeIndex];

  return (
    <div className="section-container">

      {/* DETAILS */}
      <div className="details-section">
        <p className={`details-text ${showDetails ? "expanded" : ""}`}>
          {activeRoot.description}
        </p>

        <div className="details-btn-wrapper">
          <span
            className="details-link"
            onClick={() => setShowDetails(prev => !prev)}
          >
            {showDetails ? "Hide" : "Show More"}
          </span>
        </div>
      </div>

      {/* TITLE */}
      <div className="title-area">
        <h2 className="main-title">Our Focus Areas</h2>
        <p className="subtitle">
          Driving innovation through thoughtful design and technology
        </p>
      </div>

      {/* CARDS (one card per root node) */}
      <div className="card-grid">
        {rootNodes.map((root, index) => (
          <div key={root.id} className="card">
            <div className="card-content-wrapper">
              <h3 className="card-title">{root.title}</h3>
              <p className="card-content">
              {/* {root.description} */}
                {root.description.slice(0, 160)}...
              </p>
            </div>

            <button
              className="card-btn"
              onClick={() => {
                setActiveIndex(index);
                onStartTour(root.node.id);
              }}
            >
              Start Tour
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CodeTour;
