// src/App.jsx
// ExecuteX — Premium IDE Layout with Horizontal Split Panes

import { useEffect, useRef } from "react";
import Split from "split.js";
import TopNavigation from "./components/TopNavigation";
import EditorWorkspace from "./components/EditorWorkspace";
import TerminalOutput from "./components/TerminalOutput";
import StatusBar from "./components/StatusBar";
import AboutModal from "./components/AboutModal";
import useCompilerStore from "./store/useCompilerStore";
import "./App.css";

function App() {
  const splitRef = useRef(null);
  const loadSharedSnippet = useCompilerStore((state) => state.loadSharedSnippet);

  useEffect(() => {
    // Check for shared snippet slug in URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("s");
    if (slug) {
      loadSharedSnippet(slug);
    }
  }, [loadSharedSnippet]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const split = Split(["#editor-pane", "#terminal-pane"], {   
      direction: isMobile ? "vertical" : "horizontal",
      sizes: [55, 45],
      minSize: isMobile ? [200, 200] : [320, 280],
      gutterSize: isMobile ? 0 : 3,
      dragInterval: 1,
    });

    splitRef.current = split;
    return () => split.destroy();
  }, []);

  return (
    <div className="app-shell" id="app-shell">
      <TopNavigation />
      <main className="workspace" id="workspace">
        <div id="editor-pane" className="pane pane-editor">
          <EditorWorkspace />
        </div>
        <div id="terminal-pane" className="pane pane-terminal">
          <TerminalOutput />
        </div>
      </main>
      <StatusBar />
      <AboutModal />
    </div>
  );
}

export default App;
