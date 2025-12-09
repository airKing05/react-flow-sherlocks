import React, { useState } from "react";
import "./CodeTour.css";

const CodeTour = ({onStartTour}) => {
  const [showDetails, setShowDetails] = useState(false);

  const detailsParagraph = `
    Technology continues to evolve at an incredible pace, reshaping how we communicate,
    work, and experience the world. Innovations in artificial intelligence,
    biotechnology, and digital infrastructure are influencing nearly every industry.
    From automation improving workplace efficiency to machine learning driving smarter
    decision-making, the impact is both widespread and profound. As organizations
    adapt to these shifts, embracing digital transformation has become more essential
    than ever. The future holds exciting opportunities for those who are ready to
    leverage these advancements and integrate them into everyday solutions.
     Technology continues to evolve at an incredible pace, reshaping how we communicate,
    work, and experience the world. Innovations in artificial intelligence,
    biotechnology, and digital infrastructure are influencing nearly every industry.
    From automation improving workplace efficiency to machine learning driving smarter
    decision-making, the impact is both widespread and profound. As organizations
    adapt to these shifts, embracing digital transformation has become more essential
    than ever. The future holds exciting opportunities for those who are ready to
    leverage these advancements and integrate them into everyday solutions.
     Technology continues to evolve at an incredible pace, reshaping how we communicate,
    work, and experience the world. Innovations in artificial intelligence,
    biotechnology, and digital infrastructure are influencing nearly every industry.
    From automation improving workplace efficiency to machine learning driving smarter
    decision-making, the impact is both widespread and profound. As organizations
    adapt to these shifts, embracing digital transformation has become more essential
    than ever. The future holds exciting opportunities for those who are ready to
    leverage these advancements and integrate them into everyday solutions.
  `;

  const cards = [
    {
      title: "Innovation & Strategy",
      content: `In today’s fast-changing environment, organizations need forward-thinking
      strategies that help them stay competitive. Innovation is no longer a luxury—it
      is a core requirement. Businesses that embrace experimentation, data-driven
      planning, and continuous improvement are better positioned to adapt to new
      challenges and unlock long-term success.`
    },
    {
      title: "Digital Transformation",
      content: `Digital tools are redefining how companies deliver value. Whether it’s
      automation, cloud infrastructure, or AI-driven systems, technology now powers the
      backbone of modern operations. A strong transformation roadmap can streamline
      workflows, improve customer experiences, and open the door to scalable growth.`
    },
    {
      title: "Human-Centered Design",
      content: `Design thinking prioritizes user needs and real-world experiences. By
      understanding pain points, motivations, and behavior patterns, organizations can
      build products that resonate deeply with their audiences. Human-centered design
      helps convert complex problems into intuitive, meaningful solutions.`
    },
    {
      title: "Human-Centered Design - 1",
      content: `Design thinking prioritizes user needs and real-world experiences. By
      understanding pain points, motivations, and behavior patterns, organizations can
      build products that resonate deeply with their audiences. Human-centered design
      helps convert complex problems into intuitive, meaningful solutions.`
    }
  ];

return (
    <div className="section-container">

      {/* DETAILS */}
      <div className="details-section">
        <p className={`details-text ${showDetails ? "expanded" : ""}`}>
          {detailsParagraph}
        </p>

        <div className="details-btn-wrapper">
          <span
            className="details-link"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Show More"}
          </span>
        </div>
      </div>

      {/* TITLE */}
      <div className="title-area">
        <h2 className="main-title">Our Focus Areas</h2>
        <p className="subtitle">Driving innovation through thoughtful design and technology</p>
      </div>

      {/* CARDS */}
      <div className="card-grid">
        {cards.map((c, i) => (
          <div key={i} className="card">
            <div className="card-content-wrapper">
              <h3 className="card-title">{c.title}</h3>
              <p className="card-content">{c.content}</p>
            </div>
            <button 
              className="card-btn"
              onClick={onStartTour}
            >Learn More</button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CodeTour;
