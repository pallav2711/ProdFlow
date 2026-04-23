# Contributing to ProdFlow AI

Thank you for your interest in contributing to ProdFlow AI! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/prodflow-ai/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check if the feature has been suggested in [Issues](https://github.com/yourusername/prodflow-ai/issues)
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Follow code style guidelines** (see below)
5. **Write/update tests** if applicable
6. **Update documentation** if needed
7. **Commit your changes**: `git commit -m 'Add amazing feature'`
8. **Push to your fork**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/prodflow-ai.git
cd prodflow-ai

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && pip install -r requirements.txt

# Configure environment
cp .env.example.backend backend/.env
cp .env.example.frontend frontend/.env
cp .env.example.ai ai-service/.env

# Run development servers
npm run dev:all
```

## Code Style Guidelines

### JavaScript/React

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable names
- Add comments for complex logic
- Use async/await over promises

**Example**:
```javascript
// Good
const fetchUserData = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// Bad
function getUserData(userId) {
  return api.get('/users/' + userId).then(function(response) {
    return response.data
  }).catch(function(error) {
    console.log(error)
  })
}
```

### Python

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Use meaningful variable names

**Example**:
```python
# Good
def calculate_sprint_success(
    total_tasks: int,
    team_size: int,
    duration: int
) -> float:
    """
    Calculate sprint success probability.
    
    Args:
        total_tasks: Number of tasks in sprint
        team_size: Number of team members
        duration: Sprint duration in days
        
    Returns:
        Success probability as percentage (0-100)
    """
    # Implementation
    pass

# Bad
def calc(t, s, d):
    # Implementation
    pass
```

## Commit Message Guidelines

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(backend): add sprint success prediction endpoint

fix(frontend): resolve login redirect issue

docs(readme): update installation instructions

refactor(ai-service): optimize data preprocessing pipeline
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### AI Service Tests

```bash
cd ai-service
pytest
```

## Documentation

- Update README.md if adding new features
- Add/update API documentation in docs/backend.md
- Update architecture diagrams if needed
- Add inline code comments for complex logic

## Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Questions?

- Open an issue for questions
- Join our [Discussions](https://github.com/yourusername/prodflow-ai/discussions)
- Email: contribute@prodflow.ai

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ProdFlow AI! 🚀
