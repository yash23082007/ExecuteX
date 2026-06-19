// src/components/EditorWorkspace.jsx
// Premium editor with AI inline completions and review panel

import React, { useRef, useCallback, useEffect, Suspense } from "react";
// Lazy load Monaco editor to reduce initial bundle size
const Editor = React.lazy(() => import("@monaco-editor/react"));
import { FileCode2, X, AlertTriangle, Bug, Lightbulb, Loader2 } from "lucide-react";
import useCompilerStore from "../store/useCompilerStore";
import { FILE_EXT } from "../constants/languages";
import "./EditorWorkspace.css";

const API_BASE = "/api/v1";

// Severity icons for AI review suggestions
const SEVERITY_ICON = {
  bug: Bug,
  warning: AlertTriangle,
  improvement: Lightbulb,
};
const SEVERITY_CLASS = {
  bug: "ai-review__sev--bug",
  warning: "ai-review__sev--warning",
  improvement: "ai-review__sev--improvement",
};

export default function EditorWorkspace() {
  const { code, setCode, selectedLanguage, monacoLangMap, theme, fontSize } =
    useCompilerStore();
  const runCode = useCompilerStore((state) => state.runCode);
  const aiSuggestionsEnabled = useCompilerStore((state) => state.aiSuggestionsEnabled);
  const aiReview = useCompilerStore((state) => state.aiReview);
  const clearAIReview = useCompilerStore((state) => state.clearAIReview);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const aiEnabledRef = useRef(aiSuggestionsEnabled);
  const completionDisposableRef = useRef(null);

  // Keep the ref in sync with the store value
  useEffect(() => {
    aiEnabledRef.current = aiSuggestionsEnabled;
  }, [aiSuggestionsEnabled]);

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addAction({
      id: "executex-run", label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => runCode(),
    });

    // ── Custom Themes ──
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

    // ── AI Inline Completions Provider ──
    let activeController = null;
    let debounceTimer = null;

    const provider = {
      provideInlineCompletions: async (model, position, context, token) => {
        // Check if AI is enabled via ref (avoids re-registering on toggle)
        if (!aiEnabledRef.current) {
          return { items: [] };
        }

        // Cancel any previous in-flight request
        if (activeController) {
          activeController.abort();
          activeController = null;
        }

        // Debounce: wait 300ms of idle before calling the API
        if (debounceTimer) clearTimeout(debounceTimer);

        return new Promise((resolve) => {
          debounceTimer = setTimeout(async () => {
            // Check cancellation token
            if (token.isCancellationRequested) {
              resolve({ items: [] });
              return;
            }

            const fullText = model.getValue();
            const offset = model.getOffsetAt(position);
            const prefix = fullText.slice(0, offset);
            const suffix = fullText.slice(offset);

            // Don't call AI for very short prefixes
            if (prefix.trim().length < 3) {
              resolve({ items: [] });
              return;
            }

            activeController = new AbortController();

            try {
              const res = await fetch(`${API_BASE}/ai/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  language: useCompilerStore.getState().selectedLanguage,
                  prefix: prefix.slice(-4096), // last 4KB of prefix
                  suffix: suffix.slice(0, 2048), // first 2KB of suffix
                }),
                signal: activeController.signal,
              });

              if (!res.ok) {
                resolve({ items: [] });
                return;
              }

              const data = await res.json();

              if (data.success && data.completion && data.completion.trim()) {
                resolve({
                  items: [
                    {
                      insertText: data.completion,
                      range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                      },
                    },
                  ],
                });
              } else {
                resolve({ items: [] });
              }
            } catch {
              // AbortError or network error — silently resolve empty
              resolve({ items: [] });
            } finally {
              activeController = null;
            }
          }, 300);
        });
      },

      freeInlineCompletions: () => {
        // No-op: nothing to free
      },
    };

    // Register the provider for all languages
    completionDisposableRef.current = monaco.languages.registerInlineCompletionsProvider(
      { pattern: "**" },
      provider
    );

    editor.focus();
  }, [runCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (completionDisposableRef.current) {
        completionDisposableRef.current.dispose();
        completionDisposableRef.current = null;
      }
    };
  }, []);

  // Handle clicking an AI review suggestion — navigate to the line
  const handleSuggestionClick = useCallback((line) => {
    if (editorRef.current && line) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      editorRef.current.focus();
    }
  }, []);

  const ext = FILE_EXT[selectedLanguage] || ".txt";

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

      {/* AI Review Panel */}
      {aiReview.open && (
        <div className="ai-review">
          <div className="ai-review__header">
            <span className="ai-review__title">✨ AI Review</span>
            <button className="ai-review__close" onClick={clearAIReview} aria-label="Close AI review">
              <X size={12} />
            </button>
          </div>
          <div className="ai-review__body">
            {aiReview.loading ? (
              <div className="ai-review__loading">
                <Loader2 size={14} className="ai-review__spinner" />
                <span>Analyzing your code...</span>
              </div>
            ) : aiReview.error ? (
              <div className="ai-review__error">{aiReview.error}</div>
            ) : aiReview.suggestions.length === 0 ? (
              <div className="ai-review__empty">No issues found — your code looks good! 🎉</div>
            ) : (
              <div className="ai-review__list">
                {aiReview.suggestions.map((s, i) => {
                  const Icon = SEVERITY_ICON[s.severity] || Lightbulb;
                  return (
                    <button
                      key={i}
                      className="ai-review__item"
                      onClick={() => handleSuggestionClick(s.line)}
                    >
                      <div className={`ai-review__sev ${SEVERITY_CLASS[s.severity] || ""}`}>
                        <Icon size={12} />
                      </div>
                      <div className="ai-review__content">
                        <div className="ai-review__item-title">
                          <span className="ai-review__line">L{s.line}</span>
                          {s.title}
                        </div>
                        {s.detail && <div className="ai-review__detail">{s.detail}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="edpanel__body">
        <Suspense fallback={
          <div className="edpanel__loading">
            <div className="edpanel__loading-bar" />
            <span>Loading editor module...</span>
          </div>
        }>
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
              inlineSuggest: { enabled: true },
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5, useShadows: false },
              renderWhitespace: "none",
              lineNumbersMinChars: 4,
              folding: true,
              foldingHighlight: false,
              accessibilitySupport: 'on',
              ariaLabel: `Code editor for ${selectedLanguage}`,
            }}
            loading={
              <div className="edpanel__loading">
                <div className="edpanel__loading-bar" />
                <span>Initializing editor...</span>
              </div>
            }
          />
        </Suspense>
      </div>
    </div>
  );
}
