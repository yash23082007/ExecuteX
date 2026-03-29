// server/utils/languageMap.js
// Central configuration for all 20 supported languages.
// Maps language keys to their Docker image, file extension, and compile/run command.

const languageMap = {
  c: {
    image: "gcc:latest",
    ext: ".c",
    cmd: (filename) => `sh -c "gcc ${filename} -o /tmp/out && /tmp/out"`,
    displayName: "C",
    category: "Core CS / Systems",
    boilerplate: `#include <stdio.h>

int main() {
    printf("Hello, ExecuteX!\\n");
    return 0;
}`,
  },
  cpp: {
    image: "gcc:latest",
    ext: ".cpp",
    cmd: (filename) => `sh -c "g++ ${filename} -o /tmp/out && /tmp/out"`,
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
    image: "amazoncorretto:21-alpine",
    ext: ".java",
    cmd: (filename) => `sh -c "javac ${filename} && java Main"`,
    displayName: "Java",
    category: "Enterprise Backend",
    boilerplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, ExecuteX!");
    }
}`,
  },
  csharp: {
    image: "mono:slim",
    ext: ".cs",
    cmd: (filename) => `sh -c "mcs -nologo -out:/tmp/out.exe ${filename} && mono /tmp/out.exe"`,
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
    image: "python:3.12-alpine",
    ext: ".py",
    cmd: (filename) => `python3 ${filename}`,
    displayName: "Python",
    category: "AI / Data Science",
    boilerplate: `# Python — The gold standard for AI & automation
print("Hello, ExecuteX!")`,
  },
  r: {
    image: "rhub/r-minimal",
    ext: ".r",
    cmd: (filename) => `Rscript ${filename}`,
    displayName: "R",
    category: "Data Science",
    boilerplate: `# R — Statistical Computing
cat("Hello, ExecuteX!\\n")`,
  },
  julia: {
    image: "julia:alpine",
    ext: ".jl",
    cmd: (filename) => `julia ${filename}`,
    displayName: "Julia",
    category: "Data Science",
    boilerplate: `# Julia — High-performance numerical computing
println("Hello, ExecuteX!")`,
  },
  javascript: {
    image: "node:alpine",
    ext: ".js",
    cmd: (filename) => `node ${filename}`,
    displayName: "JavaScript",
    category: "Web / Async",
    boilerplate: `// JavaScript — V8 Engine
console.log("Hello, ExecuteX!");`,
  },
  typescript: {
    image: "denoland/deno:alpine",
    ext: ".ts",
    cmd: (filename) => `deno run ${filename}`,
    displayName: "TypeScript",
    category: "Web / Typed",
    boilerplate: `// TypeScript — Type-safe JavaScript
const greeting: string = "Hello, ExecuteX!";
console.log(greeting);`,
  },
  php: {
    image: "php:cli-alpine",
    ext: ".php",
    cmd: (filename) => `php ${filename}`,
    displayName: "PHP",
    category: "Web / Scripting",
    boilerplate: `<?php
// PHP — Powers the web
echo "Hello, ExecuteX!\\n";
?>`,
  },
  ruby: {
    image: "ruby:alpine",
    ext: ".rb",
    cmd: (filename) => `ruby ${filename}`,
    displayName: "Ruby",
    category: "Web / Scripting",
    boilerplate: `# Ruby — Elegant scripting
puts "Hello, ExecuteX!"`,
  },
  go: {
    image: "golang:alpine",
    ext: ".go",
    cmd: (filename) => `go run ${filename}`,
    displayName: "Go",
    category: "Modern Systems",
    boilerplate: `package main

import "fmt"

func main() {
    fmt.Println("Hello, ExecuteX!")
}`,
  },
  rust: {
    image: "rust:alpine",
    ext: ".rs",
    cmd: (filename) => `sh -c "rustc ${filename} -o /tmp/out && /tmp/out"`,
    displayName: "Rust",
    category: "Modern Systems",
    boilerplate: `fn main() {
    println!("Hello, ExecuteX!");
}`,
  },
  kotlin: {
    image: "zenika/kotlin",
    ext: ".kt",
    cmd: (filename) => `sh -c "kotlinc ${filename} -include-runtime -d /tmp/out.jar 2>/dev/null && java -jar /tmp/out.jar"`,
    displayName: "Kotlin",
    category: "Mobile / JVM",
    boilerplate: `fun main() {
    println("Hello, ExecuteX!")
}`,
  },
  swift: {
    image: "swift:slim",
    ext: ".swift",
    cmd: (filename) => `swift ${filename}`,
    displayName: "Swift",
    category: "Mobile / Apple",
    boilerplate: `// Swift — iOS & macOS development
print("Hello, ExecuteX!")`,
  },
  scala: {
    image: "sbtscala/scala-sbt:eclipse-temurin-alpine-21.0.6_7_1.10.11_3.6.4",
    ext: ".scala",
    cmd: (filename) => `scala ${filename}`,
    displayName: "Scala",
    category: "Data / JVM",
    boilerplate: `object Main {
  def main(args: Array[String]): Unit = {
    println("Hello, ExecuteX!")
  }
}`,
  },
  haskell: {
    image: "haskell:slim",
    ext: ".hs",
    cmd: (filename) => `runghc ${filename}`,
    displayName: "Haskell",
    category: "Pure Functional",
    boilerplate: `-- Haskell — Pure functional programming
main :: IO ()
main = putStrLn "Hello, ExecuteX!"`,
  },
  lua: {
    image: "nickblah/lua:alpine",
    ext: ".lua",
    cmd: (filename) => `lua ${filename}`,
    displayName: "Lua",
    category: "Embedded / Gaming",
    boilerplate: `-- Lua — Lightweight scripting
print("Hello, ExecuteX!")`,
  },
  bash: {
    image: "bash:alpine",
    ext: ".sh",
    cmd: (filename) => `bash ${filename}`,
    displayName: "Bash",
    category: "Shell Scripting",
    boilerplate: `#!/bin/bash
# Bash — Shell scripting
echo "Hello, ExecuteX!"`,
  },
  perl: {
    image: "perl:alpine",
    ext: ".pl",
    cmd: (filename) => `perl ${filename}`,
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
