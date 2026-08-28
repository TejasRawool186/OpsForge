# OpsForge Hackathon Team Code of Conduct
## August 22-27, 2026

**Team:** Tejas (Lead), Samar, Vighnesh  
**Project:** OpsForge (Autonomous AI Incident Response Engineer)  
**Hackathon:** TrueForge Agent Harness

---

## 📋 Table of Contents

1. [Team Principles](#team-principles)
2. [Git & Version Control](#git--version-control)
3. [Coding Standards](#coding-standards)
4. [Code Review Process](#code-review-process)
5. [Testing Requirements](#testing-requirements)
6. [Documentation Standards](#documentation-standards)
7. [Individual Developer Files](#individual-developer-files)
8. [Performance Guidelines](#performance-guidelines)
9. [Security Practices](#security-practices)
10. [Communication & Escalation](#communication--escalation)
11. [Conflict Resolution](#conflict-resolution)

---

## 🤝 Team Principles

### Core Values

1. **Collaboration Over Competition**
   - Share knowledge freely
   - Help team members unblock
   - Celebrate wins together

2. **Quality Over Speed**
   - Don't sacrifice stability for features
   - Write testable code
   - Document as you code

3. **Transparency**
   - Daily honest updates
   - Raise blockers immediately
   - Ask for help early

4. **Ownership**
   - Own your component
   - Be accountable for quality
   - Mentor others in your area

### Team Agreements

- **Respectful Communication** — Use inclusive language, no dismissive behavior
- **Active Participation** — Attend all standups and meetings
- **Time Commitment** — 8-6 PM IST daily (can flex within 8-hour window)
- **Sleep & Health** — Don't sacrifice health for the hackathon
- **No Blame Culture** — Bugs happen; focus on fixing, not blaming

---

## 🔀 Git & Version Control

### Branch Structure

```
main (production)
  ↓
  ← develop (development)
        ↓
        ← feature/... (individual work)
        ← bugfix/...
        ← hotfix/...
```

### Branch Naming Convention

**Format:** `<type>/<scope>/<description>`

**Types:**
- `feature/` — New feature
- `bugfix/` — Bug fix
- `hotfix/` — Critical production fix
- `refactor/` — Code refactoring
- `docs/` — Documentation only
- `test/` — Testing only

**Examples:**
```
feature/incident-list
feature/approval-dialog
bugfix/timeline-event-ordering
refactor/agent-risk-assessment
docs/api-endpoints
test/incident-creation-flow
```

### Commit Message Format

**Standard:** Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Code style (no logic change)
- `refactor:` — Code refactoring
- `perf:` — Performance improvement
- `test:` — Test additions/modifications
- `ci:` — CI/CD configuration
- `chore:` — Build process, dependencies

**Subject Line Rules:**
- Use imperative mood ("add" not "added")
- Capitalize first letter
- No period at end
- Max 50 characters
- Reference issue if applicable

**Examples:**
```
feat(agent): implement TrueForge integration

Integrate TrueForge harness to enable agent orchestration.
- Added agent initialization
- Implemented investigation loop
- Added tool calling mechanism

Closes #123

---

fix(timeline): correct event timestamp ordering

Events were appearing out of order in timeline component.
Use ISO8601 timestamps for proper sorting.

Fixes #456

---

docs(api): add approval endpoint documentation

Added comprehensive API documentation for approval endpoints.
Includes request/response examples and error cases.
```

### Commit Frequency

- **Minimum:** Once per day (end of day commit)
- **Optimal:** 2-3 commits per task completion
- **Avoid:** Large monolithic commits

### Push & Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   git push -u origin feature/my-feature
   ```

2. **Commit Regularly**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push
   ```

3. **Create Pull Request**
   - Use PR template (see below)
   - Link to relevant issues
   - Describe changes clearly
   - Mark as "WIP" if not ready

4. **PR Template**
   ```markdown
   ## Description
   [What does this PR do?]

   ## Related Issues
   Closes #123
   Related to #456

   ## Changes
   - [ ] Change 1
   - [ ] Change 2
   - [ ] Change 3

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests passed
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guide
   - [ ] Documentation updated
   - [ ] No console errors/warnings
   - [ ] Ready for review
   ```

5. **Code Review** (see Code Review Process)

6. **Merge to develop**
   - Use "Squash and merge" for feature branches
   - Use "Create merge commit" for release branches
   - Delete branch after merge

### Merge to main (Release)

Only project lead (Tejas) merges to main.

Process:
1. Create release branch: `release/v1.0`
2. Update version numbers
3. Create release notes
4. Team review
5. Tejas merges to main
6. Tag release: `v1.0`
7. Merge back to develop

---

## 🖊️ Coding Standards

### Python Backend Standards

**Language:** Python 3.9+  
**Framework:** FastAPI  
**ORM:** SQLAlchemy

#### Style Guide

```python
# Follow PEP 8 strictly
# Use Black for formatting (line length: 100)
# Use isort for imports
# Use mypy for type checking

# Example:
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class IncidentCreateRequest(BaseModel):
    """Request model for creating an incident."""
    
    title: str = Field(..., min_length=1, max_length=255)
    service: str = Field(..., min_length=1)
    severity: str = Field("MEDIUM", regex="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    description: Optional[str] = Field(None, max_length=5000)
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Checkout error spike",
                "service": "checkout-service",
                "severity": "HIGH",
                "description": "Error rate increased from 2% to 31%"
            }
        }


async def create_incident(request: IncidentCreateRequest) -> dict:
    """Create a new incident."""
    # Validate request
    if not request.title.strip():
        raise ValueError("Title cannot be empty")
    
    # Create incident
    incident = Incident(**request.dict())
    db.add(incident)
    await db.commit()
    
    return {"id": incident.id, "created_at": incident.created_at}
```

**Key Standards:**
- Type hints required for all functions
- Docstrings for all public methods (Google style)
- Max line length: 100 characters
- Functions: snake_case
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private methods: _prefix
- Avoid `*` imports
- One import per line (groups: stdlib, 3rd party, local)

**File Structure:**
```python
"""Module docstring."""

from typing import Optional
from datetime import datetime

# Constants
DEFAULT_TIMEOUT = 30
RETRY_LIMIT = 3

# Models
class IncidentModel:
    """Docstring."""
    pass

# Functions
async def get_incident(incident_id: str) -> IncidentModel:
    """Docstring."""
    pass

# Main
if __name__ == "__main__":
    pass
```

#### Database Conventions

```python
# Model naming: singular, PascalCase
class Incident(Base):
    __tablename__ = "incidents"  # plural, snake_case
    
    id: int = Column(Integer, primary_key=True)
    title: str = Column(String(255), nullable=False, index=True)
    service: str = Column(String(100), nullable=False, index=True)
    created_at: datetime = Column(DateTime, nullable=False, default=utcnow)
    updated_at: datetime = Column(DateTime, nullable=False, default=utcnow, onupdate=utcnow)
    
    # Relationships
    events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan")
```

**Naming Conventions:**
- Tables: plural, snake_case
- Columns: snake_case
- Primary key: `id`
- Foreign keys: `{table_name}_id`
- Timestamps: `created_at`, `updated_at`
- Status columns: `status` (enum)

### TypeScript/React Frontend Standards

**Language:** TypeScript 4.5+  
**Framework:** Next.js 13+  
**UI Library:** shadcn/ui + Tailwind CSS

#### Style Guide

```typescript
// Use strict TypeScript
// Use ESLint + Prettier (line length: 100)
// Use React best practices

// Example:
interface IncidentListProps {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
  isLoading?: boolean;
}

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: IncidentStatus;
  createdAt: Date;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onSelect,
  isLoading = false,
}) => {
  const [sortBy, setSortBy] = React.useState<SortKey>("createdAt");

  const sortedIncidents = React.useMemo(
    () => [...incidents].sort((a, b) => compareBy(a, b, sortBy)),
    [incidents, sortBy]
  );

  return (
    <div className="space-y-4">
      {isLoading && <LoadingSkeleton />}
      {!isLoading && sortedIncidents.length === 0 && <EmptyState />}
      {!isLoading && (
        <div className="grid gap-4">
          {sortedIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => onSelect(incident)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

IncidentList.displayName = "IncidentList";
```

**Key Standards:**
- Interfaces: PascalCase with `Props` suffix for component props
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- React hooks: use* prefix
- Files: kebab-case (incident-list.tsx)
- Max line length: 100 characters
- Use functional components + hooks
- Extract component logic with custom hooks
- Avoid prop drilling (use Context if >3 levels)

**File Structure:**
```typescript
// components/incident-list.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import type { Incident } from "@/types";
import { useIncidents } from "@/hooks/use-incidents";

interface IncidentListProps {
  onSelect: (incident: Incident) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({ onSelect }) => {
  const { incidents, isLoading } = useIncidents();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <div key={incident.id} onClick={() => onSelect(incident)}>
          {incident.title}
        </div>
      ))}
    </div>
  );
};

IncidentList.displayName = "IncidentList";
```

#### CSS/Tailwind Conventions

```jsx
// Use Tailwind utilities, avoid inline styles
<div className="flex flex-col gap-4 p-4">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <p className="text-sm text-gray-600">Description</p>
</div>

// Use responsive prefixes
<div className="w-full md:w-1/2 lg:w-1/3">Responsive</div>

// Use Tailwind config for custom colors/spacing
// Avoid magic numbers, use Tailwind scale
```

### Shared Standards (Python & TypeScript)

1. **Error Handling**
   ```python
   # Python
   try:
       result = operation()
   except SpecificError as e:
       logger.error(f"Operation failed: {e}")
       raise ApplicationError(f"Failed to {action}: {str(e)}") from e
   ```

   ```typescript
   // TypeScript
   try {
     const result = await operation();
   } catch (error) {
     const message = error instanceof Error ? error.message : String(error);
     logger.error(`Operation failed: ${message}`);
     throw new ApplicationError(`Failed to ${action}: ${message}`);
   }
   ```

2. **Logging**
   ```python
   import logging
   logger = logging.getLogger(__name__)
   
   logger.debug("Detailed debugging info")
   logger.info("Important operation")
   logger.warning("Recoverable issue")
   logger.error("Error that needs attention", exc_info=True)
   ```

3. **Comments**
   - Explain WHY, not WHAT
   - Keep comments updated
   - Use `# TODO:` for pending work
   - Use `# FIXME:` for known issues
   - Use `# NOTE:` for important context

4. **Magic Numbers**
   - Extract to named constants
   - Include comments explaining meaning
   ```python
   # Timeout for external API calls (TrueForge responses)
   TRUEFORGE_TIMEOUT_SECONDS = 30
   ```

---

## 👀 Code Review Process

### Review Checklist

Every PR must be reviewed by at least ONE other person before merge.

**Reviewer Responsibilities:**

- [ ] **Functionality** — Does it work as intended?
- [ ] **Code Quality** — Follows standards?
- [ ] **Testing** — Adequate test coverage?
- [ ] **Documentation** — Well documented?
- [ ] **Performance** — No performance regressions?
- [ ] **Security** — No security issues?
- [ ] **Error Handling** — Handles errors properly?
- [ ] **Dependencies** — Any new dependencies justified?

### Review Timeline

- **Response Time:** 30 minutes to 2 hours (during working hours)
- **Comment Turnaround:** 15 minutes to 1 hour (for author response)
- **Approval:** Before merge

### Review Etiquette

**For Reviewers:**
- Use positive language
- Ask clarifying questions
- Suggest improvements, don't demand
- Acknowledge good work
- Focus on important issues first
- Approve with comments if minor issues

**For Authors:**
- Respond to all comments
- Don't take criticism personally
- Ask for clarification if needed
- Make requested changes
- Ping reviewer when ready for re-review

### Approval Process

1. **Request Reviews** — Tag relevant team members
2. **Address Comments** — Make requested changes
3. **Request Re-review** — After addressing
4. **Get Approval** — At least one "Approved"
5. **Merge** — Use appropriate merge strategy

---

## 🧪 Testing Requirements

### Test Coverage Targets

- **Backend (Python/FastAPI):** >80% code coverage
- **Frontend (TypeScript/React):** >70% code coverage
- **Overall Project:** >75% code coverage

### Types of Tests

#### 1. Unit Tests

Test individual functions/methods in isolation.

**Python Example:**
```python
import pytest
from app.services.incident_service import IncidentService

@pytest.fixture
def incident_service():
    return IncidentService(db=MockDB())

def test_create_incident_success(incident_service):
    """Test successful incident creation."""
    result = incident_service.create(
        title="Test incident",
        service="test-service",
        severity="HIGH"
    )
    assert result.id is not None
    assert result.title == "Test incident"

def test_create_incident_invalid_title(incident_service):
    """Test incident creation with invalid title."""
    with pytest.raises(ValueError):
        incident_service.create(title="", service="test", severity="HIGH")
```

**TypeScript Example:**
```typescript
import { render, screen } from "@testing-library/react";
import { IncidentList } from "@/components/incident-list";

describe("IncidentList", () => {
  it("renders incident list correctly", () => {
    const mockIncidents = [
      { id: "1", title: "Incident 1", service: "service-1" },
    ];

    render(<IncidentList incidents={mockIncidents} onSelect={jest.fn()} />);

    expect(screen.getByText("Incident 1")).toBeInTheDocument();
  });

  it("calls onSelect when incident is clicked", () => {
    const mockOnSelect = jest.fn();
    const mockIncident = { id: "1", title: "Incident 1" };

    render(
      <IncidentList incidents={[mockIncident]} onSelect={mockOnSelect} />
    );

    screen.getByText("Incident 1").click();
    expect(mockOnSelect).toHaveBeenCalledWith(mockIncident);
  });
});
```

#### 2. Integration Tests

Test multiple components working together.

```python
@pytest.mark.asyncio
async def test_create_incident_through_api(client, db):
    """Test creating incident through API endpoint."""
    response = await client.post(
        "/api/incidents",
        json={
            "title": "Test incident",
            "service": "test-service",
            "severity": "HIGH"
        }
    )
    
    assert response.status_code == 201
    assert response.json()["id"] is not None
    
    # Verify in database
    incident = await db.get(Incident, response.json()["id"])
    assert incident.title == "Test incident"
```

#### 3. End-to-End Tests

Test complete user workflows.

```typescript
describe("Incident Investigation Flow", () => {
  it("creates incident and starts investigation", async () => {
    // Create incident
    const createResponse = await apiClient.post("/incidents", {
      title: "E2E Test Incident",
      service: "test-service",
      severity: "HIGH",
    });
    const incidentId = createResponse.data.id;

    // Start investigation
    const investigateResponse = await apiClient.post(
      `/incidents/${incidentId}/investigate`,
      { strategy: "AUTOMATIC" }
    );

    // Verify status
    const statusResponse = await apiClient.get(
      `/incidents/${incidentId}/investigation`
    );
    expect(statusResponse.data.status).toBe("INVESTIGATING");
  });
});
```

### Test File Organization

```
backend/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── conftest.py          # Shared fixtures

frontend/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── setup.ts
```

### Test Naming Convention

```python
# Python
def test_<function>_<scenario>():
    """Brief description."""
    pass

def test_create_incident_success():
    pass

def test_create_incident_with_empty_title_raises_error():
    pass
```

```typescript
// TypeScript
describe("<ComponentName>", () => {
  it("should <behavior> when <condition>", () => {
    // test code
  });

  it("should render incident list", () => {});
  it("should call onSelect when clicking incident", () => {});
});
```

### Running Tests

```bash
# Backend
pytest                          # Run all tests
pytest --cov                    # With coverage
pytest -v                       # Verbose
pytest tests/unit/             # Only unit tests
pytest -k "test_create"         # Filter by name

# Frontend
npm test                        # Run all tests
npm test -- --coverage          # With coverage
npm test -- --watch             # Watch mode
```

### Test Reports

Each developer must provide daily test reports:

```markdown
## Test Report — Day [X]
**Date:** [Date]
**Developer:** [Name]

### Test Summary
- Backend Tests: 42 passed, 0 failed, 85% coverage
- Frontend Tests: 28 passed, 0 failed, 72% coverage
- E2E Tests: 5 passed, 0 failed

### New Tests Added
- test_approve_action_success
- test_approval_dialog_rendering

### Failures Fixed
- Fixed timeout in investigation flow test

### Coverage Report
Backend: 85% (+3% from yesterday)
Frontend: 72% (unchanged)

### Issues/Blockers
None

**Status:** ✅ All tests passing
```

---

## 📝 Documentation Standards

### Code Documentation

**Python Docstrings (Google Style):**
```python
def investigate_incident(incident_id: str, max_depth: int = 3) -> dict:
    """Investigate an incident using multi-source analysis.

    Gathers evidence from GitHub, Grafana, and PostgreSQL to build
    a comprehensive root cause hypothesis.

    Args:
        incident_id: Unique identifier for the incident.
        max_depth: Maximum investigation depth (default: 3).

    Returns:
        Investigation results containing:
        - root_cause: Primary hypothesis (str)
        - confidence: Confidence score 0-1 (float)
        - evidence: Supporting evidence (List[Dict])
        - recommendation: Recommended action (str)

    Raises:
        IncidentNotFoundError: If incident_id doesn't exist.
        InvestigationTimeoutError: If investigation exceeds max time.

    Example:
        >>> result = investigate_incident("INC-2026-001")
        >>> print(result["confidence"])
        0.91
    """
```

**TypeScript JSDoc:**
```typescript
/**
 * Investigate an incident using multi-source analysis.
 *
 * Gathers evidence from GitHub, Grafana, and PostgreSQL to build
 * a comprehensive root cause hypothesis.
 *
 * @param incidentId - Unique identifier for the incident
 * @param maxDepth - Maximum investigation depth (default: 3)
 *
 * @returns Investigation results containing root_cause, confidence, evidence
 *
 * @throws {IncidentNotFoundError} If incident_id doesn't exist
 * @throws {InvestigationTimeoutError} If investigation exceeds max time
 *
 * @example
 * const result = await investigateIncident("INC-2026-001");
 * console.log(result.confidence); // 0.91
 */
export async function investigateIncident(
  incidentId: string,
  maxDepth: number = 3
): Promise<InvestigationResult> {
  // implementation
}
```

### README Documentation

Every module/package should have a README:

```markdown
# Incident Service

Brief description of what this service does.

## Features
- Feature 1
- Feature 2

## Usage
```python
from app.services.incident_service import IncidentService

service = IncidentService(db)
incident = service.create(...)
```

## API

### Methods
- `create()` — Create new incident
- `get()` — Retrieve incident

## Testing
```bash
pytest tests/incident_service/
```

## Related
- [Parent Module](../README.md)
```

### API Documentation

Use OpenAPI/Swagger format:

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="OpsForge API",
    description="Autonomous incident response engine API",
    version="1.0.0"
)

@app.post(
    "/incidents",
    response_model=IncidentResponse,
    status_code=201,
    tags=["Incidents"],
    summary="Create a new incident",
    description="Creates a new incident and triggers investigation."
)
async def create_incident(request: IncidentCreateRequest) -> IncidentResponse:
    """
    Create a new incident.

    - **title**: Incident title (required)
    - **service**: Affected service (required)
    - **severity**: LOW, MEDIUM, HIGH, or CRITICAL (default: MEDIUM)

    Returns the created incident with ID and timestamps.
    """
```

### Change Documentation

When making breaking changes, document in:

```markdown
# CHANGELOG.md

## [1.1.0] - 2026-08-25

### Added
- New feature description

### Changed
- **BREAKING** API endpoint renamed from `/incidents` to `/v2/incidents`
- Migration guide: [link]

### Fixed
- Bug fix description
```

---

## 👤 Individual Developer Files

### Purpose

Each developer maintains a personal markdown file tracking:
- Daily work completed
- Issues encountered
- Solutions implemented
- Lessons learned
- Next day plans

### File Location

```
OpsForge/docs/dev/
├── tejas.md
├── samar.md
└── vighnesh.md
```

### File Template

```markdown
# [Developer Name] — Daily Progress Log

**Hackathon:** August 22-27, 2026  
**Role:** [Role]  
**Timezone:** IST

---

## Daily Progress

### Day 1 — Saturday, August 22, 2026

**Tasks Assigned:**
1. TrueForge setup
2. GitHub repo initialization
3. Architecture documentation

**Completed:**
- ✅ TrueForge installed and tested (hello-world example running)
- ✅ GitHub repo created with proper branch structure
- ✅ Initial architecture review with team
- ✅ Agent framework skeleton designed

**Code Produced:**
- `agents/incident_agent.py` — Main agent class (50 lines)
- `agents/state_machine.py` — Investigation state machine (100 lines)
- Created Git workflow documentation

**Issues Encountered:**
- TrueForge documentation slightly outdated
  - Solution: Used SDK examples and community docs

**Learnings:**
- TrueForge initialization requires proper environment setup
- State machine design critical for agent stability

**Code Quality:**
- Code coverage: N/A (architecture phase)
- Tests written: 0
- Linting: ✅ Passed (no Python files yet)

**Next Day Plan:**
- Implement GitHub MCP integration
- Create agent reasoning framework
- Set up agent testing

**Blockers:**
None

**Confidence Level:** 95% on schedule

---

### Day 2 — August 23, 2026

**Tasks Assigned:**
[continue pattern...]

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Lines of Code | 2,340 |
| Total Tests Written | 28 |
| Test Coverage | 85% |
| Code Review Comments | 12 |
| Issues Closed | 8 |
| Bugs Created | 0 |

---

## Key Accomplishments

1. Completed TrueForge integration
2. Implemented full investigation loop
3. Created subagent framework
4. Achieved 85%+ test coverage

## Challenges Overcome

1. Model provider latency → Added caching
2. MCP tool integration complexity → Documented interfaces
3. Subagent coordination → Implemented message queue

## Lessons Learned

- Start testing early (saves time later)
- Documentation is critical for team coordination
- Simple architecture wins over complex optimization

---

## Team Contributions

- Mentored Samar on agent architecture
- Helped debug Vighnesh's integration test suite
- Reviewed all PRs for technical soundness

---

## What I'd Do Differently

- Would have set up mocking framework earlier
- Could have parallelized MCP integration work

---

**Status:** On track ✅  
**Last Updated:** 2026-08-27  
**Recommendation for Team:** Increase deployment testing in final phase
```

### Update Frequency

- **Minimum:** Once daily (end of day)
- **Ideal:** After each significant accomplishment
- **Format:** Append new section for each day

### Metrics to Track

- Lines of code produced
- Tests written
- Test coverage
- Code review feedback
- Issues encountered and resolved
- Blockers and mitigation

---

## 🚀 Performance Guidelines

### Backend Performance Targets

```
API Response Time:
  - List incidents: <500ms
  - Get incident: <200ms
  - Start investigation: <1s
  - Approve action: <500ms

Database:
  - Query response: <100ms
  - Large queries: <1s
  - Concurrent users: 10+

Agent:
  - Investigation cycle: <5 seconds
  - Tool call latency: <2 seconds each
  - Subagent parallel time: <4 seconds
```

### Frontend Performance Targets

```
Page Load:
  - Initial load: <3 seconds
  - Interactive: <4 seconds
  - Lighthouse score: >90

Runtime:
  - Component render: <100ms
  - Timeline updates: real-time (<500ms latency)
  - API calls: <2 second total wait time
```

### Optimization Practices

**Backend:**
- Add database indexes for common queries
- Implement caching for MCP results
- Profile slow endpoints
- Use async operations

**Frontend:**
- Lazy load components
- Memoize expensive calculations
- Optimize image assets
- Use production builds

### Monitoring

```python
# Track metrics
from prometheus_client import Histogram, Counter

request_latency = Histogram(
    'request_latency_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

api_errors = Counter(
    'api_errors_total',
    'Total API errors',
    ['endpoint', 'error_type']
)
```

---

## 🔒 Security Practices

### Secret Management

**Never:**
- Commit secrets to repository
- Log sensitive data
- Send secrets in URLs
- Share credentials in chat

**Always:**
- Use environment variables
- Reference `.env.example` (without real values)
- Use `.gitignore` for `.env` files
- Rotate secrets regularly

**Example:**
```python
# ❌ WRONG
DATABASE_URL = "postgresql://user:password@host/db"

# ✅ CORRECT
import os
DATABASE_URL = os.getenv("DATABASE_URL")
# Run with: DATABASE_URL=... python app.py
```

### API Security

- Validate all inputs (Pydantic models)
- Sanitize outputs
- Use HTTPS in production
- Implement rate limiting
- Add CORS restrictions
- Use JWT tokens for auth

### Code Security

- No SQL injection (use parameterized queries)
- No XSS attacks (escape HTML)
- No CSRF attacks (implement CSRF tokens)
- Keep dependencies updated
- Regular security audits

### Data Protection

- Hash passwords (bcrypt)
- Encrypt sensitive data at rest
- Use TLS for transit
- PII redaction in logs
- Compliance with data regulations

---

## 💬 Communication & Escalation

### Daily Standups

**Schedule:** 8:00 AM IST (15 min)  
**Format:** 2 min per person

**Content:**
1. What I completed yesterday
2. What I'm working on today
3. Blockers/help needed

**Example:**
```
Tejas:
"Yesterday: Completed agent framework and GitHub MCP integration.
Today: Working on Grafana MCP and subagent setup.
Blocker: TrueForge API documentation has outdated examples."

Samar:
"Yesterday: 6 API endpoints and database schema.
Today: Investigation endpoints and API integration with Tejas's agent.
No blockers, on track."
```

### Async Communication

- **Slack:** Quick questions, updates, links
- **GitHub Issues:** Feature requests, bug reports
- **GitHub Discussions:** Design decisions, brainstorming
- **Email:** Formal notices only

### Escalation Path

**Issue Resolution Time Target:**
- **Blocker:** Resolve within 30 min (escalate immediately)
- **Major Issue:** Resolve within 2 hours
- **Minor Issue:** Resolve within 4 hours

**Escalation:**
1. Direct communication (Slack)
2. Pair programming session
3. Team discussion (standup)
4. Project lead decision (Tejas)

### Decisions Log

```markdown
# [Decision Title]

**Date:** 2026-08-23  
**Proposed by:** Samar  
**Reviewed by:** Tejas, Vighnesh

**Problem:**
Description of the problem being solved.

**Options Considered:**
1. Option A — Pros: X, Y | Cons: A, B
2. Option B — Pros: C, D | Cons: E, F

**Decision:**
Option A chosen because...

**Implementation:**
- Task 1
- Task 2

**Reasoning:**
Why this is the best choice.

**Alternatives:**
Can revisit if...
```

---

## ⚖️ Conflict Resolution

### Ground Rules

1. **Assume Good Intent** — Everyone is trying their best
2. **Focus on Ideas, Not People** — Critique code, not developers
3. **Data-Driven Decisions** — Use metrics, not opinions
4. **Respectful Disagreement** — It's OK to disagree professionally
5. **Escalate Appropriately** — Don't let conflicts fester

### Resolution Process

**Technical Disagreement:**
1. Present both sides with evidence
2. Create POC if necessary
3. Team votes/consensus
4. Tejas makes final decision if tied

**Personal Conflict:**
1. 1-on-1 discussion (no audience)
2. Listen to understand, not to respond
3. Find common ground
4. Agree on path forward
5. Escalate to Tejas if unresolved

### Feedback Culture

**Giving Feedback:**
- Be specific (not "this is bad", but "this function should handle X case")
- Be kind (compliment + critique + suggestion)
- Be timely (address issues soon)
- Be open (invite response)

**Receiving Feedback:**
- Listen without defending
- Ask clarifying questions
- Thank the person
- Implement feedback or explain why not

**Example:**
```
Good: "The timeline component looks great! The sorting is correct. 
       One suggestion: add loading skeleton while events load to reduce 
       layout shift. Happy to help if you want."

Bad: "The timeline is broken."
```

---

## ✅ Final Checklist

Before submitting code:

- [ ] Code follows style guide (linting passes)
- [ ] All tests passing (>80% coverage)
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] No secrets committed
- [ ] PR has clear description
- [ ] Related issues linked
- [ ] Ready for review

Before merging to main:

- [ ] At least 1 code review approval
- [ ] All tests passing
- [ ] CI/CD pipeline green
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] User documentation updated
- [ ] Changelog updated
- [ ] Version number updated

---

## 📚 Resources

- [PEP 8 (Python)](https://www.python.org/dev/peps/pep-0008/)
- [Black Formatter](https://black.readthedocs.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🎓 Training & Onboarding

### For New Developers (Mid-project)

1. Read this Code of Conduct
2. Review [DEVELOPER_TASKS.md](../DEVELOPER_TASKS.md)
3. Checkout develop branch
4. Run local dev environment
5. Read architecture docs
6. Pick up assigned task
7. Ask questions!

### Mentorship

- **Tejas** → Agent/Backend/DevOps questions
- **Samar** → Frontend/UI questions
- **Vighnesh** → Integration/Testing questions

---

## 📋 Code of Conduct Acknowledgment

**By submitting code to this project, you agree to:**

1. Follow all standards outlined in this document
2. Participate respectfully with team members
3. Write testable, documented, secure code
4. Attend standups and communicate blockers
5. Support the team's success over individual achievement
6. Escalate conflicts professionally

**Violations** may result in:
- Code review blockers
- Task reassignment
- Team discussion
- Project lead intervention

---

**Code of Conduct Version:** 1.0  
**Last Updated:** 2026-08-16  
**Hackathon:** August 22-27, 2026  
**Team:** Tejas, Samar, Vighnesh

**Signatures:**
- [ ] Tejas (Project & Backend & DevOps Lead)
- [ ] Samar (Frontend Lead)
- [ ] Vighnesh (Integration & QA Lead)

---

**Questions?** Raise in standup or Slack. We're here to support each other! 🚀
