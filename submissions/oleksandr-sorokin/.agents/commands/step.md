---
description: Start a step branch from an up-to-date, fully-merged oleksandr-sorokin, do the described work, commit with an explanation the PR will show.
---

The human's message after this command is: `<branch-suffix> — <task description>`.
Example: `/step 06-etf-data implement the EtfRepository and the seed generator per openspec/changes/01-etf-data/`

Do exactly these steps, in order, and stop immediately (report why) if any check fails:

1. Run `git branch --show-current` (from the repo root, two levels up). It must print `oleksandr-sorokin`.
   If it does not, STOP and tell the human: a step branch must fork from `oleksandr-sorokin`, not from
   another feature branch. Do not create a branch on top of a branch.
2. Run `git status --short`. The tree must be clean (no output). If not, STOP and tell the human what is
   uncommitted — do not stash or discard anything yourself.
3. Run `git fetch origin`. Compare local `oleksandr-sorokin` to `origin/oleksandr-sorokin`
   (`git rev-list --left-right --count oleksandr-sorokin...origin/oleksandr-sorokin`):
   - behind only → fast-forward: `git merge --ff-only origin/oleksandr-sorokin`.
   - ahead (unpushed commits) → STOP, tell the human to `git push origin oleksandr-sorokin` first.
   - diverged → STOP, tell the human; do not merge or rebase it yourself.
4. Run `git branch --list 'feat/*' --no-merged oleksandr-sorokin`. If it lists anything, STOP and report
   it — that step's PR is not merged yet. Ask the human whether to continue anyway or merge it first;
   do not decide this yourself.
5. Only once 1–4 pass: create and switch to `feat/<branch-suffix>` from `oleksandr-sorokin`:
   `git switch -c feat/<branch-suffix>`.
6. Do the task exactly as described. Follow this project's AGENTS.md — scope rule, trust levels,
   Definition of Done. If the task is ambiguous, ask before writing code, not after.
7. Run `pnpm check` (and `pnpm verify` if the task touched app behaviour, not just docs/config).
   If it is red, do not commit — fix it first or report back what is blocking you.
8. Commit ONE commit (use `git commit --amend` while iterating, don't leave a pile of WIP commits) with:
   - a Conventional Commits summary line (`feat:`, `test:`, `spec:`, `fix:`, `docs:`, `chore:`, `review:`);
   - a body of 3-6 lines: what changed, and why — this becomes the PR description when the human runs
     `gh pr create --fill`, so write it for a reviewer who has not seen this conversation;
   - end the body with two lines, filled honestly (not "all went smoothly" if it did not):
     ```
     Agent did: <one line>
     Human decided: <leave this line for the human to edit before they push>
     ```
9. Do NOT push and do NOT open a PR. Stop here, show `git log -1 --stat`, and tell the human the branch
   name so they can review the diff, edit the "Human decided" line, and push themselves.
