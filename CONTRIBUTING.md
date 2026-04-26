# Contributing to Hidden Gems

Thank you for your interest in contributing to Hidden Gems! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We follow the Contributor Covenant Code of Conduct.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/hidden-gems.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start development: `npm run dev`

## Development Workflow

### Before Making Changes

- Ensure you're on the latest `main` branch
- Pull the latest changes: `git pull origin main`
- Create a feature branch from `main`

### Making Changes

1. Write clear, descriptive commit messages
2. Follow the existing code style and conventions
3. Add tests for new features
4. Update documentation if needed

### Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Building

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Commit Message Guidelines

Follow conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(destinations): add filtering by category

Add ability to filter destinations by category type (Nature, Culture, Adventure).
Users can now click on category badges to filter the destination list.

Closes #123
```

## Pull Request Process

1. Update your branch with latest main: `git rebase origin/main`
2. Push to your fork: `git push origin feature/your-feature-name`
3. Create a Pull Request on GitHub
4. Fill in the PR template completely
5. Link related issues
6. Wait for CI/CD checks to pass
7. Request review from maintainers
8. Address review feedback

### PR Requirements

- [ ] Tests added/updated for new features
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Code follows project style guidelines
- [ ] Commits are clean and well-organized

## File Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
├── styles/          # Global styles
└── __tests__/       # Test files
```

## Naming Conventions

- **Components**: PascalCase (e.g., `DestinationCard.tsx`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDestinations.ts`)
- **Styles**: kebab-case class names
- **Variables/Functions**: camelCase

## Documentation

- Keep README.md updated
- Add JSDoc comments to functions
- Document complex logic with comments
- Update API documentation for new endpoints

## Reporting Issues

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, browser, Node version)
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Any relevant examples

## Questions?

- Check existing issues and discussions
- Open a new discussion for questions
- Join our community on Discord/Slack

## License

By contributing to Hidden Gems, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Hidden Gems! 🌍✈️
