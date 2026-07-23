# Issue Lifecycle

This is the state model every issue moves through. It maps to the **Status**
field on the "Ecommerce Toolkit Development" Project.

## States

```
Inbox
  ↓
Specification   (Stage field; Status stays Inbox until ready)
  ↓
Ready
  ↓
In progress
  ↓
In review
  ↓
Testing
  ↓
Done
```

`Blocked` is a side state reachable from any active state.

## Status meanings

| Status | Meaning | Entry condition |
| --- | --- | --- |
| **Inbox** | An idea exists but is not ready to work. | Any newly created or auto-added issue. |
| **Ready** | Acceptance criteria and dependencies are clear; approved to start. | Owner applies `agent:ready` (or assigns it). |
| **In progress** | An agent or human is actively implementing. | Agent adds `agent:working` and starts a branch. |
| **In review** | A PR exists and is linked to the issue. | PR opened with `Closes #<n>`. |
| **Blocked** | Work cannot continue without a decision or dependency. | Agent adds `agent:blocked` and comments the exact blocker. |
| **Done** | Merged and verified. | PR merged / issue closed. |

`Testing` is used when a change is merged behind verification or needs manual/QA
checks before it is considered Done.

## Two distinct axes

Do not conflate them:

- **Status** — *where the work is in the pipeline* (Inbox … Done). This is what
  the board groups by.
- **Stage** — *what kind of work it currently is* (Discovery, Specification,
  Design, Development, Testing, Release). An issue can be `Status: Inbox` while
  `Stage: Specification`.

## The readiness boundary

The transition **Inbox → Ready** is the important human gate. An issue is Ready
only when it documents:

- **Problem** — the user or project problem being solved.
- **Desired outcome** — the observable result.
- **Acceptance criteria** — checkable conditions for completion.
- **Scope** — MVP / Post-MVP / Research.
- **Dependencies** — other issues or decisions it relies on.
- **Definition of done** — completion criteria (tests, docs, error states,
  mobile, accessibility, as relevant).

Only the **owner** moves an issue to Ready, by applying `agent:ready`. The
`issue-readiness` workflow rejects the label if these sections are missing.

## Automation that drives Status

Configured GitHub Project built-in workflows (see `github-project-setup.md`):

- Item added to the Project → **Inbox**
- Issue closed → **Done**
- PR merged → **Done**

Plus repository workflows:

- `.github/workflows/pr-project-status.yml` (optional) → PR opened moves the
  card to **In review**.

Manual moves (agent or owner) cover **Ready → In progress** and **→ Blocked**.
