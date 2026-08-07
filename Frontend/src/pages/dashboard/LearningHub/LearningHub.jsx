/**
 * ============================================================================
 * LEARNING HUB COMPONENT
 * ============================================================================
 * High-density financial learning hub page with 4x4 matrix video grid,
 * interactive YouTube player modal, and dynamic active module tracking.
 */

import React, { useState } from "react";
import "./LearningHub.css";

// Learning Data & Components
import learningData from "./learningData";
import LearningCard from "./components/LearningCard";

export default function LearningHub() {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Track recently viewed active modules (persisted in localStorage)
   * Starts empty [] until user interacts with a video card.
   */
  const [activeModules, setActiveModules] = useState(() => {
    try {
      const saved = localStorage.getItem("recent_learning_modules");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Selected course object for modal video player
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Active category filter state ('All', 'Beginner', 'Intermediate', 'Advanced')
  const [activeFilter, setActiveFilter] = useState("All");

  // ==========================================================================
  // HANDLER FUNCTIONS
  // ==========================================================================

  /**
   * Opens in-app YouTube modal player and pushes course to Active Modules bar
   * @param {Object} course - Selected course object
   */
  const openCourse = (course) => {
    setSelectedCourse(course);

    setActiveModules((prev) => {
      const filtered = prev.filter((item) => item.id !== course.id);
      const updated = [course, ...filtered].slice(0, 4);
      try {
        localStorage.setItem("recent_learning_modules", JSON.stringify(updated));
      } catch (e) {
        console.error("LocalStorage write error:", e);
      }
      return updated;
    });
  };

  /**
   * Closes the active YouTube video modal
   */
  const closeModal = () => {
    setSelectedCourse(null);
  };

  // ==========================================================================
  // RENDER UI
  // ==========================================================================

  return (
    <div className="learning-page">
      {/* ----------------------------------------------------------------------
          1. IN-APP YOUTUBE VIDEO PLAYER MODAL
      ---------------------------------------------------------------------- */}
      {selectedCourse && (
        <div className="learning-modal-backdrop" onClick={closeModal}>
          <div
            className="learning-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="learning-modal-header">
              <h3>
                <span className={`learning-level ${selectedCourse.level.toLowerCase()}`}>
                  {selectedCourse.level}
                </span>
                {selectedCourse.title}
              </h3>
              <button
                className="learning-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Embedded YouTube Video Container */}
            <div className="learning-video-container">
              <iframe
                src={selectedCourse.embedUrl}
                title={selectedCourse.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Modal Footer */}
            <div className="learning-modal-footer">
              <span className="duration-text">Duration: {selectedCourse.duration}</span>
              <a
                href={selectedCourse.video}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-yt-external"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          2. MAIN CONTENT LAYOUT
      ---------------------------------------------------------------------- */}
      <div className="learning-hub">
        {/* SECTION A: HERO HEADER */}
        <div className="learning-hero fade-up">
          <div>
            <h1>Learning Hub</h1>
            <p>
              Master global economics through high-density intelligence modules
              designed for rapid financial mastery and trading excellence.
            </p>
          </div>
        </div>

        {/* SECTION B: CATEGORY FILTERS */}
        <div className="learning-filters">
          {["All", "Beginner", "Intermediate", "Advanced"].map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "is-active" : ""}
              onClick={() => {
                setActiveFilter(filter);
                if (filter !== "All") {
                  document.getElementById(filter)?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* SECTION C: ACTIVE MODULES (Recent Activity Bar) */}
        <div className="section-title">
          <h2>Active Modules</h2>
          <p>Your recently watched learning video modules.</p>
        </div>

        <div className="active-modules fade-up delay-1">
          {activeModules.length === 0 ? (
            <div className="no-active">
              <h3>No Active Modules Yet</h3>
              <p>Start learning by clicking any video course below!</p>
            </div>
          ) : (
            activeModules.map((course) => (
              <div
                className="active-card"
                key={course.id}
                onClick={() => openCourse(course)}
              >
                <img src={course.image} alt={course.title} />

                <div className="active-content">
                  <span className={`learning-level ${course.level.toLowerCase()}`}>
                    {course.level}
                  </span>
                  <h3>{course.title}</h3>
                  <div className="active-footer">
                    <button
                      className="learning-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCourse(course);
                      }}
                    >
                      Resume Module →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SECTION D: EXPLORE LEARNING (4x4 Matrix Grid) */}
        <div className="section-title">
          <h2>Explore Learning</h2>
          <p>Select any module below to launch the video frame.</p>
        </div>

        <div className="learning-grid fade-up delay-2">
          {learningData
            .filter((course) => activeFilter === "All" || course.level === activeFilter)
            .map((course) => (
              <LearningCard
                key={course.id}
                course={course}
                openCourse={openCourse}
              />
            ))}
        </div>
      </div>
    </div>
  );
}