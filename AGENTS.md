# AI Agent Instructions

This repository is the source of truth for the Ecommerce Toolkit project.

These instructions apply to ChatGPT, Codex, Claude Code, Gemini, GitHub Copilot, and other agents working in the repository.

## Before doing work

Read, in order:

1. `README.md`
2. `ROADMAP.md`
3. `docs/product/vision.md`
4. `docs/product/mvp-scope.md`
5. Relevant files in `docs/decisions/`
6. Relevant tool or UX specifications

Do not rely on chat history when repository documentation answers the question.

## Product rules

- Build standalone tools first.
- Do not require users to create a project for one-off tasks.
- Optimize for a fast path from upload to output.
- Keep advanced controls available but out of the basic path.
- Prefer privacy-preserving local processing when it is technically sensible.
- Do not introduce accounts, billing, backend storage, or AI dependencies into the MVP without a documented decision.
- Reuse shared foundations only after a concrete second use case exists.
- Avoid speculative abstraction.

## Scope discipline

Before implementing a feature, identify whether it is:

- MVP
- Post-MVP
- Research
- Explicitly out of scope

If the answer is unclear, update the relevant specification or create an ADR before implementation.

## Documentation duties

When changing behavior:

- Update the relevant specification.
- Update `ROADMAP.md` if milestone scope changes.
- Update `CHANGELOG.md` for meaningful changes.
- Create or update an ADR when a durable decision is made.

Do not create duplicate documents with overlapping authority.

## Development workflow

1. Start from a GitHub Issue.
2. Confirm acceptance criteria.
3. Keep the change focused.
4. Add or update tests.
5. Update documentation.
6. Open a pull request referencing the issue.
7. Summarize tradeoffs and remaining risks.

## Agent operating loop (issue-driven)

GitHub is the source of truth for work. A coding agent operates under a strict,
label-gated loop defined in
[`docs/project-management/agent-workflow.md`](docs/project-management/agent-workflow.md).
The essentials:

- **Only start an open issue that carries the `agent:ready` label.** That label
  is the owner's explicit permission and is the single gate. Never implement an
  issue without it unless the owner directly instructs otherwise.
- On start: apply `agent:working`, move the item to **In progress**, branch.
- One focused branch and one PR per issue; the PR body includes `Closes #<n>`.
- On PR open: move to **In review**, apply `agent:review-needed`.
- **Never merge your own PR** without explicit instruction.
- Out-of-scope discoveries become **new Inbox issues** — never `agent:ready`
  automatically, never folded into the current PR.
- If blocked, apply `agent:blocked`, move to **Blocked**, and comment the exact
  decision or dependency needed.

Owner-approval-required actions (scope expansion, new dependencies/infra,
accounts, billing, backend uploads, AI providers, databases, reprioritizing
P0/P1, deleting issues, rewriting accepted ADRs) are listed in that document.
The state model is in
[`docs/project-management/issue-lifecycle.md`](docs/project-management/issue-lifecycle.md)
and board/automation setup in
[`docs/project-management/github-project-setup.md`](docs/project-management/github-project-setup.md).

## Preferred issue states

`Discovery → Specification → Design → Development → Testing → Release`

## Decision authority

The project owner makes product and business decisions. Agents may recommend a default, explain tradeoffs, and proceed with the smallest reversible option when instructed.

## Writing style

Use direct, practical language. Avoid inflated product language and vague claims.

## Definition of done

A task is done when:

- Acceptance criteria are met
- Error states are handled
- Relevant tests pass
- Mobile behavior has been considered
- Accessibility has been considered
- Documentation is current
- No unrelated scope was added
