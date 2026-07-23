# GitHub Project Setup

This repository uses a GitHub Project (v2) as the source of truth for work
tracking, with a coding agent operating under `agent-workflow.md`.

## What is automated vs. manual

The repository ships the machinery that lives in files:

- **Labels** — defined in `.github/labels.yml`, created/updated automatically by
  `.github/workflows/label-sync.yml` on push to the default branch (or via
  "Run workflow"). No manual label creation needed.
- **CI** — `.github/workflows/ci.yml`.
- **`agent:ready` validation** — `.github/workflows/issue-readiness.yml`.
- **PR → Project status (optional)** — `.github/workflows/pr-project-status.yml`.

**The GitHub Project itself cannot be created from this repository.** GitHub
Projects (v2) — the board, its custom fields, the iteration field, and its views
— are created through the GitHub UI or the `gh` CLI / GraphQL API. The Claude
Code environment here has **no `gh` CLI** and the available GitHub tools do not
expose Project (v2) creation, so the steps below must be done once by the owner.
None of them are skipped silently; each is written out exactly.

---

## 1. Create the Project

1. Go to `https://github.com/users/dzajenckauskas/projects` → **New project**.
2. Choose **Table** (or Board) → **Create**.
3. Name it exactly: **Ecommerce Toolkit Development**.

This is a **user-level** Project so it can span repositories later.

## 2. Create the fields

Delete the starter fields you don't want, then add these. For each single-select
field, add the options **in this order**.

| Field | Type | Options |
| --- | --- | --- |
| **Status** | Single select | Inbox, Ready, In progress, In review, Blocked, Done |
| **Stage** | Single select | Discovery, Specification, Design, Development, Testing, Release |
| **Priority** | Single select | P0, P1, P2, P3 |
| **Scope** | Single select | MVP, Post-MVP, Research |
| **Tool** | Single select | Optimizer, Cropper, Converter, Resizer, Platform |
| **Size** | Single select | XS, S, M, L, XL |
| **Target release** | Single select | MVP, Beta, Later |
| **Sprint** | Iteration | 1-week iterations (see below) |

> **Status** already exists as a default field — just edit its options to match.

### Sprint (iteration field)

1. Add field → **Iteration**.
2. Name it **Sprint**.
3. Set duration to **1 week**. Add a few iterations starting from the current
   week. GitHub auto-names them (Sprint 1, Sprint 2, …); rename if you prefer.

## 3. Create the views

Add these views (tabs). Where a view needs a filter, the filter string is given.

| View | Layout | Group by | Filter |
| --- | --- | --- | --- |
| **Board** | Board | Status | *(none)* |
| **Current sprint** | Table | Status | `sprint:@current` |
| **MVP backlog** | Table | Priority | `scope:MVP -status:Done` |
| **Research** | Table | Status | `scope:Research` |
| **Blocked** | Table | — | `status:Blocked` |
| **Recently completed** | Table | — | `status:Done` (sort by updated, desc) |

## 4. Built-in workflows (Project → Settings → Workflows)

Enable:

1. **Item added to project → set Status = Inbox.**
2. **Auto-add to project** — filter: `is:issue,pr repo:dzajenckauskas/toolkit`.
   - On GitHub Free the auto-add workflow is more limited; one broad repository
     rule like this is the safest choice. If you'd rather keep stray issues off
     the board, gate it with a label instead: `is:issue,pr label:"project"`.
3. **Issue closed → set Status = Done.**
4. **Pull request merged → set Status = Done.**
5. **Auto-archive items** — archive items with `status:Done` older than a period
   you choose (e.g. 2 weeks).

> "PR opened → In review" is not a built-in. It is handled by the optional
> `pr-project-status.yml` workflow (section 6), or you can move cards manually.

## 5. Labels (already automated — verify only)

After this branch merges, the **Label sync** workflow runs and creates every
label in `.github/labels.yml`. To run it immediately: **Actions → Label sync →
Run workflow**. Verify under **Issues → Labels**. Edit labels only by changing
`.github/labels.yml` (not the UI), so they stay reproducible.

## 6. Optional: enable PR → Project status automation

`pr-project-status.yml` moves a PR's card to **In review** on open and **Done**
on merge. Writing to a *user* Project needs a token the default `GITHUB_TOKEN`
cannot provide. To enable it:

1. Create a **fine-grained PAT** (or classic PAT) with the **`project`** scope
   (read/write) for your account.
2. Repo → **Settings → Secrets and variables → Actions**:
   - Add **secret** `PROJECTS_TOKEN` = the PAT.
   - Add **variable** `PROJECT_NUMBER` = the Project's number (in its URL, e.g.
     `/projects/1` → `1`).

Until both are set, the workflow no-ops (stays green). It never hardcodes field
or option IDs — it resolves them by name at runtime, so it keeps working if IDs
change.

## 7. Creating issues (once labels + Project exist)

There is currently **no `tasks/backlog/` directory**, so there are no backlog
files to convert into issues yet. When a backlog or approved sprint scope
exists, an agent may create issues per `agent-workflow.md`:

- Apply `type:*`, `area:*`, `priority:*` labels from `.github/labels.yml`.
- The auto-add workflow places new issues on the board at **Inbox**.
- Set Project fields (Status, Stage, Priority, Scope, Tool, Size, Sprint,
  Target release) on each item.
- Do **not** apply `agent:ready` until acceptance criteria and dependencies are
  complete — that is the owner's gate.

Suggested first items to open when ready:

- **Epic: Image Optimizer MVP** — tracking issue linking Sprint 001 and later
  MVP work, with the specs/ADRs referenced and the definition of done.
- Issues derived from `docs/sprints/sprint-001-foundation.md` and the Phase 1
  items in `ROADMAP.md`.

## Environment note

This setup was prepared in a Claude Code environment **without the `gh` CLI**
and without Project (v2) write access. Everything file-based is done and pushed;
sections 1–4 (and optionally 6) are the manual steps that remain.
