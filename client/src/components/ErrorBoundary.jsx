import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }

  render() {
    if (this.state.hasError) return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100vh", backgroundColor: "#08080c", color: "#f87171", fontFamily: "sans-serif"
      }}>
        <h2 style={{ marginBottom: "1rem" }}>System Error</h2>
        <pre style={{
          backgroundColor: "rgba(248, 113, 113, 0.1)", padding: "1.5rem", borderRadius: "8px", 
          maxWidth: "80%", overflow: "auto" 
        }}>
          {this.state.error?.message}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: "2rem", padding: "0.75rem 2rem", background: "#f87171", color: "#000",
            border: "none", borderRadius: "4px", fontSize: "1rem", cursor: "pointer", fontWeight: "bold"
          }}
        >
          Re-initialize System
        </button>
      </div>
    );
    return this.props.children;
  }
}
