// server/utils/languageMap.js
// Central configuration for all supported languages.
// Migration: Updated with Piston-compatible IDs and versions for Vercel deployment.

const languageMap = {
  c: {
    wandboxId: "gcc-head-c",
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
    wandboxId: "gcc-head",
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
    wandboxId: "openjdk-jdk-22+36",
    ext: ".java",
    displayName: "Java",
    category: "Enterprise Backend",
    boilerplate: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, ExecuteX!");
    }
}`,
  },
  csharp: {
    wandboxId: "mono-6.12.0.199",
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
    wandboxId: "cpython-3.14.0",
    ext: ".py",
    displayName: "Python",
    category: "AI / Data Science",
    boilerplate: `# Python — The gold standard for AI & automation
print("Hello, ExecuteX!")`,
  },
  javascript: {
    wandboxId: "nodejs-20.17.0",
    ext: ".js",
    displayName: "JavaScript",
    category: "Web / Async",
    boilerplate: `// JavaScript — V8 Engine
console.log("Hello, ExecuteX!");`,
  },
  typescript: {
    wandboxId: "typescript-5.6.2",
    ext: ".ts",
    displayName: "TypeScript",
    category: "Web / Typed",
    boilerplate: `// TypeScript — Type-safe JavaScript
const greeting: string = "Hello, ExecuteX!";
console.log(greeting);`,
  },
  php: {
    wandboxId: "php-8.3.12",
    ext: ".php",
    displayName: "PHP",
    category: "Web / Scripting",
    boilerplate: `<?php
// PHP — Powers the web
echo "Hello, ExecuteX!\\n";
?>`,
  },
  ruby: {
    wandboxId: "ruby-3.4.1",
    ext: ".rb",
    displayName: "Ruby",
    category: "Web / Scripting",
    boilerplate: `# Ruby — Elegant scripting
puts "Hello, ExecuteX!"`,
  },
  go: {
    wandboxId: "go-1.23.2",
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
    wandboxId: "rust-1.82.0",
    ext: ".rs",
    displayName: "Rust",
    category: "Modern Systems",
    boilerplate: `fn main() {
    println!("Hello, ExecuteX!");
}`,
  },
  kotlin: {
    wandboxId: "openjdk-jdk-22+36",
    ext: ".kt",
    displayName: "Kotlin",
    category: "Mobile / JVM",
    boilerplate: `fun main() {
    println("Hello, ExecuteX!")
}`,
  },
  swift: {
    wandboxId: "swift-6.0.1",
    ext: ".swift",
    displayName: "Swift",
    category: "Mobile / Apple",
    boilerplate: `// Swift — iOS & macOS development
print("Hello, ExecuteX!")`,
  },
  scala: {
    wandboxId: "scala-3.5.1",
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
    wandboxId: "ghc-9.10.1",
    ext: ".hs",
    displayName: "Haskell",
    category: "Pure Functional",
    boilerplate: `-- Haskell — Pure functional programming
main :: IO ()
main = putStrLn "Hello, ExecuteX!"`,
  },
  lua: {
    wandboxId: "lua-5.4.7",
    ext: ".lua",
    displayName: "Lua",
    category: "Embedded / Gaming",
    boilerplate: `-- Lua — Lightweight scripting
print("Hello, ExecuteX!")`,
  },
  bash: {
    wandboxId: "bash",
    ext: ".sh",
    displayName: "Bash",
    category: "Shell Scripting",
    boilerplate: `#!/bin/bash
# Bash — Shell scripting
echo "Hello, ExecuteX!"`,
  },
  perl: {
    wandboxId: "perl-5.42.0",
    ext: ".pl",
    displayName: "Perl",
    category: "Legacy Scripting",
    boilerplate: `#!/usr/bin/perl
# Perl — Text processing pioneer
use strict;
use warnings;
print "Hello, ExecuteX!\\n";`,
  },
  r: {
    wandboxId: "r-4.4.1",
    ext: ".r",
    displayName: "R",
    category: "Data Science",
    boilerplate: `# R — Statistical Computing
cat("Hello, ExecuteX!\\n")`
  },
  julia: {
    wandboxId: "julia-1.10.5",
    ext: ".jl",
    displayName: "Julia",
    category: "Data / JVM",
    boilerplate: `# Julia — High-performance numerical computing
println("Hello, ExecuteX!")`
  },
};
module.exports = languageMap;

