# 🤝 Contributing to ExecuteX

First off, thanks for taking the time to contribute! 🎉

## 📜 Coding Standards

- **JavaScript/React**: Use ES6+ syntax, functional components, and Hooks. 
- **Zustand**: Keep state management predictable and minimal.
- **Styling**: We use a custom glassmorphism CSS approach alongside Tailwind in some UI spots. Match the `ex-dark` or `ex-light` aesthetic.
- **Strict Linting**: Ensure `npm run lint` passes before pushing code.
- **Accessibility**: Use `aria-label` for all icon-only buttons. Avoid `<div>` clicks without keyboard event wrappers.

## 🚀 Development Workflow

1. **Fork the Repository**
2. **Create your Feature Branch** using the naming convention below.
3. **Commit your changes** following the Conventional Commits specification.
4. **Push to the branch** and submit a Pull Request!

### Branch Naming Convention

- `feat/feature-name` — for new features.
- `fix/bug-name` — for bug fixes.
- `chore/task-name` — for general updates (dependencies, etc).
- `docs/doc-name` — for documentation adjustments.

### Commit Message Format (Conventional Commits)

Please structure your commit messages like so:
```text
<type>[optional scope]: <description>

[optional body]
```
_Examples_:
- `feat(editor): added vim keybindings toggle`
- `fix(share): corrected db connection timeout logic`
- `docs: updated README sequence diagram`

---

*Thank you for helping execute the future of serverless compilation!*
