// src/components/TerminalOutput.jsx
// Premium terminal panel — crafted with care

import { useRef, useEffect, useState } from "react";
import { Terminal, Trash2, Copy, Check, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import useCompilerStore from "../store/useCompilerStore";
import "./TerminalOutput.css";

const EXT = {
  c:".c",cpp:".cpp",java:".java",csharp:".cs",python:".py",r:".r",julia:".jl",
  javascript:".js",typescript:".ts",php:".php",ruby:".rb",go:".go",rust:".rs",
  kotlin:".kt",swift:".swift",scala:".scala",haskell:".hs",lua:".lua",bash:".sh",perl:".pl",
};

export default function TerminalOutput() {
  const { output, isRunning, hasError, timedOut, executionTime, clearOutput, selectedLanguage, languages, stdin, setStdin } =
    useCompilerStore();
  const bodyRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const lang = languages.find((l) => l.key === selectedLanguage);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [output]);

  const doCopy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  const ext = EXT[selectedLanguage] || "";

  return (
    <div className="termpanel">
      {/* Panel header */}
      <div className="termpanel__header">
        <div className="termpanel__title">
          <div className="termpanel__ico">
            <Terminal size={11} />
          </div>
          <div className="termpanel__tabs" style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
            <span 
              className={`termpanel__name ${activeTab === 'output' ? 'active' : ''}`} 
              onClick={() => setActiveTab('output')}
              style={{ cursor: 'pointer', opacity: activeTab === 'output' ? 1 : 0.6 }}
            >
              Output
            </span>
            <span 
              className={`termpanel__name ${activeTab === 'input' ? 'active' : ''}`} 
              onClick={() => setActiveTab('input')}
              style={{ cursor: 'pointer', opacity: activeTab === 'input' ? 1 : 0.6 }}
            >
              STDIN
            </span>
          </div>
          {executionTime !== null && activeTab === 'output' && (
            <div className={`termpanel__pill ${hasError ? "termpanel__pill--err" : "termpanel__pill--ok"}`} style={{ marginLeft: '10px' }}>
              <Clock size={9} />
              <span>{executionTime}ms</span>
            </div>
          )}
        </div>
        <div className="termpanel__btns">
          {activeTab === 'output' && (
            <>
              <button className="termpanel__btn" onClick={doCopy} disabled={!output} title="Copy" aria-label="Copy output">
                {copied ? <Check size={11} className="termpanel__btn--check" /> : <Copy size={11} />}
              </button>
              <button className="termpanel__btn" onClick={clearOutput} disabled={!output} title="Clear" aria-label="Clear output">
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={`termpanel__body ${hasError && activeTab === 'output' ? "termpanel__body--err" : ""}`} ref={bodyRef}>
        {activeTab === 'input' ? (
          <textarea
            className="term__stdin"
            value={stdin || ""}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Type standard input (STDIN) here..."
            style={{ width: '100%', height: '100%', background: 'transparent', color: '#fff', border: 'none', resize: 'none', padding: '10px', fontFamily: 'inherit', outline: 'none' }}
            spellCheck="false"
          />
        ) : isRunning ? (
          <div className="term__running">
            <div className="term__dots">
              <i className="term__dot" /><i className="term__dot" /><i className="term__dot" />
            </div>
            <span className="term__run-label">Compiling & executing</span>
            <span className="term__run-lang">{lang?.displayName}</span>
          </div>
        ) : output ? (
          <div className="term__result">
            {timedOut && (
              <div className="term__alert term__alert--warn">
                <AlertTriangle size={12} /><span>Execution timed out — process killed</span>
              </div>
            )}
            {hasError && !timedOut && (
              <div className="term__alert term__alert--err">
                <AlertTriangle size={12} /><span>Process exited with errors</span>
              </div>
            )}
            <div className="term__prompt">
              <ChevronRight size={10} className="term__prompt-arrow" />
              <span className="term__prompt-cmd font-mono">./run main{ext}</span>
            </div>
            <pre className="term__out font-mono">{output}</pre>
            <div className="term__footer">
              <span className={`term__exit font-mono ${hasError ? "term__exit--err" : ""}`}>
                {hasError ? "✗ Process exited with code 1" : "✓ Process exited with code 0"}
              </span>
            </div>
          </div>
        ) : (
          <div className="term__empty">
            <div className="term__empty-visual">
              <span className="term__cursor-line">
                <ChevronRight size={13} className="term__cursor-arrow" />
                <span className="term__cursor-block" />
              </span>
            </div>
            <p className="term__empty-text">
              Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to compile & run
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
