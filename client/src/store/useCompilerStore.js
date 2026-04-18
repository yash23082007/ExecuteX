// src/store/useCompilerStore.js
// Zustand global state for the ExecuteX compiler

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "/api/v1";

// Language configurations (mirrored from server for offline use)
const LANGUAGES = [
  { key: "c", wandboxId: "gcc-head-c", displayName: "C", category: "Core CS / Systems", boilerplate: '#include <stdio.h>\n\nint main() {\n    printf("Hello, ExecuteX!\\n");\n    return 0;\n}' },
  { key: "cpp", wandboxId: "gcc-head", displayName: "C++", category: "Core CS / Systems", boilerplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, ExecuteX!" << endl;\n    return 0;\n}' },
  { key: "java", wandboxId: "openjdk-jdk-22+36", displayName: "Java", category: "Enterprise Backend", boilerplate: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, ExecuteX!");\n    }\n}' },
  { key: "csharp", wandboxId: "mono-6.12.0.199", displayName: "C#", category: "Enterprise Backend", boilerplate: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, ExecuteX!");\n    }\n}' },
  { key: "python", wandboxId: "cpython-3.14.0", displayName: "Python", category: "AI / Data Science", boilerplate: '# Python — The gold standard for AI & automation\nprint("Hello, ExecuteX!")' },
  { key: "r", wandboxId: "r-4.4.1", displayName: "R", category: "Data Science", boilerplate: '# R — Statistical Computing\ncat("Hello, ExecuteX!\\n")' },
  { key: "julia", wandboxId: "julia-1.10.5", displayName: "Julia", category: "Data Science", boilerplate: '# Julia — High-performance numerical computing\nprintln("Hello, ExecuteX!")' },
  { key: "javascript", wandboxId: "nodejs-20.17.0", displayName: "JavaScript", category: "Web / Async", boilerplate: '// JavaScript — V8 Engine\nconsole.log("Hello, ExecuteX!");' },
  { key: "typescript", wandboxId: "typescript-5.6.2", displayName: "TypeScript", category: "Web / Typed", boilerplate: '// TypeScript — Type-safe JavaScript\nconst greeting: string = "Hello, ExecuteX!";\nconsole.log(greeting);' },
  { key: "php", wandboxId: "php-8.3.12", displayName: "PHP", category: "Web / Scripting", boilerplate: '<?php\n// PHP — Powers the web\necho "Hello, ExecuteX!\\n";\n?>' },
  { key: "ruby", wandboxId: "ruby-3.4.1", displayName: "Ruby", category: "Web / Scripting", boilerplate: '# Ruby — Elegant scripting\nputs "Hello, ExecuteX!"' },
  { key: "go", wandboxId: "go-1.23.2", displayName: "Go", category: "Modern Systems", boilerplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, ExecuteX!")\n}' },
  { key: "rust", wandboxId: "rust-1.82.0", displayName: "Rust", category: "Modern Systems", boilerplate: 'fn main() {\n    println!("Hello, ExecuteX!");\n}' },
      { key: "scala", wandboxId: "scala-3.3.4", displayName: "Scala", category: "Data / JVM", boilerplate: 'object Main {\n  def main(args: Array[String]): Unit = {\n    println("Hello, ExecuteX!")\n  }\n}' },
  { key: "haskell", wandboxId: "ghc-9.10.1", displayName: "Haskell", category: "Pure Functional", boilerplate: '-- Haskell — Pure functional programming\nmain :: IO ()\nmain = putStrLn "Hello, ExecuteX!"' },
  { key: "lua", wandboxId: "lua-5.4.7", displayName: "Lua", category: "Embedded / Gaming", boilerplate: '-- Lua — Lightweight scripting\nprint("Hello, ExecuteX!")' },
  { key: "bash", wandboxId: "bash", displayName: "Bash", category: "Shell Scripting", boilerplate: '#!/bin/bash\n# Bash — Shell scripting\necho "Hello, ExecuteX!"' },
  { key: "perl", wandboxId: "perl-5.42.0", displayName: "Perl", category: "Legacy Scripting", boilerplate: '#!/usr/bin/perl\n# Perl — Text processing pioneer\nuse strict;\nuse warnings;\nprint "Hello, ExecuteX!\\n";' },
];

// Monaco language ID mapping
const MONACO_LANG_MAP = {
  c: "c",
  cpp: "cpp",
  java: "java",
  csharp: "csharp",
  python: "python",
  r: "r",
  julia: "julia",
  javascript: "javascript",
  typescript: "typescript",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
      scala: "scala",
  haskell: "haskell",
  lua: "lua",
  bash: "shell",
  perl: "perl",
};

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
