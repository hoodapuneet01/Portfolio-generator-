import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <h2>Something broke</h2>
        <pre style={{ whiteSpace: "pre-wrap", color: "#b42318" }}>
          {String(this.state.error && this.state.error.stack || this.state.error)}
        </pre>
        <button onClick={() => { localStorage.clear(); location.reload(); }}>
          Clear saved data and reload
        </button>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(
  <Boundary><App /></Boundary>
);
