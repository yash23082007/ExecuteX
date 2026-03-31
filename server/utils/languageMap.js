// server/utils/languageMap.js
// Central configuration for all supported languages.
// Migration: Updated with Piston-compatible IDs and versions for Vercel deployment.

const languageMap = {
  c: {
    codeXId: "c",
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
    codeXId: "cpp",
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
    codeXId: "java",
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
    codeXId: "cs",
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
    codeXId: "py",
    ext: ".py",
    displayName: "Python",
    category: "AI / Data Science",
    boilerplate: `# Python — The gold standard for AI & automation
print("Hello, ExecuteX!")`,
  },
  javascript: {
    codeXId: "js",
    ext: ".js",
    displayName: "JavaScript",
    category: "Web / Async",
    boilerplate: `// JavaScript — V8 Engine
console.log("Hello, ExecuteX!");`,
  },
  typescript: {
    codeXId: "ts",
    ext: ".ts",
    displayName: "TypeScript",
    category: "Web / Typed",
    boilerplate: `// TypeScript — Type-safe JavaScript
const greeting: string = "Hello, ExecuteX!";
console.log(greeting);`,
  },
  php: {
    pistonId: "php",
    pistonVersion: "8.2.3",
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
    pistonVersion: "3.0.1",
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
    pistonVersion: "1.68.2",
    ext: ".rs",
    displayName: "Rust",
    category: "Modern Systems",
    boilerplate: `fn main() {
    println!("Hello, ExecuteX!");
}`,
  },
  kotlin: {
    pistonId: "kotlin",
    pistonVersion: "1.8.20",
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
    pistonVersion: "3.2.2",
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
    pistonVersion: "9.0.1",
    ext: ".hs",
    displayName: "Haskell",
    category: "Pure Functional",
    boilerplate: `-- Haskell — Pure functional programming
main :: IO ()
main = putStrLn "Hello, ExecuteX!"`,
  },
  lua: {
    pistonId: "lua",
    pistonVersion: "5.4.4",
    ext: ".lua",
    displayName: "Lua",
    category: "Embedded / Gaming",
    boilerplate: `-- Lua — Lightweight scripting
print("Hello, ExecuteX!")`,
  },
  bash: {
    pistonId: "bash",
    pistonVersion: "5.2.0",
    ext: ".sh",
    displayName: "Bash",
    category: "Shell Scripting",
    boilerplate: `#!/bin/bash
# Bash — Shell scripting
echo "Hello, ExecuteX!"`,
  },
  perl: {
    pistonId: "perl",
    pistonVersion: "5.36.0",
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

