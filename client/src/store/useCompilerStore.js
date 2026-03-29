// src/store/useCompilerStore.js
// Zustand global state for the ExecuteX compiler

import { create } from "zustand";

const API_BASE = "/api/v1";

// Language configurations (mirrored from server for offline use)
const LANGUAGES = [
  { key: "c", displayName: "C", category: "Core CS / Systems", boilerplate: '#include <stdio.h>\n\nint main() {\n    printf("Hello, ExecuteX!\\n");\n    return 0;\n}' },
  { key: "cpp", displayName: "C++", category: "Core CS / Systems", boilerplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, ExecuteX!" << endl;\n    return 0;\n}' },
  { key: "java", displayName: "Java", category: "Enterprise Backend", boilerplate: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, ExecuteX!");\n    }\n}' },
  { key: "csharp", displayName: "C#", category: "Enterprise Backend", boilerplate: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, ExecuteX!");\n    }\n}' },
  { key: "python", displayName: "Python", category: "AI / Data Science", boilerplate: '# Python — The gold standard for AI & automation\nprint("Hello, ExecuteX!")' },
  { key: "r", displayName: "R", category: "Data Science", boilerplate: '# R — Statistical Computing\ncat("Hello, ExecuteX!\\n")' },
  { key: "julia", displayName: "Julia", category: "Data Science", boilerplate: '# Julia — High-performance numerical computing\nprintln("Hello, ExecuteX!")' },
  { key: "javascript", displayName: "JavaScript", category: "Web / Async", boilerplate: '// JavaScript — V8 Engine\nconsole.log("Hello, ExecuteX!");' },
  { key: "typescript", displayName: "TypeScript", category: "Web / Typed", boilerplate: '// TypeScript — Type-safe JavaScript\nconst greeting: string = "Hello, ExecuteX!";\nconsole.log(greeting);' },
  { key: "php", displayName: "PHP", category: "Web / Scripting", boilerplate: '<?php\n// PHP — Powers the web\necho "Hello, ExecuteX!\\n";\n?>' },
  { key: "ruby", displayName: "Ruby", category: "Web / Scripting", boilerplate: '# Ruby — Elegant scripting\nputs "Hello, ExecuteX!"' },
  { key: "go", displayName: "Go", category: "Modern Systems", boilerplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, ExecuteX!")\n}' },
  { key: "rust", displayName: "Rust", category: "Modern Systems", boilerplate: 'fn main() {\n    println!("Hello, ExecuteX!");\n}' },
  { key: "kotlin", displayName: "Kotlin", category: "Mobile / JVM", boilerplate: 'fun main() {\n    println("Hello, ExecuteX!")\n}' },
  { key: "swift", displayName: "Swift", category: "Mobile / Apple", boilerplate: '// Swift — iOS & macOS development\nprint("Hello, ExecuteX!")' },
  { key: "scala", displayName: "Scala", category: "Data / JVM", boilerplate: 'object Main {\n  def main(args: Array[String]): Unit = {\n    println("Hello, ExecuteX!")\n  }\n}' },
  { key: "haskell", displayName: "Haskell", category: "Pure Functional", boilerplate: '-- Haskell — Pure functional programming\nmain :: IO ()\nmain = putStrLn "Hello, ExecuteX!"' },
  { key: "lua", displayName: "Lua", category: "Embedded / Gaming", boilerplate: '-- Lua — Lightweight scripting\nprint("Hello, ExecuteX!")' },
  { key: "bash", displayName: "Bash", category: "Shell Scripting", boilerplate: '#!/bin/bash\n# Bash — Shell scripting\necho "Hello, ExecuteX!"' },
  { key: "perl", displayName: "Perl", category: "Legacy Scripting", boilerplate: '#!/usr/bin/perl\n# Perl — Text processing pioneer\nuse strict;\nuse warnings;\nprint "Hello, ExecuteX!\\n";' },
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
  kotlin: "kotlin",
  swift: "swift",
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

const useCompilerStore = create((set, get) => ({
  // ── Language State ──
  languages: LANGUAGES,
  selectedLanguage: "python",
  monacoLangMap: MONACO_LANG_MAP,

  // ── Editor State ──
  code: LANGUAGES.find((l) => l.key === "python")?.boilerplate || "",
  fontSize: 15,

  // ── Output State ──
  output: "",
  isRunning: false,
  executionTime: null,
  hasError: false,
  timedOut: false,

  // ── UI State ──
  theme: getInitialTheme(),
  showLanguagePanel: false,
  showAbout: false,
  isSharing: false,
  shareUrl: null,
  shareError: null,

  // ── Actions ──
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

  setCode: (code) => set({ code }),

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
      const res = await fetch(`${API_BASE}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage, code }),
      });

      const data = await res.json();

      set({
        output: data.output || "(No output)",
        executionTime: data.executionTime || null,
        hasError: data.error || false,
        timedOut: data.timedOut || false,
        isRunning: false,
      });
    } catch (err) {
      set({
        output: `❌ Connection failed: ${err.message}\n\nMake sure the ExecuteX server is running on port 3001.`,
        hasError: true,
        isRunning: false,
      });
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
    } catch (err) {
      set({ shareError: "Failed to connect to the server.", isSharing: false });
    }
  },

  loadSharedSnippet: async (slug) => {
    try {
      // Show loading indicator in output
      set({ output: "Loading shared snippet...", isRunning: true });
      const res = await fetch(`${API_BASE}/share/${slug}`);
      const data = await res.json();

      if (data.success && data.share) {
        set({
          selectedLanguage: data.share.language,
          code: data.share.code,
          output: "Snippet loaded successfully.",
          isRunning: false,
        });
      } else {
        set({ output: data.error || "Failed to load snippet.", hasError: true, isRunning: false });
      }
    } catch (err) {
      set({ output: "Failed to connect to the server.", hasError: true, isRunning: false });
    }
  },

  clearShareState: () => set({ shareUrl: null, shareError: null }),
}));

// Apply theme on load
document.documentElement.setAttribute("data-theme", getInitialTheme());

export default useCompilerStore;
