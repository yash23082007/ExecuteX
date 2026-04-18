export const FILE_EXT = {
  c: ".c",
  "c++": ".cpp",
  java: ".java",
  csharp: ".cs",
  python: ".py",
  r: ".r",
  julia: ".jl",
  javascript: ".js",
  typescript: ".ts",
  php: ".php",
  ruby: ".rb",
  go: ".go",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  bash: ".sh",
  perl: ".pl",
  kotlin: ".kt",
  swift: ".swift"
};

export const MONACO_LANG_MAP = {
  "c++": "cpp",
  csharp: "csharp",
  bash: "shell",
};

export const LANGUAGES = [
  { key: "javascript", wandboxId: "nodejs-20.17.0", icon: "SiJavascript", color: "#F7DF1E", boilerplate: 'console.log("Hello, JavaScript!");' },
  { key: "typescript", wandboxId: "typescript-5.6.2", icon: "SiTypescript", color: "#3178C6", boilerplate: 'const msg: string = "Hello, TypeScript!";\nconsole.log(msg);' },
  { key: "python", wandboxId: "cpython-3.14.0", icon: "SiPython", color: "#3776AB", boilerplate: 'print("Hello, Python!")' },
  { key: "java", wandboxId: "openjdk-jdk-22+36", icon: "FaJava", color: "#007396", boilerplate: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}' },
  { key: "c", wandboxId: "gcc-head-c", icon: "SiC", color: "#A8B9CC", boilerplate: '#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}' },
  { key: "c++", wandboxId: "gcc-head", icon: "SiCplusplus", color: "#00599C", boilerplate: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}' },
  { key: "csharp", wandboxId: "mono-6.12.0.199", icon: "SiCsharp", color: "#239120", boilerplate: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, C#!");\n    }\n}' },
  { key: "rust", wandboxId: "rust-1.82.0", icon: "SiRust", color: "#000000", boilerplate: 'fn main() {\n    println!("Hello, Rust!");\n}' },
  { key: "go", wandboxId: "go-1.23.2", icon: "SiGo", color: "#00ADD8", boilerplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n}' },
  { key: "ruby", wandboxId: "ruby-3.4.1", icon: "SiRuby", color: "#CC342D", boilerplate: 'puts "Hello, Ruby!"' },
  { key: "php", wandboxId: "php-8.3.12", icon: "SiPhp", color: "#777BB4", boilerplate: '<?php\necho "Hello, PHP!";\n?>' },
  { key: "r", wandboxId: "r-4.4.1", icon: "FaRProject", color: "#276DC3", boilerplate: 'print("Hello, R!")' },
  { key: "julia", wandboxId: "julia-1.10.5", icon: "SiJulia", color: "#9558B2", boilerplate: 'println("Hello, Julia!")' },
  { key: "scala", wandboxId: "scala-3.3.4", icon: "SiScala", color: "#DC322F", boilerplate: 'object Main {\n  def main(args: Array[String]): Unit = {\n    println("Hello, Scala!")\n  }\n}' },
  { key: "haskell", wandboxId: "ghc-9.10.1", icon: "SiHaskell", color: "#5E5086", boilerplate: 'main :: IO ()\nmain = putStrLn "Hello, Haskell!"' },
  { key: "lua", wandboxId: "lua-5.4.7", icon: "SiLua", color: "#2C2D72", boilerplate: 'print("Hello, Lua!")' },
  { key: "bash", wandboxId: "bash", icon: "SiGnubash", color: "#4EAA25", boilerplate: '#!/bin/bash\necho "Hello, Bash!"' },
  { key: "perl", wandboxId: "perl-5.42.0", icon: "SiPerl", color: "#39457E", boilerplate: 'print "Hello, Perl!\\n";' }
];