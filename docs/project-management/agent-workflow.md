# Agent Operating Workflow

This document defines how a coding agent (Claude Code, Codex, Gemini, Copilot,
etc.) is permitted to work in this repository. It is authoritative. AGENTS.md
references it, and the `agent:ready` label is the single explicit gate.

The goal is a controlled, semi-autonomous system: the agent performs approved
work, but the project owner remains the gatekeeper through the `agent:ready`
label and pull-request review. The agent must never create a self-reinforcing
loop where it invents work, approves it, implements it, and marks it complete
without human oversight.

## The core rule

**An agent may start implementation work only on an open issue that carries the
`agent:ready` label.** Nothing else authorizes it to begin. If asked to "work on
the next thing" with no `agent:ready` issue available, the agent stops and asks.

## Operating rules

1. An agent may start work only on an **open issue carrying `agent:ready`**.
2. When starting, the agent applies **`agent:working`** and moves the item to
   **In progress** on the Project board.
3. The agent creates **one branch and one focused PR per issue**, unless a
   documented reason to combine them exists.
4. The PR body must contain **`Closes #<issue-number>`** so the issue closes on
   merge.
5. The agent must **update tests and documentation** as part of the same change.
6. When the PR opens, the item moves to **In review**.
7. The agent applies **`agent:review-needed`**.
8. The agent must **not merge its own PR** unless explicitly instructed by the
   owner.
9. Newly discovered work outside the current scope becomes a **separate issue in
   Inbox** — never folded into the current PR.
10. Newly created follow-up issues must **not** receive `agent:ready`
    automatically. Readiness is an owner decision.
11. The following require **owner approval** and must never be done autonomously:
    product-direction changes, MVP-scope expansion, large dependencies or
    infrastructure, security-affecting changes, billing, user accounts, cloud
    image uploads, AI providers, and databases.
12. **Blocked** work receives **`agent:blocked`**, moves to **Blocked**, and
    gets a comment stating the exact decision or dependency required to proceed.
13. After merge, **CI must pass** and the linked issue should **close
    automatically** via the `Closes #` reference.
14. The agent must **not delete, close as "not planned", or reprioritize**
    existing issues without owner approval.

## What the agent may do without asking

- Read repository documentation.
- Convert **approved** sprint documents into GitHub issues.
- Add missing acceptance criteria to issues it is clarifying.
- Link related issues and dependencies.
- Add labels and set Project fields.
- Assign itself **only after** an issue has `agent:ready`.
- Create a feature branch and implement the `agent:ready` issue.
- Update documentation and tests.
- Open a **draft** PR and link it with `Closes #`.
- Create follow-up issues for out-of-scope discoveries, marked **Inbox** (never
  `agent:ready`).
- Comment with test results and implementation notes.
- Move its current issue through the workflow states.

## What always requires owner approval

- Changing product direction.
- Expanding MVP scope.
- Closing unresolved product questions.
- Deleting issues.
- Reprioritizing P0 or P1 items.
- Merging its own PR.
- Starting an issue without `agent:ready`.
- Adding major dependencies or infrastructure.
- Introducing accounts, billing, backend uploads, AI providers, or databases.
- Rewriting an accepted ADR without clearly proposing the change first.

## Label semantics the agent maintains

| Label | Meaning | Who sets it |
| --- | --- | --- |
| `agent:ready` | Approved for an agent to start | **Owner only** |
| `agent:working` | An agent is actively implementing | Agent, on start |
| `agent:review-needed` | A PR exists and needs review | Agent, on PR open |
| `agent:blocked` | Cannot continue without a decision/dependency | Agent, when blocked |

The `agent:ready` label is validated by `.github/workflows/issue-readiness.yml`:
if an issue lacking the required sections is marked `agent:ready`, the label is
removed, `needs:decision` is applied, and a comment lists what is missing.

## Per-issue sequence (happy path)

```
pick agent:ready issue
  -> add agent:working, move to In progress, create branch
  -> implement + tests + docs
  -> open draft PR with "Closes #<n>", move to In review, add agent:review-needed
  -> owner reviews and merges
  -> issue closes automatically, item moves to Done, CI green
```

See `issue-lifecycle.md` for the full state model and `github-project-setup.md`
for the board and automation configuration.
