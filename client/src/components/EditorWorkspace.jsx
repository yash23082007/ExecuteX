// src/components/EditorWorkspace.jsx
// Premium editor with panel header, breadcrumb-style tab, refined themes

import { useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { FileCode2 } from "lucide-react";
import useCompilerStore from "../store/useCompilerStore";
import "./EditorWorkspace.css";

const EXT = {
  c:".c",cpp:".cpp",java:".java",csharp:".cs",python:".py",r:".r",julia:".jl",
  javascript:".js",typescript:".ts",php:".php",ruby:".rb",go:".go",rust:".rs",
  kotlin:".kt",swift:".swift",scala:".scala",haskell:".hs",lua:".lua",bash:".sh",perl:".pl",
};

export default function EditorWorkspace() {
  const { code, setCode, selectedLanguage, monacoLangMap, theme, fontSize, runCode } =
    useCompilerStore();
  const editorRef = useRef(null);

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    editor.addAction({
      id: "executex-run", label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => runCode(),
    });

    monaco.editor.defineTheme("ex-dark", {
      base: "vs-dark", inherit: true,
      rules: [
        { token: "comment", foreground: "454560", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "keyword.control", foreground: "c084fc" },
        { token: "string", foreground: "86efac" },
        { token: "string.escape", foreground: "6ee7b7" },
        { token: "number", foreground: "fcd34d" },
        { token: "type", foreground: "67e8f9" },
        { token: "type.identifier", foreground: "67e8f9" },
        { token: "function", foreground: "93c5fd" },
        { token: "variable", foreground: "dddde6" },
        { token: "operator", foreground: "8888a0" },
        { token: "delimiter", foreground: "555570" },
        { token: "tag", foreground: "f472b6" },
        { token: "attribute.name", foreground: "fbbf24" },
        { token: "attribute.value", foreground: "86efac" },
      ],
      colors: {
        "editor.background": "#0c0c11",
        "editor.foreground": "#dddde6",
        "editor.lineHighlightBackground": "#13131d",
        "editor.lineHighlightBorder": "#00000000",
        "editor.selectionBackground": "#818cf828",
        "editor.inactiveSelectionBackground": "#818cf812",
        "editor.selectionHighlightBackground": "#818cf80a",
        "editorLineNumber.foreground": "#252540",
        "editorLineNumber.activeForeground": "#4a4a68",
        "editorCursor.foreground": "#818cf8",
        "editorIndentGuide.background": "#151520",
        "editorIndentGuide.activeBackground": "#1e1e30",
        "editorGutter.background": "#0c0c11",
        "editorWidget.background": "#15151f",
        "editorWidget.border": "#1e1e30",
        "editorSuggestWidget.background": "#15151f",
        "editorSuggestWidget.border": "#1e1e30",
        "editorSuggestWidget.selectedBackground": "#818cf818",
        "editorBracketMatch.background": "#818cf815",
        "editorBracketMatch.border": "#818cf835",
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": "#1e1e3050",
        "scrollbarSlider.hoverBackground": "#2a2a40",
        "scrollbarSlider.activeBackground": "#353555",
        "editorOverviewRuler.border": "#00000000",
      },
    });

    monaco.editor.defineTheme("ex-light", {
      base: "vs", inherit: true,
      rules: [
        { token: "comment", foreground: "9ca3af", fontStyle: "italic" },
        { token: "keyword", foreground: "7c3aed" },
        { token: "string", foreground: "059669" },
        { token: "number", foreground: "d97706" },
        { token: "type", foreground: "0891b2" },
        { token: "function", foreground: "2563eb" },
        { token: "variable", foreground: "1e293b" },
        { token: "operator", foreground: "64748b" },
        { token: "tag", foreground: "be185d" },
        { token: "attribute.name", foreground: "ca8a04" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#1e293b",
        "editor.lineHighlightBackground": "#f5f7ff",
        "editor.lineHighlightBorder": "#00000000",
        "editor.selectionBackground": "#6366f120",
        "editor.inactiveSelectionBackground": "#6366f10d",
        "editorLineNumber.foreground": "#cfd0dc",
        "editorLineNumber.activeForeground": "#9899ac",
        "editorCursor.foreground": "#6366f1",
        "editorIndentGuide.background": "#f0f0f8",
        "editorIndentGuide.activeBackground": "#e0e0f0",
        "editorGutter.background": "#ffffff",
        "editorWidget.background": "#ffffff",
        "editorWidget.border": "#e5e7eb",
        "editorBracketMatch.background": "#6366f112",
        "editorBracketMatch.border": "#6366f130",
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": "#d8d8e850",
        "editorOverviewRuler.border": "#00000000",
      },
    });

    editor.focus();
  }, [runCode]);

  const ext = EXT[selectedLanguage] || ".py";

  return (
    <div className="edpanel">
      <div className="edpanel__header">
        <div className="edpanel__title">
          <span className="edpanel__dot edpanel__dot--red" />
          <span className="edpanel__dot edpanel__dot--yellow" />
          <span className="edpanel__dot edpanel__dot--green" />
          <span className="edpanel__label">Editor</span>
        </div>
      </div>
      <div className="edpanel__tab-bar">
        <div className="edpanel__tab edpanel__tab--active">
          <FileCode2 size={12} className="edpanel__tab-ico" />
          <span className="edpanel__tab-name font-mono">main{ext}</span>
          <span className="edpanel__tab-modified" />
        </div>
      </div>
      <div className="edpanel__body">
        <Editor
          height="100%"
          language={monacoLangMap[selectedLanguage] || "plaintext"}
          theme={theme === "dark" ? "ex-dark" : "ex-light"}
          value={code}
          onChange={(val) => setCode(val || "")}
          onMount={handleMount}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineHeight: 1.75,
            letterSpacing: 0.3,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            cursorWidth: 2,
            renderLineHighlight: "all",
            roundedSelection: true,
            automaticLayout: true,
            wordWrap: "on",
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            suggest: { showWords: false },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            overviewRulerLanes: 0,
            scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5, useShadows: false },
            renderWhitespace: "none",
            lineNumbersMinChars: 4,
            folding: true,
            foldingHighlight: false,
          }}
          loading={
            <div className="edpanel__loading">
              <div className="edpanel__loading-bar" />
              <span>Initializing editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
