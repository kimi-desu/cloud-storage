import React from "react";
import "../styles/modern.css";

export default function Header({ title = "Cloud Storage", onLogout, userEmail }) {
  return (
    <header className="cs-header">
      <div className="cs-header-left">
        <div className="cs-logo">☁️</div>
        <div className="cs-title">{title}</div>
      </div>

      <div className="cs-header-right">
        {userEmail && <div className="cs-user">{userEmail}</div>}
        {onLogout && (
          <button className="cs-btn cs-btn-ghost" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
