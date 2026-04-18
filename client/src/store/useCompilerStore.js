// src/store/useCompilerStore.js
// Zustand global state for the ExecuteX compiler

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "/api/v1";
import { LANGUAGES, MONACO_LANG_MAP } from "../constants/languages";
const getInitialTheme = () => {
  const saved = localStorage.getItem("executex-theme");
  if (saved) return saved;
  return "dark";
};

const useCompilerStore = create(
  persist(
    (set, get) => ({
      // ── Language State ──
      languages: LANGUAGES,
      selectedLanguage: "python",
      monacoLangMap: MONACO_LANG_MAP,

      // ── Editor State ──
      code: LANGUAGES.find((l) => l.key === "python")?.boilerplate || "",
      stdin: "",
  fontSize: 15,

  // ── Output State ──
  output: "",
  isRunning: false,
  isLoadingSnippet: false,
  executionTime: null,
  hasError: false,
  timedOut: false,
  executionHistory: [],

  // ── UI State ──
  theme: getInitialTheme(),
  showLanguagePanel: false,
  showAbout: false,
  isSharing: false,
  shareUrl: null,
  shareError: null,
  isForked: false,

  // ── Actions ──
  setCode: (code) => set({ code }),
  setStdin: (stdin) => set({ stdin }),
  
  forkSnippet: () => {
    // Treat the current code as a new snippet
    set({ shareUrl: null, shareError: null });
    // Remove ?s= from URL to signify it's disconnected from the read-only view
    window.history.replaceState({}, document.title, "/");
  },

  setLanguage: (langKey) => {
    const lang = LANGUAGES.find((l) => l.key === langKey);
    if (lang) {
      set({
        selectedLanguage: langKey,
        code: lang.boilerplate,
        output: "",
        executionTime: null,
        hasError: false,
        timedOut: false,
        showLanguagePanel: false,
      });
    }
  },


  setFontSize: (size) => set({ fontSize: Math.min(28, Math.max(10, size)) }),

  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("executex-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    set({ theme: newTheme });
  },

  toggleLanguagePanel: () =>
    set((s) => ({ showLanguagePanel: !s.showLanguagePanel })),

  toggleAbout: () =>
    set((s) => ({ showAbout: !s.showAbout })),

  clearOutput: () =>
    set({ output: "", executionTime: null, hasError: false, timedOut: false }),

  // ── Compile & Run ──
  runCode: async () => {
    const { selectedLanguage, code } = get();
    if (!code.trim()) {
      set({ output: "⚠️ No code to execute.", hasError: true });
      return;
    }

    set({
      isRunning: true,
      output: "",
      executionTime: null,
      hasError: false,
      timedOut: false,
    });

    try {
      const langConfig = get().languages.find(l => l.key === selectedLanguage);
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const res = await fetch("/api/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compiler: langConfig.wandboxId, code: get().code, stdin: get().stdin }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const executionTime = Date.now() - startTime;

      const compilerOutput = data.compiler_error || data.compiler_message || "";
      const programOutput  = data.program_output || data.program_message || "";
      const exitCode       = parseInt(data.status ?? "0", 10);

      const isError = exitCode !== 0;
      const finalOutput = [compilerOutput, programOutput].filter(Boolean).join("\n").trim() || "(No output)";

      set((state) => ({
        output: finalOutput,
        executionTime,
        hasError: isError,
        timedOut: false,
        isRunning: false,
        executionHistory: [{
          lang: selectedLanguage,
          code: code,
          output: finalOutput,
          time: executionTime,
          timestamp: Date.now()
        }, ...state.executionHistory].slice(0, 10)
      }));
    } catch (err) {
      if (err.name === 'AbortError') {
        set({
          output: `⏱ Execution timed out after 15 seconds. Try simplifying your code or avoiding infinite loops.`,
          hasError: true,
          timedOut: true,
          isRunning: false,
          executionTime: null,
        });
      } else {
        set({
          output: `❌ Connection failed: ${err.message}\n\nPlease check your internet connection or try again later.`,
          hasError: true,
          isRunning: false,
        });
      }
    }
  },
  // ── Share Features ──
  shareCode: async () => {
    const { selectedLanguage, code } = get();
    if (!code.trim()) return;

    set({ isSharing: true, shareUrl: null, shareError: null });

    try {
      const res = await fetch(`${API_BASE}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage, code }),
      });

      const data = await res.json();
      if (data.success) {
        // Construct the full URL using ?s=slug
        const url = `${window.location.origin}/?s=${data.share.slug}`;
        set({ shareUrl: url, isSharing: false });
      } else {
        set({ shareError: data.error, isSharing: false });
      }
    } catch  {
      set({ shareError: "Failed to connect to the server.", isSharing: false });
    }
  },

  loadSharedSnippet: async (slug) => {
    try {
      // Show loading indicator in output
      set({ output: "Loading shared snippet...", isLoadingSnippet: true });
      const res = await fetch(`${API_BASE}/share/${slug}`);
      const data = await res.json();

      if (data.success && data.share) {
        set({
          selectedLanguage: data.share.language,
          code: data.share.code,
          output: "Snippet loaded successfully.",
          isLoadingSnippet: false,
        });
      } else {
        set({ output: data.error || "Failed to load snippet.", hasError: true, isLoadingSnippet: false });
      }
    } catch  {
      set({ output: "Failed to connect to the server.", hasError: true, isLoadingSnippet: false });
    }
  },

  clearShareState: () => set({ shareUrl: null, shareError: null }),
    }),
    {
      name: "executex-editor-storage",
      partialize: (state) => ({ 
        code: state.code ? state.code.slice(0, 10000) : "", // Max 10KB code stored local
        selectedLanguage: state.selectedLanguage, 
        theme: state.theme 
      }),
    }
  )
);

// Apply theme on load
document.documentElement.setAttribute("data-theme", getInitialTheme());

export default useCompilerStore;

