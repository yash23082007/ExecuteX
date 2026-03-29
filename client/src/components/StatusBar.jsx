// src/components/StatusBar.jsx
import { Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import useCompilerStore from "../store/useCompilerStore";
import "./StatusBar.css";

export default function StatusBar() {
  const { selectedLanguage, languages, isRunning, hasError, executionTime } = useCompilerStore();
  const [online, setOnline] = useState(true);
  const lang = languages.find((l) => l.key === selectedLanguage);

  useEffect(() => {
    const check = async () => {
      try { const r = await fetch("/api/v1/health", { signal: AbortSignal.timeout(3000) }); setOnline(r.ok); }
      catch { setOnline(false); }
    };
    check();
    const i = setInterval(check, 15000);
    return () => clearInterval(i);
  }, []);

  return (
    <footer className="sbar">
      <div className="sbar__l">
        <div className={`sbar__i ${online ? "sbar__i--ok" : "sbar__i--err"}`}>
          <span className={`sbar__led ${online ? "sbar__led--ok" : "sbar__led--err"}`} />
          <span>{online ? "Connected" : "Offline"}</span>
        </div>
        {isRunning && (
          <div className="sbar__i sbar__i--accent">
            <div className="sbar__spin" />
            <span>Running</span>
          </div>
        )}
        {executionTime !== null && !isRunning && (
          <div className={`sbar__i ${hasError ? "sbar__i--err" : "sbar__i--ok"}`}>
            <span>{hasError ? "✗ Error" : "✓ OK"}</span>
            <span>·</span>
            <span>{executionTime}ms</span>
          </div>
        )}
      </div>
      <div className="sbar__r">
        <div className="sbar__i"><Code2 size={10} /><span>{lang?.displayName}</span></div>
        <div className="sbar__i sbar__i--dim"><span>{lang?.category}</span></div>
        <div className="sbar__i sbar__i--dim"><span>UTF-8</span></div>
        <div className="sbar__i sbar__i--brand">ExecuteX</div>
      </div>
    </footer>
  );
}
