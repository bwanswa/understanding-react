import React from "react";

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const btnStyle = {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
  };

  return (
    <nav
      style={{
        background: "linear-gradient(to right,#006400,#FFD700,#8B0000)",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
        position: "fixed",
        bottom: 0,
        width: "100%",
        color: "white",
        zIndex: 10,
      }}
    >
      <button
        onClick={() => onTabChange("home")}
        style={btnStyle}
        aria-label="Home"
        title="Home"
      >
        🎬 Home
      </button>
      <button
        onClick={() => onTabChange("chats")}
        style={btnStyle}
        aria-label="Chats"
        title="Chats"
      >
        💬 Chats
      </button>
      <button
        onClick={() => onTabChange("profile")}
        style={btnStyle}
        aria-label="Profile"
        title="Profile"
      >
        👤 Profile
      </button>
    </nav>
  );
};

export default BottomNavigation;
