# ⚡ ExecuteX — 20-Language Online Compiler Platform

ExecuteX is a high-performance, secure, and ephemeral code execution environment designed for developers to test and share snippets across 20+ programming languages. Built with a focus on speed, isolation, and a premium developer experience.

![ExecuteX Banner](https://img.shields.io/badge/ExecuteX-Compiler-blueviolet?style=for-the-badge&logo=docker)
![Languages](https://img.shields.io/badge/Languages-20+-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/React-Node.js-blue?style=for-the-badge&logo=react)

---

## 🚀 Key Features

*   **20+ Supported Languages**: From Core CS (C/C++, Java) to Modern Systems (Rust, Go) and Data Science (Python, R, Julia).
*   **Secure Sandboxing**: Every execution happens in a dedicated, isolated Docker container with strict resource limits.
*   **Rich IDE Experience**: Powered by the **Monaco Editor** (the engine behind VS Code) with syntax highlighting and theme support.
*   **Real-time Execution**: Sub-second execution for most scripts with live output streaming.
*   **Snippet Sharing**: Generate unique, permanent URLs for your code snippets to share with others.
*   **Premium UI**: Dark-mode first, glassmorphism design for a modern aesthetics.

---

## 🛠️ Architecture

ExecuteX uses a **Docker-out-of-Docker (DooD)** architecture to ensure maximum isolation and performance.

### Tech Stack
*   **Frontend**: React 18, Vite, Zustand (State Management), Monaco Editor.
*   **Backend**: Node.js, Express, Docker SDK (via socket).
*   **Database**: MongoDB (for persistent code sharing).
*   **Infrastructure**: Docker Compose, Nginx (Frontend proxy).

### Security & Isolation
Each code execution is strictly governed by:
*   **Memory Limit**: 256MB per container.
*   **CPU Limit**: 0.5 vCPU.
*   **Network**: Completely disabled (`--network=none`).
*   **Timeout**: Strict 10-second execution window.
*   **Ephemeral Filesystem**: All job files are wiped immediately after completion.

---

## 🚦 Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Node.js (for local development)

### Deployment (Recommended)
The entire stack is containerized for easy deployment.

```bash
# Clone the repository
git clone https://github.com/yash23082007/executeX.git
cd executeX

# Start the platform
docker-compose up -d --build
```

Access the platform at `http://localhost`.

### Local Development
If you want to run the frontend and backend separately for development:

```bash
# 1. Start MongoDB (required for sharing)
docker run -d -p 27017:27017 --name executex-mongo mongo:6.0

# 2. Run the platform locally
npm install
npm run dev
```

---

## 📝 Supported Languages

| Language | Category | Image |
| :--- | :--- | :--- |
| **Python** | AI / Data Science | `python:3.12-alpine` |
| **Java** | Enterprise Backend | `amazoncorretto:21-alpine` |
| **Rust** | Modern Systems | `rust:alpine` |
| **C / C++** | Systems Programming | `gcc:latest` |
| **Go** | Modern Backend | `golang:alpine` |
| **JavaScript**| Web / Async | `node:alpine` |
| **TypeScript**| Typed Web | `denoland/deno:alpine` |
| **... and 13 more**| | |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

*Built with ❤️ by the ExecuteX Team.*
