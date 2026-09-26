---
description: Branch out for a step — from an up-to-date, fully-merged oleksandr-sorokin only. Does nothing else.
---

The human's message after this command is a branch suffix, e.g. `01-scaffold`.

Do exactly these checks and this action, then STOP — do not do any task, do not commit, do not push:

1. Run `git branch --show-current` (repo root, two levels up). It must print `oleksandr-sorokin`.
   If not, STOP: branches must fork from `oleksandr-sorokin`, not from another feature branch. Tell the
   human to switch back first (`git switch oleksandr-sorokin`) — do not run that for them if it might
   discard anything; check status first.
2. Run `git status --short`. The tree must be clean. If not, STOP and list what is uncommitted.
3. Run `git fetch origin`. Compare local `oleksandr-sorokin` to `origin/oleksandr-sorokin`
   (`git rev-list --left-right --count oleksandr-sorokin...origin/oleksandr-sorokin`):
   - If local is behind only → fast-forward: `git merge --ff-only origin/oleksandr-sorokin`.
   - If local is AHEAD (unpushed commits) → STOP and tell the human to push those first
     (`git push origin oleksandr-sorokin`) so nothing sits un-shared before a new branch forks from it.
   - If both sides have diverged → STOP and tell the human; do not merge or rebase it yourself.
4. Run `git branch --list 'feat/*' --no-merged oleksandr-sorokin`. If this lists any branch, STOP and
   report it: that step's PR is not merged into `oleksandr-sorokin` yet. Ask the human whether to
   continue anyway (they may be working two steps in parallel on purpose) or to merge that PR first —
   do not decide this yourself.
5. Only once 1–4 all pass: create and switch to `feat/<suffix>` from `oleksandr-sorokin`:
   `git switch -c feat/<suffix>`.
6. Report: "On feat/<suffix>, branched from oleksandr-sorokin at <short sha> (up to date with origin,
   no unmerged feat/* branches). Ready for the step prompt."

Nothing else. The human will give you the actual task in their next message.
