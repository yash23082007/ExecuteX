// server/utils/languageMap.js
// Central configuration for all supported languages.
// Migration: Updated with Piston-compatible IDs and versions for Vercel deployment.

const languageMap = {
  c: {
    pistonId: "c",
    pistonVersion: "10.2.0",
    ext: ".c",
    displayName: "C",
    category: "Core CS / Systems",
    boilerplate: `#include <stdio.h>

int main() {
    printf("Hello, ExecuteX!\\n");
    return 0;
}`,
  },
  cpp: {
    pistonId: "cpp",
    pistonVersion: "10.2.0",
    ext: ".cpp",
    displayName: "C++",
    category: "Core CS / Systems",
    boilerplate: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, ExecuteX!" << endl;
    return 0;
}`,
  },
  java: {
    pistonId: "java",
    pistonVersion: "15.0.2", // Piston version
    ext: ".java",
    displayName: "Java",
    category: "Enterprise Backend",
    boilerplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, ExecuteX!");
    }
}`,
  },
  csharp: {
    pistonId: "csharp",
    pistonVersion: "6.12.0",
    ext: ".cs",
    displayName: "C#",
    category: "Enterprise Backend",
    boilerplate: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, ExecuteX!");
    }
}`,
  },
  python: {
    pistonId: "python",
    pistonVersion: "3.10.0",
    ext: ".py",
    displayName: "Python",
    category: "AI / Data Science",
    boilerplate: `# Python — The gold standard for AI & automation
print("Hello, ExecuteX!")`,
  },
  r: {
    pistonId: "r",
    pistonVersion: "4.0.3",
    ext: ".r",
    displayName: "R",
    category: "Data Science",
    boilerplate: `# R — Statistical Computing
cat("Hello, ExecuteX!\\n")`,
  },
  julia: {
    pistonId: "julia",
    pistonVersion: "1.5.3",
    ext: ".jl",
    displayName: "Julia",
    category: "Data Science",
    boilerplate: `# Julia — High-performance numerical computing
println("Hello, ExecuteX!")`,
  },
  javascript: {
    pistonId: "javascript",
    pistonVersion: "16.3.0",
    ext: ".js",
    displayName: "JavaScript",
    category: "Web / Async",
    boilerplate: `// JavaScript — V8 Engine
console.log("Hello, ExecuteX!");`,
  },
  typescript: {
    pistonId: "typescript",
    pistonVersion: "1.10.0", // Deno/TS
    ext: ".ts",
    displayName: "TypeScript",
    category: "Web / Typed",
    boilerplate: `// TypeScript — Type-safe JavaScript
const greeting: string = "Hello, ExecuteX!";
console.log(greeting);`,
  },
  php: {
    pistonId: "php",
    pistonVersion: "8.0.0",
    ext: ".php",
    displayName: "PHP",
    category: "Web / Scripting",
    boilerplate: `<?php
// PHP — Powers the web
echo "Hello, ExecuteX!\\n";
?>`,
  },
  ruby: {
    pistonId: "ruby",
    pistonVersion: "3.0.0",
    ext: ".rb",
    displayName: "Ruby",
    category: "Web / Scripting",
    boilerplate: `# Ruby — Elegant scripting
puts "Hello, ExecuteX!"`,
  },
  go: {
    pistonId: "go",
    pistonVersion: "1.16.2",
    ext: ".go",
    displayName: "Go",
    category: "Modern Systems",
    boilerplate: `package main

import "fmt"

func main() {
    fmt.Println("Hello, ExecuteX!")
}`,
  },
  rust: {
    pistonId: "rust",
    pistonVersion: "1.50.0",
    ext: ".rs",
    displayName: "Rust",
    category: "Modern Systems",
    boilerplate: `fn main() {
    println!("Hello, ExecuteX!");
}`,
  },
  kotlin: {
    pistonId: "kotlin",
    pistonVersion: "1.5.0",
    ext: ".kt",
    displayName: "Kotlin",
    category: "Mobile / JVM",
    boilerplate: `fun main() {
    println("Hello, ExecuteX!")
}`,
  },
  swift: {
    pistonId: "swift",
    pistonVersion: "5.3.3",
    ext: ".swift",
    displayName: "Swift",
    category: "Mobile / Apple",
    boilerplate: `// Swift — iOS & macOS development
print("Hello, ExecuteX!")`,
  },
  scala: {
    pistonId: "scala",
    pistonVersion: "2.13.5",
    ext: ".scala",
    displayName: "Scala",
    category: "Data / JVM",
    boilerplate: `object Main {
  def main(args: Array[String]): Unit = {
    println("Hello, ExecuteX!")
  }
}`,
  },
  haskell: {
    pistonId: "haskell",
    pistonVersion: "8.10.4",
    ext: ".hs",
    displayName: "Haskell",
    category: "Pure Functional",
    boilerplate: `-- Haskell — Pure functional programming
main :: IO ()
main = putStrLn "Hello, ExecuteX!"`,
  },
  lua: {
    pistonId: "lua",
    pistonVersion: "5.4.2",
    ext: ".lua",
    displayName: "Lua",
    category: "Embedded / Gaming",
    boilerplate: `-- Lua — Lightweight scripting
print("Hello, ExecuteX!")`,
  },
  bash: {
    pistonId: "bash",
    pistonVersion: "5.1.0",
    ext: ".sh",
    displayName: "Bash",
    category: "Shell Scripting",
    boilerplate: `#!/bin/bash
# Bash — Shell scripting
echo "Hello, ExecuteX!"`,
  },
  perl: {
    pistonId: "perl",
    pistonVersion: "5.32.1",
    ext: ".pl",
    displayName: "Perl",
    category: "Legacy Scripting",
    boilerplate: `#!/usr/bin/perl
# Perl — Text processing pioneer
use strict;
use warnings;
print "Hello, ExecuteX!\\n";`,
  },
};

module.exports = languageMap;

