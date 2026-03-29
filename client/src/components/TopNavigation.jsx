// src/components/TopNavigation.jsx
// Premium handcrafted navigation — every detail intentional

import { useState, useRef, useEffect } from "react";
import {
  Play, ChevronDown, Sun, Moon, Search, X, Minus, Plus, Check, Info, Link, Copy,
} from "lucide-react";
import useCompilerStore from "../store/useCompilerStore";
import "./TopNavigation.css";

const CAT_ICON = {
  "Core CS / Systems": "⚙️", "Enterprise Backend": "🏗️", "AI / Data Science": "🧠",
  "Data Science": "📐", "Web / Async": "⚡", "Web / Typed": "🔷",
  "Web / Scripting": "🌍", "Modern Systems": "🦀", "Mobile / JVM": "📱",
  "Mobile / Apple": "🍎", "Data / JVM": "🔥", "Pure Functional": "λ",
  "Embedded / Gaming": "🎯", "Shell Scripting": "▸", "Legacy Scripting": "📜",
};

export default function TopNavigation() {
  const {
    selectedLanguage, languages, isRunning, theme, fontSize,
    runCode, setLanguage, toggleTheme, setFontSize, toggleAbout,
    isSharing, shareUrl, shareError, shareCode, clearShareState
  } = useCompilerStore();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const [q, setQ] = useState("");
  const ddRef = useRef(null);
  const searchRef = useRef(null);

  const lang = languages.find((l) => l.key === selectedLanguage);

  useEffect(() => {
    const fn = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  useEffect(() => {
    const fn = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); } };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [runCode]);

  const filtered = languages.filter(
    (l) => l.displayName.toLowerCase().includes(q.toLowerCase()) || l.category.toLowerCase().includes(q.toLowerCase())
  );
  const grouped = filtered.reduce((a, l) => { (a[l.category] ??= []).push(l); return a; }, {});

  return (
    <nav className="nav">
      {/* ── Left ── */}
      <div className="nav__left">
        {/* Brand */}
        <a className="nav__brand" href="/" draggable="false">
          <div className="brand-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bGrad)" />
              <defs>
                <linearGradient id="bGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8" /><stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-name">Execute<span className="brand-x">X</span></span>
        </a>

        <span className="nav__sep" />

        {/* Language */}
        <div className="lang" ref={ddRef}>
          <button className="lang__btn" onClick={() => { setOpen(!open); setQ(""); }}>
            <span className="lang__dot" />
            <span className="lang__label">{lang?.displayName}</span>
            <ChevronDown size={11} className={`lang__chev ${open ? "up" : ""}`} />
          </button>

          {open && (
            <div className="lang__dd">
              <div className="dd__head">
                <Search size={12} className="dd__search-ico" />
                <input ref={searchRef} className="dd__search" placeholder="Search languages..." value={q} onChange={(e) => setQ(e.target.value)} />
                {q && <button className="dd__clear" onClick={() => setQ("")}><X size={10} /></button>}
              </div>
              <div className="dd__body">
                {Object.entries(grouped).map(([cat, langs]) => (
                  <div key={cat} className="dd__group">
                    <div className="dd__cat"><span className="dd__cat-ico">{CAT_ICON[cat] || "•"}</span>{cat}</div>
                    {langs.map((l) => (
                      <button key={l.key} className={`dd__item ${l.key === selectedLanguage ? "active" : ""}`}
                        onClick={() => { setLanguage(l.key); setOpen(false); setQ(""); }}>
                        <span>{l.displayName}</span>
                        {l.key === selectedLanguage && <Check size={12} className="dd__check" />}
                      </button>
                    ))}
                  </div>
                ))}
                {!Object.keys(grouped).length && <div className="dd__empty">No results</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Center ── */}
      <div className="nav__center">
        <button className={`run share-btn ${isSharing ? "run--active" : ""}`} onClick={shareCode} disabled={isSharing || isRunning}>
          {isSharing ? (
            <><div className="run__spin" /><span>Sharing...</span></>
          ) : (
            <><Link size={12} fill="currentColor" strokeWidth={0} /><span>Share</span></>
          )}
        </button>

        {shareUrl && (
          <div className="share-toast">
            <span className="share-toast__text">Link copied to clipboard!</span>
            <button className="share-toast__close" onClick={clearShareState}><X size={12}/></button>
          </div>
        )}
        {shareError && (
          <div className="share-toast error">
            <span className="share-toast__text">{shareError}</span>
            <button className="share-toast__close" onClick={clearShareState}><X size={12}/></button>
          </div>
        )}

        {/* Auto-copy effect to make it premium */}
        {shareUrl && !copied && handleCopyLink()}

        <button className={`run ${isRunning ? "run--active" : ""}`} onClick={runCode} disabled={isRunning || isSharing}>
          {isRunning ? (
            <><div className="run__spin" /><span>Compiling...</span></>
          ) : (
            <><Play size={12} fill="currentColor" strokeWidth={0} /><span>Run Code</span></>
          )}
        </button>
        <kbd className="nav__kbd"><span className="nav__kbd-mod">Ctrl</span><span>↵</span></kbd>
      </div>

      {/* ── Right ── */}
      <div className="nav__right">
        <div className="fsize">
          <button className="fsize__btn" onClick={() => setFontSize(fontSize - 1)}><Minus size={11} /></button>
          <span className="fsize__val">{fontSize}</span>
          <button className="fsize__btn" onClick={() => setFontSize(fontSize + 1)}><Plus size={11} /></button>
        </div>

        <button className="nav__about-btn" onClick={toggleAbout} title="About ExecuteX">
          <Info size={14} />
        </button>

        <button className="theme-sw" onClick={toggleTheme} title={theme === "dark" ? "Switch to light" : "Switch to dark"}>
          <div className="theme-sw__track">
            <div className={`theme-sw__knob ${theme === "light" ? "theme-sw__knob--on" : ""}`}>
              {theme === "dark" ? <Moon size={10} /> : <Sun size={10} />}
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}
